import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { phoneNumber, role } = await req.json();

    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    if (role !== 'seller') {
      return NextResponse.json({ error: 'Invalid access' }, { status: 403 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phoneNumber, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    console.log(`\n🔐 SELLER OTP for +91${phoneNumber}: ${otp}\n`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully to your mobile number',
      otp: otp
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

export { otpStore as sellerOtpStore };