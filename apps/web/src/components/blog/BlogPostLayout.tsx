import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Components (We will inline simple ones for speed, extract later if needed)
import { BlogCard, BlogPost } from './BlogCard';

interface BlogPostLayoutProps {
    post: BlogPost;
    relatedPosts: BlogPost[];
}

const PromoBanner = () => (
    <div className="my-12 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-16 h-16 bg-[#0A1128] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
            💎
        </div>
        <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black text-[#0A1128] mb-1">Upgrade Undangan Anda</h4>
            <p className="text-slate-500 font-medium">Buka fitur premium, RSVP tanpa batas, dan desain eksklusif lainnya.</p>
        </div>
        <Link to="/pricing" className="px-8 py-4 bg-[#0A1128] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all">
            Lihat Paket
        </Link>
    </div>
);

const SubscribeCard = () => (
    <div className="mt-24 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Stay Inspired</h3>
            <p className="text-slate-400 mb-10 font-medium">Dapatkan tips pernikahan dan inspirasi desain langsung di email Anda.</p>

            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                    type="email"
                    placeholder="Alamat Email"
                    className="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white transition-all font-medium"
                />
                <button className="px-10 py-5 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-100 transition-all">
                    Subscribe
                </button>
            </form>
        </div>
    </div>
);

const ShareBar = ({ title, slug }: { title: string, slug: string }) => {
    const url = `https://tamuu.id/blog/${slug}`;
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3"
        >
            <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-[#0A1128] hover:bg-slate-50 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-.967-.272-.297-.471-.446-.966-.446-.495 0-.965.198-1.472.744-.508.545-1.932 1.883-1.932 4.591 0 2.709 1.972 5.325 2.245 5.721.273.396 3.881 5.929 9.405 8.303 5.523 2.373 5.523 1.583 5.523.867 5.523-.717 1.734-2.527 1.981-2.823.248-.297.422-.446.669-.347.248.099 1.56.732 1.832.867.272.135.459.201.52.302.062.101.062.597-.198 1.336z" /></svg>
            </a>
        </motion.div>
    );
};

export const BlogPostLayout: React.FC<BlogPostLayoutProps> = ({ post, relatedPosts }) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const components = {
        p: ({ node, children }: any) => <p className="mb-8 leading-relaxed text-slate-600 text-lg md:text-xl font-medium">{children}</p>,
        img: ({ src, alt }: any) => (
            <div className="my-12 rounded-[2rem] overflow-hidden">
                <img src={src} alt={alt} className="w-full h-auto object-cover" loading="lazy" />
                {alt && <p className="text-center text-xs text-slate-400 mt-4 uppercase tracking-widest font-black">{alt}</p>}
            </div>
        ),
        h2: ({ children }: any) => <h2 className="text-3xl md:text-4xl font-black mt-16 mb-8 text-[#0A1128] tracking-tight">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-2xl md:text-3xl font-black mt-12 mb-6 text-[#0A1128] tracking-tight">{children}</h3>,
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

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-[#0A1128] origin-left z-50"
                style={{ scaleX }}
            />

            <ShareBar title={post.title} slug={post.slug} />

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-32">
                <header className="mb-20">
                    <div className="mb-12 rounded-[2.5rem] overflow-hidden aspect-[2/1] bg-slate-50">
                        <img
                            src={post.featured_image || 'https://placehold.co/1200x630/png?text=Tamuu+Blog'}
                            alt={post.title}
                            className="w-full h-full object-cover grayscale-[0.1]"
                            width={1200}
                            height={600}
                        />
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.4em] text-slate-400 mb-8 uppercase">
                        <span>{post.category || 'Article'}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Draft'}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0A1128] leading-[1.1] mb-10 tracking-tighter">
                        {post.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium">
                        {post.excerpt}
                    </p>
                </header>

                <article className="prose prose-lg md:prose-xl max-w-none prose-slate">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components}
                    >
                        {post.content}
                    </ReactMarkdown>
                </article>

                <PromoBanner />
                <SubscribeCard />

                {relatedPosts.length > 0 && (
                    <section className="mt-40 pt-20 border-t border-slate-50 text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Artikel Terkait</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map(p => (
                                <BlogCard key={p.id} post={p} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="bg-slate-50 py-20 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Link to="/privacy" className="hover:text-[#0A1128] transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-[#0A1128] transition-colors">Terms of Service</Link>
                        <Link to="/refund" className="hover:text-[#0A1128] transition-colors">Refund Policy</Link>
                        <Link to="/contact" className="hover:text-[#0A1128] transition-colors">Contact</Link>
                    </div>
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.1em]">© 2026 Tamuu. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
