import React, { useState, useMemo, useRef, useEffect } from 'react';
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
    ArrowLeft,
    ShieldCheck,
    MessageCircle,
    MessageSquare,
    Phone,
    Instagram,
    Facebook,
    Eye
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
            
            const productNo = `tamuu-shop-${p.product_id?.substring(0, 8)?.toUpperCase()}`;
            const searchLower = search.toLowerCase();

            return p.nama_produk.toLowerCase().includes(searchLower) ||
                (p.custom_store_name || '').toLowerCase().includes(searchLower) ||
                productNo.toLowerCase().includes(searchLower) ||
                p.product_id.toLowerCase().includes(searchLower);
        });
    }, [products, search]);

    const stats = useMemo(() => {
        const adminListings = products.filter((p: any) => p.is_admin_listing === 1);
        return {
            total: adminListings.length,
            published: adminListings.filter((p: any) => p.status === 'PUBLISHED').length,
            drafts: adminListings.filter((p: any) => p.status === 'DRAFT').length
        };
    }, [products]);

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

    const handleSave = async (payload: any) => {
        try {
            if (editingProduct) {
                const targetId = editingProduct.product_id || editingProduct.id;
                await updateMutation.mutateAsync({ id: targetId, data: payload });
                toast.success('Listing updated successfully');
            } else {
                await addMutation.mutateAsync({ ...payload, is_admin_listing: 1 });
                toast.success('Listing added to global shop');
            }
            setView('list');
            setEditingProduct(null);
        } catch (err: any) {
            console.error('[Admin] SAVE ERROR:', err);
            toast.error(err.message || 'Save operation failed');
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><PremiumLoader /></div>;

    return (
        <div className="space-y-10 pb-20">
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <m.div 
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                    >
                        {/* Stats Ringkas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Produk</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-5xl font-black text-white tracking-tighter italic">{stats.total}</h3>
                                    <span className="text-[10px] font-bold text-indigo-400 mb-2 uppercase italic">Database</span>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-teal-500/20 transition-all duration-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Live</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-5xl font-black text-teal-400 tracking-tighter italic">{stats.published}</h3>
                                    <span className="text-[10px] font-bold text-teal-500/50 mb-2 uppercase italic">Aktif</span>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-500/20 transition-all duration-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Draft</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-5xl font-black text-amber-400 tracking-tighter italic">{stats.drafts}</h3>
                                    <span className="text-[10px] font-bold text-amber-500/50 mb-2 uppercase italic">Persiapan</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions & Search */}
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Cari produk berdasarkan nama, toko, atau ID..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                                />
                            </div>
                            <button 
                                onClick={() => { setEditingProduct(null); setView('form'); }}
                                className="w-full lg:w-auto bg-[#FFBF00] text-[#0A1128] px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#FFBF00]/20"
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Produk Baru
                            </button>
                        </div>

                        {/* Product List Table */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Info Produk</th>
                                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Nama Toko</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Harga</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Metode</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>

                                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredProducts.map((product: any) => (
                                            <tr key={product.product_id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 shadow-inner">
                                                            {product.images?.[0] ? (
                                                                <img src={product.images[0].image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                                    <ShoppingBag className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white uppercase text-sm leading-tight tracking-tight italic group-hover:text-[#FFBF00] transition-colors">{product.nama_produk}</p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-wider">{product.kategori_produk || 'Umum'}</span>
                                                                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                                    No. Produk: tamuu-shop-{product.product_id?.substring(0, 8)?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                            <Store className="w-4 h-4 text-slate-500" />
                                                        </div>
                                                        <p className="font-bold text-slate-300 uppercase tracking-tight text-xs italic">{product.custom_store_name || 'Generic Vendor'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <p className="font-black text-white text-base tracking-tighter">
                                                        {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                                            ? formatCurrency(product.harga_estimasi) 
                                                            : product.harga_estimasi || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shadow-sm">
                                                            {product.kontak_utama === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />}
                                                            {product.kontak_utama === 'chat' && <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />}
                                                            {product.kontak_utama === 'phone' && <Phone className="w-3.5 h-3.5 text-slate-400" />}
                                                            {product.kontak_utama === 'instagram' && <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />}
                                                            {product.kontak_utama === 'facebook' && <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />}
                                                            {product.kontak_utama === 'tiktok' && <TiktokIcon className="w-3.5 h-3.5 text-white" />}
                                                            {product.kontak_utama === 'x' && <XLogoIcon className="w-3.5 h-3.5 text-white" />}
                                                            {product.kontak_utama === 'youtube' && <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />}
                                                            {product.kontak_utama === 'website' && <Globe className="w-3.5 h-3.5 text-indigo-400" />}
                                                            {product.kontak_utama === 'tokopedia' && <img src="/images/logos/marketplace/logo_tokopedia.png" className="w-4 h-4 object-contain" alt="" />}
                                                            {product.kontak_utama === 'shopee' && <img src="/images/logos/marketplace/logo_shopee.png" className="w-4 h-4 object-contain" alt="" />}
                                                            {product.kontak_utama === 'tiktokshop' && <img src="/images/logos/marketplace/logo-tiktokshop.png" className="w-4 h-4 object-contain" alt="" />}
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">{product.kontak_utama || 'WhatsApp'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center">
                                                        {product.status === 'PUBLISHED' ? (
                                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                                                Published
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                                Draft
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                        <button 
                                                            onClick={() => { setEditingProduct(product); setView('form'); }}
                                                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                                            title="Edit Listing"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <a 
                                                            href={`/shop/${product.vendor_slug === 'admin' ? 'umum' : (product.vendor_slug || 'umum')}/${product.slug || product.product_id}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-[#FFBF00] hover:bg-[#FFBF00]/5 transition-all"
                                                            title="View Live"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button 
                                                            onClick={() => setDeleteId(product.product_id)}
                                                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all"
                                                            title="Purge Listing"
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
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                        <Search className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">No listings found in registry</p>
                                    <p className="text-xs text-slate-600 mt-2">Try adjusting your search filters</p>
                                </div>
                            )}
                        </div>
                    </m.div>
                ) : (
                    <m.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                    >
                        <ProductForm 
                            key={editingProduct?.product_id || editingProduct?.id || 'new'}
                            product={editingProduct} 
                            allProducts={products}
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
                title="Purge Administrative Listing?"
                message="Critical action: You are about to permanently remove this administrative listing from the global marketplace. This process is irreversible."
                confirmText="Purge Listing"
                cancelText="Cancel"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

const ProductForm: React.FC<{ product?: any, allProducts: any[], onSave: (data: any) => void, onCancel: () => void }> = ({ product, allProducts, onSave, onCancel }) => {
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
        tiktokshop_url: product?.tiktokshop_url || '',
        website_url: product?.website_url || '',
        tiktok_url: product?.tiktok_url || '',
        youtube_url: product?.youtube_url || '',
        x_url: product?.x_url || '',
        whatsapp: product?.whatsapp || '',
        phone: product?.phone || '',
        instagram: product?.instagram || '',
        facebook: product?.facebook || '',
        alamat_lengkap: product?.alamat_lengkap || '',
        google_maps_url: product?.google_maps_url || '',
        is_special: product?.is_special || 0,
        is_featured: product?.is_featured || 0,
        is_landing_featured: product?.is_landing_featured || 0,
        hide_chat: product?.hide_chat || 0
    });

    const [kontakUtama, setKontakUtama] = useState<'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'tiktok' | 'tokopedia' | 'shopee' | 'tiktokshop' | 'chat' | 'x' | 'youtube' | 'website'>(
        product?.kontak_utama || 'whatsapp'
    );

    const [isSyncingStore, setIsSyncingStore] = useState(false);
    const prevSyncRef = useRef(false);
    const prevStoreNameRef = useRef(formData.custom_store_name);
        
    const [selectedCategory, setSelectedCategory] = useState(
        () => {
        const cat = product?.kategori_produk || '';
        if (cat === '' || SHOP_CATEGORIES.includes(cat)) return cat;
        return 'Lainnya';
    });
    const [customCategory, setCustomCategory] = useState(() => {
        const cat = product?.kategori_produk || '';
        return SHOP_CATEGORIES.includes(cat) ? '' : cat;
    });

    useEffect(() => {
        const syncTurnedOn = isSyncingStore && !prevSyncRef.current;
        const storeNameChanged = isSyncingStore && formData.custom_store_name !== prevStoreNameRef.current;

        if (syncTurnedOn || storeNameChanged) {
            const latestMatch = allProducts
                .filter(p => 
                    p.is_admin_listing === 1 &&
                    p.custom_store_name?.toLowerCase() === formData.custom_store_name.toLowerCase() && 
                    (p.product_id || p.id) !== (product?.product_id || product?.id)
                )
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

            if (latestMatch) {
                setFormData(prev => ({
                    ...prev,
                    whatsapp: latestMatch.whatsapp || prev.whatsapp,
                    phone: latestMatch.phone || prev.phone,
                    instagram: latestMatch.instagram || prev.instagram,
                    facebook: latestMatch.facebook || prev.facebook,
                    tiktok_url: latestMatch.tiktok_url || prev.tiktok_url,
                    youtube_url: latestMatch.youtube_url || prev.youtube_url,
                    x_url: latestMatch.x_url || prev.x_url,
                    website_url: latestMatch.website_url || prev.website_url,
                    tokopedia_url: latestMatch.tokopedia_url || prev.tokopedia_url,
                    shopee_url: latestMatch.shopee_url || prev.shopee_url,
                    alamat_lengkap: latestMatch.alamat_lengkap || prev.alamat_lengkap,
                    google_maps_url: latestMatch.google_maps_url || prev.google_maps_url,
                    kategori_produk: latestMatch.kategori_produk || prev.kategori_produk,
                    kota: latestMatch.kota || prev.kota,
                    hide_chat: latestMatch.hide_chat || prev.hide_chat
                }));

                if (latestMatch.kontak_utama) {
                    setKontakUtama(latestMatch.kontak_utama);
                }

                if (latestMatch.kategori_produk) {
                    if (SHOP_CATEGORIES.includes(latestMatch.kategori_produk)) {
                        setSelectedCategory(latestMatch.kategori_produk);
                        setCustomCategory('');
                    } else {
                        setSelectedCategory('Lainnya');
                        setCustomCategory(latestMatch.kategori_produk);
                    }
                }
            }
        }
        
        prevSyncRef.current = isSyncingStore;
        prevStoreNameRef.current = formData.custom_store_name;
    }, [isSyncingStore, formData.custom_store_name, allProducts]);

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

    const handleSubmit = async (e?: React.FormEvent, forceStatus?: 'DRAFT' | 'PUBLISHED') => {
        if (e) e.preventDefault();
        
        const targetStatus = forceStatus || formData.status;
        const finalKategori = selectedCategory === 'Lainnya' ? customCategory : selectedCategory;

        const isDuplicate = allProducts.some((p: any) => 
            p.nama_produk.toLowerCase().trim() === formData.nama_produk.toLowerCase().trim() && 
            p.product_id !== product?.product_id
        );

        if (isDuplicate) {
            toast.error(`Gagal! Produk dengan nama "${formData.nama_produk}" sudah ada. Silakan gunakan nama lain agar link (slug) produk unik.`, {
                duration: 5000,
                icon: '🚫'
            });
            return;
        }

        if (targetStatus === 'PUBLISHED') {
            const missingFields = [];
            if (!formData.nama_produk.trim()) missingFields.push('Nama Produk/Jasa');
            if (!formData.custom_store_name.trim()) missingFields.push('Nama Toko');
            if (!finalKategori) missingFields.push('Kategori');
            if (!formData.kota) missingFields.push('Wilayah Operasional');
            if (formData.images.length < 2) missingFields.push('Minimal 2 Foto');

            if (missingFields.length > 0) {
                toast.error(`Gagal publikasi! Wajib diisi: ${missingFields.join(', ')}`, {
                    duration: 4000,
                    icon: '⚠️'
                });
                return;
            }
        }

        setLoading(true);
        try {
            const payload = { 
                ...formData, 
                status: targetStatus, 
                kategori_produk: finalKategori,
                kontak_utama: kontakUtama 
            };
            await onSave(payload);
        } catch (error) {
            console.error('Save error:', error);
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
            <div className="flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50 py-8 mb-10 border-b border-white/5">
                <div>
                    <button 
                        onClick={onCancel}
                        className="flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar
                    </button>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter block">
                        {isEdit ? 'Edit' : 'Tambah'} <span className="text-[#FFBF00]">Produk</span>
                    </h2>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onCancel}
                        className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={() => handleSubmit(undefined, 'DRAFT')}
                        disabled={loading}
                        className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all disabled:opacity-50 border border-white/5 shadow-xl shadow-black/20"
                    >
                        Simpan Draft
                    </button>
                    <button 
                        onClick={() => handleSubmit(undefined, 'PUBLISHED')}
                        disabled={loading}
                        className="bg-[#FFBF00] text-[#0A1128] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#FFBF00]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Memproses...' : (isEdit ? 'Update Produk' : 'Publikasikan')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Basic Identity */}
                    <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-10 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20"><Tag className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Detail Produk</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Informasi dasar produk</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex flex-col ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Produk / Jasa</label>
                                    <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_produk}
                                    onChange={e => setFormData({...formData, nama_produk: e.target.value})}
                                    placeholder="Contoh: Paket Pernikahan Intimate"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex flex-col ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Toko / Brand</label>
                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                    </div>
                                    <StoreNameCombobox 
                                        value={formData.custom_store_name}
                                        allProducts={allProducts}
                                        onChange={(storeName, details) => {
                                            if (details) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    custom_store_name: storeName,
                                                    whatsapp: details.whatsapp || prev.whatsapp,
                                                    phone: details.phone || prev.phone,
                                                    instagram: details.instagram || prev.instagram,
                                                    facebook: details.facebook || prev.facebook,
                                                    alamat_lengkap: details.alamat_lengkap || prev.alamat_lengkap,
                                                    google_maps_url: details.google_maps_url || prev.google_maps_url,
                                                    tokopedia_url: details.tokopedia_url || prev.tokopedia_url,
                                                    shopee_url: details.shopee_url || prev.shopee_url,
                                                    website_url: details.website_url || prev.website_url,
                                                    tiktok_url: details.tiktok_url || prev.tiktok_url,
                                                    youtube_url: details.youtube_url || prev.youtube_url,
                                                    x_url: details.x_url || prev.x_url,
                                                    kategori_produk: details.kategori_produk || prev.kategori_produk,
                                                    kota: details.kota || prev.kota,
                                                    hide_chat: details.hide_chat || prev.hide_chat
                                                }));
                                                
                                                if (details.kategori_produk) {
                                                    if (SHOP_CATEGORIES.includes(details.kategori_produk)) {
                                                        setSelectedCategory(details.kategori_produk);
                                                        setCustomCategory('');
                                                    } else {
                                                        setSelectedCategory('Lainnya');
                                                        setCustomCategory(details.kategori_produk);
                                                    }
                                                }
                                            } else {
                                                setFormData(prev => ({ ...prev, custom_store_name: storeName }));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga (Rp)</label>
                                        <span className="text-[8px] font-bold text-teal-400/60 uppercase tracking-widest mt-0.5">(Opsional)</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">Rp</div>
                                        <input
                                            type="text"
                                            value={formData.harga_estimasi ? new Intl.NumberFormat('id-ID').format(Number(formData.harga_estimasi)) : ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const numericVal = val.replace(/[^0-9]/g, '');
                                                if (val !== numericVal && val.replace(/[.]/g, '') !== numericVal) {
                                                    setHargaError('Hanya angka saja.');
                                                } else {
                                                    setHargaError('');
                                                }
                                                setFormData({ ...formData, harga_estimasi: numericVal });
                                            }}
                                            placeholder="15.000.000"
                                            className={`w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-sm font-black text-white placeholder:text-slate-500 focus:ring-2 ${hargaError ? 'focus:ring-red-500/50' : 'focus:ring-indigo-500/50'} focus:bg-white/10 transition-all backdrop-blur-md`}
                                        />
                                    </div>
                                    {hargaError && <p className="text-[10px] text-red-500 font-bold ml-1">{hargaError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex flex-col ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={e => setSelectedCategory(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer backdrop-blur-md"
                                        >
                                            <option value="" disabled className="bg-[#0A0A0A]">Pilih Kategori...</option>
                                            {SHOP_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                                    </div>
                                    {selectedCategory === 'Lainnya' && (
                                        <m.input
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            type="text"
                                            value={customCategory}
                                            onChange={e => setCustomCategory(e.target.value)}
                                            placeholder="Tulis kategori baru..."
                                            className="w-full mt-4 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                                        />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wilayah Operasional</label>
                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-0.5">(Wajib Diisi)</span>
                                    </div>
                                    <div className="relative z-20">
                                        <div 
                                            onClick={() => setIsKotaOpen(!isKotaOpen)}
                                            className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white cursor-pointer hover:bg-white/10 transition-all backdrop-blur-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-5 h-5 text-[#FFBF00]" />
                                                <span className="uppercase tracking-tight truncate max-w-[150px] italic">{formData.kota}</span>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-500 ${isKotaOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isKotaOpen && (
                                                <m.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 15 }}
                                                    className="absolute left-0 right-0 mt-4 bg-[#0F0F0F] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] overflow-hidden flex flex-col max-h-[350px] backdrop-blur-2xl"
                                                >
                                                    <div className="p-5 border-b border-white/5 sticky top-0 bg-[#0F0F0F]/80 backdrop-blur-md">
                                                        <div className="relative">
                                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                                            <input 
                                                                type="text"
                                                                placeholder="Cari lokasi..."
                                                                value={kotaSearchQuery}
                                                                onChange={(e) => setKotaSearchQuery(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-5 py-4 text-xs font-bold text-white focus:ring-0 focus:bg-white/10 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto p-3 custom-scrollbar">
                                                        {filteredRegions.map(reg => (
                                                            <button
                                                                key={reg}
                                                                onClick={() => { setFormData({...formData, kota: reg}); setIsKotaOpen(false); }}
                                                                className={`w-full flex items-center px-5 py-4 rounded-xl text-left text-xs font-bold uppercase transition-all hover:bg-white/5 ${formData.kota === reg ? 'text-[#FFBF00] bg-[#FFBF00]/5' : 'text-slate-500 hover:text-white'}`}
                                                            >
                                                                <MapPin className={`w-4 h-4 mr-4 ${formData.kota === reg ? 'text-[#FFBF00]' : 'text-slate-700'}`} />
                                                                {reg}
                                                            </button>
                                                        ))}
                                                        {filteredRegions.length === 0 && (
                                                            <div className="py-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Lokasi tidak ditemukan</div>
                                                        )}
                                                    </div>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20"><Check className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Deskripsi Lengkap</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Spesifikasi & Detail Produk</p>
                            </div>
                        </div>
                        <textarea
                            rows={10}
                            value={formData.deskripsi}
                            onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-10 text-sm text-slate-300 font-medium focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all resize-none backdrop-blur-md placeholder:text-slate-500"
                            placeholder="Jelaskan fitur, spesifikasi, and keunggulan produk Anda di sini..."
                        />
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFBF00]/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/10 text-[#FFBF00] flex items-center justify-center border border-[#FFBF00]/20"><Store className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Sinkronisasi Riwayat</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gunakan data dari listing sebelumnya</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSyncingStore(!isSyncingStore)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${isSyncingStore ? 'bg-[#FFBF00]' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500 flex items-center justify-center ${isSyncingStore ? 'left-8 rotate-0' : 'left-1 -rotate-90'}`}>
                                    <Check className={`w-3 h-3 text-[#FFBF00] transition-opacity duration-500 ${isSyncingStore ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            </button>
                        </div>

                        {isSyncingStore && (
                            <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-[#FFBF00]/5 border border-[#FFBF00]/20 rounded-[1.5rem] relative z-10 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FFBF00]/20 flex items-center justify-center text-[#FFBF00] animate-pulse">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest leading-relaxed">
                                    Mode Sinkronisasi Aktif: Data kontak dan lokasi mengikuti entri terbaru di registry untuk "{formData.custom_store_name || 'Generic Vendor'}".
                                </p>
                            </m.div>
                        )}
                    </div>

                    {/* Location Detail */}
                    <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-10 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20"><MapPin className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Lokasi Detail</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Alamat & Titik Map</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                                <textarea
                                    value={formData.alamat_lengkap}
                                    onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})}
                                    placeholder="Masukkan alamat lengkap operasional atau kantor..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md resize-none h-32"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Google Maps (URL)</label>
                                <div className="relative">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={formData.google_maps_url}
                                        onChange={e => setFormData({...formData, google_maps_url: e.target.value})}
                                        placeholder="https://maps.google.com/?q=..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 italic ml-1">*Buka Google Maps, cari lokasi, lalu salin link (URL) dari browser.</p>
                            </div>
                        </div>
                    </div>

                    {/* External Links */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-10 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20"><LinkIcon className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Kontak & Link Eksternal</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Vendor Contact & Marketplace</p>
                            </div>
                        </div>

                        {/* Chat Control */}
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform"><MessageSquare className="w-5 h-5" /></div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Internal Chat</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Toggle chat visibility on product page</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${formData.hide_chat ? 'text-rose-400' : 'text-teal-400'}`}>
                                    {formData.hide_chat ? 'Hidden' : 'Visible'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, hide_chat: prev.hide_chat ? 0 : 1 }))}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${formData.hide_chat ? 'bg-slate-800' : 'bg-indigo-600'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-xl transition-all duration-500 flex items-center justify-center ${formData.hide_chat ? 'left-1' : 'left-8'}`}>
                                        {!formData.hide_chat ? <Check className="w-3 h-3 text-indigo-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest ml-1">Metode Kontak Utama</label>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1 ml-1 italic">
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
                                    {kontakUtama === 'tiktok' && <TiktokIcon className="w-5 h-5 text-white" />}
                                    {kontakUtama === 'x' && <XLogoIcon className="w-5 h-5 text-white" />}
                                    {kontakUtama === 'youtube' && <Youtube className="w-5 h-5 text-[#FF0000]" />}
                                    {kontakUtama === 'website' && <Globe className="w-5 h-5 text-indigo-400" />}
                                    {kontakUtama === 'tokopedia' && <img src="/images/logos/marketplace/logo_tokopedia.png" className="w-5 h-5 object-contain" alt="" />}
                                    {kontakUtama === 'shopee' && <img src="/images/logos/marketplace/logo_shopee.png" className="w-5 h-5 object-contain" alt="" />}
                                    {kontakUtama === 'tiktokshop' && <img src="/images/logos/marketplace/logo-tiktokshop.png" className="w-5 h-5 object-contain" alt="" />}
                                </div>
                                <select
                                    value={kontakUtama}
                                    onChange={e => setKontakUtama(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-12 py-5 text-sm font-black text-white focus:ring-2 focus:ring-[#FFBF00]/50 focus:bg-white/10 transition-all appearance-none cursor-pointer backdrop-blur-md uppercase tracking-widest"
                                >
                                    <option value="whatsapp" className="bg-[#0A0A0A]">WhatsApp</option>
                                    <option value="chat" className="bg-[#0A0A0A]">Chat Internal Tamuu</option>
                                    <option value="phone" className="bg-[#0A0A0A]">Telepon Langsung</option>
                                    <option value="instagram" className="bg-[#0A0A0A]">Instagram</option>
                                    <option value="facebook" className="bg-[#0A0A0A]">Facebook</option>
                                    <option value="tiktok" className="bg-[#0A0A0A]">TikTok</option>
                                    <option value="x" className="bg-[#0A0A0A]">X (Twitter)</option>
                                    <option value="youtube" className="bg-[#0A0A0A]">YouTube</option>
                                    <option value="website" className="bg-[#0A0A0A]">Website Resmi</option>
                                    <option value="tokopedia" className="bg-[#0A0A0A]">Tokopedia</option>
                                    <option value="shopee" className="bg-[#0A0A0A]">Shopee</option>
                                    <option value="tiktokshop" className="bg-[#0A0A0A]">TikTok Shop</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none transition-transform duration-300 group-focus-within:rotate-180" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'WhatsApp', icon: MessageCircle, key: 'whatsapp', placeholder: '08...' },
                                { label: 'No Telepon', icon: Phone, key: 'phone', placeholder: '08...' },
                                { label: 'Instagram', icon: Instagram, key: 'instagram', placeholder: '@username' },
                                { label: 'Facebook', icon: Facebook, key: 'facebook', placeholder: 'https://facebook.com/...' },
                                { label: 'TikTok URL', icon: TiktokIcon, key: 'tiktok_url', placeholder: 'https://tiktok.com/@...' },
                                { label: 'YouTube URL', icon: Youtube, key: 'youtube_url', placeholder: 'https://youtube.com/...' },
                                { label: 'X (Twitter)', icon: XLogoIcon, key: 'x_url', placeholder: 'https://x.com/...' },
                                { label: 'Website Resmi', icon: Globe, key: 'website_url', placeholder: 'https://...' },
                                { label: 'Tokopedia', img: '/images/logos/marketplace/logo_tokopedia.png', key: 'tokopedia_url', placeholder: 'https://tokopedia.com/...', keepColor: true },
                                { label: 'Shopee', img: '/images/logos/marketplace/logo_shopee.png', key: 'shopee_url', placeholder: 'https://shopee.co.id/...', keepColor: true },
                                { label: 'TikTok Shop', img: '/images/logos/marketplace/logo-tiktokshop.png', key: 'tiktokshop_url', placeholder: 'https://shop.tiktok.com/...', keepColor: true }
                            ].map((item: any) => (
                                <div key={item.key} className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{item.label}</label>
                                    <div className="relative">
                                        {item.icon ? (
                                            <item.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        ) : (
                                            <img src={item.img} className={`absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-opacity ${item.keepColor ? 'opacity-80' : 'grayscale opacity-40 group-focus-within:opacity-100'}`} alt="" />
                                        )}
                                        <input 
                                            value={(formData as any)[item.key]} 
                                            onChange={e => setFormData({...formData, [item.key]: e.target.value})} 
                                            placeholder={item.placeholder} 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Media Gallery */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Galeri Foto</h3>
                                <span className="text-[8px] font-bold text-rose-400/60 uppercase tracking-widest mt-1">(Minimal 2 Foto)</span>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Gunakan foto asli produk</p>
                            </div>
                            <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-[#FFBF00] uppercase tracking-widest">{formData.images.length}/5 Foto</span>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {formData.images.map((url: string, idx: number) => (
                                <m.div 
                                    key={idx} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative group shadow-lg"
                                >
                                    <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        <Trash2 className="w-8 h-8" />
                                    </button>
                                </m.div>
                            ))}
                            {formData.images.length < 5 && (
                                <div 
                                    onClick={() => !isProductUploading && fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                                >
                                    {isProductUploading ? (
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FFBF00]"></div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#FFBF00]/10 transition-colors">
                                                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-[#FFBF00] transition-colors" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Tambah Foto</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                        
                        <div className="mt-10 p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                            <p className="text-[11px] text-indigo-300/60 font-bold leading-relaxed text-center italic">
                                "Foto produk yang menarik dapat meningkatkan kepercayaan calon pembeli secara signifikan."
                            </p>
                        </div>
                    </div>

                    {/* Governance & Visibility */}
                    <div className="bg-[#0A1128] rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl shadow-black/40 relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FFBF00] border border-white/10"><ShieldCheck className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FFBF00]">Governance</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Administrative Controls</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                            {[
                                { id: 'is_special', label: 'Special Product', desc: 'Tampilkan label Special di listing' },
                                { id: 'is_featured', label: 'Featured Product', desc: 'Prioritaskan di hasil pencarian' },
                                { id: 'is_landing_featured', label: 'Landing Featured', desc: 'Tampilkan di Homepage (Discovery)' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest group-hover:text-[#FFBF00] transition-colors">{item.label}</span>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{item.desc}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, [item.id]: (formData as any)[item.id] ? 0 : 1 }))}
                                        className={`w-12 h-6 rounded-full transition-all relative ${
                                            (formData as any)[item.id] ? 'bg-[#FFBF00]' : 'bg-slate-800'
                                        }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                                            (formData as any)[item.id] ? 'left-7' : 'left-1'
                                        }`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 relative z-10 border-t border-white/5">
                            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-xl w-fit">
                                <Check className="w-3.5 h-3.5 text-teal-400" />
                                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Admin Control Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Searchable Combobox for Store Names
const StoreNameCombobox: React.FC<{ value: string, allProducts: any[], onChange: (val: string, details?: any) => void }> = ({ value, allProducts, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const stores = useMemo(() => {
        const storeMap = new Map();
        allProducts.forEach(p => {
            if (p.custom_store_name && !storeMap.has(p.custom_store_name.toLowerCase())) {
                storeMap.set(p.custom_store_name.toLowerCase(), p);
            }
        });
        return Array.from(storeMap.values());
    }, [allProducts]);

    const filteredStores = useMemo(() => {
        if (!search) return stores;
        return stores.filter(s => s.custom_store_name.toLowerCase().includes(search.toLowerCase()));
    }, [stores, search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    required
                    value={value}
                    onFocus={() => setIsOpen(true)}
                    onChange={e => {
                        const val = e.target.value;
                        setSearch(val);
                        onChange(val);
                    }}
                    placeholder="Contoh: Tamuu Official"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-12 py-5 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                />
                <button 
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 mt-4 bg-[#0F0F0F] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden backdrop-blur-2xl"
                    >
                        <div className="p-4 border-b border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Pilih Store Terdaftar</p>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
                            {filteredStores.length > 0 ? (
                                filteredStores.map((s, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            onChange(s.custom_store_name, s);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all hover:bg-white/5 group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#FFBF00]/30 group-hover:text-[#FFBF00] transition-all">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white group-hover:text-[#FFBF00] transition-colors italic uppercase">{s.custom_store_name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[180px]">
                                                {s.kota || 'Wilayah Umum'}
                                            </p>
                                        </div>
                                        {value === s.custom_store_name && <Check className="ml-auto w-4 h-4 text-[#FFBF00]" />}
                                    </button>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Store tidak ditemukan</p>
                                    <p className="text-[9px] text-slate-700 mt-1 italic">Ketik untuk menambahkan store custom baru</p>
                                </div>
                            )}
                        </div>
                        {search && !stores.some(s => s.custom_store_name.toLowerCase() === search.toLowerCase()) && (
                            <div className="p-2 border-t border-white/5 bg-[#FFBF00]/5">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
                                >
                                    <Plus className="w-4 h-4 text-[#FFBF00]" />
                                    <p className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest">Gunakan "{search}" Sebagai Store Baru</p>
                                </button>
                            </div>
                        )}
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};
