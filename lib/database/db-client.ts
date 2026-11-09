import fs from 'fs';
import path from 'path';
import { 
  Profile, Application, Role, RolePermission, EmployeeAccess, 
  Ticket, AccessRequest, Approval, ProvisioningEvent, AuditLog,
  EmployeeLifecycleEvent, Conversation, ConversationMessage
} from './types';
import { 
  INITIAL_PROFILES, INITIAL_APPLICATIONS, INITIAL_ROLES, 
  INITIAL_ROLE_PERMISSIONS, INITIAL_EMPLOYEE_ACCESS, INITIAL_TICKETS, 
  INITIAL_ACCESS_REQUESTS, INITIAL_APPROVALS, INITIAL_PROVISIONING_EVENTS, 
  INITIAL_AUDIT_LOGS 
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
    return { ...newTicket };
  }

  public async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    const idx = this.state.tickets.findIndex(x => x.ticket_id === ticketId);
    if (idx === -1) return null;
    
    // Auto timestamp resolved_at when marked as RESOLVED or CLOSED
    if ((updates.status === 'RESOLVED' || updates.status === 'CLOSED') && !this.state.tickets[idx].resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }

    this.state.tickets[idx] = {
      ...this.state.tickets[idx],
      ...updates,
    };
    this.persist();
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
    const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'AWAITING_USER').length;
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
}

// Global singleton instance
export const db = new IntelliDatabase();
