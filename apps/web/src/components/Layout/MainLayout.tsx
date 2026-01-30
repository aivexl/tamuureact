import React from 'react';
import { Navbar } from './Navbar';
const Footer = React.lazy(() => import('./Footer').then(m => ({ default: m.Footer })));
// Lazy load UserChatSidebar to reduce initial bundle size (removes react-markdown, remark-gfm from main chunk)
const UserChatSidebar = React.lazy(() => import('./UserChatSidebar').then(m => ({ default: m.UserChatSidebar })));

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
            <React.Suspense fallback={null}>
                <UserChatSidebar />
            </React.Suspense>
        </div>
    );
};
