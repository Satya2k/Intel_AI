'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Play, RotateCcw, 
  ChevronDown, ChevronRight, Search, Activity, Clock, 
  FileCode, Sparkles, Filter, ExternalLink, Terminal, AlertTriangle
} from 'lucide-react';
import { TestCategory, TestCaseResult, TestSuiteReport } from '@/lib/test-runner';

const CATEGORIES: Array<'All' | TestCategory> = [
  'All',
  'RBAC Guardrails',
  'Approval Gates',
  'RAG & Hallucination',
  'JML Lifecycle',
];

export default function TestHarnessPage() {
  const [tests, setTests] = useState<TestCaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'All' | TestCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [reportSummary, setReportSummary] = useState<{
    totalTests: number;
    passed: number;
    failed: number;
    avgLatencyMs: number;
    complianceScore: number;
    executedAt: string | null;
  }>({
    totalTests: 20,
    passed: 0,
    failed: 0,
    avgLatencyMs: 0,
    complianceScore: 100,
    executedAt: null,
  });

  // Load initial test registry on mount
  useEffect(() => {
    fetchTestRegistry();
  }, []);

  const fetchTestRegistry = async () => {
    try {
      const res = await fetch('/api/tests/run');
      const data = await res.json();
      if (data.tests) {
        const initialResults: TestCaseResult[] = data.tests.map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          targetPolicy: t.targetPolicy,
          status: 'IDLE' as const,
          latencyMs: 0,
          assertionMessage: t.description || 'Awaiting execution',
          citationRef: t.citationRef,
          stepLogs: [],
        }));
        setTests(initialResults);
      }
    } catch (e) {
      console.error('Failed to load test definitions', e);
    }
  };

  const handleRunAll = async () => {
    setLoading(true);
    setProgress(10);

    try {
      // Mark all as running
      setTests((prev) => prev.map((t) => ({ ...t, status: 'RUNNING' })));
      setProgress(40);

      const res = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      setProgress(85);
      const data: TestSuiteReport = await res.json();

      if (data.results) {
        setTests(data.results);
        setReportSummary({
          totalTests: data.totalTests,
          passed: data.passed,
          failed: data.failed,
          avgLatencyMs: data.avgLatencyMs,
          complianceScore: data.complianceScore,
          executedAt: data.executedAt,
        });
      }
    } catch (e) {
      console.error('Test execution failed', e);
    } finally {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400);
    }
  };

  const handleRunSingle = async (testId: string) => {
    setRunningTestId(testId);
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'RUNNING' } : t))
    );

    try {
      const res = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testIds: [testId] }),
      });

      const data: TestSuiteReport = await res.json();
      if (data.results && data.results.length > 0) {
        const singleResult = data.results[0];
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? singleResult : t))
        );
        // Automatically expand the row so user sees logs
        setExpandedRows((prev) => ({ ...prev, [testId]: true }));
      }
    } catch (e) {
      console.error(`Failed to run test ${testId}`, e);
    } finally {
      setRunningTestId(null);
    }
  };

  const handleResetResults = () => {
    fetchTestRegistry();
    setReportSummary({
      totalTests: 20,
      passed: 0,
      failed: 0,
      avgLatencyMs: 0,
      complianceScore: 100,
      executedAt: null,
    });
    setExpandedRows({});
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTests = tests.filter((t) => {
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.targetPolicy.toLowerCase().includes(q) ||
      t.assertionMessage.toLowerCase().includes(q) ||
      t.citationRef.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Automated Test Harness & Guardrail Console
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/60">
                  Academic Viva Suite
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Deterministic evaluation of RBAC boundaries, Segregation of Duties, RAG grounding, and JML lifecycles.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetResults}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Results</span>
          </button>
          <button
            onClick={handleRunAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'fill-current'}`} />
            <span>{loading ? 'Evaluating Guardrails...' : 'Run All 20 Tests'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {loading && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Tests</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{reportSummary.totalTests}</span>
            <span className="text-[10px] text-slate-500 font-mono">T1 – T20</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{reportSummary.passed}</span>
            <span className="text-[10px] text-slate-500">
              {reportSummary.totalTests ? `${Math.round((reportSummary.passed / reportSummary.totalTests) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{reportSummary.failed}</span>
            <span className="text-[10px] text-slate-500">errors</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Avg Latency
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">{reportSummary.avgLatencyMs}</span>
            <span className="text-[10px] text-slate-500 font-mono">ms / test</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Compliance Score
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-400">
              {reportSummary.passed > 0 ? `${reportSummary.complianceScore}%` : '100%'}
            </span>
            <span className="text-[10px] text-emerald-500 font-medium">SOC 2 / ISO 27001</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-slate-900/60 border border-slate-800 rounded-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests, policies, citations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Tests Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4">Guardrail Name & Description</th>
                <th className="py-3 px-4 hidden md:table-cell">Target Policy / Framework</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-24 text-right">Latency</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTests.map((test) => {
                const isExpanded = !!expandedRows[test.id];
                const isRunningThis = runningTestId === test.id || test.status === 'RUNNING';

                return (
                  <React.Fragment key={test.id}>
                    <tr
                      onClick={() => toggleRow(test.id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Expand Chevron */}
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-300 mx-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 mx-auto" />
                        )}
                      </td>

                      {/* Test ID Badge */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-400">
                          {test.id}
                        </span>
                      </td>

                      {/* Test Name & Assertion preview */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {test.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {test.assertionMessage}
                        </div>
                      </td>

                      {/* Target Policy */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="text-slate-300 font-mono text-[11px]">{test.targetPolicy}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <FileCode className="w-3 h-3" />
                          <span>{test.citationRef}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {test.status === 'PASSED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 border border-emerald-800/70 text-emerald-400 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> PASSED
                          </span>
                        )}
                        {test.status === 'FAILED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/60 border border-rose-800/70 text-rose-400 shadow-sm">
                            <XCircle className="w-3 h-3" /> FAILED
                          </span>
                        )}
                        {test.status === 'RUNNING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-800/70 text-amber-400 animate-pulse">
                            <Activity className="w-3 h-3 animate-spin" /> RUNNING
                          </span>
                        )}
                        {test.status === 'IDLE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800/60 border border-slate-700/60 text-slate-400">
                            IDLE
                          </span>
                        )}
                      </td>

                      {/* Latency */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {test.latencyMs > 0 ? `${test.latencyMs}ms` : '—'}
                      </td>

                      {/* Single Run Action */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleRunSingle(test.id)}
                          disabled={loading || isRunningThis}
                          title={`Execute ${test.id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors disabled:opacity-50"
                        >
                          <Play className={`w-3.5 h-3.5 ${isRunningThis ? 'animate-spin' : ''}`} />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Drawer / Inspection Row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70 border-b border-slate-800">
                        <td colSpan={7} className="p-4 pl-12">
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                <span className="font-semibold text-white text-xs font-mono">
                                  Guardrail Verification Trace: {test.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                <span>Citation:</span>
                                <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {test.citationRef}
                                </code>
                              </div>
                            </div>

                            {/* Assertion result narrative */}
                            <div className="text-xs">
                              <span className="text-slate-400 font-medium">Outcome Assertion: </span>
                              <span className="text-slate-200">{test.assertionMessage}</span>
                            </div>

                            {/* Step logs */}
                            {test.stepLogs && test.stepLogs.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                                  Step Execution Log:
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400/90 space-y-1">
                                  {test.stepLogs.map((log, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <span className="text-slate-600 select-none">[{idx + 1}]</span>
                                      <span>{log}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No guardrail tests match the specified category or query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

