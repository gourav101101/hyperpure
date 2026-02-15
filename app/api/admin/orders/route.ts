import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Seller from '@/models/Seller';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    
    // Get all unique seller IDs
    const sellerIds = new Set<string>();
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.sellerId) sellerIds.add(item.sellerId.toString());
      });
    });
    
    // Fetch seller details
    const sellers = await Seller.find({ _id: { $in: Array.from(sellerIds) } }).lean();
    const sellerMap = new Map(sellers.map((s: any) => [s._id.toString(), s]));
    
    // Add seller details to orders
    const ordersWithSellers = orders.map((order: any) => ({
      ...order,
      items: order.items?.map((item: any) => ({
        ...item,
        sellerDetails: item.sellerId ? sellerMap.get(item.sellerId.toString()) : null
      }))
    }));
    
    return NextResponse.json({ orders: ordersWithSellers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
