import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const admin = getAdminClient();

    if (eventType === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        await admin
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            razorpay_payment_id: paymentEntity.id,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpayOrderId);
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        await admin
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpayOrderId);
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
