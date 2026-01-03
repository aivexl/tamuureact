import React from 'react';
import { Navbar } from './Navbar';
const Footer = React.lazy(() => import('./Footer').then(m => ({ default: m.Footer })));

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                {children}
            </main>
            <React.Suspense fallback={null}>
                <Footer />
            </React.Suspense>
        </div>
    );
};
