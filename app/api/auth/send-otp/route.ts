import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phoneNumber } = await req.json();

    if (!phoneNumber || phoneNumber.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    console.log(`\n🔐 OTP for +91${phoneNumber}: ${otp}\n`);

    await User.findOneAndUpdate(
      { phoneNumber },
      { phoneNumber, otp, otpExpiresAt: expiresAt, lastLogin: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'OTP sent successfully', otp });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
