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

export const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
};

/**
 * Determines if the current environment is the Application domain (dashboard, editor).
 */
export const getIsAppDomain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    
    // 1. Production Subdomain Check
    if (host.startsWith('app.')) return true;
    
    // 2. Development Environment Check
    if (host === 'localhost' || host === '127.0.0.1') return true;
    
    // 3. Cloudflare Pages Preview Check
    if (host.includes('tamuu-app') || host.includes('tamuu-admin')) return true;
    
    return false;
};

/**
 * Resolves the primary public domain.
 */
export const getPublicDomain = (): string => {
    if (typeof window === 'undefined') return 'tamuu.id';
    const host = window.location.host;
    if (host.startsWith('app.tamuu.id')) {
        return 'tamuu.id';
    }
    return host;
};
