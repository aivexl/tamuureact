import React from 'react';
import { Metadata } from 'next';
import { getBlogPosts, getBlogCategories, getBlogCarousel } from '@/lib/api';
import BlogContent from './BlogContent';

import { enforceDomain } from '@/lib/domain-enforcer';

export async function generateMetadata(): Promise<Metadata> {
    const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
    const currentYear = new Date().getFullYear().toString();
    
    const title = `Blog & Artikel Pernikahan - Update ${currentMonth} ${currentYear} | Tamuu`;
    const description = `Kumpulan artikel pilihan seputar industri pernikahan, vendor event, dan tren gaya hidup. Temukan inspirasi terbaru bulan ${currentMonth} ${currentYear}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://tamuu.id/blog',
        }
    };
}

export default async function BlogLandingPage() {
    await enforceDomain('public');
    
    // Fetch initial data server-side
    const [initialPosts, catsData, carouselData] = await Promise.all([
        getBlogPosts({ limit: 9, offset: 0 }),
        getBlogCategories(),
        getBlogCarousel()
    ]);

    const categories = ['All', ...catsData.map((c: any) => c.name)];
    
    const fallbackSlides = [
        { id: '1', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000', title: 'The Architecture of Moments', category_label: 'Gallery', link_url: '#' },
        { id: '2', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000', title: 'Modern Elegance', category_label: 'Tips', link_url: '#' },
        { id: '3', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000', title: 'The Minimalist Cut', category_label: 'Editorial', link_url: '#' },
        { id: '4', image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=2000', title: 'Timeless Traditions', category_label: 'Culture', link_url: '#' },
        { id: '5', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000', title: 'Sustainable Weddings', category_label: 'Eco', link_url: '#' },
        { id: '6', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=2000', title: 'Grand Celebrations', category_label: 'Venue', link_url: '#' }
    ];

    let carouselSlides = carouselData.length > 0 ? [...carouselData] : fallbackSlides;
    if (carouselSlides.length < 6 && carouselData.length > 0) {
        const padding = fallbackSlides.slice(0, 6 - carouselSlides.length);
        carouselSlides = [...carouselSlides, ...padding];
    }
    carouselSlides = carouselSlides.slice(0, 6);

    const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
    const currentYear = new Date().getFullYear().toString();

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `Apa artikel terbaru tentang pernikahan?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Pada bulan ${currentMonth} ${currentYear}, Tamuu telah menerbitkan artikel terbaru seputar pernikahan yang mencakup panduan dan tips vendor profesional.`
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <BlogContent 
                initialPosts={initialPosts} 
                categories={categories} 
                carouselSlides={carouselSlides} 
            />
        </>
    );
}
