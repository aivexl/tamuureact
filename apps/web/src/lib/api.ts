/**
 * Tamuu API Client
 * Replaces Supabase client with Cloudflare-based API
 */
import { patchLegacyUrl, sanitizeValue } from './utils';

export const API_BASE = import.meta.env.PROD
    ? 'https://api.tamuu.id'
    : ''; // Vite proxy handles this in dev

/**
 * Enhanced Fetch Wrapper with timeout and error handling
 */
export const safeFetch = async (url: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
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
    },

    async adminList() {
        const res = await safeFetch(`${API_BASE}/api/admin/templates`);
        const data = await res.json();
        return sanitizeValue(data);
    },

    async adminCreate(template: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(template))
        });
        return res.json();
    },

    async adminUpdate(id: string, template: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(template))
        });
        return res.json();
    },

    async adminDelete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/templates/${id}`, {
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
        const res = await safeFetch(`${API_BASE}/api/invitations/${id}`);
        if (!res.ok) throw new Error('Invitation not found');
        const data = await res.json();
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
    },

    async checkSlug(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations/check-slug?slug=${slug}`);
        return res.json();
    }
};

// ============================================
// USER DISPLAY DESIGNS API
// ============================================
export const userDisplayDesigns = {
    async list(userId: string | { userId: string }) {
        const id = typeof userId === 'string' ? userId : userId.userId;
        const res = await safeFetch(`${API_BASE}/api/user-display-designs?user_id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch display designs');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async get(id: string) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs/${id}`);
        if (!res.ok) throw new Error('Display design not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async create(design: any) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(design))
        });
        return res.json();
    },

    async update(id: string, design: any) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(design))
        });
        return res.json();
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs/${id}`, {
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

    async listAll() {
        const res = await safeFetch(`${API_BASE}/api/rsvp`);
        const data = await res.json();
        return sanitizeValue(data);
    },

    async submit(invitationId: string | any, data?: any) {
        // Handle both (invitationId, data) and (data) signatures
        const finalData = data ? { invitation_id: invitationId, ...data } : invitationId;
        const res = await safeFetch(`${API_BASE}/api/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(finalData))
        });
        return res.json();
    },

    async updateStatus(id: string, updates: any) {
        const res = await safeFetch(`${API_BASE}/api/rsvp/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/rsvp/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

// ============================================
// STORAGE API (R2 / Cloudflare)
// ============================================
export const storage = {
    async upload(file: File, folder: string = 'assets', options: any = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        if (options.userId) formData.append('userId', options.userId);
        if (options.templateId) formData.append('templateId', options.templateId);

        const res = await safeFetch(`${API_BASE}/api/storage/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Upload failed');
        }

        const data = await res.json();
        return sanitizeValue(data);
    },

    async delete(url: string) {
        const filename = url.split('/').pop();
        const res = await safeFetch(`${API_BASE}/api/storage/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });
        return res.json();
    }
};

// ============================================
// USERS API
// ============================================
export const users = {
    async getProfile(userId: string) {
        // Redirect to getMe as we don't have a separate profile by ID endpoint yet
        // and typically user already has email in store
        const res = await safeFetch(`${API_BASE}/api/auth/me?uid=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getMe(email: string, extra?: any) {
        const params = new URLSearchParams({ email, ...extra });
        const res = await safeFetch(`${API_BASE}/api/auth/me?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch user data');
        return res.json();
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
// BILLING API
// ============================================
export const billing = {
    async createTransaction(data: any) {
        const res = await safeFetch(`${API_BASE}/api/billing/midtrans/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.error || 'Failed to create transaction');
        return responseData;
    },

    async getMidtransToken(data: any) {
        return this.createTransaction(data);
    },

    async getHistory(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/billing/history?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch billing history');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async listTransactions(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/transactions?userId=${userId}`);
        return res.json();
    },

    async cancelTransaction(orderId: string, userId: string) {
        const res = await safeFetch(`${API_BASE}/api/billing/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, userId })
        });
        return res.json();
    },

    async createInvoice(data: any) {
        const res = await safeFetch(`${API_BASE}/api/billing/invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};

// ============================================
// GUESTS API
// ============================================
export const guests = {
    async list(invitationId: string) {
        const res = await safeFetch(`${API_BASE}/api/guests?invitation_id=${invitationId}`);
        if (!res.ok) throw new Error('Failed to fetch guest list');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async get(guestId: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/${guestId}`);
        return res.json();
    },

    async getBySlug(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/slug/${slug}`);
        return res.json();
    },

    async create(guest: any) {
        const res = await safeFetch(`${API_BASE}/api/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(guest))
        });
        return res.json();
    },

    async bulkCreate(invitationId: string | { invitation_id: string; guests: any[] }, guestsData?: any[]) {
        const payload = guestsData ? { invitation_id: invitationId, guests: guestsData } : invitationId;
        const res = await safeFetch(`${API_BASE}/api/guests/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(payload))
        });
        return res.json();
    },

    async update(id: string, guest: any) {
        const res = await safeFetch(`${API_BASE}/api/guests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(guest))
        });
        return res.json();
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async checkIn(invitationId: string | string, guestId?: string) {
        const payload = guestId ? { invitation_id: invitationId, guest_id: guestId } : { guest_id: invitationId };
        const res = await safeFetch(`${API_BASE}/api/guests/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return res.json();
    },

    async checkOut(guestId: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/check-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guest_id: guestId })
        });
        return res.json();
    }
};

