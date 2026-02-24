import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { BlogCard, BlogPost } from '../../components/blog/BlogCard';
import api from '../../lib/api';

const BlogLandingPage: React.FC = () => {
    const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
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

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [featuredData, catsData, blogData] = await Promise.all([
                api.blog.list({ featured: true, limit: 6 }),
                api.blog.getCategories(),
                api.blog.list({ limit: initialLimit, offset: 0, category: activeCategory === 'All' ? undefined : activeCategory })
            ]);
            setFeaturedPosts(featuredData);
            if (Array.isArray(catsData)) setCategories(['All', ...catsData.map((c: any) => c.name)]);
            setPosts(blogData);
            setHasMore(blogData.length === initialLimit);
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
        if (featuredPosts.length <= 1) return;
        const timer = setInterval(() => setCurrentHeroIndex(prev => (prev + 1) % featuredPosts.length), 6000);
        return () => clearInterval(timer);
    }, [featuredPosts]);

    const handleLoadMore = () => {
        const currentTotal = posts.length;
        setOffset(currentTotal);
        fetchPosts(currentTotal, true);
    };

    const heroPost = featuredPosts[currentHeroIndex];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#0A1128] animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Journal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f6f8] font-inter text-[#0A1128]">
            <Helmet>
                <title>The Tamuu Journal — Inspirasi Pernikahan & Undangan Digital</title>
            </Helmet>

            {/* Hero Header */}
            <section className="max-w-7xl mx-auto px-6 pt-24 pb-12 sm:pb-16 text-center">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-400 mb-4 block">Official Journal</motion.span>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0A1128] tracking-tighter mb-6 leading-none uppercase">The Tamuu Journal</motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                    Inspirasi, tips, dan panduan lengkap untuk mewujudkan pernikahan impian Anda.
                </motion.p>
            </section>

            {/* Category Filter */}
            <section className="max-w-7xl mx-auto px-6 mb-12">
                <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#0A1128] text-white shadow-xl shadow-[#0A1128]/20' : 'bg-white border border-slate-100 text-slate-500 hover:border-[#0A1128] hover:text-[#0A1128]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            <AnimatePresence mode="wait">
                <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {featuredPosts.length > 0 && activeCategory === 'All' && (
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
                            <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#0A1128] aspect-[16/9] sm:aspect-[21/9] shadow-2xl">
                                <AnimatePresence mode="wait">
                                    <motion.div key={heroPost.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                                        <BlogCard post={heroPost} featured />
                                    </motion.div>
                                </AnimatePresence>
                                {featuredPosts.length > 1 && (
                                    <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 flex gap-2 z-10">
                                        {featuredPosts.map((_, idx) => (
                                            <button key={idx} onClick={() => setCurrentHeroIndex(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentHeroIndex ? 'w-8 bg-teal-400' : 'w-2 bg-white/20'}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="max-w-7xl mx-auto px-6 pb-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                            {posts.map((post, i) => (
                                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <BlogCard post={post} />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {hasMore && posts.length > 0 && (
                        <section className="max-w-7xl mx-auto px-6 pb-24 text-center">
                            <button onClick={handleLoadMore} disabled={loadingMore} className="px-10 py-4 bg-[#0A1128] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                                {loadingMore ? 'Memuat...' : 'Lihat Lainnya'}
                            </button>
                        </section>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Newsletter */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
                <div className="bg-[#0A1128] rounded-[2.5rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tight">Dapatkan Update Mingguan</h3>
                        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto font-medium">
                            Kami akan mengirimkan tren pernikahan terbaru dan tips undangan digital langsung ke inbox Anda.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4" onSubmit={e => e.preventDefault()}>
                            <input type="email" placeholder="Email Anda" className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            <button className="bg-white text-[#0A1128] font-black px-8 py-4 rounded-2xl hover:bg-teal-400 transition-colors uppercase tracking-widest text-xs">Subscribe</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogLandingPage;