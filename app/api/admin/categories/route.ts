import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ order: 1 });
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const category = await Category.create(data);
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, subcategories, ...data } = await req.json();
  
  // If updating subcategories, check if any were disabled
  if (subcategories) {
    const category = await Category.findById(id);
    if (category) {
      // Find newly disabled subcategories
      const oldSubs = category.subcategories;
      for (let i = 0; i < subcategories.length; i++) {
        const newSub = subcategories[i];
        const oldSub = oldSubs[i];
        
        // If subcategory was disabled, disable all its products
        if (oldSub && oldSub.isActive !== false && newSub.isActive === false) {
          await Product.updateMany(
            { category: category.name, subcategory: newSub.name },
            { $set: { isActive: false } }
          );
        }
      }
    }
    data.subcategories = subcategories;
  }
  
  // If disabling a category, disable all its subcategories and products
  if (data.isActive === false) {
    const category = await Category.findById(id);
    if (category) {
      // Disable all subcategories
      const disabledSubs = category.subcategories.map((sub: any) => ({
        ...sub,
        isActive: false
      }));
      data.subcategories = disabledSubs;
      
      // Disable all products in this category
      await Product.updateMany(
        { category: category.name },
        { $set: { isActive: false } }
      );
    }
  }
  
  const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(updatedCategory);
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
