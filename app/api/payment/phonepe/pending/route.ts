import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const orderData = await req.json();
    
    const order = await Order.create({
      ...orderData,
      status: 'pending_payment',
      paymentStatus: 'pending'
    });

    return NextResponse.json({ orderId: order._id.toString() });
  } catch (error) {
    console.error('Pending order error:', error);
    return NextResponse.json({ error: 'Failed to create pending order' }, { status: 500 });
  }
}
