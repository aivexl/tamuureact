const API_BASE = 'https://api.tamuu.id';

export async function getShopData() {
  const [carousel, categories, products, ads] = await Promise.all([
    fetch(`${API_BASE}/api/shop/carousel`, { next: { revalidate: 3600 } }).then(res => res.json()),
    fetch(`${API_BASE}/api/categories`, { next: { revalidate: 86400 } }).then(res => res.json()),
    fetch(`${API_BASE}/api/shop/products/discovery`, { next: { revalidate: 60 } }).then(res => res.json()),
    fetch(`${API_BASE}/api/shop/ads?position=FEATURED_PRODUCT_HOME`, { next: { revalidate: 300 } }).then(res => res.json())
  ]);

  return {
    slides: carousel.slides || [],
    categories: categories || [],
    products: products.products || [],
    featuredAds: ads.ads || []
  };
}
