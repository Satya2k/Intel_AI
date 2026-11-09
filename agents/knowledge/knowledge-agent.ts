import { retrieveTroubleshootingGuide, KnowledgeRetrievalResult } from '@/tools/knowledge-tools';
import { TicketCategory } from '@/lib/database/types';

export interface KnowledgeAgentResponse {
  answer: string;
  retrieval: KnowledgeRetrievalResult;
  suggestTicketCreation: boolean;
  ticketCategory?: TicketCategory;
}

/**
 * Knowledge & Troubleshooting Agent (RAG)
 * Grounded strictly in approved Northstar IT documentation.
 */
export async function runKnowledgeAgent(
  userQuery: string,
  categoryHint?: TicketCategory
): Promise<KnowledgeAgentResponse> {
  const retrieval = await retrieveTroubleshootingGuide(userQuery, categoryHint);

  if (!retrieval.hasMatches || !retrieval.topDocument) {
    return {
      answer: `I could not find an approved Standard Operating Procedure for this issue in the Northstar IT Knowledge Base. 

Would you like me to escalate this and create a formal IT Support Ticket for our technical team?`,
      retrieval,
      suggestTicketCreation: true,
      ticketCategory: categoryHint || 'Other IT incidents',
    };
  }

  const doc = retrieval.topDocument;

  const answer = `### 📘 ${doc.title}
*${retrieval.sourceAttribution}*

Here is the approved troubleshooting procedure:

${retrieval.excerpt}

---
**Did this step resolve your problem?**
- If yes, please let me know.
- If this did not work or if you need an administrator to assist, I can immediately create an escalated IT support ticket for you.`;

  return {
    answer,
    retrieval,
    suggestTicketCreation: false,
    ticketCategory: doc.category as TicketCategory,
  };
}

