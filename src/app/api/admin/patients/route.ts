import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { CreatePatientSchema, type CreatePatientInput } from '@/lib/adminValidation';
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
    const validatedData: CreatePatientInput = CreatePatientSchema.parse(body);

    // Create patient
    const patient = await prisma.patients.create({
      data: {
        name: validatedData.name,
        dob: validatedData.dob ? new Date(validatedData.dob) : null,
      },
    });

    return patient;
  });
}

export async function GET() {
  return withErrorHandler(async () => {
    // Check authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      throw new Error('Unauthorized');
    }

    // Fetch all patients with session counts
    const patients = await prisma.patients.findMany({
      include: {
        sessions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return patients;
  });
}