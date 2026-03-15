import React, { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { templates as templatesApi, invitations as invitationsApi, users as usersApi, Category, safeFetch, API_BASE } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useTemplates, useCategories, useWishlist, useToggleWishlist } from '@/hooks/queries';

import {
    Search,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Heart,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { assembleSEOTemplate } from '../lib/seo-permutation';
import { Breadcrumbs } from '../components/Shop/Breadcrumbs';
import { MultiCarousel } from '../components/ui/MultiCarousel';

// Lazy load the grid to reduce initial payload and TBT
const InvitationsGrid = lazy(() => import('../components/Store/InvitationsGrid'));

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    category?: string;
    price?: number;
    type?: 'invitation' | 'display';
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
    const { data: wishlistData = [] } = useWishlist(user?.id, user?.email);
    const toggleWishlistMutation = useToggleWishlist();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const wishlist = useMemo(() => wishlistData as string[], [wishlistData]);

    // Carousel State
    const [carouselSlides, setCarouselSlides] = useState<any[]>([]);

    useEffect(() => {
        const fetchCarousel = async () => {
            const fallbackSlides = [
                { id: '1', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', link_url: '#' },
                { id: '2', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800', link_url: '#' },
                { id: '3', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800', link_url: '#' },
                { id: '4', image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800', link_url: '#' },
                { id: '5', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800', link_url: '#' },
                { id: '6', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800', link_url: '#' }
            ];
            
            try {
                const res = await safeFetch(`${API_BASE}/api/invitations/carousel`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        // Ensure we always have at least 6 slides
                        let finalSlides = [...data];
                        if (finalSlides.length < 6) {
                            const padding = fallbackSlides.slice(0, 6 - finalSlides.length);
                            finalSlides = [...finalSlides, ...padding];
                        }
                        setCarouselSlides(finalSlides.slice(0, 6)); // Strictly 6
                    } else {
                        setCarouselSlides(fallbackSlides);
                    }
                } else {
                    setCarouselSlides(fallbackSlides);
                }
            } catch (e) {
                console.error('Failed to fetch carousel', e);
                setCarouselSlides(fallbackSlides);
            }
        };
        fetchCarousel();
    }, []);

    // ============================================
    // THE CHRONOS SEO ENGINE (v19.0)
    // ============================================
    const seoContent = useMemo(() => {
        const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        const currentYear = new Date().getFullYear().toString();
        const activeCat = selectedCategory !== 'All' ? selectedCategory : 'Pernikahan';
        const displayCount = templates.filter((t: any) => t.type !== 'display' && (selectedCategory === 'All' || t.category === selectedCategory)).length;

        const data = {
            category: activeCat,
            city: 'Indonesia',
            count: displayCount > 0 ? displayCount : 50,
        };

        const titleTemplate = selectedCategory === 'All' 
            ? 'Trend Undangan Digital {Category} Terbaru {Year} | Tamuu'
            : 'Koleksi Undangan Online {Category} Paling Hits {Month} {Year}';

        const descTemplate = selectedCategory === 'All'
            ? 'Temukan ratusan desain undangan digital dengan tema pernikahan paling dicari di {Month} {Year}. Buat website pernikahan impian Anda sekarang.'
            : `Hadirkan kesan berkelas untuk hari spesial Anda. Jelajahi template undangan {Category} premium kami yang dirancang khusus oleh desainer profesional di tahun {Year}.`;

        const imageGallerySchema = {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": `Koleksi Desain Undangan ${activeCat}`,
            "description": `Galeri inspirasi desain undangan digital tema ${activeCat} terbaru tahun ${currentYear}.`,
            "url": window.location.href,
        };

        const itemListSchema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `Daftar Template Undangan ${activeCat}`,
            "numberOfItems": displayCount,
            "itemListElement": templates.filter((t: any) => t.type !== 'display' && (selectedCategory === 'All' || t.category === selectedCategory)).slice(0, 10).map((t: any, i: number) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://tamuu.id/preview/${t.slug || t.id}`,
                "name": t.name
            }))
        };

        return {
            title: assembleSEOTemplate(titleTemplate, data),
            description: assembleSEOTemplate(descTemplate, data),
            schemas: [imageGallerySchema, itemListSchema]
        };
    }, [selectedCategory, templates]);

    useSEO({
        title: seoContent.title,
        description: seoContent.description
    });

    const handleToggleWishlist = useCallback(async (templateId: string, isWishlisted: boolean) => {
        if (!user?.id) {
            navigate('/login');
            return;
        }
        toggleWishlistMutation.mutate({
            userId: user.id,
            templateId,
            isWishlisted,
            email: user.email
        });
    }, [user?.id, user?.email, navigate, toggleWishlistMutation]);

    const filteredTemplates = useMemo(() => {
        // CTO POLICY: Robust handling of wishlist data to prevent platform crashes
        const safeWishlistData = Array.isArray(wishlistData) ? wishlistData : [];

        return templates.filter((t: Template) => {
            // CTO FIX: Strictly isolate displays from the invitations store
            if (t.type === 'display') return false;

            const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
            const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFavorites = !showFavoritesOnly || safeWishlistData.includes(t.id);
            return matchesCategory && matchesSearch && matchesFavorites;
        });
    }, [templates, selectedCategory, searchQuery, showFavoritesOnly, wishlistData]);

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
                const rawOnboardingData = localStorage.getItem('tamuu_onboarding_data');
                const magic = rawOnboardingData ? JSON.parse(rawOnboardingData) : null;

                const newInvitation = await invitationsApi.create({
                    user_id: user?.id,
                    template_id: templateId,
                    name: onboardingName || magic?.invitationName || `Undangan ${onboardingSlug}`,
                    slug: onboardingSlug,
                    is_published: false
                });

                localStorage.removeItem('tamuu_onboarding_data');
                localStorage.removeItem('tamuu_onboarding_progress');
                localStorage.removeItem('tamuu_onboarding_progress_v2');
                localStorage.removeItem('tamuu_onboarding_progress_v3');
                localStorage.removeItem('tamuu_onboarding_progress_v4');

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
        <div className="min-h-screen bg-white text-slate-900 pt-[140px] md:pt-[130px]">
            {seoContent.schemas.map((s, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(s)}
                </script>
            ))}
            
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

            <div className={`relative z-10 transition-all duration-500`}>
                <AnimatePresence>
                    {isOnboarding && (
                        <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-900/95 backdrop-blur-md text-white py-4 px-4 overflow-hidden fixed top-[88px] sm:top-[96px] left-0 right-0 z-40 border-b border-white/10 shadow-2xl shadow-black/20"
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

                <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                    <div className="mb-8">
                        <Breadcrumbs />
                    </div>

                    {/* THE SILENT CAROUSEL */}
                    {carouselSlides.length > 0 && !isOnboarding && (
                        <section className="mb-12">
                            <MultiCarousel items={carouselSlides} />
                        </section>
                    )}

                    {/* Search & Filter */}
                    <div className="relative max-w-2xl mx-auto mb-10 mt-8 group px-2 sm:px-0">
                        <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-lg shadow-slate-100/50 overflow-hidden flex items-center p-1.5 focus-within:ring-4 focus-within:ring-[#FFBF00]/10 transition-all duration-500">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 ml-4 sm:ml-5 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari tema desain..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-slate-700 placeholder:text-slate-300"
                                aria-label="Cari undangan"
                            />
                            <button
                                className="bg-[#0A1128] text-white p-3 sm:p-3.5 rounded-[1.5rem] hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all shadow-md shrink-0"
                                aria-label="Submit pencarian"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-16 px-2 sm:px-0"
                    >
                        <button
                            onClick={() => { setSelectedCategory('All'); setShowFavoritesOnly(false); }}
                            className={`px-5 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === 'All' && !showFavoritesOnly
                                ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-lg'
                                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-[#0A1128]'
                                }`}
                        >
                            All
                        </button>

                        {categoryList.map((cat: any) => (
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