import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, startDate, endDate } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await Order.find({
      userId: user._id,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ createdAt: -1 });

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending statement to ${email} for ${orders.length} orders`);

    return NextResponse.json({ 
      success: true, 
      message: 'Statement sent to email',
      ordersCount: orders.length 
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
