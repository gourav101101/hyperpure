import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function GET() {
  try {
    await dbConnect();
    const sellers = await Seller.find({}).sort({ createdAt: -1 });
    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Sellers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, action, reason, adminName } = await req.json();
    
    const updateData: any = {
      verifiedBy: adminName,
      verifiedAt: new Date()
    };
    
    if (action === 'approve') {
      updateData.status = 'approved';
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.rejectionReason = reason;
    }
    
    const seller = await Seller.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(seller);
  } catch (error) {
    console.error('Seller update error:', error);
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 });
  }
}