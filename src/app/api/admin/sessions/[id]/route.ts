import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { IdParamSchema, UpdateSessionSchema, type UpdateSessionInput } from '@/lib/adminValidation';
import { withErrorHandler } from '@/lib/apiHelpers';

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return session?.value === 'authenticated';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  return withErrorHandler(async () => {
    // Check authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      throw new Error('Unauthorized');
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    
    // Validate ID parameter
    const { id } = IdParamSchema.parse(resolvedParams);

    // Parse and validate request body
    const body = await request.json();
    const validatedData: UpdateSessionInput = UpdateSessionSchema.parse(body);

    // Verify related records exist if they are being updated
    if (validatedData.patient_id) {
      const patient = await prisma.patients.findUnique({ 
        where: { id: validatedData.patient_id } 
      });
      if (!patient) {
        throw new Error('Patient not found');
      }
    }

    if (validatedData.therapist_id) {
      const therapist = await prisma.therapists.findUnique({ 
        where: { id: validatedData.therapist_id } 
      });
      if (!therapist) {
        throw new Error('Therapist not found');
      }
    }

    // Update session
    const session = await prisma.sessions.update({
      where: { id },
      data: {
        ...(validatedData.patient_id && { patient_id: validatedData.patient_id }),
        ...(validatedData.therapist_id && { therapist_id: validatedData.therapist_id }),
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.status && { status: validatedData.status }),
      },
      include: {
        patients: true,
        therapists: true,
      },
    });

    return session;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  return withErrorHandler(async () => {
    // Check authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      throw new Error('Unauthorized');
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    
    // Validate ID parameter
    const { id } = IdParamSchema.parse(resolvedParams);

    // Delete session
    const session = await prisma.sessions.delete({
      where: { id },
      include: {
        patients: true,
        therapists: true,
      },
    });

    return { message: 'Session deleted successfully', session };
  });
}