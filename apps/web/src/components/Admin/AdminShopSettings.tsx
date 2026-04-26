import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Save, Image as ImageIcon, Link as LinkIcon, 
    AlertCircle, Megaphone, Check, X, LayoutTemplate, 
    UploadCloud, Search, Star, Sparkles, ShoppingBag, Store,
    Filter, ArrowRight, ExternalLink, ShieldCheck, Phone, MessageSquare,
    Globe, LayoutGrid, Heart, Utensils, Camera, Palette, Building2, Music, Gift, Tag,
    ArrowUp, ArrowDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { admin, shop, storage, safeFetch, API_BASE, shopCategories, ShopCategory } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { useAdminProducts, useAdminUpdateProduct, useAdminUpdateVendor, useAdminVendors } from '../../hooks/queries/useShop';
import { ShopIcon, RECOMMENDED_SHOP_ICONS } from '@tamuu/ui';
import { ConfirmationModal } from '../Modals/ConfirmationModal';

export const AdminShopSettings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<'carousel' | 'ads' | 'placement' | 'config' | 'categories' | 'popups'>('carousel');
    const token = useStore(state => state.token);

    // Categories State
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [isFetchingCategories, setIsFetchingCategories] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: 'LayoutGrid', is_active: 1 });
    const [showIconPicker, setShowIconPicker] = useState(false);
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = async () => {
        setIsFetchingCategories(true);
        try {
            const data = await shopCategories.adminList(token || undefined);
            setCategories(data);
        } catch (error) {
            toast.error('Gagal mengambil daftar kategori');
        } finally {
            setIsFetchingCategories(false);
        }
    };

    const handleSaveCategory = async (cat: any) => {
        try {
            await shopCategories.adminSave(cat, token || undefined);
            toast.success('Kategori berhasil disimpan');
            fetchCategories();
        } catch (error) {
            toast.error('Gagal menyimpan kategori');
        }
    };

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            await shopCategories.adminDelete(categoryToDelete, token || undefined);
            toast.success('Kategori berhasil dihapus');
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            toast.error('Gagal menghapus kategori');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCategory = (id: string) => {
        setCategoryToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newCategories.length) return;

        // Swap
        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

        // Update positions
        const reorderPayload = newCategories.map((cat, idx) => ({
            id: cat.id,
            position: idx
        }));

        // Optimistic UI update
        setCategories(newCategories.map((cat, idx) => ({ ...cat, position: idx })));

        try {
            await shopCategories.adminReorder(reorderPayload, token || undefined);
            toast.success('Urutan kategori diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui urutan');
            fetchCategories(); // Rollback
        }
    };

    // Config State
    const [globalChatMode, setGlobalChatMode] = useState<'whatsapp' | 'internal'>('whatsapp');
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);
    
    // Global Registry State
    const [globalSearch, setGlobalSearch] = useState('');
    const { data: productsData } = useAdminProducts();
    const { data: vendorsData } = useAdminVendors();
    
    const updateProductMutation = useAdminUpdateProduct();
    const updateVendorMutation = useAdminUpdateVendor();

    // Carousel State
    const [slides, setSlides] = useState<any[]>([]);
    const [isFetchingCarousel, setIsFetchingCarousel] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const carouselFileInputRef = useRef<HTMLInputElement>(null);
    const [newSlide, setNewSlide] = useState({ image_url: '', link_url: '', alt_text: '', is_active: 1, order_index: 0 });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'carousel' | 'ad' | 'popup', onAdUpdate?: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await storage.upload(file, 'gallery');
            if (result.url) {
                if (type === 'carousel') {
                    setNewSlide(prev => ({ ...prev, image_url: result.url }));
                } else if (type === 'popup') {
                    setNewPopup(prev => ({ ...prev, image_url: result.url }));
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

    // Promo Popups State
    const [popups, setPopups] = useState<any[]>([]);
    const [isFetchingPopups, setIsFetchingPopups] = useState(false);
    const popupFileInputRef = useRef<HTMLInputElement>(null);
    const [newPopup, setNewPopup] = useState({ image_url: '', link_url: '', placements: 'all', is_active: 1, order_index: 0 });
    const [isAddingPopup, setIsAddingPopup] = useState(false);
    const [editingPopupId, setEditingPopupId] = useState<string | null>(null);

    const fetchPopups = async () => {
        if (!token) return;
        setIsFetchingPopups(true);
        try {
            const data = await shop.adminGetPopups(token);
            setPopups(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch popups', error);
        } finally {
            setIsFetchingPopups(false);
        }
    };

    const handleSavePopupAction = async (item: any, action: 'create' | 'update' | 'delete') => {
        try {
            if (action === 'delete') {
                const res = await shop.adminDeletePopup(token || '', item.id);
                if (res.success) {
                    toast.success('Popup berhasil dihapus');
                    fetchPopups();
                }
            } else {
                const res = await shop.adminSavePopup(token || '', { action, item });
                if (res.success) {
                    toast.success(`Popup berhasil di${action === 'create' ? 'tambahkan' : 'perbarui'}`);
                    fetchPopups();
                    setIsAddingPopup(false);
                    setEditingPopupId(null);
                    setNewPopup({ image_url: '', link_url: '', placements: 'all', is_active: 1, order_index: 0 });
                }
            }
        } catch (error) {
            toast.error('Gagal memproses popup');
        }
    };

    const handleMovePopup = async (index: number, direction: 'up' | 'down') => {
        const newPopups = [...popups];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newPopups.length) return;

        // Swap
        [newPopups[index], newPopups[targetIndex]] = [newPopups[targetIndex], newPopups[index]];

        // Update order indices
        const reorderPayload = newPopups.map((p, idx) => ({
            id: p.id,
            order_index: idx
        }));

        // Optimistic UI update
        setPopups(newPopups.map((p, idx) => ({ ...p, order_index: idx })));

        try {
            await shop.adminReorderPopups(token || '', reorderPayload);
            toast.success('Urutan popup diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui urutan');
            fetchPopups(); // Rollback
        }
    };

    // Ads State
    const [ads, setAds] = useState<any[]>([]);
    const [isFetchingAds, setIsFetchingAds] = useState(false);

    useEffect(() => {
        if (currentTab === 'carousel') fetchCarousel();
        if (currentTab === 'ads') fetchAds();
        if (currentTab === 'config') fetchConfig();
        if (currentTab === 'categories') fetchCategories();
        if (currentTab === 'popups') fetchPopups();
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
            alt_text: '',
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
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                {[
                    { id: 'carousel', label: 'Promo Carousel' },
                    { id: 'popups', label: 'Promo Popups' },
                    { id: 'ads', label: 'Ads & Banners' },
                    { id: 'categories', label: 'Kategori Produk' },
                    { id: 'placement', label: 'Product Placement' },
                    { id: 'config', label: 'Global Config' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === tab.id ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
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
                                    <ImageIcon className="w-5 h-5 text-[#FFBF00]" />
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
                                            <input 
                                                type="text" 
                                                value={newSlide.image_url}
                                                onChange={e => setNewSlide({ ...newSlide, image_url: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Alt Text (SEO)
                                            </label>
                                            <input 
                                                type="text" 
                                                value={newSlide.alt_text}
                                                onChange={e => setNewSlide({ ...newSlide, alt_text: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                placeholder="Contoh: Vendor Catering Pernikahan Jakarta"
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
                                                setNewSlide({ image_url: '', link_url: '', alt_text: '', is_active: 1, order_index: slides.length + 1 });
                                            }} 
                                            className="w-full py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? 'Menunggu Upload...' : 'Tambah Slide'}
                                        </button>
                                    </div>
                                </div>
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
                                            <CarouselRow 
                                                key={slide.id || idx} 
                                                slide={slide} 
                                                onDelete={() => handleSaveCarouselAction(slide, 'delete')}
                                                onUpdate={(updated) => handleSaveCarouselAction(updated, 'update')}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}

                {currentTab === 'popups' && (
                    <m.div
                        key="popups"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1A1A1A]">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-[#FFBF00]" />
                                    Global Promo Popups
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                    Popups appear on top of all elements. Recommended size: 1000x1000px (1:1).
                                </p>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-fit sticky top-8">
                                    <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest">
                                        {editingPopupId ? 'Edit Popup' : 'Tambah Popup'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Banner Image (Wajib)</label>
                                                <button 
                                                    onClick={() => popupFileInputRef.current?.click()}
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
                                                    ref={popupFileInputRef} 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'popup')}
                                                />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={newPopup.image_url}
                                                onChange={e => setNewPopup({ ...newPopup, image_url: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                placeholder="https://..."
                                            />
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 italic">Rasio 1:1 atau Potrait disarankan untuk mobile.</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Target Link (Click Action)</label>
                                            <input 
                                                type="text" 
                                                value={newPopup.link_url}
                                                onChange={e => setNewPopup({ ...newPopup, link_url: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-xs"
                                                placeholder="https://tamuu.id atau /shop/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Penempatan (Placements)</label>
                                            <select 
                                                value={newPopup.placements}
                                                onChange={e => setNewPopup({ ...newPopup, placements: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs appearance-none"
                                            >
                                                <option value="all">Seluruh Halaman Utama</option>
                                                <option value="homepage">Beranda Utama (Homepage)</option>
                                                <option value="shop">Direktori Belanja (Shop)</option>
                                                <option value="dashboard">Dashboard Pengguna</option>
                                                <option value="admin">Panel Admin</option>
                                            </select>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 italic">Pilih area di mana popup ini akan ditampilkan. Halaman undangan user otomatis dikecualikan.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="hidden">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Urutan</label>
                                                <input 
                                                    type="number" 
                                                    value={newPopup.order_index}
                                                    onChange={e => setNewPopup({ ...newPopup, order_index: parseInt(e.target.value) || 0 })}
                                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                                                <select 
                                                    value={newPopup.is_active}
                                                    onChange={e => setNewPopup({ ...newPopup, is_active: parseInt(e.target.value) })}
                                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                >
                                                    <option value={1}>Aktif</option>
                                                    <option value={0}>Nonaktif</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {editingPopupId && (
                                                <button 
                                                    onClick={() => {
                                                        setEditingPopupId(null);
                                                        setNewPopup({ image_url: '', link_url: '', placements: 'all', is_active: 1, order_index: popups.length });
                                                    }}
                                                    className="flex-1 py-3.5 bg-white/5 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px]"
                                                >
                                                    Batal
                                                </button>
                                            )}
                                            <button 
                                                disabled={isUploading}
                                                onClick={() => {
                                                    if (!newPopup.image_url) return toast.error('Image URL wajib diisi');
                                                    handleSavePopupAction(
                                                        editingPopupId ? { ...newPopup, id: editingPopupId } : newPopup, 
                                                        editingPopupId ? 'update' : 'create'
                                                    );
                                                }} 
                                                className="flex-[2] py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isUploading ? 'Uploading...' : editingPopupId ? 'Simpan Perubahan' : 'Tambah Popup'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    {isFetchingPopups ? (
                                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                            <PremiumLoader className="w-10 h-10 text-[#FFBF00]" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Memuat Popups</p>
                                        </div>
                                    ) : popups.length === 0 ? (
                                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                                            <Sparkles className="w-12 h-12 text-slate-600 mb-4" />
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Belum ada Promo Popup</p>
                                        </div>
                                    ) : (
                                        popups.map((popup, idx) => (
                                            <div key={popup.id || idx} className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 flex gap-6 group hover:bg-white/[0.04] transition-all">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black border border-white/10 shrink-0">
                                                    <img src={popup.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${popup.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-500'}`}>
                                                            {popup.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-600">#{popup.order_index}</span>
                                                    </div>
                                                    <p className="text-xs text-white font-bold truncate italic mb-1">{popup.link_url || 'No Link'}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {popup.placements.split(',').map((p: string) => (
                                                            <span key={p} className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] text-slate-500 font-black uppercase">{p.trim()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 justify-center">
                                                    <div className="flex flex-col gap-1">
                                                        <button 
                                                            onClick={() => handleMovePopup(idx, 'up')}
                                                            disabled={idx === 0}
                                                            className={`p-1 rounded bg-white/5 hover:bg-white/10 transition-colors ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                                                            title="Pindahkan ke atas"
                                                        >
                                                            <ArrowUp className="w-3 h-3" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMovePopup(idx, 'down')}
                                                            disabled={idx === popups.length - 1}
                                                            className={`p-1 rounded bg-white/5 hover:bg-white/10 transition-colors ${idx === popups.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                                                            title="Pindahkan ke bawah"
                                                        >
                                                            <ArrowDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingPopupId(popup.id);
                                                            setNewPopup({
                                                                image_url: popup.image_url,
                                                                link_url: popup.link_url || '',
                                                                placements: popup.placements,
                                                                is_active: popup.is_active,
                                                                order_index: popup.order_index
                                                            });
                                                        }}
                                                        className="p-2.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSavePopupAction(popup, 'delete')}
                                                        className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
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
                                    <ImageIcon className="w-5 h-5 text-[#FFBF00]" />
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
                                            <input 
                                                type="text" 
                                                value={newSlide.image_url}
                                                onChange={e => setNewSlide({ ...newSlide, image_url: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Alt Text (SEO)
                                            </label>
                                            <input 
                                                type="text" 
                                                value={newSlide.alt_text}
                                                onChange={e => setNewSlide({ ...newSlide, alt_text: e.target.value })}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs"
                                                placeholder="Contoh: Vendor Catering Pernikahan Jakarta"
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
                                                setNewSlide({ image_url: '', link_url: '', alt_text: '', is_active: 1, order_index: slides.length + 1 });
                                            }} 
                                            className="w-full py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? 'Menunggu Upload...' : 'Tambah Slide'}
                                        </button>
                                    </div>
                                </div>
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
                                            <CarouselRow 
                                                key={slide.id || idx} 
                                                slide={slide} 
                                                onSave={(item) => handleSaveCarouselAction(item, 'update')}
                                                onDelete={(item) => handleSaveCarouselAction(item, 'delete')}
                                            />
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

                {currentTab === 'categories' && (
                    <m.div
                        key="categories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-[#FFBF00]" />
                                    Official Shop Categories
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    Manage categories available for vendors and the discovery platform.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Kategori</label>
                                        <input 
                                            type="text" 
                                            value={newCategory.name}
                                            onChange={e => {
                                                const name = e.target.value;
                                                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                                setNewCategory({ ...newCategory, name, slug });
                                            }}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold"
                                            placeholder="Contoh: Catering"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Slug (URL)</label>
                                        <input 
                                            type="text" 
                                            value={newCategory.slug}
                                            readOnly
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-500 text-xs font-mono uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Icon Visual</label>
                                        <button 
                                            onClick={() => setShowIconPicker(!showIconPicker)}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold flex items-center gap-3 hover:border-[#FFBF00]/30 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#FFBF00]">
                                                <ShopIcon name={newCategory.icon} />
                                            </div>
                                            <span className="flex-1 text-left uppercase tracking-tighter">{newCategory.icon}</span>
                                            <ArrowRight className={`w-3 h-3 text-slate-600 transition-transform ${showIconPicker ? 'rotate-90' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {showIconPicker && (
                                                <m.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute bottom-full left-0 mb-4 w-[280px] bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-4 z-[100] overflow-hidden"
                                                >
                                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Select Category Icon</span>
                                                        <button onClick={() => setShowIconPicker(false)} className="text-slate-600 hover:text-white"><X className="w-4 h-4" /></button>
                                                    </div>
                                                    <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                                                        {RECOMMENDED_SHOP_ICONS.map((icon) => (
                                                            <button
                                                                key={icon.name}
                                                                onClick={() => {
                                                                    setNewCategory({ ...newCategory, icon: icon.name });
                                                                    setShowIconPicker(false);
                                                                }}
                                                                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${newCategory.icon === icon.name ? 'bg-[#FFBF00] text-[#0A1128]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                                                title={icon.label}
                                                            >
                                                                <ShopIcon name={icon.name} size={18} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (!newCategory.name) return toast.error('Nama kategori wajib diisi');
                                            handleSaveCategory(newCategory);
                                            setNewCategory({ name: '', slug: '', icon: 'LayoutGrid', is_active: 1 });
                                        }}
                                        className="py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-colors"
                                    >
                                        Tambah Kategori
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Icon</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {categories.map((cat, idx) => (
                                            <tr key={cat.id} className="group hover:bg-white/[0.01] transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FFBF00] border border-white/5">
                                                        <ShopIcon name={cat.icon} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-black text-white uppercase tracking-tight italic">{cat.name}</p>
                                                    <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">{cat.slug}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button 
                                                        onClick={() => handleSaveCategory({ ...cat, is_active: cat.is_active ? 0 : 1 })}
                                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                            cat.is_active 
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                            : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                                                        }`}
                                                    >
                                                        {cat.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="flex flex-col gap-1">
                                                            <button 
                                                                onClick={() => handleMoveCategory(idx, 'up')}
                                                                disabled={idx === 0}
                                                                className={`p-1 rounded bg-white/5 hover:bg-white/10 transition-colors ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                                                                title="Pindahkan ke atas"
                                                            >
                                                                <ArrowUp className="w-3 h-3" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleMoveCategory(idx, 'down')}
                                                                disabled={idx === categories.length - 1}
                                                                className={`p-1 rounded bg-white/5 hover:bg-white/10 transition-colors ${idx === categories.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                                                                title="Pindahkan ke bawah"
                                                            >
                                                                <ArrowDown className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="p-2.5 text-slate-600 hover:text-rose-500 transition-colors"
                                                            title="Hapus Kategori"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <ConfirmationModal 
                                isOpen={isDeleteDialogOpen}
                                onClose={() => {
                                    if (!isDeleting) {
                                        setIsDeleteDialogOpen(false);
                                        setCategoryToDelete(null);
                                    }
                                }}
                                onConfirm={confirmDeleteCategory}
                                title="Hapus Kategori?"
                                message="Apakah Anda yakin ingin menghapus kategori ini secara permanen? Vendor yang terhubung mungkin perlu memperbarui kategori mereka."
                                confirmText="Ya, Hapus"
                                cancelText="Batal"
                                type="danger"
                                isLoading={isDeleting}
                            />
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
                            <AnimatePresence>
                                {globalSearch.length > 1 && (
                                    <m.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 border-t border-white/5 pt-6 max-h-[400px] overflow-y-auto no-scrollbar"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

const CarouselRow: React.FC<{ slide: any, onSave: (slide: any) => void, onDelete: (slide: any) => void }> = ({ slide, onSave, onDelete }) => {
    const [localSlide, setLocalSlide] = useState(slide);
    const [hasChanges, setHasChanges] = useState(false);

    const updateField = (field: string, value: any) => {
        setLocalSlide({ ...localSlide, [field]: value });
        setHasChanges(true);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 group">
            <div className="w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-black/50 shrink-0 border border-white/10 group-hover:border-[#FFBF00]/30 transition-colors">
                <img src={localSlide.image_url} alt="Slide" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 w-full space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 block">Alt Text (SEO)</label>
                        <input 
                            type="text" 
                            value={localSlide.alt_text || ''}
                            onChange={e => updateField('alt_text', e.target.value)}
                            className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-white text-[10px]"
                            placeholder="Alt text..."
                        />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 block">Link URL</label>
                        <input 
                            type="text" 
                            value={localSlide.link_url || ''}
                            onChange={e => updateField('link_url', e.target.value)}
                            className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-slate-400 text-[10px]"
                            placeholder="Link..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-widest text-[8px] font-black text-slate-600">Order:</span>
                        <input 
                            type="number" 
                            value={localSlide.order_index}
                            onChange={e => updateField('order_index', parseInt(e.target.value) || 0)}
                            className="w-12 bg-transparent border-b border-white/10 text-white text-center"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-widest text-[8px] font-black text-slate-600">Status:</span>
                        <button 
                            onClick={() => updateField('is_active', localSlide.is_active ? 0 : 1)}
                            className={localSlide.is_active ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}
                        >
                            {localSlide.is_active ? 'AKTIF' : 'NONAKTIF'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4">
                <button 
                    onClick={() => {
                        onSave(localSlide);
                        setHasChanges(false);
                    }}
                    disabled={!hasChanges}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${hasChanges ? 'bg-[#FFBF00] text-[#0A1128]' : 'bg-white/5 text-slate-600 opacity-50 cursor-not-allowed'}`}
                >
                    Simpan
                </button>
                <button 
                    onClick={() => onDelete(localSlide)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex justify-center"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
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
            <div className="w-full lg:w-48 aspect-[4/5] bg-black/50 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-[#FFBF00]/30 transition-all">
                {localAd.image_url ? (
                    <img src={localAd.image_url} alt="Ad Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-4">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Preview Target Required</span>
                    </div>
                )}
            </div>
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
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                            <Globe className="w-3 h-3" /> Alt Text (SEO)
                        </label>
                        <input
                            type="text"
                            value={localAd.alt_text || ''}
                            onChange={(e) => updateField('alt_text', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                            placeholder="Deskripsi gambar untuk Google..."
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
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none appearance-none"
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
