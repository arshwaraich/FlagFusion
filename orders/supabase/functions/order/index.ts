// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe?target=deno';
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { OrderStatus } from '../_shared/enum.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const stripe = Stripe(STRIPE_SECRET_KEY);

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return withCorsHeaders('ok')
  }

  // Handle only POST requests
  if (req.method !== 'POST') {
    return withCorsHeaders('Method Not Allowed', { status: 405 });
  }
  try {
    const { png } = await req.json();
    if (!png) {
      return withCorsHeaders('Missing png', { status: 400 });
    }

    // Generate a unique order ID (UUID v4)
    const orderId = crypto.randomUUID();

    // 1. Store PNG in Supabase Storage first
    const base64Data = png.replace(/^data:image\/png;base64,/, '');
    const binary = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const { error: storageError } = await supabase.storage.from('flags').upload(`${orderId}.png`, binary, { contentType: 'image/png', upsert: true });
    if (storageError) {
      console.error('Error uploading image:', storageError);
      return withCorsHeaders('Failed to store order', { status: 500 });
    }

    // 2. Generate public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage.from('flags').getPublicUrl(`${orderId}.png`);
    const imageUrl = publicUrlData?.publicUrl;

    // 3. Store order in Supabase (orders table) with image URL
    const { error: orderError } = await supabase.from('orders').insert({ order_id: orderId, status: OrderStatus.Pending, created_at: new Date().toISOString(), image_url: imageUrl });
    if (orderError) {
      console.error('Error storing order:', orderError);
      return withCorsHeaders('Failed to store order', { status: 500 });
    }

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Custom Flag Print Order',
              images: imageUrl ? [imageUrl] : undefined,
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: [
          'US', 'CA', 'GB', 'FR', 'DE', 'AU', 'NZ', 'JP', 'CN', 'KR',
          'IN', 'MX', 'BR', 'ZA', 'IT', 'ES', 'SE', 'NO', 'FI', 'NL',
          'BE', 'CH', 'AT', 'IE', 'PT', 'PL', 'CZ', 'DK', 'SG', 'MY',
          'HK', 'TW', 'TH', 'PH', 'ID', 'VN', 'AE', 'SA', 'IL', 'TR',
          'AR', 'CL', 'CO', 'PE', 'GR', 'HU', 'RO', 'SK', 'BG', 'LU',
          'MT', 'HR', 'CY'
        ]
      },
      metadata: {
        order_id: orderId,
      },
      success_url: 'https://flagfusion.ca/success',
      cancel_url: 'https://flagfusion.ca/failure',
      custom_text: {
      after_submit: {
        message: 'orders@flagfusion.ca',
      }
    },
    });

    return withCorsHeaders(JSON.stringify({ success: true, url: session.url }), { status: 200 });
  } catch (e) {
    console.error('Unexpected error:', e);
    return withCorsHeaders('Invalid request', { status: 400 });
  }
})

function withCorsHeaders(body: BodyInit | null, init: ResponseInit = {}) {
  return new Response(body, {
    ...init,
    headers: { ...corsHeaders, ...(init.headers || {}) },
  });
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/order' \
    --header 'Authorization: Bearer <local_token>' \
    --header 'Content-Type: application/json' \
    --data '{"png":"data:image/png;base64,<base64-encoded-png>"}'

*/
