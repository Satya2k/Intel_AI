import { Resend } from 'resend';
import { db } from '@/lib/database/db-client';
import { renderEmailTemplate } from './templates';

export type EmailMode = 'console' | 'test' | 'live';

export interface SendEmailOptions {
  recipientEmail: string;
  recipientName: string;
  templateId: string;
  templateVariables: Record<string, unknown>;
  subjectOverride?: string;
  idempotencyKey?: string;
  entityType?: string;
  entityId?: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private mode: EmailMode = 'console';
  private fromAddress = 'IntelliDesk Operations <notifications@northstar-tech.internal>';

  constructor() {
    this.mode = (process.env.EMAIL_MODE as EmailMode) || 'console';
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.startsWith('re_')) {
      this.resend = new Resend(apiKey);
    }
  }

  public getMode(): EmailMode {
    return this.mode;
  }

  /**
   * Enqueues an email into the transactional outbox
   */
  public async queueNotification(options: SendEmailOptions) {
    const rendered = renderEmailTemplate(options.templateId, options.templateVariables);
    const subject = options.subjectOverride || rendered.subject;

    const item = await db.queueOutboxNotification({
      recipient_email: options.recipientEmail,
      recipient_name: options.recipientName,
      subject,
      notification_type: 'TICKET_CREATED',
      template_id: options.templateId,
      template_variables: options.templateVariables,
      delivery_status: this.mode === 'console' ? 'LOGGED_CONSOLE' : 'QUEUED',
      idempotency_key: options.idempotencyKey || `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entity_type: options.entityType,
      entity_id: options.entityId,
      dispatched_at: this.mode === 'console' ? new Date().toISOString() : null,
    });

    if (this.mode === 'console') {
      console.log(`[EMAIL ENGINE: CONSOLE MODE] To: ${options.recipientEmail} | Subject: ${subject}`);
    }

    return item;
  }

  /**
   * Processes queued items in the transactional outbox
   */
  public async processOutbox(batchLimit = 10) {
    const queuedItems = await db.getOutboxItems({ status: 'QUEUED' });
    const batch = queuedItems.slice(0, batchLimit);
    const results = [];

    for (const item of batch) {
      try {
        const rendered = renderEmailTemplate(item.template_id, item.template_variables);

        if (this.mode === 'live' && this.resend) {
          await this.resend.emails.send({
            from: this.fromAddress,
            to: item.recipient_email,
            subject: item.subject,
            html: rendered.html,
            text: rendered.text,
          });

          await db.updateOutboxItem(item.id, {
            delivery_status: 'SENT',
            attempts: item.attempts + 1,
            dispatched_at: new Date().toISOString(),
            last_error: null,
          });

          results.push({ id: item.id, status: 'SENT' });
        } else if (this.mode === 'test') {
          // In test mode, simulate external delivery with success
          await db.updateOutboxItem(item.id, {
            delivery_status: 'SENT',
            attempts: item.attempts + 1,
            dispatched_at: new Date().toISOString(),
            last_error: null,
          });
          results.push({ id: item.id, status: 'SENT_TEST_SIMULATED' });
        } else {
          // Console mode
          await db.updateOutboxItem(item.id, {
            delivery_status: 'LOGGED_CONSOLE',
            attempts: item.attempts + 1,
            dispatched_at: new Date().toISOString(),
          });
          results.push({ id: item.id, status: 'LOGGED_CONSOLE' });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        await db.updateOutboxItem(item.id, {
          delivery_status: item.attempts >= 2 ? 'FAILED' : 'QUEUED',
          attempts: item.attempts + 1,
          last_error: errorMessage,
        });
        results.push({ id: item.id, status: 'ERROR', error: errorMessage });
      }
    }

    return { processedCount: batch.length, results };
  }

  /**
   * Direct test trigger (useful for the admin email monitoring panel)
   */
  public async sendTestEmail(recipientEmail: string, templateId = 'ticket_confirmation') {
    const rendered = renderEmailTemplate(templateId, {
      ticketId: 'TCK-TEST-999',
      title: 'Manual Verification Diagnostic Probe',
      priority: 'P2',
      assignedTeam: 'Platform Reliability',
      slaDueAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    });

    if (this.mode === 'live' && this.resend) {
      const response = await this.resend.emails.send({
        from: this.fromAddress,
        to: recipientEmail,
        subject: `[Diagnostic Probe] ${rendered.subject}`,
        html: rendered.html,
        text: rendered.text,
      });
      return { success: true, mode: 'live', response };
    }

    // Default console / test response
    return {
      success: true,
      mode: this.mode,
      message: `Diagnostic email logged in ${this.mode} mode for ${recipientEmail}. No external SMTP call made (safety sandbox).`,
      renderedSubject: rendered.subject,
    };
  }
}

export const emailService = new EmailService();
