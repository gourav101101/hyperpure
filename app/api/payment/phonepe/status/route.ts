import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const merchantTransactionId = req.nextUrl.searchParams.get('txnId');

    if (!merchantTransactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    const signature = crypto
      .createHash('sha256')
      .update(`/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${merchantTransactionId}` + process.env.PHONEPE_SALT_KEY)
      .digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;

    const response = await fetch(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': signature,
          'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID!
        }
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('PhonePe status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
