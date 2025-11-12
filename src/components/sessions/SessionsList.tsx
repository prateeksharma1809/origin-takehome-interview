"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  tableContainerClass,
  tableClass,
  theadClass,
  thClass,
  tdClass,
  trHoverClass,
  emptyStateClass,
  errorStateClass
} from '../TableStyles';
import { SessionWithNames } from '@/types/models';

interface ApiError {
  error: string;
  status?: number;
}

interface FetchState {
  data: SessionWithNames[] | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

const initialState: FetchState = {
  data: null,
  loading: true,
  error: null,
  notFound: false
};

const STATUS_CLASSES: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700'
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
}

export const SessionsList: React.FC = () => {
  const [state, setState] = useState<FetchState>(initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<'therapist' | 'patient' | 'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchSessions = useCallback(async (search?: string, status?: string, sort?: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const params = new URLSearchParams();
      if (search && search.trim()) params.append('search', search.trim());
      if (status && status.trim()) params.append('status', status.trim());
      if (sort) params.append('sortOrder', sort);
      
      const url = `/api/sessions${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.status === 404) {
        setState({ data: [], loading: false, error: null, notFound: true });
        return;
      }
      if (!res.ok) {
        const err: ApiError = await res.json();
        console.error('Failed to load sessions:', err);
        setState({ data: null, loading: false, error: 'Failed to load sessions', notFound: false });
        return;
      }
      const json: SessionWithNames[] = await res.json();
      setState({ data: json, loading: false, error: null, notFound: json.length === 0 });
    } catch (e) {
      console.error('Error fetching sessions:', e);
      const errorMessage = e instanceof Error && e.name === 'AbortError' 
        ? 'Request timed out' 
        : 'Failed to load sessions';
      setState({ data: null, loading: false, error: errorMessage, notFound: false });
    }
  }, []);

  useEffect(() => { void fetchSessions(); }, [fetchSessions]);

  const handleSearch = () => {
    void fetchSessions(searchTerm, filterStatus, sortOrder);
  };

  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    void fetchSessions(searchTerm, newStatus, sortOrder);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('');
    setSortField('date');
    setSortOrder('asc');
    void fetchSessions('', '', 'asc');
  };

  const handleColumnSort = (field: 'therapist' | 'patient' | 'date' | 'status') => {
    let newOrder: 'asc' | 'desc' = 'asc';
    
    // If clicking the same column, toggle order; otherwise reset to asc
    if (sortField === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    setSortField(field);
    setSortOrder(newOrder);
  };

  // Client-side sorting since API only sorts by date
  const sortedSessions = (state.data ?? []).slice().sort((a, b) => {
    let compareA: string | number = '';
    let compareB: string | number = '';

    switch (sortField) {
      case 'therapist':
        compareA = a.therapistName.toLowerCase();
        compareB = b.therapistName.toLowerCase();
        break;
      case 'patient':
        compareA = a.patientName.toLowerCase();
        compareB = b.patientName.toLowerCase();
        break;
      case 'date':
        compareA = new Date(a.date).getTime();
        compareB = new Date(b.date).getTime();
        break;
      case 'status':
        compareA = a.status.toLowerCase();
        compareB = b.status.toLowerCase();
        break;
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const markCompleted = async (id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
      setState(prev => ({ ...prev, error: 'Cannot update: invalid session id on client.' }));
      return;
    }
    try {
      // Add timeout to PATCH request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const err: ApiError = await res.json();
        console.error('Failed to update session:', err);
        setState(prev => ({ ...prev, error: 'Failed to update session' }));
        return;
      }
      // optimistic refresh
      setState(prev => ({
        ...prev,
        data: prev.data?.map(s => s.id === id ? { ...s, status: 'Completed' } : s) || null
      }));
    } catch (e) {
      console.error('Error updating session:', e);
      const errorMessage = e instanceof Error && e.name === 'AbortError' 
        ? 'Request timed out' 
        : 'Failed to update session';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  if (state.loading) {
      return (
        <div className={tableContainerClass}>
          <table className={tableClass}>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Therapist</th>
                <th className={thClass}>Patient</th>
                <th className={thClass}>Date/Time</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={trHoverClass}>
                  <td className={tdClass}>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className={tdClass}>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className={tdClass}>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className={tdClass}>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className={tdClass}>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
  if (state.error) {
      return (
        <div className={errorStateClass}>
          <h2 className="text-lg font-semibold mb-2">Something went wrong loading sessions</h2>
          <p className="mb-4">An unexpected error occurred. Please try again.</p>
          <button
            onClick={() => void fetchSessions(searchTerm, filterStatus, sortOrder)}
            className="inline-flex items-center rounded bg-red-600 px-3 py-1.5 text-white text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
  }
  if (state.notFound || (state.data && state.data.length === 0)) {
      return (
        <div className={emptyStateClass}>
          <h2 className="text-lg font-semibold mb-2">No sessions found</h2>
          <p className="mb-4">Try adjusting your search or filters.</p>
        </div>
      );
  }

  const sessions = state.data ?? [];

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="search-sessions" className="block text-sm font-medium text-gray-700 mb-1">
            Search by Name
          </label>
          <input
            id="search-sessions"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Therapist or Patient name..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Responsive table (hidden on small screens) */}
      <div className="hidden md:block overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-sm rounded-xl overflow-hidden shadow-lg border border-blue-500 futuristic-table">
          <thead className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 text-white">
            <tr className="text-left">
              <th 
                className="p-3 font-medium cursor-pointer hover:bg-blue-800/60 select-none transition"
                onClick={() => handleColumnSort('therapist')}
              >
                <div className="flex items-center justify-center gap-1">
                  Therapist
                  {sortField === 'therapist' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="p-3 font-medium cursor-pointer hover:bg-blue-800/60 select-none transition"
                onClick={() => handleColumnSort('patient')}
              >
                <div className="flex items-center justify-center gap-1">
                  Patient
                  {sortField === 'patient' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="p-3 font-medium cursor-pointer hover:bg-blue-800/60 select-none transition"
                onClick={() => handleColumnSort('date')}
              >
                <div className="flex items-center justify-center gap-1">
                  Date/Time
                  {sortField === 'date' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="p-3 font-medium cursor-pointer hover:bg-blue-800/60 select-none transition"
                onClick={() => handleColumnSort('status')}
              >
                <div className="flex items-center justify-center gap-1">
                  Status
                  {sortField === 'status' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((session, idx) => {
              const statusClass = STATUS_CLASSES[session.status] || 'bg-gray-100 text-gray-700';
              // Alternate row colors and add futuristic effects
              const rowClass = idx % 2 === 0
                ? 'bg-gray-900/80 text-white border-t border-blue-700'
                : 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white border-t border-purple-700';
              return (
                <tr key={session.id} className={`${rowClass} hover:scale-[1.01] hover:shadow-xl transition-transform duration-150`}>
                  <td className="p-3 font-mono tracking-wide">{session.therapistName || '—'}</td>
                  <td className="p-3 font-mono tracking-wide">{session.patientName || '—'}</td>
                  <td className="p-3 whitespace-nowrap font-mono tracking-wide">{formatDate(new Date(session.date))}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold shadow ${statusClass}`}>{session.status}</span>
                  </td>
                  <td className="p-3">
                    {session.status !== 'Completed' && (
                      <button
                        onClick={() => void markCompleted(session.id)}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
                      >Mark Completed</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="md:hidden space-y-3">
        {sortedSessions.map(session => {
          const statusClass = STATUS_CLASSES[session.status] || 'bg-gray-100 text-gray-700';
          return (
            <div key={session.id} className="border border-gray-200 rounded p-4 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{session.therapistName || 'Unknown Therapist'}</p>
                  <p className="text-xs text-gray-500">Patient: {session.patientName || 'Unknown'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold h-fit ${statusClass}`}>{session.status}</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{formatDate(new Date(session.date))}</p>
              {session.status !== 'Completed' && (
                <button
                  onClick={() => void markCompleted(session.id)}
                  className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                >Mark Completed</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
