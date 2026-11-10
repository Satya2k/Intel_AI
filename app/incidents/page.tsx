'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, Clock, Radio, Users, 
  ExternalLink, Plus, MessageSquare, CheckCircle2, ChevronRight,
  RefreshCw, Activity
} from 'lucide-react';
import { MajorIncident } from '@/lib/database/types';
import { usePersona } from '@/components/layout/PersonaContext';

export default function MajorIncidentsPage() {
  const { currentPersona } = usePersona();
  const [incidents, setIncidents] = useState<MajorIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<MajorIncident | null>(null);

  // Modal states
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSeverity, setNewSeverity] = useState<'SEV-1' | 'SEV-2' | 'SEV-3'>('SEV-1');
  const [newImpact, setNewImpact] = useState('');
  const [newServices, setNewServices] = useState('SAP S/4HANA, Production Database');
  const [declaring, setDeclaring] = useState(false);

  // Update post state
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED'>('INVESTIGATING');
  const [postingUpdate, setPostingUpdate] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (data.success && data.incidents) {
        setIncidents(data.incidents);
        if (!selectedIncident && data.incidents.length > 0) {
          setSelectedIncident(data.incidents[0]);
        } else if (selectedIncident) {
          const updated = data.incidents.find((i: MajorIncident) => i.incident_id === selectedIncident.incident_id);
          if (updated) setSelectedIncident(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDeclareIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    try {
      setDeclaring(true);
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          summary: newSummary,
          severity: newSeverity,
          commander_id: currentPersona.employee_id,
          affected_services: newServices.split(',').map(s => s.trim()).filter(Boolean),
          business_impact: newImpact || 'Degraded operational capability',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDeclareModal(false);
        setNewTitle('');
        setNewSummary('');
        setNewImpact('');
        await fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to declare incident', err);
    } finally {
      setDeclaring(false);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !updateMessage) return;

    try {
      setPostingUpdate(true);
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.incident_id,
          author: `${currentPersona.name} (${currentPersona.role})`,
          message: updateMessage,
          status: updateStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMessage('');
        await fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to post update', err);
    } finally {
      setPostingUpdate(false);
    }
  };

  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const sev1Count = incidents.filter(i => i.severity === 'SEV-1' && i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Major Incident Command Center
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  ITIL Sev-1 / Sev-2
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                War room coordination, real-time stakeholder broadcasts, and mission-critical system restoration.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchIncidents}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh active incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowDeclareModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Major Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Outages</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{activeCount}</span>
            <span className="text-[10px] text-slate-500">ongoing</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> SEV-1 Outages
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{sev1Count}</span>
            <span className="text-[10px] text-slate-500 font-mono">Critical Impact</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> War Room Bridges
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">{activeCount > 0 ? 'Active' : 'Standby'}</span>
            <span className="text-[10px] text-slate-500">Live Voice Bridge</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mean Time to Restor.
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">42m</span>
            <span className="text-[10px] text-slate-500">Within 2h SLA</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incidents Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Declared Incidents ({incidents.length})
          </div>

          <div className="space-y-2.5">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.incident_id === inc.incident_id;
              const isResolved = inc.status === 'RESOLVED';
              return (
                <div
                  key={inc.incident_id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        inc.severity === 'SEV-1' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : inc.severity === 'SEV-2'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{inc.incident_id}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug mb-1.5">{inc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{inc.summary}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(inc.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-slate-400 font-medium">Cmd: {inc.commander_id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Incident War Room & Timeline */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              {/* War Room Header Banner */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                      selectedIncident.severity === 'SEV-1' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {selectedIncident.severity}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">{selectedIncident.incident_id}</span>
                  </div>
                  {selectedIncident.bridge_url && (
                    <a
                      href={selectedIncident.bridge_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Join War Room Bridge</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>

                <h2 className="text-lg font-bold text-white mb-2">{selectedIncident.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{selectedIncident.summary}</p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Incident Commander</div>
                    <div className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{selectedIncident.commander_id}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Started At</div>
                    <div className="font-mono text-slate-200 mt-0.5">
                      {new Date(selectedIncident.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Affected Services</div>
                    <div className="text-slate-200 mt-0.5 truncate">
                      {selectedIncident.affected_services.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs text-rose-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Business Impact:</span> {selectedIncident.business_impact}
                  </div>
                </div>
              </div>

              {/* War Room Timeline & Broadcast Feed */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Live Incident Timeline ({selectedIncident.updates?.length || 0} Events)</span>
                  </div>
                </div>

                {/* Post New Update Form */}
                <form onSubmit={handlePostUpdate} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-300">Broadcast Stakeholder Update:</span>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none"
                    >
                      <option value="INVESTIGATING">Status: Investigating</option>
                      <option value="IDENTIFIED">Status: Root Cause Identified</option>
                      <option value="MONITORING">Status: Mitigation Applied (Monitoring)</option>
                      <option value="RESOLVED">Status: Incident Resolved</option>
                    </select>
                  </div>
                  <textarea
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder="Enter official incident update message for executive distribution..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={postingUpdate || !updateMessage.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{postingUpdate ? 'Broadcasting...' : 'Broadcast Update'}</span>
                    </button>
                  </div>
                </form>

                {/* Timeline Items */}
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
                  {selectedIncident.updates?.map((upd) => (
                    <div key={upd.update_id} className="relative flex items-start gap-3 pl-1">
                      <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center shrink-0 z-10" />
                      <div className="flex-1 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-white">{upd.author}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(upd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-blue-400 border border-slate-700">
                              {upd.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{upd.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Select an incident from the directory to view war room diagnostics
            </div>
          )}
        </div>
      </div>

      {/* Declare Incident Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Declare Major Operational Incident</span>
              </div>
              <button onClick={() => setShowDeclareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleDeclareIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Global SAP ERP Transaction Failure"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value="SEV-1">SEV-1 (Critical Enterprise Down)</option>
                    <option value="SEV-2">SEV-2 (Major Feature Degraded)</option>
                    <option value="SEV-3">SEV-3 (Moderate Operational Issue)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Affected Services</label>
                  <input
                    type="text"
                    value={newServices}
                    onChange={(e) => setNewServices(e.target.value)}
                    placeholder="e.g., SAP, Okta, VPN"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Summary of Symptoms</label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe observed failure symptoms and affected locations..."
                  rows={2}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Business Impact Statement</label>
                <input
                  type="text"
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                  placeholder="e.g., 500+ employees unable to log in, invoice generation halted"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeclareModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={declaring}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {declaring ? 'Declaring...' : 'Declare Incident & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
