import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { createEntry, listEntries } from '../src/services/entries'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('../src/lib/supabase', () => {
  const auth = {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  }

  return {
    supabase: {
      auth,
      from: mockFrom,
    },
  }
})

const envBackup = { ...import.meta.env }

const setEnv = (values: Record<string, string>) => {
  Object.assign(import.meta.env as unknown as Record<string, string>, values)
}

const sampleEntries = [
  {
    id: 'e1',
    created_at: '2025-01-01T00:00:00Z',
    type: 'fix',
    title: 'Test entry',
    value: 10,
    notes: 'sample',
  },
]

const createdEntry = {
  id: 'e2',
  created_at: '2025-01-02T00:00:00Z',
  type: 'improvement' as const,
  title: 'New item',
  value: 25,
  notes: 'inserted',
}

const stubSupabaseFrom = () => {
  const order = vi.fn().mockResolvedValue({ data: sampleEntries, error: null })
  const select = vi.fn(() => ({ order }))

  const single = vi.fn().mockResolvedValue({ data: createdEntry, error: null })
  const selectAfterInsert = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select: selectAfterInsert }))

  mockFrom.mockReturnValue({
    select,
    order,
    insert,
  })

  return { select, order, insert, selectAfterInsert, single }
}

beforeEach(() => {
  setEnv({
    ...(envBackup as Record<string, string>),
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  })
  mockFrom.mockReset()
})

afterEach(() => {
  setEnv(envBackup as Record<string, string>)
  vi.clearAllMocks()
})

describe('supabase authenticated smoke tests', () => {
  it('reads entries when Supabase env is present', async () => {
    const { select, order } = stubSupabaseFrom()

    const result = await listEntries()

    expect(mockFrom).toHaveBeenCalledWith('entries')
    expect(select).toHaveBeenCalledWith('id, created_at, type, title, value, notes')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(result).toEqual(sampleEntries)
  })

  it('inserts an entry and returns the created row', async () => {
    const { insert, selectAfterInsert, single } = stubSupabaseFrom()

    const result = await createEntry({
      type: 'improvement',
      title: 'New item',
      value: 25,
      notes: 'inserted',
    })

    expect(mockFrom).toHaveBeenCalledWith('entries')
    expect(insert).toHaveBeenCalledWith([
      { type: 'improvement', title: 'New item', value: 25, notes: 'inserted' },
    ])
    expect(selectAfterInsert).toHaveBeenCalledWith('id, created_at, type, title, value, notes')
    expect(single).toHaveBeenCalled()
    expect(result).toEqual(createdEntry)
  })
})

