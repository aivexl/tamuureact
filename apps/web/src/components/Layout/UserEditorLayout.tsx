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

            {/* Sticky Bottom Actions (Optional, like Mobile Preview) */}
            <div className="fixed bottom-6 right-6 z-50">
                <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        const state = useStore.getState();
                        if (state.slug) {
                            window.open(`https://tamuu.id/v/${state.slug}`, '_blank');
                        } else {
                            alert('Slug belum diatur.');
                        }
                    }}
                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all"
                >
                    Lihat Preview
                </m.button>
            </div>
        </div>
    );
};
