import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Store, Link as LinkIcon, Briefcase, ArrowRight, Check, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { useOnboardMerchant } from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useSEO } from '../../hooks/useSEO';
import { shop } from '../../lib/api';

const SHOP_CATEGORIES = [
    'Makeup Artist',
    'Wedding Organizer',
    'Dekorasi',
    'Fotografi',
    'Catering',
    'Venue',
    'Entertainment',
    'Lainnya'
];

export const MerchantOnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const { mutateAsync: onboardMerchant, isPending } = useOnboardMerchant();

    const [step, setStep] = useState(1);
    const [namaToko, setNamaToko] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [slug, setSlug] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

    useSEO({
        title: 'Buka Toko Jasa - Tamuu Nexus',
        description: 'Mulai kembangkan bisnis event Anda bersama Tamuu Nexus.'
    });

    // Auto-generate slug from nama_toko if slug is empty
    const handleNamaTokoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNamaToko(val);
        if (step === 1 && !slug) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_'));
        }
    };

    // Advanced Slug Validation
    const validateSlugFormat = (value: string) => {
        if (/[^a-zA-Z0-9_]/.test(value)) {
            setError("Hanya boleh menggunakan huruf, angka, dan garis bawah (_). Karakter spesial (@, #, $) atau spasi tidak diizinkan.");
            return false;
        } else if (value.length > 0 && value.length < 5) {
            setError("Minimal 5 karakter.");
            return false;
        } else if (value.length >= 5 && !/[a-zA-Z0-9]/.test(value)) {
            setError("Tidak boleh hanya berisi garis bawah (_).");
            return false;
        } else {
            setError(null);
            return true;
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/\s+/g, '');
        setSlug(val);
        validateSlugFormat(val);
    };

    // Real-time Slug Availability Check (Debounced)
    React.useEffect(() => {
        if (slug.length < 5 || !/[a-zA-Z0-9]/.test(slug) || /[^a-zA-Z0-9_]/.test(slug)) {
            setIsSlugAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingSlug(true);
            try {
                const { available } = await shop.checkMerchantSlug(slug);
                setIsSlugAvailable(available);
                if (!available) {
                    setError('URL / Username ini sudah digunakan oleh toko lain. Silakan cari yang lain.');
                } else if (error === 'URL / Username ini sudah digunakan oleh toko lain. Silakan cari yang lain.') {
                    setError(null);
                }
            } catch (err) {
                console.error('Slug check failed:', err);
                setIsSlugAvailable(null);
            } finally {
                setIsCheckingSlug(false);
            }
        }, 600); // 600ms debounce

        return () => clearTimeout(timer);
    }, [slug, error]);

    const handleComplete = async () => {
        if (!user?.id) {
            setError("Session authentication required. Please login again.");
            return;
        }

        try {
            setError(null);
            await onboardMerchant({
                user_id: user.id,
                nama_toko: namaToko,
                slug: slug,
                category_id: categoryId,
                deskripsi: `Selamat datang di ${namaToko}` // default initial description
            });

            // Navigate to their new store dashboard on success
            navigate(`/store/${slug}/dashboard`);
        } catch (err: any) {
            setError(err.message || 'Gagal membuat toko. Silakan coba slug atau nama lain.');
        }
    };

    const nextStep = () => {
        if (step === 1 && namaToko.length >= 3) {
            setStep(2);
        } else if (step === 2 && categoryId) {
            setStep(3);
        } else if (step === 3 && slug.length >= 3) {
            handleComplete();
        }
    };

    const isStepValid = () => {
        if (step === 1) return namaToko.length >= 3;
        if (step === 2) return !!categoryId;
        if (step === 3) return slug.length >= 5 && isSlugAvailable === true && !error;
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-24 pb-10">
            {/* Steps Header */}
            <div className="bg-white border-b border-slate-200 sticky top-20 z-20 px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
                    {[1, 2, 3].map((s) => {
                        const isActive = step === s;
                        const isDone = step > s;
                        return (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-teal-500 text-white scale-110 shadow-lg shadow-teal-500/20' : isDone ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-300'}`}>
                                        {isDone ? <Check className="w-4 h-4" /> : <div className="text-xs font-black">{s}</div>}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                                        {s === 1 ? 'NAMA TOKO' : s === 2 ? 'KATEGORI' : 'LINK TOKO'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-0.5 mt-[-14px] transition-colors duration-500 ${isDone ? 'bg-teal-500/20' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* STEP 1: NAMA TOKO */}
                    {step === 1 && (
                        <m.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-teal-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/20 animate-bounce">
                                    <Store className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">Mulai Ekosistem Bisnismu</h1>
                                <p className="text-slate-500 text-lg">Apa nama brand atau toko jasa Anda?</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-50 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Nama Brand / Toko</label>
                                <input
                                    type="text"
                                    value={namaToko}
                                    onChange={handleNamaTokoChange}
                                    autoFocus
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-xl font-bold text-slate-900 placeholder:text-slate-300"
                                    placeholder="Contoh: The Grand Estate"
                                />
                            </div>
                        </m.div>
                    )}

                    {/* STEP 2: CATEGORY */}
                    {step === 2 && (
                        <m.div key="step2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-2xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <Briefcase className="w-8 h-8 text-amber-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">Kategori Utama</h1>
                                <p className="text-slate-500">Pilih industri yang paling sesuai dengan layanan Anda.</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {SHOP_CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setCategoryId(category)}
                                        className={`p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${categoryId === category ? 'border-teal-500 bg-teal-50/50 shadow-xl scale-105' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                    >
                                        <h3 className={`font-black text-sm ${categoryId === category ? 'text-teal-600' : 'text-slate-700'}`}>{category}</h3>
                                    </button>
                                ))}
                            </div>
                        </m.div>
                    )}

                    {/* STEP 3: SLUG */}
                    {step === 3 && (
                        <m.div key="step3" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <LinkIcon className="w-8 h-8 text-blue-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">Klaim URL Toko Anda</h1>
                                <p className="text-slate-500">Buat tautan unik untuk etalase profesional Anda.</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-50 space-y-6">
                                <div className="text-left space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Custom Link</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-[1.5rem] border border-slate-200 focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all">
                                        <div className="px-6 py-4 bg-slate-50 text-slate-400 font-bold select-none text-base border-b sm:border-b-0 sm:border-r border-slate-200 whitespace-nowrap">
                                            tamuu.id/shop/
                                        </div>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={slug}
                                            onChange={handleSlugChange}
                                            className="flex-1 px-6 py-4 bg-white outline-none text-lg font-bold text-slate-900 placeholder:text-slate-200 font-mono"
                                            placeholder="grand_estate"
                                        />
                                        {/* Status Indicator */}
                                        <div className="pr-4 flex items-center justify-center bg-white">
                                            {isCheckingSlug ? (
                                                <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                                            ) : isSlugAvailable === true ? (
                                                <Check className="w-6 h-6 text-teal-500 transition-transform duration-300 scale-110" />
                                            ) : isSlugAvailable === false ? (
                                                <X className="w-6 h-6 text-rose-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-4 mt-2">Gunakan huruf kecil, angka, dan garis bawah (_)</p>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p>{error}</p>
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Sticky Mobile Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-30 pointer-events-none">
                <div className="max-w-xl mx-auto flex items-center justify-center pointer-events-auto">
                    <button
                        onClick={nextStep}
                        disabled={!isStepValid() || isPending}
                        className={`group relative w-full h-16 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isStepValid() && !isPending ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isPending ? (
                            <PremiumLoader variant="inline" size="sm" color="#ffffff" label="Processing..." showLabel />
                        ) : (
                            <>
                                {step === 3 ? 'Buka Toko Sekarang' : 'Lanjut'}
                                <ArrowRight className={`w-5 h-5 transition-transform ${isStepValid() ? 'group-hover:translate-x-1' : ''}`} />
                            </>
                        )}
                        {isStepValid() && !isPending && (
                            <m.div layoutId="glow" className="absolute inset-0 rounded-[2.5rem] bg-teal-400/20 blur-xl -z-10" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
