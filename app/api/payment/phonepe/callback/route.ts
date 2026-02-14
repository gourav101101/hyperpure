import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { response } = body;

    if (!response) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=invalid_response`);
    }

    const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
    const data = JSON.parse(decodedResponse);

    const xVerify = req.headers.get('X-VERIFY') || req.headers.get('x-verify');
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
      console.error('Payment verification failed:', { xVerify, calculatedHash, success: data.success });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=payment_failed`);
    }
  } catch (error) {
    console.error('PhonePe callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=payment_error`);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Test mode callback
    const { searchParams } = new URL(req.url);
    const isTest = searchParams.get('test');
    const orderId = searchParams.get('orderId');
    const txnId = searchParams.get('txnId');

    if (isTest && orderId) {
      await connectDB();
      
      await Order.findByIdAndUpdate(orderId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        transactionId: txnId,
        paymentDetails: { test: true, message: 'Test payment successful' }
      });

      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/order-confirmation?orderId=${orderId}`);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=invalid_request`);
  } catch (error) {
    console.error('PhonePe test callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/checkout?error=payment_error`);
  }
}
