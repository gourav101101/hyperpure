import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payout from '@/models/Payout';
import Order from '@/models/Order';
import Seller from '@/models/Seller';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    // Get seller bank details
    const seller = await Seller.findById(sellerId).select('bankDetails').lean();
    
    const payouts = await Payout.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Get current week pending payout
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const pendingOrders = await Order.find({
      'items.sellerId': sellerId,
      status: 'delivered',
      payoutStatus: 'pending',
      actualDeliveryTime: { $gte: weekStart }
    }).lean();
    
    let pendingAmount = 0;
    pendingOrders.forEach((order: any) => {
      const sellerItems = order.items.filter((item: any) => item.sellerId?.toString() === sellerId);
      pendingAmount += sellerItems.reduce((sum: number, item: any) => 
        sum + (item.sellerPrice || item.price) * item.quantity, 0
      );
    });
    
    // Calculate summary
    const totalEarnings = payouts.reduce((sum, p: any) => sum + (p.netPayout || 0), 0);
    const now = new Date();
    const thisMonthEarnings = payouts
      .filter((p: any) => {
        const date = new Date(p.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p: any) => sum + (p.netPayout || 0), 0);
    
    return NextResponse.json({ 
      payouts, 
      pendingPayout: {
        amount: pendingAmount,
        orders: pendingOrders.length,
        weekStart
      },
      summary: {
        pendingAmount,
        totalEarnings,
        thisMonthEarnings,
        totalPayouts: payouts.length,
        bankDetails: seller?.bankDetails || null
      }
    });
  } catch (error) {
    console.error('Payouts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}
