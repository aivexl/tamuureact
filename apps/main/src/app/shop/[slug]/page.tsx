import { Metadata } from 'next';
import { StorefrontClient } from './StorefrontClient';
import { shop } from '@/lib/api';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * TAMUU STOREFRONT ENGINE (SSR)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    
    try {
        const data = await shop.getStorefront(slug);
        const vendor = data?.vendor;
        
        if (!vendor) {
            return {
                title: 'Toko Tidak Ditemukan | Tamuu',
                description: 'Maaf, toko yang Anda cari tidak dapat ditemukan.'
            };
        }

        const title = `${vendor.nama_toko} | Tamuu Shop`;
        const description = vendor.deskripsi?.substring(0, 160) || `Kunjungi toko ${vendor.nama_toko} terbaik hanya di Tamuu Shop.`;
        const imageUrl = vendor.logo_url || 'https://tamuu.id/images/og-default.jpg';

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [imageUrl],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch (error) {
        return {
            title: 'Tamuu Shop',
            description: 'Platform Wedding & Digital Marketplace Premium'
        };
    }
}

export default async function StorefrontPage({ params }: PageProps) {
    return <StorefrontClient />;
}
