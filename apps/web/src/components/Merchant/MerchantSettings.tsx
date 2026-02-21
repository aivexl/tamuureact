import React, { useState, useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useMerchantProfile, useUpdateMerchantProfile } from '../../hooks/queries/useShop';
import api from '../../lib/api';

// Icons
const StorefrontIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
);
const ContactIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2v2" /><path d="M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" /><path d="M8 2v2" /><circle cx="12" cy="11" r="3" /><rect x="3" y="4" width="18" height="18" rx="2" /></svg>
);
const CloudUploadIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>
);
const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
const LockIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0" /></svg>
);
const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const CameraIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);
const GlobeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
);
const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
);
const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
);


export const MerchantSettings: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData, isLoading: isFetching } = useMerchantProfile(user?.id);
    const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateMerchantProfile();

    // Form States
    const [namaToko, setNamaToko] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');
    const [alamat, setAlamat] = useState('');

    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
    const [isUploading, setIsUploading] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Initialize state
    useEffect(() => {
        if (merchantData?.merchant) {
            const m = merchantData.merchant;
            setNamaToko(m.nama_toko || '');
            setDeskripsi(m.deskripsi || '');
            setLogoUrl(m.logo_url || '');
            setBannerUrl(m.banner_url || '');
            setWhatsapp(m.whatsapp || '');
            setInstagram(m.instagram || '');
            setEmail(m.email || '');
            setAlamat(m.alamat || '');
            setIsDirty(false);
        }
    }, [merchantData]);

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setter(e.target.value);
        setIsDirty(true);
        setSaveStatus(null);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const res = await api.storage.upload(file, 'gallery');
            if (res && res.url) {
                if (type === 'banner') setBannerUrl(res.url);
                if (type === 'logo') setLogoUrl(res.url);
                setIsDirty(true);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Gagal mengunggah foto. Silakan coba lagi.');
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSave = async () => {
        if (!merchantData?.merchant?.id || !user?.id) return;

        try {
            setSaveStatus(null);
            await updateProfile({
                merchantId: merchantData.merchant.id,
                userId: user.id,
                data: {
                    nama_toko: namaToko,
                    deskripsi: deskripsi,
                    logo_url: logoUrl,
                    banner_url: bannerUrl,
                    whatsapp: whatsapp,
                    instagram: instagram,
                    email: email,
                    alamat: alamat
                }
            });
            setIsDirty(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error: any) {
            console.error('Save failed:', error);
            setSaveStatus('error');
            alert(error.message || 'Gagal menyimpan pengaturan.');
        }
    };

    if (isFetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FFBF00]"></div>
            </div>
        );
    }

    const defaultBanner = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920&h=400';
    const defaultLogo = 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400&h=400';

    return (
        <div className="flex flex-col h-full w-full relative bg-white text-slate-900">
            <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 max-w-6xl mx-auto w-full pb-48 space-y-16">

                {/* Page Header */}
                <header className="space-y-3">
                    <m.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black tracking-tight text-[#0A1128]">
                        Shop <span className="text-[#FFBF00]">Identity</span>
                    </m.h1>
                    <m.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] max-w-xl">
                        Configure your brand perception and digital storefront.
                    </m.p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Left Col: Visuals & Branding */}
                    <div className="xl:col-span-12 space-y-12">
                        <m.section
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-12 relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-[100px]" />

                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-4 text-[#0A1128]">
                                    <StorefrontIcon className="w-6 h-6 text-[#FFBF00]" />
                                    <h2 className="text-xl font-black">Visual <span className="text-[#FFBF00]">Architecture</span></h2>
                                </div>
                                <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#FFBF00] text-[#0A1128] border border-[#FFBF00] shadow-[0_4px_10px_rgba(255,191,0,0.2)]">Live Profile</span>
                            </div>

                            <div className="space-y-10">
                                {/* Hidden Inputs */}
                                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
                                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />

                                {/* Banner Upload */}
                                <div
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="relative w-full aspect-[4/1] bg-slate-50 rounded-[32px] border border-dashed border-slate-200 group hover:border-[#FFBF00]/40 transition-all overflow-hidden cursor-pointer shadow-inner"
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/80 backdrop-blur-md">
                                        <CloudUploadIcon className="w-10 h-10 text-[#FFBF00] mb-3 transform group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black text-[#0A1128] uppercase tracking-widest">Update Cinematic Banner</span>
                                    </div>
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('${bannerUrl || defaultBanner}')` }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />

                                    {isUploading && (
                                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0A1128]/60 backdrop-blur-sm">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FFBF00]"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Multi-Input Row for Branding */}
                                <div className="flex flex-col md:flex-row gap-12 items-start md:items-end">
                                    {/* Logo Upload */}
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="relative -mt-24 md:-mt-32 w-32 h-32 md:w-48 md:h-48 rounded-[48px] bg-white border-[8px] border-white shadow-xl group cursor-pointer overflow-hidden flex items-center justify-center z-20 transition-transform hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 backdrop-blur-md">
                                            <EditIcon className="w-8 h-8 text-[#FFBF00]" />
                                        </div>
                                        <img alt="Store Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={logoUrl || defaultLogo} />
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Brand Designation</label>
                                            <input
                                                type="text"
                                                value={namaToko}
                                                onChange={handleChange(setNamaToko)}
                                                placeholder="The Grand Estate"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] placeholder-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Registry Profile</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-6 text-[#FFBF00]/40 text-[10px] font-black uppercase tracking-widest select-none pt-0.5">Slug</span>
                                                <input
                                                    type="text"
                                                    value={merchantData?.merchant?.slug || ''}
                                                    disabled
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-slate-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Brand Narrative</label>
                                        <span className="text-[10px] font-black text-[#FFBF00]/60 uppercase tracking-widest italic">{deskripsi.length} / 500 chars</span>
                                    </div>
                                    <div className="w-full bg-white border border-slate-200 rounded-3xl focus-within:border-[#FFBF00]/40 focus-within:ring-1 focus-within:ring-[#FFBF00]/40 overflow-hidden transition-all shadow-sm">
                                        <textarea
                                            rows={5}
                                            value={deskripsi}
                                            onChange={handleChange(setDeskripsi)}
                                            className="w-full bg-transparent border-none focus:ring-0 p-8 text-sm font-medium text-slate-600 placeholder-slate-400 resize-none leading-relaxed"
                                            placeholder="Articulate your brand's unique value proposition and heritage..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </m.section>
                    </div>

                    {/* Right Col: Communication Hub */}
                    <div className="xl:col-span-12">
                        <m.section
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-12 shadow-sm relative"
                        >
                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-4 text-[#0A1128]">
                                    <ContactIcon className="w-6 h-6 text-[#FFBF00]" />
                                    <h2 className="text-xl font-black">Link <span className="text-[#FFBF00]">Vault</span></h2>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                                    <LockIcon className="w-3.5 h-3.5 text-[#FFBF00]" />
                                    <span>Encrypted Communication Layer</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Line (WhatsApp)</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFBF00]/40" />
                                        <input
                                            type="text"
                                            value={whatsapp}
                                            onChange={handleChange(setWhatsapp)}
                                            placeholder="+62 812 9988 7766"
                                            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#0A1128] placeholder-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Social Intel (Instagram)</label>
                                    <div className="relative">
                                        <CameraIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFBF00]/40" />
                                        <input
                                            type="text"
                                            value={instagram}
                                            onChange={handleChange(setInstagram)}
                                            placeholder="grandestate.id"
                                            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#0A1128] placeholder-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Official Terminal (Email)</label>
                                    <div className="relative">
                                        <MailIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFBF00]/40" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={handleChange(setEmail)}
                                            placeholder="hq@grandestate.id"
                                            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#0A1128] placeholder-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Geospatial Registry (Address)</label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-6 top-6 w-4 h-4 text-[#FFBF00]/40" />
                                        <textarea
                                            rows={3}
                                            value={alamat}
                                            onChange={handleChange(setAlamat)}
                                            placeholder="Jalan Raya Ubud No. 88, Gianyar, Bali..."
                                            className="w-full bg-white border border-slate-200 rounded-3xl pl-14 pr-8 py-6 text-sm font-bold text-[#0A1128] placeholder-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all resize-none leading-relaxed shadow-sm"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </m.section>
                    </div>
                </div>

            </div>

            {/* STICKY FOOTER HUB */}
            <m.div
                initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.5, type: 'spring', damping: 25 }}
                className="fixed bottom-0 left-0 lg:left-80 right-0 h-24 bg-white/95 backdrop-blur-3xl border-t border-slate-200 px-6 md:px-12 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
            >
                <div className="hidden md:flex items-center gap-4">
                    {saveStatus === 'success' ? (
                        <m.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFBF00]/10 border border-[#FFBF00]/30">
                            <CheckCircleIcon className="w-4 h-4 text-[#FFBF00]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00]">Vault Synchronized</span>
                        </m.div>
                    ) : saveStatus === 'error' ? (
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic">Sync Interrupted</span>
                        </div>
                    ) : isDirty ? (
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FFBF00] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00] italic">Awaiting Authorization</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Static Integrity OK</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => window.location.reload()}
                        disabled={!isDirty || isSaving}
                        className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDirty ? 'bg-slate-50 text-[#0A1128] hover:bg-slate-100 border border-slate-200' : 'bg-[#FBFBFB] text-slate-300 border border-slate-100 cursor-not-allowed'}`}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className={`flex-1 md:flex-none px-12 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3
                            ${isDirty && !isSaving ? 'bg-[#FFBF00] text-[#0A1128] hover:bg-[#FFD700] shadow-[0_4px_20px_rgba(255,191,0,0.2)]' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'}
                        `}
                    >
                        {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#0A1128]"></div> : null}
                        {isSaving ? 'Processing...' : 'Sync Vault'}
                    </button>
                </div>
            </m.div>
        </div>
    );
};
