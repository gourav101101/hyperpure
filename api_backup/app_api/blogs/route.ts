import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (id) {
    const blog = await Blog.findById(id);
    return NextResponse.json(blog);
  }
  
  const blogs = await Blog.find({});
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const blog = await Blog.create(data);
  return NextResponse.json(blog);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, ...data } = await req.json();
  const blog = await Blog.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(blog);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Blog.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
