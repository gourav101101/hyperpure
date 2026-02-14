# 🧪 Test Firebase Notifications

## Step 1: Setup Firebase Admin (Backend)

Add to `.env.local`:
```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hyperpuredemo.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
```

Get these from:
- Firebase Console → hyperpuredemo project
- Project Settings → Service Accounts
- Generate new private key

## Step 2: Start Backend

```bash
cd E:\hyperpure
npm run dev
```

## Step 3: Run Flutter App

```bash
cd E:\hyperpureapp
flutter run
```

## Step 4: Get FCM Token from Flutter App

Add this to any screen in your Flutter app:

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

// In your widget:
ElevatedButton(
  onPressed: () async {
    String? token = await FirebaseMessaging.instance.getToken();
    print('FCM Token: $token');
  },
  child: Text('Get Token'),
)
```

Or check Android Logcat for the token.

## Step 5: Test Notification

### Option A: Using HTML Test Page
1. Open: `http://localhost:3000/test-notification.html`
2. Paste your FCM token
3. Click "Send Notification"

### Option B: Using Postman
```
POST http://localhost:3000/api/notifications/test

Body (JSON):
{
  "token": "your_fcm_token_here",
  "title": "Test Notification",
  "body": "Hello from backend!"
}
```

### Option C: Using curl
```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_fcm_token_here",
    "title": "Test",
    "body": "Hello!"
  }'
```

## Expected Results:

✅ **App in Foreground:** Toast notification appears
✅ **App in Background:** System notification appears
✅ **App Closed:** System notification appears

## Troubleshooting:

**No token?**
- Check Firebase is initialized in main.dart
- Check google-services.json is in android/app/

**Notification not received?**
- Check Firebase Admin credentials in .env.local
- Check token is correct (not expired)
- Check internet connection on phone

**Error sending?**
- Check backend is running on port 3000
- Check Firebase Admin SDK is configured
- Check error message in response
