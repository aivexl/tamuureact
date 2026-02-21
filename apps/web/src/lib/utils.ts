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
 * CTO-LEVEL DESIGN: Ensures no temporary URLs persist in the production state.
 */
export const sanitizeValue = (value: any): any => {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
        if (value.startsWith('blob:') || value.startsWith('data:')) {
            console.debug('[Sanitization] Stripping stale temporary URL:', value.substring(0, 50) + '...');
            return '';
        }
        return patchLegacyUrl(value);
    }

    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
    }

    if (typeof value === 'object') {
        const sanitized: any = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                sanitized[key] = sanitizeValue(value[key]);
            }
        }
        return sanitized;
    }

    return value;
};

/**
 * Resolves the primary public domain for invitations.
 * Steering Logic:
 * - app.tamuu.id -> tamuu.id
 * - localhost:xxxx -> localhost:xxxx
 * - else -> current host
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
 * Patches legacy or unresolvable domains in URLs.
 * Enterprise Guard: Handles legacy R2 bucket domains.
 * NOTE: api.tamuu.id is the CORRECT production domain and should NOT be patched.
 */
export const patchLegacyUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (typeof url !== 'string') return '';

    // Fix R2 assets if they are still using the legacy bucket domain
    if (url.includes('tamuu-assets.r2.cloudflarestorage.com')) {
        return url.replace(/https?:\/\/.*?\.r2\.cloudflarestorage\.com/, 'https://api.tamuu.id/assets');
    }

    // Redirect legacy workers.dev subdomain to custom domain (if any old references exist)
    if (url.includes('tamuu-api.shafania57.workers.dev')) {
        return url.replace('tamuu-api.shafania57.workers.dev', 'api.tamuu.id');
    }

    return url;
};

/**
 * Helper for date formatting - converts UTC to local timezone (WIB)
 */
export const formatDateFull = (dateStr: string) => {
    try {
        // Database stores UTC time, ensure we parse it correctly
        let d = new Date(dateStr);

        // If the date string doesn't have timezone info, treat it as UTC
        if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
            d = new Date(dateStr + 'Z'); // Append Z to indicate UTC
        }

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
