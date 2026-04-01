"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Plus, Wallet, BarChart3, 
    ArrowUpRight, Zap, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tamuu/shared';

// ============================================
// MIDTRANS CONFIG
// ============================================
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-aVS390dhMuLvPXMa';
const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_URL = MIDTRANS_IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

const loadSnapScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if ((window as any).snap) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = SNAP_URL;
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal memuat sistem pembayaran Midtrans'));
        document.body.appendChild(script);
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function VendorAdsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useStore();
    const slug = params.slug;

    const [vendor, setVendor] = useState<any>(null);
    const [topupModal, setTopupModal] = useState(false);
    const [topupAmount, setTopupAmount] = useState(50000);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVendor = async () => {
            if (!user?.id) return;
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id';
                const res = await fetch(`${API_BASE}/api/shop/vendor/me?userId=${user.id}`);
                const data = await res.json();
                setVendor(data.vendor);
            } catch (err) {
                console.error('Failed to fetch vendor:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, [user]);

    const handleTopup = async () => {
        if (!user) return;
        setIsProcessing(true);
        setError(null);

        try {
            await loadSnapScript();
            
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id';
            const response = await fetch(`${API_BASE}/api/billing/midtrans/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tamuu_token') || ''}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    tier: `AD_TOPUP:global`,
                    amount: topupAmount,
                    email: user.email,
                    name: user.name
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Gagal memproses pembayaran');

            (window as any).snap.pay(data.token, {
                onSuccess: () => {
                    setTopupModal(false);
                    router.refresh();
                },
                onPending: () => {
                    setTopupModal(false);
                    router.push(`/vendor/${slug}?payment=pending`);
                },
                onError: (err: any) => {
                    console.error('Snap error:', err);
                    setError('Pembayaran gagal. Silakan coba lagi.');
                },
                onClose: () => setIsProcessing(false)
            });
        } catch (err: any) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading Ads Center...</div>;

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[#0A1128] mb-1 italic uppercase tracking-tighter">Ads Center</h2>
                    <p className="text-slate-500 font-medium">Kelola saldo dan kampanye iklan Anda.</p>
                </div>
                <button 
                    onClick={() => setTopupModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#FFBF00] text-[#0A1128] font-black rounded-2xl shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" /> Top Up Saldo
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0A1128] p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-950/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-[#FFBF00]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Saldo Iklan</p>
                            <h3 className="text-3xl font-bold">{formatCurrency(vendor?.ad_balance || 0)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <BarChart3 className="w-7 h-7 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Klik</p>
                        <p className="text-2xl font-bold text-[#0A1128]">0</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <ArrowUpRight className="w-7 h-7 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tayangan</p>
                        <p className="text-2xl font-bold text-[#0A1128]">0</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-[#0A1128] uppercase tracking-tighter">Belum Ada Kampanye</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                        Mulai buat iklan pertama Anda untuk meningkatkan visibilitas produk.
                    </p>
                </div>
                <button className="px-8 py-4 bg-[#0A1128] text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all">
                    Buat Iklan Baru
                </button>
            </div>

            {/* TOPUP MODAL */}
            <AnimatePresence>
                {topupModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !isProcessing && setTopupModal(false)}
                            className="absolute inset-0 bg-[#0A1128]/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-[#0A1128] italic uppercase tracking-tighter">Top Up Saldo</h3>
                                <p className="text-slate-500 text-sm font-medium">Pilih nominal saldo yang ingin Anda tambahkan.</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {[20000, 50000, 100000, 250000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setTopupAmount(amount)}
                                        className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                            topupAmount === amount 
                                                ? 'bg-[#0A1128] text-white shadow-lg' 
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 font-black text-sm">Rp</div>
                                <input 
                                    type="number"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
                                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 text-[#0A1128]"
                                    placeholder="Min. 20.000"
                                />
                            </div>

                            {topupAmount > 0 && topupAmount < 20000 && (
                                <p className="text-[10px] text-rose-500 font-bold">Minimum top up saldo iklan adalah Rp 20.000</p>
                            )}

                            <button
                                onClick={handleTopup}
                                disabled={isProcessing || topupAmount < 20000}
                                className="w-full py-5 bg-[#FFBF00] text-[#0A1128] font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>Memproses... <div className="w-4 h-4 border-2 border-[#0A1128] border-t-transparent rounded-full animate-spin" /></>
                                ) : 'Bayar Sekarang'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
