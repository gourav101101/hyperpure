import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';

export async function GET() {
  try {
    await dbConnect();
    let commission = await Commission.findOne({ isActive: true });
    
    if (!commission) {
      commission = await Commission.create({
        commissionRate: 10,
        deliveryFee: 30,
        isActive: true
      });
    }
    
    return NextResponse.json(commission);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commission' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Extract only the fields we want to update
    const updateData = {
      commissionRate: body.commissionRate,
      deliveryFee: body.deliveryFee,
      useTierCommission: body.useTierCommission !== undefined ? body.useTierCommission : false,
      isActive: body.isActive !== undefined ? body.isActive : true
    };
    
    let commission = await Commission.findOne({ isActive: true });
    
    if (!commission) {
      commission = await Commission.create(updateData);
    } else {
      commission.commissionRate = updateData.commissionRate;
      commission.deliveryFee = updateData.deliveryFee;
      commission.useTierCommission = updateData.useTierCommission;
      commission.isActive = updateData.isActive;
      await commission.save();
    }
    
    return NextResponse.json({ success: true, commission });
  } catch (error) {
    console.error('Commission update error:', error);
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 });
  }
}
