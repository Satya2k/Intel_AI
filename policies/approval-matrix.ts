import { db } from '@/lib/database/db-client';
import { AccessRequest, Approval } from '@/lib/database/types';

export interface ApprovalCheckResult {
  canApprove: boolean;
  canProvision: boolean;
  isFullyApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
  error?: string;
  nextRequiredStage?: number;
}

/**
 * Enforces Separation of Duties & Multi-Stage Human-in-the-Loop Approvals
 */
export async function evaluateApprovalState(
  request: AccessRequest,
  actorEmployeeId?: string
): Promise<ApprovalCheckResult> {
  // Rule 1: Requester can never approve their own request
  if (actorEmployeeId && actorEmployeeId.toLowerCase() === request.employee_id.toLowerCase()) {
    return {
      canApprove: false,
      canProvision: false,
      isFullyApproved: false,
      isRejected: false,
      isPending: true,
      error: 'SEPARATION_OF_DUTIES_VIOLATION: Requester cannot approve their own access request.',
    };
  }

  // Fetch all approval entries for this request
  const approvals = await db.getApprovals({ request_id: request.request_id });

  // Rule 2: If any approval entry is REJECTED, the entire request is blocked forever
  const hasRejection = approvals.some(a => a.approval_status === 'REJECTED') || request.request_status === 'REJECTED';
  if (hasRejection) {
    return {
      canApprove: false,
      canProvision: false,
      isFullyApproved: false,
      isRejected: true,
      isPending: false,
      error: 'REQUEST_REJECTED: One or more approvers rejected this request. Provisioning is strictly prohibited.',
    };
  }

  // Rule 3: Check completion of required stages
  const approvedStages = approvals.filter(a => a.approval_status === 'APPROVED').map(a => a.stage_number);
  const pendingApprovals = approvals.filter(a => a.approval_status === 'PENDING');

  const totalRequired = request.total_stages_required || 1;
  const isFullyApproved = approvedStages.length >= totalRequired;

  if (isFullyApproved) {
    return {
      canApprove: false,
      canProvision: true,
      isFullyApproved: true,
      isRejected: false,
      isPending: false,
    };
  }

  // If there are still pending stages
  const nextStage = approvedStages.length + 1;
  return {
    canApprove: true,
    canProvision: false, // Pending approvals must NEVER be provisioned
    isFullyApproved: false,
    isRejected: false,
    isPending: true,
    nextRequiredStage: nextStage,
    error: `PENDING_APPROVAL_STAGE_${nextStage}: Awaiting stage ${nextStage} review. Cannot provision until all stages complete.`,
  };
}

