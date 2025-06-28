// Supabase Edge Function: order
// Receives orderId and PNG image, stores in Supabase, and notifies admin via email (Resend)
// POST /orders/order

import { serve } from 'std/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const { orderId, png } = await req.json();
    if (!orderId || !png) {
      return new Response('Missing orderId or png', { status: 400 });
    }
    // 1. Store order in Supabase (orders table)
    const { error: orderError } = await supabase.from('orders').insert({ order_id: orderId, status: 'pending', created_at: new Date().toISOString() });
    if (orderError) {
      return new Response('Failed to store order', { status: 500 });
    }
    // 2. Store PNG in Supabase Storage
    const base64Data = png.replace(/^data:image\/png;base64,/, '');
    const binary = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const { error: storageError } = await supabase.storage.from('flags').upload(`${orderId}.png`, binary, { contentType: 'image/png', upsert: true });
    if (storageError) {
      return new Response('Failed to upload image', { status: 500 });
    }
    // Generate public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage.from('flags').getPublicUrl(`${orderId}.png`);
    const imageUrl = publicUrlData?.publicUrl;
    // 3. Send email to admin (Resend)
    const emailHtml = `<!DOCTYPE html><html><body><h2>New Order Received</h2><p>Order ID: <b>${orderId}</b></p><p>Check Supabase for the flag image and further details.</p><p>Flag Image: <a href='${imageUrl}' target='_blank'>View Flag Image</a></p><p><img src='${imageUrl}' alt='Flag Image' style='max-width:320px;border-radius:8px;margin-top:8px;'></p><p>FlagFusion Operations</p></body></html>`;
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FlagFusion <orders@flagfusion.ca>',
        to: ADMIN_EMAIL,
        subject: `New FlagFusion Order: ${orderId}`,
        html: emailHtml,
      })
    });
    if (!emailRes.ok) {
      return new Response('Failed to send admin email', { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response('Invalid request', { status: 400 });
  }
});
