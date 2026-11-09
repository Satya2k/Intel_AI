import { NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export async function GET() {
  try {
    const applications = await db.getApplications();
    const roles = await db.getRoles();
    const permissions = await db.getRolePermissions();

    return NextResponse.json({
      success: true,
      applications,
      roles,
      permissions,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

