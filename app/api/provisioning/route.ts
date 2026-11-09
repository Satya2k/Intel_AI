import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { executeSimulatedProvisioning } from '@/tools/provisioning-tools';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get('employee_id') || undefined;
    const request_id = searchParams.get('request_id') || undefined;

    const events = await db.getProvisioningEvents({ employee_id, request_id });
    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { request_id, actor_id } = body;

    if (!request_id || !actor_id) {
      return NextResponse.json(
        { error: 'request_id and actor_id are required.' },
        { status: 400 }
      );
    }

    const result = await executeSimulatedProvisioning(request_id, actor_id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

