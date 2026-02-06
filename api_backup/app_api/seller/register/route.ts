import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    
    const existingSeller = await Seller.findOne({ 
      $or: [{ phone: data.phone }, { email: data.email }] 
    });
    
    if (existingSeller) {
      return NextResponse.json({ 
        error: 'Phone number or email already registered' 
      }, { status: 400 });
    }
    
    const seller = await Seller.create(data);
    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! We will contact you soon.',
      sellerId: seller._id 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
