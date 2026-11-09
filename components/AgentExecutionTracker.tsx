'use client';

import React, { useState } from 'react';
import { 
  Bot, Clock, CheckCircle2, ChevronRight, ChevronDown, 
  Terminal, ShieldCheck, Activity, Layers, Sparkles, 
  Maximize2, Minimize2, Play, RotateCcw, FileText, Wrench
} from 'lucide-react';
import { useAgentTelemetry } from '@/hooks/useAgentTelemetry';
import { AgentTelemetryStep, AgentName } from '@/types/telemetry';

interface AgentExecutionTrackerProps {
  className?: string;
  defaultExpanded?: boolean;
  docked?: boolean;
}

const AGENT_COLORS: Record<AgentName, { bg: string; text: string; border: string }> = {
  'Supervisor': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Service Desk Agent': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Knowledge/RAG Agent': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'IAM Agent': { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  'Approval Agent': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Provisioning Agent': { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'Audit Agent': { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export function AgentExecutionTracker({
  className = '',
  defaultExpanded = true,
  docked = false,
}: AgentExecutionTrackerProps) {
  const {
    session,
    activeStep,
    selectedStep,
    selectedStepId,
    setSelectedStepId,
    isRunning,
    elapsedMs,
    simulateLiveRun,
    resetTelemetry,
  } = useAgentTelemetry();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'tools' | 'sop'>('reasoning');

  const hasSteps = session.steps.length > 0;

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-3.5 h-3.5" />
            </div>
            {isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono tracking-tight flex items-center gap-1.5">
                Agent Execution & Latency Telemetry HUD
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-950/70 border border-blue-800/60 text-blue-400">
                Multi-Agent Orchestrator
              </span>
            </div>
          </div>
        </div>

        {/* Live Timer & Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Live Timer Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Clock className={`w-3 h-3 ${isRunning ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
            <span className="font-semibold">
              {isRunning
                ? `${elapsedMs}ms`
                : session.totalDurationMs > 0
                ? `${session.totalDurationMs}ms (total)`
                : '0ms'}
            </span>
          </div>

          {/* Quick Simulation Trigger Pill */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => simulateLiveRun('vpn_issue')}
              disabled={isRunning}
              className="px-2 py-1 rounded text-[10px] font-mono font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors disabled:opacity-50"
            >
              Demo VPN
            </button>
            <button
              onClick={() => simulateLiveRun('sap_access')}
              disabled={isRunning}
              className="px-2 py-1 rounded text-[10px] font-mono font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors disabled:opacity-50"
            >
              Demo IAM
            </button>
            <button
              onClick={() => simulateLiveRun('leaver_exit')}
              disabled={isRunning}
              className="px-2 py-1 rounded text-[10px] font-mono font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors disabled:opacity-50"
            >
              Demo JML
            </button>
          </div>

          {hasSteps && (
            <button
              onClick={resetTelemetry}
              title="Reset HUD"
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Query Banner */}
          {session.userQuery && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-300">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Input Query:</span>
              <span className="text-blue-300 truncate font-sans">{session.userQuery}</span>
            </div>
          )}

          {/* Empty / Idle State */}
          {!hasSteps && (
            <div className="py-6 text-center text-slate-500 space-y-2">
              <Activity className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs">Telemetry pipeline is idle. Waiting for incoming agent interactions.</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => simulateLiveRun('vpn_issue')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/50 transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Launch Live Agent Simulation</span>
                </button>
              </div>
            </div>
          )}

          {/* Stepper Pipeline: Visual Agent Node Handoff */}
          {hasSteps && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {session.steps.map((step, idx) => {
                  const isSelected = selectedStep?.stepId === step.stepId;
                  const isRunningThis = step.status === 'running';
                  const isCompleted = step.status === 'completed';
                  const colors = AGENT_COLORS[step.agentName] || AGENT_COLORS.Supervisor;

                  return (
                    <React.Fragment key={step.stepId}>
                      {/* Agent Step Node Card */}
                      <button
                        onClick={() => setSelectedStepId(step.stepId)}
                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all shrink-0 border ${
                          isSelected
                            ? 'bg-slate-900 border-blue-500/60 ring-1 ring-blue-500/30 shadow-md'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Node status indicator */}
                        <div className="relative">
                          {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isRunningThis && (
                            <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                          )}
                          {step.status === 'pending' && (
                            <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800 shrink-0" />
                          )}
                        </div>

                        {/* Node Meta */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold ${colors.text}`}>
                              {step.agentName}
                            </span>
                            {step.durationMs > 0 && (
                              <span className="text-[9px] font-mono text-slate-500">
                                {step.durationMs}ms
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 max-w-[130px] truncate">
                            {step.status === 'running' ? 'Active Execution...' : step.status}
                          </div>
                        </div>
                      </button>

                      {/* Connecting Arrow between Nodes */}
                      {idx < session.steps.length - 1 && (
                        <div className="flex items-center text-slate-700 shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Expandable Reasoning & Tool Trace Drawer for Selected Node */}
              {selectedStep && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 animate-in fade-in-50 duration-150">
                  {/* Selected Node Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono font-bold text-white">
                        {selectedStep.agentName} Internal Trace
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {selectedStep.durationMs > 0 ? `${selectedStep.durationMs}ms` : 'In Progress'}
                      </span>
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveTab('reasoning')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          activeTab === 'reasoning'
                            ? 'bg-blue-600/20 text-blue-400 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Chain of Thought
                      </button>
                      {selectedStep.toolCall && (
                        <button
                          onClick={() => setActiveTab('tools')}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            activeTab === 'tools'
                              ? 'bg-blue-600/20 text-blue-400 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Tool Call
                        </button>
                      )}
                      {selectedStep.sopRetrieved && (
                        <button
                          onClick={() => setActiveTab('sop')}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            activeTab === 'sop'
                              ? 'bg-emerald-600/20 text-emerald-400 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          SOP Grounding
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tab 1: Internal Reasoning Summary */}
                  {activeTab === 'reasoning' && (
                    <div className="text-xs leading-relaxed text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                      <div className="text-slate-500 uppercase text-[9px] font-bold mb-1">
                        Reasoning & Decision Trace:
                      </div>
                      <p>{selectedStep.reasoningSummary}</p>
                    </div>
                  )}

                  {/* Tab 2: Tool Call Parameters & Output */}
                  {activeTab === 'tools' && selectedStep.toolCall && (
                    <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Wrench className="w-3 h-3" />
                          Function: {selectedStep.toolCall.name}()
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Arguments:</span>
                        <pre className="text-slate-300 text-[10px] overflow-x-auto p-1.5 bg-slate-900 rounded mt-0.5">
                          {JSON.stringify(selectedStep.toolCall.args, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Execution Result:</span>
                        <div className="text-emerald-400 text-[11px] mt-0.5">
                          {selectedStep.toolCall.result}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: SOP Vector Grounding */}
                  {activeTab === 'sop' && selectedStep.sopRetrieved && (
                    <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-emerald-400 pb-1 border-b border-slate-800">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Doc: {selectedStep.sopRetrieved.documentId} ({selectedStep.sopRetrieved.title})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Match: {Math.round(selectedStep.sopRetrieved.similarityScore * 100)}%
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        <span className="text-slate-500 text-[10px]">Verified Citation: </span>
                        {selectedStep.sopRetrieved.citation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AgentExecutionTracker;

