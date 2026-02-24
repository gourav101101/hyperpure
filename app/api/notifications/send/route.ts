import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Seller from '@/models/Seller';

// Guest tokens model
const GuestTokenSchema = new (require('mongoose')).Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 2592000 }
});
const GuestToken = require('mongoose').models.GuestToken || require('mongoose').model('GuestToken', GuestTokenSchema);

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userType, userId, phoneNumber, email, type, title, message, orderId } = await req.json();

    await connectDB();

    let tokens: string[] = [];

    if (userType === 'admin') {
      // For admin, get all admin users' tokens
      const adminUsers = await User.find({ role: 'admin' });
      tokens = adminUsers.flatMap(user => user.fcmTokens || []);
    } else if (userType === 'seller') {
      // Find seller by ID or phone
      let seller;
      if (userId) {
        seller = await Seller.findById(userId);
      } else if (phoneNumber) {
        seller = await Seller.findOne({ phone: phoneNumber });
      }
      tokens = seller?.fcmTokens || [];
    } else {
      // Find user by ID, phone, or email
      let user;
      if (userId) {
        user = await User.findById(userId);
        console.log(`🔍 Found user by ID: ${user ? 'Yes' : 'No'}`);
      } else if (phoneNumber) {
        user = await User.findOne({ phoneNumber });
        console.log(`🔍 Found user by phone: ${user ? 'Yes' : 'No'}`);
      } else if (email) {
        user = await User.findOne({ email });
        console.log(`🔍 Found user by email: ${user ? 'Yes' : 'No'}`);
      }
      
      if (user) {
        tokens = user.fcmTokens || [];
        console.log(`📱 User FCM tokens: ${tokens.length}`);
      }
      
      // If no specific user found, send to all guest tokens
      if (tokens.length === 0) {
        console.log('🔍 No user tokens, checking guest tokens...');
        const guestTokens = await GuestToken.find({});
        tokens = guestTokens.map(gt => gt.token);
        console.log(`👥 Guest tokens found: ${tokens.length}`);
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No FCM tokens found' });
    }

    // Send FCM notifications
    const messaging = admin.messaging();
    const results = await Promise.allSettled(
      tokens.map(token =>
        messaging.send({
          token,
          notification: {
            title,
            body: message,
          },
          data: {
            type,
            orderId: orderId || '',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
          android: {
            notification: {
              channelId: 'hyperpure_channel',
              priority: 'high',
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        })
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`📱 FCM notifications sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({ 
      success: true, 
      sent: successful, 
      failed,
      totalTokens: tokens.length 
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}