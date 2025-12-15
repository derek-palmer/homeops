# HomeOps repo scaffold

Track home improvements, fixes, repairs, and todos in one place.

## 1. Create the project

1) Create a Vite React TypeScript app.

```bash
mkdir HomeOps
cd HomeOps
npm create vite@latest . -- --template react-ts
npm install
```

2) Install app dependencies.

```bash
npm install @tremor/react @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install clsx tailwind-merge
```

3) Install dev tooling.

```bash
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint prettier
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D typescript
```

4) Initialize Tailwind.

```bash
npx tailwindcss init -p
```

## 2. Optional UI setup

If you want shadcn/ui:

```bash
npx shadcn@latest init
```

Notes:
- Pick Tailwind when prompted.
- Keep src/ as your base.
- You can add components later, for example:
  - `npx shadcn@latest add button card input label`

## 3. Folder structure

Create these folders and files.

```text
HomeOps/
  .github/
    workflows/
      ci.yml
      security.yml
  src/
    components/
      charts/
      ui/
    lib/
    pages/
    services/
    types/
  tests/
  agents.md
  amplify.yml
  eslint.config.js
  prettier.config.cjs
  tailwind.config.ts
  vite.config.ts
  README.md
```

## 4. Update Tailwind config

Replace `tailwind.config.ts` with this.

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

## 5. Global styles

Replace `src/index.css` with this.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@tremor/react/dist/esm/tremor.css";
```

## 6. Types

Create `src/types/entry.ts`.

```ts
export type EntryType = 'fix' | 'improvement' | 'repair' | 'todo'

export type HomeOpsEntry = {
  id: string
  created_at: string
  type: EntryType
  title: string
  value?: number
  notes?: string
}
```

## 7. Mock data

Create `src/services/mockEntries.ts`.

```ts
import { HomeOpsEntry } from '../types/entry'

export const mockEntries: HomeOpsEntry[] = [
  {
    id: '1',
    created_at: '2025-01-01T09:00:00Z',
    type: 'improvement',
    title: 'Garage insulation',
    value: 42,
    notes: 'Added rigid foam',
  },
  {
    id: '2',
    created_at: '2025-01-02T09:00:00Z',
    type: 'fix',
    title: 'Door seal',
    value: 45,
  },
  {
    id: '3',
    created_at: '2025-01-03T09:00:00Z',
    type: 'todo',
    title: 'Seal rim joists',
    notes: 'Add to weekend list',
  },
]
```

## 8. Service layer

Create `src/services/entries.ts`.

This is the only file you will swap later when you wire Supabase.

```ts
import { HomeOpsEntry } from '../types/entry'
import { mockEntries } from './mockEntries'

export async function listEntries(): Promise<HomeOpsEntry[]> {
  return Promise.resolve(mockEntries)
}
```

## 9. Chart component

Create `src/components/charts/EntriesLineChart.tsx`.

```tsx
import { Card, LineChart } from '@tremor/react'
import { HomeOpsEntry } from '../../types/entry'

type Props = {
  data: HomeOpsEntry[]
}

export function EntriesLineChart({ data }: Props) {
  const chartData = data
    .filter(d => typeof d.value === 'number')
    .map(d => ({
      date: d.created_at.split('T')[0],
      value: d.value as number,
    }))

  if (chartData.length === 0) {
    return <Card>No data yet</Card>
  }

  return (
    <Card>
      <LineChart data={chartData} index="date" categories={['value']} yAxisWidth={40} />
    </Card>
  )
}
```

## 10. Dashboard page

Create `src/pages/Dashboard.tsx`.

```tsx
import { useEffect, useState } from 'react'
import { EntriesLineChart } from '../components/charts/EntriesLineChart'
import { listEntries } from '../services/entries'
import { HomeOpsEntry } from '../types/entry'

export default function Dashboard() {
  const [entries, setEntries] = useState<HomeOpsEntry[]>([])

  useEffect(() => {
    listEntries().then(setEntries)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">HomeOps Dashboard</h1>
      <EntriesLineChart data={entries} />
    </div>
  )
}
```

## 11. Wire the app

Replace `src/App.tsx` with this.

```tsx
import Dashboard from './pages/Dashboard'

export default function App() {
  return <Dashboard />
}
```

Replace `src/main.tsx` with this.

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 12. Vite config

Replace `vite.config.ts` with this.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

## 13. Scripts

Update `package.json` scripts to include these.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier . --write",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 14. ESLint

Create `eslint.config.js`.

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
```

Install the ESLint peer deps used above.

```bash
npm install -D @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh typescript-eslint
```

## 15. Prettier

Create `prettier.config.cjs`.

```js
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
}
```

## 16. Vitest setup

Create `src/test/setup.ts`.

```ts
import '@testing-library/jest-dom'
```

Update `vite.config.ts` to include test config.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

Create a basic test at `tests/smoke.test.tsx`.

```tsx
import { render, screen } from '@testing-library/react'
import App from '../src/App'

test('renders HomeOps dashboard title', () => {
  render(<App />)
  expect(screen.getByText('HomeOps Dashboard')).toBeInTheDocument()
})
```

## 17. GitHub Actions

Create `.github/workflows/ci.yml`.

```yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Typecheck
        run: npm run typecheck
      - name: Test
        run: npm run test
      - name: Build
        run: npm run build
```

Create `.github/workflows/security.yml`.

```yml
name: Security

on:
  schedule:
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3

  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm audit --audit-level=high
```

## 18. Amplify config

Create `amplify.yml`.

```yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## 19. agents.md

Create `agents.md` and paste the locked rules for Supabase and Amplify hosting only.

Minimum additions for HomeOps branding.

- Repo name: HomeOps
- Purpose: track improvements, fixes, repairs, and todos

## 20. README

Create `README.md`.

```md
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

## Deploy

This repo is deployed as a static app with AWS Amplify.
```

## 21. Run it

```bash
npm run dev
```

## 22. Next step when you are ready

Later, replace `src/services/entries.ts` with a Supabase backed implementation.
Do not change your UI components when you do that.
