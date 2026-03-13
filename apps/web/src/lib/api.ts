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
export const safeFetch = async (url: string, options?: RequestInit, retries = 2) => {
    const patchedUrl = patchLegacyUrl(url);
    if (patchedUrl !== url) {
        console.warn(`[SafeFetch] Intercepted legacy domain: ${url} -> ${patchedUrl}`);
    }

    let attempt = 0;
    while (attempt <= retries) {
        try {
            const response = await fetch(patchedUrl, options);
            return response;
        } catch (error) {
            // TypeError usually indicates a network-level error (e.g. ERR_CONNECTION_CLOSED, ERR_HTTP2_PING_FAILED)
            if (error instanceof TypeError && attempt < retries) {
                console.warn(`[SafeFetch] Network error on ${patchedUrl}. Retrying (${attempt + 1}/${retries})...`, error);
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // 1s, 2s backoff
                attempt++;
            } else {
                throw error;
            }
        }
    }
    throw new Error('safeFetch failed unexpectedly');
};

// ============================================
// TEMPLATES API
// ============================================
export const templates = {
    async list() {
        const res = await safeFetch(`${API_BASE}/api/templates`);
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        const sanitized = sanitizeValue(data);
        return Array.isArray(sanitized) ? sanitized : [];
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
        const sanitized = sanitizeValue(data);
        return Array.isArray(sanitized) ? sanitized : [];
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
    async list(userId: string, email?: string): Promise<string[]> {
        const query = email ? `?user_id=${userId}&email=${encodeURIComponent(email)}` : `?user_id=${userId}`;
        const res = await fetch(`${API_BASE}/api/wishlist${query}`);
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        return res.json();
    },

    async add(userId: string, templateId: string, email?: string) {
        const res = await fetch(`${API_BASE}/api/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, template_id: templateId, email })
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

    async toggle(userId: string, templateId: string, isCurrentlyWishlisted: boolean, email?: string) {
        if (isCurrentlyWishlisted) {
            return this.remove(userId, templateId);
        } else {
            return this.add(userId, templateId, email);
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
        const sanitized = sanitizeValue(data);
        return Array.isArray(sanitized) ? sanitized : [];
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
    async upload(file: File, context: ImageContext = 'gallery', metadata?: { userId?: string; invitationId?: string; templateId?: string }): Promise<{ id: string; url: string; key: string; blurHash?: string }> {

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
        
        // CTO Policy: Metadata enrichment for forensic traceability
        if (metadata?.userId) formData.append('user_id', metadata.userId);
        if (metadata?.invitationId) formData.append('invitation_id', metadata.invitationId);
        if (metadata?.templateId) formData.append('template_id', metadata.templateId);

        const res = await safeFetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload file');
        }
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
        giftRecipient?: string;
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

    async getBySlug(slug: string) {
        const res = await safeFetch(`${API_BASE}/api/guests/by-slug/${slug}`);
        if (!res.ok) throw new Error('Guest not found');
        return res.json();
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
    },

    async bulkCreate(invitationId: string, guests: any[]) {
        const res = await safeFetch(`${API_BASE}/api/guests/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitation_id: invitationId, guests: sanitizeValue(guests) })
        });
        if (!res.ok) throw new Error('Failed to bulk create guests');
        return res.json();
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

    async deleteAd(id: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/admin/shop/ads/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Failed to delete ad');
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
    async list(options?: { limit?: number; offset?: number; category?: string; tag?: string; featured?: boolean }) {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());
        if (options?.category) params.append('category', options.category);
        if (options?.tag) params.append('tag', options.tag);
        if (options?.featured) params.append('featured', '1');

        const res = await safeFetch(`${API_BASE}/api/blog?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async checkSlug(slug: string, excludeId?: string): Promise<{ available: boolean; slug: string }> {
        const params = new URLSearchParams({ slug });
        if (excludeId) params.append('excludeId', excludeId);
        const res = await safeFetch(`${API_BASE}/api/blog/check-slug?${params.toString()}`);
        if (!res.ok) return { available: false, slug };
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

    async trackEvent(postId: string, type: 'view' | 'read') {
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

// ============================================
// SHOP API (TAMUU NEXUS)
// ============================================
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
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    user_name?: string;
    rating: number;
    comment: string;
    created_at: string;
}

export const shop = {
    async getMerchantMe(userId: string) {
        // Append a cache buster to strictly avoid browser disk cache returning stale 'isMerchant: false'
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/me?userId=${userId}&_t=${Date.now()}`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch merchant profile');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async checkMerchantSlug(slug: string): Promise<{ available: boolean; slug: string }> {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/check-slug?slug=${slug}`);
        if (!res.ok) throw new Error('Failed to check merchant slug availability');
        return res.json();
    },

    async onboardMerchant(data: { user_id: string; nama_toko: string; slug: string; category_id: string; deskripsi?: string }) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to onboard merchant');
        }
        return res.json();
    },

    async updateMerchantSettings(data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update merchant settings');
        }
        return res.json();
    },

    // PRODUCTS CRUD
    async getMerchantProducts(merchantId: string) {
        if (!merchantId) return [];
        // Append a cache buster to strictly avoid browser/edge disk cache returning stale product lists
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
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create product');
        }
        return res.json();
    },

    async updateMerchantProduct({ id, data }: { id: string; data: any }) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/products?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update product');
        }
        return res.json();
    },

    async deleteMerchantProduct(productId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/products?id=${productId}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete product');
        }
        return res.json();
    },

    // REVIEWS
    async getProductReviews(productId: string): Promise<Review[]> {
        const res = await safeFetch(`${API_BASE}/api/shop/products/${productId}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch product reviews');
        const data = await res.json();
        return sanitizeValue(data.reviews || []);
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
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to submit review');
        }
        return res.json();
    },

    // ADMIN SHOP MANAGEMENT
    async adminGetAllProducts(token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products?_t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch global product registry');
        }
        const data = await res.json();
        return {
            products: sanitizeValue(data.products || []),
            diagnostics: data.diagnostics
        };
    },

    async adminDeleteProduct(productId: string, token: string) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products?id=${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to purge product');
        }
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
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to add product as admin');
        }
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
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update product as admin');
        }
        return res.json();
    },

    async adminApproveProduct(token: string, payload: { id: string; is_approved: number; rejection_reason?: string }) {
        const res = await safeFetch(`${API_BASE}/api/admin/shop/products/approve`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Approval action failed');
        }
        return res.json();
    },

    // CAROUSEL
    async getCarousel() {
        const res = await safeFetch(`${API_BASE}/api/shop/carousel`);
        if (!res.ok) throw new Error('Failed to fetch carousel');
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

    async adminAddCarousel(token: string, payload: { image_url: string; link_url?: string; order_index?: number }) {
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
        if (!res.ok) throw new Error('Failed to fetch merchant stats');
        const data = await res.json();
        return sanitizeValue(data.stats);
    },

    async getRecommendations(productId: string, category: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/products/recommendations?product_id=${productId}&category=${encodeURIComponent(category)}`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    // ANALYTICS
    async getMerchantAnalytics(merchantId: string) {
        if (!merchantId) return null;
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/analytics?merchant_id=${merchantId}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
    },

    // DIRECTORY & STOREFRONT
    async getDirectory(category?: string, query?: string) {
        const params = new URLSearchParams();
        if (category && category !== 'All' && category !== 'Semua') params.append('category', category);
        if (query) params.append('q', query);
        const url = `${API_BASE}/api/shop/directory${params.toString() ? '?' + params.toString() : ''}`;
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to fetch shop directory');
        const data = await res.json();
        return sanitizeValue(data.merchants || []);
    },

    async getDiscoverProducts(options: { category?: string; query?: string; city?: string }) {
        const params = new URLSearchParams();
        if (options.category && options.category !== 'All') params.append('category', options.category);
        if (options.query) params.append('q', options.query);
        if (options.city && options.city !== 'All') params.append('city', options.city);
        
        const url = `${API_BASE}/api/shop/products/discovery${params.toString() ? '?' + params.toString() : ''}`;
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to discover products');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getSpecialProducts() {
        const res = await safeFetch(`${API_BASE}/api/shop/products/special`);
        if (!res.ok) throw new Error('Failed to fetch special products');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getFeaturedProducts() {
        const res = await safeFetch(`${API_BASE}/api/shop/products/featured`);
        if (!res.ok) throw new Error('Failed to fetch featured products');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getRandomProducts() {
        const res = await safeFetch(`${API_BASE}/api/shop/products/random`);
        if (!res.ok) throw new Error('Failed to fetch random products');
        const data = await res.json();
        return sanitizeValue(data.products || []);
    },

    async getStorefront(slug: string, token?: string) {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await safeFetch(`${API_BASE}/api/shop/storefront?slug=${slug}`, { headers });
        if (!res.ok) throw new Error('Storefront not found');
        const data = await res.json();
        return sanitizeValue(data);
    },

    async getProduct(id: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/product?id=${id}&_t=${Date.now()}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        return sanitizeValue(data.product);
    },

    async getAds(position?: string) {
        let url = `${API_BASE}/api/shop/ads`;
        if (position) url += `?position=${position}`;
        const res = await safeFetch(url);
        if (!res.ok) throw new Error('Failed to fetch ads');
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
        } catch (e) {
            console.warn('[Analytics] Track failed silent:', e);
        }
    },

    // WISHLIST
    async getWishlist(userId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/wishlist?user_id=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        const data = await res.json();
        return sanitizeValue(data.wishlist || []);
    },

    async toggleWishlist(userId: string, productId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/wishlist/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId })
        });
        if (!res.ok) throw new Error('Failed to toggle wishlist');
        return res.json();
    },

    // PROFILE & STATUS
    async updateMerchantProfile(merchantId: string, userId: string, data: any) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant_id: merchantId, user_id: userId, ...data })
        });
        if (!res.ok) throw new Error('Failed to update merchant profile');
        return res.json();
    },

    async updateProductStatus(productId: string, userId: string, status: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/product/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, user_id: userId, status })
        });
        if (!res.ok) throw new Error('Failed to update product status');
        return res.json();
    },

    // ADS
    async boostShop(merchantId: string, userId: string) {
        const res = await safeFetch(`${API_BASE}/api/shop/merchant/ads/boost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchant_id: merchantId, user_id: userId })
        });
        if (!res.ok) throw new Error('Failed to boost shop');
        return res.json();
    },

    async submitReport(data: { product_id: string, reporter_id?: string, category: string, reason?: string }) {
        const res = await safeFetch(`${API_BASE}/api/shop/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to submit report');
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
    async subscribe(data: { userId: string; subscription: any; platform: string; userAgent: string }) {
        const res = await safeFetch(`${API_BASE}/api/push/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to subscribe to push notifications');
        return res.json();
    },

    async unsubscribe(endpoint: string) {
        const res = await safeFetch(`${API_BASE}/api/push/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint })
        });
        if (!res.ok) throw new Error('Failed to unsubscribe');
        return res.json();
    },

    async getStats() {
        const res = await safeFetch(`${API_BASE}/api/admin/push/stats`);
        if (!res.ok) throw new Error('Failed to fetch push stats');
        return res.json();
    },

    async adminBroadcast(data: { title: string; message: string; url?: string; imageUrl?: string; audience?: string; platform?: string }) {
        const res = await safeFetch(`${API_BASE}/api/admin/push/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to broadcast push notification');
        return res.json();
    }
};

export const subscribePush = push.subscribe;
export const unsubscribePush = push.unsubscribe;

// FEEDBACK API
// ============================================
export const feedback = {
    async submit(data: { userId: string; category: 'bug' | 'feature'; message: string }) {
        const res = await safeFetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizeValue(data))
        });
        if (!res.ok) throw new Error('Failed to submit feedback');
        return res.json();
    },

    async adminList() {
        const res = await safeFetch(`${API_BASE}/api/admin/feedback`);
        if (!res.ok) throw new Error('Failed to fetch feedback list');
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
    healthCheck,
    feedback,
    safeFetch,
    API_BASE
};

