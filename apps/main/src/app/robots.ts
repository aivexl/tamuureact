import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Cegah Googlebot meng-crawl API internal atau folder sistem Next.js
      disallow: ['/api/', '/_next/'], 
    },
    sitemap: 'https://tamuu.id/sitemap.xml',
  };
}