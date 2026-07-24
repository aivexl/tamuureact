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
    const [vendorsRes, articlesRes, citiesRes] = await Promise.allSettled([
      fetch(`${API_URL}/admin/shop/vendors`, { next: { revalidate: 3600 } }), // Use admin list for thoroughness
      fetch(`${API_URL}/blog`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/cities/active`, { next: { revalidate: 3600 } })
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

    // 5. Matrix SEO Strategy (Category x City)
    if (citiesRes.status === 'fulfilled' && citiesRes.value.ok) {
      const cities = await citiesRes.value.json();
      if (Array.isArray(cities)) {
        // A. Product City Routes (/undangan-digital/[city])
        const cityProductRoutes = cities.map((city: any) => ({
          url: `${BASE_URL}/undangan-digital/${city.city_name.toLowerCase().replace(/\s+/g, '-')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
        dynamicRoutes = [...dynamicRoutes, ...cityProductRoutes];

        // B. Matrix Categories (/katalog/[category]/[city])
        // [ENTERPRISE] Strategi Dominasi Total Event & Wedding Nasional
        const CATEGORIES = [
            { name: 'Wedding Organizer', slug: 'wedding-organizer' },
            { name: 'MUA', slug: 'mua' },
            { name: 'Fotografer', slug: 'fotografer' },
            { name: 'Catering', slug: 'catering' },
            { name: 'Gedung Pernikahan', slug: 'gedung' },
            { name: 'Venue Acara', slug: 'venue' },
            { name: 'Dekorasi Pelaminan', slug: 'dekorasi' },
            { name: 'Seserahan', slug: 'seserahan' },
            { name: 'Maskawin', slug: 'maskawin' },
            { name: 'Bucket Bunga', slug: 'bucket-bunga' },
            { name: 'Stall & Pondokan', slug: 'stall' },
            { name: 'Sewa Baju Pengantin', slug: 'sewa-baju-pengantin' },
            { name: 'Baju Pengantin Jawa', slug: 'sewa-baju-pengantin-jawa' },
            { name: 'Baju Pengantin Sunda', slug: 'sewa-baju-pengantin-sunda' },
            { name: 'Baju Pengantin Bali', slug: 'sewa-baju-pengantin-bali' },
            { name: 'Sewa Mobil Pengantin', slug: 'sewa-mobil-pengantin' },
            { name: 'Sewa Tenda Pengantin', slug: 'sewa-tenda-pengantin' },
            { name: 'Sewa Panggung', slug: 'sewa-panggung' },
            { name: 'Sound Sistem', slug: 'sound-sistem' },
            { name: 'MC Pernikahan', slug: 'mc' },
            { name: 'Wedding Coordinator', slug: 'wcc' },
            { name: 'Paket Lamaran', slug: 'paket-lamaran' },
            { name: 'Event Organizer', slug: 'event-organizer' },
            { name: 'Vendor Konser', slug: 'vendor-konser' }
        ];

        const matrixRoutes: any[] = [];
        CATEGORIES.forEach(cat => {
            cities.forEach((city: any) => {
                matrixRoutes.push({
                    url: `${BASE_URL}/katalog/${cat.slug}/${city.city_name.toLowerCase().replace(/\s+/g, '-')}`,
                    lastModified: new Date(),
                    changeFrequency: 'monthly' as const,
                    priority: 0.5,
                });
            });
        });
        
        dynamicRoutes = [...dynamicRoutes, ...matrixRoutes];
      }
    }

    // 6. Combine & Return
    return [...staticRoutes, ...dynamicRoutes];

  } catch (error) {
    console.error("Critical Error [SEO]:", error);
    return staticRoutes;
  }
}
