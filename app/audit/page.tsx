'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, ShieldCheck, AlertTriangle, 
  CheckCircle2, XCircle, RefreshCw, KeyRound, Lock
} from 'lucide-react';

export default function AuditConsolePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOutcome, setFilterOutcome] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterOutcome !== 'ALL' && l.outcome !== filterOutcome) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.actor_id.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.entity_id.toLowerCase().includes(q) ||
      l.correlation_id.toLowerCase().includes(q) ||
      (l.reason && l.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-rose-400" />
            Security & Compliance Audit Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Immutable, append-only security trail recording all user, agent, and simulated provisioning operations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Audit Trail
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Actor, Correlation ID, Action, or Reason..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DENIED">DENIED / BLOCKED</option>
            <option value="FLAGGED">FLAGGED (Security Alert)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor & Type</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Target</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Reason / Details</th>
                <th className="px-4 py-3">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filteredLogs.map((l) => (
                <tr key={l.log_id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white font-mono">{l.actor_id}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{l.actor_type}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-blue-400">
                    {l.action}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {l.entity_type}: <span className="text-white font-bold">{l.entity_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      l.outcome === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      l.outcome === 'DENIED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {l.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-sm truncate" title={l.reason || ''}>
                    {l.reason || 'Operation recorded'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                    {l.correlation_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

