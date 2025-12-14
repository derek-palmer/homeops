// Tailwind v4 uses automatic content detection
// This config file is optional but kept for compatibility
// Content paths are automatically detected in v4
export default {
  // v4 automatically detects content, but we can still specify if needed
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
}

