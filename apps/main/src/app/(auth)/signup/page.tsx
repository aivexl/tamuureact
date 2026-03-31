"use client";

import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';
import { motion as m, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { signup } from '@/app/auth/actions';

export default function SignupPage() {
    const [signupError, setSignupError] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (data: any) => {
        setIsLoading(true);
        setSignupError(null);
        
        try {
            const result = await signup(data);
            if (result?.error) {
                setSignupError(result.error);
            } else if (result?.success) {
                setSignupSuccess(true);
            }
        } catch (err: any) {
            if (err.message !== 'NEXT_REDIRECT') {
                setSignupError(err.message || 'Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            setIsLoading(false);
        }
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

                {signupSuccess && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex flex-col items-center text-center gap-4"
                    >
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">Email Verifikasi Terkirim</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Silakan periksa kotak masuk Anda untuk memverifikasi akun Anda sebelum masuk.
                            </p>
                        </div>
                        <Link 
                            href="/login" 
                            className="w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl shadow-xl hover:bg-emerald-400 transition-all mt-2"
                        >
                            Ke Halaman Masuk
                        </Link>
                    </m.div>
                )}
            </AnimatePresence>

            {!signupSuccess && (
                <>
                    <AuthForm mode="signup" onSubmit={handleSignup} isLoading={isLoading} />

                    <p className="mt-8 text-center text-sm text-white/40 font-medium">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-white font-black hover:text-premium-accent transition-colors">
                            Masuk Sekarang
                        </Link>
                    </p>
                </>
            )}
        </AuthLayout>
    );
}
