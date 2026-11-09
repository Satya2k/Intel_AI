import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { processApprovalDecision } from '@/tools/approval-tools';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const approver_id = searchParams.get('approver_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const request_id = searchParams.get('request_id') || undefined;

    const approvals = await db.getApprovals({ approver_id, status, request_id });

    // Join with full access request and employee profile details for rich UI display
    const enriched = await Promise.all(
      approvals.map(async (appr) => {
        const reqDetail = await db.getAccessRequest(appr.request_id);
        const profile = reqDetail ? await db.getProfile(reqDetail.employee_id) : null;
        const permission = reqDetail ? await db.getRolePermission(reqDetail.permission_id) : null;
        const application = reqDetail ? await db.getApplication(reqDetail.application_id) : null;
        return {
          ...appr,
          request: reqDetail,
          employee: profile,
          permission,
          application,
        };
      })
    );

    return NextResponse.json({ success: true, count: enriched.length, approvals: enriched });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { approval_id, approver_id, decision, comments } = body;

    if (!approval_id || !approver_id || !decision) {
      return NextResponse.json(
        { error: 'approval_id, approver_id, and decision (APPROVED|REJECTED) are required.' },
        { status: 400 }
      );
    }

    const result = await processApprovalDecision({
      approval_id,
      approver_id,
      decision,
      comments,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

