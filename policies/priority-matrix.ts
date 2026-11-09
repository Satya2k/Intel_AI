import { TicketCategory, TicketImpact, TicketPriority, TicketUrgency } from '@/lib/database/types';

export interface PriorityEvaluationResult {
  priority: TicketPriority;
  slaHours: number;
  slaDueDate: string;
  assignedTeam: string;
  rationale: string;
}

/**
 * Deterministic ITIL-compliant Impact x Urgency Priority Matrix
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

  // SLA Hours mapping
  const slaMap: Record<TicketPriority, number> = {
    P1: 4,   // 4 hours SLA for critical outages
    P2: 24,  // 24 hours SLA for high impact
    P3: 48,  // 48 hours SLA for normal standard incidents
    P4: 72,  // 72 hours SLA for low priority / general requests
  };

  const slaHours = slaMap[priority];
  const slaDueDate = new Date(Date.now() + slaHours * 3600000).toISOString();

  // Intelligent and deterministic team routing based on IT service taxonomy
  let assignedTeam = 'End User Computing';
  const text = titleAndDesc.toLowerCase();

  if (category === 'VPN' || category === 'Network') {
    if (priority === 'P1' || text.includes('switch') || text.includes('datacenter') || text.includes('router')) {
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
    if (text.includes('sap') || text.includes('workday') || text.includes('salesforce')) {
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
    rationale: `Impact [${impact}] x Urgency [${urgency}] evaluated to [${priority}] with ${slaHours}h SLA. Routed to [${assignedTeam}].`,
  };
}

