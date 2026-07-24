import { redirect } from 'next/navigation';

export default async function CategoryRootPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    // Redirect /katalog/[category] to /shop?category=[category]
    redirect(`/shop?category=${category}`);
}
