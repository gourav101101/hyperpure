import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { initSocket } from '@/lib/socket';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, userType, title, message, type } = await req.json();
    
    if (!userId || !userType) {
      return NextResponse.json({ error: 'userId and userType required' }, { status: 400 });
    }

    const notification = await Notification.create({
      userId,
      userType,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      type: type || 'system',
      isRead: false
    });

    // Emit via socket
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: `${userType}-${userId}`,
          event: 'notification',
          data: notification
        })
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
