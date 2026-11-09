import { db } from '@/lib/database/db-client';
import { TicketCategory, TicketImpact, TicketStatus, TicketUrgency } from '@/lib/database/types';
import { evaluatePriorityMatrix } from '@/policies/priority-matrix';
import { recordAuditLog } from './audit-tools';

export interface CreateTicketInput {
  employee_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  impact?: TicketImpact;
  urgency?: TicketUrgency;
  correlation_id?: string;
}

export async function createSupportTicket(input: CreateTicketInput) {
  const impact = input.impact || 'MEDIUM';
  const urgency = input.urgency || 'MEDIUM';

  // Evaluate deterministic priority and team assignment
  const evaluation = evaluatePriorityMatrix(
    impact,
    urgency,
    input.category,
    `${input.title} ${input.description}`
  );

  // Check for potential duplicate tickets submitted by this employee in the last 24 hours
  const recentTickets = await db.getTickets({ employee_id: input.employee_id });
  const potentialDuplicate = recentTickets.find(t => 
    t.status !== 'RESOLVED' && 
    t.status !== 'CLOSED' && 
    t.category === input.category &&
    (t.title.toLowerCase().includes(input.title.toLowerCase()) || input.title.toLowerCase().includes(t.title.toLowerCase()))
  );

  // Persist ticket into database
  const ticket = await db.createTicket({
    employee_id: input.employee_id,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: evaluation.priority,
    impact,
    urgency,
    assigned_team: evaluation.assignedTeam,
    status: 'OPEN',
    sla_due_at: evaluation.slaDueDate,
  });

  // Log audit trail
  await recordAuditLog({
    actor_id: input.employee_id,
    actor_type: 'USER',
    action: 'CREATE_TICKET',
    entity_type: 'TICKET',
    entity_id: ticket.ticket_id,
    outcome: 'SUCCESS',
    reason: `Ticket created with priority ${evaluation.priority} routed to ${evaluation.assignedTeam}`,
    correlation_id: input.correlation_id,
    metadata: {
      category: input.category,
      impact,
      urgency,
      sla_due_at: evaluation.slaDueDate,
      potential_duplicate_id: potentialDuplicate ? potentialDuplicate.ticket_id : null,
    }
  });

  return {
    ticket,
    evaluation,
    potentialDuplicate: potentialDuplicate ? potentialDuplicate.ticket_id : null,
  };
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  actorId: string,
  notes?: string,
  correlationId?: string
) {
  const existing = await db.getTicket(ticketId);
  if (!existing) {
    throw new Error(`Ticket [${ticketId}] not found.`);
  }

  const updated = await db.updateTicket(ticketId, {
    status,
    resolution_notes: notes || existing.resolution_notes,
    assigned_agent: actorId,
  });

  await recordAuditLog({
    actor_id: actorId,
    actor_type: 'USER',
    action: 'UPDATE_TICKET_STATUS',
    entity_type: 'TICKET',
    entity_id: ticketId,
    outcome: 'SUCCESS',
    reason: `Status updated from ${existing.status} to ${status}. Notes: ${notes || 'N/A'}`,
    correlation_id: correlationId,
  });

  return updated;
}

