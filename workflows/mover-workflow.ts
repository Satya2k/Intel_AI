import { db } from '@/lib/database/db-client';
import { submitAccessRequest } from '@/tools/iam-tools';
import { executeSimulatedProvisioning, executeSimulatedRevocation } from '@/tools/provisioning-tools';
import { recordAuditLog } from '@/tools/audit-tools';

export interface MoverEventInput {
  employee_id: string;
  new_department: string;
  new_designation: string;
  new_manager_id: string;
  created_by: string;
  correlation_id?: string;
}

/**
 * Mover Workflow: Employee Department / Job-Role Transfer
 */
export async function executeMoverWorkflow(input: MoverEventInput) {
  const correlationId = input.correlation_id || `CORR-JML-MOVE-${Date.now()}`;
  const profile = await db.getProfile(input.employee_id);
  if (!profile) {
    throw new Error(`Employee [${input.employee_id}] not found.`);
  }

  const oldDept = profile.department;
  const oldTitle = profile.designation;

  // 1. Current active access records
  const currentAccess = await db.getEmployeeAccess(input.employee_id);

  // 2. Determine target entitlements for the new role
  const roles = await db.getRoles();
  const targetRole = roles.find(r => 
    r.department.toLowerCase() === input.new_department.toLowerCase() &&
    (input.new_designation.toLowerCase().includes(r.role_name.toLowerCase()) || r.role_name.toLowerCase().includes(input.new_designation.toLowerCase()))
  );

  const allRolePerms = await db.getRolePermissions();
  const targetPerms = targetRole ? allRolePerms.filter(p => p.role_id === targetRole.role_id) : [];
  const targetPermIds = new Set(targetPerms.map(p => p.permission_id));

  // 3. Identify obsolete permissions to REVOKE (least privilege)
  const toRevoke = currentAccess.filter(a => !targetPermIds.has(a.permission_id) && a.permission_id !== 'PERM-M365-FIN' && a.permission_id !== 'PERM-M365-HR');
  const revokedNames: string[] = [];

  for (const acc of toRevoke) {
    await executeSimulatedRevocation(
      input.employee_id,
      acc.permission_id,
      `Role transfer from ${oldDept} to ${input.new_department}`,
      'SYSTEM-TRANSFER',
      correlationId
    );
    revokedNames.push(acc.permission_id);
  }

  // 4. Identify new permissions to GRANT
  const currentPermIds = new Set(currentAccess.map(a => a.permission_id));
  const toGrant = targetPerms.filter(p => !currentPermIds.has(p.permission_id));
  const grantedNames: string[] = [];

  for (const perm of toGrant) {
    const reqResult = await submitAccessRequest({
      employee_id: input.employee_id,
      permission_id: perm.permission_id,
      business_justification: `Transfer adjustment: New role ${input.new_designation} in ${input.new_department}`,
      correlation_id: correlationId,
    });

    if (perm.risk_level === 'LOW') {
      const approvals = await db.getApprovals({ request_id: reqResult.request.request_id });
      for (const app of approvals) {
        await db.updateApproval(app.approval_id, {
          approval_status: 'APPROVED',
          comments: 'Auto-approved transfer baseline package',
          approved_at: new Date().toISOString(),
        });
      }
      await db.updateAccessRequest(reqResult.request.request_id, { request_status: 'APPROVED' });
      await executeSimulatedProvisioning(reqResult.request.request_id, 'SYSTEM-TRANSFER', correlationId);
      grantedNames.push(perm.permission_name);
    }
  }

  // 5. Update Employee Profile in database
  await db.updateProfile(input.employee_id, {
    department: input.new_department,
    designation: input.new_designation,
    manager_id: input.new_manager_id,
  });

  // 6. Record lifecycle event
  const lifecycleEvent = await db.createLifecycleEvent({
    employee_id: input.employee_id,
    event_type: 'MOVER',
    details: {
      from: { department: oldDept, designation: oldTitle },
      to: { department: input.new_department, designation: input.new_designation },
      revoked_count: revokedNames.length,
      granted_count: grantedNames.length,
    },
    effective_date: new Date().toISOString().split('T')[0],
    event_status: 'COMPLETED',
    created_by: input.created_by,
  });

  // 7. Audit Log
  await recordAuditLog({
    actor_id: input.created_by,
    actor_type: 'HR_INTEGRATION',
    action: 'MOVER_WORKFLOW_COMPLETED',
    entity_type: 'EMPLOYEE',
    entity_id: input.employee_id,
    outcome: 'SUCCESS',
    reason: `Transferred ${profile.full_name} from ${oldDept} to ${input.new_department}. Revoked ${revokedNames.length} entitlements, granted ${grantedNames.length}.`,
    correlation_id: correlationId,
    metadata: { revoked: revokedNames, granted: grantedNames },
  });

  return {
    lifecycleEventId: lifecycleEvent.event_id,
    employeeId: input.employee_id,
    status: 'COMPLETED',
    revokedCount: revokedNames.length,
    grantedCount: grantedNames.length,
  };
}

