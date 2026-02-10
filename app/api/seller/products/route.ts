import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SellerProduct from '@/models/SellerProduct';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    const sellerProducts = await SellerProduct.find({ sellerId }).populate('productId').lean();
    return NextResponse.json({ products: sellerProducts });
  } catch (error) {
    console.error('Seller products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const { sellerId, productId, sellerPrice, unitValue, unitMeasure, stock, minOrderQty, maxOrderQty, deliveryTime, discount } = data;
    
    if (!sellerId || !productId || !sellerPrice || !unitValue || !unitMeasure) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const sellerProduct = await SellerProduct.create({ 
      sellerId, productId, sellerPrice, unitValue, unitMeasure, stock, 
      minOrderQty, maxOrderQty, deliveryTime, discount 
    });
    return NextResponse.json({ success: true, product: sellerProduct });
  } catch (error: any) {
    console.error('Error adding product:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Product already added with this pack size' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, ...data } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    
    const product = await SellerProduct.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    
    await SellerProduct.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}