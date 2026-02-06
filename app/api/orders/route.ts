import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { OrderRouter } from '@/lib/orderRouter';
import Notification from '@/models/Notification';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    
    if (id) {
      const order = await Order.findById(id).lean();
      return NextResponse.json(order);
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const conditions: Array<Record<string, string>> = [{ phoneNumber: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      conditions.unshift({ userId });
    }
    
    const orders = await Order.find({ $or: conditions })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Use smart routing to assign sellers
    const routedOrder = await OrderRouter.routeOrder(
      body.items.map((item: any) => ({
        productId: item._id,
        quantity: item.quantity
      })),
      body.deliveryAddress.pincode
    );
    
    // Calculate totals with commission
    let totalCommission = 0;
    let totalSellerPayout = 0;
    
    const orderItems = routedOrder.items.map((routedItem: any) => {
      const originalItem = body.items.find((i: any) => i._id === routedItem.productId);
      
      totalCommission += routedItem.commissionAmount || 0;
      totalSellerPayout += (routedItem.sellerPrice * routedItem.quantity);
      
      return {
        productId: routedItem.productId,
        sellerProductId: routedItem.sellerProductId,
        sellerId: routedItem.sellerId,
        name: originalItem.name,
        price: routedItem.price,
        quantity: routedItem.quantity,
        image: originalItem.image,
        unit: routedItem.unitValue + ' ' + routedItem.unitMeasure,
        sellerPrice: routedItem.sellerPrice,
        commissionAmount: routedItem.commissionAmount,
        commissionRate: routedItem.commissionRate
      };
    });
    
    // Group items by seller
    const sellerGroups = new Map();
    orderItems.forEach((item: any) => {
      const sellerId = item.sellerId.toString();
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, []);
      }
      sellerGroups.get(sellerId).push(item);
    });
    
    const assignedSellers = Array.from(sellerGroups.entries()).map(([sellerId, items]) => ({
      sellerId,
      items: (items as any[]).map(i => i.productId),
      status: 'assigned',
      assignedAt: new Date()
    }));
    
    // Create order
    const userId = typeof body.userId === 'string' && mongoose.Types.ObjectId.isValid(body.userId)
      ? new mongoose.Types.ObjectId(body.userId)
      : undefined;

    const order = await Order.create({
      userId,
      phoneNumber: body.phoneNumber,
      items: orderItems,
      subtotal: body.subtotal,
      deliveryFee: routedOrder.deliveryFee || 30,
      totalAmount: body.totalAmount,
      totalCommission,
      totalSellerPayout,
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod,
      assignedSellers,
      status: 'confirmed'
    });
    
    // Create notifications for sellers
    for (const [sellerId] of sellerGroups.entries()) {
      await Notification.create({
        userId: sellerId,
        userType: 'seller',
        type: 'new_order',
        title: 'New Order Received!',
        message: `You have a new order #${order._id.toString().slice(-6)}`,
        orderId: order._id,
        actionUrl: '/seller/orders',
        actionText: 'View Order',
        priority: 'high'
      });
      
      // Send real-time notification
      await sendNotification({
        userType: 'seller',
        userId: sellerId,
        type: 'order',
        title: '🛒 New Order!',
        message: `Order #${order._id.toString().slice(-6)} received`,
        link: '/seller/orders'
      });
    }
    
    // Notify admin
    await sendNotification({
      userType: 'admin',
      type: 'order',
      title: '🛒 New Order Placed',
      message: `Order #${order._id.toString().slice(-6)} - ₹${body.totalAmount}`,
      link: '/admin/dashboard'
    });
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
