"""
Generate realistic synthetic CSV datasets for IntelliDesk AI.
"""

import csv
import os
import random
from datetime import datetime, timedelta

DATASET_DIR = "/Users/satyasmac/AntiGravity/intellidesk-ai/datasets"
PUBLIC_DIR = "/Users/satyasmac/AntiGravity/intellidesk-ai/public/datasets"
WORKSPACE_DIR = "/Users/satyasmac/AntiGravity/datasets"

random.seed(42)

# 1. Employees Dataset
employees = [
    ("EMP-001", "Aarav Sharma", "aarav.sharma@northstar.internal", "Engineering", "Senior Software Engineer", "EMP-005", "ACTIVE"),
    ("EMP-002", "Elena Rostova", "elena.rostova@northstar.internal", "Finance", "Senior Financial Analyst", "EMP-006", "ACTIVE"),
    ("EMP-003", "Marcus Vance", "marcus.vance@northstar.internal", "Marketing", "Marketing Specialist", "EMP-007", "ACTIVE"),
    ("EMP-004", "Chloe Bennett", "chloe.bennett@northstar.internal", "Operations", "Supply Chain Analyst", "EMP-008", "TERMINATED"),
    ("EMP-005", "Vikram Malhotra", "vikram.malhotra@northstar.internal", "Engineering", "Director of Engineering", "EXEC-001", "ACTIVE"),
    ("EMP-006", "Sarah Jenkins", "sarah.jenkins@northstar.internal", "Finance", "Finance Director", "EXEC-001", "ACTIVE"),
    ("EMP-007", "David Kim", "david.kim@northstar.internal", "Marketing", "Chief Marketing Officer", "EXEC-001", "ACTIVE"),
    ("EMP-008", "Lisa Wang", "lisa.wang@northstar.internal", "Operations", "Operations VP", "EXEC-001", "ACTIVE"),
    ("EMP-009", "James Wilson", "james.wilson@northstar.internal", "Human Resources", "HR Generalist", "EMP-010", "ACTIVE"),
    ("EMP-010", "Rachel Green", "rachel.green@northstar.internal", "Human Resources", "Head of People", "EXEC-001", "ACTIVE"),
    ("EMP-011", "Carlos Gomez", "carlos.gomez@northstar.internal", "Engineering", "DevOps Engineer", "EMP-005", "ACTIVE"),
    ("EMP-012", "Priya Nair", "priya.nair@northstar.internal", "Finance", "Accountant", "EMP-006", "ACTIVE"),
    ("EMP-013", "Tom Miller", "tom.miller@northstar.internal", "Operations", "Logistics Coordinator", "EMP-008", "ACTIVE"),
    ("EMP-014", "Emily Davis", "emily.davis@northstar.internal", "Marketing", "Content Strategist", "EMP-007", "ACTIVE"),
    ("EMP-015", "Lucas Brown", "lucas.brown@northstar.internal", "Engineering", "Frontend Developer", "EMP-005", "ACTIVE"),
    ("EMP-016", "Ananya Gupta", "ananya.gupta@northstar.internal", "Finance", "Budget Analyst", "EMP-006", "ACTIVE"),
    ("EMP-017", "Zack Taylor", "zack.taylor@northstar.internal", "Security", "Security Analyst", "EMP-018", "ACTIVE"),
    ("EMP-018", "Robert Stark", "robert.stark@northstar.internal", "Security", "CISO", "EXEC-001", "ACTIVE"),
    ("EMP-019", "Maya Lin", "maya.lin@northstar.internal", "Engineering", "Cloud Architect", "EMP-005", "ACTIVE"),
    ("EMP-020", "Kevin Zhang", "kevin.zhang@northstar.internal", "Operations", "Inventory Manager", "EMP-008", "ACTIVE")
]

# Generate more employees up to 50
depts = ["Engineering", "Finance", "Marketing", "Operations", "Human Resources"]
for i in range(21, 51):
    d = random.choice(depts)
    mgr = "EMP-005" if d == "Engineering" else ("EMP-006" if d == "Finance" else ("EMP-007" if d == "Marketing" else ("EMP-008" if d == "Operations" else "EMP-010")))
    employees.append((f"EMP-{i:03d}", f"Synthetic Employee {i}", f"employee{i}@northstar.internal", d, f"{d} Specialist", mgr, "ACTIVE"))

