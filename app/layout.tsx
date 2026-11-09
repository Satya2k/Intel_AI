import type { Metadata } from 'next';
import './globals.css';
import { PersonaProvider } from '@/components/layout/PersonaContext';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'IntelliDesk AI | Agentic IT Service Desk & Identity Governance',
  description: 'Enterprise Multi-Agent IT Service Desk, RBAC Policy Engine, and Automated Access Provisioning Platform for Northstar Technologies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <PersonaProvider>
          <DemoBanner />
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <strong>IntelliDesk AI</strong> — Academic Agentic AI for Business Operations Project
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Built for Technical Viva & Demonstration • Northstar Technologies (Synthetic Data)
              </div>
            </div>
          </footer>
        </PersonaProvider>
      </body>
    </html>
  );
}

