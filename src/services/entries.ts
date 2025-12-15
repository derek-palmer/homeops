import { supabase } from '../lib/supabase'
import { HomeOpsEntry, NewEntryInput } from '../types/entry'
import { mockEntries } from './mockEntries'

const hasSupabaseEnv = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

export async function listEntries(): Promise<HomeOpsEntry[]> {
  // Fallback to mock data if Supabase is not configured (e.g., in tests or local dev without .env.local)
  if (!hasSupabaseEnv()) {
    return Promise.resolve(mockEntries)
  }

  const { data, error } = await supabase
    .from('entries')
    .select('id, created_at, type, title, value, notes')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as HomeOpsEntry[]
}

export async function createEntry(input: NewEntryInput): Promise<HomeOpsEntry> {
  if (!hasSupabaseEnv()) {
    throw new Error('Supabase environment variables are required for creating entries')
  }

  const { data, error } = await supabase
    .from('entries')
    .insert([input])
    .select('id, created_at, type, title, value, notes')
    .single()

  if (error) throw error
  return data as HomeOpsEntry
}

