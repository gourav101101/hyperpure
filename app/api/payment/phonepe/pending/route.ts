import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { OrderRouter } from '@/lib/orderRouter';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const orderData = await req.json();
    
    // Use OrderRouter to assign sellers
    const routedOrder = await OrderRouter.routeOrder(
      orderData.items.map((item: any) => ({
        productId: item._id || item.productId,
        quantity: item.quantity
      })),
      orderData.deliveryAddress?.pincode
    );
    
    let totalCommission = 0;
    let totalSellerPayout = 0;
    
    const transformedItems = routedOrder.items.map((routedItem: any) => {
      const originalItem = orderData.items.find((i: any) => 
        (i._id || i.productId) === routedItem.productId
      );
      
      totalCommission += routedItem.commissionAmount || 0;
      totalSellerPayout += (routedItem.sellerPrice * routedItem.quantity);
      
      const sellerId = routedItem.sellerId?._id || routedItem.sellerId;
      
      return {
        productId: new mongoose.Types.ObjectId(routedItem.productId),
        sellerProductId: routedItem.sellerProductId ? new mongoose.Types.ObjectId(routedItem.sellerProductId) : undefined,
        sellerId: sellerId ? new mongoose.Types.ObjectId(sellerId) : undefined,
        name: originalItem.name,
        price: routedItem.price,
        quantity: routedItem.quantity,
        image: originalItem.image,
        unit: routedItem.unitValue + ' ' + routedItem.unitMeasure,
        sellerPrice: routedItem.sellerPrice,
        commissionAmount: routedItem.commissionAmount,
        commissionRate: routedItem.commissionRate,
        gstRate: originalItem.gstRate || 0,
        cessRate: originalItem.cessRate || 0
      };
    });
    
    // Group items by seller
    const sellerGroups = new Map();
    transformedItems.forEach((item: any) => {
      if (!item.sellerId) return;
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
    
    const userId = orderData.userId && mongoose.Types.ObjectId.isValid(orderData.userId)
      ? orderData.userId
      : undefined;
    
    const order = await Order.create({
      userId,
      phoneNumber: orderData.phoneNumber,
      items: transformedItems,
      subtotal: orderData.subtotal,
      gstAmount: orderData.gstAmount,
      deliveryFee: routedOrder.deliveryFee || orderData.deliveryFee,
      totalAmount: orderData.totalAmount,
      totalCommission,
      totalSellerPayout,
      deliveryAddress: orderData.deliveryAddress,
      deliverySlotId: orderData.deliverySlot?._id,
      deliverySlotName: orderData.deliverySlot?.name,
      paymentMethod: orderData.paymentMethod,
      assignedSellers,
      status: 'pending_payment',
      paymentStatus: 'pending'
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
        priority: 'high'
      });
      
      // Emit socket notification
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket/emit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
          })
        });
      } catch (err) {
        console.error('Socket emit error:', err);
      }
    }

    await Notification.create({
      userId: 'admin',
      userType: 'admin',
      type: 'new_order',
      title: 'New Order Placed',
      message: `Order #${order._id.toString().slice(-6)} - ₹${orderData.totalAmount}`,
      orderId: order._id,
      actionUrl: '/admin/orders',
      priority: 'high'
    });

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: 'admin-admin',
          event: 'notification',
          data: {
            _id: new mongoose.Types.ObjectId().toString(),
            type: 'new_order',
            title: 'New Order Placed',
            message: `Order #${order._id.toString().slice(-6)} - ₹${orderData.totalAmount}`,
            actionUrl: '/admin/orders',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        })
      });
    } catch (err) {
      console.error('Admin socket emit error:', err);
    }

    return NextResponse.json({ orderId: order._id.toString() });
  } catch (error: any) {
    console.error('Pending order error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to create pending order' }, { status: 500 });
  }
}
