import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contactName, email, phone, company, companyName, message } = body;

    const contactPerson = contactName || name;
    if (!contactPerson || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('wholesale_enquiries')
      .insert({
        name: contactPerson,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        company: companyName || company || null,
        message: message || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('[Wholesale Enquiry Insert Error]', error.message);
      return NextResponse.json({ success: false, error: 'Failed to record enquiry' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your wholesale enquiry has been submitted successfully.',
      enquiryId: data.id,
    });
  } catch (err: any) {
    console.error('[Wholesale Enquiry Error]', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
