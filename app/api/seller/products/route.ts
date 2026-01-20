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
    
    const sellerProducts = await SellerProduct.find({ sellerId }).populate('productId');
    return NextResponse.json({ products: sellerProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { sellerId, productId, sellerPrice, stock, minOrderQty, deliveryTime } = await req.json();
    
    if (!sellerId || !productId || !sellerPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const sellerProduct = await SellerProduct.create({ sellerId, productId, sellerPrice, stock, minOrderQty, deliveryTime });
    return NextResponse.json({ success: true, product: sellerProduct });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Product already added' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
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