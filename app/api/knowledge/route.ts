import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';
import { KNOWLEDGE_DOCUMENTS } from '@/lib/database/knowledge-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;

    let results = KNOWLEDGE_DOCUMENTS;

    if (query.trim()) {
      const searchHits = await db.searchKnowledge(query, category === 'ALL' ? undefined : category);
      if (searchHits.length > 0) {
        results = searchHits.map(h => h.document);
      } else {
        const q = query.toLowerCase();
        results = KNOWLEDGE_DOCUMENTS.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.document_id.toLowerCase().includes(q) ||
          d.keywords.some(k => k.toLowerCase().includes(q))
        );
      }
    }

    if (category && category !== 'ALL') {
      results = results.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      documents: results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query knowledge documents';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
