import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Tamuu',
    description: 'Kenali lebih dekat Tamuu, platform undangan digital tercanggih di Indonesia yang berbasis di BSD, Tangerang.',
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
