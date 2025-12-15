import { supabase } from '../lib/supabase'
import { HomeOpsEntry } from '../types/entry'
import { mockEntries } from './mockEntries'

export async function listEntries(): Promise<HomeOpsEntry[]> {
  // Fallback to mock data if Supabase is not configured (e.g., in tests or local dev without .env.local)
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  if (!url || !anonKey) {
    return Promise.resolve(mockEntries)
  }

  const { data, error } = await supabase
    .from('entries')
    .select('id, created_at, type, title, value, notes')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as HomeOpsEntry[]
}

