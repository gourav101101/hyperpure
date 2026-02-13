import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, userId, phone } = await req.json();

    const merchantTransactionId = `TXN_${Date.now()}`;
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: orderId,
      amount: Math.round(amount * 100),
      redirectUrl: `${process.env.NEXTAUTH_URL}/api/payment/phonepe/callback`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/phonepe/callback`,
      mobileNumber: phone,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHash('sha256')
      .update(base64Payload + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY)
      .digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;

    const response = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': signature
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        paymentUrl: data.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId
      });
    } else {
      return NextResponse.json({ error: 'Payment initiation failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('PhonePe initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
