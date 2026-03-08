import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import {
    Check, Sparkles, User,
    ArrowRight, X, Globe
} from 'lucide-react';
import { invitations } from '../lib/api';
import { PremiumLoader } from '../components/ui/PremiumLoader';

// ============================================
// MAIN COMPONENT
// ============================================
export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { search } = useMemo(() => window.location, []);
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);
    const initialTemplateId = queryParams.get('templateId');

    // --- State Management ---
    const [slug, setSlug] = useState('');
    const [invitationName, setInvitationName] = useState('');
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

    // ============================================
    // PERSISTENT STATE - Save/Restore from localStorage
    // ============================================
    const STORAGE_KEY = 'tamuu_onboarding_progress_v4';
    const [isRestored, setIsRestored] = useState(false);

    // Restore state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.slug) setSlug(data.slug);
                if (data.invitationName) setInvitationName(data.invitationName);
            } catch (e) {
                console.error('Failed to restore onboarding progress:', e);
            }
        }
        setIsRestored(true);
    }, []);

    // Save state to localStorage on changes
    useEffect(() => {
        if (!isRestored) return;
        const data = { slug, invitationName };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [isRestored, slug, invitationName]);

    // Slug Availability Check (Debounced)
    useEffect(() => {
        // Validation Rules:
        // 1. Min 7 characters
        // 2. Not all numbers (must have at least one letter)
        // 3. Not all hyphens
        const isAllNumbers = /^\d+$/.test(slug.replace(/-/g, ''));
        const isAllHyphens = /^[ -]+$/.test(slug);
        const isTooShort = slug.length < 7;

        if (isTooShort || isAllNumbers || isAllHyphens) {
            setIsSlugAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingSlug(true);
            try {
                const { available } = await invitations.checkSlug(slug);
                setIsSlugAvailable(available);
            } catch (error) {
                console.error('Slug check failed:', error);
                setIsSlugAvailable(null);
            } finally {
                setIsCheckingSlug(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [slug]);

    useSEO({
        title: 'Buat Undangan Baru | Tamuu',
        description: 'Mulai buat undangan digitalmu dalam hitungan detik.',
    });

    const isFormValid = () => {
        const isAllNumbers = /^\d+$/.test(slug.replace(/-/g, ''));
        const isAllHyphens = /^[ -]+$/.test(slug);
        const isValidSlugFormat = slug.length >= 7 && !isAllNumbers && !isAllHyphens;
        
        return isValidSlugFormat && isSlugAvailable === true && invitationName.trim().length >= 3;
    };

    const handleComplete = () => {
        if (!isFormValid()) return;

        const onboardingData = {
            slug,
            invitationName: invitationName.trim(),
            category: 'umum'
        };

        localStorage.setItem('tamuu_onboarding_data', JSON.stringify(onboardingData));
        const params = new URLSearchParams({ 
            onboarding: 'true', 
            slug: slug, 
            name: onboardingData.invitationName 
        });
        if (initialTemplateId) params.append('templateId', initialTemplateId);
        
        localStorage.removeItem(STORAGE_KEY);
        navigate(`/invitations?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-16 pb-10">
            <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 overflow-hidden">
                <AnimatePresence mode="wait">
                    <m.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="max-w-xl w-full text-center space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-900/20 animate-bounce">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">Hampir Selesai!</h1>
                            <p className="text-slate-500 text-base">Hanya butuh beberapa detail untuk memulai.</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 space-y-8 text-left">
                            {/* Invitation Name Input */}
                            <div className="space-y-2">
                                <label className="block">
                                    <div className="flex items-center gap-2 mb-3 ml-2">
                                        <User className="w-4 h-4 text-slate-900" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Judul Undangan</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={invitationName} 
                                        onChange={e => setInvitationName(e.target.value)} 
                                        autoFocus 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                                        placeholder="Contoh: Pernikahan Andi & Sarah" 
                                    />
                                </label>
                            </div>

                            {/* Slug Input */}
                            <div className="space-y-2">
                                <label className="block">
                                    <div className="flex items-center gap-2 mb-3 ml-2">
                                        <Globe className="w-4 h-4 text-slate-900" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Alamat Undangan (Link)</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-[1.2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-900 transition-all">
                                        <div className="px-5 py-4 bg-slate-50 text-slate-400 font-bold select-none text-base border-b sm:border-b-0 sm:border-r border-slate-100 whitespace-nowrap">tamuu.id/</div>
                                        <input 
                                            type="text" 
                                            value={slug} 
                                            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))} 
                                            className="flex-1 px-5 py-4 bg-white outline-none text-lg font-bold text-slate-900 placeholder:text-slate-300 font-mono" 
                                            placeholder="acara-spesialmu" 
                                        />
                                    </div>
                                </label>
                                <div className="flex items-center gap-2 ml-2 mt-2 min-h-[16px]">
                                    {isCheckingSlug ? (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <PremiumLoader variant="inline" size="sm" color="currentColor" showLabel label="Mengecek..." />
                                        </div>
                                    ) : slug.length > 0 && slug.length < 7 ? (
                                        <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Minimal 7 karakter</span>
                                    ) : slug.length >= 7 && /^\d+$/.test(slug.replace(/-/g, '')) ? (
                                        <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Wajib ada huruf ya</span>
                                    ) : slug.length >= 7 && /^[ -]+$/.test(slug) ? (
                                        <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Format link tidak valid</span>
                                    ) : isSlugAvailable === true ? (
                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                            <Check className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Link tersedia!</span>
                                        </div>
                                    ) : isSlugAvailable === false ? (
                                        <div className="flex items-center gap-1.5 text-rose-500">
                                            <X className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Wah, link sudah terpakai</span>
                                        </div>
                                    ) : (
                                        <p className="text-left text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">Minimal 7 karakter (huruf & angka).</p>
                                    )}
                                </div>
                            </div>

                            {/* Integrated Action Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handleComplete}
                                    disabled={!isFormValid()}
                                    className={`group relative w-full h-14 rounded-[1.2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isFormValid() ? 'bg-slate-900 text-white hover:shadow-slate-900/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                >
                                    Selesai & Pilih Desain
                                    <ArrowRight className={`w-4 h-4 transition-transform ${isFormValid() ? 'group-hover:translate-x-1' : ''}`} />
                                    {isFormValid() && (
                                        <m.div 
                                            layoutId="glow" 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 rounded-[1.2rem] bg-slate-900/10 blur-xl -z-10" 
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </m.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default OnboardingPage;
