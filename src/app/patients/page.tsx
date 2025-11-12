import { PatientsList } from '@/components/patients/PatientsList';

export default function PatientsPage() {
  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Patients</h2>
        <PatientsList />
      </section>
    </div>
  );
}
