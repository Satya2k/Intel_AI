'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AgentName, 
  AgentTelemetryStep, 
  ExecutionTelemetrySession, 
  ToolCallTelemetry 
} from '@/types/telemetry';

export function useAgentTelemetry() {
  const [session, setSession] = useState<ExecutionTelemetrySession>({
    sessionId: 'session-idle',
    userQuery: '',
    steps: [],
    isRunning: false,
    totalDurationMs: 0,
    startedAt: 0,
  });

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Live timer counting in milliseconds during running state
  useEffect(() => {
    if (session.isRunning) {
      const startTime = session.startedAt || Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session.isRunning, session.startedAt]);

  const startTelemetry = useCallback((
    userQuery: string,
    initialStepTemplates: Array<{ agentName: AgentName; reasoningSummary: string }>
  ) => {
    const now = Date.now();
    const newSteps: AgentTelemetryStep[] = initialStepTemplates.map((tpl, idx) => ({
      stepId: `step-${idx + 1}-${Date.now().toString().slice(-4)}`,
      agentName: tpl.agentName,
      status: idx === 0 ? 'running' : 'pending',
      startedAt: idx === 0 ? now : 0,
      durationMs: 0,
      inputTokens: 120 + idx * 45,
      outputTokens: 60 + idx * 30,
      reasoningSummary: tpl.reasoningSummary,
    }));

    setSession({
      sessionId: `session-${Date.now()}`,
      userQuery,
      steps: newSteps,
      isRunning: true,
      totalDurationMs: 0,
      startedAt: now,
    });
    setSelectedStepId(newSteps[0]?.stepId || null);
    setElapsedMs(0);
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<AgentTelemetryStep>) => {
    setSession((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.stepId === stepId ? { ...s, ...updates } : s)),
    }));
  }, []);

  const completeStep = useCallback((
    stepId: string, 
    updates?: Partial<AgentTelemetryStep>, 
    activateNext: boolean = true
  ) => {
    setSession((prev) => {
      const now = Date.now();
      const currentIdx = prev.steps.findIndex((s) => s.stepId === stepId);
      if (currentIdx === -1) return prev;

      const currentStep = prev.steps[currentIdx];
      const durationMs = currentStep.startedAt > 0 ? now - currentStep.startedAt : 140;

      const updatedSteps = [...prev.steps];
      updatedSteps[currentIdx] = {
        ...currentStep,
        status: 'completed',
        durationMs,
        ...updates,
      };

      if (activateNext && currentIdx + 1 < updatedSteps.length) {
        updatedSteps[currentIdx + 1] = {
          ...updatedSteps[currentIdx + 1],
          status: 'running',
          startedAt: now,
        };
        setSelectedStepId(updatedSteps[currentIdx + 1].stepId);
      }

      return {
        ...prev,
        steps: updatedSteps,
      };
    });
  }, []);

  const completeExecution = useCallback(() => {
    setSession((prev) => {
      const now = Date.now();
      const totalDuration = prev.startedAt > 0 ? now - prev.startedAt : 0;
      return {
        ...prev,
        isRunning: false,
        totalDurationMs: totalDuration,
        completedAt: now,
      };
    });
  }, []);

  const resetTelemetry = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSession({
      sessionId: 'session-idle',
      userQuery: '',
      steps: [],
      isRunning: false,
      totalDurationMs: 0,
      startedAt: 0,
    });
    setSelectedStepId(null);
    setElapsedMs(0);
  }, []);

  // Pre-configured live execution simulations for academic demonstrations
  const simulateLiveRun = useCallback(async (queryType: 'vpn_issue' | 'sap_access' | 'leaver_exit') => {
    resetTelemetry();

    if (queryType === 'vpn_issue') {
      const stepsTemplate: Array<{ agentName: AgentName; reasoningSummary: string }> = [
        {
          agentName: 'Supervisor',
          reasoningSummary: 'Analyzing intent: Employee reports VPN disconnects with AnyConnect gateway error. Classified as Network/VPN IT Support incident.',
        },
        {
          agentName: 'Knowledge/RAG Agent',
          reasoningSummary: 'Searching Northstar Knowledge Base vectors. Retrieved SOP-NET-001 (Cisco AnyConnect VPN Gateway Troubleshooting) with 94.2% cosine similarity.',
        },
        {
          agentName: 'Service Desk Agent',
          reasoningSummary: 'Synthesizing step-by-step diagnostic response. Evaluating impact x urgency: Impact=Low, Urgency=High -> Priority P3. Assigned to Network & Security Team.',
        },
        {
          agentName: 'Audit Agent',
          reasoningSummary: 'Recording immutable telemetry ledger event: Incident TCK-VPN-4812 created and RAG grounding verified.',
        },
      ];

      startTelemetry('My Cisco AnyConnect VPN is dropping connection every 10 minutes with gateway code 412', stepsTemplate);

      // Advance steps with realistic timing
      await new Promise((r) => setTimeout(r, 600));
      completeStep(stepsTemplate[0].agentName, {
        toolCall: {
          name: 'classifyRequestIntent',
          args: { query: 'VPN drop error 412' },
          result: JSON.stringify({ intent: 'INCIDENT', category: 'VPN', urgency: 'HIGH' }),
        },
      });

      await new Promise((r) => setTimeout(r, 700));
      completeStep(stepsTemplate[1].agentName, {
        sopRetrieved: {
          documentId: 'SOP-NET-001',
          title: 'Cisco AnyConnect VPN Gateway Troubleshooting Guide',
          similarityScore: 0.942,
          citation: 'Internal SOP-NET-001 v2.4 (Security Operations)',
        },
        toolCall: {
          name: 'queryVectorKnowledgeBase',
          args: { query: 'AnyConnect VPN gateway error 412' },
          result: 'Matched 3 relevant chunks with citation SOP-NET-001',
        },
      });

      await new Promise((r) => setTimeout(r, 650));
      completeStep(stepsTemplate[2].agentName, {
        toolCall: {
          name: 'createSupportTicket',
          args: { category: 'VPN', priority: 'P3', team: 'Network and Security Team' },
          result: 'Ticket TCK-VPN-4812 logged with 4h SLA window',
        },
      });

      await new Promise((r) => setTimeout(r, 450));
      completeStep(stepsTemplate[3].agentName, {
        toolCall: {
          name: 'appendAuditLog',
          args: { action: 'TICKET_CREATED_RAG', correlationId: 'CORR-VPN-8912' },
          result: 'Audit log appended with SHA-256 integrity hash',
        },
      }, false);

      completeExecution();
    } else if (queryType === 'sap_access') {
      const stepsTemplate: Array<{ agentName: AgentName; reasoningSummary: string }> = [
        {
          agentName: 'Supervisor',
          reasoningSummary: 'Analyzing intent: Employee Alice Chen requesting access to SAP S/4HANA Journal Entry Posting (PERM-SAP-POST). Routing to IAM Agent.',
        },
        {
          agentName: 'IAM Agent',
          reasoningSummary: 'Evaluating employee profile EMP-FIN-002 against Northstar RBAC Matrix. Verified role: Financial Analyst -> In-role entitlement.',
        },
        {
          agentName: 'Approval Agent',
          reasoningSummary: 'Checking approval matrix. Medium risk entitlement requires Level-1 Managerial approval from Finance Director Sarah Jenkins (EMP-FIN-001).',
        },
        {
          agentName: 'Audit Agent',
          reasoningSummary: 'Generating pending access request record REQ-SAP-9012 and dispatching manager notification.',
        },
      ];

      startTelemetry('Requesting SAP S/4HANA Journal Entry Posting for month-end close', stepsTemplate);

      await new Promise((r) => setTimeout(r, 550));
      completeStep(stepsTemplate[0].agentName);

      await new Promise((r) => setTimeout(r, 650));
      completeStep(stepsTemplate[1].agentName, {
        toolCall: {
          name: 'evaluateRBACPolicy',
          args: { employeeId: 'EMP-FIN-002', application: 'APP-SAP', permission: 'PERM-SAP-POST' },
          result: JSON.stringify({ inRole: true, requiresSecurityApproval: false }),
        },
      });

      await new Promise((r) => setTimeout(r, 600));
      completeStep(stepsTemplate[2].agentName, {
        toolCall: {
          name: 'createApprovalGate',
          args: { approverId: 'EMP-FIN-001', stage: 1, type: 'MANAGER' },
          result: 'Approval gate registered with idempotency IDEMP-SAP-ALICE',
        },
      });

      await new Promise((r) => setTimeout(r, 400));
      completeStep(stepsTemplate[3].agentName, {
        toolCall: {
          name: 'appendAuditLog',
          args: { action: 'ACCESS_REQUEST_SUBMITTED' },
          result: 'Logged with correlation ID CORR-IAM-1104',
        },
      }, false);

      completeExecution();
    } else if (queryType === 'leaver_exit') {
      const stepsTemplate: Array<{ agentName: AgentName; reasoningSummary: string }> = [
        {
          agentName: 'Supervisor',
          reasoningSummary: 'HR System Integration triggered verified departure event EVT-LEAVER-892 for Chloe Bennett (EMP-FIN-004). Initiating Leaver revocation workflow.',
        },
        {
          agentName: 'IAM Agent',
          reasoningSummary: 'Scanning active entitlements across directory: Found 4 active accounts (M365, Workday, SAP, Snowflake).',
        },
        {
          agentName: 'Provisioning Agent',
          reasoningSummary: 'Executing simulated adapter deprovisioning: Disabling Active Directory account, revoking SAP roles, invalidating SSO tokens.',
        },
        {
          agentName: 'Audit Agent',
          reasoningSummary: 'Writing termination audit entry. 100% cloud entitlements revoked; account status updated to TERMINATED.',
        },
      ];

      startTelemetry('Verified HR Leaver Workflow Execution for EMP-FIN-004', stepsTemplate);

      await new Promise((r) => setTimeout(r, 500));
      completeStep(stepsTemplate[0].agentName);

      await new Promise((r) => setTimeout(r, 600));
      completeStep(stepsTemplate[1].agentName, {
        toolCall: {
          name: 'enumerateActiveEntitlements',
          args: { employeeId: 'EMP-FIN-004' },
          result: 'Identified 4 active entitlements requiring revocation',
        },
      });

      await new Promise((r) => setTimeout(r, 700));
      completeStep(stepsTemplate[2].agentName, {
        toolCall: {
          name: 'revokeAllCloudEntitlements',
          args: { employeeId: 'EMP-FIN-004', reason: 'HR Voluntary Separation' },
          result: '4/4 adapters executed revocation successfully',
        },
      });

      await new Promise((r) => setTimeout(r, 450));
      completeStep(stepsTemplate[3].agentName, {
        toolCall: {
          name: 'finalizeLeaverEvent',
          args: { eventId: 'EVT-LEAVER-892', status: 'COMPLETED' },
          result: 'Immutable audit entry sealed',
        },
      }, false);

      completeExecution();
    }
  }, [resetTelemetry, startTelemetry, completeStep, completeExecution]);

  const activeStep = session.steps.find((s) => s.status === 'running') || null;
  const selectedStep = session.steps.find((s) => s.stepId === selectedStepId) || session.steps[0] || null;

  return {
    session,
    activeStep,
    selectedStep,
    selectedStepId,
    setSelectedStepId,
    isRunning: session.isRunning,
    elapsedMs,
    startTelemetry,
    updateStep,
    completeStep,
    completeExecution,
    resetTelemetry,
    simulateLiveRun,
  };
}

