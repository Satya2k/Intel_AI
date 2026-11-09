import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'tickets';

    if (type === 'metrics') {
      const csv = await db.exportAnalyticsAsCSV();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="intellidesk_analytics_summary.csv"',
        },
      });
    }

    if (type === 'sample') {
      const sample = [
        'ticket_id,title,category,priority,status,employee_id,assigned_team',
        'TCK-SAMPLE-01,"VPN connection drops repeatedly during video calls",VPN,P2,OPEN,EMP-FIN-002,VPN Support Team',
        'TCK-SAMPLE-02,"Outlook 365 disconnected from exchange server",Email,P3,OPEN,EMP-FIN-002,Service Desk Tier-1',
        'TCK-SAMPLE-03,"Laptop battery draining in less than 45 minutes",Hardware,P4,OPEN,EMP-FIN-002,Service Desk Tier-1',
        'TCK-SAMPLE-04,"SAP S/4HANA authorization missing for GL posting",ERP & SAP,P2,OPEN,EMP-FIN-002,ERP Support Team',
        'TCK-SAMPLE-05,"Locked out of Active Directory account after password change",Password,P2,RESOLVED,EMP-FIN-002,Service Desk Tier-1'
      ].join('\n');

      return new NextResponse(sample, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="sample_tickets_upload_template.csv"',
        },
      });
    }

    // Default: tickets export
    const csv = db.exportTicketsAsCSV();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="intellidesk_tickets_export.csv"',
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Helper to parse CSV lines safely handling quotes
function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const parseRow = (line: string): string[] => {
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row;
  };

  const headers = parseRow(lines[0]).map(h => h.replace(/^["']|["']$/g, '').toLowerCase().trim());
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rec[h] = values[idx] ? values[idx].replace(/^["']|["']$/g, '').trim() : '';
    });
    records.push(rec);
  }

  return records;
}

export async function POST(req: NextRequest) {
  try {
    let csvContent = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No CSV file provided in upload' }, { status: 400 });
      }
      csvContent = await file.text();
    } else {
      const body = await req.json();
      csvContent = body.csvData || body.csvContent || body.content || '';
    }

    if (!csvContent || !csvContent.trim()) {
      return NextResponse.json({ error: 'CSV content is empty' }, { status: 400 });
    }

    const parsedRecords = parseCSV(csvContent);
    if (parsedRecords.length === 0) {
      return NextResponse.json({ error: 'Could not parse any valid rows from CSV file' }, { status: 400 });
    }

    // Map parsed records to ticket import format
    const ticketsToImport = parsedRecords.map(r => ({
      ticket_id: r.ticket_id || r.id || undefined,
      title: r.title || r.subject || r.issue || r.summary || 'Imported IT Support Ticket',
      description: r.description || r.details || r.title || 'Imported via CSV dashboard upload',
      category: r.category || 'Software',
      priority: (['P1', 'P2', 'P3', 'P4'].includes(r.priority?.toUpperCase()) ? r.priority.toUpperCase() : 'P3') as any,
      status: (['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(r.status?.toUpperCase()) ? r.status.toUpperCase() : 'OPEN') as any,
      employee_id: r.employee_id || r.requester_id || 'EMP-FIN-002',
      assigned_team: r.assigned_team || r.team || `${r.category || 'Software'} Support Team`,
      created_at: r.created_at || new Date().toISOString(),
      resolved_at: r.resolved_at || undefined,
      sla_due_at: r.sla_due_at || undefined,
    }));

    const result = await db.importTicketsFromCSV(ticketsToImport);
    const updatedAnalytics = await db.getAnalyticsSummary();

    return NextResponse.json({
      success: true,
      importedCount: result.importedCount,
      message: `Successfully imported ${result.importedCount} ticket(s) from CSV into persistent store.`,
      analytics: updatedAnalytics,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
