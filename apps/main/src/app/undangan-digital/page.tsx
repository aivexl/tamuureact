import React, { Suspense, lazy } from 'react';
import { Metadata } from 'next';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import FeaturesSection from '@/components/undangan-digital/FeaturesSection';

// Metadata for SEO (Server Side)
export const metadata: Metadata = {
    title: 'Platform Undangan Digital Premium & Eksklusif',
    description: 'Tingkatkan momen spesial Anda dengan undangan digital premium dari Tamuu. Desain eksklusif, fitur RSVP modern, dan kemudahan bagi para pasangan pengantin.',
    openGraph: {
        title: 'Platform Undangan Digital Premium & Eksklusif',
        description: 'Tingkatkan momen spesial Anda dengan undangan digital premium dari Tamuu.',
        images: ['/images/hero-bride.webp'],
    }
};

// Lazy load non-critical sections further down
const PricingSection = lazy(() => import('@/components/undangan-digital/PricingSection'));
const BlogSection = lazy(() => import('@/components/undangan-digital/BlogSection'));
const TestimonialsSection = lazy(() => import('@/components/undangan-digital/TestimonialsSection'));
const FAQSection = lazy(() => import('@/components/undangan-digital/FAQSection'));
const CTASection = lazy(() => import('@/components/undangan-digital/CTASection'));
const ShopSection = lazy(() => import('@/components/undangan-digital/ShopSection'));
const HeroSection = lazy(() => import('@/components/undangan-digital/HeroSection'));

const SectionLoader = () => (
    <div className="py-20 flex justify-center items-center bg-white">
        <PremiumLoader variant="inline" color="#0A1128" showLabel label="Loading Section..." />
    </div>
);

export default function UndanganDigitalPage() {
    return (
        <div className="bg-white text-gray-900 overflow-visible font-sans">
            {/* Hero Section - Restored from legacy structure */}
            <Suspense fallback={<div className="h-[600px] bg-[#0A1128]" />}>
                <HeroSection />
            </Suspense>

            {/* Features Section - Eagerly loaded */}
            <FeaturesSection />

            {/* Suspense wrapped lazy sections */}
            <Suspense fallback={<SectionLoader />}>
                <PricingSection />
                <ShopSection />
                <TestimonialsSection />
                <FAQSection />
                <BlogSection />
                <CTASection />
            </Suspense>
        </div>
    );
}
