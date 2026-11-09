'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, ShieldCheck, 
  Users, RefreshCw, AlertTriangle, Layers, Percent, Download,
  Upload, FileText, Check, X, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface PreviewTicket {
  ticket_id?: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  employee_id?: string;
  assigned_team?: string;
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Download dropdown state
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewTicket[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const d = await res.json();
      if (d.analytics) setData(d.analytics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: 'tickets' | 'metrics' | 'sample') => {
    setShowDownloadMenu(false);
    window.location.href = `/api/analytics/csv?type=${type}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please select a valid CSV file (.csv).');
      return;
    }
    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          setUploadError('The CSV file appears to be empty or has no header.');
          return;
        }

        const parseLine = (line: string): string[] => {
          const row: string[] = [];
          let inQuote = false;
          let entry = '';
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
              if (inQuote && line[i + 1] === '"') {
                entry += '"';
                i++;
              } else {
                inQuote = !inQuote;
              }
            } else if (c === ',' && !inQuote) {
              row.push(entry.trim());
              entry = '';
            } else {
              entry += c;
            }
          }
          row.push(entry.trim());
          return row;
        };

        const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').toLowerCase().trim());
        const preview: PreviewTicket[] = [];

        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const vals = parseLine(lines[i]);
          if (!vals || vals.length === 0) continue;
          const rec: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rec[h] = vals[idx] ? vals[idx].replace(/^["']|["']$/g, '').trim() : '';
          });
          preview.push({
            ticket_id: rec.ticket_id || rec.id || `TICK-PREVIEW-${i}`,
            title: rec.title || rec.subject || rec.summary || 'Support Ticket',
            category: rec.category || 'Software',
            priority: rec.priority || 'P3',
            status: rec.status || 'OPEN',
            employee_id: rec.employee_id || 'EMP-001',
            assigned_team: rec.assigned_team || 'Service Desk Tier-1',
          });
        }

        setPreviewRows(preview);
      } catch (err: any) {
        setUploadError(`Failed to parse CSV preview: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setUploadError('Please select a CSV file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/analytics/csv', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to upload CSV dataset.');
      }

      setUploadSuccess(json.message || `Successfully imported ${json.importedCount} ticket(s)!`);
      if (json.analytics) {
        setData(json.analytics);
      } else {
        await fetchAnalytics();
      }

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setPreviewRows([]);
        setUploadSuccess(null);
      }, 2000);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const PRIORITY_COLORS: Record<string, string> = {
    P1: '#ef4444', // Red
    P2: '#f59e0b', // Amber
    P3: '#3b82f6', // Blue
    P4: '#64748b', // Slate
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            IT Operations & IAM Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Live telemetry computed strictly from persistent database records with CSV Import/Export capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Recompute Button */}
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Download CSV Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 p-1.5 space-y-1">
                <button
                  onClick={() => handleDownload('tickets')}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  Incident Tickets CSV
                </button>
                <button
                  onClick={() => handleDownload('metrics')}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-2"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  Analytics Summary CSV
                </button>
                <button
                  onClick={() => handleDownload('sample')}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Sample Upload Template
                </button>
              </div>
            )}
          </div>

          {/* Upload CSV Button */}
          <button
            onClick={() => {
              setUploadError(null);
              setUploadSuccess(null);
              setUploadFile(null);
              setPreviewRows([]);
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-medium transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* Dataset Resource Pills Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-300">Synthetic Datasets Available:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/analytics/csv?type=tickets"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3 text-blue-400" />
            it_tickets_dataset.csv
          </a>
          <a
            href="/api/analytics/csv?type=sample"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            sample_tickets_upload_template.csv
          </a>
          <a
            href="/api/analytics/csv?type=metrics"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3 text-purple-400" />
            analytics_summary.csv
          </a>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-xs text-blue-400 animate-pulse">
          Computing real-time analytics from database records...
        </div>
      )}

      {data && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Total Tickets</div>
              <div className="text-2xl font-bold text-white mt-1">{data.totalTickets}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{data.openTickets} currently open</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">SLA Compliance</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{data.slaComplianceRate}%</div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">SLA due date verified</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Avg Resolution</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{data.avgResolutionTimeHours}h</div>
              <div className="text-[10px] text-slate-500 mt-0.5">From created to resolved</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Auto-Resolution</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{data.automatedResolutionRate}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">RAG SOP assistance</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Provisioning Rate</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{data.provisioningSuccessRate}%</div>
              <div className="text-[10px] text-cyan-400/80 mt-0.5">Idempotent execution</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">JML Completion</div>
              <div className="text-2xl font-bold text-purple-400 mt-1">{data.jmlCompletionRate}%</div>
              <div className="text-[10px] text-purple-400/80 mt-0.5">{data.totalLifecycleEvents} lifecycle events</div>
            </div>
          </div>

          {/* Charts Row 1: Tickets by Category & Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tickets by Category (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-xs text-white">Tickets by Category</h3>
                <span className="text-[10px] text-slate-400 font-mono">Real-Time Aggregates</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ticketsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ticket Priority Distribution (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-xs text-white">Priority Distribution (P1 - P4)</h3>
                <span className="text-[10px] text-slate-400 font-mono">ITIL Matrix</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ticketsByPriority}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {data.ticketsByPriority.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#3b82f6'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Department Incident Volume & Access Requests Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tickets by Department (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-xs text-white">Tickets by Department</h3>
                <span className="text-[10px] text-slate-400 font-mono">5 Business Units</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ticketsByDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Access Requests by Status (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-xs text-white">Access Requests by Status</h3>
                <span className="text-[10px] text-slate-400 font-mono">IAM Governance</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.requestsByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSV Upload & Import Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Import Tickets from CSV Dataset</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/50 rounded-xl p-6 text-center cursor-pointer transition space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-xs font-medium text-white">
                {uploadFile ? uploadFile.name : 'Click to select or drag & drop CSV dataset file'}
              </div>
              <p className="text-[11px] text-slate-400">
                Supports standard comma-separated `.csv` with headers (ticket_id, title, category, priority, status).
              </p>
            </div>

            {/* Sample template link */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400">Need a valid formatted dataset?</span>
              <a
                href="/api/analytics/csv?type=sample"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <Download className="w-3 h-3" />
                Download Sample CSV Template
              </a>
            </div>

            {/* Error & Success Messages */}
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {previewRows.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-white">Dataset Preview (First {previewRows.length} rows):</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Format Validated</span>
                </div>
                <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-44">
                  <table className="w-full text-left text-[11px] text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 font-medium">Ticket ID</th>
                        <th className="px-2 py-1.5 font-medium">Title</th>
                        <th className="px-2 py-1.5 font-medium">Category</th>
                        <th className="px-2 py-1.5 font-medium">Priority</th>
                        <th className="px-2 py-1.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="px-2 py-1 font-mono text-slate-400">{row.ticket_id}</td>
                          <td className="px-2 py-1 truncate max-w-[180px]">{row.title}</td>
                          <td className="px-2 py-1 text-blue-400">{row.category}</td>
                          <td className="px-2 py-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              row.priority === 'P1' ? 'bg-red-500/20 text-red-400' :
                              row.priority === 'P2' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="px-2 py-1 text-slate-400">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!uploadFile || isUploading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Confirm & Ingest CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
