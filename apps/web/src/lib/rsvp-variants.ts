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
    variant: 'modern' as any,

    title: 'Konfirmasi Kehadiran',
    subtitle: 'Kami menantikan kehadiran Anda',
    submitButtonText: 'Kirim',
    wishesTitle: 'Ucapan & Doa',
    wishesSubtitle: 'Dari para tamu undangan',
    thankYouMessage: 'Terima kasih atas konfirmasi Anda!',

    showNameField: true,
    showEmailField: false,
    showPhoneField: true,
    showAttendanceField: true,
    showGuestCountField: true,
    showMessageField: true,
    showMealPreference: false,
    showSongRequest: false,

    nameLabel: 'Nama Lengkap',
    emailLabel: 'Email',
    phoneLabel: 'Nomor WhatsApp',
    attendanceLabel: 'Konfirmasi Kehadiran',
    guestCountLabel: 'Jumlah Tamu',
    messageLabel: 'Ucapan & Doa',

    attendanceOptions: {
        attending: 'Hadir',
        notAttending: 'Tidak Hadir',
        maybe: 'Belum Pasti'
    },

    guestCountMax: 5,
    guestCountDefault: 1,

    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#1d1d1f',
    borderRadius: 16,

    wishesLayout: 'list',
    wishesMaxDisplay: 50,
    showWishTimestamp: true,
    showWishAvatar: true,
    wishCardStyle: 'minimal',
    wishesAutoScroll: false,

    nameMinLength: 2,
    nameMaxLength: 100,
    messageMinLength: 0,
    messageMaxLength: 500,
    requireMessage: false,

    enableCaptcha: false,
    captchaType: 'simple',

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
    containerClass: string;
    containerStyle?: React.CSSProperties;
    inputClass: string;
    inputStyle?: React.CSSProperties;
    buttonClass: string;
    buttonStyle?: React.CSSProperties;
    titleClass: string;
    subtitleClass?: string;
    labelClass?: string;
    wishCardClass: string;
    wishCardStyle?: React.CSSProperties;
    accentColor: string;
    fontFamily?: string;
}

