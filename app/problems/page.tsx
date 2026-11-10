'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, CheckCircle2, AlertCircle, Clock, 
  Plus, Search, Wrench, FileText, ChevronRight, RefreshCw,
  BookOpen, Link2
} from 'lucide-react';
import { ProblemRecord } from '@/lib/database/types';
import { usePersona } from '@/components/layout/PersonaContext';

export default function ProblemsPage() {
  const { currentPersona } = usePersona();
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProblem, setSelectedProblem] = useState<ProblemRecord | null>(null);

  // Modal create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<any>('VPN');
  const [newRootCause, setNewRootCause] = useState('');
  const [newWorkaround, setNewWorkaround] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit / Update state
  const [editWorkaround, setEditWorkaround] = useState('');
  const [editPermanentFix, setEditPermanentFix] = useState('');
  const [editStatus, setEditStatus] = useState<any>('KNOWN_ERROR');
  const [updating, setUpdating] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/problems');
      const data = await res.json();
      if (data.success && data.problems) {
        setProblems(data.problems);
        if (!selectedProblem && data.problems.length > 0) {
          setSelectedProblem(data.problems[0]);
          setEditWorkaround(data.problems[0].workaround || '');
          setEditPermanentFix(data.problems[0].permanent_fix || '');
          setEditStatus(data.problems[0].status);
        } else if (selectedProblem) {
          const updated = data.problems.find((p: ProblemRecord) => p.problem_id === selectedProblem.problem_id);
          if (updated) {
            setSelectedProblem(updated);
            setEditWorkaround(updated.workaround || '');
            setEditPermanentFix(updated.permanent_fix || '');
            setEditStatus(updated.status);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch problems', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSelectProblem = (p: ProblemRecord) => {
    setSelectedProblem(p);
    setEditWorkaround(p.workaround || '');
    setEditPermanentFix(p.permanent_fix || '');
    setEditStatus(p.status);
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    try {
      setCreating(true);
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          root_cause: newRootCause,
          workaround: newWorkaround,
          owner: currentPersona.name,
          status: newWorkaround ? 'KNOWN_ERROR' : 'INVESTIGATING',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewRootCause('');
        setNewWorkaround('');
        await fetchProblems();
      }
    } catch (err) {
      console.error('Failed to create problem', err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem) return;

    try {
      setUpdating(true);
      const res = await fetch('/api/problems', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: selectedProblem.problem_id,
          workaround: editWorkaround,
          permanent_fix: editPermanentFix,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProblems();
      }
    } catch (err) {
      console.error('Failed to update problem', err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = problems.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.problem_id.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                ITIL Problem Management & KEDB
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Known Error Database
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Cluster recurring incidents, document definitive root causes, and publish standard workarounds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProblems}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh problems"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Problem Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by ID, symptom, category..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'KNOWN_ERROR', 'INVESTIGATING', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Problem Records ({filtered.length})
          </div>

          <div className="space-y-2.5">
            {filtered.map((prb) => {
              const isSelected = selectedProblem?.problem_id === prb.problem_id;
              return (
                <div
                  key={prb.problem_id}
                  onClick={() => handleSelectProblem(prb)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">{prb.problem_id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {prb.category}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      prb.status === 'KNOWN_ERROR'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : prb.status === 'RESOLVED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {prb.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug mb-1.5">{prb.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{prb.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-slate-400" />
                      {prb.related_ticket_ids?.length || 0} Linked Incidents
                    </span>
                    <span>Owner: {prb.owner}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Workaround Panel */}
        <div className="lg:col-span-7">
          {selectedProblem ? (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-5 p-5">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-400">{selectedProblem.problem_id}</span>
                  <span className="text-xs text-slate-500">
                    Logged: {new Date(selectedProblem.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{selectedProblem.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedProblem.description}</p>
              </div>

              {/* Root Cause Analysis */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Technical Root Cause</span>
                </div>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  {selectedProblem.root_cause || 'Root cause investigation in progress by senior systems engineering.'}
                </p>
              </div>

              {/* Workaround & Permanent Fix (KEDB Entry) */}
              <form onSubmit={handleUpdateProblem} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Approved KEDB Workaround (Self-Service Mitigation)</span>
                    </label>
                  </div>
                  <textarea
                    value={editWorkaround}
                    onChange={(e) => setEditWorkaround(e.target.value)}
                    placeholder="Document exact temporary remediation command or bypass procedure..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
                    Permanent Architectural Fix
                  </label>
                  <textarea
                    value={editPermanentFix}
                    onChange={(e) => setEditPermanentFix(e.target.value)}
                    placeholder="Planned software release, patch, or hardware configuration..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Lifecycle Status:</span>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none"
                    >
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="KNOWN_ERROR">KNOWN_ERROR (Workaround Logged)</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Publish KEDB Updates'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Select a problem record to review root causes and workarounds
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white">Create New Problem Record</span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Problem Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Periodic VPN disconnects during network handover"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                >
                  <option value="VPN">VPN</option>
                  <option value="Network">Network</option>
                  <option value="Software">Software</option>
                  <option value="ERP and SAP">ERP and SAP</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Email and Microsoft 365">Email and Microsoft 365</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Symptom Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the repeating incident pattern..."
                  rows={2}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Identified Root Cause (Optional)</label>
                <input
                  type="text"
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  placeholder="Underlying defect or config conflict..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Temporary Workaround (Optional)</label>
                <textarea
                  value={newWorkaround}
                  onChange={(e) => setNewWorkaround(e.target.value)}
                  placeholder="Immediate workaround steps for service desk staff..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {creating ? 'Logging...' : 'Save Problem Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
