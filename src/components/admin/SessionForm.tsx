'use client';

import { useState, useEffect } from 'react';
import { type CreateSessionInput } from '@/lib/adminValidation';

interface SessionFormProps {
  onSubmit: (data: CreateSessionInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateSessionInput>;
  isLoading?: boolean;
}

type Patient = { id: number; name: string; };
type Therapist = { id: number; name: string; specialty: string | null; };

export default function SessionForm({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isLoading = false 
}: SessionFormProps) {
  const [formData, setFormData] = useState<CreateSessionInput>({
    patient_id: initialData.patient_id || 0,
    therapist_id: initialData.therapist_id || 0,
    date: initialData.date || '',
    status: initialData.status || 'Scheduled',
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, therapistsRes] = await Promise.all([
          fetch('/api/admin/patients'),
          fetch('/api/admin/therapists')
        ]);

        if (patientsRes.ok && therapistsRes.ok) {
          const [patientsData, therapistsData] = await Promise.all([
            patientsRes.json(),
            therapistsRes.json()
          ]);

          if (patientsData.success) {
            setPatients(patientsData.data.map((p: { id: number; name: string; }) => ({
              id: p.id,
              name: p.name
            })));
          }

          if (therapistsData.success) {
            setTherapists(therapistsData.data.map((t: { id: number; name: string; specialty: string | null; }) => ({
              id: t.id,
              name: t.name,
              specialty: t.specialty
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.patient_id || !formData.therapist_id) {
      setErrors({ general: 'Please select both a patient and a therapist' });
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patient_id" className="block text-sm font-medium text-gray-300">
          Patient *
        </label>
        <select
          id="patient_id"
          value={formData.patient_id}
          onChange={(e) => setFormData(prev => ({ ...prev, patient_id: parseInt(e.target.value) }))}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-100"
          required
          disabled={isLoading}
        >
          <option value="" className="bg-gray-800 text-gray-100">Select a patient</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id} className="bg-gray-800 text-gray-100">
              {patient.name}
            </option>
          ))}
        </select>
        {errors.patient_id && (
          <p className="mt-1 text-sm text-red-400">{errors.patient_id}</p>
        )}
      </div>

      <div>
        <label htmlFor="therapist_id" className="block text-sm font-medium text-gray-300">
          Therapist *
        </label>
        <select
          id="therapist_id"
          value={formData.therapist_id}
          onChange={(e) => setFormData(prev => ({ ...prev, therapist_id: parseInt(e.target.value) }))}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-100"
          required
          disabled={isLoading}
        >
          <option value="" className="bg-gray-800 text-gray-100">Select a therapist</option>
          {therapists.map(therapist => (
            <option key={therapist.id} value={therapist.id} className="bg-gray-800 text-gray-100">
              {therapist.name} {therapist.specialty && `(${therapist.specialty})`}
            </option>
          ))}
        </select>
        {errors.therapist_id && (
          <p className="mt-1 text-sm text-red-400">{errors.therapist_id}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-100 [color-scheme:dark]"
          required
          disabled={isLoading}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-400">{errors.date}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show' }))}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-100"
          disabled={isLoading}
        >
          <option value="Scheduled" className="bg-gray-800 text-gray-100">Scheduled</option>
          <option value="Completed" className="bg-gray-800 text-gray-100">Completed</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-400">{errors.status}</p>
        )}
      </div>

      {errors.general && (
        <div className="text-red-400 text-sm">{errors.general}</div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Session'}
        </button>
      </div>
    </form>
  );
}