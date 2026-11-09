'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bot, ShieldCheck, LifeBuoy, CheckSquare, BarChart3, 
  Users, ArrowRight, Sparkles, Database, CheckCircle2, 
  AlertTriangle, Lock, Cpu, Terminal, Activity 
} from 'lucide-react';
import { usePersona, DEMO_PERSONAS } from '@/components/layout/PersonaContext';

export default function LandingPage() {
  const { setPersona } = usePersona();
  const [stats, setStats] = useState({
    totalTickets: 20,
    openTickets: 10,
    slaComplianceRate: 98,
    provisioningSuccessRate: 100,
    totalAccessRequests: 10,
  });

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.analytics) setStats(d.analytics);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic AI for Business Operations • Northstar Technologies</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Autonomous IT Service Desk & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              Identity Access Governance
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            IntelliDesk AI orchestrates a multi-agent supervisor–worker hierarchy to automate IT incident triage, RAG-grounded troubleshooting on 20+ enterprise SOPs, role-based access validation (RBAC), multi-stage human approval workflows, and simulated lifecycle provisioning.
          </p>

          {/* Quick Launch Personas */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Fast Launch Demo Persona:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <Link
                href="/employee"
                onClick={() => setPersona(DEMO_PERSONAS[0])}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-400 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    Alice Chen (Employee)
                  </div>
                  <div className="text-[11px] text-slate-400">Senior Financial Analyst</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/approvals"
                onClick={() => setPersona(DEMO_PERSONAS[1])}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Sarah Jenkins (Manager)
                  </div>
                  <div className="text-[11px] text-slate-400">Finance Director (Approver)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/service-desk"
                onClick={() => setPersona(DEMO_PERSONAS[2])}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
                    Vikram Patel (IT Admin)
                  </div>
                  <div className="text-[11px] text-slate-400">IT Service Desk Lead</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/iam"
                onClick={() => setPersona(DEMO_PERSONAS[3])}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Alex Mercer (IAM Admin)
                  </div>
                  <div className="text-[11px] text-slate-400">Principal IAM Architect</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/audit"
                onClick={() => setPersona(DEMO_PERSONAS[4])}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-rose-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    Elena Rostova (CISO)
                  </div>
                  <div className="text-[11px] text-slate-400">Chief Information Security Officer</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/analytics"
                className="p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    Live Analytics Dashboard
                  </div>
                  <div className="text-[11px] text-blue-400/80">Real DB Aggregations & CSVs</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/tests"
                className="p-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-between text-left transition-all group sm:col-span-2 lg:col-span-1"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Guardrail Test Harness (/tests)
                  </div>
                  <div className="text-[11px] text-emerald-400/80">20 Deterministic Unit Tests</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Metrics Strip (Computed directly from real database) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">Total IT Tickets</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalTickets}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Persisted in DB</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">Active Incidents</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{stats.openTickets}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Queue assigned</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">SLA Compliance</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.slaComplianceRate}%</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Deterministic SLA matrix</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">Access Requests</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{stats.totalAccessRequests}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Multi-stage routed</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="text-slate-400 text-xs font-medium">Provisioning Rate</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.provisioningSuccessRate}%</div>
          <div className="text-[11px] text-cyan-400/80 mt-0.5">Idempotent simulator</div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Multi-Agent Architecture</h2>
          <p className="text-sm text-slate-400">
            Specialized workers coordinate under an orchestrator supervisor, with deterministic guardrails preventing unauthorized autonomy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Supervisor–Worker Orchestration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One supervisor agent parses natural language intent and coordinates 6 specialized workers (Service Desk, Knowledge/RAG, IAM Policy, Approvals, Provisioning, and Audit).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">RAG Knowledge Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              20 synthetic standard operating procedures (SOPs) indexed for semantic and keyword retrieval with strict source attribution, preventing hallucinated advice.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">RBAC & Human-in-the-Loop</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic role-permission matrix. Zero autonomous approvals for privileged access. Strict separation of duties prevents requester self-approval.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

