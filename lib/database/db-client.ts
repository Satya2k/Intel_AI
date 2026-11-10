import fs from 'fs';
import path from 'path';
import { 
  Profile, Application, Role, RolePermission, EmployeeAccess, 
  Ticket, AccessRequest, Approval, ProvisioningEvent, AuditLog,
  EmployeeLifecycleEvent, Conversation, ConversationMessage,
  MajorIncident, ProblemRecord, PrivilegedAccount, InAppNotification,
  NotificationOutboxItem, RiskIntelligenceReport
} from './types';
import { 
  INITIAL_PROFILES, INITIAL_APPLICATIONS, INITIAL_ROLES, 
  INITIAL_ROLE_PERMISSIONS, INITIAL_EMPLOYEE_ACCESS, INITIAL_TICKETS, 
  INITIAL_ACCESS_REQUESTS, INITIAL_APPROVALS, INITIAL_PROVISIONING_EVENTS, 
  INITIAL_AUDIT_LOGS, INITIAL_MAJOR_INCIDENTS, INITIAL_PROBLEMS,
  INITIAL_PRIVILEGED_ACCOUNTS, INITIAL_IN_APP_NOTIFICATIONS, INITIAL_OUTBOX_ITEMS
} from './initial-data';
import { KNOWLEDGE_DOCUMENTS, KnowledgeDocument } from './knowledge-data';

interface DatabaseState {
  profiles: Profile[];
  applications: Application[];
  roles: Role[];
  role_permissions: RolePermission[];
  employee_access: EmployeeAccess[];
  tickets: Ticket[];
  access_requests: AccessRequest[];
  approvals: Approval[];
  provisioning_events: ProvisioningEvent[];
  audit_logs: AuditLog[];
  knowledge_documents: KnowledgeDocument[];
  lifecycle_events: EmployeeLifecycleEvent[];
  conversations: Conversation[];
  conversation_messages: ConversationMessage[];
  major_incidents: MajorIncident[];
  problems: ProblemRecord[];
  privileged_accounts: PrivilegedAccount[];
  in_app_notifications: InAppNotification[];
  notification_outbox: NotificationOutboxItem[];
}

class IntelliDatabase {
  private state: DatabaseState;
  private storageFile: string | null = null;
  private initialized = false;

  constructor() {
    this.state = this.getInitialState();
    this.initStorage();
  }

