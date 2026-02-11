# Google Authentication Setup Guide

## 1. Get Google OAuth Credentials

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one

### Step 2: Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## 2. Update Environment Variables

Add to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Generate NEXTAUTH_SECRET:
Run this command in terminal:
```bash
openssl rand -base64 32
```

## 3. What Was Implemented

### Backend (`app/api/auth/[...nextauth]/route.ts`)
- ✅ Added GoogleProvider
- ✅ Auto-creates user in database on first Google login
- ✅ Stores: email, name, role (buyer by default)

### Frontend (`app/components/LoginModal.tsx`)
- ✅ Added "Continue with Google" button
- ✅ Google logo with brand colors
- ✅ Divider between Google and phone login
- ✅ Maintains existing OTP flow

## 4. User Flow

### Google Sign-In:
1. User clicks "Continue with Google"
2. Redirected to Google login
3. User authorizes app
4. Redirected back to app
5. User auto-created in database (if new)
6. User logged in

### Phone OTP (Existing):
1. User enters phone number
2. Receives OTP
3. Verifies OTP
4. Logged in

## 5. Database Schema

User model supports both methods:
```typescript
{
  email: string,      // From Google
  name: string,       // From Google
  phone: string,      // From OTP (optional)
  password: string,   // For credentials (optional)
  role: "buyer"       // Default role
}
```

## 6. Testing

### Development:
1. Set `NEXTAUTH_URL=http://localhost:3000`
2. Add `http://localhost:3000/api/auth/callback/google` to Google Console
3. Run `npm run dev`
4. Click "Continue with Google"

### Production:
1. Set `NEXTAUTH_URL=https://yourdomain.com`
2. Add `https://yourdomain.com/api/auth/callback/google` to Google Console
3. Deploy and test

## 7. Future: SMS OTP

When you get SMS access, the phone OTP will work automatically. Current setup:
- ✅ Phone login UI ready
- ✅ OTP API endpoints exist
- ⏳ SMS provider needed (Twilio, AWS SNS, etc.)

## Notes
- Google login creates users with empty phone field
- Phone OTP creates users with email optional
- Both methods work independently
- Users can have both Google + phone linked to same account (by email)
