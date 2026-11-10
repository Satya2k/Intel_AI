-- =========================================================================
-- INTELLIDESK AI 2.0 ENTERPRISE EXTENSION MIGRATION
-- Adds Major Incidents, Problem Records, Privileged Access, and Notifications
-- =========================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Major Incidents Table
CREATE TABLE IF NOT EXISTS major_incidents (
    incident_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('SEV-1', 'SEV-2', 'SEV-3')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED')),
    commander_id VARCHAR(50) NOT NULL,
    affected_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    business_impact TEXT NOT NULL,
    bridge_url TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mitigated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    updates JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Problem Records Table (ITIL Problem Management)
CREATE TABLE IF NOT EXISTS problem_records (
    problem_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('LOGGED', 'INVESTIGATING', 'KNOWN_ERROR', 'RESOLVED', 'CLOSED')),
    root_cause TEXT,
    workaround TEXT,
    permanent_fix TEXT,
    related_ticket_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    owner VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 3. Privileged Accounts & Elevation Table
CREATE TABLE IF NOT EXISTS privileged_accounts (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    application_id VARCHAR(50) NOT NULL,
    application_name VARCHAR(150) NOT NULL,
    privileged_role VARCHAR(100) NOT NULL,
    elevation_type VARCHAR(30) NOT NULL CHECK (elevation_type IN ('PERMANENT', 'TIME_BOUND_JIT')),
    valid_until TIMESTAMPTZ,
    mfa_enforced BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    certification_status VARCHAR(30) NOT NULL CHECK (certification_status IN ('CERTIFIED', 'PENDING_REVIEW', 'FLAGGED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. In-App Notifications Table
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Transactional Notification Outbox Table (Outbox Pattern)
CREATE TABLE IF NOT EXISTS notification_outbox (
    id VARCHAR(50) PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'QUEUED' CHECK (delivery_status IN ('QUEUED', 'SENT', 'FAILED', 'LOGGED_CONSOLE')),
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_major_incidents_status ON major_incidents(status);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problem_records(status);
CREATE INDEX IF NOT EXISTS idx_privileged_accounts_emp ON privileged_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifs_user ON in_app_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_outbox_delivery_status ON notification_outbox(delivery_status, attempts);

-- Enable RLS
ALTER TABLE major_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE privileged_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated/anon roles in demo environment
CREATE POLICY "Public Read Major Incidents" ON major_incidents FOR SELECT USING (true);
CREATE POLICY "Public Read Problems" ON problem_records FOR SELECT USING (true);
CREATE POLICY "Public Read Privileged Accounts" ON privileged_accounts FOR SELECT USING (true);
CREATE POLICY "Public Read Notifications" ON in_app_notifications FOR SELECT USING (true);
CREATE POLICY "Public Read Outbox" ON notification_outbox FOR SELECT USING (true);
