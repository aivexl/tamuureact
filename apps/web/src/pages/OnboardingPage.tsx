import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import {
    Heart, Baby, Gift, BookOpen, Mic, TreePine, Sun,
    PartyPopper, UtensilsCrossed, GraduationCap, Star,
    ArrowLeft, ArrowRight, Check, Loader2, AlertCircle,
    Sparkles
} from 'lucide-react';

// ============================================
// DATA
// ============================================
const CATEGORIES = [
    { id: 'wedding', name: 'Pernikahan', icon: Heart, color: '#E91E63', bgGradient: 'from-pink-500/20 to-rose-500/20' },
    { id: 'kids', name: 'Anak & Balita', icon: Baby, color: '#4CAF50', bgGradient: 'from-green-500/20 to-emerald-500/20' },
    { id: 'birthday', name: 'Ulang Tahun', icon: Gift, color: '#FF9800', bgGradient: 'from-orange-500/20 to-amber-500/20' },
    { id: 'aqiqah', name: 'Aqiqah', icon: Star, color: '#9C27B0', bgGradient: 'from-purple-500/20 to-violet-500/20' },
    { id: 'tasmiyah', name: 'Tasmiyah', icon: BookOpen, color: '#3F51B5', bgGradient: 'from-indigo-500/20 to-blue-500/20' },
    { id: 'khitan', name: 'Tasyakuran Khitan', icon: Sparkles, color: '#00BCD4', bgGradient: 'from-cyan-500/20 to-teal-500/20' },
    { id: 'umum', name: 'Umum', icon: Star, color: '#607D8B', bgGradient: 'from-slate-500/20 to-gray-500/20' },
    { id: 'seminar', name: 'Seminar', icon: Mic, color: '#2196F3', bgGradient: 'from-blue-500/20 to-sky-500/20' },
    { id: 'christmas', name: 'Natal', icon: TreePine, color: '#F44336', bgGradient: 'from-red-500/20 to-green-500/20' },
    { id: 'newyear', name: 'Tahun Baru', icon: Sparkles, color: '#FFC107', bgGradient: 'from-yellow-500/20 to-amber-500/20' },
    { id: 'syukuran', name: 'Syukuran', icon: Sun, color: '#FF5722', bgGradient: 'from-orange-500/20 to-red-500/20' },
    { id: 'islami', name: 'Islami', icon: Star, color: '#4CAF50', bgGradient: 'from-green-500/20 to-teal-500/20' },
    { id: 'party', name: 'Pesta', icon: PartyPopper, color: '#E91E63', bgGradient: 'from-pink-500/20 to-purple-500/20' },
    { id: 'dinner', name: 'Makan Malam', icon: UtensilsCrossed, color: '#795548', bgGradient: 'from-amber-500/20 to-orange-500/20' },
    { id: 'school', name: 'Sekolah', icon: BookOpen, color: '#3F51B5', bgGradient: 'from-indigo-500/20 to-blue-500/20' },
    { id: 'graduation', name: 'Wisuda', icon: GraduationCap, color: '#673AB7', bgGradient: 'from-purple-500/20 to-indigo-500/20' },
];

// ============================================
// MAIN COMPONENT
// ============================================
export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { search } = React.useMemo(() => window.location, []);
    const queryParams = React.useMemo(() => new URLSearchParams(search), [search]);
    const initialTemplateId = queryParams.get('templateId');

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(queryParams.get('category'));
    const [slug, setSlug] = useState('');
    const [invitationName, setInvitationName] = useState('');
    const [templateId] = useState(initialTemplateId);


    useSEO({
        title: 'Buat Undangan - Tamuu',
        description: 'Mulai buat undangan digital premium Anda sekarang.',
    });

    const handleContinueToTemplates = () => {
        // Navigate to /invitations with the current state as query params
        const params = new URLSearchParams({
            onboarding: 'true',
            category: selectedCategory || '',
            slug: slug,
            name: invitationName || '',
        });

        if (templateId) {
            params.append('templateId', templateId);
        }

        navigate(`/invitations?${params.toString()}`);
    };


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-14">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 py-4 bg-white border-b border-slate-200 sticky top-14 z-20">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= s ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 text-slate-400'}`}>
                            {currentStep > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && <div className={`w-10 h-0.5 mx-1 ${currentStep > s ? 'bg-teal-500' : 'bg-slate-200'}`} />}
                    </div>
                ))}
            </div>

            <main className="flex-1 flex flex-col items-center py-12 px-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Category */}
                    {currentStep === 1 && (
                        <m.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="max-w-5xl w-full text-center space-y-8"
                        >
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Pilih Jenis Undangan</h1>
                                <p className="text-slate-500 text-lg">Mulai dengan memilih kategori yang sesuai dengan acaramu.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-500 text-left overflow-hidden ${selectedCategory === cat.id ? 'border-teal-500 bg-white shadow-2xl scale-[1.02] ring-4 ring-teal-500/10' : 'border-white bg-white hover:border-slate-200 hover:shadow-xl'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${cat.color}15` }}>
                                                <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 leading-tight uppercase tracking-tight text-sm">{cat.name}</h3>
                                        </div>
                                        {selectedCategory === cat.id && (
                                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="pt-8">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!selectedCategory}
                                    className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 mx-auto ${selectedCategory ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Lanjut Langkah 2
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </m.div>
                    )}

                    {/* Step 2: Slug */}
                    {currentStep === 2 && (
                        <m.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl w-full text-center space-y-10"
                        >
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Buat Link Undangan</h1>
                                <p className="text-slate-500 text-lg">Link ini yang akan kamu bagikan ke para tamu.</p>
                            </div>
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-left">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Link Undangan</span>
                                        <div className="flex items-center">
                                            <span className="px-6 py-4 bg-slate-50 border border-r-0 border-slate-200 rounded-l-[1.5rem] text-slate-400 font-bold select-none text-lg">tamuu.id/</span>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                                                className="flex-1 px-6 py-4 border border-slate-200 rounded-r-[1.5rem] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                                                placeholder="contoh: andi-sarah"
                                            />
                                        </div>
                                    </label>
                                    <p className="text-left text-[10px] text-slate-400 font-black uppercase tracking-widest">Gunakan huruf kecil, angka, dan tanda hubung (-).</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-left">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Nama Acara (Opsional)</span>
                                        <input
                                            type="text"
                                            value={invitationName}
                                            onChange={e => setInvitationName(e.target.value)}
                                            className="w-full px-6 py-4 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                                            placeholder={`Pernikahan Andi & Sarah`}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setCurrentStep(1)} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Kembali
                                </button>
                                <button
                                    onClick={handleContinueToTemplates}
                                    disabled={slug.length < 3}
                                    className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${slug.length >= 3 ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Pilih Desain Dasar
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default OnboardingPage;
