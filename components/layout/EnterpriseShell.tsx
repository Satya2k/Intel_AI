'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, LifeBuoy, ShieldCheck, CheckSquare, BarChart3, 
  History, Users, ChevronDown, Layers, Terminal, AlertTriangle,
  FolderGit2, ShieldAlert, KeyRound, BookOpen, Cpu, Mail,
  Menu, X, ChevronRight, Home, Search
} from 'lucide-react';
import { usePersona, DEMO_PERSONAS } from './PersonaContext';
import { ResetDemoButton } from '../ResetDemoButton';
import { NotificationCenter } from './NotificationCenter';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { href: '/', label: 'Command Center', icon: Home },
      { href: '/employee', label: 'Employee Portal', icon: Bot, badge: 'AI', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      { href: '/service-desk', label: 'IT Service Desk', icon: LifeBuoy },
      { href: '/incidents', label: 'Major Incidents', icon: AlertTriangle, badge: 'SEV-1', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
      { href: '/problems', label: 'Problem Management', icon: FolderGit2 },
    ]
  },
  {
    title: 'Governance & IAM',
    items: [
      { href: '/iam', label: 'IAM Console', icon: ShieldCheck },
      { href: '/approvals', label: 'Approvals Portal', icon: CheckSquare, badge: 'HITL', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      { href: '/privileged-access', label: 'Privileged Access (PAM)', icon: KeyRound, badge: 'JIT', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      { href: '/lifecycle', label: 'Lifecycle (JML)', icon: Users },
    ]
  },
  {
    title: 'Intelligence & Insights',
    items: [
      { href: '/risk', label: 'Risk Intelligence', icon: ShieldAlert, badge: '0-100', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
      { href: '/analytics', label: 'Operational Analytics', icon: BarChart3, badge: 'BI', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
      { href: '/knowledge', label: 'Knowledge Base (SOPs)', icon: BookOpen },
      { href: '/ai-monitoring', label: 'AI Agent Telemetry', icon: Cpu, badge: 'HUD', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    ]
  },
  {
    title: 'Platform & Controls',
    items: [
      { href: '/audit', label: 'Audit Trail', icon: History },
      { href: '/tests', label: 'Guardrail Tests', icon: Terminal, badge: '20 Tests', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      { href: '/admin/email', label: 'Email Outbox & Delivery', icon: Mail },
    ]
  }
];

export function EnterpriseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentPersona, setPersona } = usePersona();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === '/') return [{ label: 'Command Center', href: '/' }];
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', href: '/' }];
    let accum = '';
    for (const seg of segments) {
      accum += `/${seg}`;
      const matched = NAV_SECTIONS.flatMap(s => s.items).find(i => i.href === accum);
      crumbs.push({
        label: matched ? matched.label : seg.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        href: accum
      });
    }
    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  const allNavItems = NAV_SECTIONS.flatMap(s => s.items);
  const searchResults = navSearch.trim()
    ? allNavItems.filter(i => i.label.toLowerCase().includes(navSearch.toLowerCase()) || i.href.includes(navSearch.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Enterprise Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2 group mr-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white tracking-tight">
                IntelliDesk
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                2.0
              </span>
            </div>
          </Link>

          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 ml-4 pl-4 border-l border-slate-800 font-mono">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                {idx === crumbs.length - 1 ? (
                  <span className="text-slate-200 font-medium truncate max-w-[180px]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-blue-400 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Global Quick Search, Notifications, Reset, Persona */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">Command Jump...</span>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">⌘K</kbd>
          </button>

          {/* Outbox / Email Quick Link */}
          <Link
            href="/admin/email"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title="Notification Outbox & Delivery Monitor"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">Outbox</span>
          </Link>

          {/* In-App Notification Center */}
          <NotificationCenter />

          {/* Atomic Demo Data Re-Seed Engine */}
          <ResetDemoButton />

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all"
            >
              <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold">
                {currentPersona.avatarInitials}
              </div>
              <div className="hidden md:block text-left text-xs leading-none">
                <div className="font-semibold text-slate-200 text-[11px]">{currentPersona.name}</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">{currentPersona.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {personaDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Select Synthetic Persona (RBAC Sandbox)
                </div>
                <div className="space-y-1 mt-1">
                  {DEMO_PERSONAS.map((p) => {
                    const isSelected = p.employee_id === currentPersona.employee_id;
                    return (
                      <button
                        key={p.employee_id}
                        onClick={() => {
                          setPersona(p);
                          setPersonaDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-600/20 text-white border border-blue-500/30 font-medium'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                            {p.avatarInitials}
                          </div>
                          <div>
                            <div className="font-medium text-xs">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.designation}</div>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          {p.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Body: Sidebar + Page Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Left Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950/70 transition-all duration-200 select-none ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 no-scrollbar">
            {NAV_SECTIONS.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer info */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 text-[10px] text-slate-500 flex items-center justify-between">
              <span className="font-mono">v2.0 Enterprise</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                Live Demo
              </span>
            </div>
          )}
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {NAV_SECTIONS.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${item.badgeColor || 'bg-slate-800 text-slate-400'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Jump to workspace or feature (e.g. Incidents, Approvals, Risk)..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-800/40">
              {navSearch.trim() === '' ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Type the name of any workspace or governance console
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching workspace found
                </div>
              ) : (
                searchResults.map((res) => {
                  const Icon = res.icon;
                  return (
                    <Link
                      key={res.href}
                      href={res.href}
                      onClick={() => setSearchModalOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-slate-200">{res.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{res.href}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
