import React from 'react';
import { m } from 'framer-motion';
import { Navbar } from '@/components/Layout/Navbar';
import { useStore } from '@/store/useStore';

interface UserEditorLayoutProps {
    children: React.ReactNode;
}

export const UserEditorLayout: React.FC<UserEditorLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / Navbar */}
            <Navbar />

            {/* Main Content Scroll Area */}
            <main className="flex-1 overflow-y-auto pt-14 pb-20">
                {children}
            </main>

        </div>
    );
};
