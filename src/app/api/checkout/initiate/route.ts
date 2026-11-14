import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { InitiateCheckoutSchema } from '@/lib/validation/schemas';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = InitiateCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = getAdminClient();

    // 1. Get items to checkout
    let cartItems: any[] = [];
    if (user) {
      const { data } = await admin
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', user.id);
      cartItems = data || [];
    }

    // If database cart empty, check if items were passed directly in body
    if (cartItems.length === 0 && Array.isArray((body as any).items) && (body as any).items.length > 0) {
      cartItems = (body as any).items.map((it: any) => ({
        product_id: it.productId || it.id,
        quantity: it.quantity || 1,
        products: {
          id: it.productId || it.id,
          name: it.name,
          sku: it.sku,
          base_price: it.unitPrice || it.basePrice || 0,
          images: it.imageUrl ? [it.imageUrl] : [],
        },
      }));
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty' }, { status: 400 });
    }

    // 2. Calculate financial totals server-side
    let subtotal = 0;
    const orderItemsToInsert: any[] = [];

    for (const item of cartItems) {
      const prod = item.products;
      if (!prod) continue;
      const unitPrice = Number(prod.base_price || 0);
      const qty = Number(item.quantity || 1);
      const totalItemPrice = unitPrice * qty;
      subtotal += totalItemPrice;

      const firstImg = Array.isArray(prod.images) && prod.images.length > 0
        ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url)
        : null;

      orderItemsToInsert.push({
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku,
        product_image: firstImg,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalItemPrice,
      });
    }

    // Discount check
    let discountAmount = 0;
    if (parsed.data.couponCode) {
      const { data: coupon } = await admin
        .from('coupons')
        .select('*')
        .eq('code', parsed.data.couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (coupon) {
        if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
          discountAmount = coupon.discount_type === 'percent'
            ? Math.round((subtotal * coupon.discount_value) / 100)
            : coupon.discount_value;
        }
      }
    }

    // Packaging GST (12% standard)
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const gstAmount = Math.round(discountedSubtotal * 0.12 * 100) / 100;
    const shippingCharge = discountedSubtotal >= 5000 ? 0 : 250; // Free above ₹5000
    const totalAmount = Math.round(discountedSubtotal + gstAmount + shippingCharge);

    // 3. Generate Order Number
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const orderNumber = `MB-${dateStr}-${nanoid(6).toUpperCase()}`;

    // 4. Create Razorpay order
    let razorpayOrderId: string | null = null;
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKeyId && razorpayKeySecret && !razorpayKeySecret.includes('REPLACE')) {
      try {
        const rpOrder = await createRazorpayOrder({
          amount: totalAmount * 100, // paise
          currency: 'INR',
          receipt: orderNumber,
        });
        razorpayOrderId = rpOrder.id;
      } catch (rpErr: any) {
        console.warn('[Razorpay Order Creation Fallback]', rpErr.message);
        razorpayOrderId = `order_mock_${Date.now()}`;
      }
    } else {
      razorpayOrderId = `order_mock_${Date.now()}`;
    }

    // 5. Insert order into Supabase
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'razorpay',
        razorpay_order_id: razorpayOrderId,
        subtotal,
        discount_amount: discountAmount,
        shipping_charge: shippingCharge,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        coupon_code: parsed.data.couponCode || null,
        shipping_address: {
          ...parsed.data.shippingAddress,
          contact: parsed.data.contact,
        },
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error('[Order Insert Error]', orderErr);
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }

    // 6. Insert order items
    if (orderItemsToInsert.length > 0) {
      const itemsWithOrderId = orderItemsToInsert.map((item) => ({
        ...item,
        order_id: order.id,
      }));
      await admin.from('order_items').insert(itemsWithOrderId);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        razorpayOrderId,
        amount: totalAmount,
        currency: 'INR',
        razorpayKeyId: razorpayKeyId || 'rzp_test_placeholder',
      },
    });
  } catch (err: any) {
    console.error('[Checkout Initiate Error]', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
