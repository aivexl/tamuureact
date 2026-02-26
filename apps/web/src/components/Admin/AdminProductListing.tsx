import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    ShoppingBag, 
    Filter, 
    Plus,
    X,
    Save,
    Image as ImageIcon,
    Tag,
    Link as LinkIcon,
    Edit3
} from 'lucide-react';
import { useAdminProducts, useAdminDeleteProduct, useAdminAddProduct, useAdminUpdateProduct } from '../../hooks/queries/useShop';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { INDONESIA_REGIONS } from '../../constants/regions';

export const AdminProductListing: React.FC = () => {
    const [search, setSearch] = useState('');
    const [isAdding, setIsLocationOpen] = useState(false); // Modal state
    const [editingProduct, setEditingProduct] = useState<any>(null);
    
    const { data, isLoading } = useAdminProducts();
    const deleteMutation = useAdminDeleteProduct();
    const addMutation = useAdminAddProduct();
    const updateMutation = useAdminUpdateProduct();

    const products = data?.products || [];

    const filteredProducts = useMemo(() => {
        // ONLY show Admin listings here
        return products.filter((p: any) => 
            p.is_admin_listing === 1 && (
                p.nama_produk.toLowerCase().includes(search.toLowerCase()) ||
                (p.custom_store_name || '').toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [products, search]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently purge this listing?')) return;
        
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Listing purged successfully');
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
            setIsLocationOpen(false);
            setEditingProduct(null);
        } catch (err: any) {
            toast.error(err.message || 'Save failed');
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><PremiumLoader /></div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-[#0A1128] uppercase italic tracking-tighter">Global Product Listings</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin-posted products with custom branding</p>
                </div>
                <button 
                    onClick={() => { setEditingProduct(null); setIsLocationOpen(true); }}
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
                        placeholder="Search your listings..." 
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
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{product.kategori_produk || 'General'}</p>
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
                                                onClick={() => { setEditingProduct(product); setIsLocationOpen(true); }}
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
                                                onClick={() => handleDelete(product.product_id)}
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

            {/* Modal Form */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <m.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsLocationOpen(false); setEditingProduct(null); }}
                            className="absolute inset-0 bg-[#0A1128]/60 backdrop-blur-sm"
                        />
                        <m.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl relative z-10 flex flex-col"
                        >
                            <ProductForm 
                                product={editingProduct} 
                                onSave={handleSave} 
                                onClose={() => { setIsLocationOpen(false); setEditingProduct(null); }} 
                            />
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductForm: React.FC<{ product?: any, onSave: (data: any) => void, onClose: () => void }> = ({ product, onSave, onClose }) => {
    const isEdit = !!product;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_produk: product?.nama_produk || '',
        deskripsi: product?.deskripsi || '',
        harga_estimasi: product?.harga_estimasi || '',
        status: product?.status || 'PUBLISHED',
        kategori_produk: product?.kategori_produk || '',
        kota: product?.kota || '',
        custom_store_name: product?.custom_store_name || '',
        is_admin_listing: 1, // Forced for this component
        images: product?.images?.map((img: any) => img.image_url) || [],
        tokopedia_url: product?.tokopedia_url || '',
        shopee_url: product?.shopee_url || '',
        website_url: product?.website_url || '',
        tiktok_url: product?.tiktok_url || '',
        youtube_url: product?.youtube_url || '',
        x_url: product?.x_url || ''
    });

    const [newImageUrl, setNewImageUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-black text-[#0A1128] uppercase italic tracking-tighter">
                        {isEdit ? 'Edit Admin Listing' : 'New Admin Listing'}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Global Posting</p>
                </div>
                <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Core Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><Tag className="w-4 h-4" /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Name</label>
                            <input 
                                type="text"
                                required
                                value={formData.nama_produk}
                                onChange={e => setFormData({...formData, nama_produk: e.target.value})}
                                placeholder="Enter product name..."
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Custom Store Name</label>
                            <input 
                                type="text"
                                required
                                value={formData.custom_store_name}
                                onChange={e => setFormData({...formData, custom_store_name: e.target.value})}
                                placeholder="e.g. Official Partner"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Estimated Price</label>
                        <input 
                            type="text"
                            value={formData.harga_estimasi}
                            onChange={e => setFormData({...formData, harga_estimasi: e.target.value})}
                            placeholder="Rp 1.000.000"
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                        <input 
                            type="text"
                            value={formData.kategori_produk}
                            onChange={e => setFormData({...formData, kategori_produk: e.target.value})}
                            placeholder="e.g. Catering"
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">City/Location</label>
                        <select
                            value={formData.kota}
                            onChange={e => setFormData({...formData, kota: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all appearance-none"
                        >
                            <option value="">Select City</option>
                            {INDONESIA_REGIONS.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Description</label>
                    <textarea 
                        rows={4}
                        value={formData.deskripsi}
                        onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all resize-none"
                        placeholder="Detailed specifications..."
                    />
                </div>

                {/* Marketplace Links */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center"><LinkIcon className="w-4 h-4" /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Marketplace Ecosystem</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tokopedia URL</label>
                            <input type="text" value={formData.tokopedia_url} onChange={e => setFormData({...formData, tokopedia_url: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Shopee URL</label>
                            <input type="text" value={formData.shopee_url} onChange={e => setFormData({...formData, shopee_url: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128]" />
                        </div>
                    </div>
                </div>

                {/* Image Registry */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Visual Assets</h3>
                    </div>
                    
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                        />
                        <button 
                            type="button"
                            onClick={() => {
                                if (newImageUrl) {
                                    setFormData({...formData, images: [...formData.images, newImageUrl]});
                                    setNewImageUrl('');
                                }
                            }}
                            className="px-6 py-4 bg-[#0A1128] text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >Add</button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                        {formData.images.map((url: string, idx: number) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                                <img src={url} className="w-full h-full object-cover" alt="" />
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, images: formData.images.filter((_: string, i: number) => i !== idx)})}
                                    className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-50 flex justify-end gap-4 shrink-0 bg-slate-50/30">
                <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-[#0A1128] transition-all">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#0A1128] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#0A1128]/10 hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Processing...' : (isEdit ? 'Update Listing' : 'Post to Global Shop')}
                </button>
            </div>
        </form>
    );
};
