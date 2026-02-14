# Firebase Push Notifications Setup Guide

## ✅ Implementation Complete

All necessary files have been created and configured for Firebase Cloud Messaging (FCM).

## 📋 Next Steps

### 1. Get Firebase VAPID Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hyperpure-506d2`
3. Go to **Project Settings** > **Cloud Messaging** tab
4. Under **Web Push certificates**, generate a new key pair
5. Copy the **Key pair** value

### 2. Get Firebase Admin Credentials
1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Extract these values:
   - `project_id`
   - `client_email`
   - `private_key`

### 3. Update .env.local
Add these variables to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_from_step_1
FIREBASE_PROJECT_ID=hyperpure-506d2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hyperpure-506d2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

### 4. Test Notifications

#### Send a test notification:
```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_id_here',
    userType: 'buyer',
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order has been confirmed!',
    link: '/orders/123'
  })
});
```

## 📁 Files Created/Modified

### Created:
- ✅ `public/firebase-messaging-sw.js` - Service worker for background notifications
- ✅ `hooks/useNotification.ts` - Custom hook for FCM
- ✅ `app/components/NotificationProvider.tsx` - Provider component
- ✅ `app/api/notifications/register/route.ts` - Token registration API

### Modified:
- ✅ `lib/firebase.ts` - Added messaging support
- ✅ `app/api/notifications/send/route.ts` - Added FCM sending
- ✅ `models/User.ts` - Added fcmTokens field
- ✅ `app/layout.tsx` - Added NotificationProvider
- ✅ `.env.example` - Added FCM variables

## 🔔 How It Works

1. **User visits site** → Browser requests notification permission
2. **Permission granted** → FCM token generated and saved to database
3. **Event occurs** → Backend calls `/api/notifications/send`
4. **Notification sent** → User receives push notification (even when tab is closed)

## 🎯 Features

- ✅ Foreground notifications (when app is open)
- ✅ Background notifications (when app is closed)
- ✅ Click actions (redirect to specific pages)
- ✅ Multi-device support (one user, multiple tokens)
- ✅ Toast notifications for foreground messages

## 🚀 Usage Examples

### In your order creation API:
```typescript
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: order.userId,
    userType: 'buyer',
    type: 'order',
    title: 'Order Placed Successfully',
    message: `Order #${order.id} has been placed`,
    link: `/orders/${order.id}`
  })
});
```

### For seller notifications:
```typescript
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    userId: seller.id,
    userType: 'seller',
    type: 'new_order',
    title: 'New Order Received',
    message: 'You have a new order to process',
    link: '/seller/orders'
  })
});
```

## 🔧 Troubleshooting

1. **Notifications not working?**
   - Check browser console for errors
   - Verify VAPID key is correct
   - Ensure service worker is registered (check DevTools > Application > Service Workers)

2. **Background notifications not showing?**
   - Verify `firebase-messaging-sw.js` is in the `public` folder
   - Check that the service worker is active

3. **Token not saving?**
   - Check if user is authenticated
   - Verify MongoDB connection
   - Check browser console for API errors

## 📱 Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (macOS 16.4+, iOS 16.4+)
- ❌ Internet Explorer (not supported)

## 🎉 You're All Set!

Once you add the environment variables, restart your dev server:
```bash
npm run dev
```

Visit your site and grant notification permission when prompted!
