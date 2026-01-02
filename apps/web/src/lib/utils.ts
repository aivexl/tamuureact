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
        return value;
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
