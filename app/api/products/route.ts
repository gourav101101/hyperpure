import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import SellerProduct from '@/models/SellerProduct';
import Commission from '@/models/Commission';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
      const product = await Product.findById(id).lean();
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      
      // Get lowest price from sellers
      const sellers = await SellerProduct.find({ productId: id, isActive: true, stock: { $gt: 0 } })
        .sort({ sellerPrice: 1 })
        .limit(1)
        .lean();
      
      if (sellers.length > 0) {
        const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
        const customerPrice = sellers[0].sellerPrice * (1 + commission.commissionRate / 100);
        product.price = Math.round(customerPrice); // Customer pays this
        product.unit = `${sellers[0].unitValue} ${sellers[0].unitMeasure}`;
        product.inStock = true;
      }
      
      return NextResponse.json(product);
    } catch (err) {
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
  }
  
  const products = await Product.find({}).lean();
  const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
  
  // Add seller count and lowest price to each product
  const productsWithPrices = await Promise.all(products.map(async (product: any) => {
    const sellers = await SellerProduct.find({ 
      productId: product._id, 
      isActive: true, 
      stock: { $gt: 0 } 
    }).sort({ sellerPrice: 1 }).lean();
    
    const customerPrice = sellers.length > 0 ? Math.round(sellers[0].sellerPrice * (1 + commission.commissionRate / 100)) : product.price || 0;
    
    return {
      ...product,
      sellerCount: sellers.length,
      price: customerPrice, // Customer pays this
      unit: sellers.length > 0 ? `${sellers[0].unitValue} ${sellers[0].unitMeasure}` : product.unit,
      inStock: sellers.length > 0
    };
  }));
  
  return NextResponse.json(productsWithPrices);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const product = await Product.create(data);
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, ...data } = await req.json();
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}