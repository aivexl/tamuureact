import { RSVPWishesConfig } from '@/store/layersSlice';

export type RSVPVariantId =
    | 'classic' | 'minimal' | 'modern' | 'elegant' | 'rustic'
    | 'romantic' | 'floral' | 'boho' | 'luxury' | 'dark'
    | 'glass' | 'neon' | 'vintage' | 'bold' | 'outline'
    | 'pastel' | 'geometric' | 'brutalist' | 'cloud' | 'monochrome';

// ============================================
// RSVP WISHES DEFAULT CONFIG
// ============================================
export const DEFAULT_RSVP_WISHES_CONFIG: RSVPWishesConfig = {
    style: 'modern',
    variant: 'modern' as any, // Backward compat

    // Content Labels
    title: 'Konfirmasi Kehadiran',
    subtitle: 'Kami menantikan kehadiran Anda',
    submitButtonText: 'Kirim RSVP',
    wishesTitle: 'Ucapan & Doa',
    wishesSubtitle: 'Dari para tamu undangan',
    thankYouMessage: 'Terima kasih atas konfirmasi Anda!',

    // Form Fields
    showNameField: true,
    showEmailField: false,
    showPhoneField: true,
    showAttendanceField: true,
    showGuestCountField: true,
    showMessageField: true,
    showMealPreference: false,
    showSongRequest: false,

    // Field Labels
    nameLabel: 'Nama Lengkap',
    emailLabel: 'Email',
    phoneLabel: 'Nomor WhatsApp',
    attendanceLabel: 'Konfirmasi Kehadiran',
    guestCountLabel: 'Jumlah Tamu',
    messageLabel: 'Ucapan & Doa',

    // Attendance Options
    attendanceOptions: {
        attending: 'Hadir',
        notAttending: 'Tidak Hadir',
        maybe: 'Belum Pasti'
    },

    // Guest Count
    guestCountMax: 5,
    guestCountDefault: 1,

    // Styling Defaults (will be overridden by variant if not explicitly set)
    primaryColor: '#bfa181',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: 8,

    // Wishes Display
    wishesLayout: 'list',
    wishesMaxDisplay: 50,
    showWishTimestamp: true,
    showWishAvatar: true,
    wishCardStyle: 'minimal',
    wishesAutoScroll: false,

    // Validation
    nameMinLength: 2,
    nameMaxLength: 100,
    messageMinLength: 0,
    messageMaxLength: 500,
    requireMessage: false,

    // Anti-Spam
    enableCaptcha: false,
    captchaType: 'simple',

    // Animations
    formAnimation: 'slide-up',
    wishCardAnimation: 'fade',
    submitButtonAnimation: 'pulse',
};

// ============================================
// VARIANT STYLE DEFINITIONS
// ============================================
export interface VariantStyle {
    id: RSVPVariantId;
    name: string;

    // Container Styles
    containerClass: string;
    containerStyle?: React.CSSProperties;

    // Input Styles
    inputClass: string;
    inputStyle?: React.CSSProperties;

    // Button Styles
    buttonClass: string;
    buttonStyle?: React.CSSProperties;

    // Text Styles
    titleClass: string;
    subtitleClass?: string;
    labelClass?: string;

    // Individual Card Style (for wishes)
    wishCardClass: string;
    wishCardStyle?: React.CSSProperties;

    // Design Tokens
    accentColor: string;
    fontFamily?: string;
}

