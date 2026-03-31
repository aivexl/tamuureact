"use client";

import React, { useState, Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';
import { motion as m, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/auth/actions';

function LoginContent() {
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('return_to');

    const handleLogin = async (loginData: any) => {
        setIsLoading(true);
        setLoginError(null);
        
        try {
            const result = await login({ 
                email: loginData.email, 
                password: loginData.password, 
                return_to: returnTo 
            });
            
            if (result?.error) {
                setLoginError(result.error);
            }
        } catch (err: any) {
            // Next.js redirect "error" is caught here sometimes if not handled by Next.js
            // but usually it works fine.
            if (err.message !== 'NEXT_REDIRECT') {
                setLoginError(err.message || 'Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {loginError && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Akses Ditolak</p>
                            <p className="text-xs text-rose-200/70 font-medium leading-relaxed">
                                {loginError}
                            </p>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />

            <p className="mt-8 text-center text-sm text-white/40 font-medium">
                Belum punya akun?{' '}
                <Link href="/signup" className="text-white font-black hover:text-premium-accent transition-colors">
                    Daftar di sini
                </Link>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <AuthLayout
            title="Selamat Datang Kembali"
            subtitle="Masuk untuk melanjutkan perjalanan eksklusif Anda bersama Tamuu."
        >
            <Suspense fallback={<div>Loading...</div>}>
                <LoginContent />
            </Suspense>
        </AuthLayout>
    );
}
