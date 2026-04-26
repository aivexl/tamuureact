/**
 * Tamuu API Client (Next.js Universal Bridge)
 */
import { patchLegacyUrl, sanitizeValue } from './utils';
import { supabase } from './supabase';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id';

/**
 * CTO SECURITY: Get Token from Cookie (SSR Bridge)
 */
const getTokenFromCookie = () => {
    if (typeof document === 'undefined') return null;
    const name = "tamuu_token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    // Fallback for Next-Auth standard cookies
    const nextAuthSession = decodedCookie.split(';').find(c => c.trim().startsWith('next-auth.session-token=') || c.trim().startsWith('__Secure-next-auth.session-token='));
    if (nextAuthSession) return nextAuthSession.split('=')[1];
    
    return null;
};

/**
 * Enhanced Fetch Wrapper with timeout and error handling
 * Enterprise Hardening: Bridge Next.js SSR Auth with Vite
 */
export const safeFetch = async (url: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

    // CTO SECURITY: Multi-source Token Discovery
    let token = typeof window !== 'undefined' ? localStorage.getItem('tamuu_token') : null;
    if (!token) {
        token = getTokenFromCookie();
        if (token && typeof window !== 'undefined') {
            localStorage.setItem('tamuu_token', token);
        }
    }
    
    const headers = {
        ...options.headers,
        ...(token && { 'Authorization': `Bearer ${token.trim()}` })
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
            credentials: 'include'
        });
        clearTimeout(id);
        return response;
    } catch (e: any) {
        clearTimeout(id);
        if (e.name === 'AbortError') throw new Error('Request timeout');
        throw e;
    }
};

// ============================================
// NEXT.JS SPECIFIC SSR DATA FETCHING
// ============================================

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

// ============================================
// TEMPLATES API
// ============================================
export const templates = {
    async list(type: 'invitation' | 'display' = 'invitation') {
        const res = await safeFetch(`${API_BASE}/api/templates?type=${type}`);
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async get(id: string) {
        const res = await safeFetch(`${API_BASE}/api/templates/${id}`);
        if (!res.ok) throw new Error('Template not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async create(template: any) {
        const res = await safeFetch(`${API_BASE}/api/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(template))
        });
        return res.json();
    },

    async update(id: string, template: any) {
        const res = await safeFetch(`${API_BASE}/api/templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(template))
        });
        return res.json();
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/templates/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

// ============================================
// INVITATIONS API
// ============================================
export const invitations = {
    async list(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations?user_id=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch invitations');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async get(id: string) {
        const isUuid = id.includes('-') && id.length > 20;
        const endpoint = isUuid 
            ? `/api/invitations/${id}`
            : `/api/preview/${id}`;
            
        const res = await safeFetch(`${API_BASE}${endpoint}`);
        if (!res.ok) throw new Error('Invitation not found');
        let data = await res.json();
        if (endpoint.startsWith('/api/preview/') && data.data) {
            data = data.data;
        }
        return sanitizeValue(data);
    },

    async getBySlug(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/invitation/${slug}`);
        if (!res.ok) throw new Error('Invitation not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async create(invitation: any) {
        const res = await safeFetch(`${API_BASE}/api/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(invitation))
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create invitation');
        return data;
    },

    async update(id: string, invitation: any) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(invitation))
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update invitation');
        return data;
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

// ============================================
// RSVP API
// ============================================
export const rsvp = {
    async list(invitationId: string) {
        const res = await safeFetch(`${API_BASE}/api/rsvp?invitation_id=${invitationId}`);
        if (!res.ok) throw new Error('Failed to fetch RSVP list');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async submit(invitationId: string | any, data?: any) {
        const finalData = data ? { invitation_id: invitationId, ...data } : invitationId;
        const res = await safeFetch(`${API_BASE}/api/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(finalData))
        });
        return res.json();
    }
};

// ============================================
// USERS API
// ============================================
export const users = {
    async getProfile(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/auth/me?uid=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async updateProfile(userId: string | any, profile?: any) {
        const id = profile ? userId : (userId.id || userId.userId);
        const data = profile || userId;
        const res = await safeFetch(`${API_BASE}/api/user/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue({ ...data, id }))
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.error || 'Failed to update profile');
        return responseData;
    }
};

// ============================================
// SHOP API (TAMUU NEXUS)
// ============================================
export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    user_name?: string;
    rating: number;
    comment: string;
    created_at: string;
}

