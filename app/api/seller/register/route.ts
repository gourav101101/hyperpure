import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Check for existing phone
    const existingPhone = await Seller.findOne({ phone: data.phone });
    if (existingPhone) {
      return NextResponse.json({ 
        error: 'Phone number already registered' 
      }, { status: 400 });
    }
    
    // Check for existing email
    const existingEmail = await Seller.findOne({ email: data.email });
    if (existingEmail) {
      return NextResponse.json({ 
        error: 'Email already registered' 
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