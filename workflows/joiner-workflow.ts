import { db } from '@/lib/database/db-client';
import { submitAccessRequest } from '@/tools/iam-tools';
import { executeSimulatedProvisioning } from '@/tools/provisioning-tools';
import { recordAuditLog } from '@/tools/audit-tools';

export interface JoinerEventInput {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  manager_id: string;
  created_by: string;
  correlation_id?: string;
}

/**
 * Joiner Workflow: Automated New Hire Onboarding
 */
export async function executeJoinerWorkflow(input: JoinerEventInput) {
  const correlationId = input.correlation_id || `CORR-JML-JOIN-${Date.now()}`;

  // 1. Create or ensure profile exists in database
  let profile = await db.getProfile(input.employee_id);
  if (!profile) {
    profile = await db.createProfile({
      user_id: `u-${Date.now()}`,
      employee_id: input.employee_id,
      full_name: input.full_name,
      email: input.email,
      department: input.department,
      designation: input.designation,
      manager_id: input.manager_id,
      account_status: 'ACTIVE' as const,
      application_role: 'EMPLOYEE' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // 2. Identify baseline role entitlements for this role/department
  const roles = await db.getRoles();
  const matchedRole = roles.find(r => 
    r.department.toLowerCase() === input.department.toLowerCase() &&
    (input.designation.toLowerCase().includes(r.role_name.toLowerCase()) || r.role_name.toLowerCase().includes(input.designation.toLowerCase()))
  );

  const rolePermissions = await db.getRolePermissions();
  const baselinePerms = matchedRole 
    ? rolePermissions.filter(p => p.role_id === matchedRole.role_id)
    : rolePermissions.filter(p => p.permission_id === 'PERM-M365-FIN' || p.permission_id === 'PERM-M365-HR');

  // 3. Create lifecycle event in database
  const lifecycleEvent = await db.createLifecycleEvent({
    employee_id: input.employee_id,
    event_type: 'JOINER',
    details: {
      full_name: input.full_name,
      department: input.department,
      designation: input.designation,
      baseline_entitlements_count: baselinePerms.length,
      assigned_role: matchedRole?.role_name || 'Standard Baseline',
    },
    effective_date: new Date().toISOString().split('T')[0],
    event_status: 'PROCESSING',
    created_by: input.created_by,
  });

  const provisionedEntitlements: string[] = [];

  // 4. Provision baseline entitlements
  for (const perm of baselinePerms) {
    // Generate request
    const reqResult = await submitAccessRequest({
      employee_id: input.employee_id,
      permission_id: perm.permission_id,
      business_justification: `Automated baseline onboarding entitlement for ${input.designation}`,
      correlation_id: correlationId,
    });

    // For baseline LOW risk in-role entitlements, simulate manager onboarding pre-approval
    if (perm.risk_level === 'LOW') {
      const approvals = await db.getApprovals({ request_id: reqResult.request.request_id });
      for (const app of approvals) {
        await db.updateApproval(app.approval_id, {
          approval_status: 'APPROVED',
          comments: 'Auto-approved via verified HR Joiner Onboarding package',
          approved_at: new Date().toISOString(),
        });
      }
      await db.updateAccessRequest(reqResult.request.request_id, { request_status: 'APPROVED' });
      await executeSimulatedProvisioning(reqResult.request.request_id, 'SYSTEM-ONBOARDING', correlationId);
      provisionedEntitlements.push(perm.permission_name);
    }
  }

  // 5. Update lifecycle event to COMPLETED
  await db.updateLifecycleEvent(lifecycleEvent.event_id, {
    event_status: 'COMPLETED',
  });

  // 6. Audit log
  await recordAuditLog({
    actor_id: input.created_by,
    actor_type: 'HR_INTEGRATION',
    action: 'JOINER_WORKFLOW_COMPLETED',
    entity_type: 'EMPLOYEE',
    entity_id: input.employee_id,
    outcome: 'SUCCESS',
    reason: `Onboarded ${input.full_name} into ${input.department}. Provisioned ${provisionedEntitlements.length} baseline entitlements.`,
    correlation_id: correlationId,
    metadata: { provisioned: provisionedEntitlements },
  });

  return {
    lifecycleEventId: lifecycleEvent.event_id,
    employeeId: input.employee_id,
    status: 'COMPLETED',
    provisionedCount: provisionedEntitlements.length,
    entitlements: provisionedEntitlements,
  };
}

