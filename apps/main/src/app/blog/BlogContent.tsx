"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { BlogCard, BlogPost } from '@/components/blog/BlogCard';
import { Breadcrumbs } from '@/components/Shop/Breadcrumbs';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { MultiCarousel } from '@/components/ui/MultiCarousel';
import { getBlogPosts } from '@/lib/api';

interface BlogContentProps {
    initialPosts: BlogPost[];
    categories: string[];
    carouselSlides: any[];
}

export default function BlogContent({ initialPosts, categories, carouselSlides }: BlogContentProps) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(initialPosts.length);
    const [hasMore, setHasMore] = useState(initialPosts.length === 9);
    const [activeCategory, setActiveCategory] = useState('All');
    
    const initialLimit = 9;
    const loadMoreLimit = 3;

    const fetchPosts = async (currentOffset: number, append = false) => {
        try {
            if (append) setLoadingMore(true);
            const limit = append ? loadMoreLimit : initialLimit;
            const newPosts = await getBlogPosts({ 
                limit, 
                offset: currentOffset, 
                category: activeCategory === 'All' ? undefined : activeCategory 
            });
            
            if (append) setPosts(prev => [...prev, ...newPosts]);
            else setPosts(newPosts);
            
            setHasMore(newPosts.length === limit);
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoadingMore(false); 
        }
    };

    // Category filtering logic
    useEffect(() => {
        // Skip first mount as we have initialPosts
        if (activeCategory === 'All' && posts === initialPosts) return;
        
        setOffset(0);
        fetchPosts(0);
    }, [activeCategory]);
    
    const handleLoadMore = () => {
        const currentTotal = posts.length;
        setOffset(currentTotal);
        fetchPosts(currentTotal, true);
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-[140px] md:pt-[130px]">
            
            {/* Breadcrumbs Navigation */}
            <div className="mb-8">
                <Breadcrumbs />
            </div>

            {/* Enterprise MultiCarousel (Pipih & Sinematik) */}
            {carouselSlides.length > 0 && activeCategory === 'All' && (
                <section className="mb-12 sm:mb-16 -mx-4 sm:mx-0">
                    <MultiCarousel items={carouselSlides} />
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
                <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
                </motion.div>
            </AnimatePresence>
        </main>
    );
}

// Extracted Minimal Blog Card Component
const MinimalBlogCard: React.FC<{ post: BlogPost, index: number }> = ({ post, index }) => {
    return (
        <motion.a 
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
        </motion.a>
    );
};
