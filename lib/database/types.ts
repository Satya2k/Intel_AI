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
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_USER' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

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

