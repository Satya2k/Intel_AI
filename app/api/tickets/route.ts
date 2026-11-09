import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { createSupportTicket, updateTicketStatus } from '@/tools/ticket-tools';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get('employee_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const tickets = await db.getTickets({
      employee_id,
      status,
      category,
      priority,
    });

    return NextResponse.json({ success: true, count: tickets.length, tickets });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, title, description, category, impact, urgency } = body;

    if (!employee_id || !title || !description || !category) {
      return NextResponse.json(
        { error: 'employee_id, title, description, and category are required.' },
        { status: 400 }
      );
    }

    const result = await createSupportTicket({
      employee_id,
      title,
      description,
      category,
      impact,
      urgency,
    });

    return NextResponse.json({
      success: true,
      ticket: result.ticket,
      evaluation: result.evaluation,
      potentialDuplicate: result.potentialDuplicate,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, status, actor_id, resolution_notes } = body;

    if (!ticket_id || !status || !actor_id) {
      return NextResponse.json(
        { error: 'ticket_id, status, and actor_id are required.' },
        { status: 400 }
      );
    }

    const updated = await updateTicketStatus(
      ticket_id,
      status,
      actor_id,
      resolution_notes
    );

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

