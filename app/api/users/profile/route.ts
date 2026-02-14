import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ 
      $or: [{ email: id }, { _id: id }] 
    }).select('-password -otp -otpExpiresAt');
    
    if (!user) {
      return NextResponse.json({});
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      panCard: user.panCard,
      legalEntity: user.legalEntity,
      address: user.address,
      city: user.city,
      pincode: user.pincode,
      whatsappUpdates: user.whatsappUpdates,
      showTax: user.showTax,
      paperInvoice: user.paperInvoice
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: data.email },
      {
        $set: {
          name: data.name,
          phoneNumber: data.phoneNumber,
          panCard: data.panCard,
          legalEntity: data.legalEntity,
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          whatsappUpdates: data.whatsappUpdates,
          showTax: data.showTax,
          paperInvoice: data.paperInvoice
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
