/**
 * Tamuu API Client
 * Replaces Supabase client with Cloudflare-based API
 */
import { patchLegacyUrl, sanitizeValue } from './utils';

export const API_BASE = import.meta.env.PROD
    ? 'https://api.tamuu.id'
    : ''; // Dev: use Vite proxy at /api

/**
 * Enterprise Safe Fetch
 * Automatically intercepts and fixes legacy/unresolvable domains.
 */
export const safeFetch = async (url: string, options?: RequestInit) => {
    const patchedUrl = patchLegacyUrl(url);
    if (patchedUrl !== url) {
        console.warn(`[SafeFetch] Intercepted legacy domain: ${url} -> ${patchedUrl}`);
    }
    return fetch(patchedUrl, options);
};

// ============================================
// TEMPLATES API
// ============================================
export const templates = {
    async list() {
        const res = await safeFetch(`${API_BASE}/api/templates`);
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

    async create(data: any) {
        const res = await safeFetch(`${API_BASE}/api/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to create template');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async update(id: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update template');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/templates/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete template');
        return true;
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
    display_order?: number;
}

export const categories = {
    async list(): Promise<Category[]> {
        const res = await safeFetch(`${API_BASE}/api/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async create(data: { name: string; icon?: string; color?: string }) {
        const res = await safeFetch(`${API_BASE}/api/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to create category');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async update(id: string, data: Partial<Category>) {
        const res = await safeFetch(`${API_BASE}/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update category');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/categories/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete category');
        return true;
    }
};

// ============================================
// WISHLIST API
// ============================================
export const wishlist = {
    async list(userId: string): Promise<string[]> {
        const res = await fetch(`${API_BASE}/api/wishlist?user_id=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        return res.json();
    },

    async add(userId: string, templateId: string) {
        const res = await fetch(`${API_BASE}/api/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, template_id: templateId })
        });
        if (!res.ok) throw new Error('Failed to add to wishlist');
        return res.json();
    },

    async remove(userId: string, templateId: string) {
        const res = await fetch(`${API_BASE}/api/wishlist`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, template_id: templateId })
        });
        if (!res.ok) throw new Error('Failed to remove from wishlist');
        return res.json();
    },

    async toggle(userId: string, templateId: string, isCurrentlyWishlisted: boolean) {
        if (isCurrentlyWishlisted) {
            return this.remove(userId, templateId);
        } else {
            return this.add(userId, templateId);
        }
    }
};

// ============================================
// ANALYTICS API
// ============================================
export const analytics = {
    async get(invitationId: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${invitationId}/analytics`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        return sanitizeValue(data);
    }
};

// ============================================
// INVITATIONS API
// ============================================
export const invitations = {
    async list(userId?: string) {
        const url = userId
            ? `${API_BASE}/api/invitations?user_id=${userId}`
            : `${API_BASE}/api/invitations`;
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to fetch invitations');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async get(idOrSlug: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${idOrSlug}`);
        if (!res.ok) throw new Error('Invitation not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async checkSlug(slug: string): Promise<{ available: boolean; slug: string }> {
        const res = await safeFetch(`${API_BASE}/api/invitations/check-slug/${slug}`);
        if (!res.ok) return { available: false, slug };
        return res.json();
    },

    async create(data: any) {
        const res = await safeFetch(`${API_BASE}/api/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to create invitation');
        }
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async update(id: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || 'Failed to update invitation');
        }
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete invitation');
        return true;
    }
};

// ============================================
// RSVP API
// ============================================
export const rsvp = {
    async list(invitationId: string) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${invitationId}/rsvp`);
        if (!res.ok) throw new Error('Failed to fetch RSVP responses');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async listAll() {
        const res = await safeFetch(`${API_BASE}/api/wishes`);
        if (!res.ok) throw new Error('Failed to fetch all wishes');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async submit(invitationId: string, data: {
        name: string;
        email?: string;
        phone?: string;
        attendance: 'attending' | 'not_attending' | 'maybe';
        guest_count?: number;
        message?: string;
    }) {
        const res = await safeFetch(`${API_BASE}/api/invitations/${invitationId}/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to submit RSVP');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async updateStatus(id: string, updates: { is_visible?: boolean; attendance?: string; message?: string }) {
        const res = await safeFetch(`${API_BASE}/api/rsvp/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(updates))
        });
        if (!res.ok) throw new Error('Failed to update RSVP');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/rsvp/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete RSVP');
        return true;
    }

};

