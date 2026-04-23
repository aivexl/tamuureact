import { Metadata } from 'next';
import { shop } from '@/lib/api';

interface PageProps {
    params: Promise<{
        slug: string;
        productId: string;
    }>;
}

/**
 * TAMUU SEO SHELL (BOTS ONLY)
 * This page only exists to provide meta tags for crawlers.
 * It is never seen by human users (who are proxied to Vite).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { productId } = await params;
    
    try {
        const product = await shop.getProduct(productId);
        
        if (!product) {
            return { title: 'Produk Tidak Ditemukan | Tamuu' };
        }

        const title = `${product.nama_produk} | Tamuu Shop`;
        const description = product.deskripsi?.substring(0, 160) || `Beli ${product.nama_produk} terbaik hanya di Tamuu Shop.`;
        const imageUrl = product.images?.[0]?.image_url || 'https://tamuu.id/images/og-default.jpg';

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [imageUrl],
                type: 'website',
                url: `https://tamuu.id/shop/umum/${productId}`
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

export default async function SEOShellPage() {
    // Basic fallback content for bots that might read body
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Tamuu Shop</h1>
            <p>Loading premium wedding products...</p>
        </div>
    );
}
