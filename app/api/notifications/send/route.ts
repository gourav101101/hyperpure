import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userType, userId, type, title, message, link } = body;

    const notification = await Notification.create({
      userId,
      userType,
      type,
      title,
      message,
      actionUrl: link,
      isRead: false
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
