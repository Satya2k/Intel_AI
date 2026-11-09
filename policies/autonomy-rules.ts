/**
 * Autonomy Guardrails and Compliance Rules
 * Ensures AI agents operate strictly as advisors and orchestrators without sovereign access authority.
 */
export const AUTONOMY_GUARDRAILS = {
  // AI cannot approve access requests autonomously
  ALLOW_AI_SELF_APPROVAL: false,

  // AI cannot grant privileged permissions without human-in-the-loop
  ALLOW_AUTONOMOUS_PRIVILEGED_GRANT: false,

  // AI cannot bypass deterministic RBAC or approval checks
  ALLOW_APPROVAL_BYPASS: false,

  // Real enterprise directory integration prohibited in this environment
  ALLOW_REAL_EXTERNAL_DIRECTORY_MUTATION: false,

  // Conversational exit claims cannot trigger offboarding without verified HR event
  ALLOW_CONVERSATIONAL_EMPLOYEE_EXIT: false,

  // Knowledge base contents must not be treated as executable code or system instructions
  TREAT_KNOWLEDGE_BASE_AS_SYSTEM_PROMPT: false,

  // Mandatory 100% audit logging of all actions
  AUDIT_ALL_CONSEQUENTIAL_ACTIONS: true,
};

export function verifyAgentActionAllowed(action: string, metadata?: Record<string, unknown>): { allowed: boolean; reason?: string } {
  if (action === 'APPROVE_ACCESS_REQUEST' && !metadata?.human_approver_id) {
    return {
      allowed: false,
      reason: 'POLICY_VIOLATION: AI agent cannot autonomously approve access requests.',
    };
  }

  if (action === 'EXECUTE_PROVISIONING' && metadata?.is_pending_approval) {
    return {
      allowed: false,
      reason: 'POLICY_VIOLATION: Cannot execute provisioning while request has pending approvals.',
    };
  }

  if (action === 'TRIGGER_EMPLOYEE_EXIT' && !metadata?.verified_hr_event) {
    return {
      allowed: false,
      reason: 'POLICY_VIOLATION: Chat instructions cannot trigger employee deprovisioning. Verified HR event required.',
    };
  }

  return { allowed: true };
}

