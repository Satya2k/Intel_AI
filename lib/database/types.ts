export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'ONBOARDING';
export type ApplicationRole = 'EMPLOYEE' | 'MANAGER' | 'IT_ADMIN' | 'IAM_ADMIN' | 'SECURITY_ADMIN';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApplicationStatus = 'ACTIVE' | 'MAINTENANCE' | 'DEPRECATED';
export type AccessStatus = 'ACTIVE' | 'REVOKED' | 'SUSPENDED';

export type TicketCategory = 
  | 'Hardware' 
  | 'Software' 
  | 'Network' 
  | 'VPN' 
  | 'Email and Microsoft 365' 
  | 'Password and account support' 
  | 'ERP and SAP' 
  | 'Access requests' 
  | 'Other IT incidents';

export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type TicketImpact = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketUrgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Comprehensive 11 ITIL/Enterprise Ticket States (with backward-compatible aliases)
export type TicketStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_USER'
  | 'PENDING_VENDOR'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REOPENED'
  | 'OPEN'            // alias for SUBMITTED
  | 'AWAITING_USER'   // alias for PENDING_USER
  | 'ESCALATED';      // incident escalation state

export type SLAState = 'MET' | 'AT_RISK' | 'BREACHED' | 'PENDING';

export type RequestType = 'GRANT' | 'REVOKE' | 'ELEVATION';
export type RequestStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PROVISIONED' | 'FAILED' | 'REVOKED';

export type ApprovalType = 'MANAGER' | 'APP_OWNER' | 'SECURITY_ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ProvisioningAction = 'GRANT' | 'REVOKE' | 'SUSPEND';
export type ProvisioningStatus = 'SUCCESS' | 'FAILED' | 'SIMULATED';

export type LifecycleEventType = 'JOINER' | 'MOVER' | 'LEAVER';
export type LifecycleEventStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ActorType = 'USER' | 'AGENT' | 'SYSTEM' | 'HR_INTEGRATION';
export type AuditOutcome = 'SUCCESS' | 'DENIED' | 'FAILURE' | 'FLAGGED';

export interface Profile {
  user_id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  manager_id: string | null;
  account_status: AccountStatus;
  application_role: ApplicationRole;
  created_at?: string;
  updated_at?: string;
}

export interface Application {
  application_id: string;
  application_name: string;
  application_owner: string;
  risk_level: RiskLevel;
  description: string;
  status: ApplicationStatus;
  created_at?: string;
}

export interface Role {
  role_id: string;
  role_name: string;
  department: string;
  description: string;
  created_at?: string;
}

export interface RolePermission {
  permission_id: string;
  role_id: string;
  application_id: string;
  permission_name: string;
  risk_level: RiskLevel;
  requires_security_approval: boolean;
  created_at?: string;
}

export interface EmployeeAccess {
  access_id: string;
  employee_id: string;
  application_id: string;
  permission_id: string;
  status: AccessStatus;
  granted_at: string;
  revoked_at?: string | null;
  granted_by?: string;
  revocation_reason?: string | null;
}

export interface MultiTargetSLA {
  ack_sla_minutes: number;
  assignment_sla_minutes: number;
  restoration_sla_hours: number;
  resolution_sla_hours: number;
  ack_due_at: string;
  assigned_due_at: string;
  restoration_due_at: string;
  resolution_due_at: string;
  ack_status: SLAState;
  resolution_status: SLAState;
}

export interface Ticket {
  ticket_id: string;
  employee_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  impact: TicketImpact;
  urgency: TicketUrgency;
  assigned_team: string;
  assigned_agent?: string | null;
  status: TicketStatus;
  resolution_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
  sla_due_at: string;
  // Multi-target SLAs
  ack_at?: string | null;
  assigned_at?: string | null;
  restored_at?: string | null;
  ack_sla_due_at?: string;
  sla_status?: SLAState;
  linked_problem_id?: string | null;
  is_major_incident?: boolean;
}

