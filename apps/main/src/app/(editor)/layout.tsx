"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';

export default function UserEditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20">
                {children}
            </main>
        </div>
    );
}
