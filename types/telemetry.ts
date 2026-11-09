export type AgentName = 
  | 'Supervisor'
  | 'Service Desk Agent'
  | 'Knowledge/RAG Agent'
  | 'IAM Agent'
  | 'Approval Agent'
  | 'Provisioning Agent'
  | 'Audit Agent';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolCallTelemetry {
  name: string;
  args: Record<string, any>;
  result: string;
}

export interface SopChunkTelemetry {
  documentId: string;
  title: string;
  similarityScore: number;
  citation: string;
}

export interface AgentTelemetryStep {
  stepId: string;
  agentName: AgentName;
  status: StepStatus;
  startedAt: number;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  toolCall?: ToolCallTelemetry;
  sopRetrieved?: SopChunkTelemetry;
  reasoningSummary: string;
}

export interface ExecutionTelemetrySession {
  sessionId: string;
  userQuery: string;
  steps: AgentTelemetryStep[];
  isRunning: boolean;
  totalDurationMs: number;
  startedAt: number;
  completedAt?: number;
}

