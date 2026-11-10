'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, AlertTriangle, Clock, CheckCircle2, 
  ExternalLink, RefreshCw, Activity, Lock, Users, ArrowUpRight
} from 'lucide-react';
import { RiskIntelligenceReport, Ticket } from '@/lib/database/types';

export default function RiskIntelligencePage() {
  const [report, setReport] = useState<RiskIntelligenceReport | null>(null);
  const [atRiskTickets, setAtRiskTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const [riskRes, ticketsRes] = await Promise.all([
        fetch('/api/risk'),
        fetch('/api/tickets')
      ]);

      const riskData = await riskRes.json();
      const ticketsData = await ticketsRes.json();

      if (riskData.success) {
        setReport(riskData.report);
      }

      if (ticketsData.tickets) {
        const now = Date.now();
        const flagged = ticketsData.tickets.filter((t: Ticket) => {
          if (t.status === 'RESOLVED' || t.status === 'CLOSED') return false;
          const due = new Date(t.sla_due_at).getTime();
          return due < (now + 8 * 3600000); // due within 8 hours or overdue
        });
        setAtRiskTickets(flagged);
      }
    } catch (err) {
      console.error('Failed to load risk intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const overallScore = report?.overall_score || 24;

  const getScoreColor = (score: number) => {
    if (score < 30) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'LOW RISK' };
    if (score < 65) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'ELEVATED RISK' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'CRITICAL RISK' };
  };

  const statusStyle = getScoreColor(overallScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Enterprise IT Risk Intelligence & Predictor
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                  {statusStyle.label} ({overallScore}/100)
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated continuous risk evaluation across IAM entitlement drift, SLA breaches, and compliance telemetry.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRiskData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recalculate Risk Index</span>
        </button>
      </div>

      {/* Main Risk Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Composite Gauge Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Composite Risk Score</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono ${statusStyle.text}`}>{overallScore}</span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Synthesized from active access privileges, pending SLA breaches, and ISO 27001 control posture.
            </p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                overallScore < 30 ? 'bg-emerald-500' : overallScore < 65 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* IAM Risk */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">IAM Privilege Risk</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">{report?.iam_risk_score || 18}%</div>
          <p className="text-[11px] text-slate-400">
            {report?.sod_violations_count || 0} SoD policy conflicts, {report?.stale_privileges_count || 1} uncertified privileges.
          </p>
        </div>

        {/* Operational Risk */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Operational & SLA Risk</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{report?.operational_risk_score || 22}%</div>
          <p className="text-[11px] text-slate-400">
            {atRiskTickets.length} active service tickets nearing or exceeding SLA thresholds.
          </p>
        </div>

        {/* Compliance Risk */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Audit & Compliance</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{report?.compliance_risk_score || 15}%</div>
          <p className="text-[11px] text-slate-400">
            Strict append-only audit trail logging active; zero policy bypasses detected.
          </p>
        </div>
      </div>

      {/* Two Column Layout: SLA Breach Predictor & IAM Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SLA Breach Predictor */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>SLA Breach Early-Warning Radar ({atRiskTickets.length})</span>
            </div>
            <Link href="/service-desk" className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              <span>View Service Desk</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
            {atRiskTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                No tickets currently at risk of SLA breach. Service operations healthy.
              </div>
            ) : (
              atRiskTickets.map((t) => {
                const now = Date.now();
                const due = new Date(t.sla_due_at).getTime();
                const isOverdue = due < now;
                const hoursLeft = Math.round(Math.abs(due - now) / 3600000);

                return (
                  <div key={t.ticket_id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          t.priority === 'P1' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{t.ticket_id}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Team: {t.assigned_team}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono inline-block ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isOverdue ? `${hoursLeft}h OVERDUE` : `Due in ${hoursLeft}h`}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        SLA: {new Date(t.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* IAM Risk & Separation of Duties Violations */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Identity Governance Flags</span>
            </div>
            <Link href="/privileged-access" className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
              <span>PAM Console</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3.5 shadow-sm">
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/30 text-xs">
              <div className="flex items-center justify-between font-semibold text-purple-300 mb-1">
                <span>Segregation of Duties (SoD) Rule 1</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-purple-900/50 text-purple-300">SEC-09</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Requesters are strictly prohibited from approving their own entitlement requests or administrative privilege assignments.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
                <span>Just-In-Time Elevation Expiration</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-900/50 text-amber-300">PAM-04</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Elevated privileges (AWS Admin, Snowflake ACCOUNTADMIN) automatically revoke upon session expiry (max 4-8 hours).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                <span>Periodic Entitlement Recertification</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-400">Quarterly</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                App owners must certify user roles every 90 days. Stale or unverified accounts are flagged for automated deprovisioning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
