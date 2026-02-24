import React, { useState, useMemo, Suspense, lazy, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { templates as templatesApi, invitations as invitationsApi, users as usersApi, Category } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useTemplates, useCategories, useWishlist, useToggleWishlist } from '@/hooks/queries';

import {
    Search,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Heart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

// Lazy load the grid to reduce initial payload and TBT
const InvitationsGrid = lazy(() => import('../components/Store/InvitationsGrid'));

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    category?: string;
    price?: number;
}

const GridLoader = () => (
    <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#FFBF00] rounded-full animate-spin"></div>
    </div>
);

const getIsAppDomain = (): boolean => {
    const host = window.location.hostname;
    return host.startsWith('app.') || host === 'localhost' || host === '127.0.0.1';
};


const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch (e) {
        return dateStr;
    }
};

// More robust, deep clone function
const deepClone = (obj: any) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
};

export const InvitationsStorePage: React.FC = () => {
    const { search } = useLocation();
    const { isAuthenticated, user, showModal } = useStore();
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);
    const isOnboarding = queryParams.get('onboarding') === 'true';
    const onboardingSlug = queryParams.get('slug');
    const onboardingName = queryParams.get('name');
    const onboardingTemplateId = queryParams.get('templateId');

    const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates();
    const { data: categoryList = [] } = useCategories();
    const { data: wishlistData = [] } = useWishlist(user?.id);
    const toggleWishlistMutation = useToggleWishlist();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const wishlist = useMemo(() => wishlistData as string[], [wishlistData]);

    useSEO({
        title: 'Koleksi Desain Undangan Digital Premium',
        description: 'Jelajahi ratusan desain undangan digital premium dari Tamuu. Pilih tema terbaik untuk pernikahan, ulang tahun, dan acara spesial Anda.'
    });

    const handleToggleWishlist = useCallback(async (templateId: string, isWishlisted: boolean) => {
        if (!user?.id) {
            navigate('/login');
            return;
        }
        toggleWishlistMutation.mutate({
            userId: user.id,
            templateId,
            isWishlisted
        });
    }, [user?.id, navigate, toggleWishlistMutation]);

    const filteredTemplates = useMemo(() => {
        return templates.filter((t: Template) => {
            const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
            const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFavorites = !showFavoritesOnly || wishlist.includes(t.id);
            return matchesCategory && matchesSearch && matchesFavorites;
        });
    }, [templates, selectedCategory, searchQuery, showFavoritesOnly, wishlist]);

    const handleUseTemplate = async (templateId: string) => {
        if (!isAuthenticated) {
            const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
            navigate(`/login?redirect=${redirectUrl}`);
            return;
        }

        const maxInvitations = user?.maxInvitations || 1;
        const invitationCount = user?.invitationCount || 0;
        if (invitationCount >= maxInvitations) {
            const tierName = user?.tier === 'vvip' ? 'ELITE' : user?.tier === 'platinum' ? 'ULTIMATE' : user?.tier === 'vip' ? 'PRO' : 'FREE';
            showModal({
                title: 'Kuota Undangan Penuh',
                message: `Paket ${tierName} Anda hanya memiliki ${maxInvitations} slot undangan aktif. Upgrade ke paket yang lebih tinggi untuk membuat undangan baru!`,
                type: 'warning',
                confirmText: 'Lihat Paket Upgrade',
                onConfirm: () => navigate('/upgrade')
            });
            return;
        }

        if (isOnboarding) {
            setIsCreating(true);
            try {
                const templateData = await templatesApi.get(templateId);
                const rawOnboardingData = localStorage.getItem('tamuu_onboarding_data');
                const magic = rawOnboardingData ? JSON.parse(rawOnboardingData) : null;

                let finalSections = deepClone(templateData.sections || []);

                if (magic) {
                    // SYNC: Update user profile first so GiftPanel has the latest data
                    if (user?.id) {
                         // We don't await this to keep UI snappy, or we can await if we want to be sure.
                         // Given we are about to create an invitation, let's await to ensure consistency.
                         try {
                            await usersApi.updateProfile({
                                id: user.id,
                                bank1Name: magic.bank1Name,
                                bank1Number: magic.bank1Number,
                                bank1Holder: magic.bank1Holder,
                                bank2Name: magic.bank2Name,
                                bank2Number: magic.bank2Number,
                                bank2Holder: magic.bank2Holder,
                                emoneyType: magic.emoneyType,
                                emoneyNumber: magic.emoneyNumber,
                                giftRecipient: magic.giftRecipientName, // Map from onboarding key to DB key
                                giftAddress: magic.giftAddress
                            });
                         } catch (err) {
                             console.warn('Background profile sync failed:', err);
                         }
                    }

                    const formattedDate = magic.eventDate ? formatIndonesianDate(magic.eventDate) : 'Tanggal Acara';
                    const recipientName = magic.giftRecipientName || user?.giftRecipientName || 'JOHN';
                    const recipientAddress = magic.giftAddress || user?.giftAddress || 'Alamat lengkap Anda di sini';

                    const replacementMap = new Map([
                        // Main Details
                        [/Mempelai Pria/g, magic.groomName || 'Mempelai Pria'],
                        [/Mempelai Wanita/g, magic.brideName || 'Mempelai Wanita'],
                        [/Nama Mempelai/g, magic.celebrantName || magic.invitationName || 'Nama Mempelai'],
                        [/Tanggal Acara/g, formattedDate],
                        [/Lokasi Acara/g, magic.eventLocation || 'Lokasi Acara'],

                        // Bank Account
                        [/0000000000/g, magic.bank1Number || '0000000000'],
                        [/Nama Bank/g, magic.bank1Name || 'Nama Bank'],
                        [/Atas Nama/g, magic.bank1Holder || 'Atas Nama'],
                        
                        // [FIX] Address Card Placeholders
                        [/JOHN/g, recipientName],
                        [/Alamat lengkap Anda di sini/g, recipientAddress],
                        [/Alamat Lengkap/g, recipientAddress], // Add variation
                        [/NAMA PENERIMA/g, recipientName], // Add variation
                    ]);

                    const traverseAndReplace = (obj: any) => {
                        for (const key in obj) {
                            if (typeof obj[key] === 'string') {
                                replacementMap.forEach((replacement, regex) => {
                                    obj[key] = obj[key].replace(regex, replacement);
                                });
                            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                                traverseAndReplace(obj[key]);
                            }
                        }
                    };

                    traverseAndReplace(finalSections);

                    // Surgical sync for complex components (Photos, Countdown, etc.)
                    finalSections.forEach((section: any) => {
                        if (section.layers) {
                            section.layers.forEach((layer: any) => {
                                // Photo & Countdown Sync
                                if (magic.photoPreview && (layer.name?.toLowerCase().includes('foto utama') || layer.name?.toLowerCase().includes('hero'))) layer.url = magic.photoPreview;
                                if (magic.groomPhoto && layer.name?.toLowerCase().includes('pria')) layer.url = magic.groomPhoto;
                                if (magic.bridePhoto && layer.name?.toLowerCase().includes('wanita')) layer.url = magic.bridePhoto;
                                if (layer.type === 'profile_photo') {
                                    if (layer.profilePhotoConfig?.role === 'mempelai_pria' && magic.groomPhoto) layer.imageUrl = magic.groomPhoto;
                                    else if (layer.profilePhotoConfig?.role === 'mempelai_wanita' && magic.bridePhoto) layer.imageUrl = magic.bridePhoto;
                                }
                                const targetDateTime = magic.eventDate && magic.eventTime ? new Date(`${magic.eventDate}T${magic.eventTime}`).toISOString() : magic.eventDate ? new Date(`${magic.eventDate}T09:00:00`).toISOString() : null;
                                if (targetDateTime && (layer.type === 'countdown' || layer.name?.toLowerCase().includes('countdown'))) {
                                    layer.countdownConfig = { ...(layer.countdownConfig || {}), targetDate: targetDateTime };
                                }

                                // Gallery Sync
                                if (magic.galleryPhotos?.length > 0 && layer.name?.toLowerCase().includes('gallery')) {
                                    const match = layer.name.match(/gallery\s*(\d+)/i);
                                    if (match) {
                                        const idx = parseInt(match[1]) - 1;
                                        if (magic.galleryPhotos[idx]) layer.url = magic.galleryPhotos[idx];
                                    }
                                }
                            });
                        }
                    });
                }

                const newInvitation = await invitationsApi.create({
                    ...templateData,
                    user_id: user?.id,
                    id: undefined,
                    template_id: templateId,
                    name: onboardingName || magic?.invitationName || `Undangan ${onboardingSlug}`,
                    slug: onboardingSlug,
                    sections: finalSections,
                    is_published: false
                });

                localStorage.removeItem('tamuu_onboarding_data');
                localStorage.removeItem('tamuu_onboarding_progress');

                const newUrl = `/user/editor/${newInvitation.id}`;
                if (getIsAppDomain()) {
                    navigate(newUrl);
                } else {
                    window.location.href = `https://app.tamuu.id${newUrl}`;
                }

            } catch (error: any) {
                console.error('Failed to create invitation during onboarding:', error);
                showModal({
                    title: 'Gagal Menyiapkan Undangan',
                    message: 'Terjadi kesalahan tak terduga saat menyinkronkan data Anda. Silakan coba lagi atau hubungi dukungan.',
                    type: 'error'
                });
            } finally {
                setIsCreating(false);
            }
        } else if (!getIsAppDomain()) {
            window.location.href = `https://app.tamuu.id/onboarding?templateId=${templateId}`;
        } else {
            navigate(`/onboarding?templateId=${templateId}`);
        }
    };

    const previewTemplate = (slug: string | undefined, id: string) => {
        window.open(`/preview/${slug || id}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 pt-14">
            {isCreating && (
                <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center">
                    <PremiumLoader
                        variant="inline"
                        size="lg"
                        showLabel
                        label="Menyiapkan Undanganmu..."
                        color="#14b8a6"
                    />
                </div>
            )}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AnimatePresence>
                    {isOnboarding && (
                        <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-900/95 backdrop-blur-md text-white py-3 px-4 overflow-hidden sticky top-14 z-40 border-b border-white/10 shadow-2xl shadow-black/20"
                        >
                            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Kembali</span>
                                </button>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center flex-1">
                                    Langkah Terakhir: <span className="text-teal-400">Pilih Desain Dasar</span> Untuk <span className="text-white italic">"{onboardingName || onboardingSlug}"</span>
                                </p>
                                <div className="w-16 hidden sm:block" />
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>

                <header className="pt-32 pb-16 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 rounded-full shadow-sm mb-8">
                            <Sparkles className="w-4 h-4 text-[#FFBF00]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Koleksi Desain Mahakarya</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 text-slate-900">
                            Pilih Desain <span className="text-amber-900">Terbaik</span> Untuk Momen Anda
                        </h1>

                        <div className="relative max-w-2xl mx-auto mb-12 group">
                            <div className="absolute inset-0 bg-[#FFD700]/10 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-100 overflow-hidden flex items-center p-2 focus-within:ring-4 focus-within:ring-[#FFBF00]/10 transition-all duration-500">
                                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 ml-4 sm:ml-6 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Cari tema atau kategori..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 px-3 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-700 placeholder:text-slate-300"
                                    aria-label="Cari undangan"
                                />
                                <button
                                    className="bg-slate-900 text-white p-3 sm:p-4 rounded-[1.5rem] hover:bg-[#FFBF00] hover:text-slate-900 transition-all shadow-lg shrink-0"
                                    aria-label="Submit pencarian"
                                >
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-3"
                        >
                            <button
                                onClick={() => { setSelectedCategory('All'); setShowFavoritesOnly(false); }}
                                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === 'All' && !showFavoritesOnly
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                All
                            </button>

                            {categoryList.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.name); setShowFavoritesOnly(false); }}
                                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === cat.name && !showFavoritesOnly
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    style={{ borderColor: selectedCategory === cat.name ? cat.color : undefined }}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}

                            {user && (
                                <button
                                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 ${showFavoritesOnly
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                                        }`}
                                >
                                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                    Favorit {wishlist.length > 0 && `(${wishlist.length})`}
                                </button>
                            )}
                        </m.div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 pb-32">
                    <Suspense fallback={<GridLoader />}>
                        <InvitationsGrid
                            isLoading={isLoadingTemplates || isCreating}
                            filteredTemplates={filteredTemplates}
                            onUseTemplate={handleUseTemplate}
                            onPreviewTemplate={previewTemplate}
                            selectedId={onboardingTemplateId}
                            wishlist={wishlist}
                            onToggleWishlist={handleToggleWishlist}
                        />

                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default InvitationsStorePage;
