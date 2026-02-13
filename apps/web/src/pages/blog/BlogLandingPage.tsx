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
        <div className="min-h-screen bg-white font-sans text-[#0A1128]">
            <Helmet>
                <title>The Tamuu Journal | Inspirasi & Tips Pernikahan</title>
                <meta name="description" content="Kumpulan tips pernikahan, inspirasi desain undangan, dan panduan acara terbaik dari Tamuu." />
            </Helmet>

            {/* Simple Hero Section */}
            <section className="relative pt-40 pb-20 px-6 border-b border-slate-50">
                <div className="max-w-[1600px] mx-auto text-center">
                    <span className="block text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase mb-6">Official Journal</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-[#0A1128]">
                        The Tamuu <span className="text-slate-400 font-medium italic">Journal</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Inspirasi pernikahan, tips undangan digital, dan panduan acara untuk hari bahagia Anda.
                    </p>
                </div>
            </section>

            {/* Content Grid */}
            <div className="max-w-[1800px] mx-auto px-6 py-20">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-slate-50 rounded-3xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                            {posts.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>

                        {!loading && posts.length > 0 && (
                            <div className="mt-20 text-center">
                                <button className="px-10 py-4 bg-[#0A1128] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                                    Lihat Artikel Lainnya
                                </button>
                            </div>
                        )}

                        {!loading && posts.length === 0 && (
                            <div className="text-center py-40 border border-dashed border-slate-200 rounded-[3rem]">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Belum ada artikel dipublish</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BlogLandingPage;
