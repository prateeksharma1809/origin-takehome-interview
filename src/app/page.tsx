
import { SessionsList } from '@/components/sessions/SessionsList';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Sessions</h1>
      <SessionsList />
    </main>
  );
}

