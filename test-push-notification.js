// Test Push Notification Script
// Run: node test-push-notification.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (use your service account key)
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with your FCM token from the app logs
const FCM_TOKEN = 'YOUR_FCM_TOKEN_HERE';

async function sendTestNotification() {
  try {
    const message = {
      notification: {
        title: '🎉 Test Order Confirmed',
        body: 'Your order #12345 has been confirmed and will be delivered soon!'
      },
      data: {
        orderId: '12345',
        type: 'order_confirmed'
      },
      token: FCM_TOKEN
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

sendTestNotification();