def save_csv(path, header, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {path}")

# Write employees
emp_header = ["employee_id", "full_name", "email", "department", "designation", "manager_id", "status"]
save_csv(f"{DATASET_DIR}/employees_dataset.csv", emp_header, employees)
save_csv(f"{WORKSPACE_DIR}/employees_dataset.csv", emp_header, employees)

# 2. SOP Knowledge Base Dataset
sops = [
    ("SOP-NET-001", "Corporate VPN Configuration and Troubleshooting", "VPN", "vpn, anyconnect, cisco, tunnel, connection timeout, split-tunnel", "Steps: 1. Restart Cisco AnyConnect. 2. Verify Wi-Fi. 3. Flush DNS cache using ipconfig /flushdns. 4. Re-enter credentials. If error persists, escalate."),
    ("SOP-ID-002", "Active Directory Password Reset & Account Unlock", "Password", "password, expired, unlock, lockout, domain controller, credentials", "Steps: 1. Go to identity portal. 2. Pass MFA challenge. 3. Set password with 14+ characters. 4. Wait 5 minutes for sync across domain controllers."),
    ("SOP-APP-003", "SAP S/4HANA Finance Authorization & T-Code Access", "ERP & SAP", "sap, fico, t-code, authorization error, financial ledger, posting", "Steps: 1. Run transaction SU53. 2. Screenshot missing authorization object. 3. Check role matrix. 4. Submit access request for missing entitlement."),
    ("SOP-M365-004", "Microsoft 365 Exchange & Outlook Sync Diagnostics", "Email", "outlook, sync, exchange, ost file, disconnected, cached mode", "Steps: 1. Verify Outlook status bar. 2. Click Send/Receive All. 3. Close Outlook, rename .ost file. 4. Restart Outlook to rebuild cache."),
    ("SOP-OPS-005", "Corporate Laptop BitLocker Recovery Procedure", "Hardware", "bitlocker, encryption, recovery key, tpm, blue screen, bios", "Steps: 1. Retrieve BitLocker recovery key from Intune. 2. Enter 48-digit key at boot prompt. 3. Perform Windows startup diagnostics. 4. Update BIOS if prompted."),
    ("SOP-SEC-006", "Multi-Factor Authentication (MFA) Device Re-enrollment", "Security", "mfa, authenticator, okta, push, phone replaced, token", "Steps: 1. Access security self-service. 2. Verify identity via secondary phone. 3. Delete old device. 4. Scan QR code on new authenticator app."),
    ("SOP-NET-007", "Corporate Wi-Fi Certificate Renewal", "Network", "wifi, 802.1x, radius, certificate, eduroam, corporate ssid", "Steps: 1. Forget Northstar-Corp Wi-Fi network. 2. Connect to onboarding network. 3. Download device certificate. 4. Reconnect to corporate SSID."),
    ("SOP-SFT-008", "Approved Software Installation via Self-Service Portal", "Software", "software, install, portal, intune, company portal, adobe, slack", "Steps: 1. Open Company Portal. 2. Search for requested software. 3. Click Install. 4. If license requires approval, submit automated access request."),
    ("SOP-APP-009", "Power BI Gateway Refresh Failure Resolution", "Analytics", "power bi, gateway, dataset, scheduled refresh, credential error", "Steps: 1. Open Power BI Service. 2. Navigate to Dataset Settings. 3. Verify Gateway connection is Online. 4. Re-enter SQL credentials."),
    ("SOP-DEV-010", "GitHub Enterprise SSO Integration and Access Grant", "Engineering", "github, git, repo, sso, organization, saml, access denied", "Steps: 1. Sign in to GitHub Enterprise. 2. Authorize Northstar SAML SSO prompt. 3. Request team membership. 4. Verify SSH public key."),
    ("SOP-OPS-011", "Network Drive Mapping and Share Permissions", "Network", "network drive, smb, mapped drive, nas, z drive, permission denied", "Steps: 1. Open File Explorer. 2. Connect to \\\\nas.northstar.internal\\shares. 3. Re-enter domain credentials. 4. Verify Active Directory group."),
    ("SOP-M365-012", "Microsoft Teams Audio and Peripheral Diagnostics", "Collaboration", "teams, audio, microphone, headset, call dropped, devices", "Steps: 1. Open Teams Settings > Devices. 2. Run Make a Test Call. 3. Verify microphone input permissions in Windows settings. 4. Update audio drivers."),
    ("SOP-SEC-013", "Suspicious Email Phishing Report & Triage", "Security", "phishing, suspicious, spam, malicious attachment, report email", "Steps: 1. Click Report Phish button in Outlook. 2. Do not click links or open attachments. 3. SecOps agent analyzes email header in sandbox."),
    ("SOP-HW-014", "External Monitor and Docking Station Troubleshooting", "Hardware", "monitor, display, dock, thunderbolt, hdmi, screen black", "Steps: 1. Power cycle docking station. 2. Re-seat USB-C cable. 3. Press Win + Ctrl + Shift + B to reset graphics driver. 4. Check display settings."),
    ("SOP-SEC-015", "Security Incident Quarantine & Endpoint Isolation", "Security", "incident, malware, virus, ransomware, isolate endpoint, edr", "Steps: 1. Disconnect Ethernet and Wi-Fi immediately. 2. Contact SecOps hotline. 3. EDR agent initiates forensic snapshot and endpoint quarantine."),
    ("SOP-APP-016", "Salesforce CRM Lead Routing and Territory Assignment", "CRM", "salesforce, lead, assignment rule, queue, territory, crm", "Steps: 1. Verify Lead Status. 2. Check Lead Assignment Rules. 3. Check user territory allocation in Setup. 4. Re-run assignment rule manually."),
    ("SOP-DEV-017", "AWS Cloud Console IAM Role Assumption", "Cloud", "aws, iam, sts, assume-role, cli, credentials, expired token", "Steps: 1. Run aws sso login. 2. Verify active session in browser. 3. Export AWS_PROFILE. 4. If permission denied, verify AWS IAM group assignment."),
    ("SOP-SFT-018", "Browser Cache and Extension Conflict Resolution", "Software", "chrome, browser, cookies, cache, extension, unresponsive", "Steps: 1. Open Chrome in Incognito mode. 2. If issue resolves, clear browser cookies and cache. 3. Disable conflicting extensions one by one."),
    ("SOP-HW-019", "Printer Network Discovery and Spooler Clearing", "Hardware", "printer, spooler, paper jam, offline, queue stuck, print", "Steps: 1. Restart Print Spooler service via services.msc. 2. Delete files in C:\\Windows\\System32\\spool\\PRINTERS. 3. Reconnect printer by IP."),
    ("SOP-ID-020", "Emergency Employee Account Suspension Protocol", "Identity", "termination, suspension, emergency, leaver, disable account", "Steps: 1. Authenticate HR webhook or CISO authorization. 2. Trigger automated deprovisioning workflow. 3. Revoke all active sessions and cloud tokens.")
]
sop_header = ["sop_id", "title", "category", "keywords", "content"]
save_csv(f"{DATASET_DIR}/sop_knowledge_base.csv", sop_header, sops)
save_csv(f"{WORKSPACE_DIR}/sop_knowledge_base.csv", sop_header, sops)

# 3. IT Tickets Dataset (150 realistic historical & active tickets)
categories = ["VPN", "Password", "Hardware", "Software", "Email", "ERP & SAP", "Network", "Security"]
priorities = ["P1", "P2", "P3", "P4"]
statuses = ["RESOLVED", "CLOSED", "OPEN", "IN_PROGRESS"]

tickets = []
base_time = datetime(2026, 10, 1, 9, 0, 0)

for i in range(1, 151):
    tid = f"TICK-{1000 + i}"
    cat = random.choice(categories)
    # Bias priority based on category
    if cat == "Security":
        pri = random.choice(["P1", "P2"])
    elif cat in ["VPN", "ERP & SAP"]:
        pri = random.choice(["P2", "P3"])
    else:
        pri = random.choice(["P3", "P4"])
    
    st = random.choices(["RESOLVED", "CLOSED", "OPEN", "IN_PROGRESS"], weights=[0.45, 0.35, 0.12, 0.08])[0]
    emp = random.choice(employees)
    emp_id = emp[0]
    dept = emp[3]
    
    created_at = base_time + timedelta(days=random.randint(0, 38), hours=random.randint(0, 10), minutes=random.randint(0, 59))
    sla_hours = 4 if pri == "P1" else (8 if pri == "P2" else (24 if pri == "P3" else 48))
    sla_due = created_at + timedelta(hours=sla_hours)
    
    if st in ["RESOLVED", "CLOSED"]:
        res_hours = random.uniform(0.5, sla_hours * 0.9) if random.random() < 0.92 else random.uniform(sla_hours * 1.05, sla_hours * 1.5)
        resolved_at = created_at + timedelta(hours=res_hours)
        sla_met = "YES" if resolved_at <= sla_due else "NO"
        res_at_str = resolved_at.isoformat() + "Z"
    else:
        res_at_str = ""
        sla_met = "PENDING"
    
    team = f"{cat} Support Team" if cat in ["VPN", "Security", "ERP & SAP"] else "Service Desk Tier-1"
    title = f"{cat} issue reported by {emp[1]}: {random.choice(['connectivity timeout', 'access denied', 'configuration error', 'sync failure', 'performance degradation'])}"
    
    tickets.append((
        tid, title, cat, pri, st, emp_id, emp[1], dept, team,
        created_at.isoformat() + "Z", sla_due.isoformat() + "Z", res_at_str, sla_met
    ))

ticket_header = ["ticket_id", "title", "category", "priority", "status", "employee_id", "requester_name", "department", "assigned_team", "created_at", "sla_due_at", "resolved_at", "sla_met"]
save_csv(f"{DATASET_DIR}/it_tickets_dataset.csv", ticket_header, tickets)
save_csv(f"{WORKSPACE_DIR}/it_tickets_dataset.csv", ticket_header, tickets)

# 4. Access Requests Dataset
apps = ["SAP S/4HANA Finance", "Microsoft 365 E5", "AWS Cloud Infrastructure", "Power BI Reporting", "Salesforce CRM", "GitHub Enterprise", "Google Workspace"]
requests = []
for i in range(1, 61):
    rid = f"REQ-{5000 + i}"
    emp = random.choice(employees)
    app = random.choice(apps)
    is_in_role = "YES" if (emp[3] == "Finance" and "SAP" in app) or (emp[3] == "Engineering" and ("AWS" in app or "GitHub" in app)) or ("365" in app) else "NO"
    status = random.choices(["PROVISIONED", "APPROVED", "PENDING_APPROVAL", "REJECTED"], weights=[0.55, 0.15, 0.20, 0.10])[0]
    approver = emp[5]
    created = (base_time + timedelta(days=random.randint(0, 38))).isoformat() + "Z"
    requests.append((rid, emp[0], emp[1], emp[3], app, is_in_role, status, approver, created))

req_header = ["request_id", "employee_id", "employee_name", "department", "application", "is_in_role", "status", "approver_id", "created_at"]
save_csv(f"{DATASET_DIR}/access_requests_dataset.csv", req_header, requests)
save_csv(f"{WORKSPACE_DIR}/access_requests_dataset.csv", req_header, requests)

# 5. Ready-to-Upload Sample Template (10 sample tickets for testing upload)
sample_upload = [
    ("TICK-NEW-01", "Cisco AnyConnect VPN disconnected after standby", "VPN", "P2", "OPEN", "EMP-001", "Aarav Sharma", "Engineering", "VPN Support Team"),
    ("TICK-NEW-02", "Outlook 365 mailbox synchronization stalled", "Email", "P3", "OPEN", "EMP-002", "Elena Rostova", "Finance", "Service Desk Tier-1"),
    ("TICK-NEW-03", "Laptop docking station dual screen flickering", "Hardware", "P4", "OPEN", "EMP-003", "Marcus Vance", "Marketing", "Service Desk Tier-1"),
    ("TICK-NEW-04", "SAP S/4HANA T-Code authorization failure in FICO", "ERP & SAP", "P2", "OPEN", "EMP-002", "Elena Rostova", "Finance", "ERP Support Team"),
    ("TICK-NEW-05", "Okta MFA push notification expired on iPhone", "Security", "P2", "OPEN", "EMP-005", "Vikram Malhotra", "Engineering", "Security Support Team"),
    ("TICK-NEW-06", "Wi-Fi 802.1x corporate network credential rejection", "Network", "P3", "OPEN", "EMP-006", "Sarah Jenkins", "Finance", "Network Support Team"),
    ("TICK-NEW-07", "Power BI scheduled report dataset gateway failure", "Software", "P3", "OPEN", "EMP-007", "David Kim", "Marketing", "Service Desk Tier-1"),
    ("TICK-NEW-08", "Active Directory account locked after 3 attempts", "Password", "P2", "RESOLVED", "EMP-008", "Lisa Wang", "Operations", "Service Desk Tier-1"),
    ("TICK-NEW-09", "CrowdStrike endpoint agent quarantined legitimate tool", "Security", "P1", "OPEN", "EMP-001", "Aarav Sharma", "Engineering", "Security Support Team"),
    ("TICK-NEW-10", "Network shared drive \\\\nas.northstar inaccessible", "Network", "P3", "RESOLVED", "EMP-004", "Chloe Bennett", "Operations", "Network Support Team")
]
upload_header = ["ticket_id", "title", "category", "priority", "status", "employee_id", "requester_name", "department", "assigned_team"]
save_csv(f"{DATASET_DIR}/sample_tickets_upload_template.csv", upload_header, sample_upload)
save_csv(f"{PUBLIC_DIR}/sample_tickets_upload_template.csv", upload_header, sample_upload)
save_csv(f"{WORKSPACE_DIR}/sample_tickets_upload_template.csv", upload_header, sample_upload)

print("All datasets generated successfully!")

