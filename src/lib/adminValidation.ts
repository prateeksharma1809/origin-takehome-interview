import { z } from 'zod';

// Patient validation schemas
export const CreatePatientSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  dob: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      const now = new Date();
      return !isNaN(parsedDate.getTime()) && parsedDate <= now;
    }, 'Date of birth must be a valid date in the past')
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

// Therapist validation schemas
export const CreateTherapistSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  specialty: z.string()
    .max(100, 'Specialty must be less than 100 characters')
    .trim()
    .optional()
});

export const UpdateTherapistSchema = CreateTherapistSchema.partial();

// Session validation schemas
export const CreateSessionSchema = z.object({
  patient_id: z.number()
    .int('Patient ID must be an integer')
    .positive('Patient ID must be positive'),
  therapist_id: z.number()
    .int('Therapist ID must be an integer')
    .positive('Therapist ID must be positive'),
  date: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Date must be a valid date'),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No-show'])
    .optional()
    .default('Scheduled')
});

export const UpdateSessionSchema = z.object({
  patient_id: z.number()
    .int('Patient ID must be an integer')
    .positive('Patient ID must be positive')
    .optional(),
  therapist_id: z.number()
    .int('Therapist ID must be an integer')
    .positive('Therapist ID must be positive')
    .optional(),
  date: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Date must be a valid date')
    .optional(),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No-show'])
    .optional()
});

// ID parameter validation
export const IdParamSchema = z.object({
  id: z.string()
    .refine((id) => {
      const num = parseInt(id, 10);
      return !isNaN(num) && num > 0;
    }, 'ID must be a positive integer')
    .transform((id) => parseInt(id, 10))
});

// Type exports for TypeScript
export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type CreateTherapistInput = z.infer<typeof CreateTherapistSchema>;
export type UpdateTherapistInput = z.infer<typeof UpdateTherapistSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;