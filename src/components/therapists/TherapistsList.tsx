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
import { Therapist } from '@/types/models';

interface ApiError {
  error: string;
}

interface FetchState {
  data: Therapist[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: FetchState = {
  data: null,
  loading: true,
  error: null
};

export const TherapistsList: React.FC = () => {
  const [state, setState] = useState<FetchState>(initialState);
  const [searchName, setSearchName] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  const fetchTherapists = useCallback(async (name?: string, specialty?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const params = new URLSearchParams();
      if (name && name.trim()) params.append('name', name.trim());
      if (specialty && specialty.trim()) params.append('specialty', specialty.trim());
      
      const url = `/api/therapists${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err: ApiError = await res.json();
        console.error('Failed to load therapists:', err);
        setState({ data: null, loading: false, error: 'Failed to load therapists' });
        return;
      }
      
      const json: Therapist[] = await res.json();
      setState({ data: json, loading: false, error: null });
    } catch (e) {
      console.error('Error fetching therapists:', e);
      const errorMessage = e instanceof Error && e.name === 'AbortError' 
        ? 'Request timed out' 
        : 'Failed to load therapists';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, []);

  // Fetch all therapists on mount to get unique specialties
  useEffect(() => {
    void fetchTherapists();
  }, [fetchTherapists]);

  // Extract unique specialties when data changes
  useEffect(() => {
    if (state.data) {
      const unique = Array.from(new Set(state.data.map(t => t.specialty).filter(Boolean))) as string[];
      setSpecialties(unique.sort());
    }
  }, [state.data]);

  const handleSearch = () => {
    void fetchTherapists(searchName, filterSpecialty);
  };

  const handleSpecialtyChange = (newSpecialty: string) => {
    setFilterSpecialty(newSpecialty);
    void fetchTherapists(searchName, newSpecialty);
  };

  const handleReset = () => {
    setSearchName('');
    setFilterSpecialty('');
    void fetchTherapists();
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-blue-700 to-purple-700 rounded-full mb-4" />
              <div className="h-6 w-24 bg-green-900/60 rounded mb-2" />
              <div className="h-4 w-20 bg-blue-900/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={errorStateClass}>
        <h2 className="text-lg font-semibold mb-2">Something went wrong loading therapists</h2>
        <p className="mb-4">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => void fetchTherapists(searchName, filterSpecialty)}
          className="inline-flex items-center rounded bg-red-600 px-3 py-1.5 text-white text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const therapists = state.data ?? [];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
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
            placeholder="Enter therapist name..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="filter-specialty" className="block text-base font-extrabold neon font-mono mb-2 tracking-wide">
            Filter by Specialty
          </label>
          <select
            id="filter-specialty"
            value={filterSpecialty}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Specialties</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
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

      {/* Results as cards */}
      {therapists.length === 0 ? (
        <div className={emptyStateClass}>
          <h2 className="text-lg font-semibold mb-2">No therapists found</h2>
          <p className="mb-4">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {therapists.map((t) => (
            <div
              key={t.id}
              className="card p-6 flex flex-col items-center hover:shadow-2xl transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-blue-700 to-purple-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl font-extrabold neon font-mono">{t.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-extrabold neon font-mono mb-2 text-center tracking-wide">{t.name}</h3>
              <p className="text-xs font-mono text-green-400 mb-1 text-center">Specialty:</p>
              <p className="text-base font-semibold neon font-mono tracking-wider text-center">{t.specialty || '-'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
