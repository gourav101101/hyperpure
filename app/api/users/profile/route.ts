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
      $or: [{ email: id }, { phoneNumber: id }] 
    }).select('-password -otp -otpExpiresAt');
    
    if (!user) {
      return NextResponse.json({
        name: '',
        email: id.includes('@') ? id : '',
        phoneNumber: !id.includes('@') ? id : '',
        panCard: '',
        legalEntity: 'Guest Account',
        address: '',
        city: '',
        pincode: '',
        whatsappUpdates: false,
        showTax: false,
        paperInvoice: false
      });
    }

    return NextResponse.json({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      panCard: user.panCard || '',
      legalEntity: user.legalEntity || 'Guest Account',
      address: user.address || '',
      city: user.city || '',
      pincode: user.pincode || '',
      whatsappUpdates: user.whatsappUpdates || false,
      showTax: user.showTax || false,
      paperInvoice: user.paperInvoice || false
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.email && !data.phoneNumber) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    await dbConnect();
    
    const query = data.email ? { email: data.email } : { phoneNumber: data.phoneNumber };
    
    const user = await User.findOneAndUpdate(
      query,
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

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
