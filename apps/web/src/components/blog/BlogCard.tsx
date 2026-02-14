import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category: string;
    status: string;
    seo_title: string;
    seo_description: string;
    published_at: string;
    created_at: string;
    view_count?: number;
    author_email?: string;
}

interface BlogCardProps {
    post: BlogPost;
    featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
    const formattedDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'Draft';

    const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1200));

    // Featured card: full-width 21:9 hero
    if (featured) {
        return (
            <Link to={`/blog/${post.slug}`} className="block group">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-2xl border border-slate-100"
                >
                    <img
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={post.featured_image || 'https://placehold.co/1200x630/0A1128/white?text=Tamuu+Journal'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/90 via-[#0A1128]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
                        <span className="inline-block px-3 py-1 rounded-md bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                            {post.category || 'Article'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            {post.title}
                        </h2>
                        <div className="flex items-center gap-4 text-white/70 text-sm">
                            <span>{formattedDate}</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span>{readingTime} min read</span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        );
    }

    // Standard card
    return (
        <Link to={`/blog/${post.slug}`} className="block group">
            <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
                {/* Image */}
                <div className="p-3 pb-0">
                    <div className="aspect-[16/10] overflow-hidden rounded-xl border border-slate-100">
                        <img
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={post.featured_image || 'https://placehold.co/600x375/0A1128/white?text=Tamuu'}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-teal-600 bg-teal-500/10">
                            {post.category || 'Article'}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#0A1128] mb-3 line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors">
                        {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        <span>{formattedDate}</span>
                        <span>{readingTime} min read</span>
                    </div>
                </div>
            </motion.article>
        </Link>
    );
};
