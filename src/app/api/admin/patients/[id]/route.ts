import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { IdParamSchema, UpdatePatientSchema, type UpdatePatientInput } from '@/lib/adminValidation';
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
    const validatedData: UpdatePatientInput = UpdatePatientSchema.parse(body);

    // Update patient
    const patient = await prisma.patients.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.dob !== undefined && { 
          dob: validatedData.dob ? new Date(validatedData.dob) : null 
        }),
      },
    });

    return patient;
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

    // Check if patient has any sessions
    const sessionCount = await prisma.sessions.count({
      where: { patient_id: id },
    });

    if (sessionCount > 0) {
      throw new Error('Cannot delete patient with existing sessions');
    }

    // Delete patient
    const patient = await prisma.patients.delete({
      where: { id },
    });

    return { message: 'Patient deleted successfully', patient };
  });
}