# HomeOps stack and game plan

## Stack

Frontend
- React
- Vite
- TypeScript

UI and styling
- Tailwind CSS
- shadcn/ui
- Tremor for charts

Data
- Supabase Postgres
- Supabase Auth optional later
- Supabase Row Level Security on

Deployment
- AWS Amplify Hosting only
- GitHub as source of truth

Quality and security
- ESLint
- Prettier
- Vitest and Testing Library
- GitHub Actions CI
- CodeQL
- Dependabot

## Game plan

### Phase 0. GitHub setup first

1) Create the repo
- Create a new GitHub repo named: homeops
- Add a short description: Track home improvements, fixes, repairs, and todos in one place
- Do not add starter files, no README, no .gitignore

2) Push your local scaffold to GitHub
```bash
git init
git add .
git commit -m "initial HomeOps scaffold"
git branch -M main
git remote add origin git@github.com:YOUR_ORG_OR_USER/homeops.git
git push -u origin main
```

3) Protect main
GitHub settings to apply:
- Branch protection for main
  - Require pull requests
  - Require status checks
  - Select your CI workflow as required
  - Restrict direct pushes

4) Turn on dependency and code security
- Enable Dependabot alerts
- Enable Dependabot security updates
- Enable code scanning with CodeQL (or keep it in workflow)
- Turn on secret scanning if available on your plan

5) Branch workflow and naming
Use these branch prefixes so Amplify auto-creates branch builds:
- feature/*
- bugfix/*
- chore/*

### Phase 1. Local dev and baseline quality gates

1) Run the app locally
```bash
npm install
npm run dev
```

2) Confirm scripts exist and pass
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

3) CI on PRs
- Add .github/workflows/ci.yml that runs lint, typecheck, test, build on pull_request and main pushes

4) Security workflows
- Add .github/workflows/security.yml
  - CodeQL scheduled weekly
  - npm audit scheduled weekly

### Phase 2. AWS Amplify hosting

Goal: Deploy static HomeOps frontend from GitHub, with branch builds and PR previews.

1) Connect Amplify to GitHub
- AWS Console -> Amplify -> Host web app
- Connect GitHub
- Select repo: homeops
- Select branch: main
- Build settings
  - Build command: npm run build
  - Output directory: dist
  - Or commit amplify.yml and let Amplify use it

2) Enable branch auto-creation
Amplify app settings:
- Enable automatic branch creation
- Patterns:
  - feature/*
  - bugfix/*
  - chore/*
- Enable automatic builds
- Enable pull request previews

3) Validate branch builds
- Create a branch: feature/first-preview
- Push a small commit
- Confirm Amplify creates a branch app and builds successfully

### Phase 3. Supabase setup

Goal: Replace mock data with Supabase, without changing UI components.

1) Create the Supabase project
- Create a new Supabase project
- Save:
  - Project URL
  - Anon key

2) Create the database table

Table name: entries

SQL you can run in the Supabase SQL editor:
```sql
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('fix','improvement','repair','todo')),
  title text not null,
  value numeric null,
  notes text null
);

create index if not exists entries_created_at_idx on public.entries (created_at desc);
create index if not exists entries_type_idx on public.entries (type);
```

3) Turn on Row Level Security
```sql
alter table public.entries enable row level security;
```

4) Add initial policies

Option A. Open read and insert for anon
Use this for fast prototyping.

```sql
create policy "entries_select_anon"
on public.entries
for select
to anon
using (true);

create policy "entries_insert_anon"
on public.entries
for insert
to anon
with check (true);
```

Option B. Auth required
Use this when you are ready for per-user data. This requires adding an owner column, auth, and stricter policies.

5) Add environment variables

Local, create .env.local
```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Do not commit .env.local.

6) Add the Supabase client

Create src/lib/supabase.ts
```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, anonKey)
```

7) Replace the mock service with Supabase

Replace src/services/entries.ts with something like:
```ts
import { supabase } from '../lib/supabase'
import { HomeOpsEntry } from '../types/entry'

export async function listEntries(): Promise<HomeOpsEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('id, created_at, type, title, value, notes')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as HomeOpsEntry[]
}
```

8) Add create entry support later
- Add a form page
- Validate inputs with Zod
- Call a service function createEntry that inserts into Supabase

### Phase 4. Deploy Supabase backed build to Amplify

1) Add Amplify environment variables
In Amplify console for main, then for branch previews if needed:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

2) Redeploy
- Push a commit that includes supabase client and service swap
- Confirm Amplify build passes and the app loads data from Supabase

### Phase 5. Hardening and quality improvements

Data and security
- Move from anon policies to authenticated policies when you need it
- Add per-user ownership if multiple users will use the same project
- Add rate limiting later by moving inserts behind an API, only if needed

UX and product
- Add list view with filters: fix, improvement, repair, todo
- Add status fields: planned, in-progress, done
- Add attachments later using Supabase Storage

Engineering
- Add a PR template
- Add a simple release tag flow if you want versioning

## Setup checklist

GitHub
- Repo created and pushed
- Branch protection on main
- CI required on PRs
- Dependabot on
- CodeQL on

AWS Amplify
- Connected to GitHub
- main builds and deploys
- Branch auto-creation enabled for feature, bugfix, chore
- PR previews enabled

Supabase
- Project created
- entries table created
- RLS enabled
- Policies set
- Env vars set locally and in Amplify
- Mock service swapped to Supabase service
