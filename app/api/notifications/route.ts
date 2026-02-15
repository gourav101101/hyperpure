import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Seller from '@/models/Seller';
import admin from 'firebase-admin';

const hasFirebaseCreds = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

if (hasFirebaseCreds && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Firebase admin init failed:', error);
  }
}

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function sendPushToCustomerIds(
  customerIds: string[],
  title: string,
  message: string,
  actionUrl?: string,
  imageUrl?: string
) {
  if (customerIds.length === 0) return;
  if (!admin.apps.length) return;

  try {
    const users = await User.find(
      { _id: { $in: customerIds } },
      { fcmTokens: 1 }
    ).lean();

    const tokenSet = new Set<string>();
    for (const user of users as Array<{ fcmTokens?: string[] }>) {
      for (const token of user.fcmTokens || []) {
        if (token) tokenSet.add(token);
      }
    }

    const tokens = Array.from(tokenSet);
    if (tokens.length === 0) return;

    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title, body: message, imageUrl },
        webpush: {
          fcmOptions: actionUrl ? { link: actionUrl } : undefined,
          notification: imageUrl ? { image: imageUrl } : undefined
        }
      });
    }
  } catch (error) {
    console.error('FCM push send failed:', error);
  }
}

async function sendPushToSellerIds(
  sellerIds: string[],
  title: string,
  message: string,
  actionUrl?: string,
  imageUrl?: string
) {
  if (sellerIds.length === 0) return;
  if (!admin.apps.length) return;

  try {
    const sellers = await Seller.find(
      { _id: { $in: sellerIds } },
      { fcmTokens: 1 }
    ).lean();

    const tokenSet = new Set<string>();
    for (const seller of sellers as Array<{ fcmTokens?: string[] }>) {
      for (const token of seller.fcmTokens || []) {
        if (token) tokenSet.add(token);
      }
    }

    const tokens = Array.from(tokenSet);
    if (tokens.length === 0) return;

    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      await admin.messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title, body: message, imageUrl },
        webpush: {
          fcmOptions: actionUrl ? { link: actionUrl } : undefined,
          notification: imageUrl ? { image: imageUrl } : undefined
        }
      });
    }
  } catch (error) {
    console.error('FCM push send failed (seller):', error);
  }
}

async function emitNotificationEvents(
  entries: Array<{
    userId: string;
    userType: string;
    _id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    imageUrl?: string;
    createdAt?: Date | string;
  }>
) {
  if (entries.length === 0) return;

  try {
    const events = entries.map((entry) => ({
      room: `${entry.userType}-${entry.userId}`,
      event: 'notification',
      data: {
        _id: entry._id,
        type: entry.type,
        title: entry.title,
        message: entry.message,
        actionUrl: entry.actionUrl,
        imageUrl: entry.imageUrl,
        isRead: false,
        createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString()
      }
    }));

    await fetch(`${getBaseUrl()}/api/socket/emit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });
  } catch (error) {
    console.error('Socket emit failed:', error);
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limitParam = searchParams.get('limit');
    
    if (!userId || !userType) {
      return NextResponse.json({ error: 'User ID and type required' }, { status: 400 });
    }
    
    const query: any = { userId, userType };
    if (unreadOnly) query.isRead = false;
    
    let notificationsQuery = Notification.find(query).sort({ createdAt: -1 });
    if (limitParam && limitParam !== 'all') {
      const parsedLimit = Number(limitParam);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        notificationsQuery = notificationsQuery.limit(parsedLimit);
      }
    } else if (!limitParam) {
      notificationsQuery = notificationsQuery.limit(50);
    }

    const notifications = await notificationsQuery.lean();
    
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
    const { userId, userType, broadcast, type, title, message, actionUrl, imageUrl } = body;

    if (!userType || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userType, type, title and message are required' },
        { status: 400 }
      );
    }

    if (broadcast) {
      let recipientIds: string[] = [];

      if (userType === 'customer') {
        const users = await User.find({}, { _id: 1 }).lean();
        recipientIds = users.map((u: any) => String(u._id));
      } else if (userType === 'seller') {
        const sellers = await Seller.find({}, { _id: 1 }).lean();
        recipientIds = sellers.map((s: any) => String(s._id));
      } else if (userType === 'admin') {
        recipientIds = ['admin'];
      } else {
        return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
      }

      if (recipientIds.length === 0) {
        return NextResponse.json({ success: true, createdCount: 0, notifications: [] });
      }

      const docs = recipientIds.map((id) => ({
        userId: id,
        userType,
        type,
        title,
        message,
        actionUrl,
        imageUrl
      }));

      const notifications = await Notification.insertMany(docs);
      await emitNotificationEvents(
        notifications.map((n: any) => ({
          userId: String(n.userId),
          userType: String(n.userType),
          _id: String(n._id),
          type: String(n.type),
          title: String(n.title),
          message: String(n.message),
          actionUrl: n.actionUrl,
          imageUrl: n.imageUrl,
          createdAt: n.createdAt
        }))
      );
      if (userType === 'customer') {
        await sendPushToCustomerIds(recipientIds, title, message, actionUrl, imageUrl);
      } else if (userType === 'seller') {
        await sendPushToSellerIds(recipientIds, title, message, actionUrl, imageUrl);
      }
      return NextResponse.json({ success: true, createdCount: notifications.length, notifications });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required when broadcast is false' }, { status: 400 });
    }

    const notification = await Notification.create({
      userId,
      userType,
      type,
      title,
      message,
      actionUrl,
      imageUrl
    });
    await emitNotificationEvents([
      {
        userId: String(notification.userId),
        userType: String(notification.userType),
        _id: String(notification._id),
        type: String(notification.type),
        title: String(notification.title),
        message: String(notification.message),
        actionUrl: notification.actionUrl,
        imageUrl: notification.imageUrl,
        createdAt: notification.createdAt
      }
    ]);
    if (userType === 'customer') {
      await sendPushToCustomerIds([userId], title, message, actionUrl, imageUrl);
    } else if (userType === 'seller') {
      await sendPushToSellerIds([userId], title, message, actionUrl, imageUrl);
    }
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
