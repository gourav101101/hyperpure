import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (id) {
    const order = await Order.findById(id).populate('items.productId');
    return NextResponse.json(order);
  }

  if (userId) {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  }

  const orders = await Order.find().sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const order = await Order.create(data);
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const { id, ...data } = await req.json();
  const order = await Order.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Order.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
