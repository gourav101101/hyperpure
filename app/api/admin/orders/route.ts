import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Seller from '@/models/Seller';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    
    const sellerIds = new Set<string>();
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.sellerId) sellerIds.add(item.sellerId.toString());
      });
    });
    
    const sellers = await Seller.find({ _id: { $in: Array.from(sellerIds) } })
      .select('_id name businessName phone email')
      .lean();
    const sellerMap = new Map(sellers.map((s: any) => [s._id.toString(), s]));
    
    const ordersWithSellers = orders.map((order: any) => ({
      ...order,
      items: order.items?.map((item: any) => ({
        ...item,
        sellerDetails: item.sellerId ? sellerMap.get(item.sellerId.toString()) : null
      }))
    }));
    
    return NextResponse.json({ orders: ordersWithSellers });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
