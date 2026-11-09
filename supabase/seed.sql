-- ==============================================================================
-- INTELLIDESK AI - COMPREHENSIVE SEED DATA
-- Organization: Northstar Technologies
-- Idempotent synthetic data for testing, simulation, and evaluation
-- ==============================================================================

-- 1. DEPARTMENTS & ROLES
INSERT INTO roles (role_id, role_name, department, description) VALUES
('ROLE-FIN-ANALYST', 'Financial Analyst', 'Finance', 'Standard financial analysis, ledger review, and expense tracking'),
('ROLE-FIN-MGR', 'Finance Manager', 'Finance', 'Financial planning, reporting oversight, and budget approvals'),
('ROLE-HR-EXEC', 'HR Executive', 'Human Resources', 'Employee onboarding, records management, and standard HR requests'),
('ROLE-HR-MGR', 'HR Manager', 'Human Resources', 'People strategy, compensation review, and HR policy management'),
('ROLE-MKT-EXEC', 'Marketing Executive', 'Marketing', 'Campaign operations, CRM contact updates, and lead management'),
('ROLE-MKT-MGR', 'Marketing Manager', 'Marketing', 'Campaign strategy, budget allocation, and marketing analytics oversight'),
('ROLE-OPS-ANALYST', 'Operations Analyst', 'Operations', 'Supply chain monitoring, ERP transactions, and operational metrics'),
('ROLE-OPS-MGR', 'Operations Manager', 'Operations', 'Facility operations, inventory approvals, and logistics oversight'),
('ROLE-IT-ENG', 'IT Support Engineer', 'IT', 'Service desk operations, hardware provisioning, and system troubleshooting'),
('ROLE-SEC-ANALYST', 'Security Analyst', 'Cybersecurity', 'Access governance review, audit monitoring, and threat detection')
ON CONFLICT (role_id) DO NOTHING;

-- 2. APPLICATIONS
INSERT INTO applications (application_id, application_name, application_owner, risk_level, description, status) VALUES
('APP-SAP', 'SAP S/4HANA Finance', 'EMP-FIN-001', 'HIGH', 'Enterprise ERP for general ledger, asset accounting, and financial reporting', 'ACTIVE'),
('APP-M365', 'Microsoft 365 & Exchange', 'EMP-IT-001', 'LOW', 'Corporate email, Teams, SharePoint, and office productivity suite', 'ACTIVE'),
('APP-PBI', 'Power BI Enterprise', 'EMP-OPS-001', 'MEDIUM', 'Business intelligence reporting and analytics workspaces', 'ACTIVE'),
('APP-WD', 'Workday HRMS', 'EMP-HR-001', 'HIGH', 'Human capital management, payroll processing, and employee records', 'ACTIVE'),
('APP-SFDC', 'Salesforce CRM', 'EMP-MKT-001', 'MEDIUM', 'Customer relationship management, sales pipelines, and customer support', 'ACTIVE'),
('APP-GH', 'GitHub Enterprise', 'EMP-IT-001', 'HIGH', 'Source code repositories, CI/CD actions, and software releases', 'ACTIVE'),
('APP-JIRA', 'Jira Service Management', 'EMP-IT-001', 'LOW', 'Issue tracking, IT service desk ticketing, and sprint management', 'ACTIVE'),
('APP-SNOW', 'Snowflake Data Cloud', 'EMP-IT-001', 'HIGH', 'Central analytical data warehouse and reporting data lake', 'ACTIVE'),
('APP-AWS', 'AWS Production Cloud', 'EMP-SEC-001', 'CRITICAL', 'Production cloud infrastructure, ECS, VPCs, and database clusters', 'ACTIVE'),
('APP-CS', 'CrowdStrike Falcon', 'EMP-SEC-001', 'CRITICAL', 'Endpoint detection and response, zero-trust device management', 'ACTIVE')
ON CONFLICT (application_id) DO NOTHING;

