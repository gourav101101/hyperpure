import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
