import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DeliveryPartner from '@/models/DeliveryPartner';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const available = searchParams.get('available');
    
    const query: any = { isActive: true };
    if (type) query.type = type;
    if (available === 'true') query.isAvailable = true;
    
    const partners = await DeliveryPartner.find(query).sort({ rating: -1 }).lean();
    return NextResponse.json({ partners });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (body.action === 'assign') {
      const { orderId, partnerId } = body;
      
      const order = await Order.findById(orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      
      order.deliveryPartnerId = partnerId;
      order.deliveryStatus = 'assigned';
      await order.save();
      
      await DeliveryPartner.findByIdAndUpdate(partnerId, { isAvailable: false });
      
      return NextResponse.json({ success: true, order });
    }
    
    const partner = await DeliveryPartner.create(body);
    return NextResponse.json({ success: true, partner });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { partnerId, location, status, orderId } = await req.json();
    
    const updates: any = {};
    if (location) updates.currentLocation = { ...location, lastUpdated: new Date() };
    if (status) {
      updates.isAvailable = status === 'available';
      
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { deliveryStatus: status });
        
        if (status === 'delivered') {
          const partner = await DeliveryPartner.findById(partnerId);
          if (partner) {
            partner.completedDeliveries += 1;
            partner.totalDeliveries += 1;
            partner.isAvailable = true;
            await partner.save();
          }
        }
      }
    }
    
    const partner = await DeliveryPartner.findByIdAndUpdate(partnerId, updates, { new: true });
    return NextResponse.json({ success: true, partner });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}
