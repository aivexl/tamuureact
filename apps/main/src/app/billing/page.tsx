"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

function BillingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const status = searchParams.get('status');

    useEffect(() => {
        // Auto-redirect to dashboard after 5 seconds if success
        if (status === 'success') {
            const timer = setTimeout(() => {
                router.push('/dashboard');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    const renderStatus = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-[#0A1128]">Pembayaran Berhasil!</h1>
                            <p className="text-slate-500 font-medium">Terima kasih atas pembayaran Anda. Paket Anda akan segera aktif.</p>
                        </div>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-4 bg-[#0A1128] text-white font-black rounded-2xl flex items-center gap-2 mx-auto hover:bg-[#152042] transition-all"
                        >
                            Ke Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-slate-400">Anda akan dialihkan otomatis dalam 5 detik.</p>
                    </div>
                );
            case 'pending':
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                            <Clock className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-[#0A1128]">Pembayaran Pending</h1>
                            <p className="text-slate-500 font-medium">Selesaikan pembayaran Anda sesuai petunjuk yang diberikan.</p>
                        </div>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-4 bg-[#0A1128] text-white font-black rounded-2xl flex items-center gap-2 mx-auto hover:bg-[#152042] transition-all"
                        >
                            Ke Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-[#0A1128]">Pembayaran Gagal</h1>
                            <p className="text-slate-500 font-medium">Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.</p>
                        </div>
                        <button 
                            onClick={() => router.push('/upgrade')}
                            className="px-8 py-4 bg-[#0A1128] text-white font-black rounded-2xl flex items-center gap-2 mx-auto hover:bg-[#152042] transition-all"
                        >
                            Coba Lagi <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                );
            default:
                return (
                    <div className="text-center space-y-6">
                        <PremiumLoader variant="inline" size="lg" />
                        <p className="text-slate-500 font-medium">Memproses status pembayaran...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
            >
                {renderStatus()}
            </motion.div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <PremiumLoader variant="full" />
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