-- 3. ROLE PERMISSIONS MATRIX (25+ Mappings)
INSERT INTO role_permissions (permission_id, role_id, application_id, permission_name, risk_level, requires_security_approval) VALUES
-- Finance
('PERM-SAP-READ', 'ROLE-FIN-ANALYST', 'APP-SAP', 'SAP Finance General Ledger View', 'LOW', FALSE),
('PERM-SAP-POST', 'ROLE-FIN-ANALYST', 'APP-SAP', 'SAP Journal Entry Posting', 'MEDIUM', FALSE),
('PERM-SAP-CLOSE', 'ROLE-FIN-MGR', 'APP-SAP', 'SAP Period Close & Approval', 'HIGH', TRUE),
('PERM-PBI-FIN', 'ROLE-FIN-ANALYST', 'APP-PBI', 'Finance Power BI Analytics Workspace', 'LOW', FALSE),
('PERM-M365-FIN', 'ROLE-FIN-ANALYST', 'APP-M365', 'Standard Microsoft 365 Business Seat', 'LOW', FALSE),
-- HR
('PERM-WD-BASE', 'ROLE-HR-EXEC', 'APP-WD', 'Workday Employee Profile Read', 'LOW', FALSE),
('PERM-WD-PAYROLL', 'ROLE-HR-MGR', 'APP-WD', 'Workday Payroll Run Administration', 'HIGH', TRUE),
('PERM-WD-BENEFITS', 'ROLE-HR-EXEC', 'APP-WD', 'Workday Benefits Administration', 'MEDIUM', FALSE),
('PERM-M365-HR', 'ROLE-HR-EXEC', 'APP-M365', 'Standard Microsoft 365 Business Seat', 'LOW', FALSE),
-- Marketing
('PERM-SFDC-LEADS', 'ROLE-MKT-EXEC', 'APP-SFDC', 'Salesforce Lead & Campaign Edit', 'LOW', FALSE),
('PERM-SFDC-ADMIN', 'ROLE-MKT-MGR', 'APP-SFDC', 'Salesforce Marketing Admin & Export', 'HIGH', TRUE),
('PERM-PBI-MKT', 'ROLE-MKT-EXEC', 'APP-PBI', 'Marketing Analytics Workspace', 'LOW', FALSE),
('PERM-M365-MKT', 'ROLE-MKT-EXEC', 'APP-M365', 'Standard Microsoft 365 Business Seat', 'LOW', FALSE),
-- Operations
('PERM-SAP-OPS', 'ROLE-OPS-ANALYST', 'APP-SAP', 'SAP Materials & Logistics View', 'LOW', FALSE),
('PERM-PBI-OPS', 'ROLE-OPS-ANALYST', 'APP-PBI', 'Supply Chain Analytics Workspace', 'LOW', FALSE),
('PERM-JIRA-OPS', 'ROLE-OPS-MGR', 'APP-JIRA', 'Operations Project Administration', 'LOW', FALSE),
('PERM-M365-OPS', 'ROLE-OPS-ANALYST', 'APP-M365', 'Standard Microsoft 365 Business Seat', 'LOW', FALSE),
-- IT Support
('PERM-JIRA-AGENT', 'ROLE-IT-ENG', 'APP-JIRA', 'Service Desk Agent Queues', 'LOW', FALSE),
('PERM-M365-ADMIN', 'ROLE-IT-ENG', 'APP-M365', 'Exchange & Teams Admin Delegate', 'MEDIUM', FALSE),
('PERM-GH-DEV', 'ROLE-IT-ENG', 'APP-GH', 'Internal Developer Repository Read/Write', 'MEDIUM', FALSE),
('PERM-SNOW-ANALYST', 'ROLE-IT-ENG', 'APP-SNOW', 'IT Operations Warehouse Query', 'MEDIUM', FALSE),
-- Cybersecurity & Elevated Admins
('PERM-AWS-PROD-ADMIN', 'ROLE-SEC-ANALYST', 'APP-AWS', 'AWS Production Account Administrator', 'CRITICAL', TRUE),
('PERM-CS-ALERT-DISMISS', 'ROLE-SEC-ANALYST', 'APP-CS', 'CrowdStrike Alert Triage & Containment', 'CRITICAL', TRUE),
('PERM-GH-ORG-OWNER', 'ROLE-SEC-ANALYST', 'APP-GH', 'GitHub Organization Owner & Audit Log', 'HIGH', TRUE),
('PERM-SNOW-SYSADMIN', 'ROLE-SEC-ANALYST', 'APP-SNOW', 'Snowflake Account Administrator', 'CRITICAL', TRUE),
('PERM-SAP-SUPERUSER', 'ROLE-FIN-MGR', 'APP-SAP', 'SAP Emergency Break-Glass Superuser', 'CRITICAL', TRUE)
ON CONFLICT (permission_id) DO NOTHING;

