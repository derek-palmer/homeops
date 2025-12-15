import type { Meta, StoryObj } from '@storybook/react-vite'
import { EntriesLineChart } from './EntriesLineChart'
import { mockEntries } from '../../services/mockEntries'
import { HomeOpsEntry } from '../../types/entry'

const meta = {
  title: 'Components/Charts/EntriesLineChart',
  component: EntriesLineChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of HomeOpsEntry objects to display in the chart',
    },
  },
} satisfies Meta<typeof EntriesLineChart>

export default meta
type Story = StoryObj<typeof meta>

// Default story with mock data
export const Default: Story = {
  args: {
    data: mockEntries,
  },
}

// Empty state - no data
export const Empty: Story = {
  args: {
    data: [],
  },
}

// Single entry
export const SingleEntry: Story = {
  args: {
    data: [
      {
        id: '1',
        created_at: '2025-01-15T10:00:00Z',
        type: 'improvement',
        title: 'Kitchen renovation',
        value: 1500,
        notes: 'New countertops installed',
      },
    ],
  },
}

// Multiple entries with values
export const MultipleEntries: Story = {
  args: {
    data: [
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
        created_at: '2025-01-05T09:00:00Z',
        type: 'repair',
        title: 'Leaky faucet',
        value: 120,
        notes: 'Replaced cartridge',
      },
      {
        id: '4',
        created_at: '2025-01-10T09:00:00Z',
        type: 'improvement',
        title: 'Window replacement',
        value: 850,
      },
      {
        id: '5',
        created_at: '2025-01-15T09:00:00Z',
        type: 'fix',
        title: 'Gutter cleaning',
        value: 75,
      },
    ],
  },
}

// Entries with some missing values (should be filtered out)
export const MixedEntries: Story = {
  args: {
    data: [
      {
        id: '1',
        created_at: '2025-01-01T09:00:00Z',
        type: 'improvement',
        title: 'Garage insulation',
        value: 42,
      },
      {
        id: '2',
        created_at: '2025-01-02T09:00:00Z',
        type: 'todo',
        title: 'Seal rim joists',
        // No value - should be filtered out
      },
      {
        id: '3',
        created_at: '2025-01-03T09:00:00Z',
        type: 'fix',
        title: 'Door seal',
        value: 45,
      },
      {
        id: '4',
        created_at: '2025-01-04T09:00:00Z',
        type: 'todo',
        title: 'Paint bedroom',
        // No value - should be filtered out
      },
    ],
  },
}

// Many entries for trend visualization
export const ManyEntries: Story = {
  args: {
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      created_at: new Date(2025, 0, i + 1, 9, 0, 0).toISOString(),
      type: (['fix', 'improvement', 'repair', 'todo'] as const)[i % 4],
      title: `Entry ${i + 1}`,
      value: Math.floor(Math.random() * 500) + 50,
    })) as HomeOpsEntry[],
  },
}

