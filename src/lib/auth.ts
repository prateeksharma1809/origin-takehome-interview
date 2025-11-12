import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  
  if (!session || session.value !== 'authenticated') {
    return false;
  }
  
  return true;
}