export const RSVP_VARIANTS: Record<RSVPVariantId, VariantStyle> = {
    classic: {
        id: 'classic',
        name: 'Classic Signature',
        containerClass: 'bg-[#faf9f6] border border-[#e5e0d8] shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-6 sm:p-8',
        inputClass: 'bg-white border border-[#e5e0d8] rounded-xl focus:border-[#bfa181] focus:ring-4 focus:ring-[#bfa181]/10 transition-all font-serif text-[#4a4238] placeholder:text-gray-400 px-4 py-3',
        buttonClass: 'bg-[#bfa181] hover:bg-[#a68a6b] text-white font-serif uppercase tracking-[0.15em] py-3.5 rounded-xl font-medium transition-colors shadow-md shadow-[#bfa181]/20 active:scale-[0.98]',
        titleClass: 'text-2xl sm:text-3xl font-serif text-[#4a4238] mb-6 font-medium text-center',
        wishCardClass: 'bg-white border border-[#e5e0d8] rounded-xl shadow-sm p-4 mb-3',
        accentColor: '#bfa181'
    },
    minimal: {
        id: 'minimal',
        name: 'Clean Minimal',
        containerClass: 'bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 rounded-[2rem] border border-black/[0.04]',
        inputClass: 'bg-gray-50/80 border border-gray-100 rounded-2xl focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all px-4 py-3 text-gray-900 placeholder:text-gray-400 font-medium',
        buttonClass: 'bg-[#1d1d1f] text-white px-8 py-3.5 rounded-2xl font-semibold tracking-tight hover:bg-[#000000] active:scale-[0.98] transition-all shadow-md',
        titleClass: 'text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-6 text-center',
        wishCardClass: 'bg-gray-50/80 rounded-2xl p-4 mb-3 border border-gray-100/50',
        accentColor: '#1d1d1f'
    },
    modern: {
        id: 'modern',
        name: 'Soft Modern',
        containerClass: 'bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.12)] p-6 sm:p-8 border border-blue-50/80',
        inputClass: 'bg-[#f4f7fb] border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 px-4 py-3 placeholder:text-gray-400 text-slate-800 transition-all font-medium',
        buttonClass: 'bg-blue-600 text-white rounded-2xl font-semibold py-3.5 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]',
        titleClass: 'text-2xl font-bold text-slate-900 tracking-tight mb-6 text-center',
        wishCardClass: 'bg-[#f4f7fb] rounded-2xl p-4 mb-3 border border-transparent',
        accentColor: '#2563eb'
    },
    elegant: {
        id: 'elegant',
        name: 'Elegant Script',
        containerClass: 'bg-white border border-[#f1ede6] p-6 sm:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(212,175,55,0.06)]',
        inputClass: 'bg-[#fcfbf9] border border-[#f1ede6] rounded-xl focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 px-4 py-3 font-serif text-[#5c5446] placeholder:text-gray-400 transition-all',
        buttonClass: 'bg-[#d4af37] text-white font-serif tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#c5a028] transition-all shadow-lg shadow-[#d4af37]/25 font-medium active:scale-[0.98]',
        titleClass: 'text-3xl font-serif text-[#5c5446] text-center mb-6',
        wishCardClass: 'bg-[#fcfbf9] border border-[#f1ede6] p-4 font-serif mb-3 rounded-xl',
        accentColor: '#d4af37'
    },
    rustic: {
        id: 'rustic',
        name: 'Rustic Warmth',
        containerClass: 'bg-[#faf7f2] border border-[#8b4513]/10 p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgba(139,69,19,0.06)]',
        inputClass: 'bg-white border border-[#8b4513]/15 rounded-xl px-4 py-3 placeholder:text-gray-400 focus:border-[#8b4513]/40 focus:ring-4 focus:ring-[#8b4513]/10 text-[#5c3a21] transition-all',
        buttonClass: 'bg-[#8b4513] text-white font-semibold py-3.5 rounded-xl hover:bg-[#70360e] shadow-md shadow-[#8b4513]/20 transition-all active:scale-[0.98]',
        titleClass: 'text-2xl font-bold text-[#5c3a21] mb-6 font-serif text-center',
        wishCardClass: 'bg-white border border-[#8b4513]/10 rounded-xl p-4 mb-3 shadow-sm',
        accentColor: '#8b4513'
    },
    romantic: {
        id: 'romantic',
        name: 'Sweet Romance',
        containerClass: 'bg-[#fff0f5]/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white/60 shadow-[0_20px_50px_rgba(251,113,133,0.12)]',
        inputClass: 'bg-white/80 border border-rose-100 rounded-2xl px-4 py-3 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-200/50 transition-all text-rose-900 placeholder:text-gray-400',
        buttonClass: 'bg-rose-500 text-white rounded-2xl font-semibold py-3.5 hover:bg-rose-600 shadow-[0_8px_20px_-6px_rgba(244,63,94,0.5)] active:scale-[0.98] transition-all',
        titleClass: 'text-2xl font-semibold text-rose-800 mb-6 text-center tracking-tight',
        wishCardClass: 'bg-white/80 rounded-2xl p-4 border border-rose-50 mb-3 shadow-sm',
        accentColor: '#f43f5e'
    },
    floral: {
        id: 'floral',
        name: 'Spring Floral',
        containerClass: 'bg-white p-6 sm:p-8 rounded-[2rem] border border-pink-100 shadow-[0_15px_40px_rgba(236,72,153,0.08)]',
        inputClass: 'bg-pink-50/50 border border-pink-100 rounded-2xl focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-200/50 text-pink-900 placeholder:text-gray-400 px-4 py-3 transition-all',
        buttonClass: 'bg-pink-500 text-white rounded-2xl font-semibold py-3.5 hover:bg-pink-600 transition-all shadow-[0_8px_20px_-6px_rgba(236,72,153,0.4)] active:scale-[0.98]',
        titleClass: 'text-2xl font-bold text-pink-900 mb-6 tracking-tight text-center',
        wishCardClass: 'bg-pink-50/40 rounded-2xl p-4 border border-pink-100/50 mb-3',
        accentColor: '#ec4899'
    },
    boho: {
        id: 'boho',
        name: 'Boho Spirit',
        containerClass: 'bg-[#fcfbf9] p-6 sm:p-8 rounded-[2rem] border border-[#d2b48c]/40 shadow-[0_10px_40px_rgba(210,180,140,0.1)]',
        inputClass: 'bg-white border border-[#d2b48c]/40 rounded-xl focus:border-[#a68a6b] focus:ring-4 focus:ring-[#d2b48c]/20 transition-all px-4 py-3 text-[#5c4a3d] placeholder:text-gray-400 font-medium',
        buttonClass: 'bg-[#a68a6b] text-white rounded-xl font-semibold tracking-wide py-3.5 hover:bg-[#8b7355] transition-all shadow-md active:scale-[0.98]',
        titleClass: 'text-2xl font-medium tracking-[0.1em] uppercase text-[#5c4a3d] mb-6 text-center',
        wishCardClass: 'bg-white border border-[#d2b48c]/30 rounded-xl p-4 mb-3 shadow-sm',
        accentColor: '#a68a6b'
    },
    luxury: {
        id: 'luxury',
        name: 'Midnight Luxury',
        containerClass: 'bg-[#0f1115] text-white p-6 sm:p-8 border border-[#d4af37]/30 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.08)]',
        inputClass: 'bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/20 focus:bg-white/10 transition-all placeholder:text-gray-400 px-4 py-3',
        buttonClass: 'bg-[#d4af37] text-[#0f1115] font-bold tracking-[0.1em] py-3.5 rounded-xl hover:bg-[#eadd8a] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]',
        titleClass: 'text-2xl font-bold text-[#d4af37] tracking-[0.15em] mb-6 text-center uppercase',
        wishCardClass: 'bg-white/5 border border-white/10 rounded-xl p-4 mb-3 backdrop-blur-md',
        accentColor: '#d4af37'
    },
    dark: {
        id: 'dark',
        name: 'Deep Slate',
        containerClass: 'bg-[#1e293b] text-white p-6 sm:p-8 rounded-[2rem] border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
        inputClass: 'bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-slate-800 transition-all placeholder:text-gray-400 px-4 py-3',
        buttonClass: 'bg-indigo-500 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-400 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] active:scale-[0.98] transition-all',
        titleClass: 'text-2xl font-bold text-white mb-6 tracking-tight text-center',
        wishCardClass: 'bg-slate-800/80 border border-slate-700 rounded-xl p-4 mb-3',
        accentColor: '#6366f1'
    },
    glass: {
        id: 'glass',
        name: 'Frosted Glass',
        containerClass: 'bg-white/60 backdrop-blur-2xl border border-white/50 p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]',
        inputClass: 'bg-white/50 border border-white/60 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white/80 focus:border-white focus:ring-4 focus:ring-white/50 transition-all px-4 py-3',
        buttonClass: 'bg-[#1d1d1f] text-white font-semibold py-3.5 rounded-xl hover:bg-[#000000] active:scale-[0.98] transition-all shadow-md',
        titleClass: 'text-2xl font-bold text-gray-900 text-center mb-6 tracking-tight',
        wishCardClass: 'bg-white/60 backdrop-blur-xl border border-white/50 p-4 rounded-xl mb-3 shadow-sm',
        accentColor: '#1d1d1f'
    },
    neon: {
        id: 'neon',
        name: 'Cyber Neon',
        containerClass: 'bg-[#09090b] text-white p-6 sm:p-8 rounded-[2rem] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]',
        inputClass: 'bg-[#18181b] border border-cyan-900 rounded-xl text-cyan-50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-400 px-4 py-3',
        buttonClass: 'bg-cyan-500 text-[#09090b] font-bold py-3.5 rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98]',
        titleClass: 'text-2xl font-bold text-cyan-400 tracking-tight mb-6 text-center',
        wishCardClass: 'bg-[#18181b] border border-cyan-900/50 rounded-xl p-4 mb-3',
        accentColor: '#06b6d4'
    },
    vintage: {
        id: 'vintage',
        name: 'Old Newspaper',
        containerClass: 'bg-[#f5f2eb] p-6 sm:p-8 border border-[#3d2b1f]/20 rounded-[1.5rem] shadow-[0_10px_30px_rgba(61,43,31,0.08)] font-serif',
        inputClass: 'bg-white/60 border border-[#3d2b1f]/20 rounded-xl px-4 py-3 font-serif focus:bg-white focus:border-[#3d2b1f]/40 focus:ring-4 focus:ring-[#3d2b1f]/10 transition-all text-[#3d2b1f] placeholder:text-gray-400',
        buttonClass: 'bg-[#3d2b1f] text-white font-serif uppercase py-3.5 rounded-xl hover:bg-[#2a1d15] transition-all font-semibold shadow-md active:scale-[0.98]',
        titleClass: 'text-2xl font-serif font-bold text-[#3d2b1f] mb-6 text-center',
        wishCardClass: 'bg-white/60 border border-[#3d2b1f]/10 rounded-xl p-4 mb-3 shadow-sm',
        accentColor: '#3d2b1f'
    },
    bold: {
        id: 'bold',
        name: 'High Contrast',
        containerClass: 'bg-white p-6 sm:p-8 border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl',
        inputClass: 'bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-semibold text-black placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-black/10 transition-all',
        buttonClass: 'bg-black text-white font-bold text-lg py-3.5 rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:scale-[0.98]',
        titleClass: 'text-3xl font-black uppercase tracking-tight text-black mb-6 text-center',
        wishCardClass: 'bg-white border-2 border-black rounded-xl p-4 mb-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]',
        accentColor: '#000000'
    },
    outline: {
        id: 'outline',
        name: 'Linear Outline',
        containerClass: 'bg-white border border-gray-300 p-6 sm:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)]',
        inputClass: 'bg-transparent border border-gray-300 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 rounded-xl transition-all text-gray-900 placeholder:text-gray-400 px-4 py-3',
        buttonClass: 'bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-[0.98]',
        titleClass: 'text-2xl font-semibold text-gray-900 mb-6 text-center tracking-tight',
        wishCardClass: 'bg-white border border-gray-200 rounded-xl p-4 mb-3',
        accentColor: '#111827'
    },
    pastel: {
        id: 'pastel',
        name: 'Pastel Dream',
        containerClass: 'bg-[#fbfaff] p-6 sm:p-8 rounded-[2rem] border border-indigo-50 shadow-[0_20px_50px_rgba(99,102,241,0.06)]',
        inputClass: 'bg-white border border-indigo-50 rounded-xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800 placeholder:text-gray-400 px-4 py-3',
        buttonClass: 'bg-indigo-400 text-white rounded-xl font-semibold py-3.5 shadow-[0_8px_20px_-6px_rgba(129,140,248,0.5)] hover:bg-indigo-500 active:scale-[0.98] transition-all',
        titleClass: 'text-2xl font-bold text-indigo-900 text-center mb-6 tracking-tight',
        wishCardClass: 'bg-white rounded-xl p-4 shadow-sm border border-indigo-50 mb-3',
        accentColor: '#818cf8'
    },
    geometric: {
        id: 'geometric',
        name: 'Geo Grid',
        containerClass: 'bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)]',
        inputClass: 'bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-slate-900 placeholder:text-gray-400 px-4 py-3 font-medium',
        buttonClass: 'bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] active:scale-[0.98]',
        titleClass: 'text-2xl font-bold text-slate-900 tracking-tight mb-6 text-center',
        wishCardClass: 'bg-slate-50 border border-slate-100 rounded-xl p-4 mb-3',
        accentColor: '#2563eb'
    },
    brutalist: {
        id: 'brutalist',
        name: 'Neo Brutalist',
        containerClass: 'bg-gray-100 p-6 sm:p-8 border-2 border-black rounded-3xl shadow-[8px_8px_0px_#000000]',
        inputClass: 'bg-white border-2 border-black p-3 text-black focus:ring-4 focus:ring-black/10 transition-all rounded-xl font-medium placeholder:text-gray-400',
        buttonClass: 'bg-[#ff5757] text-black font-bold text-lg border-2 border-black py-3.5 rounded-xl shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-[0.98]',
        titleClass: 'text-2xl font-black uppercase text-black mb-6 text-center',
        wishCardClass: 'bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000000] mb-3',
        accentColor: '#ff5757'
    },
    cloud: {
        id: 'cloud',
        name: 'Cloud Soft',
        containerClass: 'bg-white shadow-[0_30px_60px_rgba(14,165,233,0.08)] rounded-[2.5rem] p-6 sm:p-8 border border-sky-50',
        inputClass: 'bg-sky-50/50 border border-sky-100/50 rounded-2xl px-4 py-3 focus:bg-white focus:border-sky-300 focus:ring-4 focus:ring-sky-200/50 transition-all text-slate-800 placeholder:text-gray-400 font-medium',
        buttonClass: 'bg-sky-500 text-white rounded-2xl font-semibold py-3.5 shadow-[0_8px_20px_-6px_rgba(14,165,233,0.4)] hover:bg-sky-600 active:scale-[0.98] transition-all',
        titleClass: 'text-2xl font-bold text-sky-950 text-center mb-6 tracking-tight',
        wishCardClass: 'bg-sky-50/30 rounded-2xl p-4 shadow-sm border border-sky-50 mb-3',
        accentColor: '#0ea5e9'
    },
    monochrome: {
        id: 'monochrome',
        name: 'Pure Mono',
        containerClass: 'bg-white p-6 sm:p-8 border border-gray-200 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col',
        inputClass: 'bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-black placeholder:text-gray-400 font-medium',
        buttonClass: 'bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-900 shadow-md active:scale-[0.98] transition-all',
        titleClass: 'text-2xl font-bold tracking-tight text-center text-black mb-6',
        wishCardClass: 'bg-gray-50 border border-gray-100 rounded-xl p-4 mb-3',
        accentColor: '#000000'
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getVariantStyle(variantId: RSVPVariantId): VariantStyle {
    return RSVP_VARIANTS[variantId] || RSVP_VARIANTS.modern;
}

export function createRSVPWishesConfig(variantId: RSVPVariantId, overrides?: Partial<RSVPWishesConfig>): RSVPWishesConfig {
    return {
        ...DEFAULT_RSVP_WISHES_CONFIG,
        style: variantId,
        variant: variantId as any,
        ...overrides
    };
}
