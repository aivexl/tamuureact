import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

import { BlogCard, BlogPost } from './BlogCard';

interface BlogPostLayoutProps {
    post: BlogPost;
    relatedPosts: BlogPost[];
}

const ShareBar = ({ title, slug }: { title: string; slug: string }) => {
    const url = `https://tamuu.id/blog/${slug}`;
    const [copied, setCopied] = React.useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3"
        >
            {/* WhatsApp */}
            <a
                href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-200 hover:shadow-md transition-all"
                title="Share via WhatsApp"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
            </a>

            {/* Twitter/X */}
            <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:text-sky-500 hover:border-sky-200 hover:shadow-md transition-all"
                title="Share on X"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>

            {/* Copy Link */}
            <button
                onClick={copyLink}
                className="w-11 h-11 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:text-teal-500 hover:border-teal-200 hover:shadow-md transition-all"
                title="Copy link"
            >
                {copied ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
            </button>
        </motion.div>
    );
};

const PromoBanner = () => (
    <div className="my-16 p-8 rounded-2xl bg-white border border-slate-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-14 h-14 bg-[#0A1128] rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
            💎
        </div>
        <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-[#0A1128] mb-1">Upgrade Undangan Anda</h4>
            <p className="text-slate-500 text-sm font-medium">Buka fitur premium, RSVP tanpa batas, dan desain eksklusif lainnya.</p>
        </div>
        <Link
            to="/pricing"
            className="px-8 py-3.5 bg-[#0A1128] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
        >
            Lihat Paket
        </Link>
    </div>
);

const SubscribeCard = () => (
    <div className="mt-24 bg-[#0A1128] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
        <div
            className="absolute inset-0 opacity-10"
            style={{
                backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Stay Inspired</h3>
            <p className="text-slate-400 mb-10 font-medium">
                Dapatkan tips pernikahan dan inspirasi desain langsung di email Anda.
            </p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={e => e.preventDefault()}>
                <input
                    type="email"
                    placeholder="Alamat Email"
                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                />
                <button className="px-10 py-4 bg-teal-500 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-teal-600 transition-all">
                    Subscribe
                </button>
            </form>
        </div>
    </div>
);

export const BlogPostLayout: React.FC<BlogPostLayoutProps> = ({ post, relatedPosts }) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const readingTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1200));

    const components = {
        p: ({ children }: any) => (
            <p className="mb-8 leading-relaxed text-slate-600 text-lg md:text-xl">{children}</p>
        ),
        img: ({ src, alt }: any) => (
            <div className="my-12 rounded-2xl overflow-hidden">
                <img src={src} alt={alt} className="w-full h-auto object-cover" loading="lazy" />
                {alt && (
                    <p className="text-center text-xs text-slate-400 mt-4 uppercase tracking-widest font-bold">
                        {alt}
                    </p>
                )}
            </div>
        ),
        h2: ({ children }: any) => (
            <h2 className="text-3xl md:text-4xl font-extrabold mt-16 mb-8 text-[#0A1128] tracking-tight">
                {children}
            </h2>
        ),
        h3: ({ children }: any) => (
            <h3 className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-[#0A1128] tracking-tight">
                {children}
            </h3>
        ),
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-teal-500 pl-6 my-8 italic text-slate-500 text-lg">
                {children}
            </blockquote>
        ),
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#0A1128]">
            <Helmet>
                <title>{post.seo_title || post.title} | Tamuu Journal</title>
                <meta name="description" content={post.seo_description || post.excerpt} />
                <link rel="canonical" href={`https://tamuu.id/blog/${post.slug}`} />
                <meta property="og:title" content={post.seo_title || post.title} />
                <meta property="og:description" content={post.seo_description || post.excerpt} />
                <meta property="og:image" content={post.featured_image} />
                <meta property="og:type" content="article" />
            </Helmet>

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-teal-400 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Share Bar */}
            <ShareBar title={post.title} slug={post.slug} />

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <header className="mb-16">
                    {/* Hero Image */}
                    <div className="mb-10 rounded-3xl overflow-hidden aspect-[2/1] bg-slate-50 relative group">
                        <img
                            src={post.featured_image || 'https://placehold.co/1200x630/0A1128/white?text=Tamuu+Blog'}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            width={1200}
                            height={600}
                        />
                        {/* Overlay with meta */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 md:p-10 flex items-center gap-4 text-sm">
                            <span className="px-3 py-1 rounded-full bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider">
                                {post.category || 'Article'}
                            </span>
                            <span className="text-white/70">
                                {post.published_at
                                    ? new Date(post.published_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : 'Draft'}
                            </span>
                            <span className="text-white/50">·</span>
                            <span className="text-white/70">{readingTime} min read</span>
                        </div>
                    </div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0A1128] leading-[1.1] mb-8 tracking-tight"
                    >
                        {post.title}
                    </motion.h1>

                    {/* Excerpt */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-slate-500 leading-relaxed"
                    >
                        {post.excerpt}
                    </motion.p>
                </header>

                {/* Article Body */}
                <article className="prose prose-lg md:prose-xl max-w-none prose-slate">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                        {post.content}
                    </ReactMarkdown>
                </article>

                <PromoBanner />
                <SubscribeCard />

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-32 pt-16 border-t border-slate-100 text-left">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-12">
                            Artikel Terkait
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map(p => (
                                <BlogCard key={p.id} post={p} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 py-16 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Link to="/privacy" className="hover:text-[#0A1128] transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-[#0A1128] transition-colors">Terms of Service</Link>
                        <Link to="/refund" className="hover:text-[#0A1128] transition-colors">Refund Policy</Link>
                        <Link to="/contact" className="hover:text-[#0A1128] transition-colors">Contact</Link>
                    </div>
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                        © 2026 Tamuu. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};
