import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import QualityComplaint from '@/models/QualityComplaint';
import SellerPerformance from '@/models/SellerPerformance';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const userId = searchParams.get('userId');
    
    const query: any = {};
    if (sellerId) query.sellerId = sellerId;
    if (userId) query.userId = userId;
    
    const complaints = await QualityComplaint.find(query)
      .populate('orderId', 'items totalAmount')
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ complaints });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const complaint = await QualityComplaint.create(body);
    
    // Check seller complaint history for auto-penalty
    const sellerComplaints = await QualityComplaint.countDocuments({ 
      sellerId: body.sellerId, 
      status: { $in: ['resolved', 'investigating'] } 
    });
    
    let penalty = 0;
    if (sellerComplaints === 1) penalty = 0; // Warning
    else if (sellerComplaints === 2) penalty = 500;
    else if (sellerComplaints === 3) penalty = 1000;
    else if (sellerComplaints >= 4) {
      // Suspend seller
      await SellerPerformance.findOneAndUpdate(
        { sellerId: body.sellerId },
        { isSuspended: true, suspensionReason: 'Multiple quality complaints' }
      );
      penalty = 2000;
    }
    
    if (penalty > 0) {
      complaint.penaltyApplied = true;
      complaint.penaltyAmount = penalty;
      complaint.penaltyReason = `Complaint #${sellerComplaints + 1}`;
      await complaint.save();
    }
    
    return NextResponse.json({ success: true, complaint, penalty });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { complaintId, status, resolution, refundAmount, adminNotes } = await req.json();
    
    const complaint = await QualityComplaint.findById(complaintId);
    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    
    complaint.status = status || complaint.status;
    complaint.resolution = resolution || complaint.resolution;
    complaint.adminNotes = adminNotes || complaint.adminNotes;
    
    if (refundAmount) {
      complaint.refundAmount = refundAmount;
      complaint.refundStatus = 'processed';
      
      // Update order
      await Order.findByIdAndUpdate(complaint.orderId, {
        $inc: { totalAmount: -refundAmount }
      });
    }
    
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }
    
    await complaint.save();
    
    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