export const RSVP_VARIANTS: Record<RSVPVariantId, VariantStyle> = {
    classic: {
        id: 'classic',
        name: 'Classic Signature',
        containerClass: 'bg-white border border-gray-200 shadow-sm p-6',
        inputClass: 'border-b border-gray-300 rounded-none focus:border-amber-600 transition-all font-serif text-amber-950 placeholder:text-amber-900/40',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white font-serif uppercase tracking-widest py-3 font-bold',
        titleClass: 'text-2xl font-serif text-amber-900 mb-6 font-medium italic',
        wishCardClass: 'bg-white border-l-2 border-amber-500 shadow-sm p-3 mb-2',
        accentColor: '#d97706'
    },
    minimal: {
        id: 'minimal',
        name: 'Clean Minimal',
        containerClass: 'bg-white shadow-xl shadow-gray-100 p-6 rounded-3xl',
        inputClass: 'bg-gray-50 border-none rounded-xl focus:ring-1 focus:ring-black transition-all px-3 py-2 text-gray-900 placeholder:text-gray-400',
        buttonClass: 'bg-black text-white px-8 py-3 rounded-full font-black tracking-tight hover:scale-105 transition-transform',
        titleClass: 'text-xl font-black tracking-tight text-gray-900 mb-4',
        wishCardClass: 'border-b border-gray-50 py-3 last:border-0',
        accentColor: '#000000'
    },
    modern: {
        id: 'modern',
        name: 'Soft Modern',
        containerClass: 'bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.08)] p-8',
        inputClass: 'bg-blue-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 px-4 py-3 placeholder:text-blue-900/40 text-blue-950 font-medium',
        buttonClass: 'bg-blue-600 text-white rounded-2xl font-black py-3.5 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 shadow-lg',
        titleClass: 'text-2xl font-black text-gray-900 tracking-tighter mb-4',
        wishCardClass: 'bg-blue-50/30 rounded-2xl p-4 border border-blue-50/50 mb-3',
        accentColor: '#2563eb'
    },
    elegant: {
        id: 'elegant',
        name: 'Elegant Script',
        containerClass: 'bg-[#fdfbf7] border-2 border-amber-100 p-8 rounded-sm relative after:absolute after:inset-1 after:border after:border-amber-100 after:pointer-events-none',
        inputClass: 'bg-white border border-amber-50 rounded-sm focus:border-amber-600 px-4 py-2 font-serif italic text-amber-950 placeholder:text-amber-900/30',
        buttonClass: 'bg-amber-800 text-white font-serif italic tracking-widest py-3 rounded-sm hover:-translate-y-1 transition-all shadow-xl font-bold',
        titleClass: 'text-3xl font-serif italic text-amber-900 text-center mb-6',
        wishCardClass: 'bg-white/50 border border-amber-50 p-4 font-serif italic mb-3',
        accentColor: '#92400e'
    },
    rustic: {
        id: 'rustic',
        name: 'Rustic Warmth',
        containerClass: 'bg-[#fffaf0] border-t-8 border-[#8b4513]/40 p-6 rounded-xl relative overflow-hidden',
        inputClass: 'bg-white/60 border border-[#8b4513]/20 rounded-lg px-4 py-2 placeholder-[#8b4513]/40 focus:bg-white text-[#8b4513]',
        buttonClass: 'bg-[#8b4513] text-white font-black py-3 rounded-lg hover:bg-[#6d3610] shadow-md transition-colors',
        titleClass: 'text-2xl font-bold text-[#8b4513] mb-4 font-serif',
        wishCardClass: 'bg-[#8b4513]/5 border-l-2 border-[#8b4513]/20 p-3 mb-2',
        accentColor: '#8b4513'
    },
    romantic: {
        id: 'romantic',
        name: 'Sweet Romance',
        containerClass: 'bg-[#fff0f5]/80 backdrop-blur-sm rounded-[3rem] p-8 border-4 border-white shadow-2xl shadow-rose-200',
        inputClass: 'bg-white border-2 border-rose-50 rounded-full px-6 py-2.5 focus:border-rose-300 transition-colors text-rose-900 placeholder:text-rose-300',
        buttonClass: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full font-black py-3 hover:scale-105 shadow-lg shadow-rose-200 transition-all',
        titleClass: 'text-2xl font-semibold text-rose-800 mb-4 text-center',
        wishCardClass: 'bg-white/60 rounded-3xl p-4 border border-rose-100/50 mb-3',
        accentColor: '#fb7185'
    },
    floral: {
        id: 'floral',
        name: 'Spring Floral',
        containerClass: 'bg-white p-6 rounded-3xl border-x-8 border-pink-200 shadow-xl',
        inputClass: 'bg-pink-50/30 border-2 border-pink-100 rounded-2xl focus:bg-white focus:border-pink-400 text-pink-900 placeholder:text-pink-300',
        buttonClass: 'bg-pink-500 text-white rounded-2xl font-black py-3 hover:bg-pink-600 transition-colors shadow-lg shadow-pink-100',
        titleClass: 'text-2xl font-black text-pink-900 mb-6 uppercase tracking-widest text-center',
        wishCardClass: 'bg-pink-50/20 rounded-2xl p-4 border border-pink-100/30 mb-2',
        accentColor: '#ec4899'
    },
    boho: {
        id: 'boho',
        name: 'Boho Spirit',
        containerClass: 'bg-[#fbf7f5] p-8 rounded-[2rem] border border-[#d2b48c]/30 shadow-inner',
        inputClass: 'bg-transparent border-b border-[#d2b48c] rounded-none focus:border-b-2 transition-all px-0 py-2 font-medium italic text-[#8b6b4e] placeholder:text-[#d2b48c]/50',
        buttonClass: 'bg-[#d2b48c] text-[#fbf7f5] rounded-full font-black tracking-[0.2em] py-3.5 uppercase hover:bg-[#c19a6b]',
        titleClass: 'text-2xl font-light tracking-[0.3em] uppercase text-[#8b6b4e] mb-8 text-center',
        wishCardClass: 'border-l border-[#d2b48c]/40 pl-4 py-3 italic mb-4',
        accentColor: '#8b6b4e'
    },
    luxury: {
        id: 'luxury',
        name: 'Midnight Luxury',
        containerClass: 'bg-[#0f1115] text-white p-8 border-2 border-[#d4af37]/40 rounded-lg shadow-[0_0_60px_rgba(212,175,55,0.15)] ring-1 ring-[#d4af37]/20 ring-offset-4 ring-offset-[#0f1115]',
        inputClass: 'bg-white/5 border border-[#d4af37]/20 rounded-none text-white focus:border-[#d4af37] focus:bg-white/10 transition-all placeholder:text-white/20',
        buttonClass: 'bg-gradient-to-b from-[#d4af37] to-[#aa8b2c] text-black font-black uppercase tracking-[0.2em] py-4 rounded-none hover:brightness-110 active:scale-[0.98]',
        titleClass: 'text-xl font-bold text-[#d4af37] uppercase tracking-[0.4em] mb-10 text-center border-b border-[#d4af37]/20 pb-4',
        wishCardClass: 'bg-gradient-to-br from-white/5 to-transparent border border-[#d4af37]/10 p-4 mb-4 shadow-2xl',
        accentColor: '#d4af37'
    },
    dark: {
        id: 'dark',
        name: 'Deep Slate',
        containerClass: 'bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]',
        inputClass: 'bg-slate-800/50 border-slate-700/50 rounded-xl text-white focus:border-indigo-500 focus:bg-slate-800 transition-colors placeholder:text-slate-500',
        buttonClass: 'bg-indigo-600 text-white font-black py-3.5 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all',
        titleClass: 'text-2xl font-bold text-indigo-100 mb-6 tracking-tight',
        wishCardClass: 'bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl mb-3',
        accentColor: '#6366f1'
    },
    glass: {
        id: 'glass',
        name: 'Frosted Glass',
        containerClass: 'bg-white/20 backdrop-blur-2xl border border-white/30 p-8 rounded-[2.5rem] shadow-2xl shadow-black/10',
        inputClass: 'bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/50 transition-all',
        buttonClass: 'bg-white text-black font-black py-4 rounded-2xl hover:bg-opacity-90 active:scale-95 transition-all shadow-xl',
        titleClass: 'text-2xl font-black text-white text-center mb-6 drop-shadow-xl tracking-tighter',
        wishCardClass: 'bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl mb-3',
        accentColor: '#ffffff'
    },
    neon: {
        id: 'neon',
        name: 'Cyber Neon',
        containerClass: 'bg-black text-white p-6 rounded-none border-t-2 border-b-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]',
        inputClass: 'bg-black border border-cyan-900 rounded-none text-cyan-300 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all uppercase text-[10px] tracking-widest placeholder:text-cyan-900',
        buttonClass: 'bg-cyan-400 text-black font-black py-3 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#083344] active:shadow-none active:translate-x-0 active:translate-y-0',
        titleClass: 'text-4xl font-black italic text-cyan-400 uppercase tracking-tighter mb-8 skew-x-[-12deg]',
        wishCardClass: 'bg-cyan-900/10 border-l-4 border-cyan-400 p-4 mb-4 font-mono text-[11px]',
        accentColor: '#22d3ee'
    },
    vintage: {
        id: 'vintage',
        name: 'Old Newspaper',
        containerClass: 'bg-[#f4f1ea] p-6 border-[3px] border-[#3d2b1f] shadow-[12px_12px_0px_#3d2b1f] font-serif relative overflow-hidden',
        inputClass: 'bg-transparent border border-[#3d2b1f] rounded-none px-4 py-2 font-serif focus:bg-[#3d2b1f]/5 transition-colors text-[#3d2b1f] placeholder:text-[#3d2b1f]/30',
        buttonClass: 'bg-[#3d2b1f] text-white font-serif uppercase py-3 rounded-none hover:bg-black transition-colors font-black',
        titleClass: 'text-3xl font-serif font-black underline decoration-2 underline-offset-4 text-[#3d2b1f] mb-8 uppercase text-center',
        wishCardClass: 'border border-[#3d2b1f]/20 p-4 bg-[#ede8da] mb-4 shadow-sm',
        accentColor: '#3d2b1f'
    },
    bold: {
        id: 'bold',
        name: 'High Contrast',
        containerClass: 'bg-orange-500 p-8 border-4 border-black shadow-[15px_15px_0px_rgba(0,0,0,1)] rounded-none',
        inputClass: 'bg-white border-4 border-black rounded-none px-4 py-3 font-black text-lg text-black placeholder:text-gray-400',
        buttonClass: 'bg-black text-white font-black text-xl tracking-tighter py-4 uppercase hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none transition-all shadow-[10px_10px_0px_rgba(255,255,255,0.3)]',
        titleClass: 'text-5xl font-black uppercase tracking-tighter text-black mb-10 leading-none underline decoration-8',
        wishCardClass: 'bg-white border-4 border-black p-4 font-black shadow-[8px_8px_0px_black] mb-6',
        accentColor: '#000000'
    },
    outline: {
        id: 'outline',
        name: 'Linear Outline',
        containerClass: 'bg-white border-2 border-gray-900 p-6 rounded-none',
        inputClass: 'bg-transparent border-2 border-gray-100 focus:border-gray-900 rounded-none transition-all text-gray-900 placeholder:text-gray-300',
        buttonClass: 'bg-transparent border-2 border-gray-900 text-gray-900 font-black py-3 hover:bg-gray-900 hover:text-white transition-all',
        titleClass: 'text-2xl font-black text-gray-900 mb-6 border-b-4 border-gray-900 p-2 inline-block',
        wishCardClass: 'border-b-2 border-gray-100 p-3 mb-2',
        accentColor: '#111827'
    },
    pastel: {
        id: 'pastel',
        name: 'Pastel Dream',
        containerClass: 'bg-purple-50 p-6 rounded-[4rem] border-8 border-white shadow-2xl shadow-purple-200',
        inputClass: 'bg-white border-none rounded-3xl shadow-inner focus:ring-4 focus:ring-purple-200 transition-all text-purple-900 placeholder:text-purple-200',
        buttonClass: 'bg-purple-400 text-white rounded-full font-black py-3.5 shadow-lg shadow-purple-200 hover:brightness-105 active:scale-95 transition-all',
        titleClass: 'text-2xl font-black text-purple-900 text-center mb-6 tracking-tight',
        wishCardClass: 'bg-white/80 rounded-[2.5rem] p-5 shadow-sm mb-3 border border-white',
        accentColor: '#a78bfa'
    },
    geometric: {
        id: 'geometric',
        name: 'Geo Grid',
        containerClass: 'bg-white p-6 border-2 border-indigo-600 rounded-none relative after:absolute after:bottom-0 after:right-0 after:w-16 after:h-16 after:bg-indigo-600 after:clip-path-polygon-[100%_0,100%_100%,0_100%]',
        inputClass: 'bg-indigo-50/50 border-2 border-indigo-100 rounded-none focus:border-indigo-600 transition-all font-mono text-indigo-900 placeholder:text-indigo-200',
        buttonClass: 'bg-indigo-600 text-white font-mono uppercase font-black py-3 rounded-none hover:bg-white hover:text-indigo-600 border-2 border-indigo-600 transition-all',
        titleClass: 'text-xl font-mono font-black text-indigo-900 uppercase tracking-widest mb-6',
        wishCardClass: 'bg-indigo-50 border border-indigo-100 p-3 font-mono text-[11px] mb-2',
        accentColor: '#4f46e5'
    },
    brutalist: {
        id: 'brutalist',
        name: 'Neo Brutalist',
        containerClass: 'bg-[#ff90e8] p-8 border-4 border-black shadow-[10px_10px_0px_#000000] rotate-[-1deg]',
        inputClass: 'bg-white border-4 border-black p-4 text-black focus:shadow-[5px_5px_0px_#000000] transition-shadow rounded-none font-black placeholder:text-gray-400',
        buttonClass: 'bg-black text-white font-black text-xl border-4 border-black py-4 shadow-[8px_8px_0px_#23a094] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1',
        titleClass: 'text-4xl font-black uppercase text-black mb-8 bg-white border-4 border-black p-4 inline-block transform rotate-1 shadow-[6px_6px_0px_#000000]',
        wishCardClass: 'bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000000] mb-6',
        accentColor: '#000000'
    },
    cloud: {
        id: 'cloud',
        name: 'Cloud Soft',
        containerClass: 'bg-white shadow-[0_30px_100px_rgba(0,0,0,0.06)] rounded-[3rem] p-10 border border-gray-50 flex flex-col items-center',
        inputClass: 'bg-gray-100/50 border-none rounded-full px-8 py-3.5 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-gray-900 placeholder:text-gray-300',
        buttonClass: 'bg-blue-400 text-white rounded-full font-black py-4 px-12 shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all text-lg',
        titleClass: 'text-3xl font-black text-blue-900/40 text-center mb-8 tracking-tighter uppercase',
        wishCardClass: 'bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-100 mb-4 w-full',
        accentColor: '#60a5fa'
    },
    monochrome: {
        id: 'monochrome',
        name: 'Pure Mono',
        containerClass: 'bg-white p-6 border-x border-gray-900 flex flex-col',
        inputClass: 'bg-transparent border-b border-gray-900 rounded-none px-0 py-2 focus:border-b-2 transition-all text-black placeholder:text-gray-300',
        buttonClass: 'bg-gray-900 text-white font-black py-3 px-8 uppercase tracking-[0.4em] hover:bg-white hover:text-gray-900 border border-gray-900 transition-all',
        titleClass: 'text-xs font-bold uppercase tracking-[0.8em] text-center text-gray-400 mb-12',
        wishCardClass: 'py-4 border-b border-gray-50 last:border-0 mb-2',
        accentColor: '#000000'
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get variant style by ID
 */
export function getVariantStyle(variantId: RSVPVariantId): VariantStyle {
    return RSVP_VARIANTS[variantId] || RSVP_VARIANTS.modern;
}

/**
 * Create config with variant defaults
 */
export function createRSVPWishesConfig(variantId: RSVPVariantId, overrides?: Partial<RSVPWishesConfig>): RSVPWishesConfig {
    return {
        ...DEFAULT_RSVP_WISHES_CONFIG,
        style: variantId,
        variant: variantId as any,
        ...overrides
    };
}