export interface AccessRequest {
  request_id: string;
  employee_id: string;
  application_id: string;
  permission_id: string;
  business_justification: string;
  request_type: RequestType;
  risk_level: RiskLevel;
  request_status: RequestStatus;
  idempotency_key: string;
  current_approval_stage: number;
  total_stages_required: number;
  created_at: string;
  completed_at?: string | null;
}

export interface Approval {
  approval_id: string;
  request_id: string;
  approver_id: string;
  approval_type: ApprovalType;
  stage_number: number;
  approval_status: ApprovalStatus;
  comments?: string | null;
  created_at: string;
  approved_at?: string | null;
}

export interface ProvisioningEvent {
  event_id: string;
  request_id?: string | null;
  employee_id: string;
  application_id: string;
  permission_id: string;
  action: ProvisioningAction;
  execution_status: ProvisioningStatus;
  executed_at: string;
  result: Record<string, unknown>;
}

export interface Conversation {
  conversation_id: string;
  employee_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  message_id: string;
  conversation_id: string;
  sender_type: 'USER' | 'AGENT' | 'SYSTEM';
  agent_name?: string | null;
  message_content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentRun {
  run_id: string;
  workflow_type: string;
  current_node: string;
  run_status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  input_reference?: string;
  state_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLifecycleEvent {
  event_id: string;
  employee_id: string;
  event_type: LifecycleEventType;
  details: Record<string, unknown>;
  effective_date: string;
  event_status: LifecycleEventStatus;
  created_by: string;
  created_at: string;
  completed_at?: string | null;
}

export interface AuditLog {
  log_id: string;
  actor_id: string;
  actor_type: ActorType;
  action: string;
  entity_type: string;
  entity_id: string;
  outcome: AuditOutcome;
  reason?: string | null;
  correlation_id: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// -------------------------------------------------------------
// INTELLIDESK 2.0 ENTERPRISE EXTENSIONS
// -------------------------------------------------------------

export type EmailDeliveryStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'LOGGED_CONSOLE';
export type NotificationType = 
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_SLA_WARNING'
  | 'TICKET_SLA_BREACHED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_COMPLETED'
  | 'APPROVAL_REJECTED'
  | 'ACCESS_PROVISIONED'
  | 'ACCESS_REVOKED'
  | 'JML_EVENT_PROCESSED'
  | 'SECURITY_RISK_ALERT'
  | 'MAJOR_INCIDENT_BROADCAST';

export interface NotificationOutboxItem {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  notification_type: NotificationType;
  template_id: string;
  template_variables: Record<string, unknown>;
  delivery_status: EmailDeliveryStatus;
  attempts: number;
  last_error?: string | null;
  idempotency_key: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  dispatched_at?: string | null;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface MajorIncident {
  incident_id: string;
  title: string;
  summary: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  commander_id: string;
  affected_services: string[];
  business_impact: string;
  started_at: string;
  mitigated_at?: string | null;
  resolved_at?: string | null;
  bridge_url?: string;
  updates: Array<{
    update_id: string;
    timestamp: string;
    author: string;
    message: string;
    status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  }>;
}

export interface ProblemRecord {
  problem_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: 'LOGGED' | 'INVESTIGATING' | 'KNOWN_ERROR' | 'RESOLVED' | 'CLOSED';
  root_cause?: string;
  workaround?: string;
  permanent_fix?: string;
  related_ticket_ids: string[];
  owner: string;
  created_at: string;
  resolved_at?: string | null;
}

export interface PrivilegedAccount {
  id: string;
  employee_id: string;
  employee_name: string;
  application_id: string;
  application_name: string;
  privileged_role: string;
  elevation_type: 'PERMANENT' | 'TIME_BOUND_JIT';
  valid_until?: string | null;
  mfa_enforced: boolean;
  last_used_at: string;
  risk_level: RiskLevel;
  certification_status: 'CERTIFIED' | 'PENDING_REVIEW' | 'FLAGGED';
}

export interface RiskIntelligenceReport {
  overall_score: number; // 0 - 100
  iam_risk_score: number;
  operational_risk_score: number;
  compliance_risk_score: number;
  high_risk_identities_count: number;
  sla_breach_risk_count: number;
  stale_privileges_count: number;
  sod_violations_count: number;
}
