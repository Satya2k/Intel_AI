import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { submitAccessRequest } from '@/tools/iam-tools';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get('employee_id') || undefined;
    const status = searchParams.get('status') || undefined;

    const requests = await db.getAccessRequests({ employee_id, status });
    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, permission_id, business_justification, idempotency_key } = body;

    if (!employee_id || !permission_id || !business_justification) {
      return NextResponse.json(
        { error: 'employee_id, permission_id, and business_justification are required.' },
        { status: 400 }
      );
    }

    const result = await submitAccessRequest({
      employee_id,
      permission_id,
      business_justification,
      idempotency_key,
    });

    return NextResponse.json({
      success: true,
      request: result.request,
      rbac: result.rbac,
      isExisting: result.isExisting,
      message: result.message,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

