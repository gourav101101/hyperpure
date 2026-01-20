import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';
import SellerProduct from '@/models/SellerProduct';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }
    
    const products = await SellerProduct.find({ sellerId: seller._id });
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    
    return NextResponse.json({
      seller: {
        id: seller._id,
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
        businessType: seller.businessType,
        category: seller.category,
        cities: seller.cities,
        brandNames: seller.brandNames,
        horecaClients: seller.horecaClients,
        status: seller.status,
        rejectionReason: seller.rejectionReason,
        createdAt: seller.createdAt
      },
      stats: {
        totalProducts,
        activeProducts,
        orders: 0,
        revenue: 0
      },
      recentProducts: products.slice(0, 5)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { sellerId, brandNames, category, cities, horecaClients } = await req.json();
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { brandNames, category, cities, horecaClients },
      { new: true }
    );
    
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, seller });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 });
  }
}