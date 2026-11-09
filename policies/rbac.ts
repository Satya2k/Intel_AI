import { db } from '@/lib/database/db-client';
import { RiskLevel } from '@/lib/database/types';

export interface RBACValidationResult {
  isPermitted: boolean;
  isApprovedForRole: boolean;
  employeeRole: string;
  department: string;
  requestedPermission: string;
  riskLevel: RiskLevel;
  requiresSecurityApproval: boolean;
  requiredApprovalStages: ('MANAGER' | 'APP_OWNER' | 'SECURITY_ADMIN')[];
  flags: string[];
  rationale: string;
}

/**
 * Deterministic Role-Based Access Control (RBAC) Engine
 * Evaluates entitlements against approved enterprise matrices.
 * Follows least privilege and deny-by-default principles.
 */
export async function validateAccessRequest(
  employeeId: string,
  permissionId: string
): Promise<RBACValidationResult> {
  const profile = await db.getProfile(employeeId);
  if (!profile) {
    return {
      isPermitted: false,
      isApprovedForRole: false,
      employeeRole: 'UNKNOWN',
      department: 'UNKNOWN',
      requestedPermission: permissionId,
      riskLevel: 'HIGH',
      requiresSecurityApproval: true,
      requiredApprovalStages: ['MANAGER', 'SECURITY_ADMIN'],
      flags: ['EMPLOYEE_NOT_FOUND'],
      rationale: `Employee [${employeeId}] does not exist in master identity directory.`,
    };
  }

  const permission = await db.getRolePermission(permissionId);
  if (!permission) {
    return {
      isPermitted: false,
      isApprovedForRole: false,
      employeeRole: profile.designation,
      department: profile.department,
      requestedPermission: permissionId,
      riskLevel: 'CRITICAL',
      requiresSecurityApproval: true,
      requiredApprovalStages: ['MANAGER', 'SECURITY_ADMIN'],
      flags: ['UNKNOWN_PERMISSION_IDENTIFIER'],
      rationale: `Permission [${permissionId}] is not recognized in corporate catalog.`,
    };
  }

  // Find all approved roles for this employee's department/title
  const roles = await db.getRoles();
  const matchedRole = roles.find(r => 
    r.department.toLowerCase() === profile.department.toLowerCase() &&
    (profile.designation.toLowerCase().includes(r.role_name.toLowerCase()) || r.role_name.toLowerCase().includes(profile.designation.toLowerCase()))
  );

  const roleId = matchedRole ? matchedRole.role_id : `ROLE-${profile.department.toUpperCase()}-GENERAL`;

  // Check if this specific permission is mapped to the employee's role
  const isApprovedForRole = permission.role_id === roleId;
  const flags: string[] = [];

  if (!isApprovedForRole) {
    flags.push('OUT_OF_ROLE_REQUEST');
  }

  if (permission.risk_level === 'HIGH' || permission.risk_level === 'CRITICAL') {
    flags.push(`ELEVATED_RISK_${permission.risk_level}`);
  }

  if (permission.requires_security_approval) {
    flags.push('SECURITY_OFFICER_REVIEW_MANDATORY');
  }

  // Determine required approval stages
  const requiredApprovalStages: ('MANAGER' | 'APP_OWNER' | 'SECURITY_ADMIN')[] = ['MANAGER'];

  if (!isApprovedForRole || permission.risk_level === 'HIGH' || permission.risk_level === 'CRITICAL') {
    requiredApprovalStages.push('APP_OWNER');
  }

  if (permission.risk_level === 'CRITICAL' || permission.requires_security_approval) {
    if (!requiredApprovalStages.includes('SECURITY_ADMIN')) {
      requiredApprovalStages.push('SECURITY_ADMIN');
    }
  }

  const rationale = isApprovedForRole
    ? `Permission [${permission.permission_name}] is mapped to role [${matchedRole?.role_name || profile.designation}]. Standard manager approval required.`
    : `WARNING: [${permission.permission_name}] is OUT-OF-ROLE for [${profile.designation} (${profile.department})]. Multi-stage review required: [${requiredApprovalStages.join(' -> ')}].`;

  return {
    isPermitted: true, // Eligible to submit for approval, but cannot be provisioned without human-in-the-loop
    isApprovedForRole,
    employeeRole: matchedRole?.role_name || profile.designation,
    department: profile.department,
    requestedPermission: permission.permission_name,
    riskLevel: permission.risk_level,
    requiresSecurityApproval: permission.requires_security_approval,
    requiredApprovalStages,
    flags,
    rationale,
  };
}

