import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import {
    Heart, Baby, Gift, BookOpen, Mic, TreePine, Sun,
    PartyPopper, UtensilsCrossed, GraduationCap, Star,
    ArrowLeft, ArrowRight, Check, Sparkles, Camera,
    Calendar, MapPin, CreditCard, Landmark, User
} from 'lucide-react';

// ============================================
// DATA & TYPES
// ============================================
const CATEGORIES = [
    { id: 'wedding', name: 'Pernikahan', icon: Heart, color: '#E91E63', bgGradient: 'from-pink-500/20 to-rose-500/20', questionName: 'Siapa nama kedua mempelai yang berbahagia?' },
    { id: 'birthday', name: 'Ulang Tahun', icon: Gift, color: '#FF9800', bgGradient: 'from-orange-500/20 to-amber-500/20', questionName: 'Siapa yang sedang merayakan hari lahirnya?' },
    { id: 'aqiqah', name: 'Aqiqah', icon: Baby, color: '#9C27B0', bgGradient: 'from-purple-500/20 to-violet-500/20', questionName: 'Siapa nama malaikat kecil kesayangan ayah & ibu?' },
    { id: 'khitan', name: 'Tasyakuran Khitan', icon: Sparkles, color: '#00BCD4', bgGradient: 'from-cyan-500/20 to-teal-500/20', questionName: 'Boleh tau nama jagoan kecil yang akan dikhitan?' },
    { id: 'syukuran', name: 'Syukuran', icon: Sun, color: '#FF5722', bgGradient: 'from-orange-500/20 to-red-500/20', questionName: 'Apa nama acara atau syukuran yang akan diadakan?' },
    { id: 'umum', name: 'Umum / Lainnya', icon: Star, color: '#607D8B', bgGradient: 'from-slate-500/20 to-gray-500/20', questionName: 'Boleh tau nama acara spesial yang akan dibuat?' },
];

const STEPS = [
    { id: 'category', title: 'Moment', icon: Star },
    { id: 'names', title: 'Identity', icon: User },
    { id: 'photo', title: 'Memory', icon: Camera },
    { id: 'gallery', title: 'Gallery', icon: BookOpen },
    { id: 'logistics', title: 'Logistics', icon: Calendar },
    { id: 'gift', title: 'Gift', icon: CreditCard },
    { id: 'slug', title: 'Link', icon: Check },
];

