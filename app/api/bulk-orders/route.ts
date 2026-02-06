import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BulkOrder from '@/models/BulkOrder';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');
    
    const query: any = {};
    if (businessId) query.businessId = businessId;
    if (status) query.status = status;
    
    const orders = await BulkOrder.find(query)
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bulk orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const totalAmount = body.items.reduce((sum: number, item: any) => 
      sum + (item.requestedPrice || 0) * item.quantity, 0
    );
    
    const finalAmount = totalAmount * (1 - (body.discountPercent || 0) / 100);
    
    const bulkOrder = await BulkOrder.create({
      ...body,
      totalAmount,
      finalAmount,
      status: 'pending'
    });
    
    return NextResponse.json({ success: true, bulkOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bulk order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, status, negotiatedPrices, adminNotes, assignedTo } = await req.json();
    
    const bulkOrder = await BulkOrder.findById(id);
    if (!bulkOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    if (status) bulkOrder.status = status;
    if (adminNotes) bulkOrder.adminNotes = adminNotes;
    if (assignedTo) bulkOrder.assignedTo = assignedTo;
    
    if (negotiatedPrices) {
      bulkOrder.items.forEach((item: any, idx: number) => {
        if (negotiatedPrices[idx]) {
          item.negotiatedPrice = negotiatedPrices[idx];
        }
      });
      
      const newTotal = bulkOrder.items.reduce((sum: number, item: any) => 
        sum + (item.negotiatedPrice || item.requestedPrice) * item.quantity, 0
      );
      bulkOrder.finalAmount = newTotal * (1 - bulkOrder.discountPercent / 100);
    }
    
    if (status === 'quoted') {
      bulkOrder.quotedAt = new Date();
      bulkOrder.quoteValidTill = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
    
    await bulkOrder.save();
    
    return NextResponse.json({ success: true, bulkOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bulk order' }, { status: 500 });
  }
}
