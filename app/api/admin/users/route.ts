import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  
  const enrichedUsers = await Promise.all(users.map(async (user) => {
    const orders = await Order.find({ userId: user._id }).lean();
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;
    
    return {
      ...user,
      totalSpent,
      lastOrderDate: lastOrder?.createdAt,
      cartItemsCount: user.cart?.length || 0,
      wishlistCount: user.wishlist?.length || 0
    };
  }));
  
  return NextResponse.json(enrichedUsers);
}