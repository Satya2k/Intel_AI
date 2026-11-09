import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { runSupervisorAgent } from '@/agents/supervisor/supervisor-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, employee_id, conversation_id } = body;

    if (!message || !employee_id) {
      return NextResponse.json(
        { error: 'Both message and employee_id are required fields.' },
        { status: 400 }
      );
    }

    // Ensure conversation exists
    const conv = await db.getOrCreateConversation(employee_id, conversation_id);

    // Save user message to database
    await db.addConversationMessage({
      conversation_id: conv.conversation_id,
      sender_type: 'USER',
      message_content: message,
    });

    // Run Supervisor Multi-Agent Orchestration
    const agentResponse = await runSupervisorAgent(employee_id, message, conv.conversation_id);

    // Save agent response to database
    await db.addConversationMessage({
      conversation_id: conv.conversation_id,
      sender_type: 'AGENT',
      agent_name: 'IntelliDesk Supervisor',
      message_content: agentResponse.responseText,
      metadata: {
        intent: agentResponse.intent,
        hasTicket: !!agentResponse.ticket,
        hasAccessRequest: !!agentResponse.accessRequest,
        hasKnowledgeDoc: !!agentResponse.knowledgeDocument,
      }
    });

    return NextResponse.json({
      success: true,
      conversation_id: conv.conversation_id,
      ...agentResponse,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'An internal error occurred during agent execution.' },
      { status: 500 }
    );
  }
}

