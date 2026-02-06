import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const query: any = {};
    if (status) query.status = status;
    
    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const campaign = await Campaign.create(body);
    
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, status, stats } = await req.json();
    
    const update: any = {};
    if (status) update.status = status;
    if (stats) {
      if (stats.sent) update.sent = stats.sent;
      if (stats.delivered) update.delivered = stats.delivered;
      if (stats.opened) update.opened = stats.opened;
      if (stats.clicked) update.clicked = stats.clicked;
      if (stats.converted) update.converted = stats.converted;
    }
    
    const campaign = await Campaign.findByIdAndUpdate(id, update, { new: true });
    
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}
