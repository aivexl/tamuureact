import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Store, Link as LinkIcon, Briefcase, ArrowRight, Check, AlertCircle, X, ChevronDown, MapPin, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { useOnboardMerchant, useMerchantProfile } from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useSEO } from '../../hooks/useSEO';
import { shop } from '../../lib/api';
import { Navbar } from '../../components/Layout/Navbar';
import { INDONESIA_REGIONS } from '../../constants/regions';

const SHOP_CATEGORIES = [
    'Makeup Artist',
    'Wedding Organizer',
    'Dekorasi',
    'Fotografi',
    'Katering',
    'Venue',
    'Entertainment',
    'Lainnya'
];

// Map text labels to D1 database UUIDs to satisfy FOREIGN KEY constraint on shop_category
const CATEGORY_UUID_MAP: Record<string, string> = {
    'Makeup Artist': 'cat-001',
    'Wedding Organizer': 'cat-002',
    'Katering': 'cat-003',
    'Fotografi': 'cat-004',
    'Dekorasi': 'cat-005',
    'Venue': 'cat-006',
    'Entertainment': 'cat-001', // Fallbacks if not seeded
    'Lainnya': 'cat-001'
};

export const MerchantOnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const { data: profile } = useMerchantProfile(user?.id);
    const { mutateAsync: onboardMerchant, isPending } = useOnboardMerchant();

    // Auto-redirect if already a merchant
    React.useEffect(() => {
        if (profile?.isMerchant && profile?.merchant?.slug) {
            window.location.href = `/store/${profile.merchant.slug}/dashboard`;
        }
    }, [profile]);

    const [step, setStep] = useState(1);
    const [namaToko, setNamaToko] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [kota, setKota] = useState('');
    const [slug, setSlug] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

    // Location State
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');

    const filteredCities = React.useMemo(() => {
        const cleanQuery = citySearchQuery.trim().toLowerCase();
        if (!cleanQuery) return INDONESIA_REGIONS;
        return INDONESIA_REGIONS.filter(city => city.toLowerCase().includes(cleanQuery));
    }, [citySearchQuery]);

    useSEO({
        title: 'Buka Toko Jasa - Tamuu Shop',
        description: 'Mulai kembangkan bisnis event Anda bersama Tamuu Shop.'
    });

    // Auto-generate slug from nama_toko if slug is empty
    const handleNamaTokoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNamaToko(val);
        if (step === 1 && !slug) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 24));
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
        } else if (value.length > 24) {
            setError("Maksimal 24 karakter.");
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
        if (slug.length < 5 || slug.length > 24 || !/[a-zA-Z0-9]/.test(slug) || /[^a-zA-Z0-9_]/.test(slug)) {
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

            // Map the selected string category to its database ID
            const mappedCategoryId = CATEGORY_UUID_MAP[categoryId] || 'cat-001';

            const result = await onboardMerchant({
                user_id: user.id,
                nama_toko: namaToko,
                slug: slug,
                category_id: mappedCategoryId, // Use mapped ID instead of raw string
                kota: kota,
                deskripsi: `Selamat datang di ${namaToko}` // default initial description
            });

            // Use API-confirmed slug for guaranteed consistency with backend
            const confirmedSlug = result?.slug || slug;

            // Hard navigate to force a full page reload
            window.location.href = `/store/${confirmedSlug}/dashboard`;
        } catch (err: any) {
            setError(err.message || 'Gagal membuat toko. Silakan coba slug atau nama lain.');
        }
    };

    const nextStep = () => {
        if (step === 1 && namaToko.length >= 3) {
            setStep(2);
        } else if (step === 2 && categoryId) {
            setStep(3);
        } else if (step === 3 && kota) {
            setStep(4);
        } else if (step === 4 && slug.length >= 3) {
            handleComplete();
        }
    };

    const isStepValid = () => {
        if (step === 1) return namaToko.length >= 3;
        if (step === 2) return !!categoryId;
        if (step === 3) return !!kota;
        if (step === 4) return slug.length >= 5 && slug.length <= 24 && isSlugAvailable === true && !error;
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-24 pb-32">
            <Navbar />
            {/* Steps Header */}
            <div className="bg-white border-b border-slate-200 sticky top-[72px] z-20 px-4 sm:px-6 py-4 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
                    {[1, 2, 3, 4].map((s) => {
                        const isActive = step === s;
                        const isDone = step > s;
                        return (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/20' : isDone ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' : 'bg-white border border-slate-100 text-slate-300 shadow-sm'}`}>
                                        {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <div className="text-[10px] sm:text-xs font-bold">{s}</div>}
                                    </div>
                                    <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {s === 1 ? 'NAMA' : s === 2 ? 'KATEGORI' : s === 3 ? 'LOKASI' : 'LINK'}
                                    </span>
                                </div>
                                {s < 4 && (
                                    <div className={`flex-1 h-0.5 mt-[-14px] transition-colors duration-500 ${isDone ? 'bg-indigo-500/30' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* STEP 1: NAMA TOKO */}
                    {step === 1 && (
                        <m.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-[540px] w-full text-center space-y-8 sm:space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500 text-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_8px_30px_rgb(99,102,241,0.3)] animate-bounce">
                                    <Store className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">Mulai Ekosistem Bisnismu</h1>
                                <p className="text-slate-500 text-base sm:text-lg">Apa nama brand atau toko jasa Anda?</p>
                            </div>

                            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-3 text-left">
                                <label className="text-[10px] sm:text-xs font-semibold text-slate-400 ml-2 uppercase tracking-widest">Nama Brand / Toko</label>
                                <div className="group relative flex items-center bg-slate-50 hover:bg-slate-100/50 transition-all duration-300 rounded-[1rem] sm:rounded-[1.5rem] border border-transparent focus-within:!bg-white focus-within:!border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-500/10 overflow-hidden px-5 sm:px-6 py-2 h-16 sm:h-20">
                                    <input
                                        type="text"
                                        value={namaToko}
                                        onChange={handleNamaTokoChange}
                                        autoFocus
                                        className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg lg:text-xl font-bold text-slate-900 placeholder:text-slate-300 w-full"
                                        placeholder="Contoh: The Grand Estate"
                                    />
                                </div>
                            </div>
                        </m.div>
                    )}

                    {/* STEP 2: CATEGORY */}
                    {step === 2 && (
                        <m.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="max-w-[720px] w-full text-center space-y-8 sm:space-y-10 px-2 sm:px-0">
                            <div className="space-y-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-100/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">Kategori Utama</h1>
                                <p className="text-slate-500 text-base sm:text-lg">Pilih industri yang paling sesuai dengan layanan Anda.</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                {SHOP_CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setCategoryId(category)}
                                        className={`p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border-2 transition-all duration-300 ${categoryId === category ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-[1.03] ring-4 ring-indigo-500/10' : 'border-transparent bg-white shadow-sm hover:border-slate-200'}`}
                                    >
                                        <h3 className={`font-semibold text-xs sm:text-sm ${categoryId === category ? 'text-indigo-600' : 'text-slate-600'}`}>{category}</h3>
                                    </button>
                                ))}
                            </div>
                        </m.div>
                    )}

                    {/* STEP 3: LOKASI */}
                    {step === 3 && (
                        <m.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="max-w-[540px] w-full text-center space-y-8 sm:space-y-10">
                            <div className="space-y-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-100/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">Basis Operasional</h1>
                                <p className="text-slate-500 text-base sm:text-lg">Di mana lokasi brand Anda saat ini?</p>
                            </div>

                            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-6 relative">
                                <div className="text-left space-y-3">
                                    <label className="text-[10px] sm:text-xs font-semibold text-slate-400 ml-2 uppercase tracking-widest">Kota / Kabupaten</label>
                                    
                                    <div 
                                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                                        className="flex items-center w-full bg-slate-50 hover:bg-slate-100/50 transition-all rounded-[1rem] sm:rounded-[1.5rem] px-6 py-4 cursor-pointer min-h-[64px]"
                                    >
                                        <MapPin className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
                                        <span className={`flex-1 font-bold text-sm sm:text-base ${kota ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {kota || 'Pilih Wilayah...'}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isLocationOpen && (
                                            <m.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute left-6 right-6 top-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] z-50 flex flex-col max-h-[300px] overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-slate-50 flex items-center gap-2">
                                                    <SearchIcon className="w-4 h-4 text-slate-300" />
                                                    <input 
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Cari kota..."
                                                        value={citySearchQuery}
                                                        onChange={(e) => setCitySearchQuery(e.target.value)}
                                                        className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-900"
                                                    />
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                                                    {filteredCities.map((city) => (
                                                        <button
                                                            key={city}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setKota(city);
                                                                setIsLocationOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                                                        >
                                                            {city}
                                                        </button>
                                                    ))}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </m.div>
                    )}

                    {/* STEP 4: SLUG */}
                    {step === 4 && (
                        <m.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="max-w-[540px] w-full text-center space-y-8 sm:space-y-10">
                            <div className="space-y-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-100/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight uppercase tracking-widest">URL Toko Spesialmu</h1>
                                <p className="text-slate-500 text-base sm:text-lg">Buat identitas web yang elegan dan mudah diingat.</p>
                            </div>

                            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-6">
                                <div className="text-left space-y-3">
                                    <label className="text-[10px] sm:text-xs font-semibold text-slate-400 ml-2 uppercase tracking-widest">Tautan Kustom</label>

                                    <div className="group relative flex flex-col sm:flex-row sm:items-center bg-slate-50 hover:bg-slate-100/50 transition-all duration-300 rounded-[1rem] sm:rounded-[1.5rem] border border-transparent focus-within:!bg-white focus-within:!border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-500/10 overflow-hidden px-4 sm:px-6 py-3 sm:py-2 min-h-[80px] sm:h-20 gap-1 sm:gap-0">
                                        <span className="text-slate-400 font-medium text-base sm:text-lg lg:text-xl select-none mr-0.5 tracking-tight">
                                            tamuu.id/shop/
                                        </span>
                                        <div className="flex-1 flex items-center min-w-0">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={slug}
                                                maxLength={24}
                                                onChange={handleSlugChange}
                                                className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg lg:text-xl font-bold text-slate-900 placeholder:text-slate-300 w-full min-w-0"
                                                placeholder="brand_anda"
                                            />

                                            {/* Status Indicator */}
                                            <div className="pl-3 flex items-center justify-center shrink-0">
                                                {isCheckingSlug ? (
                                                    <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                                                ) : isSlugAvailable === true ? (
                                                    <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" strokeWidth={3} />
                                                    </m.div>
                                                ) : isSlugAvailable === false ? (
                                                    <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" strokeWidth={3} />
                                                    </m.div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-3 mt-4">
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-tight">Hanya huruf kecil, angka, dan `_`</p>
                                        <span className={`text-[10px] sm:text-xs font-bold ${slug.length >= 24 ? 'text-amber-500' : 'text-slate-300'}`}>
                                            {slug.length}/24
                                        </span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <m.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
                                            <div className="inline-flex items-center gap-2 text-[11px] sm:text-sm font-medium text-rose-600 bg-rose-50/80 px-4 py-2.5 rounded-full border border-rose-100/50">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <p className="text-left">{error}</p>
                                            </div>
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Sticky Mobile Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-30 pointer-events-none pb-safe">
                <div className="max-w-xl mx-auto flex items-center justify-center pointer-events-auto">
                    <button
                        onClick={nextStep}
                        disabled={!isStepValid() || isPending}
                        className={`group relative w-full h-14 sm:h-16 rounded-[1.25rem] sm:rounded-[2rem] font-bold tracking-widest uppercase shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 text-xs sm:text-sm ${isStepValid() && !isPending ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isPending ? (
                            <PremiumLoader variant="inline" size="sm" color="#ffffff" label="Processing..." showLabel />
                        ) : (
                            <>
                                {step === 4 ? 'Buka Toko Sekarang' : 'Lanjut'}
                                <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isStepValid() ? 'group-hover:translate-x-1' : ''}`} />
                            </>
                        )}
                        {isStepValid() && !isPending && (
                            <m.div layoutId="glow" className="absolute inset-0 rounded-[1.25rem] sm:rounded-[2rem] bg-indigo-500/20 blur-xl -z-10" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MerchantOnboardingPage;