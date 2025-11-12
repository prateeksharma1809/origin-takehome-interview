'use client';

import { useState } from 'react';
import { type CreatePatientInput } from '@/lib/adminValidation';

interface PatientFormProps {
  onSubmit: (data: CreatePatientInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreatePatientInput>;
  isLoading?: boolean;
}

export default function PatientForm({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isLoading = false 
}: PatientFormProps) {
  console.log('PatientForm rendered'); // Debug log
  
  const [formData, setFormData] = useState<CreatePatientInput>({
    name: initialData.name || '',
    dob: initialData.dob || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log
    setErrors({});
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error); // Debug log
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Patient Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-100"
          required
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-300">
          Date of Birth
        </label>
        <input
          type="date"
          id="dob"
          value={formData.dob}
          onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-100 [color-scheme:dark]"
          disabled={isLoading}
        />
        {errors.dob && (
          <p className="mt-1 text-sm text-red-400">{errors.dob}</p>
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
          {isLoading ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
}