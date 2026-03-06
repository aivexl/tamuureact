import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { m } from 'framer-motion';
import { Layer, RSVPWishesConfig } from '@/store/layersSlice';
import { getVariantStyle, DEFAULT_RSVP_WISHES_CONFIG, VariantStyle } from '@/lib/rsvp-variants';
import { Send, Check, Heart, Users } from 'lucide-react';
import { rsvp } from '@/lib/api';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { useStore } from '@/store/useStore';

// ============================================
// TYPES
// ============================================
export interface RSVPSubmission {
    name: string;
    email?: string;
    phone?: string;
    attendance: 'attending' | 'not_attending' | 'maybe';
    guestCount: number;
    message?: string;
    mealPreference?: string;
    songRequest?: string;
}

export interface GuestWish {
    id: string;
    name: string;
    message: string;
    attendance: string;
    submittedAt: string;
}

// ============================================
// HELPERS
// ============================================
const getContrastColor = (hexcolor: string) => {
    if (!hexcolor || hexcolor === 'transparent') return '#ffffff';
    // Clean hex
    const hex = hexcolor.replace('#', '');
    if (hex.length !== 6) return '#ffffff';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 140) ? '#000000' : '#ffffff';
};

// ============================================
// COMPACT RSVP FORM
// ============================================
interface RSVPFormProps {
    config: RSVPWishesConfig;
    variant: VariantStyle;
    isDisabled?: boolean;
    invitationId?: string;
    onSubmitSuccess?: () => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ config, variant, isDisabled, invitationId, onSubmitSuccess }) => {
    const [formData, setFormData] = useState<RSVPSubmission>({
        name: '',
        email: '',
        phone: '',
        attendance: 'attending',
        guestCount: config.guestCountDefault,
        message: '',
        mealPreference: '',
        songRequest: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof RSVPSubmission, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDisabled || !invitationId) return;

        if (config.showNameField && formData.name.length < config.nameMinLength) {
            setError(`Nama minimal ${config.nameMinLength} karakter`);
            return;
        }
        if (config.requireMessage && !formData.message) {
            setError('Ucapan wajib diisi');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await rsvp.submit(invitationId, {
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                attendance: formData.attendance,
                guest_count: formData.guestCount,
                message: formData.message || undefined
            });
            setIsSubmitted(true);
            onSubmitSuccess?.();
        } catch (err) {
            console.error('[RSVP] Submit error:', err);
            setError('Gagal mengirim RSVP. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
            >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-base font-semibold" style={{ color: config.textColor }}>
                    {config.thankYouMessage}
                </h3>
            </m.div>
        );
    }

    const primaryColor = config.primaryColor || variant.accentColor;
    const contrastColor = getContrastColor(primaryColor);

    // Force solid input colors to prevent any visual gradients
    const solidInputStyle: React.CSSProperties = {
        color: '#1a1a1a', // strictly solid dark gray/black
        WebkitFontSmoothing: 'auto', // let browser render inputs normally
        opacity: 1
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Field */}
            {config.showNameField && (
                <div>
                    <label className={`block text-xs font-black mb-1.5 opacity-100 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.nameLabel || 'Nama Lengkap'} *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Masukkan nama Anda"
                        required
                        maxLength={config.nameMaxLength}
                        className={`w-full px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs transition-all outline-none border focus:opacity-100 ${variant.inputClass}`}
                        style={{
                            ...variant.inputStyle,
                            ...solidInputStyle,
                            borderRadius: config.borderRadius,
                        }}
                    />
                </div>
            )}

            {/* Phone Field */}
            {config.showPhoneField && (
                <div>
                    <label className={`block text-xs font-black mb-1.5 opacity-100 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.phoneLabel || 'Nomor WhatsApp'}
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full px-3 py-2 text-xs transition-all outline-none border ${variant.inputClass}`}
                        style={{
                            ...variant.inputStyle,
                            ...solidInputStyle,
                            borderRadius: config.borderRadius,
                            backgroundColor: config.inputBackgroundColor,
                            borderColor: config.inputBorderColor
                        }}
                    />
                </div>
            )}

            {/* Email Field */}
            {config.showEmailField && (
                <div>
                    <label className={`block text-xs font-black mb-1.5 opacity-100 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.emailLabel || 'Email'}
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="email@example.com"
                        className={`w-full px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs transition-all outline-none border ${variant.inputClass}`}
                        style={{
                            ...variant.inputStyle,
                            ...solidInputStyle,
                            borderRadius: config.borderRadius,
                        }}
                    />
                </div>
            )}

            {/* Attendance - Inline compact buttons */}
            {config.showAttendanceField && (
                <div>
                    <label className={`block text-xs font-black mb-2 opacity-100 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.attendanceLabel || 'Kehadiran'} *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {(['attending', 'not_attending', 'maybe'] as const).map((option) => {
                            if (option === 'maybe' && !config.attendanceOptions.maybe) return null;
                            const label = option === 'attending' ? config.attendanceOptions.attending :
                                option === 'not_attending' ? config.attendanceOptions.notAttending :
                                    config.attendanceOptions.maybe;
                            const isSelected = formData.attendance === option;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleChange('attendance', option)}
                                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-black transition-all border ${isSelected
                                        ? 'shadow-sm border-transparent opacity-100'
                                        : 'bg-black/[0.05] dark:bg-white/[0.05] border-black/[0.1] dark:border-white/[0.1] hover:bg-black/[0.1] dark:hover:bg-white/[0.1] opacity-80'
                                        }`}
                                    style={{
                                        borderRadius: config.borderRadius,
                                        backgroundColor: isSelected ? primaryColor : undefined,
                                        color: isSelected ? contrastColor : config.textColor,
                                        borderColor: isSelected ? 'transparent' : (variant.id === 'outline' ? config.textColor : undefined),
                                        WebkitFontSmoothing: 'auto'
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Guest Count - Compact inline */}
            {config.showGuestCountField && formData.attendance === 'attending' && (
                <div className="flex items-center gap-3 py-0.5 sm:py-1">
                    <label className={`text-[10px] font-black uppercase tracking-tight opacity-100 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.guestCountLabel || 'Jumlah Tamu'}:
                    </label>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleChange('guestCount', Math.max(1, formData.guestCount - 1))}
                            className="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center text-xs font-black hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-colors border border-black/[0.1] dark:border-white/[0.1]"
                            style={{ color: config.textColor }}
                        >
                            -
                        </button>
                        <span className="text-sm font-black w-4 text-center opacity-100" style={{ color: config.textColor }}>
                            {formData.guestCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleChange('guestCount', Math.min(config.guestCountMax, formData.guestCount + 1))}
                            className="w-6 h-6 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center text-xs font-black hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-colors border border-black/[0.1] dark:border-white/[0.1]"
                            style={{ color: config.textColor }}
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* Message - Compact textarea */}
            {config.showMessageField && (
                <div>
                    <label className={`block text-xs font-black mb-1.5 opacity-100 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.messageLabel || 'Ucapan & Doa'} {config.requireMessage && '*'}
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Tulis ucapan dan doa..."
                        rows={2}
                        maxLength={config.messageMaxLength}
                        required={config.requireMessage}
                        className={`w-full px-3 py-2 text-xs transition-all outline-none resize-none border ${variant.inputClass}`}
                        style={{
                            ...variant.inputStyle,
                            ...solidInputStyle,
                            borderRadius: config.borderRadius,
                            backgroundColor: config.inputBackgroundColor,
                            borderColor: config.inputBorderColor
                        }}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-red-500 text-xs text-center py-1 font-bold">{error}</div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || isDisabled}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-black transition-all disabled:opacity-50 shadow-md active:scale-95 opacity-100 ${variant.buttonClass}`}
                style={{
                    ...variant.buttonStyle,
                    backgroundColor: primaryColor,
                    borderRadius: config.borderRadius,
                    color: config.buttonTextColor || contrastColor,
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    WebkitFontSmoothing: 'auto'
                }}
            >
                {isSubmitting ? (
                    <>
                        <PremiumLoader variant="inline" size="sm" color="white" />
                        Mengirim...
                    </>
                ) : (
                    <>
                        <Send className="w-3.5 h-3.5" />
                        {/* CTO: Strongly enforce strictly 'Kirim' over legacy 'Kirim RSVP' */}
                        {(config.submitButtonText && config.submitButtonText.trim().toLowerCase() !== 'kirim rsvp') ? config.submitButtonText : 'Kirim'}
                    </>
                )}
            </button>
        </form>
    );
};

// ============================================
// WISH CARD - Compact
// ============================================
interface WishCardProps {
    wish: GuestWish;
    config: RSVPWishesConfig;
    variant: VariantStyle;
    index: number;
}

const WishCard: React.FC<WishCardProps> = ({ wish, config, variant, index }) => {
    const getInitial = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const getColor = (name: string) => {
        const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-2 sm:gap-3 p-3 sm:p-4 transition-all ${variant.wishCardClass}`}
            style={{
                ...variant.wishCardStyle,
                borderRadius: config.borderRadius
            }}
        >
            {config.showWishAvatar && (
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-[11px] sm:text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: getColor(wish.name) }}
                >
                    {getInitial(wish.name)}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                    <span className="font-black text-[11px] sm:text-xs tracking-tight opacity-100" style={{ color: config.textColor }}>{wish.name}</span>
                    {wish.attendance === 'attending' && (
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-black border border-green-500/10 opacity-100">Hadir</span>
                    )}
                </div>
                {/* CTO: Professional high-contrast text */}
                <p className="text-[11px] sm:text-xs leading-snug sm:leading-relaxed opacity-100 font-medium" style={{ color: config.textColor }}>{wish.message}</p>
                {config.showWishTimestamp && (
                    <div className="text-[8px] sm:text-[9px] opacity-70 mt-1 sm:mt-2 font-bold" style={{ color: config.textColor }}>{wish.submittedAt}</div>
                )}
            </div>
        </m.div>
    );
};

// ============================================
// GUEST WISHES SECTION - Conditional
// ============================================
interface GuestWishesSectionProps {
    config: RSVPWishesConfig;
    invitationId?: string;
    refreshKey: number;
}

const GuestWishesSection: React.FC<GuestWishesSectionProps & { variant: VariantStyle }> = ({
    config,
    variant,
    invitationId,
    refreshKey
}) => {
    const [wishes, setWishes] = useState<GuestWish[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!invitationId) {
            setLoading(false);
            return;
        }

        const formatTimeAgo = (dateStr: string): string => {
            // CTO FIX: Cloudflare D1 returns SQLite datetime as "YYYY-MM-DD HH:MM:SS" (UTC).
            // We MUST append 'Z' to force Javascript to parse it as UTC, then calculate diff against local now.
            const parsedDate = new Date(dateStr.replace(' ', 'T') + 'Z');
            const now = new Date();
            const diffMs = now.getTime() - parsedDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            // Time offset safeguard for slight server-client sync variations
            if (diffMins < 1 || diffMs < 0) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} m lalu`;
            if (diffHours < 24) return `${diffHours} j lalu`;
            if (diffDays < 7) return `${diffDays} h lalu`;
            return parsedDate.toLocaleDateString('id-ID');
        };

        const fetchWishes = async () => {
            try {
                const data = await rsvp.list(invitationId);
                if (data) {
                    setWishes(data
                        .filter((d: any) => d.message)
                        .slice(0, config.wishesMaxDisplay)
                        .map((d: any) => ({
                            id: d.id,
                            name: d.name,
                            message: d.message,
                            attendance: d.attendance,
                            submittedAt: formatTimeAgo(d.submitted_at)
                        })));
                }
            } catch (err) {
                console.error('[RSVP] Fetch wishes error:', err);
            }
            setLoading(false);
        };

        fetchWishes();
    }, [invitationId, config.wishesMaxDisplay, refreshKey]);

    if (loading) {
        return <div className="flex justify-center py-8"><PremiumLoader variant="inline" size="sm" color={config.textColor} /></div>;
    }

    if (wishes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-center opacity-70">
                <Heart className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-[10px] font-black opacity-100">Belum ada ucapan</p>
                <p className="text-[9px] font-bold">Jadilah yang pertama!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {wishes.map((wish, i) => (
                <WishCard key={wish.id} wish={wish} config={config} variant={variant} index={i} />
            ))}
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
interface RSVPWishesElementProps {
    layer: Layer;
    isEditor?: boolean;
    invitationId?: string;
    onContentLoad?: () => void;
    onDimensionsDetected?: (w: number, h: number) => void;
}

export const RSVPWishesElement: React.FC<RSVPWishesElementProps> = ({
    layer,
    isEditor,
    invitationId: propInvitationId,
    onContentLoad,
    onDimensionsDetected
}) => {
    const storeId = useStore(state => state.id);
    const updateLayer = useStore(state => state.updateLayer);
    const invitationId = propInvitationId || storeId;

    const config = layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG;
    const variantId = config.style || config.variant || 'modern';
    const variant = useMemo(() => getVariantStyle(variantId as any), [variantId]);

    const rootRef = useRef<HTMLDivElement>(null);
    const lastSyncRef = useRef<{ w: number, h: number }>({ w: 0, h: 0 });

    useEffect(() => { onContentLoad?.(); }, [onContentLoad]);

    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState<'rsvp' | 'wishes'>('rsvp');

    const handleSubmitSuccess = () => {
        setRefreshKey(prev => prev + 1);
        // CTO Flow: Automatically switch to wishes tab after successful RSVP to show their message
        setActiveTab('wishes');
    };

    // PERFECT-FIT AUTO-HEIGHT ALGORITHM FOR EDITOR AND PRODUCTION
    // This ensures the element is never cut off by expanding its bounding box
    // to strictly wrap the Form + exactly 350px of Wishes.
    useLayoutEffect(() => {
        if (!rootRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            // Measure the exact layout footprint required by the child elements
            const rect = entry.contentRect;
            const measuredW = Math.ceil(rect.width);
            const measuredH = Math.ceil(rect.height);

            const hasChangedLocally = measuredW !== lastSyncRef.current.w || measuredH !== lastSyncRef.current.h;

            if (hasChangedLocally) {
                lastSyncRef.current = { w: measuredW, h: measuredH };

                if (onDimensionsDetected) {
                    onDimensionsDetected(measuredW, measuredH);
                }

                if (isEditor && (Math.abs(measuredW - layer.width) > 5 || Math.abs(measuredH - layer.height) > 5)) {
                    // Force the store to update so the blue selection box adapts
                    updateLayer(layer.id, { height: measuredH });
                }
            }
        });

        observer.observe(rootRef.current);
        return () => observer.disconnect();
    }, [layer.id, layer.width, layer.height, isEditor, onDimensionsDetected, updateLayer, activeTab]); // Added activeTab to trigger height sync on switch

    return (
        <div
            ref={rootRef}
            // CTO: h-fit ensures the wrapper is naturally sized to its content.
            // If the parent AnimatedLayer enforces a smaller height, the flex-col handles it.
            className={`w-full h-fit flex flex-col transition-all duration-500 ${variant.containerClass}`}
            style={{
                ...variant.containerStyle,
                backgroundColor: config.backgroundColor || variant.containerStyle?.backgroundColor,
                borderRadius: config.borderRadius,
                fontFamily: config.fontFamily || variant.fontFamily,
                padding: 0
            }}
        >
            <div className="w-full flex flex-col">
                {/* Header Section (Always Visible) */}
                <div className="w-full flex-shrink-0 pt-6 px-6 sm:pt-8 sm:px-8 pb-4">
                    <h2 className={`text-center leading-tight mb-1 opacity-100 font-black ${variant.titleClass.replace('text-2xl', 'text-xl sm:text-2xl').replace('text-3xl', 'text-2xl sm:text-3xl').replace('text-4xl', 'text-3xl sm:text-4xl').replace('text-5xl', 'text-4xl sm:text-5xl')}`} style={{ color: config.textColor }}>
                        {config.title}
                    </h2>
                    {config.subtitle && (
                        <p className={`text-center text-[11px] sm:text-xs leading-relaxed font-bold opacity-100 ${variant.subtitleClass || ''}`} style={{ color: config.textColor }}>
                            {config.subtitle}
                        </p>
                    )}
                </div>

                {/* Tab Navigation (Segmented Control) */}
                <div className="px-6 sm:px-8 mb-4">
                    <div className="flex p-1 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl border border-black/5 dark:border-white/5">
                        <button
                            onClick={() => setActiveTab('rsvp')}
                            type="button"
                            className={`flex-1 py-2.5 text-[11px] sm:text-xs font-black rounded-lg transition-all duration-300 ${activeTab === 'rsvp' ? 'bg-white dark:bg-neutral-800 shadow-sm opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            style={{ color: activeTab === 'rsvp' ? (config.primaryColor || config.textColor) : config.textColor }}
                        >
                            Formulir RSVP
                        </button>
                        <button
                            onClick={() => setActiveTab('wishes')}
                            type="button"
                            className={`flex-1 py-2.5 text-[11px] sm:text-xs font-black rounded-lg transition-all duration-300 ${activeTab === 'wishes' ? 'bg-white dark:bg-neutral-800 shadow-sm opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            style={{ color: activeTab === 'wishes' ? (config.primaryColor || config.textColor) : config.textColor }}
                        >
                            Ucapan & Doa
                        </button>
                    </div>
                </div>

                {/* Tab Content Area */}
                <div className="w-full relative">
                    {activeTab === 'rsvp' && (
                        <div className="w-full px-6 sm:px-8 pb-6 sm:pb-8 animate-in fade-in zoom-in-95 duration-300">
                            <RSVPForm
                                config={config}
                                variant={variant}
                                isDisabled={isEditor}
                                invitationId={invitationId}
                                onSubmitSuccess={handleSubmitSuccess}
                            />
                        </div>
                    )}

                    {activeTab === 'wishes' && (
                        <div className="w-full flex flex-col h-[380px] animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0 px-6 sm:px-8">
                                <div>
                                    <h3 className="text-sm sm:text-base font-black tracking-tight opacity-100" style={{ color: config.textColor }}>
                                        {config.wishesTitle || 'Ucapan & Doa'}
                                    </h3>
                                    <p className="text-[10px] sm:text-[11px] opacity-100 font-bold" style={{ color: config.textColor }}>
                                        {config.wishesSubtitle || 'Pesan dari keluarga dan sahabat'}
                                    </p>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                                            <Users className="w-3 h-3 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* The stack area for wishes (Internal Scrollable) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 pb-8">
                                <GuestWishesSection
                                    refreshKey={refreshKey}
                                    config={config}
                                    variant={variant}
                                    invitationId={invitationId}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RSVPWishesElement;