-- 4. PROFILES (20 Synthetic Northstar Employees)
INSERT INTO profiles (employee_id, full_name, email, department, designation, manager_id, account_status, application_role) VALUES
-- Finance
('EMP-FIN-001', 'Sarah Jenkins', 'sarah.jenkins@northstar-tech.internal', 'Finance', 'Finance Director', NULL, 'ACTIVE', 'MANAGER'),
('EMP-FIN-002', 'Alice Chen', 'alice.chen@northstar-tech.internal', 'Finance', 'Senior Financial Analyst', 'EMP-FIN-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-FIN-003', 'Robert Taylor', 'robert.taylor@northstar-tech.internal', 'Finance', 'Financial Analyst', 'EMP-FIN-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-FIN-004', 'Chloe Bennett', 'chloe.bennett@northstar-tech.internal', 'Finance', 'Billing Specialist', 'EMP-FIN-001', 'ACTIVE', 'EMPLOYEE'),

-- Human Resources
('EMP-HR-001', 'David Miller', 'david.miller@northstar-tech.internal', 'Human Resources', 'VP of Human Resources', NULL, 'ACTIVE', 'MANAGER'),
('EMP-HR-002', 'Jessica Wu', 'jessica.wu@northstar-tech.internal', 'Human Resources', 'Senior HR Executive', 'EMP-HR-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-HR-003', 'Anthony Stark', 'anthony.stark@northstar-tech.internal', 'Human Resources', 'Talent Acquisition Lead', 'EMP-HR-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-HR-004', 'Emily Watson', 'emily.watson@northstar-tech.internal', 'Human Resources', 'People Operations Coordinator', 'EMP-HR-001', 'ACTIVE', 'EMPLOYEE'),

-- Marketing
('EMP-MKT-001', 'Priya Sharma', 'priya.sharma@northstar-tech.internal', 'Marketing', 'Chief Marketing Officer', NULL, 'ACTIVE', 'MANAGER'),
('EMP-MKT-002', 'Carlos Ruiz', 'carlos.ruiz@northstar-tech.internal', 'Marketing', 'Digital Marketing Lead', 'EMP-MKT-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-MKT-003', 'Maya Lin', 'maya.lin@northstar-tech.internal', 'Marketing', 'Content Strategist', 'EMP-MKT-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-MKT-004', 'Jordan Reed', 'jordan.reed@northstar-tech.internal', 'Marketing', 'Growth & SEO Specialist', 'EMP-MKT-001', 'ACTIVE', 'EMPLOYEE'),

-- Operations
('EMP-OPS-001', 'Marcus Vance', 'marcus.vance@northstar-tech.internal', 'Operations', 'VP of Global Operations', NULL, 'ACTIVE', 'MANAGER'),
('EMP-OPS-002', 'Liam O''Connor', 'liam.oconnor@northstar-tech.internal', 'Operations', 'Senior Operations Analyst', 'EMP-OPS-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-OPS-003', 'Sophia Kim', 'sophia.kim@northstar-tech.internal', 'Operations', 'Supply Chain Coordinator', 'EMP-OPS-001', 'ACTIVE', 'EMPLOYEE'),
('EMP-OPS-004', 'Daniel Davis', 'daniel.davis@northstar-tech.internal', 'Operations', 'Logistics Analyst', 'EMP-OPS-001', 'ACTIVE', 'EMPLOYEE'),

-- IT & Cybersecurity (Admins)
('EMP-SEC-001', 'Elena Rostova', 'elena.rostova@northstar-tech.internal', 'Cybersecurity', 'Chief Information Security Officer', NULL, 'ACTIVE', 'SECURITY_ADMIN'),
('EMP-IT-001', 'Vikram Patel', 'vikram.patel@northstar-tech.internal', 'IT', 'IT Service Desk Manager', NULL, 'ACTIVE', 'IT_ADMIN'),
('EMP-IAM-001', 'Alex Mercer', 'alex.mercer@northstar-tech.internal', 'IT', 'Principal IAM Architect', 'EMP-IT-001', 'ACTIVE', 'IAM_ADMIN'),
('EMP-IT-002', 'Zoe Adams', 'zoe.adams@northstar-tech.internal', 'IT', 'Senior Desktop Support Engineer', 'EMP-IT-001', 'ACTIVE', 'IT_ADMIN')
ON CONFLICT (employee_id) DO NOTHING;

