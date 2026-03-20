import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, GripVertical, Save, Image, Link as LinkIcon, 
    AlertCircle, Megaphone, Check, X, LayoutTemplate, 
    UploadCloud, Search, Star, Sparkles, ShoppingBag, Store,
    Filter, ArrowRight, ExternalLink, ShieldCheck, Phone, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { admin, shop, storage, safeFetch, API_BASE } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { useAdminProducts, useAdminUpdateProduct, useAdminUpdateVendor, useAdminVendors } from '../../hooks/queries/useShop';

export const AdminShopSettings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<'carousel' | 'ads' | 'placement' | 'config'>('carousel');
    const token = useStore(state => state.token);

    // Config State
    const [globalChatMode, setGlobalChatMode] = useState<'whatsapp' | 'internal'>('whatsapp');
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);
    // Global Registry State
    const [globalSearch, setGlobalSearch] = useState('');
    const { data: productsData, isLoading: isLoadingProducts } = useAdminProducts();
    const { data: vendorsData, isLoading: isLoadingVendorsPlacement } = useAdminVendors();
    
    const updateProductMutation = useAdminUpdateProduct();
    const updateVendorMutation = useAdminUpdateVendor();

    // Carousel State
    const [slides, setSlides] = useState<any[]>([]);
    const [isFetchingCarousel, setIsFetchingCarousel] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const carouselFileInputRef = useRef<HTMLInputElement>(null);
    const [newSlide, setNewSlide] = useState({ image_url: '', link_url: '', is_active: 1, order_index: 0 });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'carousel' | 'ad', onAdUpdate?: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await storage.upload(file, 'gallery');
            if (result.url) {
                if (type === 'carousel') {
                    setNewSlide(prev => ({ ...prev, image_url: result.url }));
                } else if (onAdUpdate) {
                    onAdUpdate(result.url);
                }
                toast.success('Image uploaded successfully');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    // Ads State
    const [ads, setAds] = useState<any[]>([]);
    const [isFetchingAds, setIsFetchingAds] = useState(false);

    useEffect(() => {
        if (currentTab === 'carousel') fetchCarousel();
        if (currentTab === 'ads') fetchAds();
        if (currentTab === 'config') fetchConfig();
    }, [currentTab]);

    const fetchConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const res = await safeFetch(`${API_BASE}/api/admin/system/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.settings?.global_chat_mode) {
                setGlobalChatMode(data.settings.global_chat_mode);
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setIsFetchingConfig(false);
        }
    };

    const updateGlobalConfig = async (key: string, value: string) => {
        try {
            const res = await safeFetch(`${API_BASE}/api/admin/system/settings`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                toast.success('Pengaturan global diperbarui');
                if (key === 'global_chat_mode') setGlobalChatMode(value as any);
            }
        } catch (err) {
            toast.error('Gagal memperbarui pengaturan');
        }
    };

    const fetchCarousel = async () => {
        setIsFetchingCarousel(true);
        try {
            const data = await shop.adminGetCarousel(token || '');
            setSlides(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch carousel', error);
        } finally {
            setIsFetchingCarousel(false);
        }
    };

    const handleSaveCarouselAction = async (item: any, action: 'create' | 'update' | 'delete') => {
        try {
            const res = await safeFetch(`${API_BASE}/api/admin/shop/carousel`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ action, item })
            });
            if (res.ok) {
                toast.success(`Slide berhasil di${action === 'create' ? 'tambahkan' : action === 'update' ? 'perbarui' : 'hapus'}`);
                fetchCarousel();
            } else {
                throw new Error('Failed to save carousel');
            }
        } catch (err) {
            toast.error('Gagal menyimpan slide');
        }
    };

    const fetchAds = async () => {
        setIsFetchingAds(true);
        try {
            const data = await admin.listAds(token || undefined);
            setAds(data);
        } catch (error) {
            toast.error('Failed to fetch ads');
        } finally {
            setIsFetchingAds(false);
        }
    };

    const handleAddAd = () => {
        const newAd = {
            id: `new-${Date.now()}`,
            image_url: '',
            link_url: '',
            title: 'New Sponsor',
            position: 'PRODUCT_DETAIL_SIDEBAR',
            is_active: 1
        };
        setAds([newAd, ...ads]);
    };

    const handleRemoveAd = async (id: string) => {
        if (id.startsWith('new-')) {
            setAds(ads.filter(a => a.id !== id));
            return;
        }

        try {
            await admin.deleteAd(id, token || undefined);
            toast.success('Ad deleted');
            fetchAds();
        } catch (error) {
            toast.error('Failed to delete ad');
        }
    };

    const handleSaveAd = async (ad: any) => {
        try {
            const payload = { ...ad };
            if (payload.id.startsWith('new-')) delete payload.id;
            
            await admin.saveAd(payload, token || undefined);
            toast.success('Ad saved successfully');
            fetchAds();
        } catch (error) {
            toast.error('Failed to save ad');
        }
    };

    // Filter helpers for placement
    const adminProducts = productsData?.products?.filter((p: any) => p.is_admin_listing === 1) || [];
    const specialProducts = adminProducts.filter((p: any) => p.is_special === 1);
    const featuredProducts = adminProducts.filter((p: any) => p.is_featured === 1);
    const landingProducts = adminProducts.filter((p: any) => p.is_landing_featured === 1);
    const landingVendors = (vendorsData as any)?.filter((m: any) => m.is_landing_featured === 1) || [];

    const searchResults = globalSearch.length > 1 
        ? adminProducts.filter((p: any) => 
            p.nama_produk.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.product_id.toLowerCase() === globalSearch.toLowerCase() ||
            p.product_id.toLowerCase().includes(globalSearch.toLowerCase())
        )
        : [];

    const vendorSearchResults = globalSearch.length > 1
        ? (vendorsData as any)?.filter((m: any) => 
            m.nama_toko.toLowerCase().includes(globalSearch.toLowerCase()) ||
            m.id.toLowerCase() === globalSearch.toLowerCase() ||
            m.id.toLowerCase().includes(globalSearch.toLowerCase())
        )
        : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Shop Governance</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Manage the B2B2C Enterprise Directory</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <button 
                    onClick={() => setCurrentTab('carousel')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'carousel' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                >
                    Promo Carousel
                </button>
                <button 
                    onClick={() => setCurrentTab('ads')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'ads' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                >
                    Ads & Banners
                </button>
                <button 
                    onClick={() => setCurrentTab('placement')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'placement' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                >
                    Product Placement
                </button>
                <button 
                    onClick={() => setCurrentTab('config')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'config' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                >
                    Global Config
                </button>
            </div>

            <AnimatePresence mode="wait">
                {currentTab === 'carousel' && (
                    <m.div
                        key="carousel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1A1A1A]">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Image className="w-5 h-5 text-[#FFBF00]" />
                                    Fortune 500 Promo Carousel
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                    Maintain Cinematic Aspect Ratio. High-Resolution Only.
                                </p>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Create Form */}
                                <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-fit">
                                    <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Tambah Slide</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Image URL (Wajib)</label>
                                                <button 
                                                    onClick={() => carouselFileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="text-[9px] font-black text-teal-500 hover:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                >
                                                    {isUploading ? (
                                                        <span className="flex items-center gap-1">
                                                            <div className="w-2 h-2 border border-teal-500 border-t-transparent rounded-full animate-spin" />
                                                            Uploading...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <UploadCloud className="w-3 h-3" />
                                                            Upload
                                                        </span>
                                                    )}
                                                </button>
                                                <input 
                                                    type="file" 
                                                    ref={carouselFileInputRef} 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'carousel')}
                                                />
                                            </div>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mb-2 ml-1">Ideal: 1400x600px | Max: 2MB</p>
                                            <input 
                                                type="text" 
                                                value={newSlide.image_url}
                                                onChange={e => setNewSlide({ ...newSlide, image_url: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Link URL</label>
                                            <input 
                                                type="text" 
                                                value={newSlide.link_url}
                                                onChange={e => setNewSlide({ ...newSlide, link_url: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-xs"
                                                placeholder="/shop/category"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Urutan</label>
                                            <input 
                                                type="number" 
                                                value={newSlide.order_index}
                                                onChange={e => setNewSlide({ ...newSlide, order_index: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                            />
                                        </div>
                                        <button 
                                            disabled={isUploading}
                                            onClick={() => {
                                                if (!newSlide.image_url) return toast.error('Image URL wajib diisi');
                                                handleSaveCarouselAction(newSlide, 'create');
                                                setNewSlide({ image_url: '', link_url: '', is_active: 1, order_index: slides.length + 1 });
                                            }} 
                                            className="w-full py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? 'Menunggu Upload...' : 'Tambah Slide'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* List */}
                                <div className="lg:col-span-2 space-y-4">
                                    {isFetchingCarousel ? (
                                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                            <PremiumLoader className="w-10 h-10 text-[#FFBF00]" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Memuat Carousel</p>
                                        </div>
                                    ) : slides.length === 0 ? (
                                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                                            <LayoutTemplate className="w-12 h-12 text-slate-600 mb-4" />
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Belum ada slide di Shop Carousel</p>
                                        </div>
                                    ) : (
                                        slides.map((slide, idx) => (
                                            <div key={slide.id || idx} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 group">
                                                <div className="w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-black/50 shrink-0 border border-white/10 group-hover:border-[#FFBF00]/30 transition-colors">
                                                    <img src={slide.image_url} alt="Slide" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 w-full space-y-2">
                                                    <div className="flex flex-col gap-1.5 text-xs text-slate-400 font-mono">
                                                        <span><strong className="text-slate-500 uppercase tracking-widest text-[9px] font-black mr-2">Link:</strong> {slide.link_url || '-'}</span>
                                                        <span><strong className="text-slate-500 uppercase tracking-widest text-[9px] font-black mr-2">Urutan:</strong> {slide.order_index}</span>
                                                        <span><strong className="text-slate-500 uppercase tracking-widest text-[9px] font-black mr-2">Status:</strong> 
                                                            <span className={slide.is_active ? 'text-emerald-400' : 'text-rose-400'}>{slide.is_active ? ' Aktif' : ' Nonaktif'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4">
                                                    <button 
                                                        onClick={() => handleSaveCarouselAction({ ...slide, is_active: slide.is_active ? 0 : 1 }, 'update')}
                                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white/5 text-white hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        {slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm('Hapus slide ini secara permanen?')) handleSaveCarouselAction(slide, 'delete');
                                                        }}
                                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex justify-center"
                                                        title="Delete Slide"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}

                {currentTab === 'ads' && (
                    <m.div
                        key="ads"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Megaphone className="w-5 h-5 text-[#FFBF00]" />
                                    Strategic Sponsor Banners
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-[#FFBF00]" />
                                    Control Shop Special Banners and Product Detail Sidebars.
                                </p>
                            </div>
                            <button
                                onClick={handleAddAd}
                                className="px-5 py-2.5 bg-[#FFBF00] text-[#0A1128] text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
                            >
                                <Plus className="w-4 h-4" />
                                Create Banner
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {isFetchingAds ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <PremiumLoader className="w-10 h-10 text-[#FFBF00]" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Syncing Ads Database</p>
                                </div>
                            ) : ads.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                    <Megaphone className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active sponsorship campaigns</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {ads.map((ad) => (
                                        <AdEditorRow 
                                            key={ad.id} 
                                            ad={ad} 
                                            onSave={handleSaveAd} 
                                            onDelete={handleRemoveAd} 
                                            onFileUpload={handleFileChange}
                                            isUploading={isUploading}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </m.div>
                )}

                {currentTab === 'placement' && (
                    <m.div
                        key="placement"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Global Search & Action Center */}
                        <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1 w-full">
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3 mb-2">
                                        <Filter className="w-5 h-5 text-[#FFBF00]" />
                                        Global Catalog Search
                                    </h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        Search and toggle placement for any product or vendor.
                                    </p>
                                </div>
                                <div className="relative w-full md:w-[500px]">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input 
                                        type="text"
                                        placeholder="Cari produk atau nama toko..."
                                        value={globalSearch}
                                        onChange={(e) => setGlobalSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:ring-2 focus:ring-[#FFBF00]/50 transition-all font-bold placeholder:text-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {globalSearch.length > 1 && (
                                    <m.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 border-t border-white/5 pt-6 max-h-[400px] overflow-y-auto no-scrollbar"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Vendor Results */}
                                            {vendorSearchResults.map((m: any) => (
                                                <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-[#FFBF00]/30 transition-all">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-white/10">
                                                        <img src={m.logo_url} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate">{m.nama_toko}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-[8px] font-bold text-[#FFBF00] uppercase tracking-widest">Vendor</p>
                                                            <span className="text-[7px] font-mono text-slate-600 truncate">ID: {m.id}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => updateVendorMutation.mutate({ id: m.id, data: { is_landing_featured: m.is_landing_featured ? 0 : 1 } })}
                                                            className={`p-2 rounded-lg border transition-all ${m.is_landing_featured ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                                            title="Toggle Landing Page"
                                                        >
                                                            <LayoutTemplate className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Product Results */}
                                            {searchResults.map((p: any) => (
                                                <div key={p.product_id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-[#FFBF00]/30 transition-all">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                                                        <img src={p.images?.[0]?.image_url} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate">{p.nama_produk}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{p.nama_toko}</p>
                                                            <span className="text-[7px] font-mono text-slate-600 truncate">ID: {p.product_id}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button 
                                                            onClick={() => updateProductMutation.mutate({ id: p.product_id, data: { is_special: p.is_special ? 0 : 1 } })}
                                                            className={`p-2 rounded-lg border transition-all ${p.is_special ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                                            title="Toggle Special"
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => updateProductMutation.mutate({ id: p.product_id, data: { is_featured: p.is_featured ? 0 : 1 } })}
                                                            className={`p-2 rounded-lg border transition-all ${p.is_featured ? 'bg-amber-500/20 border-amber-500/30 text-[#FFBF00]' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                                            title="Toggle Featured"
                                                        >
                                                            <Star className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => updateProductMutation.mutate({ id: p.product_id, data: { is_landing_featured: p.is_landing_featured ? 0 : 1 } })}
                                                            className={`p-2 rounded-lg border transition-all ${p.is_landing_featured ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                                            title="Toggle Landing"
                                                        >
                                                            <LayoutTemplate className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* SECTIONED PLACEMENT CARDS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* 1. SPESIAL UNTUK KAMU (Shop Page) */}
                            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-[#0A1128] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><Sparkles className="w-5 h-5" /></div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Spesial Untuk Kamu</h3>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Shop Page • Navy Banner Section</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white">{specialProducts.length} Items</span>
                                </div>
                                <div className="p-6 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                                    {specialProducts.length === 0 ? (
                                        <EmptyState icon={<Sparkles className="w-8 h-8 opacity-20" />} text="No special products assigned" />
                                    ) : (
                                        specialProducts.map((p: any) => <PlacementItem key={p.product_id} item={p} onRemove={() => updateProductMutation.mutate({ id: p.product_id, data: { is_special: 0 } })} />)
                                    )}
                                </div>
                            </div>

                            {/* 2. PRODUK FEATURED (Shop Page) */}
                            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-[#1A1A1A] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/10 flex items-center justify-center text-[#FFBF00]"><Star className="w-5 h-5" /></div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Produk Featured</h3>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Shop Page • Editor's Choice Grid</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-[#FFBF00]">{featuredProducts.length} Items</span>
                                </div>
                                <div className="p-6 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                                    {featuredProducts.length === 0 ? (
                                        <EmptyState icon={<Star className="w-8 h-8 opacity-20" />} text="No featured products assigned" />
                                    ) : (
                                        featuredProducts.map((p: any) => <PlacementItem key={p.product_id} item={p} onRemove={() => updateProductMutation.mutate({ id: p.product_id, data: { is_featured: 0 } })} />)
                                    )}
                                </div>
                            </div>

                            {/* 3. LANDING PAGE: TAMUU SHOP */}
                            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-[#1A1A1A] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><LayoutTemplate className="w-5 h-5" /></div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Tamuu Shop (Landing)</h3>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Landing Page • Main Product Scroller</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-emerald-400">{landingProducts.length} Items</span>
                                </div>
                                <div className="p-6 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                                    {landingProducts.length === 0 ? (
                                        <EmptyState icon={<ShoppingBag className="w-8 h-8 opacity-20" />} text="No landing products assigned" />
                                    ) : (
                                        landingProducts.map((p: any) => <PlacementItem key={p.product_id} item={p} onRemove={() => updateProductMutation.mutate({ id: p.product_id, data: { is_landing_featured: 0 } })} />)
                                    )}
                                </div>
                            </div>

                            {/* 4. LANDING PAGE: TAMUU VENDOR */}
                            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
                                <div className="p-6 border-b border-white/5 bg-[#1A1A1A] flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Store className="w-5 h-5" /></div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Tamuu Vendor (Landing)</h3>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Landing Page • Featured Vendors</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-amber-400">{landingVendors.length} Items</span>
                                </div>
                                <div className="p-6 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                                    {landingVendors.length === 0 ? (
                                        <EmptyState icon={<Store className="w-8 h-8 opacity-20" />} text="No landing vendors assigned" />
                                    ) : (
                                        landingVendors.map((m: any) => (
                                            <div key={m.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-white/10">
                                                    <img src={m.logo_url} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[10px] font-black text-white uppercase truncate">{m.nama_toko}</h4>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase">{m.nama_kategori || 'Vendor'}</p>
                                                </div>
                                                <button 
                                                    onClick={() => updateVendorMutation.mutate({ id: m.id, data: { is_landing_featured: 0 } })}
                                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </m.div>
                )}

                {currentTab === 'config' && (
                    <m.div
                        key="config"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                            <div className="max-w-2xl">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-4">
                                    <ShieldCheck className="w-6 h-6 text-[#FFBF00]" />
                                    Global System Configuration
                                </h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-10">
                                    Kontrol pusat untuk seluruh perilaku aplikasi. Perubahan di sini akan berdampak langsung pada seluruh pengguna dan vendor.
                                </p>

                                <div className="space-y-10">
                                    {/* COMMUNICATION GATEWAY */}
                                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-8">
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Megaphone className="w-4 h-4 text-indigo-400" />
                                                Primary Communication Gateway
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                Menentukan jalur kontak utama pada tombol "Hubungi Sekarang" di seluruh Marketplace.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => updateGlobalConfig('global_chat_mode', 'whatsapp')}
                                                className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                                                    globalChatMode === 'whatsapp' 
                                                    ? 'bg-white border-[#FFBF00] text-[#0A1128] shadow-xl shadow-[#FFBF00]/10' 
                                                    : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${globalChatMode === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-white/5'}`}>
                                                    <Phone className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">WhatsApp Direct</p>
                                                    <p className="text-[8px] font-bold opacity-60 uppercase">Eksternal & Cepat</p>
                                                </div>
                                                {globalChatMode === 'whatsapp' && <Check className="w-5 h-5 ml-auto text-[#FFBF00]" />}
                                            </button>

                                            <button
                                                onClick={() => updateGlobalConfig('global_chat_mode', 'internal')}
                                                className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                                                    globalChatMode === 'internal' 
                                                    ? 'bg-white border-[#FFBF00] text-[#0A1128] shadow-xl shadow-[#FFBF00]/10' 
                                                    : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${globalChatMode === 'internal' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-white/5'}`}>
                                                    <MessageSquare className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Internal Chat</p>
                                                    <p className="text-[8px] font-bold opacity-60 uppercase">Eksklusif & Pantau</p>
                                                </div>
                                                {globalChatMode === 'internal' && <Check className="w-5 h-5 ml-auto text-[#FFBF00]" />}
                                            </button>
                                        </div>

                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2 leading-relaxed">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Gunakan mode WhatsApp jika sebagian besar vendor belum aktif di dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PlacementItem: React.FC<{ item: any, onRemove: () => void }> = ({ item, onRemove }) => (
    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-white/10 transition-all">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10">
            <img src={item.images?.[0]?.image_url} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black text-white uppercase truncate">{item.nama_produk}</h4>
            <p className="text-[8px] font-bold text-slate-500 uppercase truncate">{item.nama_toko}</p>
        </div>
        <button 
            onClick={onRemove}
            className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
            title="Remove from this section"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <div className="h-32 flex flex-col items-center justify-center text-center">
        {icon}
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">{text}</p>
    </div>
);

const AdEditorRow: React.FC<{ 
    ad: any, 
    onSave: (ad: any) => void, 
    onDelete: (id: string) => void,
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'carousel' | 'ad', onAdUpdate?: (url: string) => void) => void,
    isUploading: boolean
}> = ({ ad, onSave, onDelete, onFileUpload, isUploading }) => {
    const [localAd, setLocalAd] = useState(ad);
    const [hasChanges, setLocalHasChanges] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: string, value: any) => {
        setLocalAd({ ...localAd, [field]: value });
        setLocalHasChanges(true);
    };

    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col lg:flex-row gap-8 relative group">
            {/* Visual Preview */}
            <div className="w-full lg:w-48 aspect-[4/5] bg-black/50 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-[#FFBF00]/30 transition-all">
                {localAd.image_url ? (
                    <img src={localAd.image_url} alt="Ad Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-4">
                        <Image className="w-8 h-8 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Preview Target Required</span>
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Campaign Identifier (Title)</label>
                        <input
                            type="text"
                            value={localAd.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Creative Asset URL</label>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[9px] font-black text-teal-500 hover:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                {isUploading ? (
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 border border-teal-500 border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <UploadCloud className="w-3 h-3" />
                                        Upload
                                    </span>
                                )}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => onFileUpload(e, 'ad', (url) => updateField('image_url', url))}
                            />
                        </div>
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mb-2 ml-1">
                            {localAd.position === 'PRODUCT_LIST_TOP' ? 'Ideal: 1600x400px (Cinematic)' : 'Ideal: 800x1000px | Max: 2MB'}
                        </p>
                        <input
                            type="text"
                            value={localAd.image_url}
                            onChange={(e) => updateField('image_url', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Click-Through URL (Link)</label>
                        <input
                            type="text"
                            value={localAd.link_url}
                            onChange={(e) => updateField('link_url', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Positioning</label>
                            <select
                                value={localAd.position}
                                onChange={(e) => updateField('position', e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none appearance-none"
                            >
                                <option value="SHOP_SPECIAL_FOR_YOU">Shop Special Banner</option>
                                <option value="PRODUCT_LIST_TOP">All Products Top (Rectangular)</option>
                                <option value="PRODUCT_DETAIL_SIDEBAR">Product Sidebar</option>
                                <option value="SHOP_FOOTER">Shop Footer</option>
                                <option value="FEATURED_PRODUCT_LANDING">Landing Page Products</option>
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                            <button 
                                onClick={() => updateField('is_active', localAd.is_active === 1 ? 0 : 1)}
                                className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${localAd.is_active === 1 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                {localAd.is_active === 1 ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row Actions */}
            <div className="flex lg:flex-col items-center justify-center gap-2 lg:pl-6 lg:border-l lg:border-white/5">
                <button
                    onClick={() => onSave(localAd)}
                    disabled={!hasChanges}
                    className={`p-3 rounded-xl transition-all ${hasChanges ? 'bg-[#FFBF00] text-[#0A1128] shadow-lg' : 'text-slate-600 bg-white/5 opacity-50 cursor-not-allowed'}`}
                    title="Save Changes"
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(localAd.id)}
                    className="p-3 text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                    title="Delete Ad"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
