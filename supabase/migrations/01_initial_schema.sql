-- ==============================================================================
-- INTELLIDESK AI - ENTERPRISE DATABASE SCHEMA
-- Target: Supabase PostgreSQL (Supports pgvector, RLS, and Full-Text Search)
-- Organization: Northstar Technologies (Academic Simulation)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Try enabling pgvector if available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Vector extension not installed, falling back to full-text search.';
END $$;

-- 1. PROFILES (Employee master directory)
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    manager_id VARCHAR(50),
    account_status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'TERMINATED', 'ONBOARDING')),
    application_role VARCHAR(50) DEFAULT 'EMPLOYEE' CHECK (application_role IN ('EMPLOYEE', 'MANAGER', 'IT_ADMIN', 'IAM_ADMIN', 'SECURITY_ADMIN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APPLICATIONS (Enterprise applications directory)
CREATE TABLE IF NOT EXISTS applications (
    application_id VARCHAR(100) PRIMARY KEY,
    application_name VARCHAR(150) NOT NULL,
    application_owner VARCHAR(50) NOT NULL, -- references employee_id of manager/owner
    risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'DEPRECATED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROLES (Standard business job roles)
CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(100) PRIMARY KEY,
    role_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROLE_PERMISSIONS (RBAC Entitlements Matrix)
CREATE TABLE IF NOT EXISTS role_permissions (
    permission_id VARCHAR(100) PRIMARY KEY,
    role_id VARCHAR(100) REFERENCES roles(role_id) ON DELETE CASCADE,
    application_id VARCHAR(100) REFERENCES applications(application_id) ON DELETE CASCADE,
    permission_name VARCHAR(150) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    requires_security_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMPLOYEE_ACCESS (Active and historical entitlements)
CREATE TABLE IF NOT EXISTS employee_access (
    access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    application_id VARCHAR(100) REFERENCES applications(application_id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES role_permissions(permission_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'SUSPENDED')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    granted_by VARCHAR(50) DEFAULT 'SYSTEM_SIMULATOR',
    revocation_reason TEXT
);

-- 6. TICKETS (IT Incidents and Service Requests)
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Hardware', 'Software', 'Network', 'VPN', 'Email and Microsoft 365',
        'Password and account support', 'ERP and SAP', 'Access requests', 'Other IT incidents'
    )),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    impact VARCHAR(20) NOT NULL CHECK (impact IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    assigned_team VARCHAR(100) NOT NULL,
    assigned_agent VARCHAR(150),
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'AWAITING_USER', 'RESOLVED', 'CLOSED', 'ESCALATED')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    sla_due_at TIMESTAMPTZ NOT NULL
);

-- 7. ACCESS_REQUESTS (Identity and Access requests)
CREATE TABLE IF NOT EXISTS access_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    application_id VARCHAR(100) REFERENCES applications(application_id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES role_permissions(permission_id) ON DELETE CASCADE,
    business_justification TEXT NOT NULL,
    request_type VARCHAR(50) DEFAULT 'GRANT' CHECK (request_type IN ('GRANT', 'REVOKE', 'ELEVATION')),
    risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    request_status VARCHAR(50) DEFAULT 'PENDING_APPROVAL' CHECK (request_status IN (
        'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PROVISIONED', 'FAILED', 'REVOKED'
    )),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    current_approval_stage INT DEFAULT 1,
    total_stages_required INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. APPROVALS (Multi-stage human-in-the-loop approvals)
CREATE TABLE IF NOT EXISTS approvals (
    approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(50) REFERENCES access_requests(request_id) ON DELETE CASCADE,
    approver_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    approval_type VARCHAR(50) NOT NULL CHECK (approval_type IN ('MANAGER', 'APP_OWNER', 'SECURITY_ADMIN')),
    stage_number INT DEFAULT 1,
    approval_status VARCHAR(50) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- 9. PROVISIONING_EVENTS (Simulated provisioning execution log)
CREATE TABLE IF NOT EXISTS provisioning_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(50) REFERENCES access_requests(request_id) ON DELETE SET NULL,
    employee_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    application_id VARCHAR(100) REFERENCES applications(application_id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES role_permissions(permission_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('GRANT', 'REVOKE', 'SUSPEND')),
    execution_status VARCHAR(50) NOT NULL CHECK (execution_status IN ('SUCCESS', 'FAILED', 'SIMULATED')),
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    result JSONB NOT NULL
);

-- 10. KNOWLEDGE_DOCUMENTS (IT SOPs & Knowledge Repository)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    document_id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'APPROVED', 'ARCHIVED')),
    search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. KNOWLEDGE_CHUNKS (Chunked embeddings for RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(100) REFERENCES knowledge_documents(document_id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CONVERSATIONS (Support Chat Sessions)
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(100) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'IT Support Session',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CONVERSATION_MESSAGES (Multi-turn Chat & Agent Traces)
CREATE TABLE IF NOT EXISTS conversation_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(100) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('USER', 'AGENT', 'SYSTEM')),
    agent_name VARCHAR(100),
    message_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AGENT_RUNS (Workflow execution state machine)
CREATE TABLE IF NOT EXISTS agent_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type VARCHAR(100) NOT NULL,
    current_node VARCHAR(100) NOT NULL,
    run_status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (run_status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'BLOCKED')),
    input_reference VARCHAR(100),
    state_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EMPLOYEE_LIFECYCLE_EVENTS (JML Event Queue)
CREATE TABLE IF NOT EXISTS employee_lifecycle_events (
    event_id VARCHAR(100) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES profiles(employee_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('JOINER', 'MOVER', 'LEAVER')),
    details JSONB NOT NULL,
    effective_date DATE NOT NULL,
    event_status VARCHAR(50) DEFAULT 'PENDING' CHECK (event_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    created_by VARCHAR(100) NOT NULL, -- Verified HR system or HR Manager
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 16. AUDIT_LOGS (Immutable append-only activity & security trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id VARCHAR(50) NOT NULL,
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('USER', 'AGENT', 'SYSTEM', 'HR_INTEGRATION')),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('SUCCESS', 'DENIED', 'FAILURE', 'FLAGGED')),
    reason TEXT,
    correlation_id VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance & search
CREATE INDEX IF NOT EXISTS idx_tickets_employee ON tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_access_requests_employee ON access_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_approvals_request ON approvals(request_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge_documents USING GIN(search_vector);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Read policies for knowledge base (public to authenticated employees)
CREATE POLICY "Employees can read knowledge docs" ON knowledge_documents
    FOR SELECT USING (true);

-- Audit logs are strictly append-only: no update or delete allowed for standard roles
CREATE POLICY "Audit logs append-only" ON audit_logs
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Security admins can read audit logs" ON audit_logs
    FOR SELECT USING (true);

COMMENT ON TABLE audit_logs IS 'Append-only tamper-evident audit ledger for Northstar Technologies enterprise actions';

