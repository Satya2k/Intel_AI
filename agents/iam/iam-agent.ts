import { db } from '@/lib/database/db-client';
import { validateAccessRequest } from '@/policies/rbac';
import { submitAccessRequest } from '@/tools/iam-tools';

export interface IAMAgentResponse {
  message: string;
  isEligible: boolean;
  isApprovedForRole: boolean;
  requestId?: string;
  details?: Record<string, unknown>;
}

/**
 * Identity and Access Management (IAM) Agent
 * Enforces role-permission policies and coordinates approvals.
 */
export async function runIAMAgent(
  employeeId: string,
  userMessage: string,
  correlationId?: string
): Promise<IAMAgentResponse> {
  const profile = await db.getProfile(employeeId);
  if (!profile) {
    return {
      message: `Employee identity [${employeeId}] was not found in Northstar master identity records.`,
      isEligible: false,
      isApprovedForRole: false,
    };
  }

  const lower = userMessage.toLowerCase();
  const allPerms = await db.getRolePermissions();

  // Identify requested application / permission from message
  let matchedPerm = allPerms.find(p => 
    lower.includes(p.permission_id.toLowerCase()) || 
    lower.includes(p.permission_name.toLowerCase())
  );

  if (!matchedPerm) {
    if (lower.includes('sap') && lower.includes('post')) {
      matchedPerm = allPerms.find(p => p.permission_id === 'PERM-SAP-POST');
    } else if (lower.includes('sap') && (lower.includes('superuser') || lower.includes('break-glass') || lower.includes('emergency'))) {
      matchedPerm = allPerms.find(p => p.permission_id === 'PERM-SAP-SUPERUSER');
    } else if (lower.includes('sap')) {
      matchedPerm = allPerms.find(p => p.permission_id === 'PERM-SAP-READ');
    } else if (lower.includes('aws') || lower.includes('root') || lower.includes('production cloud')) {
      matchedPerm = allPerms.find(p => p.permission_id === 'PERM-AWS-PROD-ADMIN');
    } else if (lower.includes('power bi') || lower.includes('pbi')) {
      matchedPerm = allPerms.find(p => p.permission_id.startsWith('PERM-PBI'));
    } else if (lower.includes('salesforce') || lower.includes('sfdc')) {
      matchedPerm = allPerms.find(p => p.permission_id.startsWith('PERM-SFDC'));
    }
  }

  if (!matchedPerm) {
    return {
      message: `I understood you are requesting application access. However, I could not determine the specific permission or application. 
Available applications include: SAP S/4HANA Finance, Workday HRMS, Salesforce CRM, Power BI, and GitHub Enterprise. 

Please specify the application and required entitlement level.`,
      isEligible: false,
      isApprovedForRole: false,
    };
  }

  // Evaluate RBAC policy
  const rbac = await validateAccessRequest(employeeId, matchedPerm.permission_id);

  // Submit formal request
  const submitResult = await submitAccessRequest({
    employee_id: employeeId,
    permission_id: matchedPerm.permission_id,
    business_justification: `Access request submitted via IntelliDesk AI chat: "${userMessage}"`,
    correlation_id: correlationId,
  });

  const request = submitResult.request;

  let msg = `### 🔐 Access Request Created: [${request.request_id}]
- **Application**: ${matchedPerm.application_id}
- **Permission**: ${matchedPerm.permission_name}
- **Assessed Risk Level**: \`${rbac.riskLevel}\`
- **Role Entitlement Status**: ${rbac.isApprovedForRole ? '✅ Approved In-Role' : '⚠️ **OUT-OF-ROLE** (Flags: ' + rbac.flags.join(', ') + ')'}
- **Current Status**: \`${request.request_status}\`
- **Required Approval Stages**: ${rbac.requiredApprovalStages.join(' ➔ ')}

`;

  if (!rbac.isApprovedForRole) {
    msg += `> ⚠️ **Policy Notice**: Because this permission is outside your standard role profile (${profile.designation}), it has been flagged for elevated review by the Application Owner and Security Administrator. It cannot be granted automatically.`;
  } else {
    msg += `> Your request has been routed to your direct manager (${profile.manager_id || 'Sarah Jenkins'}) for initial review.`;
  }

  return {
    message: msg,
    isEligible: true,
    isApprovedForRole: rbac.isApprovedForRole,
    requestId: request.request_id,
    details: {
      permission_id: matchedPerm.permission_id,
      risk_level: rbac.riskLevel,
      required_stages: rbac.requiredApprovalStages,
    }
  };
}

