"use client";

import React, { Suspense } from 'react';
import { HeroSection } from '@/components/Landing/HeroSection';
import { FeaturesSection } from '@/components/Landing/FeaturesSection';
import { PricingSection } from '@/components/Landing/PricingSection';
import { ShopSection } from '@/components/Landing/ShopSection';
import { CTASection } from '@/components/Landing/CTASection';

// Section Wrapper - Simplified to prevent flickering white blank
const SectionWrapper: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
    <div 
        id={id} 
        className="relative"
    >
        {children}
    </div>
);

const SectionSkeleton: React.FC<{ height: string }> = ({ height }) => (
    <div 
        style={{ height }} 
        className="w-full flex justify-center items-center bg-white animate-pulse"
    >
        <div className="w-10 h-10 border-2 border-slate-100 border-t-[#0A1128] rounded-full animate-spin" />
    </div>
);

export default function LandingPage() {
    return (
        <div className="bg-white text-gray-900 overflow-visible font-sans">
            <HeroSection />

            <FeaturesSection />

            <SectionWrapper id="pricing" minHeight="600px">
                <PricingSection />
            </SectionWrapper>

            <SectionWrapper id="shop" minHeight="800px">
                <ShopSection />
            </SectionWrapper>

            {/* Testimonials, FAQ, Blog can be added later as phases */}
            
            <SectionWrapper id="cta" minHeight="400px">
                <CTASection />
            </SectionWrapper>
        </div>
    );
}
