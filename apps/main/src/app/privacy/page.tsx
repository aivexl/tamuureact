import { enforceDomain } from '@/lib/domain-enforcer';
import PrivacyClient from './PrivacyClient';

export default async function PrivacyPage() {
    await enforceDomain('public');
    return <PrivacyClient />;
}
