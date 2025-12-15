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

