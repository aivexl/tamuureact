import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves the primary public domain.
 */
export const getPublicDomain = (): string => {
    if (typeof window === 'undefined') return 'tamuu.id';
    const host = window.location.hostname;
    const port = window.location.port;

    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
        return `${host}${port ? `:${port}` : ''}`;
    }

    return 'tamuu.id';
};

/**
 * Resolves the application hub domain.
 */
export const getAppDomain = (): string => {
    if (typeof window === 'undefined') return 'app.tamuu.id';
    const host = window.location.hostname;
    const port = window.location.port;

    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
        return `${host}${port ? `:${port}` : ''}`;
    }

    return 'app.tamuu.id';
};

/**
 * Determines if the current environment is the Application domain.
 */
export const getIsAppDomain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    if (host.startsWith('app.')) return true;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host.includes('tamuu-app') || host.includes('tamuu-admin')) return true;
    return false;
};

/**
 * Centralized Route Policy: Returns true ONLY if the path MUST be on app.tamuu.id
 */
export const isAppPath = (pathname: string): boolean => {
    return pathname.startsWith('/login') || 
           pathname.startsWith('/signup') || 
           pathname.startsWith('/forgot-password') || 
           pathname.startsWith('/auth') ||
           pathname.startsWith('/dashboard') || 
           pathname.startsWith('/editor') ||
           pathname.startsWith('/profile') ||
           pathname.startsWith('/billing') ||
           pathname.startsWith('/upgrade') ||
           pathname.startsWith('/guests') ||
           pathname.startsWith('/wishes') ||
           pathname.startsWith('/admin') ||
           pathname.startsWith('/vendor') ||
           pathname.startsWith('/onboarding');
};

/**
 * SmartLink helper to get the CORRECT absolute URL based on the route policy.
 * If the path belongs to app.tamuu.id, it returns https://app.tamuu.id/path
 * If the path belongs to tamuu.id, it returns https://tamuu.id/path
 */
export const getAbsoluteUrl = (path: string): string => {
    const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isDev) return path; // Use relative in dev

    // Strip any existing origin if accidentally passed
    const cleanPath = path.replace(/^https?:\/\/[^\/]+/, '');
    
    // If it's explicitly an app path
    if (isAppPath(cleanPath)) {
        return `https://${getAppDomain()}${cleanPath}`;
    }
    
    // Otherwise it's a public path
    return `https://${getPublicDomain()}${cleanPath}`;
};

/**
 * SmartLink helper to determine if a target path/URL crosses domain boundaries.
 */
export const getIsCrossDomain = (targetPath: string): boolean => {
    if (typeof window === 'undefined') return false;
    const isCurrentlyApp = getIsAppDomain();
    const publicDomain = getPublicDomain();
    const appDomain = getAppDomain();

    if (targetPath.startsWith('http')) {
        if (isCurrentlyApp && targetPath.includes(publicDomain) && !targetPath.includes(appDomain)) return true;
        if (!isCurrentlyApp && targetPath.includes(appDomain)) return true;
    }

    return false;
};

/**
 * Generates a high-entropy unique identifier.
 */
export const generateId = (prefix?: string): string => {
    let id: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
    } else {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    return prefix ? `${prefix}-${id}` : id;
};

/**
 * Recursively sanitizes an object or array.
 */
export const sanitizeValue = (value: any): any => {
    if (value === null || value === undefined) return value;
    const type = typeof value;
    if (type !== 'object') {
        if (type === 'string') {
            if (value.startsWith('blob:') || value.startsWith('data:')) return '';
            return patchLegacyUrl(value);
        }
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
    }
    const sanitized: any = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            sanitized[key] = sanitizeValue(value[key]);
        }
    }
    return sanitized;
};

export const patchLegacyUrl = (url: string | null | undefined): string => {
    if (!url || typeof url !== 'string' || url.length < 5) return url || '';
    let result = url;
    if (result.includes('tamuu-assets.r2.cloudflarestorage.com')) {
        result = result.replace(/https?:\/\/.*?\.r2\.cloudflarestorage\.com/, 'https://api.tamuu.id/assets');
    }
    if (result.includes('tamuu-api.shafania57.workers.dev')) {
        result = result.replace('tamuu-api.shafania57.workers.dev', 'api.tamuu.id');
    }
    return result;
};

export const parseUTCDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date();
    if (dateStr.includes('Z') || dateStr.includes('+')) return new Date(dateStr);
    const isoStr = dateStr.replace(' ', 'T') + 'Z';
    const date = new Date(isoStr);
    return isNaN(date.getTime()) ? new Date(dateStr) : date;
};

export const formatDateFull = (dateStr: string) => {
    try {
        const d = parseUTCDate(dateStr);
        return d.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).replace(/\./g, ":");
    } catch (e) {
        return dateStr;
    }
};

export const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Number(amount));
};

export const formatAbbreviatedNumber = (num: number): string => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' milyar';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'juta';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
};
