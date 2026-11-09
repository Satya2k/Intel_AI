import { db } from '@/lib/database/db-client';
import { runKnowledgeAgent } from '@/agents/knowledge/knowledge-agent';
import { processTicketCreationAgent } from '@/agents/ticket/ticket-agent';
import { runIAMAgent } from '@/agents/iam/iam-agent';
import { recordAuditLog } from '@/tools/audit-tools';

export interface SupervisorTurnResponse {
  responseText: string;
  intent: 'TROUBLESHOOTING' | 'ACCESS_REQUEST' | 'TICKET_CREATION' | 'STATUS_CHECK' | 'SECURITY_BLOCKED' | 'GENERAL';
  ticket?: Record<string, unknown>;
  accessRequest?: Record<string, unknown>;
  knowledgeDocument?: Record<string, unknown>;
  suggestedActions?: { label: string; action: string }[];
}

/**
 * Supervisor / Orchestrator Agent
 * Routes employee messages, coordinates worker agents, enforces policy boundaries.
 */
export async function runSupervisorAgent(
  employeeId: string,
  userMessage: string,
  conversationId?: string
): Promise<SupervisorTurnResponse> {
  const correlationId = `CORR-SUP-${Date.now()}`;
  const profile = await db.getProfile(employeeId);
  const employeeName = profile?.full_name || 'Employee';

  const lower = userMessage.toLowerCase().trim();

  // Guardrail 1: Detect and neutralize prompt injections / jailbreak attempts
  if (
    lower.includes('ignore previous instructions') ||
    lower.includes('bypass approval') ||
    lower.includes('grant me root') ||
    lower.includes('act as admin without permission') ||
    lower.includes('reveal secret key') ||
    lower.includes('system prompt')
  ) {
    await recordAuditLog({
      actor_id: employeeId,
      actor_type: 'USER',
      action: 'PROMPT_INJECTION_DEFENSE_TRIGGERED',
      entity_type: 'SECURITY_GATEWAY',
      entity_id: 'SUPERVISOR',
      outcome: 'FLAGGED',
      reason: `Blocked prompt injection pattern in employee input: "${userMessage.substring(0, 80)}"`,
      correlation_id: correlationId,
    });

    return {
      responseText: `🛡️ **Security Policy Alert**: Your request contained unauthorized override instructions. 

In accordance with Northstar Technologies Cybersecurity Policy SEC-04, all permission changes require authenticated role validation and multi-stage human approval. The AI agent cannot bypass approval gates or elevate privileges. This event has been logged for security audit.`,
      intent: 'SECURITY_BLOCKED',
      suggestedActions: [
        { label: 'Submit Standard Ticket', action: 'CREATE_TICKET' },
        { label: 'Browse Approved Knowledge Base', action: 'VIEW_KB' },
      ],
    };
  }

  // Guardrail 2: Detect conversational offboarding/deprovisioning claims
  if (
    (lower.includes('i quit') || lower.includes('terminate my account') || lower.includes('i resigned') || lower.includes('delete employee')) &&
    !lower.includes('how to')
  ) {
    await recordAuditLog({
      actor_id: employeeId,
      actor_type: 'USER',
      action: 'CONVERSATIONAL_EXIT_CLAIM_INTERCEPTED',
      entity_type: 'EMPLOYEE_LIFECYCLE',
      entity_id: employeeId,
      outcome: 'DENIED',
      reason: 'Rejected conversational deprovisioning instruction. Requires verified HR event.',
      correlation_id: correlationId,
    });

    return {
      responseText: `⚠️ **Policy Notice**: Account deprovisioning and termination workflows cannot be triggered through chat messages. 

Offboarding and entitlement revocations must originate exclusively through verified Human Resources lifecycle feeds (e.g. Workday HRMS departure events). If you are leaving the company, please contact your HR Business Partner (${profile?.department || 'People Ops'}).`,
      intent: 'SECURITY_BLOCKED',
    };
  }

  // Intent 1: Access Request
  if (
    lower.startsWith('request access') || 
    lower.includes('need access to') || 
    lower.includes('give me permission') || 
    lower.includes('grant access') ||
    lower.includes('license for') ||
    lower.includes('superuser')
  ) {
    const iamResult = await runIAMAgent(employeeId, userMessage, correlationId);
    return {
      responseText: iamResult.message,
      intent: 'ACCESS_REQUEST',
      accessRequest: iamResult.details,
      suggestedActions: [
        { label: 'View My Access Requests', action: 'NAVIGATE_REQUESTS' },
        { label: 'Check Manager Approval Status', action: 'VIEW_APPROVALS' }
      ]
    };
  }

  // Intent 2: Explicit Ticket Creation request
  if (lower.startsWith('create ticket') || lower.startsWith('open ticket') || lower.includes('escalate to ticket')) {
    const title = userMessage.replace(/(create ticket|open ticket|open a ticket|escalate to ticket)/i, '').trim() || 'IT Incident Report';
    const ticketResult = await processTicketCreationAgent(employeeId, title, userMessage, correlationId);

    if (ticketResult.status === 'NEEDS_INFO') {
      return {
        responseText: `ℹ️ ${ticketResult.message}`,
        intent: 'TICKET_CREATION',
      };
    }

    const t = ticketResult.ticket!;
    return {
      responseText: `### 🎫 IT Support Ticket Created: [${t.ticket_id}]
- **Title**: ${t.title}
- **Category**: \`${t.category}\`
- **Evaluated Priority**: \`${t.priority}\` (SLA: ${t.priority === 'P1' ? '4 hours' : t.priority === 'P2' ? '24 hours' : '48 hours'})
- **Assigned Team**: **${t.assigned_team}**
- **Status**: \`${t.status}\`

Your incident has been logged and queued in the IT Service Desk Console. A technician will contact you shortly.`,
      intent: 'TICKET_CREATION',
      ticket: (t as unknown) as Record<string, unknown>,
      suggestedActions: [
        { label: 'View Ticket Queue', action: 'NAVIGATE_TICKETS' },
        { label: 'Report Additional Details', action: 'ADD_NOTE' }
      ]
    };
  }

  // Intent 3: IT Troubleshooting Query (Knowledge Agent / RAG)
  const kbResult = await runKnowledgeAgent(userMessage);

  return {
    responseText: kbResult.answer,
    intent: 'TROUBLESHOOTING',
    knowledgeDocument: kbResult.retrieval.topDocument ? (kbResult.retrieval.topDocument as unknown as Record<string, unknown>) : undefined,
    suggestedActions: [
      { label: '✅ Solution Worked', action: 'CONFIRM_RESOLVED' },
      { label: '❌ Did Not Work - Create Ticket', action: `CREATE_TICKET_FOR:${userMessage.substring(0, 50)}` },
    ]
  };
}
