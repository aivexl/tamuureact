const API_BASE = 'https://api.tamuu.id';

export async function getShopData() {
  try {
    const [carouselRes, categoriesRes, productsRes, adsSpecialRes, adsBannerRes, specialProductsRes, featuredProductsRes] = await Promise.all([
      fetch(`${API_BASE}/api/shop/carousel`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/api/categories`, { next: { revalidate: 86400 } }),
      fetch(`${API_BASE}/api/shop/products/discovery`, { next: { revalidate: 1800 } }),
      fetch(`${API_BASE}/api/shop/ads?position=SPECIAL_FOR_YOU_HOME`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/api/shop/ads?position=SHOP_SPECIAL_FOR_YOU`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/api/shop/products/special`, { next: { revalidate: 1800 } }),
      fetch(`${API_BASE}/api/shop/products/featured`, { next: { revalidate: 1800 } })
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

// ============================================
// BLOG API
// ============================================

export async function getBlogPosts(params: { limit?: number; offset?: number; category?: string } = {}) {
    try {
        const query = new URLSearchParams();
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.offset) query.append('offset', params.offset.toString());
        if (params.category) query.append('category', params.category);

        const res = await fetch(`${API_BASE}/api/blog?${query.toString()}`, { next: { revalidate: 600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.posts || data.items || []);
    } catch (err) {
        console.error('[API getBlogPosts] Error:', err);
        return [];
    }
}

export async function getBlogCategories() {
    try {
        const res = await fetch(`${API_BASE}/api/blog/categories`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('[API getBlogCategories] Error:', err);
        return [];
    }
}

export async function getBlogPost(slug: string) {
    try {
        const res = await fetch(`${API_BASE}/api/blog/post/${slug}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('[API getBlogPost] Error:', err);
        return null;
    }
}

export async function getRelatedPosts(postId: string) {
    try {
        const res = await fetch(`${API_BASE}/api/blog/related/${postId}`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error('[API getRelatedPosts] Error:', err);
        return [];
    }
}

export async function getBlogCarousel() {
    try {
        const res = await fetch(`${API_BASE}/api/blog/carousel`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('[API getBlogCarousel] Error:', err);
        return [];
    }
}

// Analytics (Client-side)
export async function trackBlogEvent(postId: string, event: 'view' | 'read') {
    try {
        await fetch(`${API_BASE}/api/blog/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, event_type: event })
        });
    } catch (e) {
        console.error('Analytics failed', e);
    }
}

// ============================================
// ADS TRACKING
// ============================================

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
