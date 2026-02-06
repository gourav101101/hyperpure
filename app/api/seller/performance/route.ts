import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SellerPerformance from '@/models/SellerPerformance';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    let performance = await SellerPerformance.findOne({ sellerId });
    
    if (!performance) {
      performance = await SellerPerformance.create({
        sellerId,
        tier: 'new'
      });
    }
    
    return NextResponse.json(performance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 });
  }
}
