import React, { useState, useMemo, Suspense, lazy, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { templates as templatesApi, invitations as invitationsApi, Category } from '@/lib/api';
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

// Removed hardcoded CATEGORIES - now fetched from API

const GridLoader = () => (
    <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#FFBF00] rounded-full animate-spin"></div>
    </div>
);

const getIsAppDomain = (): boolean => {
    const host = window.location.hostname;
    return host.startsWith('app.') || host === 'localhost' || host === '127.0.0.1';
};


export const InvitationsStorePage: React.FC = () => {
    const { search } = useLocation();
    const { isAuthenticated, user, showModal } = useStore();
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);
    const isOnboarding = queryParams.get('onboarding') === 'true';
    const onboardingSlug = queryParams.get('slug');
    const onboardingName = queryParams.get('name');
    const onboardingTemplateId = queryParams.get('templateId');

    // TanStack Query hooks - replacing manual useState + useEffect
    const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates();
    const { data: categoryList = [] } = useCategories();
    const { data: wishlistData = [] } = useWishlist(user?.id);
    const toggleWishlistMutation = useToggleWishlist();

    // UI-only state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [isCreating, setIsCreating] = useState(false); // For invitation creation loading
    const navigate = useNavigate();

    // Derive wishlist as array of IDs for compatibility
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
        // Use mutation with optimistic update handled by TanStack Query
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
            // Redirect to login with current search params to preserve onboarding context
            const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
            navigate(`/login?redirect=${redirectUrl}`);
            return;
        }

        // [QUOTA GUARD] Check if user has reached their invitation limit
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

        const isAppDomain = getIsAppDomain();

        if (isOnboarding) {
            // Flow C: Already in onboarding on app domain
            setIsCreating(true);
            try {
                // 1. Get the full template data
                const templateData = await templatesApi.get(templateId);

                // 2. Read Magic Data from Onboarding
                const rawOnboardingData = localStorage.getItem('tamuu_onboarding_data');
                const magic = rawOnboardingData ? JSON.parse(rawOnboardingData) : null;

                // 3. Apply Magic Sync (Inject data into sections)
                let sections = templateData.sections || [];
                if (magic) {
                    let magicJson = JSON.stringify(sections);

                    // A. Text Replacement
                    magicJson = magicJson
                        .replace(/Mempelai Pria/g, magic.groomName || 'Mempelai Pria')
                        .replace(/Mempelai Wanita/g, magic.brideName || 'Mempelai Wanita')
                        .replace(/Nama Mempelai/g, magic.celebrantName || magic.invitationName || 'Nama Mempelai')
                        .replace(/0000000000/g, magic.bank1Number || '0000000000')
                        .replace(/Nama Bank/g, magic.bank1Name || 'Nama Bank')
                        .replace(/Atas Nama/g, magic.bank1Holder || 'Atas Nama')
                        .replace(/Lokasi Acara/g, magic.eventLocation || 'Lokasi Acara');

                    // B. Photo Injection (Heuristic-based)
                    try {
                        const parsedSections = JSON.parse(magicJson);
                        parsedSections.forEach((section: any) => {
                            if (section.layers) {
                                section.layers.forEach((layer: any) => {
                                    // Main Photo
                                    if (magic.photoPreview && (layer.name?.toLowerCase().includes('foto utama') || layer.name?.toLowerCase().includes('hero'))) {
                                        layer.url = magic.photoPreview;
                                    }
                                    // Groom Photo
                                    if (magic.groomPhoto && layer.name?.toLowerCase().includes('pria')) {
                                        layer.url = magic.groomPhoto;
                                    }
                                    // Bride Photo
                                    if (magic.bridePhoto && layer.name?.toLowerCase().includes('wanita')) {
                                        layer.url = magic.bridePhoto;
                                    }
                                    // Gallery Photos
                                    if (magic.galleryPhotos?.length > 0 && layer.name?.toLowerCase().includes('gallery')) {
                                        const match = layer.name.match(/gallery\s*(\d+)/i);
                                        if (match) {
                                            const idx = parseInt(match[1]) - 1;
                                            if (magic.galleryPhotos[idx]) {
                                                layer.url = magic.galleryPhotos[idx];
                                            }
                                        }
                                    }
                                });
                            }
                        });
                        sections = parsedSections;
                    } catch (e) {
                        console.error('Magic Sync Photo Injection Error:', e);
                        sections = JSON.parse(magicJson);
                    }
                }

                // 4. Create the invitation using synced data
                const newInvitation = await invitationsApi.create({
                    ...templateData,
                    user_id: user?.id, // CTO FIX: Explicitly send user_id to link invitation to account
                    id: undefined, // Let the backend generate a new UUID
                    template_id: templateId,
                    name: onboardingName || magic?.invitationName || `Undangan ${onboardingSlug}`,
                    slug: onboardingSlug,
                    sections: sections,
                    is_published: false
                });

                // Clear storage after successful use
                localStorage.removeItem('tamuu_onboarding_data');

                // 5. Navigate to the user editor with the new ID
                const isAppDomain = getIsAppDomain();
                if (isAppDomain) {
                    navigate(`/user/editor/${newInvitation.id}`);
                } else {
                    window.location.href = `https://app.tamuu.id/user/editor/${newInvitation.id}`;
                }
            } catch (error: any) {
                console.error('Failed to create invitation:', error);
                showModal({
                    title: 'Gagal Membuat Undangan',
                    message: error.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.',
                    type: 'error'
                });
            } finally {
                setIsCreating(false);
            }
        } else if (!isAppDomain) {
            // Flow A: On public domain, redirect to onboarding on app domain
            window.location.href = `https://app.tamuu.id/onboarding?templateId=${templateId}`;
        } else {
            // Flow B: On app domain but not in onboarding, start onboarding
            navigate(`/onboarding?templateId=${templateId}`);
        }
    };



    const previewTemplate = (slug: string | undefined, id: string) => {
        window.open(`/preview/${slug || id}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 pt-14">
            {/* Mesh Gradient Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Onboarding Header */}
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
                                <div className="w-16 hidden sm:block" /> {/* Spacer for balance */}
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Hero Header */}
                <header className="pt-32 pb-16 px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 rounded-full shadow-sm mb-8">
                            <Sparkles className="w-4 h-4 text-[#FFBF00]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Koleksi Desain Mahakarya</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 text-slate-900">
                            Pilih Desain <span className="text-amber-900">Terbaik</span> Untuk Momen Anda
                        </h1>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto mb-12 group">
                            <div className="absolute inset-0 bg-[#FFD700]/10 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-100 overflow-hidden flex items-center p-2 focus-within:ring-4 focus-within:ring-[#FFBF00]/10 transition-all duration-500">
                                <Search className="w-6 h-6 text-slate-400 ml-6" />
                                <input
                                    type="text"
                                    placeholder="Cari tema atau kategori..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-lg font-medium text-slate-700 placeholder:text-slate-300"
                                    aria-label="Cari undangan"
                                />
                                <button
                                    className="bg-slate-900 text-white p-4 rounded-[1.5rem] hover:bg-[#FFBF00] hover:text-slate-900 transition-all shadow-lg"
                                    aria-label="Submit pencarian"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Categories */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-3"
                        >
                            {/* All Category Button */}
                            <button
                                onClick={() => { setSelectedCategory('All'); setShowFavoritesOnly(false); }}
                                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === 'All' && !showFavoritesOnly
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                All
                            </button>

                            {/* Dynamic Categories */}
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

                            {/* Favorites Tab */}
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

                {/* Main Content */}
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
