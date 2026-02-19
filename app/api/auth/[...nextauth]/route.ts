/**
 * NextAuth placeholder - disabled for now
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Auth disabled' }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Auth disabled' }, { status: 503 });
}