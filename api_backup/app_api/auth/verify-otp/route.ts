import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '../send-otp/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phoneNumber, otp } = await req.json();

    const stored = otpStore.get(phoneNumber);
    if (!stored) {
      return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phoneNumber);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    otpStore.delete(phoneNumber);
    
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({ phoneNumber });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
