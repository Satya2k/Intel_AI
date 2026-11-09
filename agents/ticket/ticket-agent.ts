import { TicketCategory, TicketImpact, TicketUrgency } from '@/lib/database/types';
import { createSupportTicket } from '@/tools/ticket-tools';

export interface TicketClassificationResult {
  category: TicketCategory;
  impact: TicketImpact;
  urgency: TicketUrgency;
  confidence: number;
  missingInformation: string | null;
  rationale: string;
}

/**
 * Intelligent IT Service Desk Classification Agent
 * Evaluates incident semantics, categorizes accurately, and detects missing information.
 */
export function classifyITRequest(text: string): TicketClassificationResult {
  const lower = text.toLowerCase();

  // Check for missing information (vague requests)
  if (lower.trim().length < 10 || lower === 'help' || lower === 'it is broken' || lower === 'need support') {
    return {
      category: 'Other IT incidents',
      impact: 'LOW',
      urgency: 'LOW',
      confidence: 0.3,
      missingInformation: 'Could you please describe the specific error message, affected application, or hardware device?',
      rationale: 'Input is too brief or ambiguous to determine category accurately.',
    };
  }

  // 1. VPN
  if (lower.includes('vpn') || lower.includes('anyconnect') || lower.includes('gateway') || lower.includes('error 412') || lower.includes('tunnel')) {
    return {
      category: 'VPN',
      impact: lower.includes('all') || lower.includes('department') ? 'HIGH' : 'MEDIUM',
      urgency: 'MEDIUM',
      confidence: 0.95,
      missingInformation: null,
      rationale: 'Matches VPN gateway keywords and connection protocols.',
    };
  }

  // 2. ERP and SAP
  if (lower.includes('sap') || lower.includes('s/4hana') || lower.includes('fiori') || lower.includes('t-code') || lower.includes('fbl3n') || lower.includes('rfc_no_authority')) {
    const isOutage = lower.includes('outage') || lower.includes('down') || lower.includes('critical') || lower.includes('nationwide');
    return {
      category: 'ERP and SAP',
      impact: isOutage ? 'CRITICAL' : 'MEDIUM',
      urgency: isOutage ? 'CRITICAL' : 'MEDIUM',
      confidence: 0.95,
      missingInformation: null,
      rationale: 'Identified enterprise ERP and SAP transaction nomenclature.',
    };
  }

  // 3. Password and Account Support
  if (lower.includes('password') || lower.includes('lockout') || lower.includes('locked out') || lower.includes('authenticator') || lower.includes('2fa') || lower.includes('mfa')) {
    return {
      category: 'Password and account support',
      impact: 'MEDIUM',
      urgency: 'HIGH',
      confidence: 0.92,
      missingInformation: null,
      rationale: 'Identified credential reset or account authentication barrier.',
    };
  }

  // 4. Email and Microsoft 365
  if (lower.includes('outlook') || lower.includes('exchange') || lower.includes('email') || lower.includes('mailbox') || lower.includes('m365') || lower.includes('teams')) {
    return {
      category: 'Email and Microsoft 365',
      impact: 'MEDIUM',
      urgency: 'MEDIUM',
      confidence: 0.9,
      missingInformation: null,
      rationale: 'Identified Microsoft 365 messaging or collaboration suite issue.',
    };
  }

  // 5. Network & Wi-Fi
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('network') || lower.includes('switch') || lower.includes('router') || lower.includes('internet') || lower.includes('dns')) {
    const isDatacenter = lower.includes('datacenter') || lower.includes('core') || lower.includes('floor');
    return {
      category: 'Network',
      impact: isDatacenter ? 'CRITICAL' : 'MEDIUM',
      urgency: isDatacenter ? 'CRITICAL' : 'MEDIUM',
      confidence: 0.9,
      missingInformation: null,
      rationale: 'Identified network layer infrastructure or Wi-Fi connectivity symptom.',
    };
  }

  // 6. Hardware
  if (lower.includes('printer') || lower.includes('laptop') || lower.includes('monitor') || lower.includes('dock') || lower.includes('screen') || lower.includes('keyboard') || lower.includes('bitlocker')) {
    return {
      category: 'Hardware',
      impact: lower.includes('printer') && lower.includes('warehouse') ? 'HIGH' : 'MEDIUM',
      urgency: 'MEDIUM',
      confidence: 0.88,
      missingInformation: null,
      rationale: 'Identified physical workstation, peripheral, or printer equipment.',
    };
  }

  // 7. Access Requests
  if (lower.includes('access') || lower.includes('permission') || lower.includes('license') || lower.includes('role') || lower.includes('grant')) {
    return {
      category: 'Access requests',
      impact: 'LOW',
      urgency: 'LOW',
      confidence: 0.85,
      missingInformation: null,
      rationale: 'Identified authorization or application entitlement request.',
    };
  }

  // 8. Software
  if (lower.includes('install') || lower.includes('chrome') || lower.includes('browser') || lower.includes('excel') || lower.includes('app') || lower.includes('software')) {
    return {
      category: 'Software',
      impact: 'LOW',
      urgency: 'LOW',
      confidence: 0.82,
      missingInformation: null,
      rationale: 'Identified client desktop software application.',
    };
  }

  // Fallback
  return {
    category: 'Other IT incidents',
    impact: 'MEDIUM',
    urgency: 'MEDIUM',
    confidence: 0.7,
    missingInformation: null,
    rationale: 'General IT incident.',
  };
}

export async function processTicketCreationAgent(
  employeeId: string,
  title: string,
  description: string,
  correlationId?: string
) {
  const classification = classifyITRequest(`${title} ${description}`);

  if (classification.missingInformation) {
    return {
      status: 'NEEDS_INFO',
      message: classification.missingInformation,
      classification,
    };
  }

  const result = await createSupportTicket({
    employee_id: employeeId,
    title,
    description,
    category: classification.category,
    impact: classification.impact,
    urgency: classification.urgency,
    correlation_id: correlationId,
  });

  return {
    status: 'CREATED',
    ticket: result.ticket,
    evaluation: result.evaluation,
    potentialDuplicate: result.potentialDuplicate,
  };
}

