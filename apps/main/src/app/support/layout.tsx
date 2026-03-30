import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support Center | Tamuu',
    description: 'Hubungi tim dukungan Tamuu untuk bantuan teknis, kemitraan, atau pertanyaan seputar layanan kami.',
};

export default function SupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
