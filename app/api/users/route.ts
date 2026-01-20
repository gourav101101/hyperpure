import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();
  const user = await User.findOneAndUpdate(
    { phoneNumber: data.phoneNumber },
    data,
    { upsert: true, new: true }
  );
  return NextResponse.json(user);
}
