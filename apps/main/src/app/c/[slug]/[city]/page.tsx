"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

export default function CategoryCityRedirect() {
    const router = useRouter();
    const params = useParams();
    const { slug, city } = params;

    useEffect(() => {
        // Redirect legacy category routes /c/slug/city to /?category=slug&city=city
        router.replace(`/?category=${slug}&city=${city}`);
    }, [router, slug, city]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <PremiumLoader variant="full" showLabel label="Loading Category..." />
        </div>
    );
}
