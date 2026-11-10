import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { emailService } from '@/lib/email/email-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const entityType = searchParams.get('entityType') || undefined;

    const items = await db.getOutboxItems({ status, entityType });
    const allItems = await db.getOutboxItems();

    const stats = {
      total: allItems.length,
      queued: allItems.filter(i => i.delivery_status === 'QUEUED').length,
      sent: allItems.filter(i => i.delivery_status === 'SENT').length,
      failed: allItems.filter(i => i.delivery_status === 'FAILED').length,
      logged_console: allItems.filter(i => i.delivery_status === 'LOGGED_CONSOLE').length,
      mode: emailService.getMode(),
    };

    return NextResponse.json({
      success: true,
      stats,
      items,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch outbox';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await emailService.processOutbox();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process outbox';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
