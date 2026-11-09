-- ==============================================================================
-- INTELLIDESK AI: ONE-CLICK DEMO RE-SEED ENGINE (ATOMIC RESET RPC)
-- Target: Supabase PostgreSQL (Security Definer RPC)
-- Organization: Northstar Technologies
-- ==============================================================================

CREATE OR REPLACE FUNCTION reset_demo_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_timestamp TIMESTAMPTZ := NOW();
    v_result JSONB;
BEGIN
    -- 1. Truncate operational tables within single atomic transaction
    -- Handle standard schema table names and common aliases
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'approvals') THEN
        TRUNCATE TABLE approvals RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'approval_steps') THEN
        TRUNCATE TABLE approval_steps RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'provisioning_events') THEN
        TRUNCATE TABLE provisioning_events RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'access_requests') THEN
        TRUNCATE TABLE access_requests RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employee_lifecycle_events') THEN
        TRUNCATE TABLE employee_lifecycle_events RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lifecycle_events') THEN
        TRUNCATE TABLE lifecycle_events RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets') THEN
        TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'it_tickets') THEN
        TRUNCATE TABLE it_tickets RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employee_access') THEN
        TRUNCATE TABLE employee_access RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_app_entitlements') THEN
        TRUNCATE TABLE user_app_entitlements RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_messages') THEN
        TRUNCATE TABLE conversation_messages RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
        TRUNCATE TABLE conversations RESTART IDENTITY CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agent_runs') THEN
        TRUNCATE TABLE agent_runs RESTART IDENTITY CASCADE;
    END IF;

    -- 2. Idempotently re-insert baseline entitlements
    -- Alice Chen (EMP-FIN-002: Finance - Slack, Google Workspace, Workday, Snowflake, SAP)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employee_access') THEN
        INSERT INTO employee_access (access_id, employee_id, application_id, permission_id, status, granted_at, granted_by)
        VALUES
            ('a0000000-0000-0000-0000-000000000001', 'EMP-FIN-002', 'APP-M365', 'PERM-M365-FIN', 'ACTIVE', v_timestamp - INTERVAL '90 days', 'HR_BASELINE_SYSTEM'),
            ('a0000000-0000-0000-0000-000000000002', 'EMP-FIN-002', 'APP-WD', 'PERM-WD-BASE', 'ACTIVE', v_timestamp - INTERVAL '90 days', 'HR_BASELINE_SYSTEM'),
            ('a0000000-0000-0000-0000-000000000003', 'EMP-FIN-002', 'APP-SNOW', 'PERM-SNOW-ANALYST', 'ACTIVE', v_timestamp - INTERVAL '60 days', 'HR_BASELINE_SYSTEM'),
            ('a0000000-0000-0000-0000-000000000004', 'EMP-FIN-002', 'APP-SAP', 'PERM-SAP-READ', 'ACTIVE', v_timestamp - INTERVAL '90 days', 'HR_BASELINE_SYSTEM'),
            ('a0000000-0000-0000-0000-000000000005', 'EMP-FIN-002', 'APP-PBI', 'PERM-PBI-FIN', 'ACTIVE', v_timestamp - INTERVAL '90 days', 'HR_BASELINE_SYSTEM'),
            -- Vikram Patel (EMP-IT-001: IT Lead - Jira, Datadog/Cloud, AWS, Slack/M365)
            ('a0000000-0000-0000-0000-000000000020', 'EMP-IT-001', 'APP-JIRA', 'PERM-JIRA-AGENT', 'ACTIVE', v_timestamp - INTERVAL '365 days', 'SECURITY_ADMIN'),
            ('a0000000-0000-0000-0000-000000000021', 'EMP-IT-001', 'APP-M365', 'PERM-M365-ADMIN', 'ACTIVE', v_timestamp - INTERVAL '365 days', 'SECURITY_ADMIN'),
            ('a0000000-0000-0000-0000-000000000022', 'EMP-IT-001', 'APP-AWS', 'PERM-AWS-PROD-ADMIN', 'ACTIVE', v_timestamp - INTERVAL '180 days', 'SECURITY_ADMIN'),
            ('a0000000-0000-0000-0000-000000000023', 'EMP-IT-001', 'APP-GH', 'PERM-GH-DEV', 'ACTIVE', v_timestamp - INTERVAL '365 days', 'SECURITY_ADMIN'),
            -- Sarah Jenkins (EMP-FIN-001: Finance Director)
            ('a0000000-0000-0000-0000-000000000030', 'EMP-FIN-001', 'APP-SAP', 'PERM-SAP-CLOSE', 'ACTIVE', v_timestamp - INTERVAL '365 days', 'SECURITY_ADMIN'),
            ('a0000000-0000-0000-0000-000000000031', 'EMP-FIN-001', 'APP-PBI', 'PERM-PBI-FIN', 'ACTIVE', v_timestamp - INTERVAL '365 days', 'SECURITY_ADMIN'),
            ('a0000000-0000-0000-0000-000000000032', 'EMP-FIN-001', 'APP-M365', 'PERM-M365-FIN', 'ACTIVE', v_timestamp - INTERVAL '365 days', 'SECURITY_ADMIN')
        ON CONFLICT (access_id) DO NOTHING;
    END IF;

    -- 3. Insert baseline High-priority IT ticket assigned to Vikram Patel
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets') THEN
        INSERT INTO tickets (
            ticket_id, employee_id, title, description, category, priority,
            impact, urgency, assigned_team, assigned_agent, status,
            resolution_notes, created_at, sla_due_at
        ) VALUES (
            'TCK-IT-BASELINE-01',
            'EMP-FIN-002',
            'Production VPN Gateway Latency & DNS Resolution Drops',
            'Multiple financial analysts experiencing SSL handshake failure during ERP settlement runs.',
            'VPN',
            'P2',
            'HIGH',
            'HIGH',
            'Network and Security Team',
            'EMP-IT-001',
            'IN_PROGRESS',
            'Investigating gateway failover route and primary radius authentication server.',
            v_timestamp - INTERVAL '2 hours',
            v_timestamp + INTERVAL '2 hours'
        ) ON CONFLICT (ticket_id) DO NOTHING;
    END IF;

    -- 4. Insert pending access request from Alice Chen requiring Sarah Jenkins approval
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'access_requests') THEN
        INSERT INTO access_requests (
            request_id, employee_id, application_id, permission_id,
            business_justification, request_type, risk_level,
            request_status, idempotency_key, current_approval_stage,
            total_stages_required, created_at
        ) VALUES (
            'REQ-DEMO-BASELINE-01',
            'EMP-FIN-002',
            'APP-SAP',
            'PERM-SAP-POST',
            'Q4 financial period journal entries and ledger reconciliation posting approval.',
            'GRANT',
            'MEDIUM',
            'PENDING_APPROVAL',
            'IDEMP-DEMO-RESET-ALICE-SAP-01',
            1,
            1,
            v_timestamp - INTERVAL '3 hours'
        ) ON CONFLICT (request_id) DO NOTHING;

        -- Create the corresponding approval record for Sarah Jenkins
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'approvals') THEN
            INSERT INTO approvals (
                approval_id, request_id, approver_id, approval_type,
                stage_number, approval_status, comments, created_at
            ) VALUES (
                'b0000000-0000-0000-0000-000000000001',
                'REQ-DEMO-BASELINE-01',
                'EMP-FIN-001',
                'MANAGER',
                1,
                'PENDING',
                'Awaiting managerial review for journal entry posting entitlement.',
                v_timestamp - INTERVAL '3 hours'
            ) ON CONFLICT (approval_id) DO NOTHING;
        END IF;
    END IF;

    -- 5. Append initial DEMO_DATA_RESET audit log
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        INSERT INTO audit_logs (
            log_id, actor_id, actor_type, action, entity_type,
            entity_id, outcome, reason, correlation_id, metadata, timestamp
        ) VALUES (
            gen_random_uuid(),
            'ADMIN-RESET-ENGINE',
            'SYSTEM',
            'DEMO_DATA_RESET',
            'ORGANIZATION_STATE',
            'NORTHSTAR-TECH',
            'SUCCESS',
            'Full atomic re-seed performed: operational records reset to baseline state.',
            'CORR-RESET-' || floor(extract(epoch from v_timestamp))::TEXT,
            jsonb_build_object(
                'environment', 'DEMO',
                'initiator', 'One-Click Demo Re-Seed Engine',
                'reset_scope', 'FULL_OPERATIONAL_RESET'
            ),
            v_timestamp
        );
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'timestamp', v_timestamp::TEXT,
        'organization', 'Northstar Technologies',
        'message', 'Demo data successfully reset to clean baseline state.'
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION reset_demo_data() IS 'Atomically resets Northstar Technologies operational demo data to pristine baseline state';

