import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';
import SellerProduct from '@/models/SellerProduct';
import Order from '@/models/Order';
import SellerPerformance from '@/models/SellerPerformance';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const email = searchParams.get('email');
    
    if (!sellerId && !email) {
      return NextResponse.json({ error: 'Seller ID or email required' }, { status: 400 });
    }
    
    let seller;
    if (email) {
      seller = await Seller.findOne({ email });
    } else {
      seller = await Seller.findById(sellerId);
    }
    
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }
    
    const products = await SellerProduct.find({ sellerId: seller._id });
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const performance = await SellerPerformance.findOne({ sellerId: seller._id }).lean();

    const orders = await Order.find({
      'items.sellerId': seller._id.toString(),
      status: { $ne: 'cancelled' }
    }).lean();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      const sellerItems = order.items.filter((item: any) => item.sellerId?.toString() === seller._id.toString());
      const orderRevenue = sellerItems.reduce((s: number, item: any) => s + (item.sellerPrice || item.price) * item.quantity, 0);
      return sum + orderRevenue;
    }, 0);
    
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
        bankDetails: seller.bankDetails,
        createdAt: seller.createdAt
      },
      stats: {
        totalProducts,
        activeProducts,
        orders: totalOrders,
        revenue: totalRevenue
      },
      performance,
      recentProducts: products.slice(0, 5)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { sellerId, brandNames, category, cities, horecaClients, bankDetails } = await req.json();
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (brandNames !== undefined) updateData.brandNames = brandNames;
    if (category !== undefined) updateData.category = category;
    if (cities !== undefined) updateData.cities = cities;
    if (horecaClients !== undefined) updateData.horecaClients = horecaClients;
    if (bankDetails !== undefined) updateData.bankDetails = bankDetails;
    
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      updateData,
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
