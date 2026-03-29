"use client";

import React from 'react';
import { HeroSection } from '@/components/Landing/HeroSection';
import { FeaturesSection } from '@/components/Landing/FeaturesSection';
import { PricingSection } from '@/components/Landing/PricingSection';
import { CTASection } from '@/components/Landing/CTASection';
import { TestimonialsSection } from '@/components/Landing/TestimonialsSection';

export default function UndanganDigitalPage() {
    return (
        <div className="bg-[#0A1128] text-white overflow-x-hidden font-sans">
            <HeroSection />
            
            <section id="features">
                <FeaturesSection />
            </section>

            <section id="pricing">
                <PricingSection />
            </section>

            <TestimonialsSection />
            
            <section id="cta">
                <CTASection />
            </section>
        </div>
    );
}
