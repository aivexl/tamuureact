import React, { useState, useMemo } from 'react';
import { m } from 'framer-motion';
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    ShoppingBag, 
    Filter, 
    AlertCircle,
    Store,
    MapPin,
    Tag
} from 'lucide-react';
import { useAdminProducts, useAdminDeleteProduct } from '../../hooks/queries/useShop';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';

export const AdminProductManagement: React.FC = () => {
    const [search, setSearch] = useState('');
    
    const { data, isLoading } = useAdminProducts();
    const deleteMutation = useAdminDeleteProduct();

    const products = data?.products || [];
    const diagnostics = data?.diagnostics || {};

    const filteredProducts = useMemo(() => {
        return products.filter((p: any) => 
            p.nama_produk.toLowerCase().includes(search.toLowerCase()) ||
            (p.nama_toko || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.custom_store_name || '').toLowerCase().includes(search.toLowerCase())
        );
    }, [products, search]);

    const handleDelete = async (id: string) => {
        if (!confirm('CRITICAL: You are about to permanently purge this product from the global registry. This action cannot be undone and will affect live storefronts. Continue?')) return;
        
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Product purged from registry');
        } catch (err: any) {
            toast.error(err.message || 'Purge failed');
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><PremiumLoader /></div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Governance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Registry Items</p>
                    <div className="flex items-end gap-3">
                        <h3 className="text-4xl font-black text-[#0A1128]">{diagnostics.total_found || 0}</h3>
                        <span className="text-[10px] font-bold text-teal-500 mb-2 uppercase italic">Verified Data Integrity</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm md:col-span-2 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Governance Authority</p>
                        <p className="text-sm font-bold text-[#0A1128]">{diagnostics.admin_identity || 'Administrator Session'}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Registry Access
                    </div>
                </div>
            </div>

            {/* List Header / Search */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Search global registry (Products, Merchants, Custom Stores)..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0A1128] focus:ring-2 focus:ring-[#FFBF00]/20 transition-all"
                    />
                </div>
                <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#0A1128] transition-all">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Registry Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership / Origin</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Point</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registry Actions</th>
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
                                                <p className="font-black text-[#0A1128] uppercase text-sm leading-tight italic">{product.nama_produk}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                                    <Tag className="w-3 h-3" /> {product.kategori_produk || 'General'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            {product.is_admin_listing ? (
                                                <>
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                                        <AlertCircle className="w-2.5 h-2.5" /> Administrative
                                                    </span>
                                                    <span className="font-bold text-slate-700">{product.custom_store_name || 'Global Shop'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-1">
                                                        <Store className="w-2.5 h-2.5" /> Merchant
                                                    </span>
                                                    <span className="font-bold text-slate-700">{product.nama_toko}</span>
                                                </>
                                            )}
                                        </div>
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
                                            <a 
                                                href={`/shop/${product.merchant_slug || 'admin'}/${product.product_id}`} 
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
                        No entries found in the global registry
                    </div>
                )}
            </div>
        </div>
    );
};
