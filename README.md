# HomeOps

HomeOps is a simple system to track home improvements, fixes, repairs, and todos in one place.

## Local setup

1) Install deps

npm install

2) Configure environment variables

Create a `.env.local` file in the root directory:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project settings.

3) Run

npm run dev

## Scripts

- npm run lint
- npm run typecheck
- npm run test
- npm run build

## Contributing

Branch naming patterns:
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `chore/*` - Maintenance tasks

These patterns enable AWS Amplify to automatically create branch previews for pull requests.

## Deploy

This repo is deployed as a static app with AWS Amplify.

### Amplify Setup

**Recommended: Manual Setup First**

1. **Connect Amplify to GitHub:**
   - Go to AWS Console → Amplify → Host web app
   - Connect GitHub and authorize access
   - Select your repository: `HomeOps` (or `homeops`)
   - Select branch: `main`

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Amplify will automatically use `amplify.yml` if present

3. **Enable Branch Previews:**
   - Go to App settings → General
   - Enable "Branch auto-creation"
   - Add branch patterns: `feature/*`, `bugfix/*`, `chore/*`
   - Enable "Automatic builds" and "Pull request previews"

4. **Add Environment Variables:**
   - Go to App settings → Environment variables
   - Add `VITE_SUPABASE_URL` with your Supabase project URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key
   - These will be available to all branch previews

5. **Verify:**
   - Push a commit to `main` branch - should trigger a build
   - Create a `feature/*` branch - should auto-create a preview


