import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Seller from '@/models/Seller';

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
    } else {
      return NextResponse.json(
        { error: 'userId, phoneNumber or email is required to register token' },
        { status: 400 }
      );
    }

    const Model = isSeller ? Seller : User;
    const updatedUser = await Model.findOneAndUpdate(
      query,
      { $addToSet: { fcmTokens: token } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}
