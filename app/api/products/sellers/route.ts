import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Seller from '@/models/Seller';
import SellerProduct from '@/models/SellerProduct';
import { OrderRouter } from '@/lib/orderRouter';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    
    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ product: null, packSizes: [] });
    }
    
    // Get all available pack sizes with best prices
    const packSizes = await OrderRouter.getAvailablePackSizes(productId);
    
    // Format as sellers array with price field
    const sellers = packSizes.map(pack => ({
      _id: pack.sellerProductId,
      price: pack.price, // Customer price (with commission)
      sellerPrice: pack.sellerPrice, // Seller base price
      commissionAmount: pack.commissionAmount,
      unitValue: pack.unitValue,
      unitMeasure: pack.unitMeasure,
      stock: pack.stock,
      sellerId: pack.sellerId,
      gstRate: product.gstRate || 0,
      cessRate: product.cessRate || 0
    }));
    
    return NextResponse.json({ product, sellers }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Products/sellers API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch product data',
      product: null, 
      packSizes: [] 
    }, { status: 500 });
  }
}