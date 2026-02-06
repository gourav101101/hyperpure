import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeliverySlot from '@/models/DeliverySlot';

export async function GET() {
  try {
    await connectDB();
    
    // Get all active slots (they are now recurring, not date-specific)
    const slots = await DeliverySlot.find({ 
      active: true, 
      archived: { $ne: true }
    }).sort({ priority: -1, slotType: 1 });
    
    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch slots', slots: [] }, { status: 500 });
  }
}
