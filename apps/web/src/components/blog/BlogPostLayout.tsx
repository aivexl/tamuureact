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
    <div className="my-12 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                ✨
            </div>
            <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-1">Upgrade Invitation Kamu ke Level Next-Gen!</h4>
                <p className="text-gray-600 text-sm">Dapatkan fitur Welcome Display, Unlimited RSVP, dan Tema Premium sekarang juga.</p>
            </div>
            <Link to="/pricing" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
                Lihat Paket Promo
            </Link>
        </div>
    </div>
);

const SubscribeCard = () => (
    <div className="mt-16 bg-gray-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Join the Inner Circle 💎</h3>
            <p className="text-gray-400 mb-8">Dapatkan tips pernikahan eksklusif, inspirasi desain, dan promo rahasia langsung ke inboxmu. No spam, ever.</p>

            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                    type="email"
                    placeholder="Alamat Email Kamu"
                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-8 bottom-8 md:top-1/2 md:-translate-y-1/2 z-40 hidden xl:flex flex-col gap-4"
        >
            <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-110">
                {/* WA Icon */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-.967-.272-.297-.471-.446-.966-.446-.495 0-.965.198-1.472.744-.508.545-1.932 1.883-1.932 4.591 0 2.709 1.972 5.325 2.245 5.721.273.396 3.881 5.929 9.405 8.303 5.523 2.373 5.523 1.583 5.523.867 5.523-.717 1.734-2.527 1.981-2.823.248-.297.422-.446.669-.347.248.099 1.56.732 1.832.867.272.135.459.201.52.302.062.101.062.597-.198 1.336z" /></svg>
            </a>
            {/* Add more share buttons here */}
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

    // Custom Renderer to inject Promo Banner after 3rd paragraph
    const components = {
        p: ({ node, children }: any) => {
            // Very simplified logic: In a real app we'd count paragraphs, 
            // but react-markdown streaming makes index tracking tricky without a custom plugin.
            // For now, we will just render the P. 
            // Better approach: Split content string or use a rehype plugin.
            return <p className="mb-6 leading-loose text-gray-800 text-lg md:text-xl">{children}</p>;
        },
        img: ({ src, alt }: any) => (
            <div className="my-8 rounded-2xl overflow-hidden shadow-lg">
                <img src={src} alt={alt} className="w-full h-auto object-cover" loading="lazy" />
                {alt && <p className="text-center text-sm text-gray-500 mt-2 italic">{alt}</p>}
            </div>
        ),
        h2: ({ children }: any) => <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-gray-900">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl md:text-2xl font-bold mt-8 mb-4 text-gray-900">{children}</h3>,
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Helmet>
                <title>{post.seo_title || post.title} | Tamuu Blog</title>
                <meta name="description" content={post.seo_description || post.excerpt} />
                <link rel="canonical" href={`https://tamuu.id/blog/${post.slug}`} />
                <meta property="og:title" content={post.seo_title || post.title} />
                <meta property="og:description" content={post.seo_description || post.excerpt} />
                <meta property="og:image" content={post.featured_image} />
                <meta property="og:type" content="article" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.seo_title || post.title,
                        "image": [post.featured_image],
                        "datePublished": post.published_at,
                        "author": { "@type": "Person", "name": "Tamuu Team" }
                    })}
                </script>
            </Helmet>

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50"
                style={{ scaleX }}
            />

            <ShareBar title={post.title} slug={post.slug} />

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">

                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="mb-8 rounded-3xl overflow-hidden aspect-[2/1] shadow-2xl">
                        <img
                            src={post.featured_image || 'https://placehold.co/1200x630/png?text=Tamuu+Blog'}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            width={1200}
                            height={600}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">
                        <span>{post.category || 'Article'}</span>
                        <span>•</span>
                        <span>{new Date(post.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                        <span>•</span>
                        <span>5 Min Read</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                        {post.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {post.excerpt}
                    </p>
                </header>

                {/* Content Body */}
                <article className="prose prose-lg md:prose-xl prose-indigo max-w-none prose-img:rounded-xl">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components}
                    >
                        {post.content}
                    </ReactMarkdown>
                </article>

                {/* Injected Promo (At end for now, but in real app logic would inject mid-content) */}
                <PromoBanner />
                <SubscribeCard />

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-24 border-t border-gray-200 pt-16">
                        <h3 className="text-3xl font-bold mb-8">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map(p => (
                                <BlogCard key={p.id} post={p} />
                            ))}
                        </div>
                    </section>
                )}

            </main>

            {/* Footer Legal Menu (AdSense Requirement) */}
            <footer className="bg-white border-t border-gray-200 py-12 mt-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="flex justify-center gap-8 mb-4 text-sm text-gray-500">
                        <Link to="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-indigo-600">Terms of Service</Link>
                        <Link to="/refund" className="hover:text-indigo-600">Refund Policy</Link>
                        <Link to="/contact" className="hover:text-indigo-600">Contact</Link>
                    </div>
                    <p className="text-xs text-gray-400">© 2026 Tamuu.id. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
