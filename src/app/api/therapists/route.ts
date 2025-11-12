import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { Therapist } from '@/types/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const specialty = searchParams.get('specialty');

    const whereClause: {
      name?: { contains: string; mode: 'insensitive' };
      specialty?: { equals: string };
    } = {};

    if (name && name.trim()) {
      whereClause.name = {
        contains: name.trim(),
        mode: 'insensitive'
      };
    }

    if (specialty && specialty.trim()) {
      whereClause.specialty = {
        equals: specialty.trim()
      };
    }

    const therapists: Therapist[] = await prisma.therapists.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      select: { id: true, name: true, specialty: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(therapists);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch therapists' }, { status: 500 });
  }
}
