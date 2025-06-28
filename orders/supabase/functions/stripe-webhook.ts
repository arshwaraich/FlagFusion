// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events for payment confirmation
// Sends emails (Resend) and triggers fulfillment (manual/Printful)
// POST /orders/stripe-webhook

import { serve } from 'std/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const PRINTFUL_API_KEY = Deno.env.get('PRINTFUL_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyStripeSignature(req: Request): Promise<any | null> {
  // Placeholder: Stripe signature verification logic
  // In production, use Stripe's official library for Deno or a secure implementation
  // For now, assume event is valid
  return await req.json();
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    // 1. Verify Stripe signature
    const event = await verifyStripeSignature(req);
    if (!event) {
      return new Response('Invalid Stripe signature', { status: 400 });
    }
    // 2. On payment success
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'Customer';
      if (!orderId || !customerEmail) {
        return new Response('Missing orderId or customer email', { status: 400 });
      }
      // Fetch order details from Supabase
      const { data: order, error } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
      if (error || !order) {
        return new Response('Order not found', { status: 404 });
      }
      // Get public URL for flag image
      const { data: publicUrlData } = supabase.storage.from('flags').getPublicUrl(`${orderId}.png`);
      const imageUrl = publicUrlData?.publicUrl;
      // Send confirmation email to customer
      const confirmationHtml = `<!DOCTYPE html><html><body><h2>Thank you for your order!</h2><p>Hi ${customerName},</p><p>Your order <b>#${orderId}</b> has been received and is being processed.</p><p>We will notify you when your flag is shipped.</p><hr><p>If you have any questions, reply to this email or contact us at <a href='mailto:orders@flagfusion.ca'>orders@flagfusion.ca</a>.</p><p>FlagFusion Team</p></body></html>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FlagFusion <orders@flagfusion.ca>',
          to: customerEmail,
          subject: `Your FlagFusion Order Confirmation (#${orderId})`,
          html: confirmationHtml,
        })
      });
      // Send order details to operations
      const operationsHtml = `<!DOCTYPE html><html><body><h2>New Order Received</h2><p>Order ID: <b>${orderId}</b></p><p>Customer: ${customerName} (${customerEmail})</p><p>Order Details: ${JSON.stringify(order)}</p><p>Flag Image: <a href='${imageUrl}' target='_blank'>View Flag Image</a></p><p><img src='${imageUrl}' alt='Flag Image' style='max-width:320px;border-radius:8px;margin-top:8px;'></p><hr><p>Check Supabase for the flag image and further details.</p><p>FlagFusion Operations</p></body></html>`;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FlagFusion <orders@flagfusion.ca>',
          to: ADMIN_EMAIL,
          subject: `New FlagFusion Order: ${orderId}`,
          html: operationsHtml,
        })
      });
      // Fulfillment logic
      // Email admin to place Printful order
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FlagFusion <orders@flagfusion.ca>',
          to: ADMIN_EMAIL,
          subject: `Manual Printful Order Needed: ${orderId}`,
          html: `<p>Please place a manual Printful order for order <b>#${orderId}</b>.</p>`
        })
      });
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    return new Response('Invalid request', { status: 400 });
  }
});
