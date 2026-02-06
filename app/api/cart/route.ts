import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import SellerProduct from '@/models/SellerProduct';
import Commission from '@/models/Commission';

async function findUser(userId: string) {
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return User.findById(userId);
  }
  return User.findOne({ phoneNumber: userId });
}

function normalizeProductId(productId: any) {
  return String(productId || '').split('-')[0];
}

function dedupeCart(cart: any[] = []) {
  const map = new Map<string, { productId: string; quantity: number }>();
  for (const item of cart) {
    const key = normalizeProductId(item?.productId);
    if (!key) continue;
    const qty = Number(item?.quantity || 0);
    const existing = map.get(key);
    if (existing) {
      existing.quantity += qty || 1;
    } else {
      map.set(key, { productId: key, quantity: qty || 1 });
    }
  }
  return Array.from(map.values());
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
    const cartItems = dedupeCart(Array.isArray(user.cart) ? user.cart : []);
    const quantityMap = new Map<string, number>();

    for (const item of cartItems) {
      const productId = normalizeProductId(item.productId);
      if (!productId) continue;
      const qty = typeof item.quantity === 'number' ? item.quantity : 1;
      quantityMap.set(productId, (quantityMap.get(productId) || 0) + qty);
    }

    const enriched = await Promise.all(
      Array.from(quantityMap.entries()).map(async ([productId, quantity]) => {
        const product = await Product.findById(productId).lean();
        if (!product) return null;

        const sellers = await SellerProduct.find({
          productId: product._id,
          isActive: true,
          stock: { $gt: 0 },
        })
          .sort({ sellerPrice: 1 })
          .limit(1)
          .lean();

        let price = 0;
        let unit = '';
        if (sellers.length > 0) {
          price = Math.round(sellers[0].sellerPrice * (1 + commission.commissionRate / 100));
          unit = `${sellers[0].unitValue} ${sellers[0].unitMeasure}`;
        }

        return {
          _id: product._id,
          name: product.name,
          price: price || 0,
          quantity,
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
          unit,
          gstRate: product.gstRate || 0,
          cessRate: product.cessRate || 0,
        };
      })
    );

    return NextResponse.json({ cart: enriched.filter(Boolean) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, productId, quantity } = await req.json();
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and product ID required' }, { status: 400 });
    }

    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const normalizedProductId = normalizeProductId(productId);
    if (!user.cart) user.cart = [];
    const existing = user.cart.find((item: any) => normalizeProductId(item.productId) === normalizedProductId);
    if (existing) {
      existing.quantity = (existing.quantity || 0) + (quantity || 1);
    } else {
      user.cart.push({ productId: normalizedProductId, quantity: quantity || 1 });
    }
    user.cart = dedupeCart(user.cart);
    await user.save();

    return NextResponse.json({ message: 'Added to cart', cart: user.cart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { userId, productId, quantity, items } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (Array.isArray(items)) {
      user.cart = dedupeCart(items.map((item: any) => ({
        productId: normalizeProductId(item.productId),
        quantity: item.quantity || 1,
      })));
      await user.save();
      return NextResponse.json({ message: 'Cart updated', cart: user.cart });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const normalizedProductId = normalizeProductId(productId);
    if (!user.cart) user.cart = [];
    const existing = user.cart.find((item: any) => normalizeProductId(item.productId) === normalizedProductId);
    if (existing) {
      if (quantity <= 0) {
        user.cart = user.cart.filter((item: any) => normalizeProductId(item.productId) !== normalizedProductId);
      } else {
        existing.quantity = quantity;
      }
      user.cart = dedupeCart(user.cart);
      await user.save();
    }

    return NextResponse.json({ message: 'Cart updated', cart: user.cart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { userId, productId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!productId) {
      user.cart = [];
    } else {
      const normalizedProductId = normalizeProductId(productId);
      user.cart = (user.cart || []).filter((item: any) => normalizeProductId(item.productId) !== normalizedProductId);
    }
    user.cart = dedupeCart(user.cart);
    await user.save();

    return NextResponse.json({ message: 'Cart updated', cart: user.cart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

