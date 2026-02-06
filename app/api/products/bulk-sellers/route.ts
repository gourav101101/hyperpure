import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { OrderRouter } from '@/lib/orderRouter';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { productIds } = await req.json();
    
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Product IDs array required' }, { status: 400 });
    }
    
    const prices: any = {};
    
    await Promise.all(
      productIds.map(async (productId: string) => {
        const lowestPrice = await OrderRouter.getLowestPrice(productId);
        if (lowestPrice) {
          prices[productId] = lowestPrice;
        }
      })
    );
    
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Bulk sellers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch prices', prices: {} }, { status: 500 });
  }
}
