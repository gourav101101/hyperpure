import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    if (!userId || !userType) {
      return NextResponse.json({ error: 'User ID and type required' }, { status: 400 });
    }
    
    const query: any = { userId, userType };
    if (unreadOnly) query.isRead = false;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    const unreadCount = await Notification.countDocuments({ userId, userType, isRead: false });
    
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const notification = await Notification.create(body);
    
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, isRead, markAllRead, userId, userType } = await req.json();
    
    if (markAllRead && userId && userType) {
      await Notification.updateMany(
        { userId, userType, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return NextResponse.json({ success: true });
    }
    
    if (id) {
      await Notification.findByIdAndUpdate(id, { 
        isRead, 
        readAt: isRead ? new Date() : null 
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
