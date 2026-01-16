/**
 * Tamuu API Client
 * Replaces Supabase client with Cloudflare-based API
 */

const API_BASE = import.meta.env.PROD
    ? 'https://tamuu-api.shafania57.workers.dev'
    : ''; // Dev: use Vite proxy at /api
// const API_BASE = 'https://api.tamuu.id';

// ============================================
// TEMPLATES API
// ============================================
export const templates = {
    async list() {
        const res = await fetch(`${API_BASE}/api/templates`);
        if (!res.ok) throw new Error('Failed to fetch templates');
        return res.json();
    },

    async get(id: string) {
        const res = await fetch(`${API_BASE}/api/templates/${id}`);
        if (!res.ok) throw new Error('Template not found');
        return res.json();
    },

    async create(data: any) {
        const res = await fetch(`${API_BASE}/api/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create template');
        return res.json();
    },

    async update(id: string, data: any) {
        const res = await fetch(`${API_BASE}/api/templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update template');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/templates/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete template');
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
    display_order?: number;
}

export const categories = {
    async list(): Promise<Category[]> {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    async create(data: { name: string; icon?: string; color?: string }) {
        const res = await fetch(`${API_BASE}/api/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
    },

    async update(id: string, data: Partial<Category>) {
        const res = await fetch(`${API_BASE}/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update category');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/categories/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete category');
        return res.json();
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
// INVITATIONS API
// ============================================
export const invitations = {
    async list(userId?: string) {
        const url = userId
            ? `${API_BASE}/api/invitations?user_id=${userId}`
            : `${API_BASE}/api/invitations`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch invitations');
        return res.json();
    },

    async get(idOrSlug: string) {
        const res = await fetch(`${API_BASE}/api/invitations/${idOrSlug}`);
        if (!res.ok) throw new Error('Invitation not found');
        return res.json();
    },

    async checkSlug(slug: string): Promise<{ available: boolean; slug: string }> {
        const res = await fetch(`${API_BASE}/api/invitations/check-slug/${slug}`);
        if (!res.ok) return { available: false, slug };
        return res.json();
    },

    async create(data: any) {
        const res = await fetch(`${API_BASE}/api/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to create invitation');
        }
        return res.json();
    },

    async update(id: string, data: any) {
        const res = await fetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || 'Failed to update invitation');
        }
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete invitation');
        return res.json();
    }
};

// ============================================
// RSVP API
// ============================================
export const rsvp = {
    async list(invitationId: string) {
        const res = await fetch(`${API_BASE}/api/invitations/${invitationId}/rsvp`);
        if (!res.ok) throw new Error('Failed to fetch RSVP responses');
        return res.json();
    },

    async listAll() {
        const res = await fetch(`${API_BASE}/api/wishes`);
        if (!res.ok) throw new Error('Failed to fetch all wishes');
        return res.json();
    },

    async submit(invitationId: string, data: {
        name: string;
        email?: string;
        phone?: string;
        attendance: 'attending' | 'not_attending' | 'maybe';
        guest_count?: number;
        message?: string;
    }) {
        const res = await fetch(`${API_BASE}/api/invitations/${invitationId}/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to submit RSVP');
        return res.json();
    },

    async updateStatus(id: string, updates: { is_visible?: boolean; attendance?: string; message?: string }) {
        const res = await fetch(`${API_BASE}/api/rsvp/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update RSVP');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/rsvp/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete RSVP');
        return res.json();
    }

};

// ============================================
// USER DISPLAY DESIGNS API
// ============================================
export const userDisplayDesigns = {
    async list(userId?: string) {
        const url = userId
            ? `${API_BASE}/api/user-display-designs?user_id=${userId}`
            : `${API_BASE}/api/user-display-designs`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch display designs');
        return res.json();
    },

    async get(id: string) {
        const res = await fetch(`${API_BASE}/api/user-display-designs/${id}`);
        if (!res.ok) throw new Error('Display design not found');
        return res.json();
    },

    async create(data: any) {
        const res = await fetch(`${API_BASE}/api/user-display-designs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create display design');
        return res.json();
    },

    async update(id: string, data: { name?: string; content?: any; thumbnail_url?: string }) {
        const res = await fetch(`${API_BASE}/api/user-display-designs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update display design');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/user-display-designs/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete display design');
        return res.json();
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

        const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to upload file');
        const data = await res.json();

        // Attach generated blurHash to response so UI can use it
        return { ...data, blurHash };
    },

    getPublicUrl(key: string): string {
        return `${API_BASE}/assets/${key}`;
    }
};

// ============================================
// BILLING API
// ============================================
export const billing = {
    async createInvoice(data: { userId: string; tier: string; amount: number; email: string }) {
        const res = await fetch(`${API_BASE}/api/billing/create-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create invoice');
        return res.json();
    },

    async listTransactions(userId: string) {
        const res = await fetch(`${API_BASE}/api/billing/transactions?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    }
};

// ============================================
// USERS API
// ============================================
export const users = {
    async getMe(email: string) {
        const res = await fetch(`${API_BASE}/api/auth/me?email=${email}`);
        if (!res.ok) throw new Error('Failed to fetch user data');
        return res.json();
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
        const res = await fetch(`${API_BASE}/api/user/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
    }
};

// ============================================
// GUESTS API
// ============================================
export const guests = {
    async list(invitationId: string) {
        const res = await fetch(`${API_BASE}/api/guests?invitationId=${invitationId}`);
        if (!res.ok) throw new Error('Failed to fetch guests');
        return res.json();
    },

    async get(id: string) {
        const res = await fetch(`${API_BASE}/api/guests/${id}`);
        if (!res.ok) throw new Error('Failed to fetch guest');
        return res.json();
    },

    async create(data: { invitation_id: string; name: string; phone?: string; address?: string; table_number?: string; tier?: string; guest_count?: number; check_in_code?: string }) {
        const res = await fetch(`${API_BASE}/api/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create guest');
        return res.json();
    },

    async update(id: string, data: any) {
        const res = await fetch(`${API_BASE}/api/guests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update guest');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/guests/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete guest');
        return res.json();
    },

    async checkIn(idOrCode: string) {
        const res = await fetch(`${API_BASE}/api/guests/${idOrCode}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return res.json(); // Returns { success, code, guest, error }
    },

    async checkOut(idOrCode: string) {
        const res = await fetch(`${API_BASE}/api/guests/${idOrCode}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return res.json(); // Returns { success, code, guest, error }
    }
};

// ============================================
// MUSIC API
// ============================================
export const music = {
    async list() {
        const res = await fetch(`${API_BASE}/api/music`);
        if (!res.ok) throw new Error('Failed to fetch music library');
        return res.json();
    },

    async upload(formData: FormData) {
        const res = await fetch(`${API_BASE}/api/admin/music`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },

    async delete(id: string) {
        const res = await fetch(`${API_BASE}/api/admin/music/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
        return res.json();
    }
};

// ============================================
// ADMIN API
// ============================================
export const admin = {
    async getStats() {
        const res = await fetch(`${API_BASE}/api/admin/stats`);
        if (!res.ok) throw new Error('Failed to fetch admin stats');
        return res.json();
    },

    async triggerDisplay(displayId: string, data: { name: string; effect?: string; style?: string; timestamp: number }) {
        const res = await fetch(`${API_BASE}/api/trigger/${displayId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to trigger display');
        return res.json();
    }
};
export async function healthCheck() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
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
    healthCheck
};
