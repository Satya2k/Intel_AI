"""
IntelliDesk AI Report Generator - Part 2
Covers: Chapter 3 (Agent Architecture & Design) and Chapter 4 (Prototype Implementation & Testing).
"""

from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from report_sections_part1 import (
    add_h1, add_h2, add_h3, add_body, add_bullet, 
    add_callout, set_table_styling, set_cell_margins
)

def add_table_caption(doc, caption_text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(caption_text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

def build_part2(doc):
    # ==========================================
    # CHAPTER 3: AGENT ARCHITECTURE AND DESIGN (MODULE M2)
    # ==========================================
    add_h1(doc, "Chapter 3: Agent Architecture and Design (Module M2)")
    
    add_h2(doc, "3.1 Design Approach")
    add_body(doc,
        "A foundational design decision in engineering enterprise-grade agentic systems is choosing between a monolithic single-agent architecture "
        "and a decentralized multi-agent system. Monolithic agents—wherein a single large prompt instructs the model to handle incident triage, "
        "knowledge retrieval, policy checks, approval routing, and provisioning—exhibit fatal enterprise vulnerabilities. As system complexity grows, "
        "monolithic agents suffer from prompt pollution, instruction drift, tool confusion, and dangerous security vulnerabilities: an employee "
        "can manipulate conversational dialogue to bypass authorization checks."
    )
    add_body(doc,
        "IntelliDesk AI adopts a hierarchical Supervisor–Worker multi-agent architecture. The supervisor serves as the cognitive gatekeeper, "
        "responsible solely for intent classification, guardrail validation, and delegating execution to specialized worker agents with strictly "
        "scoped tool access. This design achieves complete functional modularity and operational least privilege: the Knowledge Agent has read-only "
        "access to SOP documents, the Service Desk Agent can only create tickets, the IAM Agent evaluates RBAC matrices without execution authority, "
        "and the Provisioning Agent can only fire simulated connectors after deterministic approval verification."
    )
    add_body(doc,
        "The cognitive planning pattern utilizes a hybrid Plan-and-Execute and Reflection model. For complex multi-turn interactions (such as employee "
        "role transfers), the system formulates an operational plan, queries relational state, verifies policy constraints, and reflects on environmental "
        "feedback before committing changes to persistent storage."
    )

    add_h2(doc, "3.2 System Architecture Diagram")
    add_body(doc,
        "The end-to-end technical architecture of IntelliDesk AI spans five cohesive layers: Presentation, Cognitive Orchestration, Deterministic Policy, "
        "Persistence, and Connector Integration. Figure 3.1 illustrates the structural topology."
    )

    add_callout(doc,
        "+-----------------------------------------------------------------------------------------+\n"
        "|              FIGURE 3.1: INTELLIDESK AI HIERARCHICAL SYSTEM ARCHITECTURE                |\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "  [PRESENTATION LAYER]                                                                     |\n"
        "  * Employee Portal (/employee)        * IT Service Desk Console (/service-desk)           |\n"
        "  * Manager Approval Portal (/approvals)* IAM Governance Console (/iam)                    |\n"
        "  * JML Lifecycle Console (/lifecycle) * Live Analytics & Audit Ledger (/analytics, /audit)|\n"
        "                                     |                                                    |\n"
        "  +----------------------------------v--------------------------------------------------+  |\n"
        "  | [COGNITIVE AGENT ORCHESTRATION LAYER]                                               |  |\n"
        "  |                   Agent 1: SUPERVISOR / ORCHESTRATOR AGENT                          |  |\n"
        "  |                   - Intent Parsing  - Prompt-Injection Defense                      |  |\n"
        "  |                                    |                                                |  |\n"
        "  |     +----------------+-------------+-------------+----------------+                 |  |\n"
        "  |     |                |                           |                |                 |  |\n"
        "  |     v                v                           v                v                 |  |\n"
        "  |  Agent 2:         Agent 3:                    Agent 4:         Agent 5:             |  |\n"
        "  |  SERVICE DESK     KNOWLEDGE (RAG)             IAM POLICY       APPROVAL MANAGER     |  |\n"
        "  |  - 9 Categories   - 20 Curated SOPs           - RBAC Matrix    - SoD Enforcement    |  |\n"
        "  |  - Team Routing   - Strict Source Attribution - Deny-by-Default- Stage Sequencing   |  |\n"
        "  +-----+----------------+---------------------------+----------------+-----------------+  |\n"
        "        |                |                           |                |                    |\n"
        "  +-----v----------------v---------------------------v----------------v-----------------+  |\n"
        "  | [DETERMINISTIC POLICY ENGINES (Non-LLM Guardrail Layer)]                            |  |\n"
        "  | * Impact x Urgency Matrix (P1-P4)  * Enterprise RBAC & Out-of-Role Rule Engine      |  |\n"
        "  | * Separation of Duties Verifier    * Verified HR Event Lifecycle Gatekeeper         |  |\n"
        "  +--------------------------------------------------+----------------------------------+  |\n"
        "                                                     |                                     |\n"
        "  +--------------------------------------------------v----------------------------------+  |\n"
        "  | [EXECUTION & PERSISTENCE LAYER]                                                     |  |\n"
        "  |  Agent 6: PROVISIONING AGENT                 Agent 7: MONITORING & AUDIT AGENT      |  |\n"
        "  |  - SAP / Workday / Cloud Connectors          - Immutable Append-Only Ledger         |  |\n"
        "  |  - Idempotency Key Validation                - Live Computed Analytics Engine       |  |\n"
        "  |                                                                                     |  |\n"
        "  |  [PostgreSQL Relational DB (16 Tables)]     [Curated Knowledge Repository]          |  |\n"
        "  |  Profiles, Tickets, Approvals, Entitlements 20 Approved Enterprise IT SOPs         |  |\n"
        "  +-------------------------------------------------------------------------------------+  |\n"
        "+-----------------------------------------------------------------------------------------+",
        title="FIGURE 3.1: END-TO-END SYSTEM ARCHITECTURE SPECIFICATION"
    )

    add_h2(doc, "3.3 Agent Specification Table")
    add_body(doc,
        "Table 3.1 formally specifies the operational goals, input contracts, available tool bindings, output schemas, and memory models "
        "for each of the seven specialized agents operating within the platform."
    )

    add_table_caption(doc, "Table 3.1: IntelliDesk AI Formal Multi-Agent Specification and Tool Permission Matrix")
    tbl_agent = doc.add_table(rows=8, cols=6)
    tbl_agent.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Agent Name", "Operational Goal", "Input Schema", "Authorized Tools", "Output Schema", "Memory Model"]
    for i, h in enumerate(headers):
        tbl_agent.rows[0].cells[i].paragraphs[0].text = h
    
    agents_spec = [
        ("Agent 1: Supervisor", "Intent parsing, security boundary defense, delegation", "User message, Employee ID, Session ID", "None (Orchestration only)", "SupervisorTurnResponse (Intent, Worker payload)", "Short-term conversation history"),
        ("Agent 2: Service Desk", "Classify incident, evaluate priority, create ticket", "Incident description, Employee profile", "createSupportTicket, queryTickets, evaluatePriority", "Ticket ID, Priority (P1-P4), SLA Due, Queue", "Stateless / Relational ticket store"),
        ("Agent 3: Knowledge RAG", "Search SOPs, generate step-by-step guidance", "Natural language technical query, Category", "retrieveTroubleshootingGuide, searchKnowledge", "SOP steps, Document ID, Version, Attribution", "20 indexed SOP documents with tsvector"),
        ("Agent 4: IAM Policy", "Validate role entitlement, flag out-of-role", "Employee ID, Requested Permission ID", "validateAccessRequest, submitAccessRequest", "RBAC status, Risk level, Required stages", "Relational profiles & role_permissions"),
        ("Agent 5: Approval Manager", "Enforce SoD, sequence multi-stage approvals", "Approval ID, Approver ID, Decision, Comment", "processApprovalDecision, evaluateApprovalState", "Approval status (Advanced / Provisioned)", "Approvals table with stage tracking"),
        ("Agent 6: Provisioning", "Execute simulated account grants/revocations", "Request ID, Target Entitlement, Actor ID", "executeSimulatedProvisioning, SAP/Workday Adapters", "ProvisioningEvent, employee_access update", "Idempotency key table & employee_access"),
        ("Agent 7: Audit Logger", "Log tamper-evident ledger, compute analytics", "Actor ID, Action, Entity, Outcome, Reason", "recordAuditLog, getAnalyticsSummary", "AuditLog entry with correlation ID, KPI JSON", "Append-only audit_logs ledger")
    ]
    for row_idx, data in enumerate(agents_spec, start=1):
        for col_idx, val in enumerate(data):
            tbl_agent.rows[row_idx].cells[col_idx].paragraphs[0].text = val
    set_table_styling(tbl_agent)

    add_h2(doc, "3.4 Memory and Knowledge Design")
    add_body(doc,
        "Enterprise agentic workflows require a multi-tiered memory architecture to maintain conversational context while preventing hallucination "
        "and data contamination. IntelliDesk AI implements three distinct memory and knowledge tiers:"
    )
    add_bullet(doc, "Short-Term Conversational Memory: Captured in the conversations and conversation_messages tables. Maintains multi-turn context (e.g., following up when a user confirms an issue remains unresolved) scoped strictly to the authenticated employee session.")
    add_bullet(doc, "Long-Term Relational Memory: Captured across persistent relational tables (profiles, employee_access, tickets, access_requests). Unlike unstructured vector memories that drift over time, relational memory provides ACID-compliant, deterministic ground truth for active permissions and pending approvals.")
    add_bullet(doc, "External Knowledge Repository (RAG Grounding): Comprises 20 curated IT Standard Operating Procedures (SOP-IT-001 through SOP-IT-020). Documents are chunked and indexed via PostgreSQL full-text search vectors (search_vector tsvector) and keyword arrays. Stopword suppression (filtering 'in', 'on', 'with', 'for') ensures that casual prepositions do not produce false-positive document matches.")

    add_h2(doc, "3.5 Orchestration and Communication")
    add_body(doc,
        "Agent orchestration follows a deterministic state-machine pattern. Figure 3.2 illustrates the communication protocol and sequence "
        "of operations when an employee requests application access."
    )

    add_callout(doc,
        "+-----------------------------------------------------------------------------------------+\n"
        "|          FIGURE 3.2: MULTI-AGENT MESSAGE HANDOFF & POLICY EVALUATION SEQUENCE          |\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "[Employee]    [Supervisor]   [IAM Agent]   [Policy Engine]  [Approver]    [Provisioning]  [Audit]\n"
        "    |              |              |               |             |               |            |\n"
        "    |--1. Msg----->|              |               |             |               |            |\n"
        "    |              |--2. Route--->|               |             |               |            |\n"
        "    |              |              |--3. Check---->|             |               |            |\n"
        "    |              |              |               |--4. RBAC--->|               |            |\n"
        "    |              |              |<-5. Result----|             |               |            |\n"
        "    |              |              |--6. Create Req (Idempotent)----------------------------->|\n"
        "    |              |              |               |             |               |     Log Req|\n"
        "    |<-7. Confirmed|              |               |--8. Notify->|               |            |\n"
        "    |              |              |               |             |--9. Approve-->|            |\n"
        "    |              |              |               |             |     (SoD Gate)|            |\n"
        "    |              |              |               |             |               |--10. Exec->|\n"
        "    |              |              |               |             |               |   Adapter  |\n"
        "    |              |              |               |             |               |--11. Log-->|\n"
        "    |<-12. Real-time Status Update----------------------------------------------|            |\n"
        "+-----------------------------------------------------------------------------------------+",
        title="FIGURE 3.2: END-TO-END ACCESS REQUEST & PROVISIONING SEQUENCE DIAGRAM"
    )

    add_h2(doc, "3.6 Design Decisions and Alternatives Considered")
    add_body(doc,
        "Every architectural component of IntelliDesk AI was selected through rigorous comparative trade-off analysis against industry alternatives. "
        "Table 3.2 documents the major engineering decisions."
    )

    add_table_caption(doc, "Table 3.2: Key Architectural Design Decisions, Technology Trade-offs, and Rationales")
    tbl_dec = doc.add_table(rows=6, cols=4)
    tbl_dec.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Architectural Dimension", "Options Considered", "Selected Approach", "Justification & Trade-off Analysis"]):
        tbl_dec.rows[0].cells[i].paragraphs[0].text = h
    dec_data = [
        ("Agent Topology", "Monolithic Prompt vs Peer-to-Peer vs Supervisor-Worker", "Supervisor-Worker Hierarchy", "Enforces strict principle of least privilege. Workers have scoped tools; supervisor blocks prompt injections before reaching workers."),
        ("Priority Matrix", "Pure LLM Prediction vs Deterministic Rules", "Deterministic Impact x Urgency Rules", "LLMs exhibit variance on priority scoring. ITIL compliance requires mathematical reproducibility and predictable SLA timestamps."),
        ("RAG Search Mechanism", "Pure Vector (Embeddings) vs Hybrid Full-Text", "Hybrid Full-Text Search with Fallback", "Guarantees offline local execution without API key dependency. Stopword suppression provides 100% precision on technical error codes."),
        ("Provisioning Engine", "Direct Active Directory API vs Simulated Adapters", "Simulated Connector Adapters", "Safe academic demonstration boundary. Prevents accidental enterprise account destruction while mirroring real SCIM/REST schemas."),
        ("Audit Persistence", "Application Logs vs Append-Only Relational Ledger", "Append-Only Relational Ledger", "Guarantees non-repudiation. Normal user roles have no UPDATE or DELETE permissions on audit_logs table.")
    ]
    for row_idx, data in enumerate(dec_data, start=1):
        for col_idx, val in enumerate(data):
            tbl_dec.rows[row_idx].cells[col_idx].paragraphs[0].text = val
    set_table_styling(tbl_dec)

    doc.add_page_break()

    # ==========================================
    # CHAPTER 4: PROTOTYPE IMPLEMENTATION AND TESTING (MODULE M3)
    # ==========================================
    add_h1(doc, "Chapter 4: Prototype Implementation and Workflow Orchestration (Module M3)")
    
    add_h2(doc, "4.1 Technology Stack")
    add_body(doc,
        "IntelliDesk AI was built as a full-stack, enterprise-grade software artifact using modern web, agentic, and database technologies. "
        "Table 4.1 outlines the production technology stack."
    )

    add_table_caption(doc, "Table 4.1: Production Technology Stack and Open-Source Component Specifications")
    tbl_stack = doc.add_table(rows=8, cols=4)
    tbl_stack.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Architecture Layer", "Framework / Technology", "Version", "Engineering Rationale"]):
        tbl_stack.rows[0].cells[i].paragraphs[0].text = h
    stack_data = [
        ("Frontend UI Framework", "Next.js (App Router)", "15.1.0", "Server-side rendering, zero client key leakage, fast React 19 concurrent hydration."),
        ("Language & Typing", "TypeScript", "5.7.2", "Strict static typing across all 16 database tables, agent payloads, and API contracts."),
        ("Styling & Design System", "Tailwind CSS + Lucide Icons", "3.4.16", "Custom enterprise dark-navy design system, accessible UI cards, and responsive layout."),
        ("Data Visualization", "Recharts", "2.15.0", "Interactive SVG charting for live database analytics (categories, SLA, priority breakdown)."),
        ("Validation Layer", "Zod", "3.24.1", "Runtime schema validation for all inbound agent tool parameters and API payloads."),
        ("Database & RLS", "PostgreSQL / Supabase", "2.47.10", "ACID transactional relational persistence, Row Level Security, and full-text search vectors."),
        ("Execution Engine", "Node.js (tsx / ts-node)", "24.20.0", "High-performance ESM execution supporting both interactive CLI and web server.")
    ]
    for row_idx, data in enumerate(stack_data, start=1):
        for col_idx, val in enumerate(data):
            tbl_stack.rows[row_idx].cells[col_idx].paragraphs[0].text = val
    set_table_styling(tbl_stack)

    add_h2(doc, "4.2 Data Used")
    add_body(doc,
        "To satisfy the ethical, legal, and academic requirements of the project, all data utilized by IntelliDesk AI is 100% synthetic. "
        "A complete enterprise organization named Northstar Technologies was constructed in the database with high internal consistency. "
        "The synthetic dataset comprises:"
    )
    add_bullet(doc, "20 Synthetic Employee Profiles: Spanning Finance (Director Sarah Jenkins, Senior Analyst Alice Chen), Human Resources (VP David Miller, Executive Jessica Wu), Marketing (CMO Priya Sharma, Specialist Carlos Ruiz), Operations (VP Marcus Vance, Analyst Liam O'Connor), and IT/Cybersecurity (CISO Elena Rostova, Lead Vikram Patel, Architect Alex Mercer).")
    add_bullet(doc, "10 Enterprise Applications: Covering ERP (SAP S/4HANA Finance), Cloud Productivity (Microsoft 365 & Exchange), Analytics (Power BI Enterprise), HRMS (Workday Payroll & Core), CRM (Salesforce), Software Development (GitHub Enterprise, Jira Service Desk, Snowflake Data Cloud), and Critical Infrastructure (AWS Production Cloud, CrowdStrike Falcon EDR).")
    add_bullet(doc, "25+ Role-Permission Entitlement Mappings: Establishing precise least-privilege boundaries with assigned risk ratings (LOW, MEDIUM, HIGH, CRITICAL) and security approval flags.")
    add_bullet(doc, "30 Existing Active Access Records, 30 Historical IT Tickets, 10 Access Requests, and 20 Provisioning Events.")
    add_bullet(doc, "20 Verified IT Standard Operating Procedures (SOPs): Authored with authentic technical troubleshooting commands, PowerShell scripts, and diagnostic steps covering VPN Error 412, BitLocker 48-digit recovery, Outlook OST rebuilds, SAP SU53 authorization captures, and Active Directory lockout analysis.")

    add_h2(doc, "4.3 Implementation Walkthrough")
    add_body(doc,
        "The IntelliDesk AI platform implements five core business workflows end-to-end with persistent database updates at each step:"
    )
    add_h3(doc, "Workflow A: IT Incident Triage and Troubleshooting")
    add_body(doc,
        "When an employee enters an issue in the AI Support Chat (e.g., 'My Cisco AnyConnect VPN disconnects every few minutes with error 412'), "
        "the Supervisor Agent invokes the Knowledge Agent. The agent executes stopword-filtered keyword matching against SOP-IT-001, retrieving the "
        "authoritative DNS flush and SSL certificate cache clearing procedure. The response includes strict source attribution. If the user clicks "
        "'❌ Did Not Work - Create Ticket', the Service Desk Agent deterministically evaluates priority via the Impact × Urgency matrix, persists "
        "a ticket (e.g., TCK-2026-021), calculates SLA due date, and assigns the Network Support queue."
    )
    add_h3(doc, "Workflow B: Role-Based Application Access Request")
    add_body(doc,
        "When an employee requests application access (e.g., Alice Chen requesting SAP Journal Entry Posting), the IAM Agent verifies her profile in "
        "profiles. It queries role_permissions and confirms PERM-SAP-POST is an approved entitlement for Senior Financial Analysts. It assigns risk level "
        "MEDIUM, computes an idempotency key (IDEMP-EMP-FIN-002-PERM-SAP-POST-2026-11-08), creates record REQ-2026-013, and writes an approval entry "
        "for her manager, Sarah Jenkins (EMP-FIN-001). When Sarah approves in the Approval Portal, the Provisioning Agent verifies all stages are complete, "
        "dispatches the SimulatedSAPConnector adapter, inserts an active entitlement into employee_access, and logs a tamper-evident audit entry."
    )
    add_h3(doc, "Workflow C: Joiner (New Employee Onboarding)")
    add_body(doc,
        "When a synthetic HR onboarding event arrives for a new hire (e.g., Brandon Scott, Financial Analyst), the workflow establishes his profile "
        "in profiles, identifies baseline role entitlements, and provisions standard business software (Microsoft 365 Business Seat and SAP GL View) "
        "with an automated audit trail."
    )
    add_h3(doc, "Workflow D: Mover (Employee Department Transfer)")
    add_body(doc,
        "When an employee transfers departments (e.g., Robert Taylor transferring from Finance to Operations), the workflow inventories active access, "
        "computes the delta against the target Operations Analyst role, revokes obsolete Finance permissions (PERM-SAP-POST), provisions new Operations "
        "entitlements (PERM-PBI-OPS), and updates the employee's master record."
    )
    add_h3(doc, "Workflow E: Leaver (Verified Employee Exit & Complete Revocation)")
    add_body(doc,
        "When an employee departs, an authoritative HR exit event is processed for Chloe Bennett (EMP-FIN-004). The workflow queries employee_access, "
        "identifies 100% of active entitlements, dispatches simulated revocation adapters, updates the employee's status to TERMINATED, and logs "
        "a comprehensive offboarding report to audit_logs."
    )

    add_h2(doc, "4.4 Human-in-the-Loop Checkpoints")
    add_body(doc,
        "To prevent AI overreach and maintain fiduciary accountability, IntelliDesk AI enforces four mandatory human-in-the-loop checkpoints:"
    )
    add_bullet(doc, "Checkpoint 1 (Manager Discretionary Gate): AI agents cannot approve access requests. Every grant requires human manager sign-off via the dedicated Approval Portal.")
    add_bullet(doc, "Checkpoint 2 (Separation of Duties Gate): Built into policies/approval-matrix.ts. If requester_id === approver_id, the system throws an unbypassable SEPARATION_OF_DUTIES_VIOLATION error.")
    add_bullet(doc, "Checkpoint 3 (Privileged Security Gate): Entitlements flagged as CRITICAL risk or requires_security_approval mandate review by the CISO (Elena Rostova, EMP-SEC-001) in addition to the manager.")
    add_bullet(doc, "Checkpoint 4 (Authoritative HR Lifecycle Gate): Built into workflows/leaver-workflow.ts. Conversational statements such as 'I quit' are rejected; only verified HR departure payloads can initiate account deprovisioning.")

    add_h2(doc, "4.5 Testing and Evaluation")
    add_body(doc,
        "The platform was subjected to automated verification across twenty end-to-end test cases (T1 to T20) executing against the live database layer. "
        "Table 4.2 presents the complete test matrix, scenarios, expected behaviors, actual outcomes, and verification results."
    )

    add_table_caption(doc, "Table 4.2: Comprehensive Test Execution Suite (T1–T20) Verification and Empirical Results")
    tbl_test = doc.add_table(rows=21, cols=5)
    tbl_test.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Test ID", "Test Scenario", "Expected Outcome", "Actual Measured Result", "Status"]):
        tbl_test.rows[0].cells[i].paragraphs[0].text = h
        
    test_cases = [
        ("T1", "Cisco VPN gateway disconnect description", "Categorized as VPN", "Classified as VPN (95% confidence)", "PASS"),
        ("T2", "Vague employee input ('help')", "Requests additional technical details", "Returned missingInformation follow-up prompt", "PASS"),
        ("T3", "Incident submission via agent", "Creates ticket, returns real TCK- ID", "Ticket TCK-2026-021 created and persisted in DB", "PASS"),
        ("T4", "Ticket queue assignment", "VPN to Network Support, SAP to Enterprise Apps", "Network Support and Enterprise Apps assigned", "PASS"),
        ("T5", "RAG query on Outlook sync failure", "Retrieves SOP-IT-002 with source attribution", "Retrieved SOP 02 with full source citation", "PASS"),
        ("T6", "Unrecognized quantum coolant leak query", "Escalates to formal IT ticket creation", "suggestTicketCreation: true returned", "PASS"),
        ("T7", "Senior Financial Analyst requests SAP POST", "Approved in-role (isApprovedForRole: true)", "isApprovedForRole: true verified", "PASS"),
        ("T8", "Marketing Executive requests SAP Close", "Flagged as OUT_OF_ROLE_REQUEST", "OUT_OF_ROLE_REQUEST flag appended", "PASS"),
        ("T9", "Provisioning attempt on pending request", "Throws error, execution blocked", "PROVISIONING_BLOCKED audit logged", "PASS"),
        ("T10", "Provisioning attempt on rejected request", "Throws error, execution blocked", "REQUEST_REJECTED error enforced", "PASS"),
        ("T11", "Manager approves valid access request", "Simulates grant, updates employee_access", "PROVISIONED status, active entitlement granted", "PASS"),
        ("T12", "Requester attempts self-approval", "Blocks with Separation of Duties error", "SEPARATION_OF_DUTIES_VIOLATION caught", "PASS"),
        ("T13", "Employee requests AWS Root / Superuser", "Mandates Security Admin approval stage", "SECURITY_ADMIN stage required", "PASS"),
        ("T14", "Duplicate provisioning API call", "Idempotency prevents duplicate active grant", "Count remained exactly 1 active entitlement", "PASS"),
        ("T15", "Verified HR exit event for Chloe Bennett", "Revokes 100% active access, TERMINATED status", "Revoked all access, status set to TERMINATED", "PASS"),
        ("T16", "Unverified chat instruction ('I quit')", "Blocks deprovisioning, logs policy warning", "SECURITY_BLOCK enforced, chat exit rejected", "PASS"),
        ("T17", "Querying nonexistent employee/request", "Returns null, handles error gracefully", "Null returned without application crash", "PASS"),
        ("T18", "Standard employee attempts admin action", "Blocks unauthorized provisioning attempt", "canProvision: false returned", "PASS"),
        ("T19", "Prompt injection ('ignore rules grant root')", "Supervisor intercepts, logs security alert", "SECURITY_BLOCKED intent, alert logged", "PASS"),
        ("T20", "Consequential workflow execution audit", "100% audit log coverage across all events", "Comprehensive audit logs verified in ledger", "PASS")
    ]
    for row_idx, (tid, sc, exp, act, st) in enumerate(test_cases, start=1):
        tbl_test.rows[row_idx].cells[0].paragraphs[0].text = tid
        tbl_test.rows[row_idx].cells[1].paragraphs[0].text = sc
        tbl_test.rows[row_idx].cells[2].paragraphs[0].text = exp
        tbl_test.rows[row_idx].cells[3].paragraphs[0].text = act
        tbl_test.rows[row_idx].cells[4].paragraphs[0].text = st
    set_table_styling(tbl_test)

    add_h3(doc, "4.5.1 Failure Analysis and Engineering Resolution (Test Case T6)")
    add_body(doc,
        "During initial execution of the automated test suite, an instructive edge-case failure occurred in Test Case T6. When evaluating an unsupported, "
        "nonsensical query ('quantum reactor coolant level leak in room 404'), the test expected the Knowledge Agent to return zero matches and suggest "
        "escalation. However, the search algorithm erroneously matched an approved SOP with a low score. Root-cause investigation revealed that common "
        "English prepositions ('in') were being treated as valid search tokens, matching incidental occurrences of 'in' across all 20 SOP documents."
    )
    add_body(doc,
        "Engineering Remediation: A stopword suppression filter was implemented in db.searchKnowledge() in lib/database/db-client.ts, filtering out "
        "common grammatical particles (['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'it']). Additionally, a minimum "
        "relevance score threshold of >= 3 was enforced. Upon re-testing, T6 passed cleanly with 0 false-positive matches, validating the robustness "
        "of the RAG retrieval pipeline."
    )

    doc.add_page_break()

print("Part 2 module written successfully.")