export interface Product {
    id: string;
    vendor_id: string;
    nama_produk: string;
    deskripsi: string;
    harga_estimasi: number;
    status: string;
    kategori_produk: string;
    kota: string;
    slug: string;
    images?: { image_url: string }[];
    nama_toko?: string;
    vendor_slug?: string;
    logo_url?: string;
    wishlist_count?: number;
    avg_rating?: number;
    review_count?: number;
    is_special?: number;
    is_featured?: number;
    is_landing_featured?: number;
    is_admin_listing?: number;
    custom_store_name?: string;
    whatsapp?: string;
    phone?: string;
    instagram?: string;
    facebook?: string;
    x_url?: string;
    website?: string;
    alamat_lengkap?: string;
    google_maps_url?: string;
    kontak_utama?: 'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'tiktok' | 'x' | 'youtube' | 'website' | 'tokopedia' | 'shopee' | 'chat' | 'tiktokshop';
}

export const shop = {
    async getVendorMe(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/vendor/me?userId=${userId}&_t=${Date.now()}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch vendor profile');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getVendorProducts(vendorId: string) {
        if (!vendorId) return [];
        const res = await safeFetch(`${API_BASE}/api/shop/vendor/products?vendor_id=${vendorId}&_t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch vendor products');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getProductReviews(productId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/${productId}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch product reviews');
        const data = await res.json();
        return sanitizeValue(data.reviews || []);
    },

    async getVendorStats(vendorId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/vendor/stats?vendor_id=${vendorId}`);
        const data = await res.json();
        return sanitizeValue(data.stats);
    },

    async getRecommendations(productId: string, category: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/recommendations?product_id=${productId}&category=${encodeURIComponent(category)}`);
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getProduct(id: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/product?id=${id}&_t=${Date.now()}`);
        const data = await res.json();
        return sanitizeValue(data.product);
    },

    async getCarousel() {
        const res = await safeFetch(`${API_BASE}/api/shop/carousel`);
        const data = await res.json();
        return sanitizeValue(data.slides || []);
    },

    async getAds(position?: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/ads?position=${position || ''}`);
        const data = await res.json();
        return sanitizeValue(data.ads || []);
    },

    async getPopups(placement?: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/popups${placement ? `?placement=${placement}` : ''}`);
        const data = await res.json();
        return sanitizeValue(data.popups || []);
    },

    async track(vendorId: string, actionType: string, productId?: string) {
        try {
            await safeFetch(`${API_BASE}/api/shop/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: vendorId, action_type: actionType, product_id: productId })
            });
        } catch (e) {}
    },

    async getWishlist(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/wishlist?user_id=${userId}`);
        const data = await res.json();
        return sanitizeValue(data.wishlist || []);
    },

    async getSystemSettings() {
        const res = await safeFetch(`${API_BASE}/api/system/settings`);
        if (!res.ok) return { settings: { global_chat_mode: 'whatsapp' } };
        return res.json();
    },

    async toggleWishlist(userId: string, productId: string, email?: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/wishlist/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, email })
        });
        return res.json();
    },

    async submitReport(data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async submitReview(productId: string, data: { rating: number; comment: string }, token: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to submit review');
        }
        return res.json();
    },

    async getStorefront(slug: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/shop/storefront?slug=${slug}`, { headers });
        if (!res.ok) throw new Error('Storefront not found');
        const data = await res.json();
        return sanitizeValue(data);
    }
};

// ============================================
// ADMIN API
// ============================================
export const admin = {
    async getShopReports(token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/reports`, { headers });
        if (!res.ok) throw new Error('Failed to fetch shop reports');
        const data = await res.json();
        return sanitizeValue(data.reports || []);
    },

    async updateShopReportStatus(reportId: string, status: string, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/reports/${reportId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update report status');
        return res.json();
    },

    async adminListVendors(token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/vendors`, { headers });
        if (!res.ok) throw new Error('Failed to fetch vendors');
        const data = await res.json();
        return sanitizeValue(data.vendors || []);
    },

    async updateVendor(id: string, data: any, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/vendors/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update vendor');
        return await res.json();
    },

    async updateVendorBalance(id: string, payload: { amount: number, action: 'add' | 'subtract' | 'set' }, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/vendors/${id}/balance`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update vendor balance');
        return await res.json();
    }
};

// Default export for easy migration
export default {
    templates,
    invitations,
    rsvp,
    users,
    admin,
    shop,
    getShopData,
    getBlogPosts,
    getBlogPost,
    getBlogCategories,
    trackAdClick,
    trackAdView,
    API_BASE
};
