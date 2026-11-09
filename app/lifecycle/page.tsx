'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ArrowRightLeft, UserX, CheckCircle2, 
  AlertTriangle, RefreshCw, Clock, ShieldCheck, FileText 
} from 'lucide-react';
import { usePersona } from '@/components/layout/PersonaContext';

export default function LifecycleConsolePage() {
  const { currentPersona } = usePersona();
  const [activeTab, setActiveTab] = useState<'JOINER' | 'MOVER' | 'LEAVER' | 'HISTORY'>('JOINER');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string; details?: any } | null>(null);

  // Joiner Form State
  const [joinerEmpId, setJoinerEmpId] = useState(`EMP-FIN-00${Math.floor(Math.random() * 80) + 10}`);
  const [joinerName, setJoinerName] = useState('Brandon Scott');
  const [joinerEmail, setJoinerEmail] = useState('brandon.scott@northstar-tech.internal');
  const [joinerDept, setJoinerDept] = useState('Finance');
  const [joinerTitle, setJoinerTitle] = useState('Financial Analyst');

  // Mover Form State
  const [moverEmpId, setMoverEmpId] = useState('EMP-FIN-003');
  const [moverNewDept, setMoverNewDept] = useState('Operations');
  const [moverNewTitle, setMoverNewTitle] = useState('Operations Analyst');

  // Leaver Form State
  const [leaverEmpId, setLeaverEmpId] = useState('EMP-FIN-004');
  const [leaverReason, setLeaverReason] = useState('Voluntary resignation / new external employment');
  const [verifiedHrCheck, setVerifiedHrCheck] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/lifecycle');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteJoiner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'JOINER',
          employee_id: joinerEmpId,
          full_name: joinerName,
          email: joinerEmail,
          department: joinerDept,
          designation: joinerTitle,
          manager_id: 'EMP-FIN-001',
          created_by: currentPersona.employee_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'ERROR', message: data.error || 'Joiner workflow failed.' });
      } else {
        setFeedback({
          type: 'SUCCESS',
          message: `Joiner workflow completed! Onboarded ${joinerName} and provisioned ${data.provisionedCount} baseline role entitlements.`,
          details: data,
        });
        loadEvents();
      }
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteMover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'MOVER',
          employee_id: moverEmpId,
          new_department: moverNewDept,
          new_designation: moverNewTitle,
          new_manager_id: 'EMP-OPS-001',
          created_by: currentPersona.employee_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'ERROR', message: data.error || 'Mover workflow failed.' });
      } else {
        setFeedback({
          type: 'SUCCESS',
          message: `Mover transfer completed! Revoked ${data.revokedCount} obsolete entitlements and granted ${data.grantedCount} new department entitlements.`,
          details: data,
        });
        loadEvents();
      }
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteLeaver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'LEAVER',
          employee_id: leaverEmpId,
          exit_reason: leaverReason,
          is_verified_hr_event: verifiedHrCheck,
          created_by: currentPersona.employee_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'ERROR', message: data.error || 'Leaver workflow failed.' });
      } else {
        setFeedback({
          type: 'SUCCESS',
          message: `Offboarding completed! 100% of active application access (${data.revokedCount} entitlements) revoked. Account status set to TERMINATED.`,
          details: data,
        });
        loadEvents();
      }
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Joiner, Mover & Leaver (JML) Employee Lifecycle Engine
          </h1>
          <p className="text-xs text-slate-400">
            Simulates automated enterprise HR lifecycle events, entitlement recalculations, and complete access revocations.
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Event Queue
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
          feedback.type === 'SUCCESS'
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
            : 'bg-red-950/40 text-red-300 border-red-800/60'
        }`}>
          {feedback.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          <div>
            <div className="font-semibold">{feedback.message}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('JOINER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'JOINER'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Joiner (Onboarding)
        </button>

        <button
          onClick={() => setActiveTab('MOVER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'MOVER'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Mover (Role Transfer)
        </button>

        <button
          onClick={() => setActiveTab('LEAVER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'LEAVER'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserX className="w-4 h-4" />
          Leaver (Exit & Revocation)
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Lifecycle Event Log ({events.length})
        </button>
      </div>

      {/* Tab 1: JOINER WORKFLOW */}
      {activeTab === 'JOINER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 max-w-2xl shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Simulate New Employee Onboarding Event
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receives a synthetic Workday onboarding payload, establishes directory identity, and automatically provisions baseline department entitlements.
            </p>
          </div>

          <form onSubmit={handleExecuteJoiner} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Employee ID</label>
                <input
                  type="text"
                  value={joinerEmpId}
                  onChange={(e) => setJoinerEmpId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={joinerName}
                  onChange={(e) => setJoinerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Corporate Email Address</label>
              <input
                type="email"
                value={joinerEmail}
                onChange={(e) => setJoinerEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Department</label>
                <select
                  value={joinerDept}
                  onChange={(e) => setJoinerDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                >
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Job Designation</label>
                <input
                  type="text"
                  value={joinerTitle}
                  onChange={(e) => setJoinerTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Processing Onboarding Workflow...' : 'Execute Joiner Workflow & Provision'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: MOVER WORKFLOW */}
      {activeTab === 'MOVER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 max-w-2xl shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              Simulate Employee Department Transfer (Mover)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recalculates entitlements against the target role. Revokes obsolete department entitlements and provisions newly required permissions.
            </p>
          </div>

          <form onSubmit={handleExecuteMover} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Transferring Employee</label>
              <select
                value={moverEmpId}
                onChange={(e) => setMoverEmpId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
              >
                <option value="EMP-FIN-003">EMP-FIN-003 (Robert Taylor - Financial Analyst)</option>
                <option value="EMP-MKT-002">EMP-MKT-002 (Carlos Ruiz - Marketing Executive)</option>
                <option value="EMP-OPS-002">EMP-OPS-002 (Liam O'Connor - Operations Analyst)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Department</label>
                <select
                  value={moverNewDept}
                  onChange={(e) => setMoverNewDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                >
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Job Designation</label>
                <input
                  type="text"
                  value={moverNewTitle}
                  onChange={(e) => setMoverNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              {loading ? 'Recalculating Entitlement Delta...' : 'Execute Mover Delta Transition'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: LEAVER WORKFLOW */}
      {activeTab === 'LEAVER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 max-w-2xl shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-400" />
              Simulate Employee Exit & Full Access Revocation (Leaver)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers verified HR offboarding. Revokes 100% of active application access, marks account as TERMINATED, and writes final offboarding audit report.
            </p>
          </div>

          <form onSubmit={handleExecuteLeaver} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Departing Employee</label>
              <select
                value={leaverEmpId}
                onChange={(e) => setLeaverEmpId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
              >
                <option value="EMP-FIN-004">EMP-FIN-004 (Chloe Bennett - Billing Specialist)</option>
                <option value="EMP-MKT-004">EMP-MKT-004 (Jordan Reed - Growth Specialist)</option>
                <option value="EMP-OPS-004">EMP-OPS-004 (Daniel Davis - Logistics Analyst)</option>
                <option value="EMP-HR-004">EMP-HR-004 (Emily Watson - People Ops)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Offboarding Reason / Notes</label>
              <input
                type="text"
                value={leaverReason}
                onChange={(e) => setLeaverReason(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>

            {/* Guardrail Checkbox */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="hrVerify"
                checked={verifiedHrCheck}
                onChange={(e) => setVerifiedHrCheck(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="hrVerify" className="text-[11px] text-slate-300">
                <strong>Authoritative HR Verification Gate</strong>: Confirm this is a verified HR departure event (Unchecking will test and demonstrate policy blockage of unverified exit instructions).
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-rose-600/20"
            >
              {loading ? 'Revoking All Entitlements...' : 'Execute Leaver Workflow & Revoke Access'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: HISTORY LOG */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Event ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {events.map((evt) => (
                  <tr key={evt.event_id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                      {evt.event_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        evt.event_type === 'JOINER' ? 'bg-blue-500/20 text-blue-400' :
                        evt.event_type === 'MOVER' ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-white">
                      {evt.employee_id}
                    </td>
                    <td className="px-4 py-3 max-w-sm truncate text-slate-300">
                      {JSON.stringify(evt.details)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                        {evt.event_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(evt.created_at).toLocaleString()}
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

