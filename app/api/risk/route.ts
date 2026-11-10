import { NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await db.getRiskIntelligenceReport();
    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate risk report';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
