import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SellerProduct from '@/models/SellerProduct';
import Commission from '@/models/Commission';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).populate('wishlist');
    } else {
      user = await User.findOne({ phoneNumber: userId }).populate('wishlist');
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
    const wishlistProducts = (user?.wishlist || []).map((p: any) => (typeof p?.toObject === 'function' ? p.toObject() : p));

    const enriched = await Promise.all(
      wishlistProducts.map(async (product: any) => {
        const sellers = await SellerProduct.find({
          productId: product._id,
          isActive: true,
          stock: { $gt: 0 },
        })
          .sort({ sellerPrice: 1 })
          .limit(1)
          .lean();

        if (sellers.length > 0) {
          const customerPrice = Math.round(sellers[0].sellerPrice * (1 + commission.commissionRate / 100));
          return {
            ...product,
            price: customerPrice,
            unit: `${sellers[0].unitValue} ${sellers[0].unitMeasure}`,
            inStock: true,
          };
        }

        return {
          ...product,
          price: product.price || 0,
          unit: product.unit,
          inStock: false,
        };
      })
    );

    return NextResponse.json({ wishlist: enriched });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, productId } = await req.json();
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and product ID required' }, { status: 400 });
    }
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ phoneNumber: userId });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!user.wishlist) user.wishlist = [];
    
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    return NextResponse.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { userId, productId } = await req.json();
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and product ID required' }, { status: 400 });
    }
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ phoneNumber: userId });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    user.wishlist = user.wishlist.filter((id: string) => id.toString() !== productId);
    await user.save();

    return NextResponse.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
