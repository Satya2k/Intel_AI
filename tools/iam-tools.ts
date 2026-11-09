import { db } from '@/lib/database/db-client';
import { validateAccessRequest } from '@/policies/rbac';
import { recordAuditLog } from './audit-tools';

export interface SubmitAccessRequestInput {
  employee_id: string;
  permission_id: string;
  business_justification: string;
  idempotency_key?: string;
  correlation_id?: string;
}

export async function submitAccessRequest(input: SubmitAccessRequestInput) {
  // Validate RBAC rules
  const rbac = await validateAccessRequest(input.employee_id, input.permission_id);
  const permission = await db.getRolePermission(input.permission_id);
  const profile = await db.getProfile(input.employee_id);

  if (!permission || !profile) {
    throw new Error(`Invalid employee [${input.employee_id}] or permission [${input.permission_id}].`);
  }

  // Generate deterministic idempotency key if not supplied
  const key = input.idempotency_key || `IDEMP-${input.employee_id}-${input.permission_id}-${new Date().toISOString().split('T')[0]}`;

  // Check if identical active request exists (Idempotency)
  const existingReq = await db.getAccessRequestByIdempotencyKey(key);
  if (existingReq) {
    return {
      request: existingReq,
      rbac,
      isExisting: true,
      message: 'Request with this idempotency key already exists. Returning persisted record.',
    };
  }

  // Create formal access request record
  const request = await db.createAccessRequest({
    employee_id: input.employee_id,
    application_id: permission.application_id,
    permission_id: input.permission_id,
    business_justification: input.business_justification,
    request_type: 'GRANT',
    risk_level: rbac.riskLevel,
    request_status: 'PENDING_APPROVAL',
    idempotency_key: key,
    current_approval_stage: 1,
    total_stages_required: rbac.requiredApprovalStages.length,
  });

  // Create approval records for each required stage
  for (let i = 0; i < rbac.requiredApprovalStages.length; i++) {
    const stageType = rbac.requiredApprovalStages[i];
    let approverId = profile.manager_id || 'EMP-IT-001'; // Default stage 1 is direct manager

    if (stageType === 'APP_OWNER') {
      const app = await db.getApplication(permission.application_id);
      approverId = app?.application_owner || profile.manager_id || 'EMP-IT-001';
    } else if (stageType === 'SECURITY_ADMIN') {
      approverId = 'EMP-SEC-001'; // Elena Rostova, CISO
    }

    await db.createApproval({
      request_id: request.request_id,
      approver_id: approverId,
      approval_type: stageType,
      stage_number: i + 1,
      approval_status: 'PENDING',
    });
  }

  // Log audit record
  await recordAuditLog({
    actor_id: input.employee_id,
    actor_type: 'USER',
    action: 'SUBMIT_ACCESS_REQUEST',
    entity_type: 'ACCESS_REQUEST',
    entity_id: request.request_id,
    outcome: 'SUCCESS',
    reason: `Access request submitted for [${permission.permission_name}] (Risk: ${rbac.riskLevel}, In-Role: ${rbac.isApprovedForRole})`,
    correlation_id: input.correlation_id,
    metadata: {
      permission_id: input.permission_id,
      application_id: permission.application_id,
      required_stages: rbac.requiredApprovalStages,
      flags: rbac.flags,
    }
  });

  return {
    request,
    rbac,
    isExisting: false,
    message: 'Access request successfully created and routed for approval.',
  };
}

