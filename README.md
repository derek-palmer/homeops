# HomeOps

HomeOps is a simple system to track home improvements, fixes, repairs, and todos in one place.

## Local setup

1) Install deps

npm install

2) Run

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

1. Connect Amplify to GitHub repo: `<username>/homeops`
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Amplify will use `amplify.yml` if present
3. Branch previews enabled for: `feature/*`, `bugfix/*`, `chore/*`

