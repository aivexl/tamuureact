import React, { useState, useMemo, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    ShoppingBag, 
    Store,
    Filter, 
    Plus,
    X,
    Save,
    Image as ImageIcon,
    Tag,
    Link as LinkIcon,
    Edit3,
    MapPin,
    ChevronDown,
    Check,
    Youtube,
    Globe,
    UploadCloud,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { useAdminProducts, useAdminDeleteProduct, useAdminAddProduct, useAdminUpdateProduct } from '../../hooks/queries/useShop';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { INDONESIA_REGIONS } from '../../constants/regions';
import { ConfirmationModal } from '../Modals/ConfirmationModal';
import api from '../../lib/api';

// Custom Icons for Tiktok & X
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

export const AdminProductListing: React.FC = () => {
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    
    const { data, isLoading } = useAdminProducts();
    const deleteMutation = useAdminDeleteProduct();
    const addMutation = useAdminAddProduct();
    const updateMutation = useAdminUpdateProduct();

    const products = data?.products || [];

    const filteredProducts = useMemo(() => {
        return products.filter((p: any) => {
            if (p.is_admin_listing !== 1) return false;
            
            const productNo = `tamuu-shop-${p.product_id?.substring(0, 8).toUpperCase()}`;
            const searchLower = search.toLowerCase();

            return p.nama_produk.toLowerCase().includes(searchLower) ||
                (p.custom_store_name || '').toLowerCase().includes(searchLower) ||
                productNo.toLowerCase().includes(searchLower) ||
                p.product_id.toLowerCase().includes(searchLower);
        });
    }, [products, search]);

    const handleDelete = async () => {
        if (!deleteId) return;
        
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Listing purged successfully');
            setDeleteId(null);
        } catch (err: any) {
            toast.error(err.message || 'Purge failed');
        }
    };

    const handleSave = async (formData: any) => {
        try {
            if (editingProduct) {
                await updateMutation.mutateAsync({ id: editingProduct.product_id, data: formData });
                toast.success('Listing updated');
            } else {
                await addMutation.mutateAsync({ ...formData, is_admin_listing: 1 });
                toast.success('Listing added to global shop');
            }
            setView('list');
            setEditingProduct(null);
        } catch (err: any) {
            toast.error(err.message || 'Save failed');
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><PremiumLoader /></div>;

    return (
        <div className="space-y-8 pb-20">
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <m.div 
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Header / Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h2 className="text-2xl font-black text-[#0A1128] uppercase italic tracking-tighter">Global Product Listings</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin-posted products with custom branding</p>
                            </div>
                            <button 
                                onClick={() => { setEditingProduct(null); setView('form'); }}
                                className="bg-[#0A1128] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-[#FFBF00] transition-all shadow-lg shadow-[#0A1128]/10"
                            >
                                <Plus className="w-4 h-4" />
                                New Listing
                            </button>
                        </div>

                        {/* Search */}
                        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input 
                                    type="text" 
                                    placeholder="Search your listings by name, store, or No. Produk..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-50">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Details</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Store</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredProducts.map((product: any) => (
                                            <tr key={product.product_id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                            {product.images?.[0] ? (
                                                                <img src={product.images[0].image_url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <ShoppingBag className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0A1128] uppercase text-sm leading-tight">{product.nama_produk}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                                <span>{product.kategori_produk || 'General'}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-indigo-500 font-black">tamuu-shop-{product.product_id.substring(0, 8).toUpperCase()}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-700 uppercase tracking-tight text-xs">{product.custom_store_name || 'No Name'}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-[#0A1128]">
                                                        {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                                            ? formatCurrency(product.harga_estimasi) 
                                                            : product.harga_estimasi || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        product.status === 'PUBLISHED' 
                                                            ? 'bg-teal-50 text-teal-600 border-teal-100' 
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => { setEditingProduct(product); setView('form'); }}
                                                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-100 transition-all shadow-sm"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <a 
                                                            href={`/shop/admin/${product.product_id}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#FFBF00] transition-all shadow-sm"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button 
                                                            onClick={() => setDeleteId(product.product_id)}
                                                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
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
                            {filteredProducts.length === 0 && (
                                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    No admin listings found
                                </div>
                            )}
                        </div>
                    </m.div>
                ) : (
                    <m.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <ProductForm 
                            product={editingProduct} 
                            onSave={handleSave} 
                            onCancel={() => { setView('list'); setEditingProduct(null); }} 
                        />
                    </m.div>
                )}
            </AnimatePresence>

            <ConfirmationModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Listing?"
                message="Anda akan menghapus listing produk admin ini secara permanen. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus Listing"
                cancelText="Batal"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

const ProductForm: React.FC<{ product?: any, onSave: (data: any) => void, onCancel: () => void }> = ({ product, onSave, onCancel }) => {
    const isEdit = !!product;
    const [loading, setLoading] = useState(false);
    const [hargaError, setHargaError] = useState('');
    const [isKotaOpen, setIsKotaOpen] = useState(false);
    const [kotaSearchQuery, setKotaSearchQuery] = useState('');
    const [isProductUploading, setIsProductUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const [formData, setFormData] = useState({
        nama_produk: product?.nama_produk || '',
        deskripsi: product?.deskripsi || '',
        harga_estimasi: product?.harga_estimasi || '',
        status: product?.status || 'PUBLISHED',
        kategori_produk: product?.kategori_produk || '',
        kota: product?.kota || 'Kota Jakarta Selatan',
        custom_store_name: product?.custom_store_name || '',
        is_admin_listing: 1,
        images: product?.images?.map((img: any) => img.image_url) || [],
        tokopedia_url: product?.tokopedia_url || '',
        shopee_url: product?.shopee_url || '',
        website_url: product?.website_url || '',
        tiktok_url: product?.tiktok_url || '',
        youtube_url: product?.youtube_url || '',
        x_url: product?.x_url || ''
    });

    const [selectedCategory, setSelectedCategory] = useState(() => {
        const kat = product?.kategori_produk || '';
        if (kat === '' || SHOP_CATEGORIES.includes(kat)) return kat;
        return 'Lainnya';
    });
    const [customCategory, setCustomCategory] = useState(() => {
        const kat = product?.kategori_produk || '';
        return SHOP_CATEGORIES.includes(kat) ? '' : kat;
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsProductUploading(true);
            const res = await api.storage.upload(file, 'gallery');
            if (res && res.url) {
                setFormData(prev => ({ ...prev, images: [...prev.images, res.url] }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Gagal mengunggah foto.');
        } finally {
            setIsProductUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const finalKategori = selectedCategory === 'Lainnya' ? customCategory : selectedCategory;
        try {
            await onSave({ ...formData, kategori_produk: finalKategori });
        } finally {
            setLoading(false);
        }
    };

    const filteredRegions = useMemo(() => {
        const query = kotaSearchQuery.toLowerCase().trim();
        if (!query) return INDONESIA_REGIONS;
        return INDONESIA_REGIONS.filter((reg: string) => reg.toLowerCase().includes(query));
    }, [kotaSearchQuery]);

    return (
        <div className="space-y-10">
            {/* Form Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button 
                        onClick={onCancel}
                        className="flex items-center gap-2 text-slate-400 hover:text-[#0A1128] font-bold text-[10px] uppercase tracking-widest transition-all mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke List
                    </button>
                    <h2 className="text-3xl font-black text-[#0A1128] uppercase italic tracking-tighter">
                        {isEdit ? 'Sunting Listing' : 'Listing Baru'}
                    </h2>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onCancel}
                        className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-[#0A1128] transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !formData.nama_produk || !formData.custom_store_name}
                        className="bg-[#0A1128] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#0A1128]/10 hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Processing...' : (isEdit ? 'Update Listing' : 'Publish Listing')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Basic Identity */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><Tag className="w-4 h-4" /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Identitas Produk</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Produk</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_produk}
                                    onChange={e => setFormData({...formData, nama_produk: e.target.value})}
                                    placeholder="Contoh: Paket Catering Pernikahan Premium"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Toko Custom</label>
                                    <div className="relative">
                                        <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.custom_store_name}
                                            onChange={e => setFormData({...formData, custom_store_name: e.target.value})}
                                            placeholder="Contoh: Official Samsung Store"
                                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Harga Estimasi (Rp)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</div>
                                        <input
                                            type="text"
                                            value={formData.harga_estimasi ? new Intl.NumberFormat('id-ID').format(Number(formData.harga_estimasi)) : ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/[^0-9.]/.test(val)) {
                                                    setHargaError('Hanya masukkan angka.');
                                                } else {
                                                    setHargaError('');
                                                }
                                                const rawValue = val.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, harga_estimasi: rawValue });
                                            }}
                                            placeholder="15.000.000"
                                            className={`w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 ${hargaError ? 'focus:ring-red-500/20' : 'focus:ring-[#FFBF00]/20'} transition-all`}
                                        />
                                    </div>
                                    {hargaError && <p className="text-[10px] text-red-500 font-bold ml-1">{hargaError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={e => setSelectedCategory(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Pilih Kategori...</option>
                                            {SHOP_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    {selectedCategory === 'Lainnya' && (
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={e => setCustomCategory(e.target.value)}
                                            placeholder="Masukkan nama kategori..."
                                            className="w-full mt-3 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                                        />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lokasi (Kota/Kabupaten)</label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setIsKotaOpen(!isKotaOpen)}
                                            className="flex items-center justify-between w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] cursor-pointer hover:bg-slate-100 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                                <span className="uppercase tracking-tight truncate max-w-[150px]">{formData.kota}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isKotaOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isKotaOpen && (
                                                <m.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute left-0 right-0 mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px]"
                                                >
                                                    <div className="p-4 border-b border-slate-50 sticky top-0 bg-white">
                                                        <div className="relative">
                                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                            <input 
                                                                type="text"
                                                                placeholder="Cari lokasi..."
                                                                value={kotaSearchQuery}
                                                                onChange={(e) => setKotaSearchQuery(e.target.value)}
                                                                className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-[#0A1128] focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto p-2 custom-scrollbar">
                                                        {filteredRegions.map(reg => (
                                                            <button
                                                                key={reg}
                                                                onClick={() => { setFormData({...formData, kota: reg}); setIsKotaOpen(false); }}
                                                                className={`w-full flex items-center px-4 py-3 rounded-xl text-left text-xs font-bold uppercase transition-all hover:bg-slate-50 ${formData.kota === reg ? 'text-[#FFBF00] bg-[#FFBF00]/5' : 'text-slate-500'}`}
                                                            >
                                                                <MapPin className="w-3.5 h-3.5 mr-3" />
                                                                {reg}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center"><Check className="w-4 h-4" /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Deskripsi Detail</h3>
                        </div>
                        <textarea
                            rows={8}
                            value={formData.deskripsi}
                            onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-3xl p-8 text-sm text-slate-600 font-medium focus:ring-2 focus:ring-[#FFBF00]/20 transition-all resize-none"
                            placeholder="Jelaskan spesifikasi, fasilitas, dan keunggulan produk/jasa Anda secara mendalam..."
                        />
                    </div>

                    {/* External Links */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><LinkIcon className="w-4 h-4" /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Koneksi Eksternal</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TikTok URL</label>
                                <div className="relative">
                                    <TiktokIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={formData.tiktok_url} onChange={e => setFormData({...formData, tiktok_url: e.target.value})} placeholder="https://tiktok.com/@..." className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube URL</label>
                                <div className="relative">
                                    <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={formData.youtube_url} onChange={e => setFormData({...formData, youtube_url: e.target.value})} placeholder="https://youtube.com/..." className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">X (Twitter)</label>
                                <div className="relative">
                                    <XLogoIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={formData.x_url} onChange={e => setFormData({...formData, x_url: e.target.value})} placeholder="https://x.com/..." className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} placeholder="https://..." className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tokopedia</label>
                                <div className="relative">
                                    <img src="/images/logos/marketplace/logo_tokopedia.png" className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 grayscale opacity-50" alt="" />
                                    <input value={formData.tokopedia_url} onChange={e => setFormData({...formData, tokopedia_url: e.target.value})} placeholder="https://tokopedia.com/..." className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shopee</label>
                                <div className="relative">
                                    <img src="/images/logos/marketplace/logo_shopee.png" className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 grayscale opacity-50" alt="" />
                                    <input value={formData.shopee_url} onChange={e => setFormData({...formData, shopee_url: e.target.value})} placeholder="https://shopee.co.id/..." className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#0A1128]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Media Gallery */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-[#0A1128]">Asset Visual</h3>
                            <span className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest">{formData.images.length}/5 Foto</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {formData.images.map((url: string, idx: number) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative group">
                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            ))}
                            {formData.images.length < 5 && (
                                <div 
                                    onClick={() => !isProductUploading && fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                >
                                    {isProductUploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFBF00]"></div>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-[#FFBF00] transition-colors mb-2" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unggah Foto</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                        
                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed text-center italic">
                                "Visual high-fidelity meningkatkan konversi hingga 3x lipat. Pastikan kualitas foto tajam dan profesional."
                            </p>
                        </div>
                    </div>

                    {/* Tips Card */}
                    <div className="bg-[#0A1128] rounded-[2.5rem] p-10 text-white space-y-6 shadow-2xl shadow-[#0A1128]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#FFBF00]"><AlertCircle className="w-4 h-4" /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Registry Policy</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                            Listing ini akan ditayangkan secara global di Tamuu Shop. Pastikan informasi tautan Tokopedia/Shopee valid untuk memudahkan transaksi pengguna.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
