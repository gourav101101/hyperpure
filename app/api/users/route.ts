import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const user = await User.findOneAndUpdate(
      { phoneNumber: data.phoneNumber },
      data,
      { upsert: true, new: true }
    );
    return NextResponse.json(user);
  } catch (error) {
    console.error('User create/update error:', error);
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
  }
}