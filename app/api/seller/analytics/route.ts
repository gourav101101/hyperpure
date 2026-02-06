import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import SellerProduct from '@/models/SellerProduct';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const period = searchParams.get('period') || '7'; // days
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Get orders
    const orders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: startDate }
    }).lean();
    
    // Calculate daily revenue
    const dailyRevenue: any = {};
    const productSales: any = {};
    
    orders.forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const sellerItems = order.items.filter((item: any) => item.sellerId?.toString() === sellerId);
      
      const dayRevenue = sellerItems.reduce((sum: number, item: any) => 
        sum + (item.sellerPrice || item.price) * item.quantity, 0
      );
      
      dailyRevenue[date] = (dailyRevenue[date] || 0) + dayRevenue;
      
      // Track product sales
      sellerItems.forEach((item: any) => {
        const productId = item.productId.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += (item.sellerPrice || item.price) * item.quantity;
      });
    });
    
    // Format daily revenue for chart
    const revenueChart = Object.keys(dailyRevenue).sort().map(date => ({
      date,
      revenue: dailyRevenue[date]
    }));
    
    // Top products
    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get total products
    const totalProducts = await SellerProduct.countDocuments({ sellerId, isActive: true });
    
    // Summary stats
    const totalOrders = orders.length;
    const totalRevenue = Object.values(dailyRevenue).reduce((sum: number, val: any) => sum + val, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        totalProducts
      },
      revenueChart,
      topProducts
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
