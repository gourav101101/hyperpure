import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { response } = body;

    const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
    const data = JSON.parse(decodedResponse);

    const xVerify = req.headers.get('X-VERIFY');
    const calculatedHash = crypto
      .createHash('sha256')
      .update(response + process.env.PHONEPE_SALT_KEY)
      .digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;

    if (xVerify === calculatedHash && data.success) {
      await connectDB();
      
      const orderId = data.data.merchantUserId;
      await Order.findByIdAndUpdate(orderId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        transactionId: data.data.merchantTransactionId,
        paymentDetails: data.data
      });

      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/order-confirmation?orderId=${orderId}`);
    } else {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=payment_failed`);
    }
  } catch (error) {
    console.error('PhonePe callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=payment_error`);
  }
}
