import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recipientEmail = body.recipientEmail || 'operator@northstar-tech.internal';
    const templateId = body.templateId || 'ticket_confirmation';

    const result = await emailService.sendTestEmail(recipientEmail, templateId);
    return NextResponse.json({
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send test email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
