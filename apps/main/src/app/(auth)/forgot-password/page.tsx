"use client";

import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { motion as m } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <AuthLayout
            title="Lupa Kata Sandi?"
            subtitle="Jangan khawatir, kami akan membantu Anda mendapatkan kembali akses ke akun eksklusif Anda."
        >
            <div className="mb-8">
                <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Masuk
                </Link>
            </div>

            {isSubmitted ? (
                <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-6"
                >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white">Email Terkirim</h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                            Kami telah mengirimkan instruksi pemulihan kata sandi ke alamat email Anda.
                        </p>
                    </div>
                </m.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                            Alamat Email
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-premium-accent transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="name@company.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-premium-accent/50 focus:bg-white/10 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-white/5 hover:bg-premium-accent hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                        {isLoading ? 'Mengirim...' : 'Kirim Instruksi'}
                    </button>
                </form>
            )}

            <div className="mt-8 text-center">
                <span className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">Next.js Unified v2.1.0</span>
            </div>
        </AuthLayout>
    );
}
