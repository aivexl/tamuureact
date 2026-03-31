"use client";

import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';
import { motion as m, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function SignupPage() {
    const [signupError, setSignupError] = useState<string | null>(null);
    const isLoading = false; // Dummy for UI porting

    const handleSignup = async (data: any) => {
        console.log('Signup attempt with:', data);
        // Logic to be implemented in Task 3
    };

    return (
        <AuthLayout
            title="Mulai Hari Ini"
            subtitle="Bergabunglah dengan standar baru dalam platform undangan digital dunia."
        >
            <AnimatePresence mode="wait">
                {signupError && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Pendaftaran Gagal</p>
                            <p className="text-xs text-rose-200/70 font-medium leading-relaxed">
                                {signupError}
                            </p>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            <AuthForm mode="signup" onSubmit={handleSignup} isLoading={isLoading} />

            <p className="mt-8 text-center text-sm text-white/40 font-medium">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-white font-black hover:text-premium-accent transition-colors">
                    Masuk Sekarang
                </Link>
            </p>
        </AuthLayout>
    );
}