// ============================================
// MUSIC API
// ============================================
export const music = {
    async list() {
        const res = await safeFetch(`${API_BASE}/api/music`);
        if (!res.ok) throw new Error('Failed to fetch music');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getPresignedUrl(userId: string, fileName: string) {
        const res = await safeFetch(`${API_BASE}/api/music/presigned-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, fileName })
        });
        if (!res.ok) throw new Error('Failed to get presigned URL');
        return res.json();
    },

    async uploadToR2(uploadUrl: string, blob: Blob) {
        const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': 'audio/mp4' }
        });
        if (!res.ok) throw new Error('Failed to upload to storage');
        return res.json();
    },

    async upload(formData: FormData) {
        const res = await safeFetch(`${API_BASE}/api/music/upload`, {
            method: 'POST',
            body: formData
        });
        return res.json();
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/music/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

// ============================================
// CATEGORIES API
// ============================================
export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
}

export const categories = {
    async list() {
        const res = await safeFetch(`${API_BASE}/api/categories`);
        return res.json();
    },
    async create(data: any) {
        const res = await safeFetch(`${API_BASE}/api/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async update(id: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/categories/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

// ============================================
// WISHLIST API (Invitations)
// ============================================
export const wishlist = {
    async get(userId: string, email?: string) {
        const url = email ? `${API_BASE}/api/wishlist?user_id=${userId}&email=${encodeURIComponent(email)}` : `${API_BASE}/api/wishlist?user_id=${userId}`;
        const res = await safeFetch(url);
        return res.json();
    },
    async list(userId: string, email?: string) {
        return this.get(userId, email);
    },
    async toggle(userId: string, templateId: string, isWishlisted: boolean, email?: string) {
        const res = await safeFetch(`${API_BASE}/api/wishlist`, {
            method: isWishlisted ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, template_id: templateId, email })
        });
        return res.json();
    }
};

// ============================================
// ANALYTICS API
// ============================================
export const analytics = {
    async getInvitationStats(invitationId: string) {
        const res = await safeFetch(`${API_BASE}/api/analytics/invitation/${invitationId}`);
        return res.json();
    },
    async get(id: string) {
        return this.getInvitationStats(id);
    }
};

// ============================================
// ADMIN API
// ============================================
export const admin = {
    async getStats(options?: { search?: string; filter?: string }) {
        const params = new URLSearchParams();
        if (options?.search) params.append('search', options.search);
        if (options?.filter) params.append('filter', options.filter);
        const url = params.toString() ? `${API_BASE}/api/admin/stats?${params.toString()}` : `${API_BASE}/api/admin/stats`;
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to fetch admin stats');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async triggerDisplay(displayId: string, data: { name: string; tier?: string; effect?: string; style?: string; timestamp: number }) {
        const res = await safeFetch(`${API_BASE}/api/trigger/${displayId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to trigger display');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async listUsers(role?: string) {
        let url = `${API_BASE}/api/admin/users`;
        if (role) url += `?role=${role}`;
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async createAccount(data: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create account');
        }
        return res.json();
    },

    async updateAccess(userId: string, data: { role?: string; permissions?: string[] }) {
        const res = await safeFetch(`${API_BASE}/api/admin/users/${userId}/access`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update access');
        return res.json();
    },

    async updateUserSubscription(userId: string, data: { tier?: string; expires_at?: string | null; max_invitations?: number }) {
        const res = await safeFetch(`${API_BASE}/api/admin/users/${userId}/subscription`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update user subscription');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async updateUser(userId: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update user');
        return await res.json();
    },

    async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned') {
        return this.updateUser(userId, { status });
    },

    async listMonitoringChats(token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/chats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch monitoring chats');
        return res.json();
    },

    async getChatHistory(conversationId: string, token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/chats/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch chat history');
        return res.json();
    },

    async listTransactions(filters?: any) {
        const query = new URLSearchParams(filters as any).toString();
        const res = await safeFetch(`${API_BASE}/api/admin/transactions?${query}`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    async syncTransaction(transactionId: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/transactions/${transactionId}/sync`);
        if (!res.ok) throw new Error('Failed to sync transaction');
        return res.json();
    },

    async deleteUser(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete user');
        return true;
    },

    async askAI(messages: any[]) {
        const res = await safeFetch(`${API_BASE}/api/admin/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to get AI response');
        }
        return res.json();
    },

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

    async listAds(token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/ads`, { headers });
        if (!res.ok) throw new Error('Failed to fetch ads');
        const data = await res.json();
        return sanitizeValue(data.ads || []);
    },

    async saveAd(ad: any, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/ads`, {
            method: 'POST',
            headers,
            body: JSON.stringify(sanitizeValue(ad))
        });
        if (!res.ok) throw new Error('Failed to save ad');
        return await res.json();
    },

    async deleteAd(id: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/ads/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Failed to delete ad');
        return await res.json();
    },

    async adminListMerchants(token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/merchants`, { headers });
        if (!res.ok) throw new Error('Failed to fetch merchants');
        const data = await res.json();
        return sanitizeValue(data.merchants || []);
    },

    async updateMerchant(id: string, data: any, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/merchants/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update merchant');
        return await res.json();
    },

    async deleteMerchant(id: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/merchants/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Failed to delete merchant');
        return await res.json();
    }
};

// ============================================
// ASSETS API (R2 Storage)
// ============================================
export const assets = {
    async upload(formData: FormData) {
        const res = await safeFetch(`${API_BASE}/api/assets/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload asset');
        }
        const data = await res.json();
        return sanitizeValue(data);
    },

    async delete(assetId: string) {
        const res = await safeFetch(`${API_BASE}/api/assets/${assetId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete asset');
        return true;
    }
};

// ============================================
// PREVIEW RESOLVER API
// ============================================
export const preview = {
    async get(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/preview/${slug}`);
        if (!res.ok) throw new Error('Preview data not found');
        const data = await res.json();
        return sanitizeValue(data);
    }
};

// ============================================
// BLOG API
// ============================================
export const blog = {
    async list(options?: any) {
        const params = new URLSearchParams(options);
        const res = await safeFetch(`${API_BASE}/api/blog?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async checkSlug(slug: string, excludeId?: string) {
        const params = new URLSearchParams({ slug });
        if (excludeId) params.append('excludeId', excludeId);
        const res = await safeFetch(`${API_BASE}/api/blog/check-slug?${params.toString()}`);
        return res.json();
    },

    async getPost(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/blog/post/${slug}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getRelated(id: string) {
        const res = await safeFetch(`${API_BASE}/api/blog/related/${id}`);
        if (!res.ok) throw new Error('Failed to fetch related posts');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async trackEvent(postId: string, type: string) {
        const res = await safeFetch(`${API_BASE}/api/blog/analytics`, {
            method: 'POST',
            body: JSON.stringify({ post_id: postId, type })
        });
        return res.ok;
    },

    async getCategories() {
        const res = await safeFetch(`${API_BASE}/api/blog/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async adminList() {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts`);
        if (!res.ok) throw new Error('Failed to fetch admin posts');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async adminGetPost(id: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts/${id}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async adminGetCategories() {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async adminCreate(data: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async adminUpdate(id: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async adminDelete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete post');
        return true;
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
    merchant_id: string;
    nama_produk: string;
    deskripsi: string;
    harga_estimasi: number;
    status: string;
    kategori_produk: string;
    kota: string;
    slug: string;
    images?: { image_url: string }[];
    nama_toko?: string;
    merchant_slug?: string;
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

export interface Merchant {
    id: string;
    user_id: string;
    slug: string;
    nama_toko: string;
    deskripsi: string;
    logo_url: string;
    banner_url: string;
    is_verified: number;
    is_sponsored: number;
    is_landing_featured?: number;
    kota: string;
    nama_kategori?: string;
    wishlist_count?: number;
    avg_rating?: number;
    review_count?: number;
    kontak_utama?: 'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'tiktok' | 'x' | 'youtube' | 'website' | 'tokopedia' | 'shopee' | 'chat' | 'tiktokshop';
}

export const shop = {
    async getMerchantMe(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/me?userId=${userId}&_t=${Date.now()}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch merchant profile');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async checkMerchantSlug(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/check-slug?slug=${slug}`);
        if (!res.ok) throw new Error('Failed to check merchant slug availability');
        return res.json();
    },

    async onboardMerchant(data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async updateMerchantSettings(data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async getMerchantProducts(merchantId: string) {
        if (!merchantId) return [];
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/products?merchant_id=${merchantId}&_t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch merchant products');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async createMerchantProduct(data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async updateMerchantProduct({ id, data }: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/products?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async deleteMerchantProduct(productId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/products?id=${productId}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async getProductReviews(productId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/${productId}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch product reviews');
        const data = await res.json();
        return sanitizeValue(data.reviews || []);
    },

    async submitReview(productId: string, data: any, token: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async adminGetAllProducts(token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products?_t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async adminDeleteProduct(productId: string, token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products?id=${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async adminAddProduct(data: any, token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async adminUpdateProduct(productId: string, data: any, token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products?id=${productId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async adminApproveProduct(token: string, payload: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products/approve`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return res.json();
    },

    async getCarousel() {
        const res = await safeFetch(`${API_BASE}/api/shop/carousel`);
        const data = await res.json();
        return sanitizeValue(data.slides || []);
    },

    async adminGetCarousel(token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/carousel`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return sanitizeValue(data.slides || []);
    },

    async adminAddCarousel(token: string, payload: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/carousel`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return res.json();
    },

    async adminDeleteCarousel(token: string, id: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/carousel/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async getMerchantStats(merchantId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/stats?merchant_id=${merchantId}`);
        const data = await res.json();
        return sanitizeValue(data.stats);
    },

    async getRecommendations(productId: string, category: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/recommendations?product_id=${productId}&category=${encodeURIComponent(category)}`);
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getMerchantAnalytics(merchantId: string) {
        if (!merchantId) return null;
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/analytics?merchant_id=${merchantId}`);
        return res.json();
    },

    async getDirectory(category?: string, query?: string) {
        const params = new URLSearchParams();
        if (category && category !== 'All') params.append('category', category);
        if (query) params.append('q', query);
        const res = await safeFetch(`${API_BASE}/api/shop/directory?${params.toString()}`);
        const data = await res.json();
        return sanitizeValue(data.merchants || []);
    },

    async getDiscoverProducts(options: any) {
        const params = new URLSearchParams(options);
        const res = await safeFetch(`${API_BASE}/api/shop/products/discovery?${params.toString()}`);
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getSpecialProducts() {
        const res = await safeFetch(`${API_BASE}/api/shop/products/special`);
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getFeaturedProducts() {
        const res = await safeFetch(`${API_BASE}/api/shop/products/featured`);
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getRandomProducts() {
        const res = await safeFetch(`${API_BASE}/api/shop/products/random`);
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getStorefront(slug: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/shop/storefront?slug=${slug}`, { headers });
        return res.json();
    },

    async getProduct(id: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/product?id=${id}&_t=${Date.now()}`);
        const data = await res.json();
        return sanitizeValue(data.product);
    },

    async getAds(position?: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/ads?position=${position || ''}`);
        const data = await res.json();
        return sanitizeValue(data.ads || []);
    },

    async track(merchantId: string, actionType: string, productId?: string) {
        try {
            await safeFetch(`${API_BASE}/api/shop/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchant_id: merchantId, action_type: actionType, product_id: productId })
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

    async toggleWishlist(userId: string, productId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        return res.json();
    },

    async listConversations(token: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async listMessages(conversationId: string, token: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/chat/messages/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async sendMessage(data: any, token: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/chat/send`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async markAsRead(conversationId: string, token: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/chat/read/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async boostShop(merchantId: string, userId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/ads/boost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant_id: merchantId, user_id: userId })
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

    async updateMerchantProfile(merchantId: string, userId: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant_id: merchantId, user_id: userId, ...data })
        });
        return res.json();
    },

    async updateProductStatus(productId: string, userId: string, status: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/product/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, user_id: userId, status })
        });
        return res.json();
    }
};

export async function healthCheck() {
    const res = await safeFetch(`${API_BASE}/api/health`);
    const data = await res.json();
    return sanitizeValue(data);
}

// ============================================
// PUSH NOTIFICATION API
// ============================================
export const push = {
    async subscribe(data: any) {
        const res = await safeFetch(`${API_BASE}/api/push/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async unsubscribe(endpoint: string) {
        const res = await safeFetch(`${API_BASE}/api/push/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint })
        });
        return res.json();
    },

    async getStats() {
        const res = await safeFetch(`${API_BASE}/api/admin/push/stats`);
        return res.json();
    },

    async adminBroadcast(data: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/push/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    }
};

export const subscribePush = push.subscribe;
export const unsubscribePush = push.unsubscribe;

// FEEDBACK API
// ============================================
export const feedback = {
    async submit(data: any) {
        const res = await safeFetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        return res.json();
    },

    async adminList() {
        const res = await safeFetch(`${API_BASE}/api/admin/feedback`);
        const data = await res.json();
        return sanitizeValue(data);
    }
};

// Default export for easy migration
export default {
    templates,
    invitations,
    userDisplayDesigns,
    rsvp,
    storage,
    users,
    billing,
    guests,
    music,
    admin,
    assets,
    preview,
    blog,
    shop,
    categories,
    wishlist,
    analytics,
    healthCheck,
    feedback,
    safeFetch,
    API_BASE
};
