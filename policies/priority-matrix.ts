import { TicketCategory, TicketImpact, TicketPriority, TicketUrgency, MultiTargetSLA } from '@/lib/database/types';

export interface PriorityEvaluationResult {
  priority: TicketPriority;
  slaHours: number;
  slaDueDate: string;
  assignedTeam: string;
  rationale: string;
  multiTargetSLA: MultiTargetSLA;
}

/**
 * Deterministic ITIL-compliant Impact x Urgency Priority Matrix
 * Incorporates multi-target SLAs (Ack, Assignment, Restoration, Resolution)
 * Ensures reproducible, auditable priority assignment independent of LLM variance.
 */
export function evaluatePriorityMatrix(
  impact: TicketImpact,
  urgency: TicketUrgency,
  category: TicketCategory,
  titleAndDesc = ''
): PriorityEvaluationResult {
  let priority: TicketPriority = 'P3';

  // Deterministic Matrix
  if (impact === 'CRITICAL' && urgency === 'CRITICAL') {
    priority = 'P1';
  } else if (impact === 'CRITICAL' || urgency === 'CRITICAL') {
    priority = (impact === 'HIGH' || urgency === 'HIGH') ? 'P1' : 'P2';
  } else if (impact === 'HIGH' && urgency === 'HIGH') {
    priority = 'P2';
  } else if (impact === 'HIGH' || urgency === 'HIGH') {
    priority = 'P2';
  } else if (impact === 'MEDIUM' && urgency === 'MEDIUM') {
    priority = 'P3';
  } else if (impact === 'LOW' && urgency === 'LOW') {
    priority = 'P4';
  } else {
    priority = 'P3';
  }

  // Multi-target SLA Maps
  const ackSlaMinutesMap: Record<TicketPriority, number> = {
    P1: 15,   // 15 mins
    P2: 30,   // 30 mins
    P3: 120,  // 2 hours
    P4: 240,  // 4 hours
  };

  const assignmentSlaMinutesMap: Record<TicketPriority, number> = {
    P1: 15,
    P2: 60,
    P3: 240,
    P4: 480,
  };

  const restorationSlaHoursMap: Record<TicketPriority, number> = {
    P1: 2,    // 2 hours service restoration
    P2: 6,    // 6 hours
    P3: 24,   // 24 hours
    P4: 48,   // 48 hours
  };

  const resolutionSlaHoursMap: Record<TicketPriority, number> = {
    P1: 4,   // 4 hours SLA for critical outages
    P2: 24,  // 24 hours SLA for high impact
    P3: 48,  // 48 hours SLA for normal standard incidents
    P4: 72,  // 72 hours SLA for low priority / general requests
  };

  const now = Date.now();
  const slaHours = resolutionSlaHoursMap[priority];
  const slaDueDate = new Date(now + slaHours * 3600000).toISOString();

  const multiTargetSLA: MultiTargetSLA = {
    ack_sla_minutes: ackSlaMinutesMap[priority],
    assignment_sla_minutes: assignmentSlaMinutesMap[priority],
    restoration_sla_hours: restorationSlaHoursMap[priority],
    resolution_sla_hours: slaHours,
    ack_due_at: new Date(now + ackSlaMinutesMap[priority] * 60000).toISOString(),
    assigned_due_at: new Date(now + assignmentSlaMinutesMap[priority] * 60000).toISOString(),
    restoration_due_at: new Date(now + restorationSlaHoursMap[priority] * 3600000).toISOString(),
    resolution_due_at: slaDueDate,
    ack_status: 'PENDING',
    resolution_status: 'PENDING',
  };

  // Intelligent and deterministic team routing based on IT service taxonomy
  let assignedTeam = 'End User Computing';
  const text = titleAndDesc.toLowerCase();

  if (category === 'VPN' || category === 'Network') {
    if (priority === 'P1' || text.includes('switch') || text.includes('datacenter') || text.includes('router') || text.includes('bgp')) {
      assignedTeam = 'Infrastructure Ops';
    } else {
      assignedTeam = 'Network Support';
    }
  } else if (category === 'ERP and SAP') {
    assignedTeam = 'Enterprise Applications';
  } else if (category === 'Password and account support') {
    assignedTeam = 'Identity Services';
  } else if (category === 'Access requests') {
    assignedTeam = 'Identity Services';
  } else if (category === 'Hardware') {
    assignedTeam = 'End User Computing';
  } else if (category === 'Email and Microsoft 365') {
    assignedTeam = 'End User Computing';
  } else if (category === 'Software') {
    if (text.includes('sap') || text.includes('workday') || text.includes('salesforce') || text.includes('snowflake')) {
      assignedTeam = 'Enterprise Applications';
    } else {
      assignedTeam = 'End User Computing';
    }
  } else if (category === 'Other IT incidents') {
    if (text.includes('phish') || text.includes('malware') || text.includes('breach') || text.includes('suspicious') || text.includes('security')) {
      assignedTeam = 'Cybersecurity SOC';
    } else {
      assignedTeam = 'End User Computing';
    }
  }

  return {
    priority,
    slaHours,
    slaDueDate,
    assignedTeam,
    multiTargetSLA,
    rationale: `Impact [${impact}] x Urgency [${urgency}] evaluated to [${priority}] (Ack: ${ackSlaMinutesMap[priority]}m, Resolve: ${slaHours}h). Routed to [${assignedTeam}].`,
  };
}
