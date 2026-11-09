import { db } from '@/lib/database/db-client';
import { executeSimulatedProvisioning } from './provisioning-tools';
import { recordAuditLog } from './audit-tools';

export interface ProcessApprovalInput {
  approval_id: string;
  approver_id: string;
  decision: 'APPROVED' | 'REJECTED';
  comments?: string;
  correlation_id?: string;
}

export async function processApprovalDecision(input: ProcessApprovalInput) {
  const approval = await db.getApproval(input.approval_id);
  if (!approval) {
    throw new Error(`Approval entry [${input.approval_id}] not found.`);
  }

  const request = await db.getAccessRequest(approval.request_id);
  if (!request) {
    throw new Error(`Access request [${approval.request_id}] not found.`);
  }

  // 1. Separation of Duties enforcement: Requester CANNOT approve their own request!
  if (input.approver_id.toLowerCase() === request.employee_id.toLowerCase()) {
    await recordAuditLog({
      actor_id: input.approver_id,
      actor_type: 'USER',
      action: 'SELF_APPROVAL_ATTEMPT_BLOCKED',
      entity_type: 'ACCESS_REQUEST',
      entity_id: request.request_id,
      outcome: 'DENIED',
      reason: 'Separation of duties violation: Requester attempted to approve their own request.',
      correlation_id: input.correlation_id,
    });
    throw new Error('SEPARATION_OF_DUTIES_VIOLATION: You cannot approve your own access request.');
  }

  // 2. Record the decision on the approval row
  await db.updateApproval(input.approval_id, {
    approval_status: input.decision,
    comments: input.comments || (input.decision === 'APPROVED' ? 'Approved via Approval Portal' : 'Rejected via Approval Portal'),
    approved_at: new Date().toISOString(),
  });

  // 3. Handle REJECTION
  if (input.decision === 'REJECTED') {
    await db.updateAccessRequest(request.request_id, {
      request_status: 'REJECTED',
      completed_at: new Date().toISOString(),
    });

    await recordAuditLog({
      actor_id: input.approver_id,
      actor_type: 'USER',
      action: 'REJECT_ACCESS_REQUEST',
      entity_type: 'ACCESS_REQUEST',
      entity_id: request.request_id,
      outcome: 'DENIED',
      reason: `Request rejected at stage ${approval.stage_number} (${approval.approval_type}). Comment: ${input.comments || 'No comment provided'}`,
      correlation_id: input.correlation_id,
    });

    return {
      status: 'REJECTED',
      message: 'Access request has been formally rejected. Provisioning is blocked.',
    };
  }

  // 4. Handle APPROVAL
  // Check if there are other stages remaining
  const allApprovals = await db.getApprovals({ request_id: request.request_id });
  const pendingStages = allApprovals.filter(a => a.approval_id !== input.approval_id && a.approval_status === 'PENDING');

  if (pendingStages.length > 0) {
    // Advance to next stage
    await db.updateAccessRequest(request.request_id, {
      current_approval_stage: approval.stage_number + 1,
    });

    await recordAuditLog({
      actor_id: input.approver_id,
      actor_type: 'USER',
      action: 'APPROVE_STAGE',
      entity_type: 'ACCESS_REQUEST',
      entity_id: request.request_id,
      outcome: 'SUCCESS',
      reason: `Stage ${approval.stage_number} approved. Advancing to next required stage.`,
      correlation_id: input.correlation_id,
    });

    return {
      status: 'ADVANCED_STAGE',
      message: `Stage ${approval.stage_number} approved. Awaiting remaining approvers.`,
    };
  }

  // All stages are now APPROVED!
  await db.updateAccessRequest(request.request_id, {
    request_status: 'APPROVED',
  });

  await recordAuditLog({
    actor_id: input.approver_id,
    actor_type: 'USER',
    action: 'FINAL_APPROVAL_GRANTED',
    entity_type: 'ACCESS_REQUEST',
    entity_id: request.request_id,
    outcome: 'SUCCESS',
    reason: 'All required approval stages completed successfully. Eligible for provisioning.',
    correlation_id: input.correlation_id,
  });

  // Automatically trigger simulated provisioning for approved request
  const provResult = await executeSimulatedProvisioning(
    request.request_id,
    'AGENT-PROVISIONING',
    input.correlation_id
  );

  return {
    status: 'PROVISIONED',
    message: 'All approvals completed. Access has been simulated and provisioned successfully!',
    provisioning: provResult,
  };
}

