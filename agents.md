# HomeOps Agent Rules

## Repo Context
- **Repo name**: HomeOps
- **Purpose**: Track home improvements, fixes, repairs, and todos in one place

## Locked Rules

### Supabase Integration
- When implementing Supabase backend, replace `src/services/entries.ts` only
- Do not change UI components when switching from mock data to Supabase
- Maintain the same interface/API contract for the service layer

### AWS Amplify Hosting
- This repo is deployed as a static app with AWS Amplify
- Build configuration is in `amplify.yml`
- Static files are served from the `dist` directory after build

