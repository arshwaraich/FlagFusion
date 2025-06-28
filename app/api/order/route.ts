import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Mock: just return success
  return NextResponse.json({ success: true });
}
