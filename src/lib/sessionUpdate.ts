import { prisma } from './db';

type UpdatedSession = { id: number; status: string };

export async function updateSessionStatus(id: number, status: string): Promise<UpdatedSession> {
  if (!id || typeof id !== 'number' || !status || typeof status !== 'string') {
    throw new Error('Invalid input');
  }

  const session = await prisma.sessions.update({
    where: { id },
    data: { status },
    // Force status to non-nullable string by coalescing
    select: { id: true, status: true }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Prisma model allows nullable status; safeguard to return a string
  return { id: session.id, status: session.status ?? 'Scheduled' };
}
