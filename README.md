<div align="center">

# Origin Take‑Home Interview

An end-to-end sample app to manage therapists, patients, and therapy sessions. Built with Next.js App Router, Prisma, TypeScript, and Zod.

</div>

## Overview

This app exposes public read-only endpoints and pages for browsing therapists, patients, and sessions, and a simple password-gated Admin area for full CRUD. It uses PostgreSQL via Prisma, validates input with Zod, and keeps auth intentionally simple for the scope of a take‑home exercise.

Highlights
- Next.js 16 App Router with React 19
- PostgreSQL + Prisma Client
- Strict input validation (Zod) and consistent API error envelope
- Minimal session cookie-based admin auth for demo purposes
- TypeScript end-to-end with light shared types

## Tech stack

- Next.js: 16.0.1 (App Router)
- React / React DOM: 19.2.0
- TypeScript: ^5
- Prisma ORM: ^6.19.0
- Zod: ^4.1.12
- Tailwind CSS 4 (via @tailwindcss/postcss)

## Project structure

Key folders and files:

```
src/
	app/
		page.tsx                # Marketing/home page
		patients/               # Public list + pages
		therapists/             # Public list + pages
		admin/                  # Admin dashboard (login + CRUD pages)
		api/                    # Route handlers (public + admin APIs)
	components/               # UI components (lists, forms, modal)
	lib/                      # DB, validation, helpers
	types/                    # Shared TS interfaces
prisma/
	schema.prisma             # Data model (PostgreSQL)
prisma.config.ts            # Prisma config (migrations, datasource)
next.config.ts              # Next.js configuration
package.json                # Scripts and deps
```

Full tree (trimmed):

```
eslint.config.mjs
next.config.ts
package.json
prisma/
	schema.prisma
public/
src/
	app/
		admin/
			login/page.tsx
			patients/page.tsx
			sessions/page.tsx
			therapists/page.tsx
		api/
			admin/
				login/route.ts
				logout/route.ts
				patients/route.ts
				patients/[id]/route.ts
				sessions/route.ts
				sessions/[id]/route.ts
				therapists/route.ts
				therapists/[id]/route.ts
			patients/route.ts
			sessions/route.ts
			therapists/route.ts
		page.tsx
	components/
	lib/
		db.ts
		adminValidation.ts
		apiHelpers.ts
		sessions.ts
	types/
		models.ts
```

## Data model

Backed by PostgreSQL. Prisma models (see `prisma/schema.prisma`):

- patients: id, name, dob (Date nullable)
- therapists: id, name, specialty (nullable)
- sessions: id, patient_id, therapist_id, date (timestamp), status (defaults to "Scheduled"), relations to patients and therapists with cascade delete

## Requirements and setup

Prerequisites
- Node.js 20+ recommended
- PostgreSQL 14+ running locally or remote

Environment
1) Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database>?schema=public"
```

2) Install dependencies and generate the Prisma client.

Windows PowerShell examples:

```powershell
npm install
npx prisma migrate dev --name init
npx prisma generate
```

3) Start the app in development:

```powershell
npm run dev
```

Open http://localhost:3000

Build and run production locally:

```powershell
npm run build; npm start
```

Lint:

```powershell
npm run lint
```

## Admin console

- Login: http://localhost:3000/admin/login
- Demo credentials: username `admin`, password `@dmIn!`
- After login, a secure, httpOnly cookie `admin-session=authenticated` gates all admin APIs and pages
- Logout: POST `/api/admin/logout` or via the UI

Note: This is intentionally simple and not production-grade auth (no user table, no hashing, no CSRF/2FA). For a real system, replace with proper identity, sessions or JWTs, and RBAC.

## Public pages

- `/patients` – list and filter patients
- `/therapists` – list and filter therapists

## Public APIs

All responses are JSON. Errors return `{ success: false, error: { message, code, details? } }` only on admin routes using the helper; public routes return simple `{ error }` for brevity.

- `GET /api/patients?name=<string>`
	- Returns `[ { id, name, dob } ]` filtered by case-insensitive name contains

- `GET /api/therapists?name=<string>&specialty=<string>`
	- Returns `[ { id, name, specialty } ]`

- `GET /api/sessions?search=<string>&status=<Scheduled|Completed|Cancelled|No-show>&sortOrder=<asc|desc>`
	- Returns `[ { id, date, status, therapistName, patientName } ]`

## Admin APIs (require cookie `admin-session=authenticated`)

Auth
- `POST /api/admin/login` body `{ username, password }` → sets session cookie on success
- `POST /api/admin/logout` → clears the cookie

Patients
- `GET /api/admin/patients` → list with session summaries
- `POST /api/admin/patients` body `{ name: string, dob?: ISODateString }`
- `PUT /api/admin/patients/:id` body `{ name?: string, dob?: ISODateString|null }`
- `DELETE /api/admin/patients/:id` (blocked if the patient has sessions)

Therapists
- `GET /api/admin/therapists`
- `POST /api/admin/therapists` body `{ name: string, specialty?: string }`
- `PUT /api/admin/therapists/:id` body `{ name?: string, specialty?: string|null }`
- `DELETE /api/admin/therapists/:id` (blocked if the therapist has sessions)

Sessions
- `GET /api/admin/sessions`
- `POST /api/admin/sessions` body `{ patient_id: number, therapist_id: number, date: ISODateString, status?: 'Scheduled'|'Completed'|'Cancelled'|'No-show' }`
- `PUT /api/admin/sessions/:id` body `{ patient_id?, therapist_id?, date?, status? }`
- `DELETE /api/admin/sessions/:id`

Validation and errors
- All admin inputs validated via Zod schemas in `src/lib/adminValidation.ts`
- Consistent success/error envelope implemented in `src/lib/apiHelpers.ts`

## Design reasoning and trade‑offs

- App Router: Chosen for file-based routing, server components, and co-located API route handlers for small, focused endpoints.
- Prisma + PostgreSQL: Strong relational consistency, easy migrations, type-safe client.
- Zod at the edge: Perform strict request validation at route boundaries; fail fast with helpful field errors.
- Simple cookie auth for admin: Adequate for a take‑home; keeps focus on data/validation/CRUD. In production, replace with robust auth and authorization.
- Separation of concerns: Public read APIs are decoupled from admin CRUD APIs. UI layers use typed helper functions and lightweight components.
- Error handling: Centralized helpers normalize error shapes, including Prisma error code mapping.
- Dates: ISO strings accepted on input; converted to JS `Date` server-side. DB stores `Date`/`Timestamp`. Display formatting is a UI concern.

## Development notes

- Prisma migrations: Run `npx prisma migrate dev` whenever the schema changes. The `prisma.config.ts` points migrations to `prisma/migrations`.
- Database URL: Required (`DATABASE_URL`); without it the dev server will fail to start or APIs will 500.
- Images: `next.config.ts` whitelists `cdn.prod.website-files.com` for remote images.
- Tailwind v4: Configured via PostCSS. No `tailwind.config.js` is needed.

## Troubleshooting

- Dev server fails (Exit code 1): Ensure `.env` exists with a valid `DATABASE_URL`, Postgres is reachable, and run the Prisma steps: `npx prisma migrate dev` then `npx prisma generate`.
- Prisma client error: Delete `.prisma` cache if needed and regenerate: `npx prisma generate`.
- Migrations fail: Confirm the target database user has privileges; drop and recreate the database for a clean slate in local dev.

## Scripts

- `npm run dev` – start Next.js in development
- `npm run build` – production build
- `npm start` – start production server
- `npm run lint` – run ESLint

## License

This project is licensed under the terms of the LICENSE file included in the repository.

