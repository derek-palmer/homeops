import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MetaTags } from '../src/components/MetaTags'

describe('MetaTags Component', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // Set up window.location mock
    delete (window as any).location
    window.location = {
      href: 'https://example.com',
      origin: 'https://example.com',
    } as Location
  })

  afterEach(() => {
    // Restore original location
    window.location = originalLocation
  })

  const renderWithHelmet = (component: React.ReactElement) => {
    return render(<HelmetProvider>{component}</HelmetProvider>)
  }

  describe('Basic SEO Meta Tags', () => {
    it('renders title tag', async () => {
      renderWithHelmet(<MetaTags title="Test Title" description="Test description" />)
      await waitFor(() => {
        expect(document.querySelector('title')?.textContent).toBe('Test Title')
      })
    })

    it('renders description meta tag', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="description"]')
        expect(meta?.getAttribute('content')).toBe('Test description')
      })
    })

    it('renders keywords meta tag with default value', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="keywords"]')
        expect(meta?.getAttribute('content')).toBe(
          'home improvements, home repairs, home maintenance, todo tracker',
        )
      })
    })

    it('renders custom keywords when provided', async () => {
      renderWithHelmet(
        <MetaTags
          title="Test"
          description="Test description"
          keywords="custom, keywords"
        />,
      )
      await waitFor(() => {
        const meta = document.querySelector('meta[name="keywords"]')
        expect(meta?.getAttribute('content')).toBe('custom, keywords')
      })
    })

    it('renders canonical URL', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const link = document.querySelector('link[rel="canonical"]')
        expect(link?.getAttribute('href')).toBe('https://example.com')
      })
    })

    it('uses provided URL for canonical when available', async () => {
      renderWithHelmet(
        <MetaTags title="Test" description="Test description" url="https://custom.com/page" />,
      )
      await waitFor(() => {
        const link = document.querySelector('link[rel="canonical"]')
        expect(link?.getAttribute('href')).toBe('https://custom.com/page')
      })
    })
  })

  describe('OpenGraph Meta Tags', () => {
    it('renders og:title', async () => {
      renderWithHelmet(<MetaTags title="OG Title" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:title"]')
        expect(meta?.getAttribute('content')).toBe('OG Title')
      })
    })

    it('renders og:description', async () => {
      renderWithHelmet(<MetaTags title="Test" description="OG Description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:description"]')
        expect(meta?.getAttribute('content')).toBe('OG Description')
      })
    })

    it('renders og:image with default placeholder', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:image"]')
        expect(meta?.getAttribute('content')).toBe('https://example.com/og-image.svg')
      })
    })

    it('renders og:image with custom image', async () => {
      renderWithHelmet(
        <MetaTags title="Test" description="Test description" image="/custom-image.png" />,
      )
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:image"]')
        expect(meta?.getAttribute('content')).toBe('https://example.com/custom-image.png')
      })
    })

    it('uses absolute URL for og:image when provided', async () => {
      renderWithHelmet(
        <MetaTags
          title="Test"
          description="Test description"
          image="https://external.com/image.png"
        />,
      )
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:image"]')
        expect(meta?.getAttribute('content')).toBe('https://external.com/image.png')
      })
    })

    it('renders og:url', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:url"]')
        expect(meta?.getAttribute('content')).toBe('https://example.com')
      })
    })

    it('renders og:type with default value', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:type"]')
        expect(meta?.getAttribute('content')).toBe('website')
      })
    })

    it('renders og:type with custom value', async () => {
      renderWithHelmet(
        <MetaTags title="Test" description="Test description" type="article" />,
      )
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:type"]')
        expect(meta?.getAttribute('content')).toBe('article')
      })
    })

    it('renders og:site_name', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:site_name"]')
        expect(meta?.getAttribute('content')).toBe('HomeOps')
      })
    })

    it('renders og:locale', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:locale"]')
        expect(meta?.getAttribute('content')).toBe('en_US')
      })
    })
  })

  describe('Twitter Card Meta Tags', () => {
    it('renders twitter:card', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="twitter:card"]')
        expect(meta?.getAttribute('content')).toBe('summary_large_image')
      })
    })

    it('renders twitter:title', async () => {
      renderWithHelmet(<MetaTags title="Twitter Title" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="twitter:title"]')
        expect(meta?.getAttribute('content')).toBe('Twitter Title')
      })
    })

    it('renders twitter:description', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Twitter Description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="twitter:description"]')
        expect(meta?.getAttribute('content')).toBe('Twitter Description')
      })
    })

    it('renders twitter:image with default placeholder', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="twitter:image"]')
        expect(meta?.getAttribute('content')).toBe('https://example.com/og-image.svg')
      })
    })

    it('renders twitter:image with custom image', async () => {
      renderWithHelmet(
        <MetaTags title="Test" description="Test description" image="/custom.png" />,
      )
      await waitFor(() => {
        const meta = document.querySelector('meta[name="twitter:image"]')
        expect(meta?.getAttribute('content')).toBe('https://example.com/custom.png')
      })
    })
  })

  describe('Additional Meta Tags', () => {
    it('renders theme-color', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="theme-color"]')
        expect(meta?.getAttribute('content')).toBe('#0f172a')
      })
    })

    it('renders robots meta tag', async () => {
      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      await waitFor(() => {
        const meta = document.querySelector('meta[name="robots"]')
        expect(meta?.getAttribute('content')).toBe('index, follow')
      })
    })
  })

  describe('URL Handling', () => {
    it('handles missing window.location gracefully', async () => {
      // Temporarily remove window.location
      const savedLocation = window.location
      delete (window as any).location

      renderWithHelmet(<MetaTags title="Test" description="Test description" />)
      
      // Should still render without errors - uses empty string fallback
      await waitFor(() => {
        expect(document.querySelector('title')?.textContent).toBe('Test')
      })
      
      // Restore
      window.location = savedLocation
    })

    it('constructs absolute image URL from relative path', async () => {
      renderWithHelmet(
        <MetaTags title="Test" description="Test description" image="/relative/path.png" />,
      )
      await waitFor(() => {
        const meta = document.querySelector('meta[property="og:image"]')
        expect(meta?.getAttribute('content')).toBe('https://example.com/relative/path.png')
      })
    })
  })
})

