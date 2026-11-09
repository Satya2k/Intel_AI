import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    
    let rpcSuccess = false;
    let rpcError: string | null = null;
    let rpcData: any = null;

    // 1. Attempt Supabase PostgreSQL RPC if configured
    if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes('your-project')) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        
        const { data, error } = await supabase.rpc('reset_demo_data');
        if (!error) {
          rpcSuccess = true;
          rpcData = data;
        } else {
          rpcError = error.message;
        }
      } catch (err: unknown) {
        rpcError = (err as Error).message;
      }
    }

    // 2. Always execute in-engine reset to ensure zero-latency demo consistency
    const localReset = await db.resetDemoData();

    return NextResponse.json(
      {
        success: true,
        timestamp: localReset.timestamp,
        organization: 'Northstar Technologies',
        message: 'Operational demo data successfully reset to clean baseline state.',
        rpcExecuted: rpcSuccess,
        rpcError: rpcError,
        details: {
          baselineEntitlementsRestored: true,
          activeTicketAssigned: 'TCK-IT-BASELINE-01 (Vikram Patel)',
          pendingApprovalCreated: 'REQ-DEMO-BASELINE-01 (Alice Chen -> Sarah Jenkins)',
          auditLogCreated: 'DEMO_DATA_RESET'
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset demo data',
        message: err.message
      },
      { status: 500 }
    );
  }
}

