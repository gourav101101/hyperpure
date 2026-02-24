import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import SellerPerformance from '@/models/SellerPerformance';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId') || req.headers.get('x-seller-id');
    const status = searchParams.get('status');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return NextResponse.json({ error: 'Invalid seller ID' }, { status: 400 });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const query: any = {
      'items.sellerId': sellerObjectId
    };

    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    const filteredOrders = orders.map((order: any) => {
      const sellerItems = order.items.filter((item: any) => 
        item.sellerId?.toString() === sellerId
      );
      
      const grossTotal = sellerItems.reduce((sum: number, item: any) => 
        sum + (item.sellerPrice || item.price) * item.quantity, 0
      );
      const totalCommission = sellerItems.reduce((sum: number, item: any) => 
        sum + (item.commissionAmount || 0), 0
      );
      
      return {
        ...order,
        items: sellerItems,
        sellerTotal: grossTotal - totalCommission,
        grossTotal,
        totalCommission
      };
    });
    
    return NextResponse.json({ orders: filteredOrders });
  } catch (error) {
    console.error('Seller orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, sellerId, status, deliveryProof } = await req.json();
    const allowedStatuses = new Set(['processing', 'out_for_delivery', 'delivered']);

    if (!orderId || !sellerId) {
      return NextResponse.json({ error: 'Order ID and seller ID required' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return NextResponse.json({ error: 'Invalid order or seller ID' }, { status: 400 });
    }
    if (status && !allowedStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const sellerHasOrderItems = order.items.some((item: any) => item.sellerId?.toString() === sellerId);
    if (!sellerHasOrderItems) {
      return NextResponse.json({ error: 'Unauthorized seller for this order' }, { status: 403 });
    }

    const currentStatus = order.status;
    const allowedTransitions: Record<string, string[]> = {
      pending: ['processing'],
      confirmed: ['processing'],
      assigned: ['processing'],
      processing: ['out_for_delivery'],
      out_for_delivery: ['delivered']
    };
    if (status && currentStatus !== status) {
      const nextAllowed = allowedTransitions[currentStatus] || [];
      if (!nextAllowed.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentStatus} to ${status}` },
          { status: 400 }
        );
      }
    }
    
    // Update order status
    const wasDelivered = order.status === 'delivered';
    if (status) {
      order.status = status;
      if (status === 'delivered') {
        order.actualDeliveryTime = new Date();
        // Set 24-hour hold period
        const holdUntil = new Date();
        holdUntil.setHours(holdUntil.getHours() + 24);
        order.payoutHoldUntil = holdUntil;
        order.payoutStatus = 'on_hold';
      }
    }
    
    if (deliveryProof) {
      order.deliveryProof = deliveryProof;
    }
    
    // Update seller assignment status
    const sellerAssignment = order.assignedSellers.find(
      (s: any) => s.sellerId.toString() === sellerId
    );
    if (sellerAssignment) {
      if (status === 'processing') {
        sellerAssignment.status = 'accepted';
        if (!sellerAssignment.acceptedAt) {
          sellerAssignment.acceptedAt = new Date();
        }
      }
      if (status === 'delivered') sellerAssignment.status = 'completed';
      if (status === 'delivered') sellerAssignment.completedAt = new Date();
    }
    
    await order.save();

    // Send notification to customer about status update
    if (status) {
      const statusMessages = {
        'processing': 'is being prepared',
        'out_for_delivery': 'is out for delivery', 
        'delivered': 'has been delivered'
      };
      
      const message = statusMessages[status as keyof typeof statusMessages];
      if (message) {
        console.log('📱 Sending status update notification to customer...');
        try {
          await sendNotification({
            userType: 'customer',
            userId: order.userId?.toString(),
            phoneNumber: order.phoneNumber?.includes('@') ? undefined : order.phoneNumber,
            email: order.phoneNumber?.includes('@') ? order.phoneNumber : order.deliveryAddress?.email,
            type: 'order',
            title: `Order Update 📦`,
            message: `Order #${order._id.toString().slice(-6)} ${message}`,
            orderId: order._id.toString()
          });
          console.log('✅ Customer status notification sent');
        } catch (notifError) {
          console.error('❌ Customer status notification failed:', notifError);
        }
      }
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            {
              room: `admin-admin`,
              event: 'order_updated',
              data: {
                orderId,
                sellerId,
                status,
                updatedAt: new Date().toISOString()
              }
            },
            {
              room: `seller-${sellerId}`,
              event: 'order_updated',
              data: {
                orderId,
                sellerId,
                status,
                updatedAt: new Date().toISOString()
              }
            },
            {
              room: `admin-admin`,
              event: 'notification',
              data: {
                _id: new mongoose.Types.ObjectId().toString(),
                type: 'order_status',
                title: 'Order Status Updated',
                message: `Order #${order._id.toString().slice(-6)} is now ${status?.replace('_', ' ')}`,
                actionUrl: '/admin/orders',
                isRead: false,
                createdAt: new Date().toISOString()
              }
            }
          ]
        })
      });
    } catch (socketError) {
      console.error('Socket emit error (seller order update):', socketError);
    }
    
    // Update seller performance
    if (status === 'delivered' && !wasDelivered) {
      const performance = await SellerPerformance.findOne({ sellerId });
      if (performance) {
        performance.completedOrders += 1;
        performance.totalOrders += 1;
        performance.fulfillmentRate = (performance.completedOrders / performance.totalOrders) * 100;
        performance.lastOrderDate = new Date();
        
        // Calculate revenue for this seller's items
        const sellerItems = order.items.filter((item: any) => item.sellerId?.toString() === sellerId);
        const revenue = sellerItems.reduce((sum: number, item: any) => 
          sum + (item.sellerPrice || item.price) * item.quantity, 0
        );
        const commission = sellerItems.reduce((sum: number, item: any) => 
          sum + (item.commissionAmount || 0), 0
        );
        
        performance.totalRevenue += revenue;
        performance.totalCommissionPaid += commission;
        performance.calculateTier();
        await performance.save();
      }
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
