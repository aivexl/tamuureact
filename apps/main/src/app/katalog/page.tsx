import { redirect } from 'next/navigation';

export default function KatalogRootPage() {
    // Redirect /katalog to /shop for now as it's the primary discovery hub
    redirect('/shop');
}