// ============================================
// MAIN COMPONENT
// ============================================
export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const groomInputRef = useRef<HTMLInputElement>(null);
    const brideInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const { search } = useMemo(() => window.location, []);
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);
    const initialTemplateId = queryParams.get('templateId');

    // --- State Management ---
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(queryParams.get('category'));

    // Names
    const [groomName, setGroomName] = useState('');
    const [brideName, setBrideName] = useState('');
    const [celebrantName, setCelebrantName] = useState(''); // for birthday, aqiqah, etc

    // Photo
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [groomPhoto, setGroomPhoto] = useState<string | null>(null);
    const [bridePhoto, setBridePhoto] = useState<string | null>(null);
    const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

    // Logistics
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');

    // Gift/Bank
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    // Final Link
    const [slug, setSlug] = useState('');
    const [invitationName, setInvitationName] = useState('');
    const [templateId] = useState(initialTemplateId);

    useSEO({
        title: 'Magic Form Onboarding - Tamuu',
        description: 'Cara paling manusiawi untuk membuat undangan digital.',
    });

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return !!selectedCategory;
            case 2:
                if (selectedCategory === 'wedding') return !!groomName && !!brideName;
                return !!celebrantName;
            case 3: return true; // Photo is optional
            case 4: return true; // Gallery is optional
            case 5: return !!eventDate;
            case 6: return true; // Gift is optional
            case 7: return slug.length >= 3;
            default: return false;
        }
    };

    const nextStep = () => {
        if (isStepValid()) {
            if (currentStep === 7) {
                handleComplete();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'groom' | 'bride') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'main') setPhotoPreview(result);
                else if (type === 'groom') setGroomPhoto(result);
                else if (type === 'bride') setBridePhoto(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalPhotos = galleryPhotos.length + files.length;

        if (totalPhotos > 6) {
            alert('Maksimal 6 foto ya kak 🙏');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryPhotos(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeGalleryPhoto = (index: number) => {
        setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleComplete = () => {
        const onboardingData = {
            category: selectedCategory,
            groomName,
            brideName,
            celebrantName,
            photoPreview,
            groomPhoto,
            bridePhoto,
            galleryPhotos,
            eventDate,
            eventLocation,
            bankName,
            accountNumber,
            accountHolder,
            slug,
            invitationName: invitationName || celebrantName || (groomName && brideName ? `${groomName} & ${brideName}` : '')
        };

        // Save to localStorage for the next page to consume
        localStorage.setItem('tamuu_onboarding_data', JSON.stringify(onboardingData));

        const params = new URLSearchParams({
            onboarding: 'true',
            category: selectedCategory || '',
            slug: slug,
            name: onboardingData.invitationName,
        });

        if (templateId) params.append('templateId', templateId);
        navigate(`/invitations?${params.toString()}`);
    };

    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-14 pb-10">
            {/* Progress Header */}
            <div className="bg-white border-b border-slate-200 sticky top-14 z-20 px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
                    {STEPS.map((s, i) => {
                        const stepNum = i + 1;
                        const isActive = currentStep === stepNum;
                        const isDone = currentStep > stepNum;
                        return (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-teal-500 text-white scale-110 shadow-lg shadow-teal-500/20' : isDone ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-300'}`}>
                                        {isDone ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>{s.title}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mt-[-14px] transition-colors duration-500 ${isDone ? 'bg-teal-500/20' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* STEP 1: CATEGORY */}
                    {currentStep === 1 && (
                        <m.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-2xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-teal-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/20 animate-bounce">
                                    <Sparkles className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">Halo! 😊 Senang sekali bisa membantu menyiapkan hari spesialmu.</h1>
                                <p className="text-slate-500 text-lg">Kira-kira, acara apa nih yang akan kita rayakan hari ini?</p>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 text-left overflow-hidden ${selectedCategory === cat.id ? 'border-teal-500 bg-white shadow-2xl scale-[1.05] ring-8 ring-teal-500/5' : 'border-white bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="relative z-10 flex flex-col items-center text-center gap-3">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 bg-slate-50 ${selectedCategory === cat.id ? 'bg-teal-50' : ''}`}>
                                                <cat.icon className={`w-7 h-7 ${selectedCategory === cat.id ? 'text-teal-600' : 'text-slate-400'}`} />
                                            </div>
                                            <h3 className={`font-black uppercase tracking-tighter text-sm ${selectedCategory === cat.id ? 'text-teal-600' : 'text-slate-900'}`}>{cat.name}</h3>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </m.div>
                    )}

                    {/* STEP 2: NAMES */}
                    {currentStep === 2 && (
                        <m.div key="step2" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <User className="w-8 h-8 text-teal-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight px-4">{catInfo?.questionName}</h1>
                                <p className="text-slate-500">Tuliskan nama lengkap atau nama panggilan Anda.</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-50 space-y-6">
                                {selectedCategory === 'wedding' ? (
                                    <>
                                        <div className="text-left space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mempelai Pria</label>
                                            <input type="text" value={groomName} onChange={e => setGroomName(e.target.value)} autoFocus className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900 placeholder:text-slate-300" placeholder="Contoh: Andi Wijaya" />
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-600 font-black italic">&</div>
                                        <div className="text-left space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mempelai Wanita</label>
                                            <input type="text" value={brideName} onChange={e => setBrideName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900 placeholder:text-slate-300" placeholder="Contoh: Sarah Fatimah" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-left space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Lengkap</label>
                                        <input type="text" value={celebrantName} onChange={e => setCelebrantName(e.target.value)} autoFocus className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-teal-500/10 text-xl font-bold text-slate-900 placeholder:text-slate-300" placeholder="Contoh: Muhammad Akhtar" />
                                    </div>
                                )}
                            </div>
                        </m.div>
                    )}

                    {/* STEP 3: PHOTO (MEMORY) */}
                    {currentStep === 3 && (
                        <m.div key="step3" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <Camera className="w-8 h-8 text-rose-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">Biar lebih berkesan, yuk pasang foto terbaikmu! 📸</h1>
                                <p className="text-slate-500">Foto ini akan ditampilkan di halaman utama undanganmu.</p>
                            </div>

                            {selectedCategory === 'wedding' ? (
                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                    {/* Groom Photo */}
                                    <div
                                        onClick={() => groomInputRef.current?.click()}
                                        className="group relative aspect-[3/4] bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-2 transition-all hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer overflow-hidden shadow-xl"
                                    >
                                        <input type="file" ref={groomInputRef} onChange={(e) => handlePhotoChange(e, 'groom')} accept="image/*" className="hidden" />
                                        {groomPhoto ? (
                                            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                                                <img src={groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <User className="w-8 h-8" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Pria</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bride Photo */}
                                    <div
                                        onClick={() => brideInputRef.current?.click()}
                                        className="group relative aspect-[3/4] bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-2 transition-all hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer overflow-hidden shadow-xl"
                                    >
                                        <input type="file" ref={brideInputRef} onChange={(e) => handlePhotoChange(e, 'bride')} accept="image/*" className="hidden" />
                                        {bridePhoto ? (
                                            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                                                <img src={bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <User className="w-8 h-8" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Wanita</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative aspect-[4/5] max-w-sm mx-auto bg-white rounded-[3rem] border-4 border-dashed border-slate-200 p-4 transition-all hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer overflow-hidden shadow-2xl"
                                >
                                    <input type="file" ref={fileInputRef} onChange={(e) => handlePhotoChange(e, 'main')} accept="image/*" className="hidden" />
                                    {photoPreview ? (
                                        <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-black uppercase tracking-widest text-xs">Ganti Foto</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Camera className="w-10 h-10" />
                                            </div>
                                            <p className="font-bold uppercase tracking-widest text-xs">Klik untuk upload</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button onClick={nextStep} className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px] underline underline-offset-8">Lewati dulu, saya belum punya foto bagus</button>
                        </m.div>
                    )}

                    {/* STEP 4: GALLERY (GRID) */}
                    {currentStep === 4 && (
                        <m.div key="step4" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <BookOpen className="w-8 h-8 text-teal-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">Bagiin lebih banyak momen seru! ✨</h1>
                                <p className="text-slate-500 text-sm">Upload foto-fotomu untuk galeri (maksimal 6 foto).</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-50">
                                <div className="grid grid-cols-3 gap-3">
                                    {galleryPhotos.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                                            <img src={photo} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeGalleryPhoto(index); }}
                                                className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Star className="w-3 h-3 fill-current rotate-45" />
                                            </button>
                                        </div>
                                    ))}
                                    {galleryPhotos.length < 6 && (
                                        <button
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-teal-500 hover:bg-teal-50/30 transition-all"
                                        >
                                            <Camera className="w-6 h-6" />
                                            <span className="text-[8px] font-black uppercase">Tambah</span>
                                            <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} accept="image/*" multiple className="hidden" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button onClick={nextStep} className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px] underline underline-offset-8">Lewati, saya isi nanti saja</button>
                        </m.div>
                    )}

                    {/* STEP 5: LOGISTICS */}
                    {currentStep === 5 && (
                        <m.div key="step5" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <Calendar className="w-8 h-8 text-blue-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">Di mana dan kapan kebahagiaan ini akan dibagikan? 🗓️</h1>
                                <p className="text-slate-500">Kita siapkan detail waktu dan lokasinya ya.</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50 space-y-6">
                                <div className="text-left space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Tanggal Acara</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900" />
                                    </div>
                                </div>
                                <div className="text-left space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Gedung / Lokasi</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900 placeholder:text-slate-300" placeholder="Contoh: Hotel Ritz Carlton" />
                                    </div>
                                </div>
                            </div>
                        </m.div>
                    )}

                    {/* STEP 6: GIFT / REKENING */}
                    {currentStep === 6 && (
                        <m.div key="step6" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <CreditCard className="w-8 h-8 text-amber-500" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight px-4">Agar kado cinta dari kerabat bisa tersampaikan dengan mudah... 🎁</h1>
                                <p className="text-slate-500">Kakak mau cantumkan nomor rekening untuk kado digital?</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50 space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Pilih Bank</label>
                                    <div className="relative">
                                        <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900 placeholder:text-slate-300" placeholder="Contoh: BCA / Mandiri / BNI" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nomor Rekening</label>
                                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900 placeholder:text-slate-300" placeholder="00012345678" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Atas Nama</label>
                                    <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 text-lg font-bold text-slate-900 placeholder:text-slate-300" placeholder="Contoh: Andi Wijaya" />
                                </div>
                            </div>

                            <button onClick={nextStep} className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px] underline underline-offset-8">Lewati dulu, akan saya isi nanti di editor</button>
                        </m.div>
                    )}

                    {/* STEP 7: SLUG / LINK */}
                    {currentStep === 7 && (
                        <m.div key="step7" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="max-w-xl w-full text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                                    <Landmark className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight">Terakhir, buat link unik untuk undanganmu! ✨</h1>
                                <p className="text-slate-500">Tentukan alamat website untuk dibagikan ke para tamu.</p>
                            </div>

                            <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl border border-slate-50 space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-left">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block ml-4">Link Undangan</span>
                                        <div className="flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-[1.5rem] border border-slate-200 focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all">
                                            <div className="px-6 py-4 sm:py-5 bg-slate-50 text-slate-400 font-bold select-none text-base sm:text-lg border-b sm:border-b-0 sm:border-r border-slate-200 whitespace-nowrap">
                                                tamuu.id/
                                            </div>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                                                className="flex-1 px-6 py-4 sm:py-5 bg-white outline-none text-base sm:text-lg font-bold text-slate-900 placeholder:text-slate-200 font-mono"
                                                placeholder="andi-sarah"
                                            />
                                        </div>
                                    </label>
                                    <p className="text-left text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 mt-2">Gunakan huruf kecil, angka, dan tanda hubung (-).</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-left">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block ml-4">Judul Undangan</span>
                                        <input
                                            type="text"
                                            value={invitationName}
                                            onChange={e => setInvitationName(e.target.value)}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                                            placeholder={`Pernikahan ${groomName || 'Andi'} & ${brideName || 'Sarah'}`}
                                        />
                                    </label>
                                </div>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Sticky Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 z-30 pointer-events-none">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
                    {currentStep > 1 ? (
                        <button onClick={prevStep} className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-xl active:scale-90">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    ) : <div className="w-16" />}

                    <button
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className={`group relative flex-1 h-16 rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isStepValid() ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {currentStep === 6 ? 'Selesai & Pilih Desain' : 'Lanjut Sekarang'}
                        <ArrowRight className={`w-5 h-5 transition-transform ${isStepValid() ? 'group-hover:translate-x-1' : ''}`} />
                        {isStepValid() && (
                            <m.div layoutId="glow" className="absolute inset-0 rounded-[2.5rem] bg-teal-400/20 blur-xl -z-10" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
