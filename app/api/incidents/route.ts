import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = await db.getMajorIncidents();
    return NextResponse.json({ success: true, incidents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch major incidents';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.createMajorIncident(body);
    return NextResponse.json({ success: true, incident: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create major incident';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, author, message, status } = body;
    if (!incidentId || !message) {
      return NextResponse.json({ success: false, error: 'incidentId and message required' }, { status: 400 });
    }

    const updated = await db.addMajorIncidentUpdate(incidentId, {
      author: author || 'Incident Commander',
      message,
      status: status || 'INVESTIGATING',
    });

    return NextResponse.json({ success: true, incident: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update major incident';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
