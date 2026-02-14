import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featured_image: string;
    published_at: string;
    author_id: string;
    view_count: number;
    content: string; // Markdown content
    category?: string;
    // SEO Fields
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
}

interface BlogCardProps {
    post: BlogPost;
    className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, className = '' }) => {
    // PREFETCH ENGINE (Zero Perception Loading)
    const prefetchArticle = () => {
        // 1. Prefetch API JSON
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/api/blog/post/${post.slug}`; // API Endpoint
        document.head.appendChild(link);

        // 2. Prefetch Hero Image (High Priority)
        // We use a low-quality fetch for cache warming if needed, or rely on browser's implicit prefetch via Link
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={`group flex flex-col h-full bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden ${className}`}
            onMouseEnter={prefetchArticle}
        >
            <Link to={`/blog/${post.slug}`} className="block relative w-full aspect-[1.91/1] overflow-hidden bg-slate-50">
                <img
                    src={post.featured_image || 'https://placehold.co/1200x630/png?text=Tamuu+Blog'}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    width={1200}
                    height={630}
                />
            </Link>

            <div className="flex flex-col flex-grow p-8">
                <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-400 mb-4 uppercase">
                    <span>{post.category || 'Article'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Draft'}</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block group-hover:text-[#0A1128] transition-colors duration-200">
                    <h3 className="text-xl font-black text-[#0A1128] leading-tight mb-4 line-clamp-2 tracking-tight">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                    {post.excerpt}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {(post.view_count || 0).toLocaleString()} Views
                    </div>
                    <Link
                        to={`/blog/${post.slug}`}
                        className="text-xs font-black text-[#0A1128] uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center gap-2"
                    >
                        Baca Artikel
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>
            </div>
        </motion.article>
    );
};
