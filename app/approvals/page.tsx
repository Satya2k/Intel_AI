'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, CheckCircle2, XCircle, AlertTriangle, 
  Clock, ShieldAlert, User, FileText, RefreshCw, Send
} from 'lucide-react';
import { usePersona } from '@/components/layout/PersonaContext';

export default function ApprovalsPortalPage() {
  const { currentPersona } = usePersona();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  useEffect(() => {
    loadApprovals();
  }, [currentPersona.employee_id]);

  const loadApprovals = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // Query approvals targeted to this manager or admin identity
      const res = await fetch(`/api/approvals?approver_id=${currentPersona.employee_id}`);
      const data = await res.json();
      if (data.approvals) setApprovals(data.approvals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (approvalId: string, decision: 'APPROVED' | 'REJECTED') => {
    const comment = commentText[approvalId] || '';
    if (decision === 'REJECTED' && !comment.trim()) {
      alert('Please provide a mandatory rejection comment or business justification.');
      return;
    }

    setActionLoading(approvalId);
    setFeedback(null);

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: approvalId,
          approver_id: currentPersona.employee_id,
          decision,
          comments: comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'ERROR', message: data.error || 'Approval action failed.' });
      } else {
        setFeedback({ type: 'SUCCESS', message: data.message || `Request ${decision} successfully.` });
        await loadApprovals();
      }
    } catch (e: any) {
      setFeedback({ type: 'ERROR', message: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingApprovals = approvals.filter(a => a.approval_status === 'PENDING');
  const historicalApprovals = approvals.filter(a => a.approval_status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Manager & Owner Approval Portal
          </h1>
          <p className="text-xs text-slate-400">
            Reviewing identity access requests as: <strong className="text-white">{currentPersona.name} ({currentPersona.designation})</strong>
          </p>
        </div>

        <button
          onClick={loadApprovals}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
          feedback.type === 'SUCCESS'
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
            : 'bg-red-950/40 text-red-300 border-red-800/60'
        }`}>
          {feedback.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
            <span>Pending My Approval</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px]">
              {pendingApprovals.length}
            </span>
          </h2>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 text-xs">
            🎉 All pending access requests for your department or ownership domain have been reviewed!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingApprovals.map((appr) => {
              const req = appr.request || {};
              const emp = appr.employee || {};
              const isSelf = currentPersona.employee_id.toLowerCase() === req.employee_id?.toLowerCase();

              return (
                <div
                  key={appr.approval_id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                        {emp.full_name ? emp.full_name.substring(0, 2).toUpperCase() : 'EMP'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {emp.full_name || req.employee_id}
                          <span className="text-[10px] text-slate-400 font-mono">({req.employee_id})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {emp.designation} • Department: {emp.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        Stage {appr.stage_number} ({appr.approval_type})
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                        req.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        req.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {req.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  {/* Request Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Application</div>
                      <div className="font-semibold text-white mt-0.5">{req.application_id}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Requested Entitlement</div>
                      <div className="font-mono text-blue-400 mt-0.5">{req.permission_id}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Request ID</div>
                      <div className="font-mono text-slate-300 mt-0.5">{req.request_id}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">Business Justification</div>
                    <div className="p-3 rounded-lg bg-slate-950 text-slate-200 text-xs border border-slate-800/80 italic">
                      "{req.business_justification}"
                    </div>
                  </div>

                  {/* Separation of duties warning */}
                  {isSelf && (
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/50 text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span><strong>Separation of Duties Warning</strong>: You cannot approve your own request. Please switch personas or delegate to another authorized manager.</span>
                    </div>
                  )}

                  {/* Actions & Comment Field */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Add review comment or reason for approval/rejection..."
                      value={commentText[appr.approval_id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [appr.approval_id]: e.target.value })}
                      disabled={actionLoading === appr.approval_id}
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleDecision(appr.approval_id, 'REJECTED')}
                        disabled={actionLoading === appr.approval_id}
                        className="px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleDecision(appr.approval_id, 'APPROVED')}
                        disabled={actionLoading === appr.approval_id || isSelf}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Provision
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Approvals */}
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Completed Approval History ({historicalApprovals.length})
        </h2>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Entitlement</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Comments</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {historicalApprovals.map((appr) => (
                  <tr key={appr.approval_id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">
                      {appr.request_id}
                    </td>
                    <td className="px-4 py-3">
                      {appr.employee?.full_name || appr.request?.employee_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-400">
                      {appr.request?.permission_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        appr.approval_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {appr.approval_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic">
                      {appr.comments || 'No comment recorded'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {appr.approved_at ? new Date(appr.approved_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

