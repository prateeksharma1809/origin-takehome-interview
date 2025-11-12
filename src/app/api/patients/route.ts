import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { Patient } from '@/types/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    const whereClause: {
      name?: { contains: string; mode: 'insensitive' };
    } = {};

    if (name && name.trim()) {
      whereClause.name = {
        contains: name.trim(),
        mode: 'insensitive'
      };
    }

    const patients: Patient[] = await prisma.patients.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      select: { id: true, name: true, dob: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
