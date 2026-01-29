import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BlogCard, BlogPost } from '../../components/blog/BlogCard';
import api from '@/lib/api';

export const BlogLandingPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.blog.list({ limit: 20 });
                setPosts(data);
            } catch (err) {
                console.error("[Blog] Load error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Helmet>
                <title>The Tamuu Journal | Wedding Inspiration & Tips</title>
                <meta name="description" content="Kumpulan tips pernikahan, inspirasi desain undangan, dan panduan acara terbaik dari Tamuu.id." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative bg-white pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/50 to-transparent" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="block text-indigo-600 font-bold tracking-widest uppercase mb-4 text-sm">Official Blog</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        The Tamuu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Journal</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Inspirasi pernikahan modern, tips digital invitation, dan cerita cinta dari komunitas kami. Dikurasi untuk membantu hari bahagiamu.
                    </p>
                </div>
            </section>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sticky Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <h3 className="font-bold text-lg mb-4">Categories</h3>
                                <div className="space-y-2">
                                    {['All Stories', 'Wedding Tips', 'Product Updates', 'Inspiration', 'Tutorial'].map((cat, i) => (
                                        <button key={cat} className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-indigo-900 rounded-2xl text-white">
                                <h4 className="font-bold mb-2">Buat Undangan?</h4>
                                <p className="text-indigo-200 text-sm mb-4">Coba Tamuu gratis sekarang.</p>
                                <a href="https://tamuu.id" className="block w-full py-2 bg-white text-indigo-900 text-center font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors">
                                    Mulai Gratis
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-gray-200 rounded-2xl h-96" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {posts.map(post => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}

                        {!loading && posts.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <p className="text-gray-500">Belum ada artikel yang dipublish.</p>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
};
