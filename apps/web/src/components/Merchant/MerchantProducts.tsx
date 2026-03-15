import React, { useState, useRef, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { INDONESIA_REGIONS } from '../../constants/regions';
import { useStore } from '../../store/useStore';
import {
    useMerchantProfile,
    useMerchantProducts,
    useCreateMerchantProduct,
    useUpdateMerchantProduct,
    useDeleteMerchantProduct
} from '../../hooks/queries/useShop';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Search, MapPin, ChevronDown, Check, X, Store, ShoppingBag, Youtube, Globe, ShieldCheck, MessageCircle, MessageSquare, Phone, Instagram, Facebook, Image as ImageIcon, ArrowUpRight, Eye } from 'lucide-react';

// Custom Icons for Tiktok
const TiktokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);
const XLogoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

// Icons
const PlusCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const FilterIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);


export const MerchantProducts: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData } = useMerchantProfile(user?.id);
    const merchantId = merchantData?.merchant?.id;

    const { data: products = [], isLoading } = useMerchantProducts(merchantId);

    // Mutations
    const { mutateAsync: createProduct, isPending: isCreating } = useCreateMerchantProduct();
    const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateMerchantProduct();
    const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteMerchantProduct();

    // Component State
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [saveType, setSaveType] = useState<'DRAFT' | 'PUBLISHED' | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [namaProduk, setNamaProduk] = useState('');
    const [hargaEstimasi, setHargaEstimasi] = useState('');
    const [hargaError, setHargaError] = useState('');
    const [status, setStatus] = useState('DRAFT');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [kota, setKota] = useState('Kota Jakarta Selatan');
    
    // Social & Marketplace State
    const [whatsapp, setWhatsapp] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [xUrl, setXUrl] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [tokopediaUrl, setTokopediaUrl] = useState('');
    const [tiktokshopUrl, setTiktokshopUrl] = useState('');
    const [shopeeUrl, setShopeeUrl] = useState('');
    const [alamatLengkap, setAlamatLengkap] = useState('');
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');
    const [kontakUtama, setKontakUtama] = useState<'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'tiktok' | 'tokopedia' | 'shopee' | 'tiktokshop' | 'chat' | 'x' | 'youtube' | 'website'>('whatsapp');

    const [isSyncingStore, setIsSyncingStore] = useState(false);

    // Searchable Kota State
    const [isKotaOpen, setIsKotaOpen] = useState(false);
    const [kotaSearchQuery, setKotaSearchQuery] = useState('');

    const SHOP_CATEGORIES = [
        'Makeup Artist',
        'Wedding Organizer',
        'Dekorasi',
        'Fotografi',
        'Catering',
        'Venue',
        'Entertainment',
        'Lainnya'
    ];
    const [images, setImages] = useState<string[]>([]);

    // Reactive Sync Logic: When toggle is ON, pull from merchantData
    React.useEffect(() => {
        if (isSyncingStore && merchantData?.merchant) {
            const m = merchantData.merchant;
            const c = merchantData.contacts || {};
            setWhatsapp(c.whatsapp || '');
            setPhone(c.phone || '');
            setInstagram(c.instagram || '');
            setFacebook(c.facebook || '');
            setTiktokUrl(c.tiktok || '');
            setYoutubeUrl(c.youtube || '');
            setXUrl(c.x_url || '');
            setWebsiteUrl(c.website || '');
            setTokopediaUrl(c.tokopedia_url || '');
            setTiktokshopUrl(c.tiktokshop_url || '');
            setShopeeUrl(c.shopee_url || '');
            setAlamatLengkap(c.alamat || '');
            setGoogleMapsUrl(c.google_maps_url || '');
            setKota(c.kota || m.kota || 'Kota Jakarta Selatan');
            setKontakUtama((m.kontak_utama as any) || 'whatsapp');
        }
    }, [isSyncingStore, merchantData]);

    const [isProductUploading, setIsProductUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setEditingId(null);
        setNamaProduk('');
        setHargaEstimasi('');
        setStatus('DRAFT');
        setSelectedCategory('');
        setCustomCategory('');
        setDeskripsi('');
        setImages([]);
        setKota('Kota Jakarta Selatan');
        setKotaSearchQuery('');
        setWhatsapp('');
        setPhone('');
        setInstagram('');
        setFacebook('');
        setTiktokUrl('');
        setYoutubeUrl('');
        setXUrl('');
        setWebsiteUrl('');
        setTokopediaUrl('');
        setShopeeUrl('');
        setAlamatLengkap('');
        setGoogleMapsUrl('');
        setKontakUtama('whatsapp');
        setIsSyncingStore(false);
    };

    const handleAddNew = () => {
        resetForm();
        setView('add');
    };

    const handleEdit = (prod: any) => {
        resetForm();
        setEditingId(prod.id);
        setNamaProduk(prod.nama_produk || '');
        setHargaEstimasi(prod.harga_estimasi || '');
        setStatus(prod.status || 'DRAFT');
        const kat = prod.kategori_produk || '';
        if (kat === '' || SHOP_CATEGORIES.includes(kat)) {
            setSelectedCategory(kat);
            setCustomCategory('');
        } else {
            setSelectedCategory('Lainnya');
            setCustomCategory(kat);
        }
        setDeskripsi(prod.deskripsi || '');
        setImages(prod.images ? prod.images.map((i: any) => i.image_url) : []);
        setKota(prod.kota || 'Kota Jakarta Selatan');
        setWhatsapp(prod.whatsapp || '');
        setPhone(prod.phone || '');
        setInstagram(prod.instagram || '');
        setFacebook(prod.facebook || '');
        setTiktokUrl(prod.tiktok_url || '');
        setYoutubeUrl(prod.youtube_url || '');
        setXUrl(prod.x_url || '');
        setWebsiteUrl(prod.website_url || '');
        setTokopediaUrl(prod.tokopedia_url || '');
        setTiktokshopUrl(prod.tiktokshop_url || '');
        setShopeeUrl(prod.shopee_url || '');
        setAlamatLengkap(prod.alamat_lengkap || '');
        setGoogleMapsUrl(prod.google_maps_url || '');
        setKontakUtama(prod.kontak_utama || 'whatsapp');
        setView('edit');
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Archive this product forever?')) return;
        try {
            await deleteProduct(id.toString());
        } catch (e) {
            alert('Failed to delete asset');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsProductUploading(true);
            const res = await api.storage.upload(file, 'gallery');
            if (res && res.url) {
                setImages(prev => [...prev, res.url]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Gagal mengunggah foto.');
        } finally {
            setIsProductUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async (forceStatus?: string) => {
        if (!merchantId) {
            alert('Identitas toko tidak ditemukan. Mohon refresh halaman.');
            return;
        }
        
        const finalStatus = (forceStatus || status) as 'DRAFT' | 'PUBLISHED';
        const finalKategori = selectedCategory === 'Lainnya' ? customCategory : selectedCategory;

        const isDuplicate = products.some((p: any) => 
            p.nama_produk.toLowerCase().trim() === namaProduk.toLowerCase().trim() && 
            p.id !== editingId
        );

        if (isDuplicate) {
            alert(`Gagal! Anda sudah memiliki produk dengan nama "${namaProduk}". Silakan gunakan nama lain agar link (slug) produk unik.`);
            return;
        }

        if (finalStatus === 'PUBLISHED') {
            const missingFields = [];
            if (!namaProduk.trim()) missingFields.push('Nama Produk/Jasa');
            if (!hargaEstimasi) missingFields.push('Harga (Rp)');
            if (!finalKategori) missingFields.push('Kategori');
            if (!kota) missingFields.push('Kota/Kabupaten');
            if (images.length < 2) missingFields.push('Minimal 2 Foto');

            if (missingFields.length > 0) {
                alert(`Gagal publikasi! Wajib diisi: ${missingFields.join(', ')}`);
                return;
            }
        }

        setSaveType(finalStatus);

        const payload = {
            merchant_id: merchantId,
            nama_produk: namaProduk,
            deskripsi: deskripsi,
            harga_estimasi: hargaEstimasi,
            kategori_produk: finalKategori,
            status: finalStatus,
            images: images,
            kota: kota,
            whatsapp: whatsapp,
            phone: phone,
            instagram: instagram,
            facebook: facebook,
            tiktok_url: tiktokUrl,
            youtube_url: youtubeUrl,
            x_url: xUrl,
            website_url: websiteUrl,
            tokopedia_url: tokopediaUrl,
            tiktokshop_url: tiktokshopUrl,
            shopee_url: shopeeUrl,
            alamat_lengkap: alamatLengkap,
            google_maps_url: googleMapsUrl,
            kontak_utama: kontakUtama
        };


        try {
            if (view === 'add') {
                await createProduct(payload);
            } else if (view === 'edit' && editingId) {
                await updateProduct({ id: editingId, data: payload });
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setView('list');
            resetForm();
        } catch (error: any) {
            console.error('Save failed:', error);
            alert(error.message || 'Gagal menyimpan produk.');
        } finally {
            setSaveType(null);
        }
    };

    const isBusy = isCreating || isUpdating;

    const filteredProducts = products.filter((p: any) => {
        const productNo = `tamuu-shop-${p.id?.substring(0, 8).toUpperCase()}`;
        const searchLower = searchQuery.toLowerCase();
        return p.nama_produk.toLowerCase().includes(searchLower) ||
               productNo.toLowerCase().includes(searchLower);
    });

    const filteredRegions = useMemo(() => {
        const query = kotaSearchQuery.toLowerCase().trim();
        if (!query) return INDONESIA_REGIONS;
        return INDONESIA_REGIONS.filter(reg => reg.toLowerCase().includes(query));
    }, [kotaSearchQuery]);

    return (
        <div className="flex flex-col h-full w-full relative bg-white text-slate-900">

            <header className="px-6 md:px-10 py-10 border-b border-slate-100 bg-[#FBFBFB] flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-30 backdrop-blur-3xl bg-opacity-90">
                <div className="flex flex-col">
                    <m.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-black text-[#0A1128] tracking-tight">
                        Produk/<span className="text-[#FFBF00]">Jasa</span>
                    </m.h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Daftar Produk/Jasa Toko Anda</p>
                </div>

                {view === 'list' ? (
                    <m.button
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-3 bg-[#FFBF00] hover:bg-[#FFD700] text-[#0A1128] px-8 py-3.5 rounded-2xl transition-all shadow-2xl active:scale-95 group font-black uppercase text-[10px] tracking-widest whitespace-nowrap"
                    >
                        <PlusCircleIcon className="w-5 h-5 shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                        New Produk/Jasa
                    </m.button>
                ) : (
                    <m.button
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        onClick={() => { setView('list'); resetForm(); }}
                        className="flex items-center justify-center gap-3 bg-[#0A1128] border border-white/10 text-white px-8 py-3.5 rounded-2xl transition-all shadow-2xl active:scale-95 group font-black uppercase text-[10px] tracking-widest whitespace-nowrap"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-[#FFBF00]" />
                        Produk List
                    </m.button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto w-full relative">
                <div className="p-6 md:p-10 pb-48 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'list' && (
                            <m.section
                                key="list"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-white p-2 rounded-[2.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-50">
                                    <div className="flex items-center gap-6 pl-6">
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-black text-[#0A1128] tracking-tight uppercase">
                                                List Produk/Jasa
                                            </h3>
                                        </div>
                                        {isLoading && <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-[#FFBF00]"></div>}
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto pr-2">
                                        <div className="relative flex-1 sm:w-96">
                                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search registry..."
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border-none rounded-[1.8rem] text-xs font-bold text-[#0A1128] placeholder:text-slate-300 focus:ring-0 transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        <button className="p-4 bg-slate-50/50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-[#0A1128] transition-all flex-shrink-0 active:scale-95">
                                            <FilterIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[40px] bg-[#FBFBFB]">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">No assets registered.</p>
                                        </div>
                                    ) : filteredProducts.map((prod: any, i: number) => (
                                        <m.div
                                            key={prod.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-all relative"
                                        >
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                    style={prod.images?.length > 0 ? { backgroundImage: `url('${prod.images[0].image_url}')` } : { backgroundColor: '#FBFBFB' }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

                                                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                                    {prod.status === 'PUBLISHED' ? (
                                                        <span className="px-3 py-1 rounded-full bg-[#FFBF00] text-[#0A1128] text-[9px] font-black uppercase tracking-widest border border-[#FFBF00] shadow-[0_4px_10px_rgba(255,191,0,0.3)]">
                                                            Live
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 backdrop-blur-md">
                                                            Draft
                                                        </span>
                                                    )}

                                                    {prod.status === 'PUBLISHED' && (
                                                        <>
                                                            {prod.is_approved === 1 ? (
                                                                <span className="px-3 py-1 rounded-full bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                                                    <Check className="w-2.5 h-2.5" /> Approved
                                                                </span>
                                                            ) : prod.is_approved === 2 ? (
                                                                <div className="group/reason relative">
                                                                    <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 cursor-help">
                                                                        <X className="w-2.5 h-2.5" /> Rejected
                                                                    </span>
                                                                    {prod.rejection_reason && (
                                                                        <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 group-hover/reason:opacity-100 transition-opacity z-10 pointer-events-none border border-white/10">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason:</p>
                                                                            <p className="text-[10px] leading-relaxed italic">"{prod.rejection_reason}"</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Pending
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-8 space-y-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-lg font-black tracking-tight text-[#0A1128] group-hover:text-[#FFBF00] transition-colors line-clamp-1 italic">{prod.nama_produk}</h4>
                                                    
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <button 
                                                            onClick={() => handleEdit(prod)} 
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-[#FFBF00] text-slate-400 hover:text-[#0A1128] rounded-xl border border-slate-100 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
                                                        >
                                                            <EditIcon className="w-3 h-3" />
                                                            Edit
                                                        </button>
                                                        <a 
                                                            href={`/shop/${merchantData?.merchant?.slug || 'umum'}/${prod.slug || prod.id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-[#0A1128] text-slate-400 hover:text-white rounded-xl border border-slate-100 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
                                                        >
                                                            View
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </a>
                                                        <button 
                                                            onClick={() => handleDelete(prod.id)} 
                                                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl border border-slate-100 transition-all shadow-sm"
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-4 pt-2 border-t border-slate-50">
                                                    <div>
                                                        <p className="text-[9px] font-black text-[#FFBF00] uppercase tracking-widest mb-1 opacity-60">Harga</p>
                                                        <p className="text-xl font-black text-[#0A1128]">
                                                            {prod.harga_estimasi && !isNaN(Number(prod.harga_estimasi)) 
                                                                ? formatCurrency(prod.harga_estimasi) 
                                                                : (prod.harga_estimasi || '-')}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-slate-100">
                                                                No. Produk: tamuu-shop-{prod.id.substring(0, 8).toUpperCase()}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFBF00]/5 text-[#FFBF00] text-[8px] font-black uppercase tracking-widest border border-[#FFBF00]/10">
                                                                {prod.kontak_utama === 'whatsapp' && <MessageCircle size={8} />}
                                                                {prod.kontak_utama === 'chat' && <MessageSquare size={8} />}
                                                                {prod.kontak_utama === 'phone' && <Phone size={8} />}
                                                                {prod.kontak_utama === 'instagram' && <Instagram size={8} />}
                                                                {prod.kontak_utama === 'facebook' && <Facebook size={8} />}
                                                                {prod.kontak_utama === 'tiktok' && <TiktokIcon className="w-2 h-2" />}
                                                                {prod.kontak_utama === 'x' && <XLogoIcon className="w-2 h-2" />}
                                                                {prod.kontak_utama === 'youtube' && <Youtube size={8} />}
                                                                {prod.kontak_utama === 'website' && <Globe size={8} />}
                                                                {prod.kontak_utama === 'tokopedia' && <img src="/images/logos/marketplace/logo_tokopedia.png" className="w-2.5 h-2.5 object-contain" alt="" />}
                                                                {prod.kontak_utama === 'shopee' && <img src="/images/logos/marketplace/logo_shopee.png" className="w-2.5 h-2.5 object-contain" alt="" />}
                                                                {prod.kontak_utama === 'tiktokshop' && <img src="/images/logos/marketplace/logo-tiktokshop.png" className="w-2.5 h-2.5 object-contain" alt="" />}
                                                                <span>{prod.kontak_utama || 'WhatsApp'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60 line-clamp-1 flex-1">{prod.kategori_produk || 'Umum'}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">{prod.kota || 'Nasional'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>
                            </m.section>
                        )}

                        {(view === 'add' || view === 'edit') && (
                            <m.section
                                key="form"
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="max-w-5xl mx-auto"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-10">
                                        <div className="relative z-10 bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm relative overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-black text-[#0A1128]">Detail <span className="text-[#FFBF00]">Produk/Jasa</span></h4>
                                                {view === 'edit' && editingId && (
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        Registry ID: {editingId}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <div className="flex flex-col ml-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nama Produk/Jasa</label>
                                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={namaProduk}
                                                        onChange={e => setNamaProduk(e.target.value)}
                                                        placeholder="e.g. Tamuu Venue Hall"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] placeholder:text-slate-500 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex flex-col ml-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Harga (Rp)</label>
                                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</div>
                                                        <input
                                                            type="text"
                                                            value={hargaEstimasi ? new Intl.NumberFormat('id-ID').format(Number(hargaEstimasi)) : ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                if (/[^0-9.]/.test(val)) {
                                                                    setHargaError('Hanya masukkan angka.');
                                                                } else {
                                                                    setHargaError('');
                                                                }
                                                                const rawValue = val.replace(/[^0-9]/g, '');
                                                                setHargaEstimasi(rawValue);
                                                            }}
                                                            placeholder="15.000.000"
                                                            className={`w-full bg-white border ${hargaError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40'} rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#0A1128] placeholder:text-slate-500 focus:ring-1 focus:outline-none transition-all`}
                                                        />
                                                    </div>
                                                    {hargaError && <p className="text-xs text-red-500 font-bold ml-1">{hargaError}</p>}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex flex-col ml-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kategori</label>
                                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                                    </div>
                                                    <select
                                                        value={selectedCategory}
                                                        onChange={e => setSelectedCategory(e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>Pilih Kategori...</option>
                                                        {SHOP_CATEGORIES.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                    {selectedCategory === 'Lainnya' && (
                                                        <input
                                                            type="text"
                                                            value={customCategory}
                                                            onChange={e => setCustomCategory(e.target.value)}
                                                            placeholder="Masukkan nama kategori kustom..."
                                                            className="w-full mt-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all placeholder:text-slate-500"
                                                        />
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex flex-col ml-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kota/Kabupaten</label>
                                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                                    </div>
                                                    
                                                    <div className="relative z-20">
                                                        <div 
                                                            onClick={() => setIsKotaOpen(!isKotaOpen)}
                                                            className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] cursor-pointer hover:border-[#FFBF00]/40 transition-all shadow-sm"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                                                <span className="uppercase tracking-tight">{kota}</span>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isKotaOpen ? 'rotate-180' : ''}`} />
                                                        </div>

                                                        <AnimatePresence>
                                                            {isKotaOpen && (
                                                                <>
                                                                    <div className="fixed inset-0 z-40" onClick={() => setIsKotaOpen(false)} />
                                                                    <m.div
                                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        className="absolute left-0 right-0 mt-3 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] overflow-hidden flex flex-col max-h-[350px]"
                                                                    >
                                                                        <div className="p-4 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md">
                                                                            <div className="relative">
                                                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                                                <input 
                                                                                    autoFocus
                                                                                    type="text"
                                                                                    placeholder="Cari Kota/Kabupaten..."
                                                                                    value={kotaSearchQuery}
                                                                                    onChange={(e) => setKotaSearchQuery(e.target.value)}
                                                                                    className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[#0A1128] focus:ring-0 placeholder:text-slate-300"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                                                                            {filteredRegions.length > 0 ? (
                                                                                filteredRegions.map((reg) => (
                                                                                    <button
                                                                                        key={reg}
                                                                                        onClick={() => {
                                                                                            setKota(reg);
                                                                                            setIsKotaOpen(false);
                                                                                            setKotaSearchQuery('');
                                                                                        }}
                                                                                        className={`w-full flex items-center px-4 py-3.5 rounded-2xl text-left transition-all hover:bg-slate-50 group ${
                                                                                            kota === reg ? 'bg-[#FFBF00]/5 text-[#0A1128]' : 'text-slate-500'
                                                                                        }`}
                                                                                    >
                                                                                        <MapPin className={`w-3.5 h-3.5 mr-3 transition-colors ${
                                                                                            kota === reg ? 'text-[#FFBF00]' : 'text-slate-200 group-hover:text-[#FFBF00]'
                                                                                        }`} />
                                                                                        <span className="text-xs font-bold uppercase tracking-tight">{reg}</span>
                                                                                        {kota === reg && (
                                                                                            <Check className="ml-auto w-4 h-4 text-[#FFBF00]" />
                                                                                        )}
                                                                                    </button>
                                                                                ))
                                                                            ) : (
                                                                                <div className="py-12 text-center text-slate-300">
                                                                                    <X className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest">Region not found</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </m.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm relative">
                                            <h4 className="text-lg font-black text-[#0A1128]">Deskripsi <span className="text-[#FFBF00]">Produk/Jasa</span></h4>
                                            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white">
                                                <textarea
                                                    value={deskripsi}
                                                    onChange={e => setDeskripsi(e.target.value)}
                                                    className="w-full bg-transparent border-none p-6 text-sm text-slate-600 font-medium focus:ring-0 placeholder:text-slate-500 resize-none min-h-[250px] focus:outline-none"
                                                    placeholder="Jelaskan fitur, spesifikasi, and keunggulan produk Anda di sini..."
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm relative">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-[#FFBF00] flex items-center justify-center border border-white/5 shadow-lg"><Store className="w-5 h-5" /></div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-[#0A1128]">Sinkronisasi <span className="text-[#FFBF00]">Toko</span></h4>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gunakan Data Global Toko</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSyncingStore(!isSyncingStore)}
                                                    className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${isSyncingStore ? 'bg-[#FFBF00]' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500 flex items-center justify-center ${isSyncingStore ? 'left-8 rotate-0' : 'left-1 -rotate-90'}`}>
                                                        <Check className={`w-3 h-3 text-[#FFBF00] transition-opacity duration-500 ${isSyncingStore ? 'opacity-100' : 'opacity-0'}`} />
                                                    </div>
                                                </button>
                                            </div>

                                            {isSyncingStore && (
                                                <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#FFBF00]/5 border border-[#FFBF00]/20 rounded-2xl">
                                                    <p className="text-[10px] font-bold text-[#0A1128] uppercase tracking-widest flex items-center gap-2">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Mode Sinkronisasi Aktif: Data kontak dan lokasi mengikuti Profile Toko.
                                                    </p>
                                                </m.div>
                                            )}

                                            <div className="flex items-center gap-4 pt-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20"><MapPin className="w-5 h-5" /></div>
                                                <div>
                                                    <h4 className="text-lg font-black text-[#0A1128]">Lokasi <span className="text-[#FFBF00]">Detail</span></h4>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Alamat & Titik Map</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                                                    <textarea
                                                        value={alamatLengkap}
                                                        onChange={e => setAlamatLengkap(e.target.value)}
                                                        placeholder="Masukkan alamat lengkap operasional atau kantor..."
                                                        className="w-full bg-white border border-slate-100 rounded-2xl px-8 py-5 text-sm font-bold text-[#0A1128] placeholder:text-slate-500 focus:ring-2 focus:ring-[#FFBF00]/20 transition-all backdrop-blur-md resize-none h-32 outline-none"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Google Maps (URL)</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <input
                                                            type="text"
                                                            value={googleMapsUrl}
                                                            onChange={e => setGoogleMapsUrl(e.target.value)}
                                                            placeholder="https://maps.google.com/?q=..."
                                                            className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-8 py-5 text-sm font-bold text-[#0A1128] placeholder:text-slate-500 focus:ring-2 focus:ring-[#FFBF00]/20 transition-all backdrop-blur-md outline-none"
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 italic ml-1">*Buka Google Maps, cari lokasi, lalu salin link (URL) dari browser.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-10 shadow-sm relative">
                                            <h4 className="text-lg font-black text-[#0A1128]">Kontak <span className="text-[#FFBF00]">Vendor</span></h4>
                                            
                                            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 space-y-6">
                                                <div className="flex flex-col">
                                                    <label className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest ml-1">Metode Kontak Utama</label>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1 ml-1 italic leading-relaxed">
                                                        Pilih platform yang akan menjadi tombol aksi utama di halaman detail produk.
                                                    </p>
                                                </div>
                                                
                                                <div className="relative group">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
                                                        {kontakUtama === 'whatsapp' && <MessageCircle className="w-5 h-5 text-[#25D366]" />}
                                                        {kontakUtama === 'chat' && <MessageSquare className="w-5 h-5 text-indigo-400" />}
                                                        {kontakUtama === 'phone' && <Phone className="w-5 h-5 text-slate-400" />}
                                                        {kontakUtama === 'instagram' && <Instagram className="w-5 h-5 text-[#E4405F]" />}
                                                        {kontakUtama === 'facebook' && <Facebook className="w-5 h-5 text-[#1877F2]" />}
                                                        {kontakUtama === 'tiktok' && <TiktokIcon className="w-5 h-5 text-black" />}
                                                        {kontakUtama === 'x' && <XLogoIcon className="w-5 h-5 text-black" />}
                                                        {kontakUtama === 'youtube' && <Youtube className="w-5 h-5 text-[#FF0000]" />}
                                                        {kontakUtama === 'website' && <Globe className="w-5 h-5 text-indigo-400" />}
                                                        {kontakUtama === 'tokopedia' && <img src="/images/logos/marketplace/logo_tokopedia.png" className="w-5 h-5 object-contain" alt="" />}
                                                        {kontakUtama === 'shopee' && <img src="/images/logos/marketplace/logo_shopee.png" className="w-5 h-5 object-contain" alt="" />}
                                                        {kontakUtama === 'tiktokshop' && <img src="/images/logos/marketplace/logo-tiktokshop.png" className="w-5 h-5 object-contain" alt="" />}
                                                    </div>
                                                    <select
                                                        value={kontakUtama}
                                                        onChange={e => { setKontakUtama(e.target.value as any); }}
                                                        className="w-full bg-white border border-slate-100 rounded-[1.5rem] pl-16 pr-12 py-5 text-sm font-black text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/50 transition-all appearance-none cursor-pointer backdrop-blur-md uppercase tracking-widest outline-none"
                                                    >
                                                        <option value="whatsapp">WhatsApp</option>
                                                        <option value="chat">Chat Internal Tamuu</option>
                                                        <option value="phone">Telepon Langsung</option>
                                                        <option value="instagram">Instagram</option>
                                                        <option value="facebook">Facebook</option>
                                                        <option value="tiktok">TikTok</option>
                                                        <option value="x">X (Twitter)</option>
                                                        <option value="youtube">YouTube</option>
                                                        <option value="website">Website Resmi</option>
                                                        <option value="tokopedia">Tokopedia</option>
                                                        <option value="shopee">Shopee</option>
                                                        <option value="tiktokshop">TikTok Shop</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none transition-transform duration-300 group-focus-within:rotate-180" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {[
                                                    { label: 'WhatsApp', icon: MessageCircle, value: whatsapp, setter: setWhatsapp, placeholder: '08...', iconColor: 'text-[#25D366]' },
                                                    { label: 'No Telepon', icon: Phone, value: phone, setter: setPhone, placeholder: '08...', iconColor: 'text-slate-600' },
                                                    { label: 'Instagram', icon: Instagram, value: instagram, setter: setInstagram, placeholder: '@username', iconColor: 'text-[#E4405F]' },
                                                    { label: 'Facebook', icon: Facebook, value: facebook, setter: setFacebook, placeholder: 'https://facebook.com/...', iconColor: 'text-[#1877F2]' },
                                                    { label: 'TikTok URL', customIcon: TiktokIcon, value: tiktokUrl, setter: setTiktokUrl, placeholder: 'https://tiktok.com/@...', iconColor: 'text-black' },
                                                    { label: 'YouTube URL', icon: Youtube, value: youtubeUrl, setter: setYoutubeUrl, placeholder: 'https://youtube.com/...', iconColor: 'text-[#FF0000]' },
                                                    { label: 'X (Twitter)', customIcon: XLogoIcon, value: xUrl, setter: setXUrl, placeholder: 'https://x.com/...', iconColor: 'text-black' },
                                                    { label: 'Website Resmi', icon: Globe, value: websiteUrl, setter: setWebsiteUrl, placeholder: 'https://...', iconColor: 'text-indigo-600' },
                                                    { label: 'Tokopedia', img: '/images/logos/marketplace/logo_tokopedia.png', value: tokopediaUrl, setter: setTokopediaUrl, placeholder: 'https://tokopedia.com/...', keepColor: true },
                                                    { label: 'Shopee', img: '/images/logos/marketplace/logo_shopee.png', value: shopeeUrl, setter: setShopeeUrl, placeholder: 'https://shopee.co.id/...', keepColor: true },
                                                    { label: 'TikTok Shop', img: '/images/logos/marketplace/logo-tiktokshop.png', value: tiktokshopUrl, setter: setTiktokshopUrl, placeholder: 'https://shop.tiktok.com/...', keepColor: true }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                                                        <div className="relative">
                                                            {item.icon ? (
                                                                <item.icon className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${item.iconColor || 'text-slate-300'}`} />
                                                            ) : item.customIcon ? (
                                                                <item.customIcon className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${item.iconColor || 'text-slate-300'}`} />
                                                            ) : (
                                                                <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center ${item.keepColor ? 'opacity-80' : 'grayscale opacity-50'}`}>
                                                                    <img src={item.img} alt={item.label} className="w-full h-full object-contain" />
                                                                </div>
                                                            )}
                                                            <input 
                                                                value={item.value} 
                                                                onChange={e => item.setter(e.target.value)} 
                                                                placeholder={item.placeholder} 
                                                                className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 placeholder:text-slate-500 transition-all outline-none" 
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 space-y-10">
                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 shadow-sm flex flex-col min-h-[500px] relative">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex flex-col">
                                                    <h4 className="text-lg font-black text-[#0A1128]">Galeri Foto</h4>
                                                    <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-1">(Minimal 2 Foto)</span>
                                                </div>
                                                <span className="text-[10px] text-[#FFBF00] font-black tracking-widest">{images.length} / 5</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                {images.map((img, idx) => (
                                                    <div key={idx} className="aspect-square bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group shadow-lg">
                                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }}></div>
                                                        
                                                        <div className="absolute top-2 right-2 z-10">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                                                className="w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/20"
                                                                title="Hapus Foto"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {images.length === 0 && (
                                                    <>
                                                        <div className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-center">
                                                            <ImageIcon className="w-8 h-8 text-slate-200" />
                                                        </div>
                                                        <div className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-center">
                                                            <ImageIcon className="w-8 h-8 text-slate-200" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <button
                                                    type="button"
                                                    disabled={images.length >= 5 || isProductUploading}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full py-4 bg-[#0A1128] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                                >
                                                    {isProductUploading ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#FFBF00]"></div>
                                                    ) : (
                                                        <PlusCircleIcon className="w-4 h-4 text-[#FFBF00]" />
                                                    )}
                                                    {isProductUploading ? 'Mengunggah...' : 'Tambah Media'}
                                                </button>

                                                {images.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { if(window.confirm('Hapus semua foto?')) setImages([]); }}
                                                        className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border border-rose-100"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                        Hapus Semua
                                                    </button>
                                                )}
                                            </div>

                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />

                                            <div className="mt-auto p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed text-center italic">
                                                    "A high-fidelity visual narrative drives 3x more intent. Ensure your media profile is impeccable."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </m.section>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {(view === 'add' || view === 'edit') && (
                    <m.footer
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 lg:left-80 right-0 h-24 bg-[#050505]/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-6 md:px-12 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="hidden md:flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-[#FFBF00]' : 'bg-slate-700'}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                                Registry Status: <span className={status === 'PUBLISHED' ? 'text-[#FFBF00]' : 'text-slate-400'}>{status}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => { setView('list'); resetForm(); }}
                                disabled={isBusy}
                                className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl border border-white/10 bg-[#0A1128] text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleSave('DRAFT')}
                                disabled={isBusy || !namaProduk}
                                className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saveType === 'DRAFT' && <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-slate-400"></div>}
                                Simpan Draft
                            </button>
                            <button
                                onClick={() => handleSave('PUBLISHED')}
                                disabled={isBusy || !namaProduk}
                                className="flex-1 md:flex-none px-12 py-3.5 rounded-2xl bg-[#FFBF00] hover:bg-[#FFD700] text-[#0A1128] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-[#FFBF00]/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {saveType === 'PUBLISHED' ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#0A1128]"></div> : null}
                                {saveType === 'PUBLISHED' ? 'Menyimpan...' : 'Publish'}
                            </button>
                        </div>
                    </m.footer>
                )}
            </AnimatePresence>
        </div>
    );
};
