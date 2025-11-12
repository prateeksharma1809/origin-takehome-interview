
import { NextResponse } from 'next/server';
import { getAllSessionsWithNames } from '@/lib/sessions';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    const sessions = await getAllSessionsWithNames({
      search,
      status,
      sortOrder: sortOrder === 'desc' ? 'desc' : 'asc'
    });

    if (!Array.isArray(sessions)) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 400 });
    }
    if (sessions.length === 0) {
      return NextResponse.json({ error: 'No sessions found' }, { status: 404 });
    }
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
