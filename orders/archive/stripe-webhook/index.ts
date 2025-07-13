// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe?target=deno";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY')!, { apiVersion: '2024-04-10' });

async function verifyStripeSignature(req: Request): Promise<any | null> {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !STRIPE_WEBHOOK_SECRET) return null;

  // Read the raw body as Uint8Array
  const body = await req.arrayBuffer();
  try {
    // Use Stripe library to verify and construct the event
    const event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    return event;
  } catch (_err) {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 1. Verify Stripe signature
    const event = await verifyStripeSignature(req);
    if (!event) {
      return new Response('Invalid Stripe signature', { status: 400 });
    }

    // 2. Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'Customer';
      const paymentStatus = session.payment_status;

      if (!orderId || !customerEmail) {
        return new Response('Missing orderId or customer email', { status: 400 });
      }

      // Only fulfill if payment_status is 'paid'
      if (paymentStatus !== 'paid') {
        return new Response('Payment not completed', { status: 200 });
      }

      // Fetch order details
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();
      if (error || !order) {
        return new Response('Order not found', { status: 404 });
      }

      // Idempotency: Only process if not already paid
      if (order.status === 'paid') {
        return new Response(JSON.stringify({ received: true, idempotent: true }), { status: 200 });
      }

      // Update order status to 'paid'
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('order_id', orderId);
      if (updateError) {
        return new Response('Failed to update order status', { status: 500 });
      }

      // Get public URL for flag image
      const { data: publicUrlData } = supabase.storage
        .from('flags')
        .getPublicUrl(`${orderId}.png`);
      const imageUrl = publicUrlData?.publicUrl;

      // Send confirmation email to customer
      const confirmationHtml = `
        <!DOCTYPE html>
        <html><body>
        <h2>Thank you for your order!</h2>
        <p>Hi ${customerName},</p>
        <p>Your order <b>#${orderId}</b> has been received and is being processed.</p>
        <p>We will notify you when your flag is shipped.</p>
        <hr>
        <p>If you have any questions, reply to this email or contact us at <a href='mailto:orders@flagfusion.ca'>orders@flagfusion.ca</a>.</p>
        <p>FlagFusion Team</p>
        </body></html>
      `;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FlagFusion <noreply@orders.flagfusion.ca>',
          to: customerEmail,
          subject: `Your FlagFusion Order Confirmation (#${orderId})`,
          html: confirmationHtml,
        })
      });

      // Send order details to operations
      const operationsHtml = `
        <!DOCTYPE html>
        <html><body>
        <h2>New Order Received</h2>
        <p>Order ID: <b>${orderId}</b></p>
        <p>Customer: ${customerName} (${customerEmail})</p>
        <p>Order Details: ${JSON.stringify(order)}</p>
        <p>Flag Image: <a href='${imageUrl}' target='_blank'>View Flag Image</a></p>
        <p><img src='${imageUrl}' alt='Flag Image' style='max-width:320px;border-radius:8px;margin-top:8px;'></p>
        <hr>
        <p>Check Supabase for the flag image and further details.</p>
        <p>FlagFusion Operations</p>
        </body></html>
      `;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FlagFusion <noreply@orders.flagfusion.ca>',
          to: ADMIN_EMAIL,
          subject: `New FlagFusion Order: ${orderId}`,
          html: operationsHtml,
        })
      });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    console.error('Error processing Stripe webhook:', e);
    return new Response('Invalid request', { status: 400 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer <local_token>' \
    --header 'Content-Type: application/json' \
    --data '{"type":"checkout.session.completed","data":{"object":{"metadata":{"orderId":"test-order-123"},"customer_details":{"email":"customer@example.com","name":"Test Customer"}}}}'

*/
