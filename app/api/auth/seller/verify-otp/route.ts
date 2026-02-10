import { NextRequest, NextResponse } from 'next/server';
import { sellerOtpStore } from '../send-otp/route';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { phoneNumber, otp, role } = await req.json();

    if (role !== 'seller') {
      return NextResponse.json({ error: 'Invalid access' }, { status: 403 });
    }

    const stored = sellerOtpStore.get(phoneNumber);
    if (!stored) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new OTP.' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      sellerOtpStore.delete(phoneNumber);
      return NextResponse.json({ error: 'OTP has expired. Please request a new OTP.' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });
    }

    sellerOtpStore.delete(phoneNumber);
    
    let seller = await Seller.findOne({ phone: phoneNumber });
    if (!seller) {
      return NextResponse.json({ 
        error: 'Phone number not registered as seller. Please register first.' 
      }, { status: 404 });
    }
    
    if (seller.status !== 'approved') {
      const statusMessages = {
        pending: 'Your seller account is pending approval. Please wait for admin verification.',
        rejected: `Your seller account has been suspended/rejected. ${seller.rejectionReason ? 'Reason: ' + seller.rejectionReason : 'Contact support for details.'}`,
        suspended: 'Your seller account has been suspended. Please contact support for assistance.'
      };
      return NextResponse.json({ 
        error: statusMessages[seller.status as keyof typeof statusMessages] || 'Account access denied. Contact support.',
        status: seller.status,
        rejectionReason: seller.rejectionReason
      }, { status: 403 });
    }
    
    seller.lastLogin = new Date();
    await seller.save();
    
    return NextResponse.json({ 
      success: true, 
      seller: {
        id: seller._id,
        name: seller.name,
        phone: seller.phone,
        email: seller.email
      },
      message: 'Login successful! Welcome to Seller Dashboard'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}