import { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';
import { shop } from '@/lib/api';

interface PageProps {
    params: Promise<{
        slug: string;
        productId: string;
    }>;
}

/**
 * TAMUU PRODUCT DETAIL ENGINE (SSR)
 * Handles SEO and high-fidelity rendering bridge.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { productId } = await params;
    
    try {
        const product = await shop.getProduct(productId);
        
        if (!product) {
            return {
                title: 'Produk Tidak Ditemukan | Tamuu',
                description: 'Maaf, produk yang Anda cari tidak dapat ditemukan.'
            };
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

export default async function ProductDetailPage({ params }: PageProps) {
    // We don't need to fetch data here as the Client component will do it 
    // to maintain 100% logic fidelity with the original Vite implementation.
    return <ProductDetailClient />;
}
