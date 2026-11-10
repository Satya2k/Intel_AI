import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = await db.getPrivilegedAccounts();
    return NextResponse.json({ success: true, accounts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch privileged accounts';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const elevated = await db.requestPrivilegedElevation(body);
    return NextResponse.json({ success: true, account: elevated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to elevate privilege';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
    }

    const updated = await db.certifyPrivilegedAccount(id, status);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update certification';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
