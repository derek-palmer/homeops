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

