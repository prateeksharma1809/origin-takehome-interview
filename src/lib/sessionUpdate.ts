import { prisma } from './db';

export async function updateSessionStatus(id: number, status: string): Promise<{ id: number; status: string }> {
  if (!id || typeof id !== 'number' || !status || typeof status !== 'string') {
    throw new Error('Invalid input');
  }

  const session = await prisma.sessions.update({
    where: { id },
    data: { status },
    select: { id: true, status: true }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
}
