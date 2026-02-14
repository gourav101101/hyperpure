import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

const ProductRequestSchema = new mongoose.Schema({
  email: String,
  productName: String,
  productDetails: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const ProductRequest = mongoose.models.ProductRequest || mongoose.model('ProductRequest', ProductRequestSchema);

export async function POST(request: Request) {
  try {
    const { email, productName, productDetails } = await request.json();
    
    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 });
    }

    await dbConnect();
    await ProductRequest.create({
      email,
      productName,
      productDetails
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
