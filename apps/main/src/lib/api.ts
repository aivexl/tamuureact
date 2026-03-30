const API_BASE = 'https://api.tamuu.id';

export async function getShopData() {
  try {
    const [carouselRes, categoriesRes, productsRes, adsSpecialRes, adsBannerRes, specialProductsRes, featuredProductsRes] = await Promise.all([
      fetch(`${API_BASE}/api/shop/carousel`),
      fetch(`${API_BASE}/api/categories`),
      fetch(`${API_BASE}/api/shop/products/discovery`),
      fetch(`${API_BASE}/api/shop/ads?position=SPECIAL_FOR_YOU_HOME`),
      fetch(`${API_BASE}/api/shop/ads?position=SHOP_SPECIAL_FOR_YOU`),
      fetch(`${API_BASE}/api/shop/products/special`),
      fetch(`${API_BASE}/api/shop/products/featured`)
    ]);

    const carousel = await carouselRes.json();
    const categories = await categoriesRes.json();
    const products = await productsRes.json();
    const adsSpecial = await adsSpecialRes.json();
    const adsBanner = await adsBannerRes.json();
    const specialProducts = await specialProductsRes.json();
    const featuredProducts = await featuredProductsRes.json();

    return {
      slides: carousel.slides || [],
      categories: categories || [],
      products: products.products || products.items || [],
      specialAds: adsSpecial.ads || [],
      specialBanner: adsBanner.ads?.[0] || null,
      specialProducts: specialProducts.products || specialProducts || [],
      featuredProducts: featuredProducts.products || featuredProducts || []
    };
  } catch (err) {
    console.error('[API getShopData] Error:', err);
    return { slides: [], categories: [], products: [], specialAds: [], specialBanner: null, specialProducts: [], featuredProducts: [] };
  }
}

export async function getBlogPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/blog?limit=6`);
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

export async function trackAdView(adId: string) {
  try {
    await fetch(`${API_BASE}/api/shop/ads/view/${adId}`, { method: 'POST' });
  } catch (err) {
    console.error('[API trackAdView] Error:', err);
  }
}
