'use client';

import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, Filter, AlertOctagon, CheckCircle2, Clock, 
  Search, ShieldAlert, ArrowUpRight, User, RefreshCw, X
} from 'lucide-react';
import { usePersona } from '@/components/layout/PersonaContext';

export default function ServiceDeskPage() {
  const { currentPersona } = usePersona();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Ticket for Detail Drawer
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filterPriority, filterCategory, filterStatus]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = '/api/tickets?';
      if (filterPriority !== 'ALL') url += `priority=${filterPriority}&`;
      if (filterCategory !== 'ALL') url += `category=${filterCategory}&`;
      if (filterStatus !== 'ALL') url += `status=${filterStatus}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket || !statusUpdate) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.ticket_id,
          status: statusUpdate,
          actor_id: currentPersona.employee_id,
          resolution_notes: resolutionNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.ticket) {
        setSelectedTicket(data.ticket);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return t.ticket_id.toLowerCase().includes(q) ||
           t.title.toLowerCase().includes(q) ||
           t.employee_id.toLowerCase().includes(q) ||
           t.assigned_team.toLowerCase().includes(q);
  });

  // KPI Calculations
  const totalOpen = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'AWAITING_USER').length;
  const criticalP1 = tickets.filter(t => t.priority === 'P1').length;
  const totalResolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-400" />
            IT Service Desk Console
          </h1>
          <p className="text-xs text-slate-400">
            Real-time incident triage, deterministic priority assignment, and SLA queue management.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Open Incidents</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{totalOpen}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting technical triage</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Critical (P1 Outages)</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{criticalP1}</div>
          <div className="text-[11px] text-red-400/80 mt-0.5">4h SLA response window</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Resolved Incidents</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalResolved}</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Across all departments</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Active Queue Size</div>
          <div className="text-2xl font-bold text-white mt-1">{tickets.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Persisted database records</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by ID, employee, title, or assigned team..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="AWAITING_USER">AWAITING_USER</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Team</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA Due</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {filteredTickets.map((t) => (
                <tr
                  key={t.ticket_id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setStatusUpdate(t.status);
                    setResolutionNotes(t.resolution_notes || '');
                  }}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-blue-400">
                    {t.ticket_id}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {t.employee_id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white max-w-xs truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-400">{t.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      t.priority === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      t.priority === 'P2' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      t.priority === 'P3' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {t.assigned_team}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                      t.status === 'ESCALATED' ? 'bg-purple-500/20 text-purple-400' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-700/50 text-slate-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(t.sla_due_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-400 hover:text-blue-300 font-medium">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-blue-400">{selectedTicket.ticket_id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-400">
                  {selectedTicket.priority}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedTicket.title}</h3>
                <p className="text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <div className="text-slate-400">Category</div>
                  <div className="font-semibold text-white mt-0.5">{selectedTicket.category}</div>
                </div>
                <div>
                  <div className="text-slate-400">Assigned Team</div>
                  <div className="font-semibold text-white mt-0.5">{selectedTicket.assigned_team}</div>
                </div>
                <div>
                  <div className="text-slate-400">Requester</div>
                  <div className="font-mono text-white mt-0.5">{selectedTicket.employee_id}</div>
                </div>
                <div>
                  <div className="text-slate-400">Current Status</div>
                  <div className="font-semibold text-emerald-400 mt-0.5">{selectedTicket.status}</div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="space-y-3 pt-2">
                <label className="block text-slate-300 font-semibold">Change Ticket Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusUpdate(st)}
                      className={`p-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                        statusUpdate === st
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Resolution / Technical Notes</label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document root cause, applied KB procedure, or resolution steps..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTicket}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20"
              >
                {isUpdating ? 'Saving to Database...' : 'Save Ticket Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

