'use client';

import React from 'react';
import { 
  Cpu, Bot, Zap, Clock, ShieldCheck, 
  Terminal, Layers, ArrowRight, Play, CheckCircle2, Activity
} from 'lucide-react';
import { AgentExecutionTracker } from '@/components/AgentExecutionTracker';

export default function AIMonitoringPage() {
  const agents = [
    {
      name: 'Supervisor Orchestrator',
      role: 'Intent Classification & State Machine',
      model: 'gemini-2.5-flash',
      status: 'ONLINE',
      avgLatency: '142ms',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    },
    {
      name: 'Knowledge / RAG Agent',
      role: 'SOP Grounding & Vector Search',
      model: 'BM25 + Semantic Vector',
      status: 'ONLINE',
      avgLatency: '45ms',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    },
    {
      name: 'IAM & Entitlement Agent',
      role: 'RBAC, SoD Validation & Stage Routing',
      model: 'Deterministic Policy Engine',
      status: 'ONLINE',
      avgLatency: '28ms',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    },
    {
      name: 'Service Desk Triage Agent',
      role: 'Impact x Urgency Deterministic Matrix',
      model: 'ITIL Priority Matrix',
      status: 'ONLINE',
      avgLatency: '15ms',
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    },
    {
      name: 'Security & Audit Agent',
      role: 'Append-Only Hash Integrity & Guardrails',
      model: 'SHA-256 Correlation Ledger',
      status: 'ONLINE',
      avgLatency: '12ms',
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                AI Agent Topology & Latency Telemetry HUD
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Real-Time Inspector
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Hierarchical multi-agent runtime coordination, sub-agent dispatch latency, and automated guardrail verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Telemetry Stream: Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Agent Nodes</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">5</span>
            <span className="text-[10px] text-emerald-400">All Operational</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> End-to-End P95 Latency
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">242ms</span>
            <span className="text-[10px] text-slate-500">Sub-second SLA</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Guardrail Pass Rate
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-400">100%</span>
            <span className="text-[10px] text-slate-500">20 / 20 Tests</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Deflection Rate
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">78%</span>
            <span className="text-[10px] text-slate-500">Zero-Touch L1</span>
          </div>
        </div>
      </div>

      {/* Multi-Agent Architecture Topology Map */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Multi-Agent Dispatch & Delegation Topology</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">LangGraph.js Orchestration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {agents.map((ag, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${ag.color} flex flex-col justify-between space-y-3`}>
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900/80 border border-slate-700">
                    {ag.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold">{ag.avgLatency}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{ag.name}</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{ag.role}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                Engine: {ag.model}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Live Execution Tracker HUD */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Interactive Agent Execution & Latency Telemetry HUD
        </div>
        <AgentExecutionTracker defaultExpanded={true} />
      </div>
    </div>
  );
}
