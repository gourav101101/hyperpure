import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import SellerPerformance from '@/models/SellerPerformance';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId') || req.headers.get('x-seller-id');
    const status = searchParams.get('status');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    const sellerIdValue = mongoose.Types.ObjectId.isValid(sellerId)
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;

    const query: any = {
      $or: [
        { 'items.sellerId': sellerIdValue },
        { 'assignedSellers.sellerId': sellerId },
        { 'assignedSellers.sellerId': sellerIdValue }
      ]
    };

    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Filter items to show only this seller's items
    const filteredOrders = orders.map((order: any) => {
      // First try to match by item.sellerId
      let sellerItems = order.items.filter((item: any) => 
        item.sellerId?.toString() === sellerId.toString()
      );
      
      // Find seller assignment
      const assignment = Array.isArray(order.assignedSellers)
        ? order.assignedSellers.find((s: any) => 
            s.sellerId?.toString() === sellerId.toString() || s.sellerId === sellerId
          )
        : null;
      
      // If no items matched by sellerId, use assignedSellers to find items
      if (sellerItems.length === 0 && assignment) {
        if (assignment.items?.length) {
          const assignedProductIds = new Set(assignment.items.map((i: any) => i.toString()));
          sellerItems = order.items.filter((item: any) => 
            assignedProductIds.has(item.productId?.toString())
          );
        } else {
          // If no specific items listed, show all items
          sellerItems = order.items;
        }
      }
      
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
    }).filter(order => order.items.length > 0);
    
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
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Update order status
    if (status) {
      order.status = status;
      if (status === 'delivered') {
        order.actualDeliveryTime = new Date();
        // Set 24-hour hold period
        const holdUntil = new Date();
        holdUntil.setHours(holdUntil.getHours() + 24);
        order.payoutHoldUntil = holdUntil;
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
      if (status === 'processing') sellerAssignment.status = 'accepted';
      if (status === 'delivered') sellerAssignment.status = 'completed';
      if (status === 'accepted') sellerAssignment.acceptedAt = new Date();
      if (status === 'delivered') sellerAssignment.completedAt = new Date();
    }
    
    await order.save();
    
    // Update seller performance
    if (status === 'delivered') {
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