// ============================================
// USER DISPLAY DESIGNS API
// ============================================
export const userDisplayDesigns = {
    async list(options?: { userId?: string; invitationId?: string }) {
        let url = `${API_BASE}/api/user-display-designs`;
        const params = new URLSearchParams();
        if (options?.userId) params.append('user_id', options.userId);
        if (options?.invitationId) params.append('invitation_id', options.invitationId);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await safeFetch(url);
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

    async create(data: any) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to create display design');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async update(id: string, data: { name?: string; content?: any; thumbnail_url?: string }) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update display design');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/user-display-designs/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete display design');
        return true;
    }
};

// ============================================
// STORAGE API (R2)
// ============================================
import { processImage, type ImageContext } from './image-manager';

export const storage = {
    async upload(file: File, context: ImageContext = 'gallery'): Promise<{ id: string; url: string; key: string; blurHash?: string }> {

        let fileToUpload = file;
        let blurHash = '';

        // Only compress images, not videos
        if (file.type.startsWith('image/')) {
            try {
                const processed = await processImage(file, context);
                fileToUpload = processed.file;
                blurHash = processed.blurHash;
                console.log(`[Storage] Compressed: ${Math.round(file.size / 1024)}KB -> ${Math.round(fileToUpload.size / 1024)}KB (${processed.compressionRatio}% saved)`);
            } catch (err) {
                console.warn('[Storage] Compression failed, uploading original', err);
            }
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const res = await safeFetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to upload file');
        const data = await res.json();

        // Attach generated blurHash to response so UI can use it
        return sanitizeValue({ ...data, blurHash });
    },

    getPublicUrl(key: string): string {
        return patchLegacyUrl(`${API_BASE}/assets/${key}`);
    }
};

// ============================================
// BILLING API
// ============================================
export const billing = {
    async createInvoice(data: { userId: string; tier: string; amount: number; email: string }) {
        const res = await safeFetch(`${API_BASE}/api/billing/create-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to create invoice');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async listTransactions(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/billing/transactions?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getMidtransToken(data: { userId: string; tier: string; amount: number; email: string; name?: string }) {
        const res = await safeFetch(`${API_BASE}/api/billing/midtrans/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        const responseData = await res.json();
        return sanitizeValue(responseData);
    },

    async cancelTransaction(orderId: string, userId: string) {
        const res = await safeFetch(`${API_BASE}/api/billing/midtrans/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, userId })
        });
        return res.json();
    }
};

// ============================================
// USERS API
// ============================================
export const users = {
    async getMe(email: string, metadata?: { name?: string; gender?: string; birthDate?: string; uid?: string }) {
        let url = `${API_BASE}/api/auth/me?email=${email}`;
        if (metadata) {
            if (metadata.uid) url += `&uid=${metadata.uid}`;
            if (metadata.name) url += `&name=${encodeURIComponent(metadata.name)}`;
            if (metadata.gender) url += `&gender=${metadata.gender}`;
            if (metadata.birthDate) url += `&birthDate=${metadata.birthDate}`;
        }
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async updateProfile(data: {
        id: string;
        name?: string;
        phone?: string;
        gender?: string;
        birthDate?: string;
        bank1Name?: string;
        bank1Number?: string;
        bank1Holder?: string;
        bank2Name?: string;
        bank2Number?: string;
        bank2Holder?: string;
        emoneyType?: string;
        emoneyNumber?: string;
        giftAddress?: string;
    }) {
        const res = await safeFetch(`${API_BASE}/api/user/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update profile');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async askAI(messages: { role: 'user' | 'assistant'; content: string }[], userId?: string, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ messages, userId })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to get AI response');
        }
        return res.json();
    },

    /**
     * Call the V9.0 Agentic Chat Engine
     */
    async chatWithAIEnhanced(data: {
        messages: { role: string; content: string }[],
        context: Record<string, any>
    }) {
        const res = await safeFetch(`${API_BASE}/api/enhanced-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to get enhanced AI response');
        }
        return res.json();
    },

    /**
     * ENHANCED: Conversation management with persistent storage
     * Stores chat conversations in database for history and analytics
     */
    async createConversation(userId: string, title?: string, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat/conversations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId, title: title || 'New Conversation' })
        });
        if (!res.ok) throw new Error('Failed to create conversation');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getConversation(conversationId: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat/conversations/${conversationId}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch conversation');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async listConversations(userId: string, limit: number = 20, offset: number = 0, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(
            `${API_BASE}/api/chat/conversations?userId=${userId}&limit=${limit}&offset=${offset}`,
            { headers }
        );
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async archiveConversation(conversationId: string, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat/conversations/${conversationId}/archive`, {
            method: 'POST',
            headers
        });
        if (!res.ok) throw new Error('Failed to archive conversation');
        return res.json();
    },

    async deleteConversation(conversationId: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat/conversations/${conversationId}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Failed to delete conversation');
        return true;
    },

    async saveMessage(conversationId: string, message: { role: string; content: string }, token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify(message)
        });
        if (!res.ok) throw new Error('Failed to save message');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getMessages(conversationId: string, limit: number = 50, offset: number = 0, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(
            `${API_BASE}/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
            { headers }
        );
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getConversationAnalytics(conversationId: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await safeFetch(`${API_BASE}/api/chat/conversations/${conversationId}/analytics`, { headers });
        if (!res.ok) throw new Error('Failed to fetch conversation analytics');
        const data = await res.json();
        return sanitizeValue(data);
    }
};

// ============================================
// GUESTS API
// ============================================
export const guests = {
    async list(invitationId: string) {
        const res = await safeFetch(`${API_BASE}/api/guests?invitationId=${invitationId}`);
        if (!res.ok) throw new Error('Failed to fetch guests');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async get(id: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/${id}`);
        if (!res.ok) throw new Error('Failed to fetch guest');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async create(data: { invitation_id: string; name: string; phone?: string; address?: string; table_number?: string; tier?: string; guest_count?: number; check_in_code?: string }) {
        const res = await safeFetch(`${API_BASE}/api/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to create guest');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async update(id: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/guests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to update guest');
        const updatedData = await res.json();
        return sanitizeValue(updatedData);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete guest');
        return true;
    },

    async checkIn(idOrCode: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/${idOrCode}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return sanitizeValue(data);
    },

    async checkOut(idOrCode: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/${idOrCode}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return sanitizeValue(data);
    }
};

// ============================================
// MUSIC API
// ============================================
export const music = {
    async list() {
        const res = await fetch(`${API_BASE}/api/music`);
        if (!res.ok) throw new Error('Failed to fetch music library');
        const data = await res.json();
        // Patch legacy domains in music URLs from DB
        return (data || []).map((song: any) => ({
            ...song,
            url: patchLegacyUrl(song.url)
        }));
    },

    async upload(formData: FormData) {
        const res = await safeFetch(`${API_BASE}/api/admin/music`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async delete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/music/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
        return true;
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

    async triggerDisplay(displayId: string, data: { name: string; effect?: string; style?: string; timestamp: number }) {
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

    async createAccount(data: {
        email: string;
        name?: string;
        role: string;
        tier?: string;
        gender?: string;
        birthDate?: string;
        password?: string;
        uid?: string;
        permissions?: string[];
        expires_at?: string | null;
        max_invitations?: number
    }) {
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

    async listTransactions(filters?: { status?: string; startDate?: string; endDate?: string }) {
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

    async askAI(messages: { role: 'user' | 'assistant'; content: string }[]) {
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
    async list(options?: { limit?: number; offset?: number; category?: string; tag?: string }) {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());
        if (options?.category) params.append('category', options.category);
        if (options?.tag) params.append('tag', options.tag);

        const res = await safeFetch(`${API_BASE}/api/blog?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const data = await res.json();
        return sanitizeValue(data);
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

    async trackEvent(postId: string, type: 'view' | 'read') {
        const res = await safeFetch(`${API_BASE}/api/blog/analytics`, {
            method: 'POST',
            body: JSON.stringify({ post_id: postId, type })
        });
        return res.ok;
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
        const json = await res.json();
        if (!res.ok || (json && json.success === false)) {
            throw new Error(json.error || 'Failed to create post');
        }
        return json;
    },

    async adminUpdate(id: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        const json = await res.json();
        if (!res.ok || (json && json.success === false)) {
            throw new Error(json.error || 'Failed to update post');
        }
        return json;
    },

    async adminDelete(id: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/blog/posts/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete post');
        return true;
    }
};

export async function healthCheck() {
    const res = await safeFetch(`${API_BASE}/api/health`);
    const data = await res.json();
    return sanitizeValue(data);
}

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
    healthCheck
};
