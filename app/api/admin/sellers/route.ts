import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function GET() {
  await dbConnect();
  const sellers = await Seller.find({}).sort({ createdAt: -1 });
  return NextResponse.json(sellers);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, action, reason, adminName } = await req.json();
  
  const updateData: any = {
    verifiedBy: adminName,
    verifiedAt: new Date()
  };
  
  if (action === 'approve') {
    updateData.status = 'approved';
  } else if (action === 'reject') {
    updateData.status = 'rejected';
    updateData.rejectionReason = reason;
  }
  
  const seller = await Seller.findByIdAndUpdate(id, updateData, { new: true });
  return NextResponse.json(seller);
}