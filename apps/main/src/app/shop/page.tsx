import { enforceDomain } from '@/lib/domain-enforcer';
import { redirect } from 'next/navigation';

export default async function ShopPage() {
    await enforceDomain('public');
    redirect('/');
}
