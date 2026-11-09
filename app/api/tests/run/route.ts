import { NextRequest, NextResponse } from 'next/server';
import { runTestSuite, TEST_REGISTRY } from '@/lib/test-runner';

export async function GET() {
  try {
    // Return the test registry metadata without executing
    const testList = TEST_REGISTRY.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      targetPolicy: t.targetPolicy,
      description: t.description,
      citationRef: t.citationRef,
    }));

    return NextResponse.json({ tests: testList, total: testList.length }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let testIds: string[] | undefined;
    try {
      const body = await req.json();
      testIds = body.testIds;
    } catch {
      // No body or empty body runs all tests
    }

    const report = await runTestSuite(testIds);
    return NextResponse.json(report, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

