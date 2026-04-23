import { Metadata } from 'next';
import { shop } from '@/lib/api';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * TAMUU STOREFRONT SEO SHELL (BOTS ONLY)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    
    try {
        const data = await shop.getStorefront(slug);
        const vendor = data?.vendor;
        
        if (!vendor) {
            return { title: 'Toko Tidak Ditemukan | Tamuu' };
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
                url: `https://tamuu.id/shop/${slug}`
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch (error) {
        return { title: 'Tamuu Shop' };
    }
}

export default async function StorefrontSEOShellPage() {
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Tamuu Storefront</h1>
            <p>Loading premium vendor profiles...</p>
        </div>
    );
}
