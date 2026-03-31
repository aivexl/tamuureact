"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

export default function ShopRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Since Shop is now the Homepage, redirect /shop to /
        router.replace('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <PremiumLoader variant="full" showLabel label="Loading Shop..." />
        </div>
    );
}
