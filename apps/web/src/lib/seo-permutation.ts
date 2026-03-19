/**
 * TAMUU NEXUS SEO ENGINE
 * Permutation & Assembly Utility (v13.0)
 * 
 * Fungsi ini bertugas untuk mengganti placeholder dinamis pada template SEO
 * dengan data riil yang up-to-date (0ms Latency).
 */

interface SEOData {
    category: string;
    city: string;
    count: number;
    minPrice?: string;
    vendorNames?: string[];
}

/**
 * Mendapatkan Bulan Ini dalam Bahasa Indonesia (Format Panjang, e.g., 'Agustus')
 */
export const getCurrentMonthIndo = (): string => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
};

/**
 * Mendapatkan Tahun Ini (e.g., '2026')
 */
export const getCurrentYear = (): string => {
    return new Date().getFullYear().toString();
};

/**
 * The Assembly Engine: Mengganti semua placeholder dalam template
 * 
 * @param template Teks template dari Database D1 (e.g., "Promo {Category} di {City} bulan {Month}")
 * @param data Data riil yang ditarik dari hasil pencarian/API
 * @returns Teks matang yang siap dikonsumsi Google Bot
 */
export const assembleSEOTemplate = (template: string, data: SEOData): string => {
    if (!template) return '';

    let assembledText = template;

    // Formatting Helpers
    const formattedCategory = data.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedCity = data.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedMinPrice = data.minPrice || 'Tanya Harga';
    const topVendors = data.vendorNames && data.vendorNames.length > 0 
        ? data.vendorNames.slice(0, 3).join(', ') 
        : 'Vendor Pilihan';

    // Inject Time Variables (The "Chronos" Strategy)
    assembledText = assembledText.replace(/\{Month\}/g, getCurrentMonthIndo());
    assembledText = assembledText.replace(/\{Year\}/g, getCurrentYear());

    // Inject Core SEO Variables
    assembledText = assembledText.replace(/\{Category\}/g, formattedCategory);
    assembledText = assembledText.replace(/\{City\}/g, formattedCity);
    assembledText = assembledText.replace(/\{Count\}/g, data.count.toString());
    assembledText = assembledText.replace(/\{MinPrice\}/g, formattedMinPrice);
    assembledText = assembledText.replace(/\{VendorNames\}/g, topVendors);

    return assembledText;
};
