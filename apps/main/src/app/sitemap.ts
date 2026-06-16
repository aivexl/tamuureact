import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tamuu.id'
  
  // Basic static routes
  const routes = [
    '',
    '/about',
    '/support',
    '/terms',
    '/privacy',
    '/shop',
    '/blog',
    '/undangan-digital',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
