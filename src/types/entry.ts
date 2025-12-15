export type EntryType = 'fix' | 'improvement' | 'repair' | 'todo'

export type HomeOpsEntry = {
  id: string
  created_at: string
  type: EntryType
  title: string
  value?: number
  notes?: string
}

export type NewEntryInput = {
  type: EntryType
  title: string
  value?: number
  notes?: string
}

