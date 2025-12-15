import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Only throw error in production builds, allow tests to run with mock data
if ((!url || !anonKey) && import.meta.env.MODE === 'production') {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
  )
}

// Create client with fallback values for development/testing
export const supabase =
  url && anonKey
    ? createClient(url, anonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key')

