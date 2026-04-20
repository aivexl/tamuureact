import { redirect } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * TAMUU SHORT LINK REDIRECTOR
 * Redirects /product/:id to /shop/umum/:id for consistency and SEO.
 */
export default async function ProductRedirectPage({ params }: Props) {
    const { id } = await params;
    
    // Always redirect to shop detail
    // We use 'umum' as default vendor slug for short links
    redirect(`/shop/umum/${id}`);
}
