import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FraudAlert from '@/models/FraudAlert';
import Order from '@/models/Order';
import SellerProduct from '@/models/SellerProduct';
import Seller from '@/models/Seller';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'new';
    const severity = searchParams.get('severity');
    
    const query: any = { status };
    if (severity) query.severity = severity;
    
    const alerts = await FraudAlert.find(query)
      .populate('sellerId', 'name phone')
      .populate('userId', 'name phone')
      .sort({ severity: -1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { action } = await req.json();
    
    if (action === 'scan') {
      const alerts = [];
      
      // 1. Detect fake orders (same user, multiple cancelled orders)
      const suspiciousUsers = await Order.aggregate([
        { $match: { status: 'cancelled' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $match: { count: { $gte: 5 } } }
      ]);
      
      for (const user of suspiciousUsers) {
        alerts.push({
          type: 'fake_order',
          userId: user._id,
          severity: 'high',
          description: `User has ${user.count} cancelled orders`,
          evidence: { cancelledOrders: user.count }
        });
      }
      
      // 2. Detect stock manipulation (sudden stock changes)
      const stockChanges = await SellerProduct.find({
        updatedAt: { $gte: new Date(Date.now() - 3600000) }, // Last hour
        stock: { $gte: 1000 }
      }).populate('sellerId');
      
      for (const product of stockChanges) {
        alerts.push({
          type: 'stock_manipulation',
          sellerId: (product as any).sellerId._id,
          severity: 'medium',
          description: `Unusual stock update: ${product.stock} units`,
          evidence: { stock: product.stock, productId: product._id }
        });
      }
      
      // 3. Detect price manipulation (price too low/high)
      const avgPrices = await SellerProduct.aggregate([
        { $group: { _id: '$productId', avgPrice: { $avg: '$sellerPrice' } } }
      ]);
      
      for (const avg of avgPrices) {
        const outliers = await SellerProduct.find({
          productId: avg._id,
          $or: [
            { sellerPrice: { $lt: avg.avgPrice * 0.5 } },
            { sellerPrice: { $gt: avg.avgPrice * 2 } }
          ]
        }).populate('sellerId');
        
        for (const outlier of outliers) {
          alerts.push({
            type: 'price_manipulation',
            sellerId: (outlier as any).sellerId._id,
            severity: 'medium',
            description: `Price ${outlier.sellerPrice} vs avg ${avg.avgPrice.toFixed(2)}`,
            evidence: { price: outlier.sellerPrice, avgPrice: avg.avgPrice }
          });
        }
      }
      
      // 4. Detect multiple accounts (same phone)
      const duplicatePhones = await Seller.aggregate([
        { $group: { _id: '$phone', count: { $sum: 1 }, sellers: { $push: '$_id' } } },
        { $match: { count: { $gt: 1 } } }
      ]);
      
      for (const dup of duplicatePhones) {
        alerts.push({
          type: 'multiple_accounts',
          severity: 'critical',
          description: `${dup.count} sellers with phone ${dup._id}`,
          evidence: { phone: dup._id, sellerIds: dup.sellers }
        });
      }
      
      // Save all alerts
      if (alerts.length > 0) {
        await FraudAlert.insertMany(alerts);
      }
      
      return NextResponse.json({ success: true, alertsCreated: alerts.length, alerts });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scan for fraud' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { alertId, status, actionTaken, notes } = await req.json();
    
    const alert = await FraudAlert.findByIdAndUpdate(
      alertId,
      { 
        status, 
        actionTaken, 
        notes,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );
    
    return NextResponse.json({ success: true, alert });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
