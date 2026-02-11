import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Location from '../../../models/Location';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const locations = await Location.find({ active: true }).sort({ city: 1 });
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error('Locations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const location = await Location.create(data);
  return NextResponse.json(location);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const { id, ...data } = await req.json();
  const location = await Location.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(location);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Location.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}