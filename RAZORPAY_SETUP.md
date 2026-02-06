# Razorpay Payment Integration Setup

## Step 1: Get Razorpay API Keys

1. Go to https://razorpay.com/
2. Sign up or log in to your account
3. Go to **Settings** → **API Keys**
4. Click on **Generate Test Key** (for testing) or **Generate Live Key** (for production)
5. You will get:
   - **Key ID** (starts with `rzp_test_` for test mode)
   - **Key Secret** (keep this secret!)

## Step 2: Add Keys to .env.local

Open `e:\hyperpure\.env.local` and replace the placeholders:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890abcd
```

## Step 3: Install Razorpay Package

Run this command in your terminal:

```bash
npm install razorpay
```

## Step 4: Restart Development Server

After adding the keys, restart your Next.js server:

```bash
npm run dev
```

## Step 5: Test Payment

1. Go to checkout page
2. Uncheck "Pay on delivery"
3. Click "Pay" button
4. Select any payment method (Card/Netbanking/UPI)
5. Click "Pay and Place Order"
6. Razorpay payment popup will open
7. Use test card details:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date

## Important Notes

- Use **Test Mode** keys for development
- Never commit `.env.local` to git
- For production, use **Live Mode** keys
- Test cards will not charge real money

## Where to Copy Razorpay Data:

**File:** `e:\hyperpure\.env.local`

**Lines to update:**
- Line with `RAZORPAY_KEY_ID=` → Paste your Key ID
- Line with `RAZORPAY_KEY_SECRET=` → Paste your Key Secret  
- Line with `NEXT_PUBLIC_RAZORPAY_KEY_ID=` → Paste your Key ID (same as first)

## Payment Flow:

1. User clicks "Pay" → Creates Razorpay order
2. Razorpay popup opens → User enters payment details
3. Payment successful → Verifies signature
4. Creates order in database → Redirects to confirmation page
