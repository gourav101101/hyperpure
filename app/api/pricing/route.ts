import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SellerProduct from '@/models/SellerProduct';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const productId = searchParams.get('productId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    // Get seller's products
    const sellerProducts = await SellerProduct.find({ 
      sellerId, 
      isActive: true 
    }).populate('productId', 'name').lean();
    
    const insights = [];
    
    for (const sp of sellerProducts) {
      if (productId && sp.productId._id.toString() !== productId) continue;
      
      // Get all competitors for this product
      const competitors = await SellerProduct.find({
        productId: sp.productId._id,
        sellerId: { $ne: sellerId },
        isActive: true,
        stock: { $gt: 0 }
      }).lean();
      
      if (competitors.length === 0) continue;
      
      const prices = competitors.map((c: any) => c.sellerPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      const myPrice = sp.sellerPrice;
      const pricePosition = prices.filter(p => p < myPrice).length + 1;
      
      let recommendation = '';
      let status = 'good';
      
      if (myPrice > avgPrice * 1.15) {
        recommendation = `Your price is ${((myPrice / avgPrice - 1) * 100).toFixed(0)}% above average. Consider reducing to ₹${Math.round(avgPrice)} for better sales.`;
        status = 'high';
      } else if (myPrice < avgPrice * 0.85) {
        recommendation = `Your price is ${((1 - myPrice / avgPrice) * 100).toFixed(0)}% below average. You could increase to ₹${Math.round(avgPrice)} for better margins.`;
        status = 'low';
      } else {
        recommendation = 'Your price is competitive!';
        status = 'good';
      }
      
      insights.push({
        productId: sp.productId._id,
        productName: sp.productId.name,
        myPrice,
        minPrice,
        maxPrice,
        avgPrice: Math.round(avgPrice),
        competitors: competitors.length,
        pricePosition,
        totalSellers: competitors.length + 1,
        recommendation,
        status
      });
    }
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing insights' }, { status: 500 });
  }
}
