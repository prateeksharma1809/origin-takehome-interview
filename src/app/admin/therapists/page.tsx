'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/admin/Modal';
import TherapistForm from '@/components/admin/TherapistForm';
import { type CreateTherapistInput } from '@/lib/adminValidation';

type TherapistWithSessions = {
  id: number;
  name: string;
  specialty: string | null;
  sessions: {
    id: number;
    status: string | null;
    patients: {
      name: string;
    } | null;
  }[];
};

export default function AdminTherapists() {
  const router = useRouter();
  const [therapists, setTherapists] = useState<TherapistWithSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch therapists
  const fetchTherapists = async () => {
    try {
      const response = await fetch('/api/admin/therapists');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setTherapists(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch therapists');
      }
    } catch (err) {
      setError('Failed to fetch therapists');
    } finally {
      setLoading(false);
    }
  };

  // Create therapist
  const handleCreateTherapist = async (data: CreateTherapistInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setIsModalOpen(false);
        await fetchTherapists(); // Refresh the list
      } else {
        throw new Error(result.error?.message || 'Failed to create therapist');
      }
    } catch (err) {
      throw err; // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete therapist
  const handleDeleteTherapist = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete therapist "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/therapists/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await fetchTherapists(); // Refresh the list
      } else {
        alert(result.error?.message || 'Failed to delete therapist');
      }
    } catch (err) {
      alert('Failed to delete therapist');
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading therapists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-2xl font-bold neon hover:text-purple-400"
              >
                Admin Panel
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl text-gray-300">Manage Therapists</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="mr-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add Therapist
              </button>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats - Moved to Top */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {therapists.length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-400">
                      Total Therapists
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {therapists.filter((t: TherapistWithSessions) => t.sessions.some(s => s.status === 'Completed')).length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-400">
                      Active Therapists
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {new Set(therapists.map((t: TherapistWithSessions) => t.specialty).filter(Boolean)).size}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-400">
                      Specialties
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium neon">
                Therapist Profiles
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                Overview of all therapists in the system.
              </p>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {therapists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No therapists found.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Add First Therapist
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {therapists.map((therapist: TherapistWithSessions, index: number) => {
                  const completedSessions = therapist.sessions.filter(s => s.status === 'Completed').length;
                  const totalSessions = therapist.sessions.length;
                  const uniquePatients = new Set(
                    therapist.sessions
                      .filter(s => s.patients)
                      .map(s => s.patients?.name)
                  ).size;
                  
                  return (
                    <li key={therapist.id} className={`px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-900/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-100">
                                {therapist.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                Therapist ID: #{therapist.id}
                              </p>
                              {therapist.specialty && (
                                <p className="text-sm text-gray-400">
                                  Specialty: {therapist.specialty}
                                </p>
                              )}
                              <p className="text-sm text-gray-400">
                                Patients served: {uniquePatients}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-end space-y-1">
                            <div className="flex space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                                {totalSessions} sessions
                              </span>
                              {completedSessions > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                                  {completedSessions} completed
                                </span>
                              )}
                            </div>
                            {therapist.specialty && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                                {therapist.specialty}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteTherapist(therapist.id, therapist.name)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Delete therapist"
                            disabled={totalSessions > 0}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add Therapist Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add New Therapist"
          >
            <TherapistForm
              onSubmit={handleCreateTherapist}
              onCancel={() => setIsModalOpen(false)}
              isLoading={isSubmitting}
            />
          </Modal>
        </div>
      </main>
    </div>
  );
}