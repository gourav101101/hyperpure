import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import SellerProduct from '@/models/SellerProduct';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    
    const product = await Product.findById(productId);
    const sellerPrices = await SellerProduct.find({ 
      productId, 
      isActive: true,
      stock: { $gt: 0 }
    }).populate('sellerId').sort({ sellerPrice: 1 });
    
    return NextResponse.json({ product, sellers: sellerPrices });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
