const API_BASE = 'https://api.tamuu.id';

export async function getShopData() {
  try {
    const [carouselRes, categoriesRes, productsRes, adsSpecialRes, adsBannerRes] = await Promise.all([
      fetch(`${API_BASE}/api/shop/carousel`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/api/categories`, { next: { revalidate: 86400 } }),
      fetch(`${API_BASE}/api/shop/products/discovery`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE}/api/shop/ads?position=SPECIAL_FOR_YOU_HOME`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE}/api/shop/ads?position=SHOP_SPECIAL_FOR_YOU`, { next: { revalidate: 300 } })
    ]);

    const carousel = await carouselRes.json();
    const categories = await categoriesRes.json();
    const products = await productsRes.json();
    const adsSpecial = await adsSpecialRes.json();
    const adsBanner = await adsBannerRes.json();

    return {
      slides: carousel.slides || [],
      categories: categories || [],
      products: products.products || products.items || [],
      specialAds: adsSpecial.ads || [],
      specialBanner: adsBanner.ads?.[0] || null
    };
  } catch (err) {
    console.error('[API getShopData] Error:', err);
    return { slides: [], categories: [], products: [], specialAds: [], specialBanner: null };
  }
}

export async function getBlogPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/blog?limit=6`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.posts || data.items || []);
  } catch (err) {
    console.error('[API getBlogPosts] Error:', err);
    return [];
  }
}

export async function trackAdClick(adId: string) {
  try {
    await fetch(`${API_BASE}/api/shop/ads/click/${adId}`, { method: 'POST' });
  } catch (err) {
    console.error('[API trackAdClick] Error:', err);
  }
}
