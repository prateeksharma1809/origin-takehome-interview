import { prisma } from './db';
import { SessionWithNames } from '@/types/models';

interface GetSessionsParams {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
}

type SessionWithNameSelections = {
  id: number;
  date: Date;
  status: string | null;
  therapist_id: number | null;
  patient_id: number | null;
  therapists: { name: string } | null;
  patients: { name: string } | null;
};

export async function getAllSessionsWithNames(params?: GetSessionsParams): Promise<SessionWithNames[]> {
  const { search, status, sortOrder = 'asc' } = params || {};

  const whereClause: {
    OR?: Array<{
      therapists?: { name?: { contains: string; mode: 'insensitive' } };
      patients?: { name?: { contains: string; mode: 'insensitive' } };
    }>;
    status?: { equals: string };
  } = {};

  // Search by therapist or patient name
  if (search && search.trim()) {
    whereClause.OR = [
      {
        therapists: {
          name: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        }
      },
      {
        patients: {
          name: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        }
      }
    ];
  }

  // Filter by status
  if (status && status.trim()) {
    whereClause.status = {
      equals: status.trim()
    };
  }

  const sessions: SessionWithNameSelections[] = await prisma.sessions.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { date: sortOrder },
    include: {
      therapists: {
        select: { name: true }
      },
      patients: {
        select: { name: true }
      }
    }
  });

  return sessions.map((session): SessionWithNames => ({
    id: session.id,
    date: session.date,
    status: session.status ?? 'Scheduled',
    therapistName: session.therapists?.name ?? '',
    patientName: session.patients?.name ?? ''
  }));
}
