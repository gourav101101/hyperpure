import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  await dbConnect();
  const categories = await Category.find({}).sort({ order: 1 });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const category = await Category.create(data);
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, ...data } = await req.json();
  const category = await Category.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
