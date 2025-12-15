import { Helmet } from 'react-helmet-async'

type MetaTagsProps = {
  title: string
  description: string
  image?: string
  url?: string
  type?: string
  keywords?: string
}

export function MetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords = 'home improvements, home repairs, home maintenance, todo tracker',
}: MetaTagsProps) {
  // Get current URL or use provided URL
  const currentUrl =
    url ||
    (typeof window !== 'undefined' && window.location ? window.location.href : '')
  const siteUrl =
    typeof window !== 'undefined' && window.location ? window.location.origin : ''
  
  // Use provided image or default placeholder
  const ogImage = image || `${siteUrl}/og-image.svg`
  // Ensure image URL is absolute
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="HomeOps" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Additional */}
      <meta name="theme-color" content="#0f172a" />
      <meta name="robots" content="index, follow" />
    </Helmet>
  )
}

