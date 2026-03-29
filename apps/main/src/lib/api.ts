const API_BASE = 'https://api.tamuu.id';

export async function getShopData() {
  // Use revalidate to act as staleTime (60 seconds)
  const [carousel, categories, products, ads] = await Promise.all([
    fetch(`${API_BASE}/api/shop/carousel`, { next: { revalidate: 60 } }).then(res => res.json()).catch(() => ({ slides: [] })),
    fetch(`${API_BASE}/api/categories`, { next: { revalidate: 3600 } }).then(res => res.json()).catch(() => []),
    fetch(`${API_BASE}/api/shop/products/discovery`, { next: { revalidate: 60 } }).then(res => res.json()).catch(() => ({ products: [] })),
    fetch(`${API_BASE}/api/shop/ads?position=FEATURED_PRODUCT_HOME`, { next: { revalidate: 300 } }).then(res => res.json()).catch(() => ({ ads: [] }))
  ]);

  return {
    slides: carousel?.slides || [],
    categories: categories || [],
    products: products?.products || [],
    featuredAds: ads?.ads || []
  };
}
