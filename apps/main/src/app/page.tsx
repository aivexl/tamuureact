import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { enforceDomain } from '@/lib/domain-enforcer';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
    title: 'Tamuu - Platform Undangan Digital & Vendor Pernikahan Premium',
    description: 'Temukan vendor pernikahan terbaik dan buat undangan digital eksklusif hanya di Tamuu.',
};

export default async function HomePage() {
    // Eject if accessing via app.tamuu.id
    await enforceDomain('public');

    return (
        <Suspense fallback={<PremiumLoader variant="full" showLabel label="Loading Tamuu..." />}>
            <HomeClient />
        </Suspense>
    );
}
