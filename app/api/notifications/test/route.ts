import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { sellerId } = await req.json();
    
    // Create test notification for seller
    await Notification.create({
      userId: sellerId,
      userType: 'seller',
      type: 'new_order',
      title: 'Test Order Notification',
      message: `Test order #TEST123 received`,
      actionUrl: '/seller/orders',
      priority: 'high'
    });
    
    // Create test notification for admin
    await Notification.create({
      userId: 'admin',
      userType: 'admin',
      type: 'new_order',
      title: 'Test Admin Notification',
      message: `Test order #TEST123 - ₹500`,
      actionUrl: '/admin/dashboard',
      priority: 'high'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