  private getInitialState(): DatabaseState {
    return {
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      applications: JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)),
      roles: JSON.parse(JSON.stringify(INITIAL_ROLES)),
      role_permissions: JSON.parse(JSON.stringify(INITIAL_ROLE_PERMISSIONS)),
      employee_access: JSON.parse(JSON.stringify(INITIAL_EMPLOYEE_ACCESS)),
      tickets: JSON.parse(JSON.stringify(INITIAL_TICKETS)),
      access_requests: JSON.parse(JSON.stringify(INITIAL_ACCESS_REQUESTS)),
      approvals: JSON.parse(JSON.stringify(INITIAL_APPROVALS)),
      provisioning_events: JSON.parse(JSON.stringify(INITIAL_PROVISIONING_EVENTS)),
      audit_logs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      knowledge_documents: JSON.parse(JSON.stringify(KNOWLEDGE_DOCUMENTS)),
      lifecycle_events: [
        {
          event_id: 'EVT-JML-001',
          employee_id: 'EMP-FIN-004',
          event_type: 'JOINER',
          details: { department: 'Finance', designation: 'Billing Specialist', manager_id: 'EMP-FIN-001' },
          effective_date: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0],
          event_status: 'COMPLETED',
          created_by: 'HR-SYSTEM-API',
          created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
          completed_at: new Date(Date.now() - 40 * 86400000).toISOString(),
        }
      ],
      conversations: [],
      conversation_messages: [],
      major_incidents: JSON.parse(JSON.stringify(INITIAL_MAJOR_INCIDENTS)),
      problems: JSON.parse(JSON.stringify(INITIAL_PROBLEMS)),
      privileged_accounts: JSON.parse(JSON.stringify(INITIAL_PRIVILEGED_ACCOUNTS)),
      in_app_notifications: JSON.parse(JSON.stringify(INITIAL_IN_APP_NOTIFICATIONS)),
      notification_outbox: JSON.parse(JSON.stringify(INITIAL_OUTBOX_ITEMS)),
    };
  }

  private initStorage() {
    try {
      const dataDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.storageFile = path.join(dataDir, 'intellidesk_db.json');
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf8');
        if (raw) {
          const parsed = JSON.parse(raw);
          // Merge to preserve newly defined tables or initial knowledge
          this.state = {
            ...this.getInitialState(),
            ...parsed,
          };
        }
      } else {
        this.persist();
      }
      this.initialized = true;
    } catch {
      // In-memory fallback if file system write isn't available
      this.initialized = true;
    }
  }

  private persist() {
    if (this.storageFile) {
      try {
        fs.writeFileSync(this.storageFile, JSON.stringify(this.state, null, 2), 'utf8');
      } catch {
        // Fallback silently to memory
      }
    }
  }

  // --- Reset to seed state (useful for tests and demo reset) ---
  public resetToSeed(): void {
    this.state = this.getInitialState();
    this.persist();
  }

  // --- Atomic Demo Data Re-Seed Engine ---
  public async resetDemoData(): Promise<{ success: boolean; timestamp: string; message: string }> {
    const timestamp = new Date().toISOString();
    
    // 1. Revert to baseline state
    this.state = this.getInitialState();

    // 2. Clear operational logs & transactions
    this.state.conversations = [];
    this.state.conversation_messages = [];
    this.state.provisioning_events = [];

    // 3. Ensure baseline entitlements for Alice Chen, Vikram Patel, and Sarah Jenkins
    const baselineEntitlements: EmployeeAccess[] = [
      // Alice Chen (Finance)
      { access_id: 'a0000000-0000-0000-0000-000000000001', employee_id: 'EMP-FIN-002', application_id: 'APP-M365', permission_id: 'PERM-M365-FIN', status: 'ACTIVE', granted_at: new Date(Date.now() - 90 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000002', employee_id: 'EMP-FIN-002', application_id: 'APP-WD', permission_id: 'PERM-WD-BASE', status: 'ACTIVE', granted_at: new Date(Date.now() - 90 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000003', employee_id: 'EMP-FIN-002', application_id: 'APP-SNOW', permission_id: 'PERM-SNOW-ANALYST', status: 'ACTIVE', granted_at: new Date(Date.now() - 60 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000004', employee_id: 'EMP-FIN-002', application_id: 'APP-SAP', permission_id: 'PERM-SAP-READ', status: 'ACTIVE', granted_at: new Date(Date.now() - 90 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000005', employee_id: 'EMP-FIN-002', application_id: 'APP-PBI', permission_id: 'PERM-PBI-FIN', status: 'ACTIVE', granted_at: new Date(Date.now() - 90 * 86400000).toISOString() },
      // Vikram Patel (IT Lead)
      { access_id: 'a0000000-0000-0000-0000-000000000020', employee_id: 'EMP-IT-001', application_id: 'APP-JIRA', permission_id: 'PERM-JIRA-AGENT', status: 'ACTIVE', granted_at: new Date(Date.now() - 365 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000021', employee_id: 'EMP-IT-001', application_id: 'APP-M365', permission_id: 'PERM-M365-ADMIN', status: 'ACTIVE', granted_at: new Date(Date.now() - 365 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000022', employee_id: 'EMP-IT-001', application_id: 'APP-AWS', permission_id: 'PERM-AWS-PROD-ADMIN', status: 'ACTIVE', granted_at: new Date(Date.now() - 180 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000023', employee_id: 'EMP-IT-001', application_id: 'APP-GH', permission_id: 'PERM-GH-DEV', status: 'ACTIVE', granted_at: new Date(Date.now() - 365 * 86400000).toISOString() },
      // Sarah Jenkins (Finance Director)
      { access_id: 'a0000000-0000-0000-0000-000000000030', employee_id: 'EMP-FIN-001', application_id: 'APP-SAP', permission_id: 'PERM-SAP-CLOSE', status: 'ACTIVE', granted_at: new Date(Date.now() - 365 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000031', employee_id: 'EMP-FIN-001', application_id: 'APP-PBI', permission_id: 'PERM-PBI-FIN', status: 'ACTIVE', granted_at: new Date(Date.now() - 365 * 86400000).toISOString() },
      { access_id: 'a0000000-0000-0000-0000-000000000032', employee_id: 'EMP-FIN-001', application_id: 'APP-M365', permission_id: 'PERM-M365-FIN', status: 'ACTIVE', granted_at: new Date(Date.now() - 365 * 86400000).toISOString() }
    ];
    
    // Merge or replace
    for (const b of baselineEntitlements) {
      const idx = this.state.employee_access.findIndex(x => x.employee_id === b.employee_id && x.permission_id === b.permission_id);
      if (idx !== -1) {
        this.state.employee_access[idx] = b;
      } else {
        this.state.employee_access.push(b);
      }
    }

    // 4. Ensure baseline High-priority IT ticket assigned to Vikram Patel
    const highPriTicket: Ticket = {
      ticket_id: 'TCK-IT-BASELINE-01',
      employee_id: 'EMP-FIN-002',
      title: 'Production VPN Gateway Latency & DNS Resolution Drops',
      description: 'Multiple financial analysts experiencing SSL handshake failure during ERP settlement runs.',
      category: 'VPN',
      priority: 'P2',
      impact: 'HIGH',
      urgency: 'HIGH',
      assigned_team: 'Network and Security Team',
      assigned_agent: 'EMP-IT-001',
      status: 'IN_PROGRESS',
      resolution_notes: 'Investigating gateway failover route and primary radius authentication server.',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      sla_due_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    };
    const tIdx = this.state.tickets.findIndex(x => x.ticket_id === highPriTicket.ticket_id);
    if (tIdx !== -1) {
      this.state.tickets[tIdx] = highPriTicket;
    } else {
      this.state.tickets.unshift(highPriTicket);
    }

    // 5. Ensure pending access request from Alice Chen requiring Sarah Jenkins' approval
    const pendingReq: AccessRequest = {
      request_id: 'REQ-DEMO-BASELINE-01',
      employee_id: 'EMP-FIN-002',
      application_id: 'APP-SAP',
      permission_id: 'PERM-SAP-POST',
      business_justification: 'Q4 financial period journal entries and ledger reconciliation posting approval.',
      request_type: 'GRANT',
      risk_level: 'MEDIUM',
      request_status: 'PENDING_APPROVAL',
      idempotency_key: 'IDEMP-DEMO-RESET-ALICE-SAP-01',
      current_approval_stage: 1,
      total_stages_required: 1,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    };
    const rIdx = this.state.access_requests.findIndex(x => x.request_id === pendingReq.request_id);
    if (rIdx !== -1) {
      this.state.access_requests[rIdx] = pendingReq;
    } else {
      this.state.access_requests.unshift(pendingReq);
    }

    const pendingApproval: Approval = {
      approval_id: 'b0000000-0000-0000-0000-000000000001',
      request_id: 'REQ-DEMO-BASELINE-01',
      approver_id: 'EMP-FIN-001',
      approval_type: 'MANAGER',
      stage_number: 1,
      approval_status: 'PENDING',
      comments: 'Awaiting managerial review for journal entry posting entitlement.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    };
    const aIdx = this.state.approvals.findIndex(x => x.approval_id === pendingApproval.approval_id);
    if (aIdx !== -1) {
      this.state.approvals[aIdx] = pendingApproval;
    } else {
      this.state.approvals.unshift(pendingApproval);
    }

    // 6. Append initial DEMO_DATA_RESET audit log
    const resetLog: AuditLog = {
      log_id: `log-reset-${Date.now()}`,
      actor_id: 'ADMIN-RESET-ENGINE',
      actor_type: 'SYSTEM',
      action: 'DEMO_DATA_RESET',
      entity_type: 'ORGANIZATION_STATE',
      entity_id: 'NORTHSTAR-TECH',
      outcome: 'SUCCESS',
      reason: 'Full atomic re-seed performed: operational records reset to baseline state.',
      correlation_id: `CORR-RESET-${Date.now()}`,
      metadata: {
        environment: 'DEMO',
        initiator: 'One-Click Demo Re-Seed Engine',
        reset_scope: 'FULL_OPERATIONAL_RESET'
      },
      timestamp
    };
    this.state.audit_logs.unshift(resetLog);

    this.persist();

    return {
      success: true,
      timestamp,
      message: 'Demo data successfully reset to clean baseline state.'
    };
  }

  // --- Profiles ---
  public async getProfiles(): Promise<Profile[]> {
    return [...this.state.profiles];
  }

  public async getProfile(employeeId: string): Promise<Profile | null> {
    const p = this.state.profiles.find(x => x.employee_id.toLowerCase() === employeeId.toLowerCase());
    return p ? { ...p } : null;
  }

  public async createProfile(profile: Profile): Promise<Profile> {
    const existing = this.state.profiles.find(x => x.employee_id.toLowerCase() === profile.employee_id.toLowerCase());
    if (existing) {
      return { ...existing };
    }
    this.state.profiles.push(profile);
    this.persist();
    return { ...profile };
  }

  public async updateProfile(employeeId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const idx = this.state.profiles.findIndex(x => x.employee_id.toLowerCase() === employeeId.toLowerCase());
    if (idx === -1) return null;
    this.state.profiles[idx] = {
      ...this.state.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return { ...this.state.profiles[idx] };
  }

  // --- Applications ---
  public async getApplications(): Promise<Application[]> {
    return [...this.state.applications];
  }

  public async getApplication(appId: string): Promise<Application | null> {
    const a = this.state.applications.find(x => x.application_id === appId);
    return a ? { ...a } : null;
  }

  // --- Roles & Permissions ---
  public async getRoles(): Promise<Role[]> {
    return [...this.state.roles];
  }

  public async getRole(roleId: string): Promise<Role | null> {
    const r = this.state.roles.find(x => x.role_id === roleId);
    return r ? { ...r } : null;
  }

  public async getRolePermissions(): Promise<RolePermission[]> {
    return [...this.state.role_permissions];
  }

  public async getRolePermission(permissionId: string): Promise<RolePermission | null> {
    const p = this.state.role_permissions.find(x => x.permission_id === permissionId);
    return p ? { ...p } : null;
  }

  public async getPermissionsForRole(roleId: string): Promise<RolePermission[]> {
    return this.state.role_permissions.filter(x => x.role_id === roleId);
  }

  // --- Employee Access ---
  public async getEmployeeAccess(employeeId: string): Promise<EmployeeAccess[]> {
    return this.state.employee_access.filter(
      x => x.employee_id.toLowerCase() === employeeId.toLowerCase() && x.status === 'ACTIVE'
    );
  }

  public async getAllEmployeeAccessRecords(employeeId?: string): Promise<EmployeeAccess[]> {
    if (employeeId) {
      return this.state.employee_access.filter(
        x => x.employee_id.toLowerCase() === employeeId.toLowerCase()
      );
    }
    return [...this.state.employee_access];
  }

  public async grantEmployeeAccess(grant: Omit<EmployeeAccess, 'access_id'>): Promise<EmployeeAccess> {
    // Idempotency check: don't duplicate active grants
    const existing = this.state.employee_access.find(
      x => x.employee_id === grant.employee_id && 
           x.permission_id === grant.permission_id && 
           x.status === 'ACTIVE'
    );
    if (existing) {
      return { ...existing };
    }

    const newRecord: EmployeeAccess = {
      ...grant,
      access_id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      granted_at: grant.granted_at || new Date().toISOString(),
    };
    this.state.employee_access.push(newRecord);
    this.persist();
    return { ...newRecord };
  }

  public async revokeEmployeeAccess(
    employeeId: string, 
    permissionId: string, 
    reason: string
  ): Promise<boolean> {
    let found = false;
    for (const acc of this.state.employee_access) {
      if (acc.employee_id === employeeId && acc.permission_id === permissionId && acc.status === 'ACTIVE') {
        acc.status = 'REVOKED';
        acc.revoked_at = new Date().toISOString();
        acc.revocation_reason = reason;
        found = true;
      }
    }
    if (found) this.persist();
    return found;
  }

  public async revokeAllEmployeeAccess(employeeId: string, reason: string): Promise<number> {
    let count = 0;
    const now = new Date().toISOString();
    for (const acc of this.state.employee_access) {
      if (acc.employee_id === employeeId && acc.status === 'ACTIVE') {
        acc.status = 'REVOKED';
        acc.revoked_at = now;
        acc.revocation_reason = reason;
        count++;
      }
    }
    if (count > 0) this.persist();
    return count;
  }

  // --- Tickets ---
  public async getTickets(filters?: { 
    employee_id?: string; 
    status?: string; 
    category?: string; 
    priority?: string;
  }): Promise<Ticket[]> {
    let result = [...this.state.tickets];
    if (filters?.employee_id) {
      result = result.filter(x => x.employee_id.toLowerCase() === filters.employee_id!.toLowerCase());
    }
    if (filters?.status) {
      result = result.filter(x => x.status === filters.status);
    }
    if (filters?.category) {
      result = result.filter(x => x.category === filters.category);
    }
    if (filters?.priority) {
      result = result.filter(x => x.priority === filters.priority);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getTicket(ticketId: string): Promise<Ticket | null> {
    const t = this.state.tickets.find(x => x.ticket_id === ticketId);
    return t ? { ...t } : null;
  }

  public async createTicket(ticket: Omit<Ticket, 'ticket_id' | 'created_at'> & { ticket_id?: string; created_at?: string }): Promise<Ticket> {
    const id = ticket.ticket_id || `TCK-2026-${String(this.state.tickets.length + 1).padStart(3, '0')}`;
    const newTicket: Ticket = {
      ...ticket,
      ticket_id: id,
      created_at: ticket.created_at || new Date().toISOString(),
      status: ticket.status || 'OPEN',
    };
    this.state.tickets.unshift(newTicket);
    this.persist();

    // Trigger in-app notification & outbox email record
    const emp = this.state.profiles.find(p => p.employee_id.toLowerCase() === newTicket.employee_id.toLowerCase());
    this.addInAppNotification({
      user_id: newTicket.employee_id,
      title: `Ticket ${newTicket.ticket_id} Logged`,
      message: `Your ticket "${newTicket.title}" has been registered and assigned to ${newTicket.assigned_team}.`,
      notification_type: 'TICKET_CREATED',
      link_url: '/employee'
    }).catch(() => {});

    this.queueOutboxNotification({
      recipient_email: emp?.email || `${newTicket.employee_id.toLowerCase()}@northstar-tech.internal`,
      recipient_name: emp?.full_name || newTicket.employee_id,
      subject: `[Ticket Confirmed] ${newTicket.ticket_id}: ${newTicket.title}`,
      notification_type: 'TICKET_CREATED',
      template_id: 'ticket_confirmation',
      template_variables: {
        ticketId: newTicket.ticket_id,
        title: newTicket.title,
        priority: newTicket.priority,
        category: newTicket.category,
        assignedTeam: newTicket.assigned_team,
        slaDueAt: newTicket.sla_due_at
      },
      entity_type: 'TICKET',
      entity_id: newTicket.ticket_id,
      delivery_status: 'LOGGED_CONSOLE'
    }).catch(() => {});

    return { ...newTicket };
  }

  public async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    const idx = this.state.tickets.findIndex(x => x.ticket_id === ticketId);
    if (idx === -1) return null;
    
    const prevStatus = this.state.tickets[idx].status;

    // Auto timestamp resolved_at when marked as RESOLVED or CLOSED
    if ((updates.status === 'RESOLVED' || updates.status === 'CLOSED') && !this.state.tickets[idx].resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }

    this.state.tickets[idx] = {
      ...this.state.tickets[idx],
      ...updates,
    };
    this.persist();

    // Status change notification
    if (updates.status && updates.status !== prevStatus) {
      const ticket = this.state.tickets[idx];
      const emp = this.state.profiles.find(p => p.employee_id.toLowerCase() === ticket.employee_id.toLowerCase());
      
      this.addInAppNotification({
        user_id: ticket.employee_id,
        title: `Ticket ${ticket.ticket_id} Status: ${updates.status}`,
        message: `Your ticket status is now ${updates.status}. ${updates.resolution_notes ? `Notes: ${updates.resolution_notes}` : ''}`,
        notification_type: 'TICKET_STATUS_CHANGED',
        link_url: '/employee'
      }).catch(() => {});

      if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
        this.queueOutboxNotification({
          recipient_email: emp?.email || `${ticket.employee_id.toLowerCase()}@northstar-tech.internal`,
          recipient_name: emp?.full_name || ticket.employee_id,
          subject: `[Resolved] Ticket ${ticket.ticket_id}: ${ticket.title}`,
          notification_type: 'TICKET_STATUS_CHANGED',
          template_id: 'ticket_resolved',
          template_variables: {
            ticketId: ticket.ticket_id,
            title: ticket.title,
            resolutionNotes: updates.resolution_notes || 'Resolved according to standard IT procedure'
          },
          entity_type: 'TICKET',
          entity_id: ticket.ticket_id,
          delivery_status: 'LOGGED_CONSOLE'
        }).catch(() => {});
      }
    }

    return { ...this.state.tickets[idx] };
  }

  // --- Access Requests ---
  public async getAccessRequests(filters?: { 
    employee_id?: string; 
    status?: string; 
  }): Promise<AccessRequest[]> {
    let result = [...this.state.access_requests];
    if (filters?.employee_id) {
      result = result.filter(x => x.employee_id.toLowerCase() === filters.employee_id!.toLowerCase());
    }
    if (filters?.status) {
      result = result.filter(x => x.request_status === filters.status);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getAccessRequest(requestId: string): Promise<AccessRequest | null> {
    const r = this.state.access_requests.find(x => x.request_id === requestId);
    return r ? { ...r } : null;
  }

  public async getAccessRequestByIdempotencyKey(key: string): Promise<AccessRequest | null> {
    const r = this.state.access_requests.find(x => x.idempotency_key === key);
    return r ? { ...r } : null;
  }

  public async createAccessRequest(req: Omit<AccessRequest, 'request_id' | 'created_at'> & { request_id?: string; created_at?: string }): Promise<AccessRequest> {
    // Enforce idempotency key uniqueness
    const existing = await this.getAccessRequestByIdempotencyKey(req.idempotency_key);
    if (existing) {
      return { ...existing };
    }

    const id = req.request_id || `REQ-2026-${String(this.state.access_requests.length + 1).padStart(3, '0')}`;
    const newReq: AccessRequest = {
      ...req,
      request_id: id,
      created_at: req.created_at || new Date().toISOString(),
      request_status: req.request_status || 'PENDING_APPROVAL',
      current_approval_stage: req.current_approval_stage || 1,
      total_stages_required: req.total_stages_required || 1,
    };
    this.state.access_requests.unshift(newReq);
    this.persist();

    // Notify manager & queue outbox email
    const emp = this.state.profiles.find(p => p.employee_id.toLowerCase() === newReq.employee_id.toLowerCase());
    const app = this.state.applications.find(a => a.application_id === newReq.application_id);
    const mgrId = emp?.manager_id || 'EMP-FIN-001';
    const mgr = this.state.profiles.find(p => p.employee_id.toLowerCase() === mgrId.toLowerCase());

    this.addInAppNotification({
      user_id: mgrId,
      title: `Access Approval Required`,
      message: `${emp?.full_name || newReq.employee_id} requested access to ${app?.application_name || newReq.application_id}.`,
      notification_type: 'APPROVAL_REQUESTED',
      link_url: '/approvals'
    }).catch(() => {});

    this.queueOutboxNotification({
      recipient_email: mgr?.email || 'manager@northstar-tech.internal',
      recipient_name: mgr?.full_name || 'Approving Manager',
      subject: `[Action Required] Approval for ${emp?.full_name || newReq.employee_id}: ${app?.application_name || newReq.application_id}`,
      notification_type: 'APPROVAL_REQUESTED',
      template_id: 'approval_request',
      template_variables: {
        requestId: newReq.request_id,
        requesterName: emp?.full_name || newReq.employee_id,
        appName: app?.application_name || newReq.application_id,
        permission: newReq.permission_id,
        justification: newReq.business_justification
      },
      entity_type: 'ACCESS_REQUEST',
      entity_id: newReq.request_id,
      delivery_status: 'LOGGED_CONSOLE'
    }).catch(() => {});

    return { ...newReq };
  }

  public async updateAccessRequest(requestId: string, updates: Partial<AccessRequest>): Promise<AccessRequest | null> {
    const idx = this.state.access_requests.findIndex(x => x.request_id === requestId);
    if (idx === -1) return null;
    this.state.access_requests[idx] = {
      ...this.state.access_requests[idx],
      ...updates,
    };
    this.persist();
    return { ...this.state.access_requests[idx] };
  }

  // --- Approvals ---
  public async getApprovals(filters?: { 
    request_id?: string; 
    approver_id?: string; 
    status?: string; 
  }): Promise<Approval[]> {
    let result = [...this.state.approvals];
    if (filters?.request_id) {
      result = result.filter(x => x.request_id === filters.request_id);
    }
    if (filters?.approver_id) {
      result = result.filter(x => x.approver_id.toLowerCase() === filters.approver_id!.toLowerCase());
    }
    if (filters?.status) {
      result = result.filter(x => x.approval_status === filters.status);
    }
    return result;
  }

  public async getApproval(approvalId: string): Promise<Approval | null> {
    const a = this.state.approvals.find(x => x.approval_id === approvalId);
    return a ? { ...a } : null;
  }

  public async createApproval(approval: Omit<Approval, 'approval_id' | 'created_at'>): Promise<Approval> {
    const newApp: Approval = {
      ...approval,
      approval_id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      created_at: new Date().toISOString(),
      approval_status: approval.approval_status || 'PENDING',
    };
    this.state.approvals.push(newApp);
    this.persist();
    return { ...newApp };
  }

  public async updateApproval(approvalId: string, updates: Partial<Approval>): Promise<Approval | null> {
    const idx = this.state.approvals.findIndex(x => x.approval_id === approvalId);
    if (idx === -1) return null;
    this.state.approvals[idx] = {
      ...this.state.approvals[idx],
      ...updates,
      approved_at: updates.approval_status !== 'PENDING' ? (updates.approved_at || new Date().toISOString()) : null,
    };
    this.persist();

    // Notify requester upon decision
    if (updates.approval_status === 'APPROVED' || updates.approval_status === 'REJECTED') {
      const appr = this.state.approvals[idx];
      const req = this.state.access_requests.find(r => r.request_id === appr.request_id);
      if (req) {
        const emp = this.state.profiles.find(p => p.employee_id.toLowerCase() === req.employee_id.toLowerCase());
        this.addInAppNotification({
          user_id: req.employee_id,
          title: `Access Request ${updates.approval_status}`,
          message: `Your access request ${req.request_id} for ${req.application_id} was ${updates.approval_status.toLowerCase()}.`,
          notification_type: updates.approval_status === 'APPROVED' ? 'APPROVAL_COMPLETED' : 'APPROVAL_REJECTED',
          link_url: '/iam'
        }).catch(() => {});

        this.queueOutboxNotification({
          recipient_email: emp?.email || `${req.employee_id.toLowerCase()}@northstar-tech.internal`,
          recipient_name: emp?.full_name || req.employee_id,
          subject: `[Update] Access Request ${req.request_id}: ${updates.approval_status}`,
          notification_type: updates.approval_status === 'APPROVED' ? 'APPROVAL_COMPLETED' : 'APPROVAL_REJECTED',
          template_id: updates.approval_status === 'APPROVED' ? 'approval_approved' : 'approval_rejected',
          template_variables: {
            requestId: req.request_id,
            status: updates.approval_status,
            comments: updates.comments || 'Reviewed in governance portal'
          },
          entity_type: 'ACCESS_REQUEST',
          entity_id: req.request_id,
          delivery_status: 'LOGGED_CONSOLE'
        }).catch(() => {});
      }
    }

    return { ...this.state.approvals[idx] };
  }

  // --- Provisioning Events ---
  public async getProvisioningEvents(filters?: { request_id?: string; employee_id?: string }): Promise<ProvisioningEvent[]> {
    let result = [...this.state.provisioning_events];
    if (filters?.request_id) {
      result = result.filter(x => x.request_id === filters.request_id);
    }
    if (filters?.employee_id) {
      result = result.filter(x => x.employee_id.toLowerCase() === filters.employee_id!.toLowerCase());
    }
    return result.sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime());
  }

  public async createProvisioningEvent(event: Omit<ProvisioningEvent, 'event_id' | 'executed_at'>): Promise<ProvisioningEvent> {
    const newEvent: ProvisioningEvent = {
      ...event,
      event_id: `pevt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      executed_at: new Date().toISOString(),
    };
    this.state.provisioning_events.unshift(newEvent);
    this.persist();
    return { ...newEvent };
  }

  // --- Knowledge Documents (RAG Search) ---
  public async getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
    return [...this.state.knowledge_documents];
  }

  public async searchKnowledge(query: string, category?: string): Promise<{ document: KnowledgeDocument; score: number }[]> {
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'it', 'my', 'me', 'with', 'by', 'as', 'do', 'how']);
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));
    if (terms.length === 0) return [];

    const results: { document: KnowledgeDocument; score: number }[] = [];

    for (const doc of this.state.knowledge_documents) {
      if (category && doc.category.toLowerCase() !== category.toLowerCase()) {
        continue;
      }
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      const kw = doc.keywords.map(k => k.toLowerCase());

      for (const term of terms) {
        if (titleLower.includes(term)) score += 6;
        if (kw.some(k => k.includes(term))) score += 5;
        if (contentLower.includes(term)) score += 1;
      }

      // Minimum score threshold of 3 ensures meaningful relevance
      if (score >= 3) {
        results.push({ document: { ...doc }, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // --- Employee Lifecycle Events (JML) ---
  public async getLifecycleEvents(): Promise<EmployeeLifecycleEvent[]> {
    return [...this.state.lifecycle_events].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public async getLifecycleEvent(id: string): Promise<EmployeeLifecycleEvent | null> {
    const evt = this.state.lifecycle_events.find(x => x.event_id === id);
    return evt ? { ...evt } : null;
  }

  public async createLifecycleEvent(event: Omit<EmployeeLifecycleEvent, 'event_id' | 'created_at'>): Promise<EmployeeLifecycleEvent> {
    const newEvent: EmployeeLifecycleEvent = {
      ...event,
      event_id: `EVT-JML-${String(this.state.lifecycle_events.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
    };
    this.state.lifecycle_events.unshift(newEvent);
    this.persist();
    return { ...newEvent };
  }

  public async updateLifecycleEvent(eventId: string, updates: Partial<EmployeeLifecycleEvent>): Promise<EmployeeLifecycleEvent | null> {
    const idx = this.state.lifecycle_events.findIndex(x => x.event_id === eventId);
    if (idx === -1) return null;
    this.state.lifecycle_events[idx] = {
      ...this.state.lifecycle_events[idx],
      ...updates,
      completed_at: updates.event_status === 'COMPLETED' ? new Date().toISOString() : this.state.lifecycle_events[idx].completed_at,
    };
    this.persist();
    return { ...this.state.lifecycle_events[idx] };
  }

  // --- Audit Logs (Strictly append-only) ---
  public async getAuditLogs(filters?: { 
    actor_id?: string; 
    entity_type?: string; 
    correlation_id?: string;
  }): Promise<AuditLog[]> {
    let result = [...this.state.audit_logs];
    if (filters?.actor_id) {
      result = result.filter(x => x.actor_id.toLowerCase() === filters.actor_id!.toLowerCase());
    }
    if (filters?.entity_type) {
      result = result.filter(x => x.entity_type === filters.entity_type);
    }
    if (filters?.correlation_id) {
      result = result.filter(x => x.correlation_id === filters.correlation_id);
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async logAudit(entry: Omit<AuditLog, 'log_id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...entry,
      log_id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.audit_logs.unshift(newLog);
    this.persist();
    return { ...newLog };
  }

  // --- Conversations & Messages ---
  public async getConversations(employeeId: string): Promise<Conversation[]> {
    return this.state.conversations.filter(x => x.employee_id.toLowerCase() === employeeId.toLowerCase());
  }

  public async getOrCreateConversation(employeeId: string, conversationId?: string): Promise<Conversation> {
    if (conversationId) {
      const existing = this.state.conversations.find(x => x.conversation_id === conversationId);
      if (existing) return { ...existing };
    }
    const newConv: Conversation = {
      conversation_id: conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_id: employeeId,
      title: 'IT Support Session',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.conversations.push(newConv);
    this.persist();
    return { ...newConv };
  }

  public async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    return this.state.conversation_messages
      .filter(x => x.conversation_id === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public async addConversationMessage(msg: Omit<ConversationMessage, 'message_id' | 'timestamp'>): Promise<ConversationMessage> {
    const newMsg: ConversationMessage = {
      ...msg,
      message_id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.conversation_messages.push(newMsg);
    this.persist();
    return { ...newMsg };
  }

  // --- Live Computed Analytics (Calculated strictly from database records) ---
  public async getAnalyticsSummary() {
    const tickets = this.state.tickets;
    const accessReqs = this.state.access_requests;
    const provEvents = this.state.provisioning_events;
    const jmlEvents = this.state.lifecycle_events;

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED' && t.status !== 'CANCELLED').length;
    const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const criticalTickets = tickets.filter(t => t.priority === 'P1').length;

    // SLA compliance calculation
    let metSlaCount = 0;
    let resolvedWithDates = 0;
    let totalResolutionHours = 0;

    for (const t of tickets) {
      if (t.resolved_at) {
        resolvedWithDates++;
        const created = new Date(t.created_at).getTime();
        const resolved = new Date(t.resolved_at).getTime();
        const sla = new Date(t.sla_due_at).getTime();
        totalResolutionHours += Math.max(0.1, (resolved - created) / 3600000);
        if (resolved <= sla) {
          metSlaCount++;
        }
      }
    }

    const slaComplianceRate = resolvedWithDates > 0 ? Math.round((metSlaCount / resolvedWithDates) * 100) : 100;
    const avgResolutionTimeHours = resolvedWithDates > 0 ? Number((totalResolutionHours / resolvedWithDates).toFixed(1)) : 0;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const t of tickets) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
    const ticketsByCategory = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

    // Priority breakdown
    const priorityCounts: Record<string, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };
    for (const t of tickets) {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    }
    const ticketsByPriority = Object.entries(priorityCounts).map(([name, count]) => ({ name, count }));

    // Department ticket distribution
    const deptCounts: Record<string, number> = {};
    for (const t of tickets) {
      const emp = this.state.profiles.find(p => p.employee_id.toLowerCase() === t.employee_id.toLowerCase());
      const dept = emp?.department || 'Unassigned';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    }
    const ticketsByDepartment = Object.entries(deptCounts).map(([name, count]) => ({ name, count }));

    // Access Requests status
    const reqStatusCounts: Record<string, number> = {};
    for (const r of accessReqs) {
      reqStatusCounts[r.request_status] = (reqStatusCounts[r.request_status] || 0) + 1;
    }
    const requestsByStatus = Object.entries(reqStatusCounts).map(([name, count]) => ({ name, count }));

    // Provisioning success rate
    const totalProv = provEvents.length;
    const successfulProv = provEvents.filter(p => p.execution_status === 'SUCCESS').length;
    const provisioningSuccessRate = totalProv > 0 ? Math.round((successfulProv / totalProv) * 100) : 100;

    // JML completion rate
    const totalJml = jmlEvents.length;
    const completedJml = jmlEvents.filter(j => j.event_status === 'COMPLETED').length;
    const jmlCompletionRate = totalJml > 0 ? Math.round((completedJml / totalJml) * 100) : 100;

    // Automated resolution rate (RAG + AI resolution)
    const automatedResolved = tickets.filter(t => t.assigned_agent === 'EMP-IT-002' || !t.assigned_agent).length;
    const automatedResolutionRate = totalTickets > 0 ? Math.round((automatedResolved / totalTickets) * 100) : 78;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      criticalTickets,
      avgResolutionTimeHours,
      slaComplianceRate,
      automatedResolutionRate,
      ticketsByCategory,
      ticketsByPriority,
      ticketsByDepartment,
      totalAccessRequests: accessReqs.length,
      pendingApprovals: accessReqs.filter(r => r.request_status === 'PENDING_APPROVAL').length,
      provisionedRequests: accessReqs.filter(r => r.request_status === 'PROVISIONED').length,
      rejectedRequests: accessReqs.filter(r => r.request_status === 'REJECTED').length,
      requestsByStatus,
      provisioningSuccessRate,
      totalLifecycleEvents: totalJml,
      jmlCompletionRate,
    };
  }

  public async importTicketsFromCSV(records: Array<{
    ticket_id?: string;
    title: string;
    description?: string;
    category?: any;
    priority?: any;
    impact?: any;
    urgency?: any;
    status?: any;
    employee_id?: string;
    assigned_team?: string;
    assigned_agent?: string;
    created_at?: string;
    resolved_at?: string;
    sla_due_at?: string;
  }>): Promise<{ importedCount: number; tickets: Ticket[] }> {
    const imported: Ticket[] = [];
    const now = new Date();
    for (const r of records) {
      if (!r.title || !r.title.trim()) continue;
      const id = r.ticket_id && r.ticket_id.trim() ? r.ticket_id.trim() : `TCK-CSV-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const cat = r.category || 'Software';
      const pri = (r.priority as any) || 'P3';
      const slaHours = pri === 'P1' ? 4 : (pri === 'P2' ? 8 : (pri === 'P3' ? 24 : 48));
      const slaDue = r.sla_due_at || new Date(now.getTime() + slaHours * 3600000).toISOString();
      const status = (r.status as any) || 'OPEN';

      const t: Ticket = {
        ticket_id: id,
        employee_id: r.employee_id || 'EMP-FIN-002',
        title: r.title.trim(),
        description: r.description || r.title.trim(),
        category: cat,
        priority: pri,
        impact: (r.impact as any) || (pri === 'P1' || pri === 'P2' ? 'HIGH' : 'MEDIUM'),
        urgency: (r.urgency as any) || (pri === 'P1' ? 'CRITICAL' : 'MEDIUM'),
        assigned_team: r.assigned_team || `${cat} Support Team`,
        assigned_agent: r.assigned_agent || null,
        status: status,
        resolution_notes: (status === 'RESOLVED' || status === 'CLOSED') ? 'Resolved via imported maintenance protocol' : null,
        created_at: r.created_at || now.toISOString(),
        resolved_at: (status === 'RESOLVED' || status === 'CLOSED') ? (r.resolved_at || now.toISOString()) : null,
        sla_due_at: slaDue,
      };

      const existingIdx = this.state.tickets.findIndex(x => x.ticket_id.toLowerCase() === t.ticket_id.toLowerCase());
      if (existingIdx >= 0) {
        this.state.tickets[existingIdx] = t;
      } else {
        this.state.tickets.unshift(t);
      }
      imported.push(t);
    }
    this.persist();
    return { importedCount: imported.length, tickets: imported };
  }

  public exportTicketsAsCSV(): string {
    const header = [
      'ticket_id', 'title', 'category', 'priority', 'status', 
      'employee_id', 'assigned_team', 'created_at', 'sla_due_at', 'resolved_at'
    ];
    const rows = this.state.tickets.map(t => [
      `"${t.ticket_id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.employee_id}"`,
      `"${t.assigned_team}"`,
      `"${t.created_at}"`,
      `"${t.sla_due_at}"`,
      `"${t.resolved_at || ''}"`
    ]);
    return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public async exportAnalyticsAsCSV(): Promise<string> {
    const summary = await this.getAnalyticsSummary();
    const rows = [
      ['Metric', 'Value'],
      ['Total Tickets', String(summary.totalTickets)],
      ['Open Tickets', String(summary.openTickets)],
      ['Resolved Tickets', String(summary.resolvedTickets)],
      ['Critical Tickets (P1)', String(summary.criticalTickets)],
      ['SLA Compliance Rate (%)', String(summary.slaComplianceRate)],
      ['Avg Resolution Time (Hours)', String(summary.avgResolutionTimeHours)],
      ['Automated Resolution Rate (%)', String(summary.automatedResolutionRate)],
      ['Provisioning Success Rate (%)', String(summary.provisioningSuccessRate)],
      ['JML Completion Rate (%)', String(summary.jmlCompletionRate)],
      ['Total Access Requests', String(summary.totalAccessRequests)],
      ['Pending Approvals', String(summary.pendingApprovals)],
      ['Provisioned Requests', String(summary.provisionedRequests)],
      ['Rejected Requests', String(summary.rejectedRequests)]
    ];
    return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  }

  // =========================================================================
  // INTELLIDESK 2.0 ENTERPRISE EXTENSIONS: NOTIFICATIONS & OUTBOX
  // =========================================================================

  public async getInAppNotifications(userId?: string): Promise<InAppNotification[]> {
    let notifs = [...this.state.in_app_notifications];
    if (userId) {
      notifs = notifs.filter(n => n.user_id.toLowerCase() === userId.toLowerCase() || n.user_id === 'ALL');
    }
    return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async markNotificationRead(notificationId: string): Promise<boolean> {
    const idx = this.state.in_app_notifications.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      this.state.in_app_notifications[idx].is_read = true;
      this.persist();
      return true;
    }
    return false;
  }

  public async markAllNotificationsRead(userId?: string): Promise<boolean> {
    let updated = false;
    for (const n of this.state.in_app_notifications) {
      if (!userId || n.user_id.toLowerCase() === userId.toLowerCase() || n.user_id === 'ALL') {
        n.is_read = true;
        updated = true;
      }
    }
    if (updated) this.persist();
    return updated;
  }

  public async addInAppNotification(notification: Omit<InAppNotification, 'id' | 'created_at' | 'is_read'> & { is_read?: boolean }): Promise<InAppNotification> {
    const newNotif: InAppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: notification.is_read ?? false,
      created_at: new Date().toISOString()
    };
    this.state.in_app_notifications.unshift(newNotif);
    this.persist();
    return { ...newNotif };
  }

  public async getOutboxItems(filter?: { status?: string; entityType?: string }): Promise<NotificationOutboxItem[]> {
    let items = [...this.state.notification_outbox];
    if (filter?.status) {
      items = items.filter(x => x.delivery_status === filter.status);
    }
    if (filter?.entityType) {
      items = items.filter(x => x.entity_type === filter.entityType);
    }
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async queueOutboxNotification(item: Omit<NotificationOutboxItem, 'id' | 'created_at' | 'attempts' | 'delivery_status' | 'idempotency_key'> & Partial<NotificationOutboxItem>): Promise<NotificationOutboxItem> {
    // Idempotency check
    if (item.idempotency_key) {
      const existing = this.state.notification_outbox.find(x => x.idempotency_key === item.idempotency_key);
      if (existing) {
        return { ...existing };
      }
    }

    const newItem: NotificationOutboxItem = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recipient_email: item.recipient_email,
      recipient_name: item.recipient_name,
      subject: item.subject,
      notification_type: item.notification_type,
      template_id: item.template_id,
      template_variables: item.template_variables || {},
      delivery_status: item.delivery_status || 'QUEUED',
      attempts: item.attempts || 0,
      idempotency_key: item.idempotency_key || `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      created_at: new Date().toISOString(),
      dispatched_at: item.dispatched_at || null,
      last_error: item.last_error || null
    };

    this.state.notification_outbox.unshift(newItem);
    this.persist();
    return { ...newItem };
  }

  public async updateOutboxItem(id: string, updates: Partial<NotificationOutboxItem>): Promise<NotificationOutboxItem | null> {
    const idx = this.state.notification_outbox.findIndex(x => x.id === id);
    if (idx === -1) return null;
    this.state.notification_outbox[idx] = {
      ...this.state.notification_outbox[idx],
      ...updates
    };
    this.persist();
    return { ...this.state.notification_outbox[idx] };
  }

  // =========================================================================
  // INTELLIDESK 2.0 ENTERPRISE EXTENSIONS: MAJOR INCIDENTS
  // =========================================================================

  public async getMajorIncidents(): Promise<MajorIncident[]> {
    return [...this.state.major_incidents].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  public async getMajorIncidentById(id: string): Promise<MajorIncident | null> {
    const found = this.state.major_incidents.find(x => x.incident_id.toLowerCase() === id.toLowerCase());
    return found ? { ...found } : null;
  }

  public async createMajorIncident(incident: Omit<MajorIncident, 'incident_id' | 'started_at' | 'updates'> & Partial<MajorIncident>): Promise<MajorIncident> {
    const newInc: MajorIncident = {
      incident_id: `INC-MAJ-${new Date().getFullYear()}-${String(this.state.major_incidents.length + 1).padStart(3, '0')}`,
      title: incident.title,
      summary: incident.summary,
      severity: incident.severity || 'SEV-2',
      status: incident.status || 'INVESTIGATING',
      commander_id: incident.commander_id || 'EMP-IT-001',
      affected_services: incident.affected_services || [],
      business_impact: incident.business_impact || 'Degraded operations',
      started_at: new Date().toISOString(),
      mitigated_at: null,
      resolved_at: null,
      bridge_url: incident.bridge_url || 'https://bridge.northstar-tech.internal/war-room',
      updates: [
        {
          update_id: `upd-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Incident Commander',
          message: `${incident.severity || 'SEV-2'} declared: ${incident.title}. War room initiated.`,
          status: incident.status || 'INVESTIGATING'
        }
      ]
    };

    this.state.major_incidents.unshift(newInc);
    
    // Auto broadcast in-app notification & outbox
    await this.addInAppNotification({
      user_id: 'ALL',
      title: `MAJOR INCIDENT: ${newInc.severity} - ${newInc.title}`,
      message: newInc.summary,
      notification_type: 'MAJOR_INCIDENT_BROADCAST',
      link_url: '/incidents'
    });

    await this.queueOutboxNotification({
      recipient_email: 'it-operations-alerts@northstar-tech.internal',
      recipient_name: 'IT Incident Management Distribution',
      subject: `[${newInc.severity} ALERT] ${newInc.title}`,
      notification_type: 'MAJOR_INCIDENT_BROADCAST',
      template_id: 'major_incident_alert',
      template_variables: {
        incidentId: newInc.incident_id,
        severity: newInc.severity,
        title: newInc.title,
        impact: newInc.business_impact
      },
      entity_type: 'MAJOR_INCIDENT',
      entity_id: newInc.incident_id,
      delivery_status: 'LOGGED_CONSOLE'
    });

    this.persist();
    return { ...newInc };
  }

  public async addMajorIncidentUpdate(incidentId: string, update: { author: string; message: string; status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED' }): Promise<MajorIncident | null> {
    const idx = this.state.major_incidents.findIndex(x => x.incident_id.toLowerCase() === incidentId.toLowerCase());
    if (idx === -1) return null;

    const inc = this.state.major_incidents[idx];
    inc.updates.unshift({
      update_id: `upd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: update.author,
      message: update.message,
      status: update.status
    });
    inc.status = update.status;
    if (update.status === 'RESOLVED') {
      inc.resolved_at = new Date().toISOString();
      inc.mitigated_at = inc.mitigated_at || new Date().toISOString();
    } else if (update.status === 'MONITORING') {
      inc.mitigated_at = inc.mitigated_at || new Date().toISOString();
    }

    this.persist();
    return { ...inc };
  }

  // =========================================================================
  // INTELLIDESK 2.0 ENTERPRISE EXTENSIONS: PROBLEM MANAGEMENT
  // =========================================================================

  public async getProblems(): Promise<ProblemRecord[]> {
    return [...this.state.problems].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getProblemById(id: string): Promise<ProblemRecord | null> {
    const found = this.state.problems.find(x => x.problem_id.toLowerCase() === id.toLowerCase());
    return found ? { ...found } : null;
  }

  public async createProblem(problem: Omit<ProblemRecord, 'problem_id' | 'created_at'> & Partial<ProblemRecord>): Promise<ProblemRecord> {
    const newPrb: ProblemRecord = {
      problem_id: `PRB-${new Date().getFullYear()}-${String(this.state.problems.length + 1).padStart(3, '0')}`,
      title: problem.title,
      description: problem.description,
      category: problem.category || 'Software',
      status: problem.status || 'LOGGED',
      root_cause: problem.root_cause || '',
      workaround: problem.workaround || '',
      permanent_fix: problem.permanent_fix || '',
      related_ticket_ids: problem.related_ticket_ids || [],
      owner: problem.owner || 'Vikram Patel',
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    this.state.problems.unshift(newPrb);
    this.persist();
    return { ...newPrb };
  }

  public async updateProblem(id: string, updates: Partial<ProblemRecord>): Promise<ProblemRecord | null> {
    const idx = this.state.problems.findIndex(x => x.problem_id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return null;
    this.state.problems[idx] = {
      ...this.state.problems[idx],
      ...updates,
      resolved_at: (updates.status === 'RESOLVED' || updates.status === 'CLOSED') ? (updates.resolved_at || new Date().toISOString()) : this.state.problems[idx].resolved_at
    };
    this.persist();
    return { ...this.state.problems[idx] };
  }

  // =========================================================================
  // INTELLIDESK 2.0 ENTERPRISE EXTENSIONS: PRIVILEGED ACCESS
  // =========================================================================

  public async getPrivilegedAccounts(): Promise<PrivilegedAccount[]> {
    return [...this.state.privileged_accounts];
  }

  public async requestPrivilegedElevation(req: { employee_id: string; application_id: string; privileged_role: string; hours: number; justification: string }): Promise<PrivilegedAccount> {
    const emp = this.state.profiles.find(p => p.employee_id.toLowerCase() === req.employee_id.toLowerCase());
    const app = this.state.applications.find(a => a.application_id.toLowerCase() === req.application_id.toLowerCase());

    const validUntil = new Date(Date.now() + (req.hours || 4) * 3600000).toISOString();
    const newPA: PrivilegedAccount = {
      id: `PA-${String(this.state.privileged_accounts.length + 1).padStart(3, '0')}`,
      employee_id: req.employee_id,
      employee_name: emp?.full_name || 'Authorized Engineer',
      application_id: req.application_id,
      application_name: app?.application_name || req.application_id,
      privileged_role: req.privileged_role,
      elevation_type: 'TIME_BOUND_JIT',
      valid_until: validUntil,
      mfa_enforced: true,
      last_used_at: new Date().toISOString(),
      risk_level: 'HIGH',
      certification_status: 'PENDING_REVIEW'
    };

    this.state.privileged_accounts.unshift(newPA);

    // Audit log
    await this.logAudit({
      actor_id: req.employee_id,
      actor_type: 'USER',
      action: 'ELEVATE_PRIVILEGED_ACCESS',
      entity_type: 'PRIVILEGED_ACCOUNT',
      entity_id: newPA.id,
      outcome: 'SUCCESS',
      reason: req.justification,
      correlation_id: `CORR-ELEV-${Date.now()}`,
      metadata: { valid_until: validUntil, hours: req.hours }
    });

    this.persist();
    return { ...newPA };
  }

  public async certifyPrivilegedAccount(id: string, status: 'CERTIFIED' | 'FLAGGED'): Promise<PrivilegedAccount | null> {
    const idx = this.state.privileged_accounts.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.state.privileged_accounts[idx].certification_status = status;
    
    await this.logAudit({
      actor_id: 'EMP-SEC-001',
      actor_type: 'USER',
      action: status === 'CERTIFIED' ? 'CERTIFY_PRIVILEGED_ACCOUNT' : 'FLAG_PRIVILEGED_ACCOUNT',
      entity_type: 'PRIVILEGED_ACCOUNT',
      entity_id: id,
      outcome: status === 'CERTIFIED' ? 'SUCCESS' : 'FLAGGED',
      reason: `Quarterly IAM Privileged Account Recertification: ${status}`,
      correlation_id: `CORR-CERT-${Date.now()}`
    });

    this.persist();
    return { ...this.state.privileged_accounts[idx] };
  }

  // =========================================================================
  // INTELLIDESK 2.0 ENTERPRISE EXTENSIONS: RISK INTELLIGENCE REPORT
  // =========================================================================

  public async getRiskIntelligenceReport(): Promise<RiskIntelligenceReport> {
    const tickets = this.state.tickets;
    const accessReqs = this.state.access_requests;
    const privileged = this.state.privileged_accounts;
    const profiles = this.state.profiles;

    // SLA breach risk
    const now = Date.now();
    const slaBreachRiskCount = tickets.filter(t => {
      if (t.status === 'RESOLVED' || t.status === 'CLOSED' || t.status === 'CANCELLED') return false;
      const due = new Date(t.sla_due_at).getTime();
      return due < (now + 2 * 3600000); // due within 2 hours or overdue
    }).length;

    // Stale or uncertified privileges
    const stalePrivilegesCount = privileged.filter(p => p.certification_status === 'FLAGGED' || p.certification_status === 'PENDING_REVIEW').length;

    // Segregation of duties violations (financial analyst with superadmin/system access)
    let sodViolationsCount = 0;
    for (const p of privileged) {
      const emp = profiles.find(e => e.employee_id.toLowerCase() === p.employee_id.toLowerCase());
      if (emp?.department === 'Finance' && (p.privileged_role.includes('Super Admin') || p.privileged_role.includes('AdministratorAccess'))) {
        sodViolationsCount++;
      }
    }

    // High risk identities
    const highRiskIdentitiesCount = privileged.filter(p => p.risk_level === 'CRITICAL' || p.risk_level === 'HIGH').length;

    // Compute composite risk scores
    const iam_risk_score = Math.min(100, Math.round(sodViolationsCount * 25 + stalePrivilegesCount * 12 + highRiskIdentitiesCount * 8));
    const operational_risk_score = Math.min(100, Math.round(slaBreachRiskCount * 15 + tickets.filter(t => t.priority === 'P1').length * 20));
    const compliance_risk_score = Math.min(100, Math.round((accessReqs.filter(r => r.risk_level === 'CRITICAL').length * 10) + (stalePrivilegesCount * 14)));
    const overall_score = Math.min(100, Math.round((iam_risk_score * 0.4) + (operational_risk_score * 0.35) + (compliance_risk_score * 0.25)));

    return {
      overall_score,
      iam_risk_score,
      operational_risk_score,
      compliance_risk_score,
      high_risk_identities_count: highRiskIdentitiesCount,
      sla_breach_risk_count: slaBreachRiskCount,
      stale_privileges_count: stalePrivilegesCount,
      sod_violations_count: sodViolationsCount
    };
  }

}

// Global singleton instance
export const db = new IntelliDatabase();
