'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, LifeBuoy, ShieldCheck, CheckSquare, BarChart3, 
  History, Users, ChevronDown, UserCircle2, Layers, Terminal 
} from 'lucide-react';
import { usePersona, DEMO_PERSONAS } from './PersonaContext';
import { ResetDemoButton } from '../ResetDemoButton';

export function Navbar() {
  const pathname = usePathname();
  const { currentPersona, setPersona } = usePersona();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/employee', label: 'Employee Portal', icon: Bot },
    { href: '/service-desk', label: 'IT Service Desk', icon: LifeBuoy },
    { href: '/iam', label: 'IAM Console', icon: ShieldCheck },
    { href: '/approvals', label: 'Approvals', icon: CheckSquare },
    { href: '/lifecycle', label: 'Lifecycle (JML)', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/audit', label: 'Audit Trail', icon: History },
    { href: '/tests', label: 'Guardrail Tests', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  IntelliDesk <span className="text-blue-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono">Northstar Ops Engine</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions: Reset Demo Button & Persona Switcher */}
          <div className="flex items-center gap-2.5">
            <ResetDemoButton />

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-left transition-all"
              >
              <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                {currentPersona.avatarInitials}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-white leading-tight">{currentPersona.name}</div>
                <div className="text-[10px] text-slate-400 leading-tight flex items-center gap-1">
                  <span>{currentPersona.designation}</span>
                  <span className="text-blue-400">({currentPersona.role})</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Switch Active Persona
                </div>
                <div className="space-y-1 mt-1">
                  {DEMO_PERSONAS.map((p) => {
                    const isSelected = p.employee_id === currentPersona.employee_id;
                    return (
                      <button
                        key={p.employee_id}
                        onClick={() => {
                          setPersona(p);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-600/20 text-white border border-blue-500/30 font-medium'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                            {p.avatarInitials}
                          </div>
                          <div>
                            <div className="font-medium">{p.name}</div>
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
        </div>
      </div>
    </header>
  );
}

