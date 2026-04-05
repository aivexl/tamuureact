import { enforceDomain } from '@/lib/domain-enforcer';
import AboutClient from './AboutClient';

export default async function AboutPage() {
    await enforceDomain('public');
    return <AboutClient />;
}
