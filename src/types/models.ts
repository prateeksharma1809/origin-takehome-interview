// src/types/models.ts
// Handcrafted interfaces mirroring Prisma models. Keep in sync with prisma/schema.prisma.

export interface Patient {
  id: number;
  name: string;
  // dob stored as Date (nullable). When fetched via Prisma, it will be a JS Date instance or null
  dob: Date | null;
}

export interface Therapist {
  id: number;
  name: string;
  specialty: string | null;
}

export interface Session {
  id: number;
  therapist_id: number | null;
  patient_id: number | null;
  date: Date;
  status: string | null; // defaults to "Scheduled" in DB, but may be null if manually set
}

// Convenient relation-expanded shapes to use in UI queries
export interface SessionWithRelations extends Session {
  patients: Patient | null;
  therapists: Therapist | null;
}

// API response shape for /api/sessions
export interface SessionWithNames {
  id: number;
  date: Date;
  status: string;
  therapistName: string;
  patientName: string;
}
