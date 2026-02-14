import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

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

    // Send FCM notification
    const user = await User.findById(userId);
    if (user?.fcmTokens?.length) {
      await admin.messaging().sendEachForMulticast({
        tokens: user.fcmTokens,
        notification: { title, body: message },
        webpush: link ? { fcmOptions: { link } } : undefined
      });
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
