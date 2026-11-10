import type { Metadata } from 'next';
import './globals.css';
import { PersonaProvider } from '@/components/layout/PersonaContext';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';

export const metadata: Metadata = {
  title: 'IntelliDesk AI 2.0 | Enterprise Service Operations & Identity Governance',
  description: 'ITSM, Identity Governance, Automated Communications, Risk Intelligence, and Multi-Agent Orchestration Platform for Northstar Technologies.',
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
          <EnterpriseShell>
            {children}
          </EnterpriseShell>
        </PersonaProvider>
      </body>
    </html>
  );
}

