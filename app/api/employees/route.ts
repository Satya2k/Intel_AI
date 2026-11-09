import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get('employee_id');

    if (employee_id) {
      const profile = await db.getProfile(employee_id);
      if (!profile) {
        return NextResponse.json({ error: `Employee [${employee_id}] not found` }, { status: 404 });
      }
      const activeAccess = await db.getEmployeeAccess(employee_id);
      const allAccess = await db.getAllEmployeeAccessRecords(employee_id);
      return NextResponse.json({
        success: true,
        profile,
        activeAccess,
        history: allAccess,
      });
    }

    const profiles = await db.getProfiles();
    return NextResponse.json({ success: true, count: profiles.length, profiles });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

