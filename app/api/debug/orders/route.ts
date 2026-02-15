import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const latestOrder = await Order.findOne().sort({ createdAt: -1 }).lean();
    
    if (!latestOrder) {
      return NextResponse.json({ error: 'No orders found' });
    }

    const itemsDebug = latestOrder.items?.map((item: any) => ({
      name: item.name,
      sellerId: item.sellerId,
      sellerIdType: typeof item.sellerId,
      sellerIdString: item.sellerId?.toString(),
      hasSellerProductId: !!item.sellerProductId
    }));

    return NextResponse.json({
      orderId: latestOrder._id,
      createdAt: latestOrder.createdAt,
      itemsCount: latestOrder.items?.length,
      itemsDebug,
      assignedSellers: latestOrder.assignedSellers,
      rawItems: latestOrder.items
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
