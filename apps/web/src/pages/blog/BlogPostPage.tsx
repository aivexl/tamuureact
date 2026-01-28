import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { BlogPost } from '../../components/blog/BlogCard';
import { BlogPostLayout } from '../../components/blog/BlogPostLayout';

export const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [related, setRelated] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) return;

        setLoading(true);
        // Parallel Fetch Strategy
        Promise.all([
            fetch(`/api/blog/post/${slug}`).then(r => r.ok ? r.json() : Promise.reject('Post not found')),
            // We fetch related posts *after* finding the ID, or ideally the API supports related-by-slug.
            // But our current plan logic is related/:id. 
            // So we chain it.
        ]).then(async ([postData]) => {
            setPost(postData);

            // Analytics: Track "View" immediately
            fetch('/api/blog/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postData.id, type: 'view' })
            }).catch(() => { });

            // Fetch Related
            try {
                const relRes = await fetch(`/api/blog/related/${postData.id}`);
                const relData = await relRes.json();
                setRelated(relData);
            } catch (e) {
                console.warn("Related posts failed", e);
            }

            setLoading(false);

            // Analytics: Track "Read" after 5 seconds
            const timer = setTimeout(() => {
                fetch('/api/blog/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ post_id: postData.id, type: 'read' })
                }).catch(() => { });
            }, 5000);

            return () => clearTimeout(timer);

        }).catch(err => {
            console.error(err);
            setError(true);
            setLoading(false);
        });

    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
                <div className="h-96 bg-gray-200 rounded-3xl mb-8" />
                <div className="h-12 bg-gray-200 rounded-lg w-3/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-8" />
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return <div className="min-h-screen grid place-items-center">Artikel tidak ditemukan.</div>;
    }

    return (
        <BlogPostLayout post={post} relatedPosts={related} />
    );
};
