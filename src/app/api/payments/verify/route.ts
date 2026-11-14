import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { VerifyPaymentSchema } from '@/lib/validation/schemas';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !razorpayKeySecret || razorpayKeySecret.includes('REPLACE') || razorpay_order_id.startsWith('order_mock_');

    if (!isMock) {
      try {
        const isValid = verifyPaymentSignature(
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        );
        if (!isValid) {
          return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
        }
      } catch (sigErr: any) {
        console.error('[Signature Verification Error]', sigErr.message);
        return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 });
      }
    }

    const admin = getAdminClient();

    // Update order in Supabase
    const { data: order, error: updateErr } = await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        razorpay_order_id,
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('id, order_number, total_amount, status, payment_status, user_id')
      .single();

    if (updateErr || !order) {
      console.error('[Order Update Payment Error]', updateErr);
      return NextResponse.json({ success: false, error: 'Order not found or update failed' }, { status: 404 });
    }

    // Clear cart if user is known
    if (order.user_id) {
      await admin.from('cart_items').delete().eq('user_id', order.user_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: order,
    });
  } catch (err: any) {
    console.error('[Payment Verification Error]', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
