import { db } from '@/lib/database/db-client';
import { evaluateApprovalState } from '@/policies/approval-matrix';
import { recordAuditLog } from './audit-tools';

export interface ProvisioningAdapter {
  name: string;
  grant(employeeEmail: string, permissionName: string): Promise<Record<string, unknown>>;
  revoke(employeeEmail: string, permissionName: string): Promise<Record<string, unknown>>;
}

// Extensible simulated adapter interfaces (Prepares system for real SCIM/REST integrations)
const SAPConnector: ProvisioningAdapter = {
  name: 'SimulatedSAPConnector',
  async grant(email, perm) {
    return {
      adapter: 'SimulatedSAPConnector',
      target_system: 'SAP S/4HANA PRD',
      user_principal: email,
      assigned_profile: perm,
      status: '200_OK',
      timestamp: new Date().toISOString(),
      latency_ms: Math.floor(Math.random() * 80) + 70,
    };
  },
  async revoke(email, perm) {
    return {
      adapter: 'SimulatedSAPConnector',
      target_system: 'SAP S/4HANA PRD',
      user_principal: email,
      revoked_profile: perm,
      status: '200_OK',
      timestamp: new Date().toISOString(),
      latency_ms: Math.floor(Math.random() * 60) + 50,
    };
  }
};

const WorkdayConnector: ProvisioningAdapter = {
  name: 'SimulatedWorkdayConnector',
  async grant(email, perm) {
    return {
      adapter: 'SimulatedWorkdayConnector',
      target_system: 'Workday HRMS Cloud',
      user_principal: email,
      security_group: perm,
      status: '200_OK',
      timestamp: new Date().toISOString(),
      latency_ms: Math.floor(Math.random() * 90) + 80,
    };
  },
  async revoke(email, perm) {
    return {
      adapter: 'SimulatedWorkdayConnector',
      target_system: 'Workday HRMS Cloud',
      user_principal: email,
      security_group_removed: perm,
      status: '200_OK',
      timestamp: new Date().toISOString(),
    };
  }
};

const CloudConnector: ProvisioningAdapter = {
  name: 'SimulatedCloudConnector',
  async grant(email, perm) {
    return {
      adapter: 'SimulatedCloudConnector',
      target_system: 'Cloud IAM Directory',
      user_principal: email,
      role_assigned: perm,
      status: '200_OK',
      timestamp: new Date().toISOString(),
      latency_ms: Math.floor(Math.random() * 60) + 40,
    };
  },
  async revoke(email, perm) {
    return {
      adapter: 'SimulatedCloudConnector',
      target_system: 'Cloud IAM Directory',
      user_principal: email,
      role_revoked: perm,
      status: '200_OK',
      timestamp: new Date().toISOString(),
    };
  }
};

function getAdapter(appId: string): ProvisioningAdapter {
  if (appId === 'APP-SAP') return SAPConnector;
  if (appId === 'APP-WD') return WorkdayConnector;
  return CloudConnector;
}

/**
 * Executes Simulated Provisioning for Approved Access Requests
 * Enforces mandatory approval completion and idempotency.
 */
export async function executeSimulatedProvisioning(
  requestId: string,
  actorId: string,
  correlationId?: string
) {
  const request = await db.getAccessRequest(requestId);
  if (!request) {
    throw new Error(`Access request [${requestId}] does not exist.`);
  }

  // 1. Mandatory Gate Check: Must be fully approved
  const approvalCheck = await evaluateApprovalState(request);
  if (!approvalCheck.canProvision) {
    const reason = approvalCheck.error || 'Provisioning blocked: Request is not fully approved.';
    await recordAuditLog({
      actor_id: actorId,
      actor_type: 'SYSTEM',
      action: 'PROVISIONING_BLOCKED',
      entity_type: 'ACCESS_REQUEST',
      entity_id: requestId,
      outcome: 'DENIED',
      reason,
      correlation_id: correlationId,
    });
    throw new Error(reason);
  }

  // 2. Prevent duplicate execution (Idempotency)
  if (request.request_status === 'PROVISIONED') {
    const existingEvents = await db.getProvisioningEvents({ request_id: requestId });
    return {
      status: 'ALREADY_PROVISIONED',
      message: 'Request has already been provisioned. No duplicate action executed.',
      event: existingEvents[0] || null,
    };
  }

  const profile = await db.getProfile(request.employee_id);
  const permission = await db.getRolePermission(request.permission_id);
  if (!profile || !permission) {
    throw new Error(`Invalid employee or permission reference on request [${requestId}].`);
  }

  // 3. Dispatch simulated grant through adapter
  const adapter = getAdapter(request.application_id);
  const result = await adapter.grant(profile.email, permission.permission_name);

  // 4. Record provisioning event in database
  const event = await db.createProvisioningEvent({
    request_id: requestId,
    employee_id: request.employee_id,
    application_id: request.application_id,
    permission_id: request.permission_id,
    action: 'GRANT',
    execution_status: 'SUCCESS',
    result,
  });

  // 5. Update synthetic employee_access table (Idempotent grant)
  await db.grantEmployeeAccess({
    employee_id: request.employee_id,
    application_id: request.application_id,
    permission_id: request.permission_id,
    status: 'ACTIVE',
    granted_at: new Date().toISOString(),
    granted_by: actorId,
  });

  // 6. Update request status to PROVISIONED
  await db.updateAccessRequest(requestId, {
    request_status: 'PROVISIONED',
    completed_at: new Date().toISOString(),
  });

  // 7. Audit Log
  await recordAuditLog({
    actor_id: actorId,
    actor_type: 'AGENT',
    action: 'SIMULATED_PROVISION',
    entity_type: 'ACCESS_REQUEST',
    entity_id: requestId,
    outcome: 'SUCCESS',
    reason: `Simulated entitlement grant executed via ${adapter.name} for ${profile.email}`,
    correlation_id: correlationId,
    metadata: {
      permission_id: request.permission_id,
      application_id: request.application_id,
      adapter: adapter.name,
      result,
    }
  });

  return {
    status: 'SUCCESS',
    message: `Successfully provisioned [${permission.permission_name}] for ${profile.full_name}.`,
    event,
  };
}

/**
 * Executes Simulated Revocation (Used by Leaver / Mover workflows)
 */
export async function executeSimulatedRevocation(
  employeeId: string,
  permissionId: string,
  reason: string,
  actorId: string,
  correlationId?: string
) {
  const profile = await db.getProfile(employeeId);
  const permission = await db.getRolePermission(permissionId);
  if (!profile || !permission) {
    throw new Error(`Profile or permission not found.`);
  }

  const adapter = getAdapter(permission.application_id);
  const result = await adapter.revoke(profile.email, permission.permission_name);

  // Revoke in employee_access table
  await db.revokeEmployeeAccess(employeeId, permissionId, reason);

  // Record provisioning event
  const event = await db.createProvisioningEvent({
    employee_id: employeeId,
    application_id: permission.application_id,
    permission_id: permissionId,
    action: 'REVOKE',
    execution_status: 'SUCCESS',
    result,
  });

  // Audit record
  await recordAuditLog({
    actor_id: actorId,
    actor_type: 'SYSTEM',
    action: 'SIMULATED_REVOKE',
    entity_type: 'EMPLOYEE_ACCESS',
    entity_id: permissionId,
    outcome: 'SUCCESS',
    reason: `Revoked [${permission.permission_name}] from ${profile.email}. Reason: ${reason}`,
    correlation_id: correlationId,
    metadata: { employee_id: employeeId, adapter: adapter.name, result }
  });

  return event;
}

