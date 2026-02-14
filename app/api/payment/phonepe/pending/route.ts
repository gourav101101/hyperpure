import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const orderData = await req.json();
    
    // Transform cart items to match Order schema
    const transformedItems = orderData.items.map((item: any) => {
      const productId = item._id || item.productId;
      return {
        productId: productId.includes('-') ? productId.split('-')[0] : productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        unit: item.unit,
        gstRate: item.gstRate || 0,
        cessRate: item.cessRate || 0
      };
    });
    
    // Handle userId - only set if valid ObjectId
    const userId = orderData.userId && mongoose.Types.ObjectId.isValid(orderData.userId)
      ? orderData.userId
      : undefined;
    
    const order = await Order.create({
      userId,
      phoneNumber: orderData.phoneNumber,
      items: transformedItems,
      subtotal: orderData.subtotal,
      gstAmount: orderData.gstAmount,
      deliveryFee: orderData.deliveryFee,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      deliverySlotId: orderData.deliverySlot?._id,
      deliverySlotName: orderData.deliverySlot?.name,
      paymentMethod: orderData.paymentMethod,
      status: 'pending_payment',
      paymentStatus: 'pending'
    });

    return NextResponse.json({ orderId: order._id.toString() });
  } catch (error: any) {
    console.error('Pending order error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to create pending order' }, { status: 500 });
  }
}
