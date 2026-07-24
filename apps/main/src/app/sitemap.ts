import { MetadataRoute } from 'next';

// [ENTERPRISE STANDARD] Set ISR (Incremental Static Regeneration) ke 1 jam (3600 detik)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://tamuu.id';
  const API_URL = 'https://api.tamuu.id/api';

  // 1. Static Routes (Solid Foundation)
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/support',
    '/terms',
    '/privacy',
    '/shop',
    '/blog',
    '/undangan-digital',
    '/undangan-digital/lokasi',
    '/katalog',
    '/vendor'
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // 2. Fetch Dynamic Data (Matrix SEO)
    const [vendorsRes, articlesRes] = await Promise.allSettled([
      fetch(`${API_URL}/admin/shop/vendors`, { next: { revalidate: 3600 } }), // Use admin list for thoroughness
      fetch(`${API_URL}/blog`, { next: { revalidate: 3600 } })
    ]);

    let dynamicRoutes: MetadataRoute.Sitemap = [];

    // 3. Process Blog Posts
    if (articlesRes.status === 'fulfilled' && articlesRes.value.ok) {
      const posts = await articlesRes.value.json();
      if (Array.isArray(posts)) {
        const routes = posts.map((post: any) => ({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.published_at || post.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
        dynamicRoutes = [...dynamicRoutes, ...routes];
      }
    }

    // 4. Process Vendors
    if (vendorsRes.status === 'fulfilled' && vendorsRes.value.ok) {
      const vendorData = await vendorsRes.value.json();
      const items = vendorData.vendors || vendorData;
      if (Array.isArray(items)) {
        const routes = items.map((v: any) => ({
          url: `${BASE_URL}/shop/${v.slug}`,
          lastModified: new Date(v.updated_at || v.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
        dynamicRoutes = [...dynamicRoutes, ...routes];
      }
    }

    // [MATRIX SEO COMMENTED OUT FOR DIAGNOSTICS]
    /*
    if (citiesRes.status === 'fulfilled' && citiesRes.value.ok) {
      const cities = await citiesRes.value.json();
      if (Array.isArray(cities)) {
        // ... (routes)
      }
    }
    */

    // 6. Combine & Return
    return [...staticRoutes, ...dynamicRoutes];

  } catch (error) {
    console.error("Critical Error [SEO]:", error);
    return staticRoutes;
  }
}
