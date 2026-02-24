import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Seller from '@/models/Seller';

// Global FCM tokens collection for guest users
const GuestTokenSchema = new (require('mongoose')).Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // 30 days
});

const GuestToken = require('mongoose').models.GuestToken || require('mongoose').model('GuestToken', GuestTokenSchema);

export async function POST(req: NextRequest) {
  try {
    const { token, userId, phoneNumber, email, userType } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectDB();

    let query: Record<string, string> | null = null;
    const isSeller = userType === 'seller';

    if (userId) {
      query = { _id: userId };
    } else if (phoneNumber) {
      query = isSeller ? { phone: phoneNumber } : { phoneNumber };
    } else if (email) {
      query = { email };
    }

    if (query) {
      // Register token for specific user/seller
      const Model = isSeller ? Seller : User;
      const updatedUser = await Model.findOneAndUpdate(
        query,
        { $addToSet: { fcmTokens: token } },
        { new: true }
      );

      if (updatedUser) {
        return NextResponse.json({ success: true, message: 'Token registered for user' });
      }
    }

    // If no specific user found, store as guest token
    await GuestToken.findOneAndUpdate(
      { token },
      { token },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Token registered as guest' });
  } catch (error) {
    console.error('Token registration error:', error);
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}
