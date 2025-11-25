import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://putcall.nl'
  
  // Add more URLs as you create pages
  const routes = [
    '',
    '/about',
    '/blog',
    // Add stock pages when you create them
    // '/stocks/nvda',
    // '/stocks/tsla',
    // etc.
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
