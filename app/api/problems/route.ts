import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const problems = await db.getProblems();
    return NextResponse.json({ success: true, problems });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch problems';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.createProblem(body);
    return NextResponse.json({ success: true, problem: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create problem record';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, ...updates } = body;
    if (!problemId) {
      return NextResponse.json({ success: false, error: 'problemId required' }, { status: 400 });
    }

    const updated = await db.updateProblem(problemId, updates);
    return NextResponse.json({ success: true, problem: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update problem';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
