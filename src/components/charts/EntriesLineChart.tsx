import { Card, LineChart } from '@tremor/react'
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
    return <Card>No data yet</Card>
  }

  return (
    <Card>
      <LineChart data={chartData} index="date" categories={['value']} yAxisWidth={40} />
    </Card>
  )
}

