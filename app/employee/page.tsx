'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, ArrowRight, RefreshCw, KeyRound, 
  FileText, ExternalLink, UserCheck, HelpCircle
} from 'lucide-react';
import { usePersona } from '@/components/layout/PersonaContext';
import { AgentExecutionTracker } from '@/components/AgentExecutionTracker';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AGENT' | 'SYSTEM';
  text: string;
  timestamp: string;
  intent?: string;
  ticket?: any;
  accessRequest?: any;
  suggestedActions?: { label: string; action: string }[];
}

export default function EmployeePortalPage() {
  const { currentPersona } = usePersona();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  // Dashboard Data
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myEntitlements, setMyEntitlements] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting when persona changes
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        sender: 'AGENT',
        text: `Hello **${currentPersona.name}**! 👋

I am your **IntelliDesk AI Service Assistant**. I can help you with:
- 🛠️ Diagnosing technical issues (VPN, Wi-Fi, Outlook, SAP, BitLocker)
- 🎫 Creating IT support tickets and tracking status
- 🔐 Requesting enterprise application permissions and license entitlements

How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    loadUserData();
  }, [currentPersona.employee_id, refreshKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadUserData = async () => {
    try {
      // Load my tickets
      const tRes = await fetch(`/api/tickets?employee_id=${currentPersona.employee_id}`);
      const tData = await tRes.json();
      if (tData.tickets) setMyTickets(tData.tickets);

      // Load my access requests
      const rRes = await fetch(`/api/access-requests?employee_id=${currentPersona.employee_id}`);
      const rData = await rRes.json();
      if (rData.requests) setMyRequests(rData.requests);

      // Load my profile & active entitlements
      const eRes = await fetch(`/api/employees?employee_id=${currentPersona.employee_id}`);
      const eData = await eRes.json();
      if (eData.activeAccess) setMyEntitlements(eData.activeAccess);
    } catch (e) {
      console.error('Error loading employee dashboard data', e);
    }
  };

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!msgToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          employee_id: currentPersona.employee_id,
          conversation_id: conversationId || undefined,
        }),
      });

      const data = await res.json();
      if (data.conversation_id) setConversationId(data.conversation_id);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        text: data.responseText || data.error || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        ticket: data.ticket,
        accessRequest: data.accessRequest,
        suggestedActions: data.suggestedActions,
      };

      setMessages(prev => [...prev, agentMsg]);
      // Refresh dashboard tables if ticket or request was created
      if (data.ticket || data.accessRequest) {
        setRefreshKey(prev => prev + 1);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'SYSTEM',
          text: `⚠️ Network or agent error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'My Cisco AnyConnect VPN keeps dropping with error 412',
    'Outlook desktop calendar sync is stuck at connecting',
    'Request access to SAP S/4HANA Finance for journal entry posting',
    'Request root admin access to AWS Production cloud',
    'Create ticket: Dell laptop dock screen flickers black',
  ];

  return (
    <div className="space-y-6">
      {/* Employee Header Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg font-bold">
            {currentPersona.avatarInitials}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Welcome back, {currentPersona.name}
              <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full font-mono">
                {currentPersona.employee_id}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {currentPersona.designation} • Department of {currentPersona.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Records
          </button>
        </div>
      </div>

      {/* Multi-Agent Execution & Latency Telemetry HUD */}
      <AgentExecutionTracker defaultExpanded={true} />

      {/* Main Grid: Chat Assistant on Left, Records & Status on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Support Chat (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">IntelliDesk AI Supervisor</div>
                <div className="text-[10px] text-emerald-400 leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  RAG & Policy Engine Connected
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Model: gemini-1.5-flash
            </div>
          </div>

          {/* Quick Sample Prompts Carousel */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-slate-400 whitespace-nowrap pl-1 font-medium">Quick Prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-[10px] transition-colors"
              >
                {p.length > 38 ? p.substring(0, 38) + '...' : p}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'USER';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                    <span>{isUser ? currentPersona.name : 'IntelliDesk AI'}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 space-y-2.5 text-slate-100 ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800/90 border border-slate-700/80 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.text}
                    </div>

                    {/* Interactive Action Buttons */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5">
                        {m.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.action.startsWith('CREATE_TICKET_FOR:')) {
                                handleSendMessage(`Create ticket: ${act.action.replace('CREATE_TICKET_FOR:', '')}`);
                              } else {
                                handleSendMessage(act.label);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[11px] font-medium transition-colors"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 text-xs text-blue-400 font-medium bg-slate-800/50 border border-slate-700/50 rounded-xl w-fit animate-pulse">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Orchestrating agents and evaluating policies...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask an IT question, report an issue, or request software access..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Open Tickets & Access Requests (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: My Open Tickets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs text-white">My Active Tickets</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {myTickets.length} records
              </span>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active support tickets found for your account.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {myTickets.slice(0, 5).map((t) => (
                  <div
                    key={t.ticket_id}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-blue-400 font-bold">{t.ticket_id}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        t.priority === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        t.priority === 'P2' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="font-medium text-slate-200 truncate">{t.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Status: <strong className="text-slate-300">{t.status}</strong></span>
                      <span>Team: {t.assigned_team}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: My Access Requests */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs text-white">My Access Requests</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {myRequests.length} requests
              </span>
            </div>

            {myRequests.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No access requests currently on record.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {myRequests.map((r) => (
                  <div
                    key={r.request_id}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-indigo-400 font-bold">{r.request_id}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        r.request_status === 'PROVISIONED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        r.request_status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {r.request_status}
                      </span>
                    </div>
                    <div className="font-medium text-slate-200">{r.permission_id}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Stage {r.current_approval_stage} of {r.total_stages_required}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Active Role Entitlements */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-white">Active Entitlements</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {myEntitlements.length} assigned
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {myEntitlements.map((a, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {a.permission_id}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

