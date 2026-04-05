import { enforceDomain } from '@/lib/domain-enforcer';
import SupportClient from './SupportClient';

export default async function SupportPage() {
    await enforceDomain('public');
    return <SupportClient />;
}
