import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SellerProduct from '@/models/SellerProduct';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || '696fb9b201b92d7dbe63502c';
    
    const product = await Product.findById(productId).lean();
    const sellerProducts = await SellerProduct.find({ productId }).lean();
    
    return NextResponse.json({
      productId,
      productExists: !!product,
      productName: product?.name,
      sellerProductsCount: sellerProducts.length,
      sellerProducts: sellerProducts.map((sp: any) => ({
        _id: sp._id,
        sellerId: sp.sellerId,
        sellerPrice: sp.sellerPrice,
        stock: sp.stock,
        isActive: sp.isActive,
        unitValue: sp.unitValue,
        unitMeasure: sp.unitMeasure
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
