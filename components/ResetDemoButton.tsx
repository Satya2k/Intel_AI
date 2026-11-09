'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Loader2, AlertTriangle, CheckCircle2, X, Database } from 'lucide-react';

interface ResetDemoButtonProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'full';
}

export function ResetDemoButton({ className = '', variant = 'pill' }: ResetDemoButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleReset = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to re-seed demo data');
      }

      setStatusMessage({
        type: 'success',
        text: 'Clean baseline state restored! All operational tables re-seeded.',
      });

      // Allow evaluator to see success state before closing & refreshing
      setTimeout(() => {
        setIsLoading(false);
        setIsOpen(false);
        setStatusMessage(null);
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const error = err as Error;
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: error.message || 'An unexpected error occurred while resetting.',
      });
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === 'pill' && (
        <button
          onClick={() => {
            setStatusMessage(null);
            setIsOpen(true);
          }}
          type="button"
          aria-label="Reset Demo State"
          className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border
            bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-amber-200 border-amber-800/40 hover:border-amber-700/60 shadow-sm ${className}`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400 group-hover:-rotate-90 transition-transform duration-200" />
          <span className="hidden sm:inline font-mono text-[11px] font-semibold tracking-wide">Reset Demo</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={() => {
            setStatusMessage(null);
            setIsOpen(true);
          }}
          type="button"
          title="Reset Demo State"
          className={`p-1.5 rounded-lg text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 transition-colors ${className}`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      {/* Confirmation Modal */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 text-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="reset-modal-title" className="text-base font-semibold text-white tracking-tight">
                    Reset Demo State
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Northstar Technologies Operational Engine</p>
                </div>
              </div>
              <button
                onClick={() => !isLoading && setIsOpen(false)}
                disabled={isLoading}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200/90 flex gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This operation performs an <strong>atomic database reset</strong> within a single transaction.
                </span>
              </div>

              <p>The following operational records will be cleared and restored to clean seed data:</p>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-400 text-[11px]">
                <li>Active and resolved IT tickets reverted to initial queue</li>
                <li>Simulated access requests and approvals reset to pending state</li>
                <li>Audit trail appended with a fresh <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">DEMO_DATA_RESET</code> record</li>
                <li>Baseline entitlements re-seeded for Alice Chen, Vikram Patel & Sarah Jenkins</li>
              </ul>

              {/* Status alerts */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-950/30 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Re-seeding State...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResetDemoButton;

