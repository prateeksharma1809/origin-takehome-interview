"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { Patient } from '@/types/models';

interface ApiError {
  error: string;
}

interface FetchState {
  data: Patient[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: FetchState = {
  data: null,
  loading: true,
  error: null
};

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date));
}

export const PatientsList: React.FC = () => {
  const [state, setState] = useState<FetchState>(initialState);
  const [searchName, setSearchName] = useState('');

  const fetchPatients = useCallback(async (name?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const params = new URLSearchParams();
      if (name && name.trim()) params.append('name', name.trim());
      
      const url = `/api/patients${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err: ApiError = await res.json();
        console.error('Failed to load patients:', err);
        setState({ data: null, loading: false, error: 'Failed to load patients' });
        return;
      }
      
      const json: Patient[] = await res.json();
      setState({ data: json, loading: false, error: null });
    } catch (e) {
      console.error('Error fetching patients:', e);
      const errorMessage = e instanceof Error && e.name === 'AbortError' 
        ? 'Request timed out' 
        : 'Failed to load patients';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, []);

  useEffect(() => {
    void fetchPatients();
  }, [fetchPatients]);

  const handleSearch = () => {
    void fetchPatients(searchName);
  };

  const handleReset = () => {
    setSearchName('');
    void fetchPatients();
  };

  if (state.loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card p-6 flex flex-col items-center animate-pulse"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-700 via-purple-700 to-pink-600 rounded-full mb-4" />
              <div className="h-6 w-24 bg-blue-900/60 rounded mb-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={errorStateClass}>
        <h2 className="text-lg font-semibold mb-2">Something went wrong loading patients</h2>
        <p className="mb-4">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => void fetchPatients(searchName)}
          className="inline-flex items-center rounded bg-red-600 px-3 py-1.5 text-white text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const patients = state.data ?? [];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="search-name" className="block text-base font-extrabold neon font-mono mb-2 tracking-wide">
            Search by Name
          </label>
          <input
            id="search-name"
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter patient name..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
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

      {/* Results as cards */}
      {patients.length === 0 ? (
        <div className={emptyStateClass}>
          <h2 className="text-lg font-semibold mb-2">No patients found</h2>
          <p className="mb-4">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {patients.map((p) => (
            <div
              key={p.id}
              className="card p-6 flex flex-col items-center hover:shadow-2xl transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-700 via-purple-700 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl font-extrabold neon font-mono">{p.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-extrabold neon font-mono mb-2 text-center tracking-wide">{p.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
