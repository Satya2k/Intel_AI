import { db } from '@/lib/database/db-client';
import { ActorType, AuditOutcome } from '@/lib/database/types';

export interface AuditEntryInput {
  actor_id: string;
  actor_type: ActorType;
  action: string;
  entity_type: string;
  entity_id: string;
  outcome: AuditOutcome;
  reason?: string;
  correlation_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Universal Tamper-Evident Audit Logger
 * All consequential actions in IntelliDesk AI must pass through this logger.
 */
export async function recordAuditLog(entry: AuditEntryInput) {
  const correlation_id = entry.correlation_id || `CORR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  return await db.logAudit({
    ...entry,
    correlation_id,
  });
}

