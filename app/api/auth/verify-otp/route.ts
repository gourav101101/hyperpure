import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phoneNumber, otp } = await req.json();

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
    }

    if (new Date() > user.otpExpiresAt) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.lastLogin = new Date();
    await user.save();
    
    return NextResponse.json({ success: true, userId: user._id.toString(), userPhone: user.phoneNumber });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
