# HomeOps Agent Rules

## Repo Context
- **Repo name**: HomeOps
- **Purpose**: Track home improvements, fixes, repairs, and todos in one place

## Locked Rules

### Supabase Integration
- When implementing Supabase backend, replace `src/services/entries.ts` only
- Do not change UI components when switching from mock data to Supabase
- Maintain the same interface/API contract for the service layer

### Supabase SQL Changes
- **ALWAYS** document SQL changes in `supabase/sql-changelog.md` after applying them
- Store repeatable SQL scripts as `.sql` files in the `supabase/` directory
- Each changelog entry should include: date, description, file path, and how to re-apply
- This ensures SQL changes can be re-applied if needed (e.g., when recreating the database)

### AWS Amplify Hosting
- This repo is deployed as a static app with AWS Amplify
- Build configuration is in `amplify.yml`
- Static files are served from the `dist` directory after build

## App Overview
- Vite + React + TypeScript frontend with Tailwind v4 (minimal config kept for compatibility) and Tremor for charts
- Single-page flow rendered in `src/App.tsx` -> `src/pages/Dashboard.tsx`
- Supabase client in `src/lib/supabase.ts` with graceful fallback to mock data when env vars are absent
- Auth helpers in `src/lib/auth.ts`; dashboard uses Supabase email/password auth and listens for auth state changes
- Entries service (`src/services/entries.ts`) returns mock data when Supabase env vars are missing; creation requires Supabase env
- Chart component in `src/components/charts/EntriesLineChart.tsx` renders spending trend from entries
- SEO/meta handled via `src/components/MetaTags.tsx` and `react-helmet-async`

## Testing & Tooling
- Primary scripts: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- Vitest + Testing Library setup in `vite.config.ts` with `src/test/setup.ts` registering jest-dom
- Mock-friendly patterns: entries service and auth are mocked in tests (`tests/dashboard-login.test.tsx` et al.)

## Branch Workflow
- Follow branch prefixes: `feature/*`, `bugfix/*`, `chore/*` (current work on `chore/update-agents-guidance`)
