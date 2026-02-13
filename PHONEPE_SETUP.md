# PhonePe Payment Integration

## Configuration

PhonePe credentials are already configured in `.env.local`:

```env
PHONEPE_MERCHANT_ID=M23SV5TIJB7BJ_2602131618
PHONEPE_SALT_KEY=OTgxM2NjMTgtYjRkMC00OWI2LWI5NTctNTI3MzQ0MGZiYTVh
PHONEPE_SALT_INDEX=1
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=M23SV5TIJB7BJ_2602131618
```

## API Endpoints

1. **Initiate Payment**: `/api/payment/phonepe/initiate`
2. **Callback Handler**: `/api/payment/phonepe/callback`
3. **Status Check**: `/api/payment/phonepe/status`

## Testing

1. Go to checkout page
2. Select "PhonePe" as payment method
3. Fill delivery details
4. Click "Place Order"
5. You'll be redirected to PhonePe payment page
6. Complete payment using test credentials

## Environment

Currently using **PhonePe Sandbox** (preprod environment) for testing.

## Payment Flow

1. User selects PhonePe → Initiates payment
2. Redirects to PhonePe payment page
3. User completes payment
4. PhonePe redirects back to callback URL
5. Verifies signature and creates order
6. Redirects to order confirmation page
