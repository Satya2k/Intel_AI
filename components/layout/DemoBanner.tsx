'use client';

import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white tracking-wide uppercase text-[10px] bg-blue-600/30 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
          Academic Demo Mode
        </span>
        <span className="hidden md:inline text-slate-400">
          Synthetic enterprise organization: <strong className="text-slate-200">Northstar Technologies</strong>.
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Simulated Provisioning Active
        </span>
        <span className="hidden sm:inline">Zero live external identity mutations</span>
      </div>
    </div>
  );
}

