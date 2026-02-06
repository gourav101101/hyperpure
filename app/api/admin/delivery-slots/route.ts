import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeliverySlot from '@/models/DeliverySlot';

export async function GET() {
  try {
    await connectDB();
    const slots = await DeliverySlot.find({ archived: { $ne: true } }).sort({ deliveryDate: 1 });
    return NextResponse.json(slots);
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Ensure deliveryDate is a Date object
    if (body.deliveryDate && typeof body.deliveryDate === 'string') {
      body.deliveryDate = new Date(body.deliveryDate);
    }
    
    const slot = await DeliverySlot.create(body);
    return NextResponse.json({ success: true, slot });
  } catch (error: any) {
    console.error('Create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const slot = await DeliverySlot.findByIdAndUpdate(body.id, body, { new: true });
    return NextResponse.json({ success: true, slot });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await DeliverySlot.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
