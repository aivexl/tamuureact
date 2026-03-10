import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Save, Image, Link as LinkIcon, AlertCircle, Megaphone, Check, X, LayoutTemplate, UploadCloud, Search, Star, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { admin, shop, storage, safeFetch, API_BASE } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { useAdminProducts, useAdminUpdateProduct, useAdminUpdateMerchant } from '../../hooks/queries/useShop';

export const AdminShopSettings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<'carousel' | 'ads' | 'placement'>('carousel');
    const token = useStore(state => state.token);

    // Product Placement State
    const [productSearch, setProductSearch] = useState('');
    const [merchantSearch, setMerchantSearch] = useState('');
    const { data: productsData, isLoading: isLoadingProducts } = useAdminProducts();
    const { data: merchantsData, isLoading: isLoadingMerchantsPlacement } = useShopDirectory();
    const updateProductMutation = useAdminUpdateProduct();
    const updateMerchantMutation = useAdminUpdateMerchant();

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
    }, [currentTab]);

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

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
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
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 bg-[#1A1A1A]">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <Star className="w-5 h-5 text-[#FFBF00]" />
                                Storefront Placement Manager
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                Curate products and vendors for the Shop storefront and Landing Page.
                            </p>
                        </div>

                        <div className="p-8 space-y-12">
                            {/* Product Placement */}
                            <section className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h3 className="text-sm font-black text-[#FFBF00] uppercase tracking-widest flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        Product Placement
                                    </h3>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="text"
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                                        />
                                    </div>
                                </div>

                                {isLoadingProducts ? (
                                    <div className="py-10 flex justify-center"><PremiumLoader /></div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {productsData?.products
                                            ?.filter((p: any) => 
                                                p.is_admin_listing === 1 && 
                                                p.nama_produk.toLowerCase().includes(productSearch.toLowerCase())
                                            )
                                            .map((product: any) => (
                                                <div key={product.product_id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                                        <img src={product.images?.[0]?.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-black text-white truncate uppercase tracking-tight">{product.nama_produk}</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{product.kategori_produk || 'General'}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await updateProductMutation.mutateAsync({ 
                                                                        id: product.product_id, 
                                                                        data: { is_special: product.is_special ? 0 : 1 } 
                                                                    });
                                                                    toast.success('Special status updated');
                                                                } catch (err) {
                                                                    toast.error('Failed to update status');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                                                product.is_special 
                                                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' 
                                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                                            }`}
                                                            title="Toggle Special Section"
                                                        >
                                                            <Sparkles className={`w-3 h-3 ${product.is_special ? 'fill-current' : ''}`} />
                                                            Special
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await updateProductMutation.mutateAsync({ 
                                                                        id: product.product_id, 
                                                                        data: { is_featured: product.is_featured ? 0 : 1 } 
                                                                    });
                                                                    toast.success('Featured status updated');
                                                                } catch (err) {
                                                                    toast.error('Failed to update status');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                                                product.is_featured 
                                                                ? 'bg-amber-500/20 border-amber-500/30 text-[#FFBF00]' 
                                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                                            }`}
                                                            title="Toggle Featured Section"
                                                        >
                                                            <Star className={`w-3 h-3 ${product.is_featured ? 'fill-current' : ''}`} />
                                                            Featured
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await updateProductMutation.mutateAsync({ 
                                                                        id: product.product_id, 
                                                                        data: { is_landing_featured: product.is_landing_featured ? 0 : 1 } 
                                                                    });
                                                                    toast.success('Landing status updated');
                                                                } catch (err) {
                                                                    toast.error('Failed to update status');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                                                product.is_landing_featured 
                                                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                                            }`}
                                                            title="Toggle Landing Page (Tamuu Shop)"
                                                        >
                                                            <LayoutTemplate className="w-3 h-3" />
                                                            Landing
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </section>

                            {/* Merchant Placement */}
                            <section className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-white/5 pt-12">
                                    <h3 className="text-sm font-black text-[#FFBF00] uppercase tracking-widest flex items-center gap-2">
                                        <Store className="w-4 h-4" />
                                        Merchant Placement
                                    </h3>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="text"
                                            placeholder="Search vendors..."
                                            value={merchantSearch}
                                            onChange={(e) => setMerchantSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                                        />
                                    </div>
                                </div>

                                {isLoadingMerchantsPlacement ? (
                                    <div className="py-10 flex justify-center"><PremiumLoader /></div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(merchantsData as any)
                                            ?.filter((m: any) => 
                                                m.nama_toko.toLowerCase().includes(merchantSearch.toLowerCase())
                                            )
                                            .map((merchant: any) => (
                                                <div key={merchant.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                                        <img src={merchant.logo_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-black text-white truncate uppercase tracking-tight">{merchant.nama_toko}</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{merchant.nama_kategori || 'Vendor'}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await updateMerchantMutation.mutateAsync({ 
                                                                        id: merchant.id, 
                                                                        data: { is_landing_featured: merchant.is_landing_featured ? 0 : 1 } 
                                                                    });
                                                                    toast.success('Landing status updated');
                                                                } catch (err) {
                                                                    toast.error('Failed to update status');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                                                merchant.is_landing_featured 
                                                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                                            }`}
                                                            title="Toggle Landing Page (Tamuu Vendor)"
                                                        >
                                                            <LayoutTemplate className="w-3 h-3" />
                                                            Landing
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await updateMerchantMutation.mutateAsync({ 
                                                                        id: merchant.id, 
                                                                        data: { is_verified: merchant.is_verified ? 0 : 1 } 
                                                                    });
                                                                    toast.success('Verification status updated');
                                                                } catch (err) {
                                                                    toast.error('Failed to update status');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                                                merchant.is_verified 
                                                                ? 'bg-[#FFBF00]/20 border-[#FFBF00]/30 text-[#FFBF00]' 
                                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                                            }`}
                                                            title="Toggle Verified Status"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Verified
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mb-2 ml-1">Ideal: 800x1000px | Max: 2MB</p>
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
