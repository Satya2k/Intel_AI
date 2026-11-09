# Academic Viva & Technical Demonstration Script
## IntelliDesk AI: 3–5 Minute Evaluator Walkthrough

Use this structured demonstration script during your academic presentation or technical viva.

---

### Step 1: Platform Overview & Architecture (1 Minute)
1. **Open Landing Page (`http://localhost:3000/`)**:
   - Explain the business problem: Tier-1 IT support overload, manual approval delays, entitlement creep, and inconsistent JML lifecycle governance.
   - Point to the **Academic Demo Mode** banner and disclose that data belongs to a synthetic organization, **Northstar Technologies**.
   - Highlight the **Supervisor–Worker Multi-Agent Architecture**: 7 specialized agents with deterministic policy guardrails preventing unauthorized autonomous privilege grants.

---

### Step 2: Employee Support & RAG Knowledge Retrieval (1 Minute)
1. Click **Alice Chen (Employee)** or navigate to `/employee`.
2. In the **AI Support Chat**, enter:
   ```text
   My Cisco AnyConnect VPN keeps dropping with error 412
   ```
3. Show the output:
   - The Supervisor delegates to the **Knowledge & Troubleshooting Agent (RAG)**.
   - The response directly quotes **SOP 01: VPN Connection Failure and Gateway Re-authentication (Document ID: SOP-IT-001, Version 2.1)**.
   - Emphasize **strict source attribution** and absence of hallucinated advice.
4. Click the suggested button: **"❌ Did Not Work - Create Ticket"**:
   - The **IT Service Desk Agent** evaluates impact and urgency.
   - Deterministically assigns priority `P3` (48h SLA) and routes to **Network Support**.
   - Generates and returns a real ticket ID (e.g., `TCK-2026-021`), which immediately appears in the **My Active Tickets** card.

---

### Step 3: RBAC & Human-in-the-Loop Access Approval (1.5 Minutes)
1. In the chat, type:
   ```text
   Request access to SAP S/4HANA Finance for journal posting
   ```
2. Point out:
   - The **IAM Agent** evaluates the **Role-Permission Matrix**.
   - Since Alice Chen is a *Senior Financial Analyst*, the entitlement `PERM-SAP-POST` is **Approved In-Role**.
   - Assesses risk level as `MEDIUM` and routes request `REQ-2026-xxx` to her direct manager, **Sarah Jenkins (`EMP-FIN-001`)**.
3. Now test **Policy Defense / Out-of-Role Request**:
   - In chat, type: `Request root admin access to AWS Production cloud`.
   - The IAM Agent flags this as **OUT-OF-ROLE** and `CRITICAL Risk`, requiring 3 stages of approval (Manager + Application Owner + CISO).
4. Use the top-right **Persona Switcher** to switch to **Sarah Jenkins (Manager)** and open `/approvals`.
5. Show the pending approval card for Alice Chen:
   - Notice the requester details, business justification, risk indicator, and stage tracking.
   - Click **Approve & Provision**.
   - Show the real-time execution: The **Provisioning Agent** verifies all approvals are complete, executes the `SimulatedSAPConnector` adapter, persists the active entitlement into `employee_access`, and marks status as `PROVISIONED`.

---

### Step 4: Employee Lifecycle (JML) & Full Deprovisioning (1 Minute)
1. Navigate to `/lifecycle` (**Lifecycle JML Engine**).
2. Select the **Leaver (Exit & Revocation)** tab:
   - Select employee **Chloe Bennett (`EMP-FIN-004`)**.
   - Notice the checkbox: **"Authoritative HR Verification Gate"**.
   - Click **Execute Leaver Workflow & Revoke Access**.
   - Show the immediate execution: 100% of Chloe Bennett's active application entitlements are revoked, her directory status is updated to `TERMINATED`, and an offboarding report is logged.
3. Switch to `/audit` (**Audit & Security Console**):
   - Point out the immutable append-only ledger entries for `LEAVER_OFFBOARDING_COMPLETED`, `SIMULATED_REVOKE`, `SIMULATED_PROVISION`, and `CREATE_TICKET`.
   - Highlight the presence of **Correlation IDs** for complete transaction traceability.

---

### Step 5: Live Database Analytics (30 Seconds)
1. Navigate to `/analytics`.
2. Emphasize that **100% of charts and KPI cards are computed live from persistent database records** (zero hardcoded mock figures).
3. Point to:
   - SLA Compliance Rate
   - Ticket Volume by Category
   - Priority Distribution (P1–P4)
   - Provisioning Success Rate
4. Conclude viva:
   *"IntelliDesk AI demonstrates a fully functional, enterprise-governed agentic workflow with real database persistence, strict policy guardrails, and measurable business impact."*

