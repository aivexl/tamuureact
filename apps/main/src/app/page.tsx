import React, { Suspense } from 'react';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/Shop/Breadcrumbs';
import { MultiCarousel } from '@/components/ui/MultiCarousel';
import { SEOListingFooter } from '@/components/Shop/SEOListingFooter';
import { getShopData } from '@/lib/api';
import ShopClientContent from '@/components/Shop/ShopClientContent';

export default async function HomePage() {
    const data = await getShopData();

    return (
        <div className="min-h-screen bg-white">
            <Container className="pt-32 pb-20">
                <Breadcrumbs />
                
                {/* Carousel (Kept functional motion as requested) */}
                <section className="mb-12">
                    <MultiCarousel items={data.slides} />
                </section>

                {/* Sub-content with zero initial animation */}
                <Suspense fallback={<div className="h-96 bg-slate-50 rounded-[3rem] border border-slate-100" />}>
                    <ShopClientContent initialProducts={data.products} />
                </Suspense>

                <SEOListingFooter />
            </Container>
        </div>
    );
}
