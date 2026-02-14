import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { BlogCard, BlogPost } from '../../components/blog/BlogCard';
import api from '../../lib/api';

const CATEGORIES = ['All', 'Wedding Tips', 'Inspiration', 'Tutorial', 'Digital Invitation'];

const BlogLandingPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const limit = 12;

    const fetchPosts = async (currentOffset: number, append = false) => {
        try {
            if (append) setLoadingMore(true); else setLoading(true);
            const data = await api.blog.list({ limit, offset: currentOffset });
            const newPosts = Array.isArray(data) ? data : (data?.posts || []);
            if (append) {
                setPosts(prev => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }
            setHasMore(newPosts.length === limit);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(0);
    }, []);

    const handleLoadMore = () => {
        const newOffset = offset + limit;
        setOffset(newOffset);
        fetchPosts(newOffset, true);
    };

    // Filter posts by category (client-side)
    const filteredPosts = useMemo(() => {
        if (activeCategory === 'All') return posts;
        return posts.filter(p =>
            p.category?.toLowerCase().includes(activeCategory.toLowerCase())
        );
    }, [posts, activeCategory]);

    const featuredPost = filteredPosts[0];
    const gridPosts = filteredPosts.slice(1);

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-8 h-8 text-[#0A1128] animate-spin" />
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Loading Journal</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f6f8] font-sans text-[#0A1128]"
            style={{
                backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }}
        >
            <Helmet>
                <title>The Tamuu Journal — Inspirasi Pernikahan & Undangan Digital</title>
                <meta name="description" content="Inspirasi, tips, dan panduan lengkap untuk mewujudkan pernikahan impian Anda. Temukan tren terbaru dalam desain undangan digital." />
            </Helmet>

            {/* Hero Header */}
            <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mb-4 block"
                >
                    Official Journal
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0A1128] tracking-tight mb-6"
                >
                    The Tamuu{' '}
                    <span className="italic font-light" style={{ fontFamily: 'Georgia, serif' }}>Journal</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed"
                >
                    Inspirasi, tips, dan panduan lengkap untuk mewujudkan pernikahan impian Anda.
                    Temukan tren terbaru dalam desain undangan digital dan manajemen acara.
                </motion.p>
            </section>

            {/* Category Filter */}
            <section className="max-w-7xl mx-auto px-6 mb-12">
                <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-[#0A1128] text-white shadow-lg shadow-[#0A1128]/20'
                                : 'border border-slate-200 text-slate-600 hover:border-[#0A1128]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            <AnimatePresence mode="wait">
                {filteredPosts.length === 0 ? (
                    /* Empty State */
                    <motion.section
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-7xl mx-auto px-6 py-32 text-center"
                    >
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#0A1128] mb-2">Belum Ada Artikel</h3>
                        <p className="text-slate-400">Artikel akan segera hadir. Nantikan update terbaru kami!</p>
                    </motion.section>
                ) : (
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Featured Article */}
                        {featuredPost && (
                            <section className="max-w-7xl mx-auto px-6 mb-16">
                                <BlogCard post={featuredPost} featured />
                            </section>
                        )}

                        {/* Article Grid */}
                        {gridPosts.length > 0 && (
                            <section className="max-w-7xl mx-auto px-6 pb-16">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {gridPosts.map((post, i) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <BlogCard post={post} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Load More */}
                        {hasMore && (
                            <section className="max-w-7xl mx-auto px-6 pb-16 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-10 py-4 bg-[#0A1128] text-white text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memuat...
                                        </span>
                                    ) : (
                                        'Lihat Artikel Lainnya'
                                    )}
                                </button>
                            </section>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Newsletter Section */}
            <section className="max-w-7xl mx-auto px-6 mb-24">
                <div className="bg-[#0A1128] rounded-3xl p-12 text-center relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-white mb-4">Dapatkan Update Mingguan</h3>
                        <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                            Kami akan mengirimkan tren pernikahan terbaru dan tips undangan digital langsung ke inbox Anda.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <button className="bg-teal-500 text-white font-bold px-8 py-3 rounded-full hover:bg-teal-600 transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogLandingPage;
