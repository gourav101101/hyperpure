import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
      const product = await Product.findById(id);
      return NextResponse.json(product);
    } catch (err) {
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
  }
  
  const products = await Product.find({});
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const product = await Product.create(data);
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, ...data } = await req.json();
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
