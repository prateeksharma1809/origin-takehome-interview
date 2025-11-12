import { NextRequest, NextResponse } from 'next/server';
import { updateSessionStatus } from '@/lib/sessionUpdate';
import { parseNumericId, parseIdFromRequestUrl } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Resolve params for Next.js 15+/16 where params may be a Promise
    const resolvedParams = await Promise.resolve(params);

    // Robust id parsing from params, then fallback to URL
    const idFromParams = parseNumericId(resolvedParams?.id);
    const idFromUrl = parseIdFromRequestUrl(request.url);
    const sessionId = idFromParams ?? idFromUrl;

    if (!sessionId) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    const body = await request.json();
    const status: string = body.status;

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updated = await updateSessionStatus(sessionId, status);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === 'Session not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'Invalid input') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
