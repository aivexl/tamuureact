import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

// ============================================
// ICONS
// ============================================
const HeartIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);
const BabyIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" /><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 5.1 6.3" /><path d="M12 2v2M8 3l1 1M16 3l-1 1" />
    </svg>
);
const GiftIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="14" x="3" y="10" rx="2" /><path d="M12 10V3M12 22v-4" /><path d="M7 3h10" /><path d="M3 14h18" />
    </svg>
);
const SparklesIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const Loader2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

// ============================================
// DATA
// ============================================
const CATEGORIES = [
    { id: 'wedding', name: 'Pernikahan', icon: HeartIcon, color: '#E91E63', bgGradient: 'from-pink-500/20 to-rose-500/20' },
    { id: 'birthday', name: 'Ulang Tahun', icon: GiftIcon, color: '#FF9800', bgGradient: 'from-orange-500/20 to-amber-500/20' },
    { id: 'baby', name: 'Aqiqah & Kelahiran', icon: BabyIcon, color: '#4CAF50', bgGradient: 'from-green-500/20 to-emerald-500/20' },
    { id: 'others', name: 'Acara Lainnya', icon: SparklesIcon, color: '#2196F3', bgGradient: 'from-blue-500/20 to-indigo-500/20' },
];

const TEMPLATES = [
    { id: 'temp-1', name: 'Rustic Gold', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop' },
    { id: 'temp-2', name: 'Modern Floral', thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=600&fit=crop' },
    { id: 'temp-3', name: 'Elegant Dark', thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop' },
];

// ============================================
// MAIN COMPONENT
// ============================================
export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [slug, setSlug] = useState('');
    const [invitationName, setInvitationName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useSEO({
        title: 'Buat Undangan - Tamuu',
        description: 'Mulai buat undangan digital premium Anda sekarang.',
    });

    const categoriesList = CATEGORIES;
    const selectedCategoryData = categoriesList.find(c => c.id === selectedCategory);

    const handleCreate = async () => {
        setIsCreating(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/editor/new-invitation');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / Nav */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">T</div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">Tamuu</span>
                </Link>
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= s ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                {currentStep > s ? <CheckIcon className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && <div className={`w-10 h-0.5 mx-1 ${currentStep > s ? 'bg-teal-500' : 'bg-slate-200'}`} />}
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600">Batal</button>
            </header>

            <main className="flex-1 flex flex-col items-center py-12 px-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Category */}
                    {currentStep === 1 && (
                        <m.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl w-full text-center space-y-8"
                        >
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pilih Jenis Undangan</h1>
                                <p className="text-slate-500 text-lg">Sesuaikan dengan tema acaramu hari ini.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {categoriesList.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden ${selectedCategory === cat.id ? 'border-teal-500 bg-white shadow-2xl scale-[1.02]' : 'border-white bg-white hover:border-slate-200 hover:shadow-xl'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${cat.color}15` }}>
                                                <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{cat.name}</h3>
                                        </div>
                                        {selectedCategory === cat.id && (
                                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-lg">
                                                <CheckIcon className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="pt-8">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!selectedCategory}
                                    className={`px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 mx-auto ${selectedCategory ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Lanjut
                                    <ArrowRightIcon className="w-5 h-5" />
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
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Buat Link Undangan</h1>
                                <p className="text-slate-500 text-lg">Link ini yang akan kamu bagikan ke para tamu.</p>
                            </div>
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-left">
                                        <span className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 block">Link Undangan</span>
                                        <div className="flex items-center">
                                            <span className="px-5 py-4 bg-slate-50 border border-r-0 border-slate-200 rounded-l-2xl text-slate-400 font-bold select-none">tamuu.id/</span>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                                                className="flex-1 px-5 py-4 border border-slate-200 rounded-r-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                                                placeholder="contoh: andi-sarah"
                                            />
                                        </div>
                                    </label>
                                    <p className="text-left text-sm text-slate-400 font-medium italic">Gunakan huruf kecil, angka, dan tanda hubung (-).</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-left">
                                        <span className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 block">Nama Acara (Opsional)</span>
                                        <input
                                            type="text"
                                            value={invitationName}
                                            onChange={e => setInvitationName(e.target.value)}
                                            className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                                            placeholder={`Pernikahan Andi & Sarah`}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setCurrentStep(1)} className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 transition-all">Kembali</button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    disabled={slug.length < 3}
                                    className={`px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${slug.length >= 3 ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Lanjut
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </m.div>
                    )}

                    {/* Step 3: Template */}
                    {currentStep === 3 && (
                        <m.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl w-full text-center space-y-8"
                        >
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pilih Desain Dasar</h1>
                                <p className="text-slate-500 text-lg">Pilih template yang paling sesuai dengan selera kamu.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {TEMPLATES.map(temp => (
                                    <button
                                        key={temp.id}
                                        onClick={() => setSelectedTemplate(temp.id)}
                                        className={`group relative rounded-[2rem] overflow-hidden border-4 transition-all duration-300 text-left ${selectedTemplate === temp.id ? 'border-teal-500 shadow-2xl scale-[1.02]' : 'border-white shadow-lg hover:border-slate-200 hover:shadow-2xl'}`}
                                    >
                                        <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                                            <img src={temp.thumbnail} alt={temp.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            {selectedTemplate === temp.id && (
                                                <div className="absolute inset-0 bg-teal-500/10 backdrop-blur-[2px]" />
                                            )}
                                        </div>
                                        <div className="p-6 bg-white flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{temp.name}</h3>
                                                <p className="text-sm text-slate-400 font-medium">Klik untuk memilih</p>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedTemplate === temp.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                                <CheckIcon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="pt-8 flex items-center justify-center gap-4">
                                <button onClick={() => setCurrentStep(2)} className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 transition-all">Kembali</button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!selectedTemplate || isCreating}
                                    className={`px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${selectedTemplate && !isCreating ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2Icon className="w-5 h-5 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Mulai Berkarya
                                            <SparklesIcon className="w-5 h-5" />
                                        </>
                                    )}
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
