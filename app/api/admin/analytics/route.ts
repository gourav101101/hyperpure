import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Payout from '@/models/Payout';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week';
    
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    const orders = await Order.find({
      status: 'delivered',
      actualDeliveryTime: { $gte: startDate }
    }).lean();
    
    let totalCommission = 0;
    let totalRevenue = 0;
    const commissionBySeller: any = {};
    const dailyCommission: any = {};
    
    orders.forEach((order: any) => {
      const commission = order.totalCommission || 0;
      const revenue = order.subtotal || 0;
      
      totalCommission += commission;
      totalRevenue += revenue;
      
      order.items.forEach((item: any) => {
        const sellerId = item.sellerId?.toString();
        if (sellerId) {
          if (!commissionBySeller[sellerId]) {
            commissionBySeller[sellerId] = { commission: 0, orders: 0 };
          }
          commissionBySeller[sellerId].commission += item.commissionAmount || 0;
          commissionBySeller[sellerId].orders += 1;
        }
      });
      
      const date = new Date(order.actualDeliveryTime).toISOString().split('T')[0];
      if (!dailyCommission[date]) {
        dailyCommission[date] = 0;
      }
      dailyCommission[date] += commission;
    });
    
    const payouts = await Payout.find({
      createdAt: { $gte: startDate }
    }).lean();
    
    const payoutStats = {
      pending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPayout, 0),
      processing: payouts.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.netPayout, 0),
      completed: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.netPayout, 0)
    };
    
    const topSellers = Object.entries(commissionBySeller)
      .sort((a: any, b: any) => b[1].commission - a[1].commission)
      .slice(0, 10)
      .map(([sellerId, data]: any) => ({
        sellerId,
        commission: data.commission,
        orders: data.orders
      }));
    
    const chartData = Object.entries(dailyCommission)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, commission]) => ({ date, commission }));
    
    return NextResponse.json({
      totalCommission,
      totalRevenue,
      commissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue * 100).toFixed(2) : 0,
      totalOrders: orders.length,
      payoutStats,
      topSellers,
      chartData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
