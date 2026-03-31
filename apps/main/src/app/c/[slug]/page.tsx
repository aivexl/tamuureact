"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

export default function CategoryRedirect() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    useEffect(() => {
        // Redirect legacy category routes /c/slug to /?category=slug
        router.replace(`/?category=${slug}`);
    }, [router, slug]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <PremiumLoader variant="full" showLabel label="Loading Category..." />
        </div>
    );
}
