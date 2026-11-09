import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { executeJoinerWorkflow } from '@/workflows/joiner-workflow';
import { executeMoverWorkflow } from '@/workflows/mover-workflow';
import { executeLeaverWorkflow } from '@/workflows/leaver-workflow';

export async function GET() {
  try {
    const events = await db.getLifecycleEvents();
    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: 'event_type is required (JOINER, MOVER, LEAVER).' },
        { status: 400 }
      );
    }

    if (event_type === 'JOINER') {
      const { employee_id, full_name, email, department, designation, manager_id, created_by } = body;
      if (!employee_id || !full_name || !email || !department || !designation) {
        return NextResponse.json(
          { error: 'employee_id, full_name, email, department, designation are required for JOINER.' },
          { status: 400 }
        );
      }
      const result = await executeJoinerWorkflow({
        employee_id,
        full_name,
        email,
        department,
        designation,
        manager_id: manager_id || 'EMP-FIN-001',
        created_by: created_by || 'HR-SIMULATOR',
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (event_type === 'MOVER') {
      const { employee_id, new_department, new_designation, new_manager_id, created_by } = body;
      if (!employee_id || !new_department || !new_designation) {
        return NextResponse.json(
          { error: 'employee_id, new_department, and new_designation are required for MOVER.' },
          { status: 400 }
        );
      }
      const result = await executeMoverWorkflow({
        employee_id,
        new_department,
        new_designation,
        new_manager_id: new_manager_id || 'EMP-OPS-001',
        created_by: created_by || 'HR-SIMULATOR',
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (event_type === 'LEAVER') {
      const { employee_id, exit_reason, created_by, is_verified_hr_event } = body;
      if (!employee_id) {
        return NextResponse.json(
          { error: 'employee_id is required for LEAVER.' },
          { status: 400 }
        );
      }
      const result = await executeLeaverWorkflow({
        employee_id,
        exit_reason: exit_reason || 'Voluntary resignation / exit',
        created_by: created_by || 'HR-OFFBOARDING-SYSTEM',
        is_verified_hr_event: is_verified_hr_event === true,
      });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: `Unsupported event_type: ${event_type}` }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

