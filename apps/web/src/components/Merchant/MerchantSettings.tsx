import React, { useState, useEffect, useRef, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useMerchantProfile, useUpdateMerchantProfile } from '../../hooks/queries/useShop';
import api from '../../lib/api';
import { INDONESIA_REGIONS } from '../../constants/regions';
import { MapPin, Search, ChevronDown, Check, X, Camera, Globe, Mail, Phone, Instagram, Facebook, Link as LinkIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';

// Icons
const StorefrontIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

export const MerchantSettings: React.FC = () => {
    const { user } = useStore();
    const { data: merchantData, isLoading: isLoadingProfile } = useMerchantProfile(user?.id);
    const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateMerchantProfile();

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [namaToko, setNamaToko] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [kota, setKota] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [alamat, setAlamat] = useState('');

    const [isDirty, setIsDirty] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [citySearch, setCitySearch] = useState('');

    // CTO Guard: Use ref to ensure hydration only happens ONCE per mount
    const hasHydrated = useRef(false);

    useEffect(() => {
        if (merchantData?.merchant && !hasHydrated.current) {
            const m = merchantData.merchant;
            const c = merchantData.contacts || {};
            setNamaToko(m.nama_toko || '');
            setDeskripsi(m.deskripsi || '');
            setKota(m.kota || '');
            setLogoUrl(m.logo_url || '');
            setBannerUrl(m.banner_url || '');
            setWhatsapp(c.whatsapp || '');
            setInstagram(c.instagram || '');
            setFacebook(c.facebook || '');
            setTiktok(c.tiktok || '');
            setWebsite(c.website || '');
            setEmail(c.email || '');
            setAlamat(c.alamat || '');
            
            hasHydrated.current = true;
            setIsDirty(false);
        }
    }, [merchantData]);

    const filteredCities = useMemo(() => {
        const query = citySearch.toLowerCase().trim();
        if (!query) return INDONESIA_REGIONS;
        return INDONESIA_REGIONS.filter(city => city.toLowerCase().includes(query));
    }, [citySearch]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const res = await api.storage.upload(file, 'gallery');
            if (res?.url) {
                if (type === 'banner') setBannerUrl(res.url);
                else setLogoUrl(res.url);
                setIsDirty(true);
            }
        } catch (error) {
            toast.error('Upload gagal');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!merchantData?.merchant?.id || !user?.id) return;
        const loadingToast = toast.loading('Menyimpan perubahan...');
        try {
            await updateProfile({
                merchantId: merchantData.merchant.id,
                userId: user.id,
                data: {
                    nama_toko: namaToko,
                    deskripsi: deskripsi,
                    kota: kota,
                    logo_url: logoUrl,
                    banner_url: bannerUrl,
                    whatsapp: whatsapp,
                    instagram: instagram,
                    facebook: facebook,
                    tiktok: tiktok,
                    website: website,
                    email: email,
                    alamat: alamat
                }
            });
            setIsDirty(false);
            toast.success('Pengaturan disimpan!', { id: loadingToast });
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan', { id: loadingToast });
        }
    };

    if (isLoadingProfile && !hasHydrated.current) return <div className="py-20 flex justify-center"><PremiumLoader color="#0A1128" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-40">
            <header className="space-y-4 px-2">
                <m.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight italic uppercase">
                    Profile <span className="text-[#FFBF00]">Store</span>
                </m.h1>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Manajemen Identitas Toko Anda</p>
            </header>

            <div className="grid grid-cols-1 gap-12">
                <m.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm relative"
                >
                    <div className="space-y-12">
                        {/* Banner & Logo */}
                        <div className="relative">
                            <div 
                                onClick={() => bannerInputRef.current?.click()}
                                className="w-full aspect-[21/7] rounded-[32px] overflow-hidden bg-slate-50 border border-dashed border-slate-200 cursor-pointer group"
                            >
                                <img src={bannerUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div 
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute -bottom-12 left-12 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden cursor-pointer group"
                            >
                                <img src={logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${namaToko}`} className="w-full h-full object-cover" alt="Logo" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />

                        {/* Form Fields */}
                        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Brand</label>
                                <input value={namaToko} onChange={e => { setNamaToko(e.target.value); setIsDirty(true); }} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all" />
                            </div>

                            <div className="space-y-3 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kota / Kabupaten</label>
                                <div 
                                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                                    className="flex items-center justify-between w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] cursor-pointer hover:bg-slate-100 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                        <span className="uppercase">{kota || 'Pilih Lokasi...'}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                                </div>

                                <AnimatePresence>
                                    {isLocationOpen && (
                                        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[100] flex flex-col max-h-[300px] overflow-hidden">
                                            <div className="p-4 border-b border-slate-50">
                                                <input value={citySearch} onChange={e => setCitySearch(e.target.value)} placeholder="Cari kota..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold" />
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-2 no-scrollbar bg-white">
                                                {filteredCities.map(reg => (
                                                    <button key={reg} onClick={() => { setKota(reg); setIsDirty(true); setIsLocationOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group ${kota === reg ? 'bg-[#FFBF00]/10' : 'hover:bg-slate-50'}`}>
                                                        <span className="text-xs font-bold text-slate-600 group-hover:text-[#0A1128] uppercase">{reg}</span>
                                                        {kota === reg && <Check className="w-4 h-4 text-[#FFBF00]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tautan Toko</label>
                                <div className="flex items-center bg-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 cursor-not-allowed">
                                    <Globe className="w-4 h-4 mr-3" /> tamuu.id/shop/{merchantData?.merchant?.slug}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Toko</label>
                            <textarea value={deskripsi} onChange={e => { setDeskripsi(e.target.value); setIsDirty(true); }} className="w-full bg-slate-50 border-none rounded-[2rem] p-8 text-sm font-medium text-slate-600 min-h-[150px] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all" placeholder="Gambarkan layanan terbaik brand Anda..." />
                        </div>

                        {/* Contacts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                <div className="relative"><Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input value={whatsapp} onChange={e => { setWhatsapp(e.target.value); setIsDirty(true); }} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" /></div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram</label>
                                <div className="relative"><Instagram className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input value={instagram} onChange={e => { setInstagram(e.target.value); setIsDirty(true); }} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" /></div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Publik</label>
                                <div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input value={email} onChange={e => { setEmail(e.target.value); setIsDirty(true); }} className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" /></div>
                            </div>
                        </div>
                    </div>
                </m.section>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[90] p-6 pointer-events-none">
                <div className="max-w-xl mx-auto flex items-center justify-center pointer-events-auto">
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className={`w-full h-16 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-2xl ${
                            isDirty && !isSaving ? 'bg-[#0A1128] text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? <PremiumLoader variant="inline" size="sm" color="#fff" /> : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
};
