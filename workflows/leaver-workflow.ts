import { db } from '@/lib/database/db-client';
import { executeSimulatedRevocation } from '@/tools/provisioning-tools';
import { recordAuditLog } from '@/tools/audit-tools';

export interface LeaverEventInput {
  employee_id: string;
  exit_reason: string;
  created_by: string;
  is_verified_hr_event: boolean;
  correlation_id?: string;
}

/**
 * Leaver Workflow: Employee Offboarding & Complete Access Revocation
 * Strictly protected against unverified conversational deprovisioning triggers.
 */
export async function executeLeaverWorkflow(input: LeaverEventInput) {
  const correlationId = input.correlation_id || `CORR-JML-LEAVE-${Date.now()}`;

  // 1. Mandatory Security Gate: Unverified events (e.g. chat messages) CANNOT trigger exit!
  if (!input.is_verified_hr_event) {
    await recordAuditLog({
      actor_id: input.created_by,
      actor_type: 'USER',
      action: 'UNVERIFIED_EXIT_EVENT_BLOCKED',
      entity_type: 'EMPLOYEE',
      entity_id: input.employee_id,
      outcome: 'DENIED',
      reason: 'POLICY_VIOLATION: Conversational claims cannot initiate employee exit. Verified HR event required.',
      correlation_id: correlationId,
    });
    throw new Error('SECURITY_BLOCK: Unverified exit instruction rejected. Offboarding requires an authoritative HR event.');
  }

  const profile = await db.getProfile(input.employee_id);
  if (!profile) {
    throw new Error(`Employee [${input.employee_id}] not found in master directory.`);
  }

  // 2. Retrieve all currently active entitlements
  const activeAccess = await db.getEmployeeAccess(input.employee_id);
  const revokedList: string[] = [];

  // 3. Revoke 100% of active entitlements
  for (const acc of activeAccess) {
    await executeSimulatedRevocation(
      input.employee_id,
      acc.permission_id,
      `Employee offboarding / termination: ${input.exit_reason}`,
      input.created_by,
      correlationId
    );
    revokedList.push(acc.permission_id);
  }

  // 4. Update profile status to TERMINATED
  await db.updateProfile(input.employee_id, {
    account_status: 'TERMINATED',
  });

  // 5. Create lifecycle event
  const lifecycleEvent = await db.createLifecycleEvent({
    employee_id: input.employee_id,
    event_type: 'LEAVER',
    details: {
      exit_reason: input.exit_reason,
      total_entitlements_revoked: revokedList.length,
      revoked_permissions: revokedList,
      previous_status: profile.account_status,
      new_status: 'TERMINATED',
    },
    effective_date: new Date().toISOString().split('T')[0],
    event_status: 'COMPLETED',
    created_by: input.created_by,
  });

  // 6. Generate final offboarding audit report
  await recordAuditLog({
    actor_id: input.created_by,
    actor_type: 'HR_INTEGRATION',
    action: 'LEAVER_OFFBOARDING_COMPLETED',
    entity_type: 'EMPLOYEE',
    entity_id: input.employee_id,
    outcome: 'SUCCESS',
    reason: `Offboarded ${profile.full_name} (${input.employee_id}). Revoked ${revokedList.length} active entitlements. Account status set to TERMINATED.`,
    correlation_id: correlationId,
    metadata: {
      revoked_count: revokedList.length,
      revoked_permissions: revokedList,
      exit_reason: input.exit_reason,
    }
  });

  return {
    lifecycleEventId: lifecycleEvent.event_id,
    employeeId: input.employee_id,
    status: 'COMPLETED',
    revokedCount: revokedList.length,
    revokedPermissions: revokedList,
  };
}

