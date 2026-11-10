'use client';

import React, { useState, useEffect } from 'react';
import { 
  KeyRound, ShieldCheck, ShieldAlert, Clock, 
  Lock, Plus, RefreshCw, CheckCircle2, AlertTriangle, UserCheck
} from 'lucide-react';
import { PrivilegedAccount } from '@/lib/database/types';
import { usePersona } from '@/components/layout/PersonaContext';

export default function PrivilegedAccessPage() {
  const { currentPersona } = usePersona();
  const [accounts, setAccounts] = useState<PrivilegedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Elevation Modal
  const [showElevationModal, setShowElevationModal] = useState(false);
  const [targetApp, setTargetApp] = useState('APP-AWS');
  const [targetRole, setTargetRole] = useState('AWS AdministratorAccess');
  const [hours, setHours] = useState(4);
  const [justification, setJustification] = useState('');
  const [elevating, setElevating] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/privileged-access');
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to load privileged accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRequestElevation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification) return;

    try {
      setElevating(true);
      const res = await fetch('/api/privileged-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: currentPersona.employee_id,
          application_id: targetApp,
          privileged_role: targetRole,
          hours,
          justification,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowElevationModal(false);
        setJustification('');
        await fetchAccounts();
      }
    } catch (err) {
      console.error('Failed to request elevation', err);
    } finally {
      setElevating(false);
    }
  };

  const handleCertify = async (id: string, status: 'CERTIFIED' | 'FLAGGED') => {
    try {
      const res = await fetch('/api/privileged-access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAccounts();
      }
    } catch (err) {
      console.error('Failed to update certification', err);
    }
  };

  const jitCount = accounts.filter(a => a.elevation_type === 'TIME_BOUND_JIT').length;
  const certifiedCount = accounts.filter(a => a.certification_status === 'CERTIFIED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Privileged Access Governance (PAM)
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Zero Standing Privileges
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Just-In-Time temporary elevation, segregation of duties validation, and quarterly access recertification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAccounts}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowElevationModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request JIT Elevation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Privileged Accounts</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{accounts.length}</span>
            <span className="text-[10px] text-slate-500">Tier-0 / Tier-1</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> JIT Time-Bound
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-400">{jitCount}</span>
            <span className="text-[10px] text-slate-500">Auto-Expiring</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> MFA Enforced
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">100%</span>
            <span className="text-[10px] text-slate-500 font-mono">FIDO2 / WebAuthn</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Recertification Status
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-400">{certifiedCount} / {accounts.length}</span>
            <span className="text-[10px] text-slate-500">Certified</span>
          </div>
        </div>
      </div>

      {/* Privileged Accounts Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Privileged Identity Inventory & Certification Matrix
          </div>
          <span className="text-xs text-slate-500 font-mono">SOC 2 CC6.3 Compliant</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Identity</th>
                <th className="py-3 px-4 font-semibold">Target Application</th>
                <th className="py-3 px-4 font-semibold">Privileged Entitlement</th>
                <th className="py-3 px-4 font-semibold">Elevation Type</th>
                <th className="py-3 px-4 font-semibold">Validity</th>
                <th className="py-3 px-4 font-semibold">Certification</th>
                <th className="py-3 px-4 font-semibold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <div>{acc.employee_name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{acc.employee_id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {acc.application_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/40">
                      {acc.privileged_role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      acc.elevation_type === 'TIME_BOUND_JIT'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {acc.elevation_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {acc.valid_until ? (
                      <span className="text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires {new Date(acc.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-slate-500">Permanent Role</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      acc.certification_status === 'CERTIFIED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : acc.certification_status === 'FLAGGED'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {acc.certification_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCertify(acc.id, 'CERTIFIED')}
                        className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold transition-colors"
                      >
                        Certify
                      </button>
                      <button
                        onClick={() => handleCertify(acc.id, 'FLAGGED')}
                        className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-[10px] font-semibold transition-colors"
                      >
                        Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elevation Modal */}
      {showElevationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                Request Just-In-Time (JIT) Elevation
              </span>
              <button onClick={() => setShowElevationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRequestElevation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Application</label>
                <select
                  value={targetApp}
                  onChange={(e) => {
                    setTargetApp(e.target.value);
                    if (e.target.value === 'APP-AWS') setTargetRole('AWS AdministratorAccess');
                    else if (e.target.value === 'APP-SNOW') setTargetRole('ACCOUNTADMIN');
                    else if (e.target.value === 'APP-SAP') setTargetRole('SAP S_TABU_DIS');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                >
                  <option value="APP-AWS">AWS Cloud Infrastructure</option>
                  <option value="APP-SNOW">Snowflake Data Warehouse</option>
                  <option value="APP-SAP">SAP S/4HANA Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Requested Privileged Entitlement</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Duration (Hours - max 8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Business Justification & Incident/Change Ref</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Performing emergency DB vacuum for SEV-1 INC-MAJ-2026-001..."
                  rows={3}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowElevationModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={elevating}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {elevating ? 'Elevating...' : 'Authorize JIT Elevation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
