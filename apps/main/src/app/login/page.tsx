"use client";

import { useEffect } from 'react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

export default function LoginPage() {
    useEffect(() => {
        // EXACT LEGACY REDIRECTION: Redirect all auth requests to app subdomain
        const search = window.location.search;
        window.location.replace(`https://app.tamuu.id/login${search}`);
    }, []);

    return (
        <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
            <PremiumLoader variant="full" />
        </div>
    );
}
