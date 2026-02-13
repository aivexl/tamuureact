import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BlogCard, BlogPost } from '../blog/BlogCard';
import api from '@/lib/api';

const BlogSection: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch 6 articles for the homepage grid
                const data = await api.blog.list({ limit: 6 });
                setPosts(data);
            } catch (err) {
                console.error("[BlogSection] Load error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (!loading && posts.length === 0) return null;

    return (
        <section id="blog" className="max-w-[1800px] mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-16 space-y-4">
                <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] block">Journal & Inspirasi</span>
                <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Kisah & Tips Terbaru</h2>
                <div className="w-12 h-1 bg-slate-100 mx-auto rounded-full" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-slate-50 rounded-[2.5rem] h-80 animate-pulse" />
                    ))
                ) : (
                    posts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))
                )}
            </div>

            <div className="mt-16 text-center">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-[#0A1128] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                    Lihat Semua Artikel
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
            </div>
        </section>
    );
};

export default BlogSection;
