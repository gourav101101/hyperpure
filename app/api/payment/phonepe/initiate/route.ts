import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Test mode - PhonePe Business test credentials require merchant activation
const TEST_MODE = true;

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, userId, phone } = await req.json();

    if (!amount || !orderId || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const merchantTransactionId = `TXN_${Date.now()}`;

    // TEST MODE - Simulate successful payment
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Simulating PhonePe payment');
      return NextResponse.json({
        success: true,
        paymentUrl: `${process.env.NEXTAUTH_URL}/api/payment/phonepe/callback?test=true&orderId=${orderId}&txnId=${merchantTransactionId}`,
        merchantTransactionId
      });
    }

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: orderId,
      amount: Math.round(amount * 100),
      redirectUrl: `${process.env.NEXTAUTH_URL}/api/payment/phonepe/callback`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/phonepe/callback`,
      mobileNumber: phone,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = base64Payload + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const signature = sha256Hash + '###' + process.env.PHONEPE_SALT_INDEX;

    console.log('PhonePe Request:', { 
      merchantTransactionId, 
      amount: payload.amount,
      merchantId: process.env.PHONEPE_MERCHANT_ID 
    });

    // PhonePe Business UAT endpoint
    const response = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': signature
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();
    console.log('PhonePe Response:', data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId
      });
    } else {
      return NextResponse.json({ error: data.message || 'Payment initiation failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('PhonePe initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
