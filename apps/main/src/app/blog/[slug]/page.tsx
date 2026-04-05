import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { enforceDomain } from '@/lib/domain-enforcer';
import { getBlogPost, getRelatedPosts } from '@/lib/api';
import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import BlogAnalytics from './BlogAnalytics';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);
    
    if (!post) return { title: 'Post Not Found' };

    const title = `${post.seo_title || post.title} | Tamuu Journal`;
    const description = post.seo_description || post.excerpt;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: post.featured_image ? [post.featured_image] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.featured_image ? [post.featured_image] : [],
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    await enforceDomain('public');
    
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.id);

    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.seo_title || post.title,
        "image": post.featured_image ? [post.featured_image] : [],
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.published_at || post.created_at,
        "author": {
            "@type": "Organization",
            "name": "Tamuu Editorial Team",
            "url": "https://tamuu.id"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Tamuu",
            "logo": {
                "@type": "ImageObject",
                "url": "https://tamuu.id/logo.png"
            }
        },
        "description": post.seo_description || post.excerpt
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
            />
            <BlogAnalytics postId={post.id} />
            <BlogPostLayout post={post} relatedPosts={relatedPosts} />
        </>
    );
}
