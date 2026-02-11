import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SellerProduct from '@/models/SellerProduct';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return NextResponse.json({ error: 'Invalid Seller ID format' }, { status: 400 });
    }
    
    const sellerProducts = await SellerProduct.find({ sellerId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean()
      .catch(err => {
        console.error('Populate error:', err);
        return [];
      });
    
    // Filter out products where populate failed
    const validProducts = sellerProducts.filter(sp => sp.productId);
    
    return NextResponse.json({ products: validProducts });
  } catch (error: any) {
    console.error('Seller products API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error.message 
    }, { status: 500 });
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

    if (!mongoose.Types.ObjectId.isValid(sellerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
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
    return NextResponse.json({ 
      error: error.message || 'Failed to add product',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, ...data } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Product ID format' }, { status: 400 });
    }
    
    const product = await SellerProduct.findByIdAndUpdate(id, data, { new: true });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error.message 
    }, { status: 500 });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Product ID format' }, { status: 400 });
    }
    
    const product = await SellerProduct.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error.message 
    }, { status: 500 });
  }
}