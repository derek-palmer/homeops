import { HomeOpsEntry } from '../types/entry'
import { mockEntries } from './mockEntries'

export async function listEntries(): Promise<HomeOpsEntry[]> {
  return Promise.resolve(mockEntries)
}

