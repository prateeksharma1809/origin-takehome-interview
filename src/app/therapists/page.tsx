import { TherapistsList } from '@/components/therapists/TherapistsList';

export default function TherapistsPage() {
  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Therapists</h2>
        <TherapistsList />
      </section>
    </div>
  );
}