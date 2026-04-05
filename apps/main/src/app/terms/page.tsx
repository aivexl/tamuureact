import { enforceDomain } from '@/lib/domain-enforcer';
import TermsClient from './TermsClient';

export default async function TermsPage() {
    await enforceDomain('public');
    return <TermsClient />;
}
