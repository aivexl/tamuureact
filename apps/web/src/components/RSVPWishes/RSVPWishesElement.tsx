import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layer, RSVPWishesConfig } from '@/store/layersSlice';
import { getVariantStyle, DEFAULT_RSVP_WISHES_CONFIG, VariantStyle } from '@/lib/rsvp-variants';
import { rsvp } from '@/lib/api';
import { Send, Check, Loader2, Heart, Users } from 'lucide-react';

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
    isPreview?: boolean;
    invitationId?: string;
    onSubmitSuccess?: () => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ config, variant, isPreview, invitationId, onSubmitSuccess }) => {
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
        if (isPreview || !invitationId) return;

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
            <motion.div
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
            </motion.div>
        );
    }

    const primaryColor = config.primaryColor || variant.accentColor;
    const contrastColor = getContrastColor(primaryColor);

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Field */}
            {config.showNameField && (
                <div>
                    <label className={`block text-xs font-black mb-1.5 opacity-90 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
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
                            borderRadius: config.borderRadius,
                        }}
                    />
                </div>
            )}

            {/* Phone Field */}
            {config.showPhoneField && (
                <div>
                    <label className={`block text-xs font-medium mb-1.5 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.phoneLabel || 'Nomor WhatsApp'}
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full px-3 py-2 text-xs transition-all outline-none ${variant.inputClass}`}
                        style={{
                            ...variant.inputStyle,
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
                    <label className={`block text-xs font-medium mb-1.5 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
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
                            borderRadius: config.borderRadius,
                        }}
                    />
                </div>
            )}

            {/* Attendance - Inline compact buttons */}
            {config.showAttendanceField && (
                <div>
                    <label className={`block text-xs font-medium mb-2 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
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
                                        ? 'shadow-lg border-transparent'
                                        : 'bg-black/[0.1] dark:bg-white/[0.1] border-black/[0.1] dark:border-white/[0.1] hover:bg-black/[0.15] dark:hover:bg-white/[0.15]'
                                        }`}
                                    style={{
                                        borderRadius: config.borderRadius,
                                        backgroundColor: isSelected ? primaryColor : undefined,
                                        color: isSelected ? contrastColor : config.textColor,
                                        borderColor: isSelected ? 'transparent' : (variant.id === 'outline' ? config.textColor : undefined)
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
                    <label className={`text-[10px] font-bold uppercase tracking-tight ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.guestCountLabel || 'Jumlah Tamu'}:
                    </label>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleChange('guestCount', Math.max(1, formData.guestCount - 1))}
                            className="w-6 h-6 rounded-full bg-black/[0.1] dark:bg-white/[0.1] flex items-center justify-center text-xs font-black hover:bg-black/[0.2] dark:hover:bg-white/[0.2] transition-colors border border-black/[0.1] dark:border-white/[0.1] shadow-sm"
                            style={{ color: config.textColor }}
                        >
                            -
                        </button>
                        <span className="text-sm font-black w-4 text-center" style={{ color: config.textColor }}>
                            {formData.guestCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleChange('guestCount', Math.min(config.guestCountMax, formData.guestCount + 1))}
                            className="w-6 h-6 rounded-full bg-black/[0.1] dark:bg-white/[0.1] flex items-center justify-center text-xs font-black hover:bg-black/[0.2] dark:hover:bg-white/[0.2] transition-colors border border-black/[0.1] dark:border-white/[0.1] shadow-sm"
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
                    <label className={`block text-xs font-medium mb-1.5 ${variant.labelClass || ''}`} style={{ color: config.textColor }}>
                        {config.messageLabel || 'Ucapan & Doa'} {config.requireMessage && '*'}
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Tulis ucapan dan doa..."
                        rows={2}
                        maxLength={config.messageMaxLength}
                        required={config.requireMessage}
                        className={`w-full px-3 py-2 text-xs transition-all outline-none resize-none ${variant.inputClass}`}
                        style={{
                            ...variant.inputStyle,
                            borderRadius: config.borderRadius,
                            backgroundColor: config.inputBackgroundColor,
                            borderColor: config.inputBorderColor
                        }}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-red-500 text-xs text-center py-1">{error}</div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-black transition-all disabled:opacity-50 ${variant.buttonClass}`}
                style={{
                    ...variant.buttonStyle,
                    backgroundColor: primaryColor,
                    borderRadius: config.borderRadius,
                    color: config.buttonTextColor || contrastColor,
                    paddingTop: '0.625rem',
                    paddingBottom: '0.625rem'
                }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengirim...
                    </>
                ) : (
                    <>
                        <Send className="w-3.5 h-3.5" />
                        {config.submitButtonText}
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
        <motion.div
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
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-[11px] sm:text-xs font-black flex-shrink-0 shadow-inner"
                    style={{ backgroundColor: getColor(wish.name) }}
                >
                    {getInitial(wish.name)}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                    <span className="font-black text-[11px] sm:text-xs tracking-tight" style={{ color: config.textColor }}>{wish.name}</span>
                    {wish.attendance === 'attending' && (
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-black border border-green-500/10">Hadir</span>
                    )}
                </div>
                <p className="text-[11px] sm:text-xs opacity-80 leading-snug sm:leading-relaxed" style={{ color: config.textColor }}>{wish.message}</p>
                {config.showWishTimestamp && (
                    <div className="text-[8px] sm:text-[9px] opacity-40 mt-1 sm:mt-2 font-bold" style={{ color: config.textColor }}>{wish.submittedAt}</div>
                )}
            </div>
        </motion.div>
    );
};

// ============================================
// GUEST WISHES SECTION - Conditional
// ============================================
interface GuestWishesSectionProps {
    config: RSVPWishesConfig;
    invitationId?: string;
    isPreview?: boolean;
    refreshKey: number;
}

const GuestWishesSection: React.FC<GuestWishesSectionProps & { variant: VariantStyle }> = ({
    config,
    variant,
    invitationId,
    isPreview,
    refreshKey
}) => {
    const [wishes, setWishes] = useState<GuestWish[]>([]);
    const [loading, setLoading] = useState(!isPreview);

    useEffect(() => {
        if (isPreview) {
            setLoading(false);
            return;
        }

        if (!invitationId) {
            setLoading(false);
            return;
        }

        const formatTimeAgo = (date: Date): string => {
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} m lalu`;
            if (diffHours < 24) return `${diffHours} j lalu`;
            if (diffDays < 7) return `${diffDays} h lalu`;
            return date.toLocaleDateString('id-ID');
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
                            submittedAt: formatTimeAgo(new Date(d.submitted_at))
                        })));
                }
            } catch (err) {
                console.error('[RSVP] Fetch wishes error:', err);
            }
            setLoading(false);
        };

        fetchWishes();
        // Note: D1 doesn't support realtime subscriptions like Supabase
        // Consider polling or manual refresh for real-time updates
    }, [invitationId, isPreview, config.wishesMaxDisplay, refreshKey]);

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin opacity-20" /></div>;
    }

    if (wishes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
                <Heart className="w-5 h-5 mb-2" />
                <p className="text-[10px] font-bold">Belum ada ucapan</p>
                <p className="text-[9px]">Jadilah yang pertama!</p>
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
    isPreview?: boolean;
    invitationId?: string;
    onContentLoad?: () => void;
}

export const RSVPWishesElement: React.FC<RSVPWishesElementProps> = ({
    layer,
    isEditor,
    isPreview,
    invitationId,
    onContentLoad
}) => {
    const config = layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG;
    const variantId = config.style || config.variant || 'modern';
    const variant = useMemo(() => getVariantStyle(variantId as any), [variantId]);

    useEffect(() => { onContentLoad?.(); }, [onContentLoad]);

    const [refreshKey, setRefreshKey] = useState(0);
    const handleSubmitSuccess = () => setRefreshKey(prev => prev + 1);

    return (
        <div
            className={`w-full h-full overflow-y-auto custom-scrollbar transition-all duration-500 flex flex-col ${variant.containerClass}`}
            style={{
                ...variant.containerStyle,
                backgroundColor: config.backgroundColor || variant.containerStyle?.backgroundColor,
                borderRadius: config.borderRadius,
                fontFamily: config.fontFamily || variant.fontFamily,
                padding: '1.25rem'
            }}
        >
            {/* Form Section */}
            <div className="w-full flex-shrink-0">
                <h2 className={`text-center leading-tight mb-0.5 ${variant.titleClass.replace('text-2xl', 'text-lg sm:text-xl').replace('text-3xl', 'text-xl sm:text-2xl').replace('text-4xl', 'text-2xl sm:text-3xl').replace('text-5xl', 'text-3xl sm:text-4xl')}`} style={{ color: config.textColor }}>
                    {config.title}
                </h2>
                {config.subtitle && (
                    <p className={`text-center opacity-70 mb-3 sm:mb-4 text-[10px] sm:text-[11px] leading-tight sm:leading-relaxed ${variant.subtitleClass || ''}`} style={{ color: config.textColor }}>
                        {config.subtitle}
                    </p>
                )}
                <RSVPForm
                    config={config}
                    variant={variant}
                    isPreview={isEditor || isPreview}
                    invitationId={invitationId}
                    onSubmitSuccess={handleSubmitSuccess}
                />
            </div>

            {/* Wishes Section */}
            <div className="mt-4 pt-4 border-t flex-1 flex flex-col min-h-0" style={{ borderColor: `${config.textColor}15` }}>
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div>
                        <h3 className="text-xs sm:text-sm font-black tracking-tight" style={{ color: config.textColor }}>
                            {config.wishesTitle || 'Ucapan'}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] opacity-70 font-black" style={{ color: config.textColor }}>
                            {config.wishesSubtitle || 'Doa dari para tamu'}
                        </p>
                    </div>
                    <div className="flex -space-x-1.5 sm:-space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                    <GuestWishesSection
                        refreshKey={refreshKey}
                        config={config}
                        variant={variant}
                        invitationId={invitationId}
                        isPreview={isEditor || isPreview}
                    />
                </div>
            </div>
        </div>
    );
};

export default RSVPWishesElement;
