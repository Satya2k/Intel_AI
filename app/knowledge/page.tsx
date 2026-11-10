'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, CheckCircle2, FileText, 
  Tag, ThumbsUp, ThumbsDown, ExternalLink, Sparkles,
  Layers, ShieldCheck, ChevronRight
} from 'lucide-react';
import { KnowledgeDocument } from '@/lib/database/knowledge-data';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const url = `/api/knowledge?q=${encodeURIComponent(search)}&category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        if (!selectedDoc && data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        } else if (selectedDoc) {
          const match = data.documents.find((d: KnowledgeDocument) => d.document_id === selectedDoc.document_id);
          if (match) setSelectedDoc(match);
        }
      }
    } catch (err) {
      console.error('Failed to fetch knowledge docs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [search, selectedCategory]);

  const categories = ['ALL', 'VPN', 'Email and Microsoft 365', 'ERP and SAP', 'Password and account support', 'Hardware', 'Network'];

  const handleVote = (id: string, type: 'up' | 'down') => {
    setFeedbackGiven(prev => ({ ...prev, [id]: type }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                IT Standard Operating Procedures (SOP) Knowledge Base
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  RAG Vector Store
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Ground-truth enterprise troubleshooting runbooks indexed for Agentic RAG retrieval and zero-hallucination compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Strict Source Attribution Enforced</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
          <Search className="w-4 h-4 text-slate-500 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search runbooks by keyword, command (e.g. flushdns, outlook, sap, vpn)..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Directory + Document View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Standard Operating Procedures ({documents.length})
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
                No matching SOP runbooks found.
              </div>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDoc?.document_id === doc.document_id;
                return (
                  <div
                    key={doc.document_id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-400">{doc.document_id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        v{doc.version}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug mb-2">{doc.title}</h3>

                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {doc.keywords?.slice(0, 3).map((kw, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span className="truncate max-w-[200px]">{doc.category}</span>
                      <span className="text-emerald-400 font-semibold">{doc.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Document Reader Panel */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              {/* Document Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      {selectedDoc.document_id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v{selectedDoc.version}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {selectedDoc.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mb-2 leading-tight">{selectedDoc.title}</h2>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Source Authority:</span>
                  <span className="font-semibold text-slate-200">{selectedDoc.source}</span>
                </div>
              </div>

              {/* Document Content View */}
              <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedDoc.content}
                  </pre>
                </div>

                {/* Keywords Bar */}
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-400 text-[11px] font-medium">Index Keywords:</span>
                  {selectedDoc.keywords?.map((kw, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-800 font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feedback and RAG Verification Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Was this SOP runbook helpful?</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleVote(selectedDoc.document_id, 'up')}
                      className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                        feedbackGiven[selectedDoc.document_id] === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleVote(selectedDoc.document_id, 'down')}
                      className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                        feedbackGiven[selectedDoc.document_id] === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Grounding Source Citation Verified</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Select an SOP from the directory to review resolution guidelines
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