-- 5. EMPLOYEE_ACCESS (30 Active Entitlements)
INSERT INTO employee_access (employee_id, application_id, permission_id, status, granted_at) VALUES
('EMP-FIN-001', 'APP-SAP', 'PERM-SAP-CLOSE', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-FIN-001', 'APP-PBI', 'PERM-PBI-FIN', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-FIN-001', 'APP-M365', 'PERM-M365-FIN', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-FIN-002', 'APP-SAP', 'PERM-SAP-READ', 'ACTIVE', NOW() - INTERVAL '90 days'),
('EMP-FIN-002', 'APP-SAP', 'PERM-SAP-POST', 'ACTIVE', NOW() - INTERVAL '90 days'),
('EMP-FIN-002', 'APP-PBI', 'PERM-PBI-FIN', 'ACTIVE', NOW() - INTERVAL '90 days'),
('EMP-FIN-002', 'APP-M365', 'PERM-M365-FIN', 'ACTIVE', NOW() - INTERVAL '90 days'),
('EMP-FIN-003', 'APP-SAP', 'PERM-SAP-READ', 'ACTIVE', NOW() - INTERVAL '45 days'),
('EMP-FIN-003', 'APP-M365', 'PERM-M365-FIN', 'ACTIVE', NOW() - INTERVAL '45 days'),
('EMP-FIN-004', 'APP-M365', 'PERM-M365-FIN', 'ACTIVE', NOW() - INTERVAL '30 days'),
-- HR
('EMP-HR-001', 'APP-WD', 'PERM-WD-PAYROLL', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-HR-001', 'APP-M365', 'PERM-M365-HR', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-HR-002', 'APP-WD', 'PERM-WD-BASE', 'ACTIVE', NOW() - INTERVAL '120 days'),
('EMP-HR-002', 'APP-WD', 'PERM-WD-BENEFITS', 'ACTIVE', NOW() - INTERVAL '120 days'),
('EMP-HR-002', 'APP-M365', 'PERM-M365-HR', 'ACTIVE', NOW() - INTERVAL '120 days'),
('EMP-HR-003', 'APP-M365', 'PERM-M365-HR', 'ACTIVE', NOW() - INTERVAL '60 days'),
('EMP-HR-004', 'APP-M365', 'PERM-M365-HR', 'ACTIVE', NOW() - INTERVAL '20 days'),
-- Marketing
('EMP-MKT-001', 'APP-SFDC', 'PERM-SFDC-ADMIN', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-MKT-001', 'APP-PBI', 'PERM-PBI-MKT', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-MKT-002', 'APP-SFDC', 'PERM-SFDC-LEADS', 'ACTIVE', NOW() - INTERVAL '90 days'),
('EMP-MKT-002', 'APP-M365', 'PERM-M365-MKT', 'ACTIVE', NOW() - INTERVAL '90 days'),
('EMP-MKT-003', 'APP-M365', 'PERM-M365-MKT', 'ACTIVE', NOW() - INTERVAL '60 days'),
-- Operations
('EMP-OPS-001', 'APP-PBI', 'PERM-PBI-OPS', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-OPS-001', 'APP-JIRA', 'PERM-JIRA-OPS', 'ACTIVE', NOW() - INTERVAL '180 days'),
('EMP-OPS-002', 'APP-SAP', 'PERM-SAP-OPS', 'ACTIVE', NOW() - INTERVAL '100 days'),
('EMP-OPS-002', 'APP-PBI', 'PERM-PBI-OPS', 'ACTIVE', NOW() - INTERVAL '100 days'),
('EMP-OPS-003', 'APP-M365', 'PERM-M365-OPS', 'ACTIVE', NOW() - INTERVAL '70 days'),
-- IT & Security
('EMP-SEC-001', 'APP-CS', 'PERM-CS-ALERT-DISMISS', 'ACTIVE', NOW() - INTERVAL '365 days'),
('EMP-IT-001', 'APP-JIRA', 'PERM-JIRA-AGENT', 'ACTIVE', NOW() - INTERVAL '365 days'),
('EMP-IT-001', 'APP-M365', 'PERM-M365-ADMIN', 'ACTIVE', NOW() - INTERVAL '365 days'),
('EMP-IAM-001', 'APP-SNOW', 'PERM-SNOW-ANALYST', 'ACTIVE', NOW() - INTERVAL '200 days');

-- 6. TICKETS (30 Sample IT Tickets with varied priorities, categories, SLAs)
INSERT INTO tickets (ticket_id, employee_id, title, description, category, priority, impact, urgency, assigned_team, assigned_agent, status, created_at, resolved_at, sla_due_at) VALUES
('TCK-2026-001', 'EMP-FIN-002', 'Cisco AnyConnect VPN Gateway Disconnection', 'VPN disconnects every 5 minutes during SAP session, Error 412: Incompatible encryption parameter', 'VPN', 'P3', 'MEDIUM', 'MEDIUM', 'Network Support', 'EMP-IT-002', 'RESOLVED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days'),
('TCK-2026-002', 'EMP-OPS-001', 'Northstar Core Datacenter Switch Failure', 'Redundant edge router unreachable, affecting manufacturing floor telemetry', 'Network', 'P1', 'CRITICAL', 'CRITICAL', 'Infrastructure Ops', 'EMP-IT-001', 'RESOLVED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '3 hours', NOW() - INTERVAL '8 days' + INTERVAL '4 hours'),
('TCK-2026-003', 'EMP-MKT-003', 'Outlook Desktop Calendar Sync Stalled', 'Outlook 365 on macOS showing "Connecting..." without updating scheduled client demos', 'Email and Microsoft 365', 'P3', 'MEDIUM', 'MEDIUM', 'End User Computing', 'EMP-IT-002', 'RESOLVED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
('TCK-2026-004', 'EMP-HR-003', 'Executive Boardroom Display Wi-Fi Latency', 'Wi-Fi 6 dropouts on conference floor during VP all-hands meeting', 'Wi-Fi', 'P2', 'HIGH', 'HIGH', 'Network Support', 'EMP-IT-001', 'RESOLVED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '6 hours', NOW() - INTERVAL '5 days'),
('TCK-2026-005', 'EMP-FIN-004', 'SAP S/4HANA Error RFC_NO_AUTHORITY', 'Received authorization failure when opening T-Code FBL3N for vendor balances', 'ERP and SAP', 'P3', 'MEDIUM', 'MEDIUM', 'Enterprise Applications', 'EMP-IAM-001', 'RESOLVED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('TCK-2026-006', 'EMP-OPS-003', 'Warehouse Zebra Label Printer Offline', 'Network printer 10.45.2.14 is printing blank thermal tags on shipping line 4', 'Hardware', 'P2', 'HIGH', 'HIGH', 'End User Computing', 'EMP-IT-002', 'RESOLVED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
('TCK-2026-007', 'EMP-MKT-002', 'Suspicious Phishing Email Claiming CEO Wire Request', 'Employee received external spoofed email requesting urgent gift card vouchers', 'Other IT incidents', 'P2', 'HIGH', 'HIGH', 'Cybersecurity SOC', 'EMP-SEC-001', 'RESOLVED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', NOW() - INTERVAL '2 days'),
('TCK-2026-008', 'EMP-FIN-003', 'Dell Latitude 7440 BitLocker Recovery Prompt', 'BitLocker recovery screen on morning boot after firmware update', 'Hardware', 'P2', 'HIGH', 'HIGH', 'End User Computing', 'EMP-IT-002', 'RESOLVED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
('TCK-2026-009', 'EMP-HR-004', 'Microsoft Authenticator Push Notifications Not Triggering', 'Cannot complete 2FA login into Workday on new iOS device', 'Password and account support', 'P3', 'MEDIUM', 'MEDIUM', 'Identity Services', 'EMP-IAM-001', 'RESOLVED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
('TCK-2026-010', 'EMP-OPS-004', 'SharePoint Supply Chain Document Repository 403 Forbidden', 'Access denied to Operations/Logistics/2026_Tariffs folder', 'Software', 'P3', 'MEDIUM', 'MEDIUM', 'Enterprise Applications', 'EMP-IT-002', 'RESOLVED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', NOW() + INTERVAL '1 days'),
-- Active Open Tickets
('TCK-2026-011', 'EMP-MKT-004', 'Google Chrome Memory Leak on Analytics Dashboards', 'Browser tab crashing repeatedly with Out of Memory error on large charts', 'Software', 'P4', 'LOW', 'LOW', 'End User Computing', 'EMP-IT-002', 'OPEN', NOW() - INTERVAL '6 hours', NULL, NOW() + INTERVAL '18 hours'),
('TCK-2026-012', 'EMP-FIN-002', 'VPN Certificate Expiry Warning', 'Cisco AnyConnect alerting client certificate will expire in 48 hours', 'VPN', 'P3', 'MEDIUM', 'MEDIUM', 'Network Support', 'EMP-IT-001', 'IN_PROGRESS', NOW() - INTERVAL '4 hours', NULL, NOW() + INTERVAL '20 hours'),
('TCK-2026-013', 'EMP-HR-002', 'Teams Audio Device Loopback Echo', 'Plantronics headset causing high echo during executive interview calls', 'Hardware', 'P3', 'MEDIUM', 'MEDIUM', 'End User Computing', 'EMP-IT-002', 'OPEN', NOW() - INTERVAL '3 hours', NULL, NOW() + INTERVAL '21 hours'),
('TCK-2026-014', 'EMP-OPS-002', 'RDP Gateway Error 0x204 to Production Jumpbox', 'Cannot establish Remote Desktop connection to staging server 10.10.40.5', 'Network', 'P2', 'HIGH', 'HIGH', 'Infrastructure Ops', 'EMP-IT-001', 'IN_PROGRESS', NOW() - INTERVAL '2 hours', NULL, NOW() + INTERVAL '6 hours'),
('TCK-2026-015', 'EMP-FIN-004', 'Active Directory Account Lockout After 5 Password Attempts', 'Locked out of workstation following automated batch script run', 'Password and account support', 'P3', 'HIGH', 'LOW', 'Identity Services', 'EMP-IAM-001', 'AWAITING_USER', NOW() - INTERVAL '1 hours', NULL, NOW() + INTERVAL '7 hours'),
('TCK-2026-016', 'EMP-MKT-003', 'Request for Adobe Creative Cloud Illustrator License', 'Need vector design seat for upcoming Q3 brand redesign', 'Access requests', 'P4', 'LOW', 'LOW', 'Enterprise Applications', NULL, 'OPEN', NOW() - INTERVAL '45 minutes', NULL, NOW() + INTERVAL '47 hours'),
('TCK-2026-017', 'EMP-OPS-003', 'Global SAP S/4HANA Order Processing Outage', 'Order creation transactions failing nationwide with DB_LOCK_TIMEOUT', 'ERP and SAP', 'P1', 'CRITICAL', 'CRITICAL', 'Enterprise Applications', 'EMP-IT-001', 'ESCALATED', NOW() - INTERVAL '30 minutes', NULL, NOW() + INTERVAL '90 minutes'),
('TCK-2026-018', 'EMP-HR-003', 'Request for New Hire Laptop Setup', 'New Engineering hire starting Monday, standard MacBook Pro required', 'Hardware', 'P4', 'LOW', 'LOW', 'End User Computing', NULL, 'OPEN', NOW() - INTERVAL '20 minutes', NULL, NOW() + INTERVAL '48 hours'),
('TCK-2026-019', 'EMP-FIN-003', 'Excel Add-in for Bloomberg Terminal Crashing', 'Bloomberg API add-in crashes Excel on startup', 'Software', 'P3', 'MEDIUM', 'MEDIUM', 'End User Computing', NULL, 'OPEN', NOW() - INTERVAL '10 minutes', NULL, NOW() + INTERVAL '24 hours'),
('TCK-2026-020', 'EMP-OPS-001', 'Floor Wi-Fi AP 3B Flapping', 'Access point flapping between 2.4GHz and 5GHz channels', 'Network', 'P3', 'MEDIUM', 'MEDIUM', 'Network Support', NULL, 'OPEN', NOW() - INTERVAL '5 minutes', NULL, NOW() + INTERVAL '24 hours');

-- 7. ACCESS_REQUESTS & APPROVALS (10 Sample Requests with Multi-stage History)
INSERT INTO access_requests (request_id, employee_id, application_id, permission_id, business_justification, request_type, risk_level, request_status, idempotency_key, current_approval_stage, total_stages_required, created_at, completed_at) VALUES
('REQ-2026-001', 'EMP-FIN-002', 'APP-SAP', 'PERM-SAP-POST', 'Quarter-end financial journal closing requires post permissions', 'GRANT', 'MEDIUM', 'PROVISIONED', 'IDEMP-FIN-002-SAP-POST', 1, 1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
('REQ-2026-002', 'EMP-FIN-003', 'APP-SAP', 'PERM-SAP-READ', 'Monthly reconciliation of accounts receivable accounts', 'GRANT', 'LOW', 'PROVISIONED', 'IDEMP-FIN-003-SAP-READ', 1, 1, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
('REQ-2026-003', 'EMP-MKT-002', 'APP-SFDC', 'PERM-SFDC-ADMIN', 'Out-of-role request to export entire customer email database', 'GRANT', 'HIGH', 'REJECTED', 'IDEMP-MKT-002-SFDC-ADMIN', 1, 2, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
('REQ-2026-004', 'EMP-OPS-002', 'APP-AWS', 'PERM-AWS-PROD-ADMIN', 'Requesting root production AWS access to inspect cloud storage latency', 'GRANT', 'CRITICAL', 'REJECTED', 'IDEMP-OPS-002-AWS-ADMIN', 1, 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('REQ-2026-005', 'EMP-FIN-002', 'APP-PBI', 'PERM-PBI-FIN', 'Standard analytics workspace access for quarterly financial forecasting', 'GRANT', 'LOW', 'PROVISIONED', 'IDEMP-FIN-002-PBI-FIN', 1, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('REQ-2026-006', 'EMP-HR-002', 'APP-WD', 'PERM-WD-BENEFITS', 'Benefits enrollment cycle assistance for North American employees', 'GRANT', 'MEDIUM', 'PROVISIONED', 'IDEMP-HR-002-WD-BEN', 1, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
-- Active Pending Requests for Manager & Security Review
('REQ-2026-007', 'EMP-FIN-004', 'APP-SAP', 'PERM-SAP-POST', 'Covering for Senior Financial Analyst during medical leave', 'GRANT', 'MEDIUM', 'PENDING_APPROVAL', 'IDEMP-FIN-004-SAP-POST-01', 1, 1, NOW() - INTERVAL '4 hours', NULL),
('REQ-2026-008', 'EMP-MKT-003', 'APP-PBI', 'PERM-PBI-MKT', 'Campaign conversion analytics for Q3 Product Launch', 'GRANT', 'LOW', 'PENDING_APPROVAL', 'IDEMP-MKT-003-PBI-MKT-01', 1, 1, NOW() - INTERVAL '3 hours', NULL),
('REQ-2026-009', 'EMP-OPS-003', 'APP-SAP', 'PERM-SAP-OPS', 'Supply chain material ledger tracking and inventory validation', 'GRANT', 'LOW', 'PENDING_APPROVAL', 'IDEMP-OPS-003-SAP-OPS-01', 1, 1, NOW() - INTERVAL '2 hours', NULL),
('REQ-2026-010', 'EMP-FIN-001', 'APP-SAP', 'PERM-SAP-SUPERUSER', 'Emergency break-glass superuser access for fiscal year audit reconciliation', 'ELEVATION', 'CRITICAL', 'PENDING_APPROVAL', 'IDEMP-FIN-001-SAP-SUPER-01', 1, 2, NOW() - INTERVAL '30 minutes', NULL)
ON CONFLICT (request_id) DO NOTHING;

-- 8. APPROVALS RECORDS
INSERT INTO approvals (approval_id, request_id, approver_id, approval_type, stage_number, approval_status, comments, approved_at) VALUES
('b1000000-0000-0000-0000-000000000001', 'REQ-2026-001', 'EMP-FIN-001', 'MANAGER', 1, 'APPROVED', 'Approved for quarter-end journal entries', NOW() - INTERVAL '14 days'),
('b1000000-0000-0000-0000-000000000002', 'REQ-2026-002', 'EMP-FIN-001', 'MANAGER', 1, 'APPROVED', 'Standard access for accounts receivable', NOW() - INTERVAL '11 days'),
('b1000000-0000-0000-0000-000000000003', 'REQ-2026-003', 'EMP-MKT-001', 'MANAGER', 1, 'REJECTED', 'Denied: Full database export is not permitted under corporate data privacy policy', NOW() - INTERVAL '6 days'),
('b1000000-0000-0000-0000-000000000004', 'REQ-2026-004', 'EMP-SEC-001', 'SECURITY_ADMIN', 1, 'REJECTED', 'Violation of least privilege: Production AWS console cannot be granted to Operations Analyst', NOW() - INTERVAL '5 days'),
('b1000000-0000-0000-0000-000000000005', 'REQ-2026-005', 'EMP-FIN-001', 'MANAGER', 1, 'APPROVED', 'Approved for financial forecasting reports', NOW() - INTERVAL '3 days'),
('b1000000-0000-0000-0000-000000000006', 'REQ-2026-006', 'EMP-HR-001', 'MANAGER', 1, 'APPROVED', 'Approved for benefits administration period', NOW() - INTERVAL '2 days'),
-- Pending approval records
('b1000000-0000-0000-0000-000000000007', 'REQ-2026-007', 'EMP-FIN-001', 'MANAGER', 1, 'PENDING', NULL, NULL),
('b1000000-0000-0000-0000-000000000008', 'REQ-2026-008', 'EMP-MKT-001', 'MANAGER', 1, 'PENDING', NULL, NULL),
('b1000000-0000-0000-0000-000000000009', 'REQ-2026-009', 'EMP-OPS-001', 'MANAGER', 1, 'PENDING', NULL, NULL),
('b1000000-0000-0000-0000-000000000010', 'REQ-2026-010', 'EMP-SEC-001', 'SECURITY_ADMIN', 1, 'PENDING', NULL, NULL)
ON CONFLICT (approval_id) DO NOTHING;

-- 9. PROVISIONING_EVENTS (Simulated provisioning audit history)
INSERT INTO provisioning_events (request_id, employee_id, application_id, permission_id, action, execution_status, executed_at, result) VALUES
('REQ-2026-001', 'EMP-FIN-002', 'APP-SAP', 'PERM-SAP-POST', 'GRANT', 'SUCCESS', NOW() - INTERVAL '14 days', '{"adapter": "SimulatedSAPConnector", "status": "200_OK", "account_name": "alice.chen@northstar-tech.internal", "assigned_role": "SAP_JOURNAL_POSTING", "latency_ms": 142}'::jsonb),
('REQ-2026-002', 'EMP-FIN-003', 'APP-SAP', 'PERM-SAP-READ', 'GRANT', 'SUCCESS', NOW() - INTERVAL '11 days', '{"adapter": "SimulatedSAPConnector", "status": "200_OK", "account_name": "robert.taylor@northstar-tech.internal", "assigned_role": "SAP_GL_READ", "latency_ms": 115}'::jsonb),
('REQ-2026-005', 'EMP-FIN-002', 'APP-PBI', 'PERM-PBI-FIN', 'GRANT', 'SUCCESS', NOW() - INTERVAL '3 days', '{"adapter": "SimulatedPowerBIConnector", "status": "200_OK", "workspace_id": "WS-FIN-01", "assigned_role": "VIEWER", "latency_ms": 89}'::jsonb),
('REQ-2026-006', 'EMP-HR-002', 'APP-WD', 'PERM-WD-BENEFITS', 'GRANT', 'SUCCESS', NOW() - INTERVAL '2 days', '{"adapter": "SimulatedWorkdayConnector", "status": "200_OK", "security_group": "SG_BENEFITS_ADMIN", "latency_ms": 160}'::jsonb);

-- 10. AUDIT_LOGS (Append-only governance trail with correlation IDs)
INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, outcome, reason, correlation_id, timestamp) VALUES
('EMP-FIN-002', 'USER', 'CREATE_TICKET', 'TICKET', 'TCK-2026-001', 'SUCCESS', 'Employee submitted VPN failure incident', 'CORR-INIT-001', NOW() - INTERVAL '10 days'),
('AGENT-SUPERVISOR', 'AGENT', 'CLASSIFY_TICKET', 'TICKET', 'TCK-2026-001', 'SUCCESS', 'Classified as VPN category, priority P3 via deterministic matrix', 'CORR-INIT-001', NOW() - INTERVAL '10 days'),
('AGENT-EXEC', 'AGENT', 'SIMULATED_PROVISION', 'ACCESS_REQUEST', 'REQ-2026-001', 'SUCCESS', 'Granted PERM-SAP-POST after full manager approval', 'CORR-REQ-001', NOW() - INTERVAL '14 days'),
('EMP-MKT-001', 'USER', 'REJECT_APPROVAL', 'ACCESS_REQUEST', 'REQ-2026-003', 'DENIED', 'Denied out-of-role bulk database export', 'CORR-REQ-003', NOW() - INTERVAL '6 days'),
('EMP-SEC-001', 'USER', 'SECURITY_POLICY_BLOCK', 'ACCESS_REQUEST', 'REQ-2026-004', 'DENIED', 'Prevented unprivileged AWS root access assignment', 'CORR-REQ-004', NOW() - INTERVAL '5 days'),
('HR-SYSTEM', 'HR_INTEGRATION', 'HR_LIFECYCLE_TRIGGER', 'EMPLOYEE', 'EMP-FIN-004', 'SUCCESS', 'Verified HR onboarding event processed', 'CORR-JML-001', NOW() - INTERVAL '30 days');

