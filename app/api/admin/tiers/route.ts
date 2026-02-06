import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TierCommission from '@/models/TierCommission';

export async function GET() {
  try {
    await dbConnect();
    const tiers = await TierCommission.find().sort({ minOrders: 1 }).lean();
    
    if (tiers.length === 0) {
      const defaultTiers = [
        { tier: 'new', commissionRate: 15, minOrders: 0, minRevenue: 0, benefits: ['Basic support', 'Standard listing'] },
        { tier: 'standard', commissionRate: 10, minOrders: 50, minRevenue: 50000, benefits: ['Priority support', 'Featured listing', 'Analytics'] },
        { tier: 'premium', commissionRate: 5, minOrders: 200, minRevenue: 200000, benefits: ['Dedicated manager', 'Top placement', 'Advanced analytics', 'Marketing support'] }
      ];
      
      await TierCommission.insertMany(defaultTiers);
      return NextResponse.json({ tiers: defaultTiers });
    }
    
    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Tier fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { tier, commissionRate, minOrders, minRevenue, benefits } = await req.json();
    
    const updated = await TierCommission.findOneAndUpdate(
      { tier },
      { commissionRate, minOrders, minRevenue, benefits },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ success: true, tier: updated });
  } catch (error) {
    console.error('Tier update error:', error);
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
  }
}
