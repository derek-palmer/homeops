import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetaTags } from './MetaTags'

const meta = {
  title: 'Components/MetaTags',
  component: MetaTags,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title',
    },
    description: {
      control: 'text',
      description: 'Page description for SEO',
    },
    image: {
      control: 'text',
      description: 'OG image URL',
    },
    url: {
      control: 'text',
      description: 'Canonical URL',
    },
    type: {
      control: 'text',
      description: 'OG type (default: website)',
    },
    keywords: {
      control: 'text',
      description: 'SEO keywords',
    },
  },
} satisfies Meta<typeof MetaTags>

export default meta
type Story = StoryObj<typeof meta>

// Default story with all props
export const Default: Story = {
  args: {
    title: 'HomeOps Dashboard - Track Your Home Improvements',
    description:
      'View and manage your home improvements, fixes, repairs, and todos. Track spending trends and stay organized.',
    image: '/og-image.svg',
    url: 'https://homeops.example.com',
    type: 'website',
    keywords: 'home improvements, home repairs, home maintenance, todo tracker',
  },
  render: (args) => (
    <div>
      <MetaTags {...args} />
      <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
        <p>MetaTags component rendered. Check browser devtools &lt;head&gt; section to see meta tags.</p>
        <p><strong>Title:</strong> {args.title}</p>
        <p><strong>Description:</strong> {args.description}</p>
      </div>
    </div>
  ),
}

// Minimal story with required props only
export const Minimal: Story = {
  args: {
    title: 'HomeOps - Sign In',
    description: 'Sign in to HomeOps to track your home improvements, fixes, repairs, and todos in one place.',
  },
}

// Story with custom image
export const WithCustomImage: Story = {
  args: {
    title: 'HomeOps Dashboard - Track Your Home Improvements',
    description:
      'View and manage your home improvements, fixes, repairs, and todos. Track spending trends and stay organized.',
    image: 'https://example.com/custom-og-image.png',
    url: 'https://homeops.example.com/dashboard',
  },
}

// Story with custom URL
export const WithCustomUrl: Story = {
  args: {
    title: 'HomeOps Dashboard - Track Your Home Improvements',
    description:
      'View and manage your home improvements, fixes, repairs, and todos. Track spending trends and stay organized.',
    url: 'https://homeops.example.com/custom-page',
  },
}

// Story with article type
export const ArticleType: Story = {
  args: {
    title: 'How to Track Home Improvements',
    description: 'Learn how to effectively track and manage your home improvement projects.',
    type: 'article',
    url: 'https://homeops.example.com/articles/tracking-home-improvements',
  },
}

