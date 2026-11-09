# Security, Governance & Human-in-the-Loop Policy
## IntelliDesk AI: Northstar Technologies

This document outlines the security controls, boundary enforcement, and governance models implemented in IntelliDesk AI.

---

## 1. Core Security Invariants
The following rules are enforced programmatically in the policy engine and cannot be overridden by conversational AI prompts:

1. **Zero Autonomous Privileged Grants**: The AI agent cannot grant or provision application access without explicit human approver action.
2. **Separation of Duties (SoD)**: A requester is strictly barred from approving their own access request.
3. **No Provisioning on Pending or Rejected Requests**: Any request with pending stages or an explicit rejection cannot trigger simulated provisioning.
4. **Authoritative HR Events for Offboarding**: Conversational statements such as "I quit" or "delete my account" are flagged and rejected. Only authenticated HR integration events can initiate the Leaver deprovisioning workflow.
5. **Prompt Injection Defense**: Adversarial inputs attempting to bypass approval logic or extract internal secrets are intercepted, neutralized, and logged as security alerts.
6. **Append-Only Tamper-Evident Audit Ledger**: All consequential events (ticket creation, access submission, approvals, rejections, provisioning, and revocations) generate immutable audit records with correlation IDs.
7. **Simulated Enterprise Integration**: The platform operates strictly on synthetic organizational data; no real production directory connections (Entra ID, Okta, Active Directory) are invoked.

---

## 2. Threat Modeling & Defense Matrix

| Attack Vector / Threat | Potential Impact | IntelliDesk AI Defense Mechanism | Verified In Test |
| :--- | :--- | :--- | :--- |
| **Prompt Injection** | Attacker instructs LLM to bypass approvals or grant root admin. | Input pattern interceptor in Supervisor Agent; denies execution and logs `PROMPT_INJECTION_DEFENSE_TRIGGERED`. | **T19** |
| **Self-Approval** | Manager submits access request for themselves and approves it. | Policy check (`requester_id === approver_id -> DENIED`) in `evaluateApprovalState`. | **T12** |
| **Unapproved Provisioning** | API called directly to provision pending/rejected request. | Provisioning gate in `executeSimulatedProvisioning` verifies 100% stage completion before adapter dispatch. | **T9, T10** |
| **Privilege Escalation** | Employee requests sensitive/privileged entitlement (AWS root, SAP Superuser). | RBAC matrix flags `requires_security_approval = true` and mandates CISO review stage. | **T13** |
| **Unverified Exit Trigger** | Social engineering attempt to deprovision a colleague via chat. | Leaver workflow enforces `is_verified_hr_event === true`; rejects casual chat instructions. | **T16** |
| **Replay / Duplicate Grant** | Repeated API calls create duplicate permissions. | Idempotency keys enforced in both request submission and `db.grantEmployeeAccess`. | **T14** |

---

## 3. Data Protection & Credentials
- All LLM API keys (`GOOGLE_GENERATIVE_AI_API_KEY`) and database service-role secrets (`SUPABASE_SERVICE_ROLE_KEY`) are restricted strictly to server-side execution.
- No secrets, tokens, or credentials are exposed in frontend client bundles.
- All enterprise employee identities, credentials, and records are synthetic demonstrations.

