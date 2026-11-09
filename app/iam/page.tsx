'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, KeyRound, Lock, UserCheck, AlertTriangle, 
  Trash2, RefreshCw, CheckCircle2, XCircle, Search, Layers
} from 'lucide-react';
import { usePersona } from '@/components/layout/PersonaContext';

export default function IAMConsolePage() {
  const { currentPersona } = usePersona();
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'MATRIX' | 'INVENTORY'>('REQUESTS');
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [employeeAccess, setEmployeeAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, aRes, eRes] = await Promise.all([
        fetch('/api/access-requests'),
        fetch('/api/applications'),
        fetch('/api/employees')
      ]);

      const rData = await rRes.json();
      if (rData.requests) setAccessRequests(rData.requests);

      const aData = await aRes.json();
      if (aData.applications) setApplications(aData.applications);
      if (aData.roles) setRoles(aData.roles);
      if (aData.permissions) setPermissions(aData.permissions);

      // Load all employee access inventory
      const allAccessPromises = rData.requests ? (aData.roles || []) : [];
      // We can fetch employees and their active access records
      const empProfiles = eRes.ok ? (await eRes.json()).profiles || [] : [];
      const accessList: any[] = [];
      for (const emp of empProfiles) {
        const single = await (await fetch(`/api/employees?employee_id=${emp.employee_id}`)).json();
        if (single.activeAccess) {
          single.activeAccess.forEach((acc: any) => {
            accessList.push({ ...acc, employee_name: emp.full_name, department: emp.department });
          });
        }
      }
      setEmployeeAccess(accessList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (employeeId: string, permissionId: string) => {
    if (!confirm(`Are you sure you want to revoke entitlement [${permissionId}] from ${employeeId}?`)) return;
    setRevokingId(permissionId);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'LEAVER',
          employee_id: employeeId,
          exit_reason: 'Administrative access revocation via IAM Console',
          created_by: currentPersona.employee_id,
          is_verified_hr_event: true,
        }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Identity & Access Management (IAM) Console
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise RBAC policy governance, entitlement catalog, and simulated provisioning lifecycle.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh IAM State
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'REQUESTS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Access Requests Queue ({accessRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('MATRIX')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'MATRIX'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Role-Permission Matrix ({permissions.length})
        </button>

        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'INVENTORY'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Employee Entitlements ({employeeAccess.length})
        </button>
      </div>

      {/* Tab 1: Access Requests Queue */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Application & Entitlement</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Justification</th>
                  <th className="px-4 py-3">Approval Stage</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {accessRequests.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                      {r.request_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {r.employee_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{r.permission_id}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.application_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        r.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        r.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-300 truncate">
                      {r.business_justification}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      Stage {r.current_approval_stage} of {r.total_stages_required}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.request_status === 'PROVISIONED' ? 'bg-emerald-500/20 text-emerald-400' :
                        r.request_status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {r.request_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Role-Permission Matrix */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Permission ID</th>
                    <th className="px-4 py-3">Entitlement Name</th>
                    <th className="px-4 py-3">Associated Role</th>
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Risk Level</th>
                    <th className="px-4 py-3">Security Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-200">
                  {permissions.map((p) => (
                    <tr key={p.permission_id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">
                        {p.permission_id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {p.permission_name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {p.role_id}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono">
                        {p.application_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          p.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          p.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {p.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.requires_security_approval ? (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Mandatory
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Employee Access Inventory */}
      {activeTab === 'INVENTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Application</th>
                  <th className="px-4 py-3">Entitlement ID</th>
                  <th className="px-4 py-3">Granted Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Revoke Simulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {employeeAccess.map((acc, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{acc.employee_name || acc.employee_id}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{acc.employee_id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {acc.department || 'Finance'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {acc.application_id}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-blue-400">
                      {acc.permission_id}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(acc.granted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevoke(acc.employee_id, acc.permission_id)}
                        disabled={revokingId === acc.permission_id}
                        className="px-2 py-1 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-medium transition-colors"
                      >
                        {revokingId === acc.permission_id ? 'Revoking...' : 'Revoke'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

