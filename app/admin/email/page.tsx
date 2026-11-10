'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, RefreshCw, CheckCircle2, Clock, 
  AlertCircle, Eye, ExternalLink, Terminal, Play, ShieldCheck
} from 'lucide-react';
import { NotificationOutboxItem } from '@/lib/database/types';

export default function EmailAdminPage() {
  const [items, setItems] = useState<NotificationOutboxItem[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    queued: number;
    sent: number;
    failed: number;
    logged_console: number;
    mode: string;
  }>({
    total: 0,
    queued: 0,
    sent: 0,
    failed: 0,
    logged_console: 0,
    mode: 'console',
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processing, setProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NotificationOutboxItem | null>(null);

  // Diagnostic test email
  const [testEmail, setTestEmail] = useState('ops-admin@northstar-tech.internal');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchOutbox = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' ? '/api/notifications/outbox' : `/api/notifications/outbox?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load outbox', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbox();
  }, [statusFilter]);

  const handleProcessOutbox = async () => {
    try {
      setProcessing(true);
      const res = await fetch('/api/notifications/outbox', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchOutbox();
      }
    } catch (err) {
      console.error('Failed to process outbox', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingTest(true);
      setTestResult(null);
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testEmail, templateId: 'ticket_confirmation' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`Success (${data.mode} mode): Diagnostic email logged into outbox.`);
        await fetchOutbox();
      } else {
        setTestResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setTestResult(`Failed: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Automated Email Outbox & Delivery Console
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Transactional Outbox Pattern
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit, track, and dispatch automated notification payloads with idempotency and retry safeguards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOutbox}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleProcessOutbox}
            disabled={processing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : 'fill-current'}`} />
            <span>{processing ? 'Processing...' : 'Process Outbox Batch'}</span>
          </button>
        </div>
      </div>

      {/* Mode Banner & Safety Sandbox Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 font-medium">Active Dispatch Mode:</span>
          <span className="px-2.5 py-1 rounded-md font-mono font-bold text-xs bg-blue-950/80 text-blue-400 border border-blue-800/80">
            EMAIL_MODE = {stats.mode.toUpperCase()}
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400">
            {stats.mode === 'console'
              ? 'Safety Sandbox: Notification records are captured in database and console without external SMTP requests.'
              : 'Live Resend API transport enabled.'}
          </span>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Idempotent Delivery Enforced</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Outbox Records</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{stats.total}</span>
            <span className="text-[10px] text-slate-500 font-mono">Payloads</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Queued
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{stats.queued}</span>
            <span className="text-[10px] text-slate-500">pending</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sent (Live/Sim)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{stats.sent}</span>
            <span className="text-[10px] text-slate-500">delivered</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> Logged Console
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">{stats.logged_console}</span>
            <span className="text-[10px] text-slate-500">Sandbox</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Failed Attempts
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{stats.failed}</span>
            <span className="text-[10px] text-slate-500">errors</span>
          </div>
        </div>
      </div>

      {/* Diagnostic Probe Trigger Form */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-300 mb-1">Send Diagnostic Outbox Probe:</div>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@northstar-tech.internal"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="self-end sm:self-auto sm:mt-5">
            <button
              type="submit"
              disabled={sendingTest}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingTest ? 'Sending...' : 'Trigger Probe'}</span>
            </button>
          </div>
        </form>

        {testResult && (
          <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
            {testResult}
          </div>
        )}
      </div>

      {/* Outbox Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Transactional Notification Ledger ({items.length})
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['ALL', 'QUEUED', 'LOGGED_CONSOLE', 'SENT', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Recipient</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Template ID</th>
                <th className="py-3 px-4 font-semibold">Delivery Status</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <div>{item.recipient_name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.recipient_email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs truncate">
                    {item.subject}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {item.template_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                      item.delivery_status === 'SENT'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : item.delivery_status === 'LOGGED_CONSOLE'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : item.delivery_status === 'QUEUED'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {item.delivery_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Inspect Variables & Payload"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white font-mono">Outbox Item: {selectedItem.id}</span>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">Subject</span>
                <span className="text-slate-200 font-medium text-sm">{selectedItem.subject}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Recipient</span>
                  <span className="text-slate-300">{selectedItem.recipient_email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Idempotency Key</span>
                  <span className="text-slate-300 font-mono text-[10px] truncate block">{selectedItem.idempotency_key}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">Template Variables Payload</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedItem.template_variables, null, 2)}
                </pre>
              </div>

              {selectedItem.last_error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs font-mono">
                  Error: {selectedItem.last_error}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
