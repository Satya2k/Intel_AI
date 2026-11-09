'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Persona {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'IT_ADMIN' | 'IAM_ADMIN' | 'SECURITY_ADMIN';
  avatarInitials: string;
}

export const DEMO_PERSONAS: Persona[] = [
  {
    employee_id: 'EMP-FIN-002',
    name: 'Alice Chen',
    email: 'alice.chen@northstar-tech.internal',
    department: 'Finance',
    designation: 'Senior Financial Analyst',
    role: 'EMPLOYEE',
    avatarInitials: 'AC',
  },
  {
    employee_id: 'EMP-FIN-001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@northstar-tech.internal',
    department: 'Finance',
    designation: 'Finance Director',
    role: 'MANAGER',
    avatarInitials: 'SJ',
  },
  {
    employee_id: 'EMP-IT-001',
    name: 'Vikram Patel',
    email: 'vikram.patel@northstar-tech.internal',
    department: 'IT',
    designation: 'IT Service Desk Manager',
    role: 'IT_ADMIN',
    avatarInitials: 'VP',
  },
  {
    employee_id: 'EMP-IAM-001',
    name: 'Alex Mercer',
    email: 'alex.mercer@northstar-tech.internal',
    department: 'IT',
    designation: 'Principal IAM Architect',
    role: 'IAM_ADMIN',
    avatarInitials: 'AM',
  },
  {
    employee_id: 'EMP-SEC-001',
    name: 'Elena Rostova',
    email: 'elena.rostova@northstar-tech.internal',
    department: 'Cybersecurity',
    designation: 'Chief Information Security Officer',
    role: 'SECURITY_ADMIN',
    avatarInitials: 'ER',
  },
];

interface PersonaContextType {
  currentPersona: Persona;
  setPersona: (p: Persona) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  currentPersona: DEMO_PERSONAS[0],
  setPersona: () => {},
});

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<Persona>(DEMO_PERSONAS[0]);

  useEffect(() => {
    const saved = localStorage.getItem('intellidesk_persona');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = DEMO_PERSONAS.find(p => p.employee_id === parsed.employee_id);
        if (match) setCurrentPersona(match);
      } catch {
        // ignore fallback
      }
    }
  }, []);

  const handleSetPersona = (p: Persona) => {
    setCurrentPersona(p);
    localStorage.setItem('intellidesk_persona', JSON.stringify(p));
  };

  return (
    <PersonaContext.Provider value={{ currentPersona, setPersona: handleSetPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}

