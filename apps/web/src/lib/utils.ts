import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a high-entropy unique identifier.
 * Uses crypto.randomUUID() where available, with a stable fallback.
 */
export const generateId = (prefix?: string): string => {
    let id: string;

    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
    } else {
        // Fallback for older environments or specific testing contexts
        id = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    return prefix ? `${prefix}-${id}` : id;
};

/**
 * Converts a data URL (base64) to a Blob object.
 */
export const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};
/**
 * Recursively sanitizes an object or array, removing stale blob: or data: URLs.
 * Optimized for performance: Only creates new objects/arrays if a change is actually detected.
 * CTO-LEVEL DESIGN: Ensures zero-friction UI thread even with multi-megabyte payloads.
 */
export const sanitizeValue = (value: any): any => {
    if (value === null || value === undefined) return value;

    // Handle primitives early
    const type = typeof value;
    if (type !== 'object') {
        if (type === 'string') {
            if (value.startsWith('blob:') || value.startsWith('data:')) {
                console.debug('[Sanitization] Stripping stale temporary URL:', value.substring(0, 50) + '...');
                return '';
            }
            return patchLegacyUrl(value);
        }
        return value;
    }

    // Handle Arrays
    if (Array.isArray(value)) {
        let hasChanged = false;
        const sanitized = value.map(item => {
            const newItem = sanitizeValue(item);
            if (newItem !== item) hasChanged = true;
            return newItem;
        });
        return hasChanged ? sanitized : value;
    }

    // Handle Objects
    let hasChanged = false;
    const sanitized: any = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            const item = value[key];
            const newItem = sanitizeValue(item);
            if (newItem !== item) {
                hasChanged = true;
            }
            sanitized[key] = newItem;
        }
    }

    // Only return the new object if something inside it actually changed
    // This drastically reduces memory pressure and GC pauses
    return hasChanged ? sanitized : value;
};

/**
 * Resolves the primary public domain for invitations.
 */
export const getPublicDomain = (): string => {
    if (typeof window === 'undefined') return 'tamuu.id';
    const host = window.location.host;
    if (host.startsWith('app.tamuu.id')) {
        return 'tamuu.id';
    }
    return host;
};

/**
 * Determines if the current environment is the Application domain (dashboard, editor).
 * This is used for domain-aware routing and auth logic.
 */
export const getIsAppDomain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    
    // 1. Production Subdomain Check
    if (host.startsWith('app.')) return true;
    
    // 2. Development Environment Check
    if (host === 'localhost' || host === '127.0.0.1') return true;
    
    // 3. Cloudflare Pages Preview Check
    // We only treat it as app domain if it specifically targets the app worker/pages
    if (host.includes('tamuu-app') || host.includes('tamuu-admin')) return true;
    
    // CRITICAL FIX: Pages.dev without tamuu-app prefix is treated as Public domain (tamuu.id)
    // This prevents the landing page preview from incorrectly acting like a dashboard.
    if (host.endsWith('pages.dev')) return false;

    return false;
};

/**
 * Patches legacy or unresolvable domains in URLs.
 * Optimized for high-frequency calling.
 */
export const patchLegacyUrl = (url: string | null | undefined): string => {
    if (!url || typeof url !== 'string' || url.length < 5) return url || '';

    // Fast check for common patterns before applying regex/replace
    if (!url.includes('tamuu') && !url.includes(' / ')) return url;

    let result = url;

    // Fix R2 assets if they are still using the legacy bucket domain
    if (result.includes('tamuu-assets.r2.cloudflarestorage.com')) {
        result = result.replace(/https?:\/\/.*?\.r2\.cloudflarestorage\.com/, 'https://api.tamuu.id/assets');
    }

    // Fix malformed upload paths with spaces around slashes
    if (result.includes(' / ')) {
        result = result.replace(/\s+\/\s+/g, '/');
    }

    // Redirect legacy workers.dev subdomain
    if (result.includes('tamuu-api.shafania57.workers.dev')) {
        result = result.replace('tamuu-api.shafania57.workers.dev', 'api.tamuu.id');
    }

    return result === url ? url : result.trim();
};

/**
 * Robust UTC date parser for database timestamps.
 * Standardizes SQLite timestamps (YYYY-MM-DD HH:MM:SS) to ISO-8601 UTC.
 */
export const parseUTCDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date();
    
    // If string already has timezone info, parse as is
    if (dateStr.includes('Z') || dateStr.includes('+')) {
        return new Date(dateStr);
    }
    
    // Handle SQLite format: "2026-03-13 10:00:00" -> "2026-03-13T10:00:00Z"
    const isoStr = dateStr.replace(' ', 'T') + 'Z';
    const date = new Date(isoStr);
    
    // Fallback if parsing fails
    return isNaN(date.getTime()) ? new Date(dateStr) : date;
};

/**
 * Helper for date formatting - converts UTC to local timezone (WIB)
 */
export const formatDateFull = (dateStr: string) => {
    try {
        const d = parseUTCDate(dateStr);

        return d
            .toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta", // Explicitly use WIB timezone
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            })
            .replace(/\./g, ":");
    } catch (e) {
        return dateStr;
    }
};

/**
 * Formats a number as IDR currency
 */
export const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Number(amount));
};

/**
 * Formats large numbers into human-readable abbreviations (k, juta, milyar)
 */
export const formatAbbreviatedNumber = (num: number): string => {
    if (!num) return '0';
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' milyar';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'juta';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    
    return num.toString();
};
