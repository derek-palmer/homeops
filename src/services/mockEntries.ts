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

