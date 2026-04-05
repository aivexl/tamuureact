import { enforceDomain } from '@/lib/domain-enforcer';

export default async function RedirectPage() {
    await enforceDomain('app');
    return null;
}
