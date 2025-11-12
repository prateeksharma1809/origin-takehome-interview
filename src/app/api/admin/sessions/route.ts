import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { CreateSessionSchema, type CreateSessionInput } from '@/lib/adminValidation';
import { withErrorHandler } from '@/lib/apiHelpers';

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return session?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // Check authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      throw new Error('Unauthorized');
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData: CreateSessionInput = CreateSessionSchema.parse(body);

    // Verify patient and therapist exist
    const [patient, therapist] = await Promise.all([
      prisma.patients.findUnique({ where: { id: validatedData.patient_id } }),
      prisma.therapists.findUnique({ where: { id: validatedData.therapist_id } }),
    ]);

    if (!patient) {
      throw new Error('Patient not found');
    }
    if (!therapist) {
      throw new Error('Therapist not found');
    }

    // Create session
    const session = await prisma.sessions.create({
      data: {
        patient_id: validatedData.patient_id,
        therapist_id: validatedData.therapist_id,
        date: new Date(validatedData.date),
        status: validatedData.status || 'Scheduled',
      },
      include: {
        patients: true,
        therapists: true,
      },
    });

    return session;
  });
}

export async function GET() {
  return withErrorHandler(async () => {
    // Check authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      throw new Error('Unauthorized');
    }

    // Fetch all sessions with related data
    const sessions = await prisma.sessions.findMany({
      include: {
        patients: true,
        therapists: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return sessions;
  });
}