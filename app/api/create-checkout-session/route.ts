import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Mock: return a fake Stripe Checkout URL
  return NextResponse.json({ url: 'https://checkout.stripe.com/pay/mock-session' });
}
