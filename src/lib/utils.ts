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
