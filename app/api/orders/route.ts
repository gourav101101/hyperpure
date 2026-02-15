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
    
    const conditions: Array<Record<string, any>> = [
      { phoneNumber: userId },
      { 'deliveryAddress.email': userId }
    ];
    
    if (mongoose.Types.ObjectId.isValid(userId)) {
      conditions.unshift({ userId });
    }
    
    // Check if userId is an email
    if (userId.includes('@')) {
      const user = await mongoose.connection.db.collection('users').findOne({ email: userId });
      if (user) {
        conditions.unshift({ userId: user._id });
      }
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
    
    console.log('📦 Order request items:', body.items.map((i: any) => ({ id: i._id, name: i.name })));
    
    // Find user by email if provided
    let userId = body.userId;
    if (body.deliveryAddress?.email) {
      const user = await mongoose.connection.db.collection('users').findOne({ email: body.deliveryAddress.email });
      if (user) {
        userId = user._id.toString();
      }
    }
    
    // Use smart routing to assign sellers
    const routedOrder = await OrderRouter.routeOrder(
      body.items.map((item: any) => ({
        productId: item._id,
        quantity: item.quantity
      })),
      body.deliveryAddress.pincode
    );
    
    console.log('🚚 Routed items:', routedOrder.items.map((i: any) => ({ 
      productId: i.productId, 
      sellerId: i.sellerId,
      available: i.available 
    })));
    
    // Calculate totals with commission
    let totalCommission = 0;
    let totalSellerPayout = 0;
    
    const orderItems = routedOrder.items.map((routedItem: any) => {
      const originalItem = body.items.find((i: any) => i._id === routedItem.productId);
      
      totalCommission += routedItem.commissionAmount || 0;
      totalSellerPayout += (routedItem.sellerPrice * routedItem.quantity);
      
      const sellerId = routedItem.sellerId?._id || routedItem.sellerId;
      
      return {
        productId: new mongoose.Types.ObjectId(routedItem.productId),
        sellerProductId: routedItem.sellerProductId ? new mongoose.Types.ObjectId(routedItem.sellerProductId) : undefined,
        sellerId: new mongoose.Types.ObjectId(sellerId),
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
    const finalUserId = typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : undefined;

    const order = await Order.create({
      userId: finalUserId,
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
    }
    
    // Create notification for admin
    await Notification.create({
      userId: 'admin',
      userType: 'admin',
      type: 'new_order',
      title: 'New Order Placed',
      message: `Order #${order._id.toString().slice(-6)} - ₹${body.totalAmount}`,
      orderId: order._id,
      actionUrl: '/admin/dashboard',
      priority: 'high'
    });
    
    // Emit socket events for real-time notifications
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            ...Array.from(sellerGroups.keys()).map(sellerId => ({
              room: `seller-${sellerId}`,
              event: 'notification',
              data: {
                _id: new mongoose.Types.ObjectId().toString(),
                type: 'new_order',
                title: 'New Order Received!',
                message: `You have a new order #${order._id.toString().slice(-6)}`,
                actionUrl: '/seller/orders',
                isRead: false,
                createdAt: new Date().toISOString()
              }
            })),
            {
              room: 'admin-admin',
              event: 'notification',
              data: {
                _id: new mongoose.Types.ObjectId().toString(),
                type: 'new_order',
                title: 'New Order Placed',
                message: `Order #${order._id.toString().slice(-6)} - ₹${body.totalAmount}`,
                actionUrl: '/admin/dashboard',
                isRead: false,
                createdAt: new Date().toISOString()
              }
            }
          ]
        })
      });
    } catch (err) {
      console.error('Socket emit error:', err);
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
