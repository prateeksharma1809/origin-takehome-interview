import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { CreateTherapistSchema, type CreateTherapistInput } from '@/lib/adminValidation';
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
    const validatedData: CreateTherapistInput = CreateTherapistSchema.parse(body);

    // Create therapist
    const therapist = await prisma.therapists.create({
      data: {
        name: validatedData.name,
        specialty: validatedData.specialty || null,
      },
    });

    return therapist;
  });
}

export async function GET() {
  return withErrorHandler(async () => {
    // Check authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      throw new Error('Unauthorized');
    }

    // Fetch all therapists with session counts
    const therapists = await prisma.therapists.findMany({
      include: {
        sessions: {
          select: {
            id: true,
            status: true,
            patients: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return therapists;
  });
}