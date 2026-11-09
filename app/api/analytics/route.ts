import { NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export async function GET() {
  try {
    const summary = await db.getAnalyticsSummary();
    return NextResponse.json({ success: true, analytics: summary });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

