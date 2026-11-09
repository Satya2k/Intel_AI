import { db } from '@/lib/database/db-client';
import { KnowledgeDocument } from '@/lib/database/knowledge-data';

export interface KnowledgeRetrievalResult {
  hasMatches: boolean;
  topDocument: KnowledgeDocument | null;
  allMatches: { document: KnowledgeDocument; score: number }[];
  sourceAttribution: string;
  excerpt: string;
}

/**
 * Searches the 20 approved IT Standard Operating Procedures (RAG system)
 * Provides strict source attribution and prevents halluncinated instructions.
 */
export async function retrieveTroubleshootingGuide(
  query: string,
  category?: string
): Promise<KnowledgeRetrievalResult> {
  const matches = await db.searchKnowledge(query, category);

  if (matches.length === 0) {
    return {
      hasMatches: false,
      topDocument: null,
      allMatches: [],
      sourceAttribution: 'No approved SOP found matching this query in Northstar Knowledge Base.',
      excerpt: '',
    };
  }

  const topMatch = matches[0].document;
  // Extract the most relevant excerpt (Step-by-Step section)
  const stepsMatch = topMatch.content.match(/Step-by-Step Resolution:[\s\S]*?(?=Escalation:|$)/i) ||
                     topMatch.content.match(/Resolution Steps:[\s\S]*?(?=Escalation:|$)/i) ||
                     topMatch.content.match(/Procedure:[\s\S]*/i);

  const excerpt = stepsMatch ? stepsMatch[0].trim() : topMatch.content.substring(0, 400);

  return {
    hasMatches: true,
    topDocument: topMatch,
    allMatches: matches.slice(0, 3),
    sourceAttribution: `Source: [${topMatch.title}] (Document ID: ${topMatch.document_id}, Version ${topMatch.version}, Reference: ${topMatch.source})`,
    excerpt,
  };
}

