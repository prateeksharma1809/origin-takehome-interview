'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/admin/Modal';
import SessionForm from '@/components/admin/SessionForm';
import { type CreateSessionInput, type UpdateSessionInput } from '@/lib/adminValidation';

type SessionWithRelations = {
  id: number;
  therapist_id: number | null;
  patient_id: number | null;
  date: Date;
  status: string | null;
  patients: {
    id: number;
    name: string;
    dob: Date | null;
  } | null;
  therapists: {
    id: number;
    name: string;
    specialty: string | null;
  } | null;
};

export default function AdminSessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setSessions(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // Create session
  const handleCreateSession = async (data: CreateSessionInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setIsModalOpen(false);
        await fetchSessions(); // Refresh the list
      } else {
        throw new Error(result.error?.message || 'Failed to create session');
      }
    } catch (err) {
      throw err; // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle session status
  const handleToggleStatus = async (sessionId: number, currentStatus: string | null) => {
    const newStatus = currentStatus === 'Scheduled' ? 'Completed' : 'Scheduled';
    
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchSessions(); // Refresh the list
      } else {
        alert(result.error?.message || 'Failed to update session status');
      }
    } catch (err) {
      alert('Failed to update session status');
    }
  };

  // Delete session
  const handleDeleteSession = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sessions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await fetchSessions(); // Refresh the list
      } else {
        alert(result.error?.message || 'Failed to delete session');
      }
    } catch (err) {
      alert('Failed to delete session');
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
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading sessions...</p>
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
              <h1 className="text-xl text-gray-300">Manage Sessions</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="mr-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Schedule Session
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
                        {sessions.length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-400">
                      Total Sessions
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
                        {sessions.filter((s: SessionWithRelations) => s.status === 'Completed').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-400">
                      Completed Sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {sessions.filter((s: SessionWithRelations) => s.status === 'Scheduled').length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-400">
                      Scheduled Sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium neon">
                Therapy Sessions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                Overview of all therapy sessions in the system.
              </p>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No sessions found.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Schedule First Session
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {sessions.map((session: SessionWithRelations, index: number) => (
                  <li key={session.id} className={`px-6 py-4 ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-900/30'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-100">
                              Session #{session.id}
                            </p>
                            <p className="text-sm text-gray-400">
                              Patient: {session.patients?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-400">
                              Therapist: {session.therapists?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.status === 'Completed' 
                              ? 'bg-green-900 text-green-200'
                              : session.status === 'Scheduled'
                              ? 'bg-blue-900 text-blue-200'
                              : session.status === 'Cancelled'
                              ? 'bg-red-900 text-red-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                            {session.status || 'Scheduled'}
                          </span>
                          <p className="text-xs text-gray-400">
                            {new Date(session.date).toLocaleDateString()} at{' '}
                            {new Date(session.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        
                        {/* Status Toggle Button */}
                        {(session.status === 'Scheduled' || session.status === 'Completed') && (
                          <button
                            onClick={() => handleToggleStatus(session.id, session.status)}
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              session.status === 'Scheduled'
                                ? 'bg-green-800 text-green-200 hover:bg-green-700'
                                : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                            }`}
                            title={session.status === 'Scheduled' ? 'Mark as Completed' : 'Mark as Scheduled'}
                          >
                            {session.status === 'Scheduled' ? 'Complete' : 'Reschedule'}
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Delete session"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Session Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Schedule New Session"
          >
            <SessionForm
              onSubmit={handleCreateSession}
              onCancel={() => setIsModalOpen(false)}
              isLoading={isSubmitting}
            />
          </Modal>
        </div>
      </main>
    </div>
  );
}