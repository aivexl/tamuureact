import React, { useState, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { BlogCard, BlogPost } from '../../components/blog/BlogCard';
import api from '../../lib/api';
import { useSEO } from '../../hooks/useSEO';
import { Breadcrumbs } from '../../components/Shop/Breadcrumbs';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

const BlogLandingPage: React.FC = () => {
    const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const initialLimit = 9;
    const loadMoreLimit = 3;

    // Fetch Custom API logic for Carousel directly if not in lib/api.ts yet
    const fetchCarousel = async () => {
        try {
            const res = await fetch('https://tamuu.id/api/blog/carousel'); // Or use your internal fetcher
            if (res.ok) {
                const data = await res.json();
                return Array.isArray(data) ? data : [];
            }
        } catch (e) {
            console.error('Failed to fetch carousel', e);
        }
        return [];
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [catsData, blogData, carouselData] = await Promise.all([
                api.blog.getCategories(),
                api.blog.list({ limit: initialLimit, offset: 0, category: activeCategory === 'All' ? undefined : activeCategory }),
                fetchCarousel()
            ]);
            
            if (Array.isArray(catsData)) setCategories(['All', ...catsData.map((c: any) => c.name)]);
            setPosts(blogData);
            setHasMore(blogData.length === initialLimit);

            // Fallback for carousel if empty
            if (carouselData.length > 0) {
                setCarouselSlides(carouselData);
            } else {
                setCarouselSlides([
                    { id: '1', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000', title: 'The Architecture of Moments', category_label: 'Gallery' }
                ]);
            }

        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchPosts = async (currentOffset: number, append = false) => {
        try {
            if (append) setLoadingMore(true);
            const limit = append ? loadMoreLimit : initialLimit;
            const data = await api.blog.list({ limit, offset: currentOffset, category: activeCategory === 'All' ? undefined : activeCategory });
            const newPosts = Array.isArray(data) ? data : (data?.posts || []);
            if (append) setPosts(prev => [...prev, ...newPosts]);
            else setPosts(newPosts);
            setHasMore(newPosts.length === limit);
        } catch (err) { console.error(err); } finally { setLoadingMore(false); }
    };

    useEffect(() => { fetchInitialData(); }, []);
    useEffect(() => { if (!loading) { setOffset(0); fetchPosts(0); } }, [activeCategory]);
    
    useEffect(() => {
        if (carouselSlides.length <= 1) return;
        const timer = setInterval(() => setCurrentHeroIndex(prev => (prev + 1) % carouselSlides.length), 6000);
        return () => clearInterval(timer);
    }, [carouselSlides]);

    const handleLoadMore = () => {
        const currentTotal = posts.length;
        setOffset(currentTotal);
        fetchPosts(currentTotal, true);
    };

    // ============================================
    // THE EDITORIAL NEXUS ENGINE (SEO)
    // ============================================
    const seoData = useMemo(() => {
        const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        const currentYear = new Date().getFullYear().toString();
        
        const title = activeCategory === 'All' 
            ? `Blog & Artikel Pernikahan - Update ${currentMonth} ${currentYear} | Tamuu`
            : `${activeCategory} - Panduan Terbaru ${currentMonth} ${currentYear} | Tamuu`;
            
        const description = activeCategory === 'All'
            ? `Kumpulan artikel pilihan seputar industri pernikahan, vendor event, dan tren gaya hidup. Temukan inspirasi terbaru bulan ${currentMonth} ${currentYear}.`
            : `Mencari referensi tentang ${activeCategory}? Temukan panduan komprehensif dan tips vendor profesional yang di-update khusus untuk ${currentMonth} ${currentYear}.`;

        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": `Apa artikel terbaru tentang ${activeCategory === 'All' ? 'pernikahan' : activeCategory}?`,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `Pada bulan ${currentMonth} ${currentYear}, Tamuu telah menerbitkan artikel terbaru seputar ${activeCategory === 'All' ? 'pernikahan' : activeCategory} yang mencakup panduan dan tips vendor profesional.`
                    }
                }
            ]
        };

        return { title, description, schema: faqSchema };
    }, [activeCategory]);

    useSEO({
        title: seoData.title,
        description: seoData.description
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <PremiumLoader variant="inline" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-slate-200">
            <script type="application/ld+json">
                {JSON.stringify(seoData.schema)}
            </script>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-28 sm:pt-32">
                
                {/* Minimalist Carousel */}
                {carouselSlides.length > 0 && activeCategory === 'All' && (
                    <section className="mb-12 sm:mb-16">
                        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-50 group">
                            <AnimatePresence mode="wait">
                                <m.div 
                                    key={carouselSlides[currentHeroIndex].id}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={() => carouselSlides[currentHeroIndex].link_url && (window.location.href = carouselSlides[currentHeroIndex].link_url)}
                                >
                                    <img 
                                        src={carouselSlides[currentHeroIndex].image_url} 
                                        className="w-full h-full object-cover" 
                                        alt={carouselSlides[currentHeroIndex].title || 'Blog Feature'}
                                    />
                                    {/* Minimalist Gradient for text legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                                    
                                    {carouselSlides[currentHeroIndex].title && (
                                        <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 right-8 text-white">
                                            {carouselSlides[currentHeroIndex].category_label && (
                                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest mb-3">
                                                    {carouselSlides[currentHeroIndex].category_label}
                                                </span>
                                            )}
                                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-3xl">
                                                {carouselSlides[currentHeroIndex].title}
                                            </h2>
                                        </div>
                                    )}
                                </m.div>
                            </AnimatePresence>

                            {/* Minimalist Indicators */}
                            {carouselSlides.length > 1 && (
                                <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 flex gap-2 z-10">
                                    {carouselSlides.map((_, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={(e) => { e.stopPropagation(); setCurrentHeroIndex(idx); }}
                                            className={`h-1 rounded-full transition-all duration-500 ${idx === currentHeroIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Category Navigation - Minimalist Pills */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-100">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                    activeCategory === cat 
                                    ? 'bg-[#0A1128] text-white border-[#0A1128]' 
                                    : 'bg-transparent border-transparent text-slate-400 hover:text-[#0A1128]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Article Grid - Clean & Silent */}
                <AnimatePresence mode="wait">
                    <m.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {posts.map((post, i) => (
                                <MinimalBlogCard key={post.id} post={post} index={i} />
                            ))}
                        </div>

                        {posts.length === 0 && (
                            <div className="py-32 text-center">
                                <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Belum ada artikel di kategori ini</p>
                            </div>
                        )}

                        {hasMore && posts.length > 0 && (
                            <div className="mt-20 text-center">
                                <button 
                                    onClick={handleLoadMore} 
                                    disabled={loadingMore} 
                                    className="px-8 py-3 bg-transparent border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-slate-50 hover:text-[#0A1128] hover:border-slate-300 transition-all disabled:opacity-50"
                                >
                                    {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                                </button>
                            </div>
                        )}
                    </m.div>
                </AnimatePresence>

                {/* Minimal SEO Footer (Internal Linking) */}
                <div className="mt-32 pt-16 border-t border-slate-100 text-center">
                    <Breadcrumbs />
                </div>
            </main>
        </div>
    );
};

// Extracted Minimal Blog Card Component
const MinimalBlogCard: React.FC<{ post: BlogPost, index: number }> = ({ post, index }) => {
    return (
        <m.a 
            href={`/blog/${post.slug}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group block cursor-pointer"
        >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 mb-5">
                <img 
                    src={post.featured_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80'} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[9px] font-bold text-[#FFBF00] uppercase tracking-widest">
                        {post.category || 'Journal'}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0A1128] leading-tight tracking-tight group-hover:text-slate-600 transition-colors">
                    {post.title}
                </h3>
            </div>
        </m.a>
    );
};

export default BlogLandingPage;
