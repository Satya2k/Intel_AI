import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actor_id = searchParams.get('actor_id') || undefined;
    const entity_type = searchParams.get('entity_type') || undefined;
    const correlation_id = searchParams.get('correlation_id') || undefined;

    const logs = await db.getAuditLogs({ actor_id, entity_type, correlation_id });
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

