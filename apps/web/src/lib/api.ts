/**
 * Tamuu API Client
 * Replaces Supabase client with Cloudflare-based API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.tamuu.id';

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
// INVITATIONS API
// ============================================
export const invitations = {
    async list() {
        const res = await fetch(`${API_BASE}/api/invitations`);
        if (!res.ok) throw new Error('Failed to fetch invitations');
        return res.json();
    },

    async get(idOrSlug: string) {
        const res = await fetch(`${API_BASE}/api/invitations/${idOrSlug}`);
        if (!res.ok) throw new Error('Invitation not found');
        return res.json();
    },

    async create(data: any) {
        const res = await fetch(`${API_BASE}/api/invitations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create invitation');
        return res.json();
    },

    async update(id: string, data: any) {
        const res = await fetch(`${API_BASE}/api/invitations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update invitation');
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
export const storage = {
    async upload(file: File): Promise<{ id: string; url: string; key: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload file');
        return res.json();
    },

    getPublicUrl(key: string): string {
        return `${API_BASE}/assets/${key}`;
    }
};

// ============================================
// HEALTH CHECK
// ============================================
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
    healthCheck
};
