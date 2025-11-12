import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { IdParamSchema, UpdateTherapistSchema, type UpdateTherapistInput } from '@/lib/adminValidation';
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
    const validatedData: UpdateTherapistInput = UpdateTherapistSchema.parse(body);

    // Update therapist
    const therapist = await prisma.therapists.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.specialty !== undefined && { 
          specialty: validatedData.specialty || null 
        }),
      },
    });

    return therapist;
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

    // Check if therapist has any sessions
    const sessionCount = await prisma.sessions.count({
      where: { therapist_id: id },
    });

    if (sessionCount > 0) {
      throw new Error('Cannot delete therapist with existing sessions');
    }

    // Delete therapist
    const therapist = await prisma.therapists.delete({
      where: { id },
    });

    return { message: 'Therapist deleted successfully', therapist };
  });
}