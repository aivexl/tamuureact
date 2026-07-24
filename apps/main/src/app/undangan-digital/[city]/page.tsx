import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cities } from '@/lib/api';
import CityHero from '@/components/undangan-digital/CityHero';
import FeaturesSection from '@/components/undangan-digital/FeaturesSection';
import PricingSection from '@/components/undangan-digital/PricingSection';
import TestimonialsSection from '@/components/undangan-digital/TestimonialsSection';
import FAQSection from '@/components/undangan-digital/FAQSection';
import BlogSection from '@/components/undangan-digital/BlogSection';
import CTASection from '@/components/undangan-digital/CTASection';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

interface Props {
    params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city: slug } = await params;
    const city = await cities.get(slug);
    
    if (!city) return { title: 'Undangan Digital Premium - Tamuu' };

    return {
        title: `Undangan Digital ${city.city_name} Premium & Mewah - Tamuu`,
        description: city.local_fact || `Jasa pembuatan undangan digital terbaik di ${city.city_name}. Desain eksklusif, fitur RSVP, dan musik custom.`,
        openGraph: {
            title: `Undangan Digital ${city.city_name} Premium - Tamuu`,
            description: city.local_fact,
            url: `https://tamuu.id/undangan-digital/${slug}`,
            siteName: 'Tamuu',
            locale: 'id_ID',
            type: 'website',
        },
    };
}

export default async function CityPage({ params }: Props) {
    const { city: slug } = await params;
    const city = await cities.get(slug);

    if (!city) notFound();

    return (
        <div className="bg-[#0A1128] min-h-screen">
            <Suspense fallback={<PremiumLoader />}>
                <CityHero cityName={city.city_name} localFact={city.local_fact} />
                <FeaturesSection />
                <PricingSection />
                <TestimonialsSection />
                <FAQSection />
                <BlogSection />
                <CTASection />
            </Suspense>
        </div>
    );
}
