import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoyaltyProgram from '@/models/LoyaltyProgram';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    let loyalty = await LoyaltyProgram.findOne({ userId });
    
    if (!loyalty) {
      const referralCode = `HP${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      loyalty = await LoyaltyProgram.create({ userId, referralCode });
    }
    
    loyalty.calculateTier();
    await loyalty.save();
    
    return NextResponse.json(loyalty);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, action, amount, referralCode } = await req.json();
    
    let loyalty = await LoyaltyProgram.findOne({ userId });
    if (!loyalty) {
      const code = `HP${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      loyalty = await LoyaltyProgram.create({ userId, referralCode: code });
    }
    
    // Handle different actions
    if (action === 'order_placed') {
      const points = Math.floor(amount * 0.01); // 1% cashback as points
      loyalty.totalPoints += points;
      loyalty.availablePoints += points;
      loyalty.totalOrders += 1;
      loyalty.totalSpent += amount;
    }
    
    if (action === 'redeem_points' && amount <= loyalty.availablePoints) {
      loyalty.availablePoints -= amount;
      loyalty.redeemedPoints += amount;
    }
    
    if (action === 'apply_referral' && referralCode) {
      const referrer = await LoyaltyProgram.findOne({ referralCode });
      if (referrer) {
        loyalty.referredBy = referrer.userId;
        referrer.referrals.push(userId);
        referrer.totalPoints += 100; // Referral bonus
        referrer.availablePoints += 100;
        await referrer.save();
        
        loyalty.totalPoints += 50; // New user bonus
        loyalty.availablePoints += 50;
      }
    }
    
    loyalty.calculateTier();
    await loyalty.save();
    
    return NextResponse.json({ success: true, loyalty });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update loyalty' }, { status: 500 });
  }
}
