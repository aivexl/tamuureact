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
 * Enterprise Guard: Intercepts 'api.tamuu.id' and redirects to the active worker.
 */
export const patchLegacyUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (typeof url !== 'string') return '';

    // Fix unresolvable API domain
    if (url.includes('api.tamuu.id')) {
        return url.replace('api.tamuu.id', 'tamuu-api.shafania57.workers.dev');
    }

    // Fix R2 assets if they are still using the legacy bucket domain
    if (url.includes('tamuu-assets.r2.cloudflarestorage.com')) {
        return url.replace(/https?:\/\/.*?\.r2\.cloudflarestorage\.com/, 'https://tamuu-api.shafania57.workers.dev/assets');
    }

    return url;
};
