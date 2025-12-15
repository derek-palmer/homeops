import { LineChart } from '@tremor/react'
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-900">No data yet</p>
        <p className="mt-1 text-sm text-slate-600">
          Start tracking your home improvements to see them here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <LineChart
        data={chartData}
        index="date"
        categories={['value']}
        yAxisWidth={50}
        showAnimation={true}
        curveType="natural"
        colors={['slate']}
      />
    </div>
  )
}

