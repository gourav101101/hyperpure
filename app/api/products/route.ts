import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import SellerProduct from '@/models/SellerProduct';
import Commission from '@/models/Commission';
import Category from '@/models/Category';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      }
      const product = await Product.findById(id).lean();
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      
      const sellers = await SellerProduct.find({ productId: id, isActive: true, stock: { $gt: 0 } })
        .sort({ sellerPrice: 1 })
        .limit(1)
        .lean();
      
      if (sellers.length > 0) {
        const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
        const customerPrice = sellers[0].sellerPrice * (1 + commission.commissionRate / 100);
        product.price = Math.round(customerPrice);
        product.unit = `${sellers[0].unitValue} ${sellers[0].unitMeasure}`;
        product.inStock = true;
      }
      
      return NextResponse.json(product);
    }
    
    const products = await Product.find({}).lean();
    const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
    const categories = await Category.find({ isActive: { $ne: false } }).lean();
    
    const productsWithPrices = await Promise.all(products.map(async (product: any) => {
      // Check if category and subcategory are active
      const category = categories.find((c: any) => c.name === product.category);
      const subcategory = category?.subcategories?.find((s: any) => s.name === product.subcategory);
      
      const isCategoryActive = category && category.isActive !== false;
      const isSubcategoryActive = subcategory && subcategory.isActive !== false;
      const isProductActive = product.isActive !== false;
      
      const sellers = await SellerProduct.find({ 
        productId: product._id, 
        isActive: true, 
        stock: { $gt: 0 } 
      }).sort({ sellerPrice: 1 }).lean();
      
      const customerPrice = sellers.length > 0 ? Math.round(sellers[0].sellerPrice * (1 + commission.commissionRate / 100)) : product.price || 0;
      
      return {
        ...product,
        sellerCount: sellers.length,
        price: customerPrice,
        unit: sellers.length > 0 ? `${sellers[0].unitValue} ${sellers[0].unitMeasure}` : product.unit,
        inStock: sellers.length > 0,
        isActive: isCategoryActive && isSubcategoryActive && isProductActive
      };
    }));
    
    // Filter only active products for frontend
    const activeProducts = productsWithPrices.filter((p: any) => p.isActive !== false);
    
    return NextResponse.json(activeProducts);
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const product = await Product.create(data);
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, ...data } = await req.json();
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}