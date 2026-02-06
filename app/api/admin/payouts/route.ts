import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payout from '@/models/Payout';
import Order from '@/models/Order';
import Seller from '@/models/Seller';
import Commission from '@/models/Commission';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');
    
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (sellerId) query.sellerId = sellerId;
    
    const payouts = await Payout.find(query)
      .populate('sellerId', 'businessName email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Payouts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { action, weekStart, weekEnd } = await req.json();
    
    if (action === 'generate') {
      const start = weekStart ? new Date(weekStart) : getLastWeekStart();
      const end = weekEnd ? new Date(weekEnd) : getLastWeekEnd();
      
      const sellers = await Seller.find({ status: 'approved' }).lean();
      const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
      const generatedPayouts = [];
      
      for (const seller of sellers) {
        const orders = await Order.find({
          'items.sellerId': seller._id,
          status: 'delivered',
          actualDeliveryTime: { $gte: start, $lte: end },
          payoutStatus: 'pending',
          $or: [
            { payoutHoldUntil: { $exists: false } },
            { payoutHoldUntil: { $lte: new Date() } }
          ]
        }).lean();
        
        if (orders.length === 0) continue;
        
        let grossRevenue = 0;
        let platformCommission = 0;
        const orderIds: any[] = [];
        
        orders.forEach((order: any) => {
          const sellerItems = order.items.filter((item: any) => 
            item.sellerId?.toString() === seller._id.toString()
          );
          
          sellerItems.forEach((item: any) => {
            const itemTotal = (item.sellerPrice || item.price) * item.quantity;
            grossRevenue += itemTotal;
            platformCommission += item.commissionAmount || (itemTotal * (commission.commissionRate / 100));
          });
          
          orderIds.push(order._id);
        });
        
        const payout = await Payout.create({
          sellerId: seller._id,
          periodStart: start,
          periodEnd: end,
          weekNumber: getWeekNumber(start),
          orderIds,
          totalOrders: orders.length,
          grossRevenue,
          platformCommission,
          netPayout: grossRevenue - platformCommission,
          status: 'pending'
        });
        
        await Order.updateMany(
          { _id: { $in: orderIds } },
          { payoutStatus: 'on_hold' }
        );
        
        await Notification.create({
          userId: seller._id,
          userType: 'seller',
          type: 'payout_generated',
          title: 'Payout Generated',
          message: `Your payout of ₹${(grossRevenue - platformCommission).toFixed(0)} is being processed`,
          actionUrl: '/seller/payouts',
          priority: 'high'
        });
        
        generatedPayouts.push(payout);
      }
      
      return NextResponse.json({ 
        success: true, 
        count: generatedPayouts.length,
        payouts: generatedPayouts 
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Payout generation error:', error);
    return NextResponse.json({ error: 'Failed to generate payouts' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { payoutId, status, transactionId, notes, adjustments } = await req.json();
    
    const payout = await Payout.findById(payoutId);
    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }
    
    if (adjustments !== undefined) {
      payout.adjustments = adjustments;
      payout.netPayout = payout.grossRevenue - payout.platformCommission + adjustments;
    }
    
    if (status) {
      payout.status = status;
      if (status === 'completed') {
        payout.paidAt = new Date();
        payout.transactionId = transactionId;
        
        await Order.updateMany(
          { _id: { $in: payout.orderIds } },
          { payoutStatus: 'completed' }
        );
        
        await Notification.create({
          userId: payout.sellerId,
          userType: 'seller',
          type: 'payout_completed',
          title: 'Payment Received!',
          message: `₹${payout.netPayout.toFixed(0)} has been transferred to your account`,
          actionUrl: '/seller/payouts',
          priority: 'high'
        });
      }
      
      if (status === 'failed') {
        payout.failureReason = notes;
        await Order.updateMany(
          { _id: { $in: payout.orderIds } },
          { payoutStatus: 'pending' }
        );
      }
    }
    
    if (notes) payout.notes = notes;
    await payout.save();
    
    return NextResponse.json({ success: true, payout });
  } catch (error) {
    console.error('Payout update error:', error);
    return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 });
  }
}

function getLastWeekStart() {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() - 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getLastWeekEnd() {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() - 1);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
