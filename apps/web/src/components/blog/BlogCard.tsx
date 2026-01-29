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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }} // GPU Animation
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`group flex flex-col h-full bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden ${className}`}
            onMouseEnter={prefetchArticle}
        >
            <Link to={`/blog/${post.slug}`} className="block relative w-full aspect-[1.91/1] overflow-hidden bg-gray-100">
                {/* ZERO CLS CONTAINER: Aspect Ratio 1.91:1 (FB/Twitter Standard) */}
                <img
                    src={post.featured_image || 'https://placehold.co/1200x630/png?text=Tamuu+Blog'}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                    width={1200}
                    height={630}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-indigo-600 mb-2 uppercase">
                    <span>{post.category || 'Article'}</span>
                    <span>•</span>
                    <span>{new Date(post.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block group-hover:text-indigo-600 transition-colors duration-200">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {post.view_count.toLocaleString()} Views
                        </span>
                    </div>
                    <Link
                        to={`/blog/${post.slug}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn"
                    >
                        Read More
                        <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>
            </div>
        </motion.article>
    );
};
