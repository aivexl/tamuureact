"use client";

import { useEffect } from 'react';
import { trackBlogEvent } from '@/lib/api';

export default function BlogAnalytics({ postId }: { postId: string }) {
    useEffect(() => {
        if (!postId) return;

        // Track "View" immediately
        trackBlogEvent(postId, 'view').catch(() => { });

        // Track "Read" after 5 seconds
        const timer = setTimeout(() => {
            trackBlogEvent(postId, 'read').catch(() => { });
        }, 5000);

        return () => clearTimeout(timer);
    }, [postId]);

    return null;
}
