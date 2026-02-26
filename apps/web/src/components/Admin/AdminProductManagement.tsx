import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    ShoppingBag, 
    Store, 
    Filter, 
    MoreVertical, 
    AlertCircle,
    ShieldAlert,
    Package,
    MapPin,
    Tag,
    Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { useAdminProducts, useAdminDeleteProduct } from '../../hooks/queries/useShop';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store/useStore';

export const AdminProductManagement: React.FC = () => {
    const user = useStore((s: any) => s.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
    
    // Explicitly destructure diagnostics from the query response
    const { data, isLoading, isError, error } = useAdminProducts() as any;
    const deleteMutation = useAdminDeleteProduct();
    
    // Extract products and diagnostics safely
    const products = Array.isArray(data) ? data : (data?.products || []);
    const diagnostics = data?.diagnostics || null;

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        
        return products.filter((p: any) => {
            const safeName = (p.nama_produk || '').toLowerCase();
            const safeStore = (p.nama_toko || '').toLowerCase();
            const safeId = (p.id || '').toString();
            const safeSearch = searchQuery.toLowerCase();

            const matchesSearch = 
                safeName.includes(safeSearch) ||
                safeStore.includes(safeSearch) ||
                safeId.includes(safeSearch);
            
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [products, searchQuery, statusFilter]);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you absolutely sure you want to PURGE "${name}"? This action is permanent and will remove all associated media.`)) return;
        
        const toastId = toast.loading(`Purging ${name}...`);
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Product purged successfully', { id: toastId });
        } catch (error: any) {
            toast.error(error.message || 'Purge failed', { id: toastId });
        }
    };

    if (isLoading) return (
        <div className="py-24 flex flex-col items-center justify-center">
            <PremiumLoader color="#FFBF00" />
            <p className="mt-6 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Accessing Global Registry...</p>
        </div>
    );

    if (isError) return (
        <div className="py-24 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-white font-bold">Failed to load product registry</h3>
            <p className="text-slate-500 text-sm mt-2">{error?.message || 'Verify your administrative credentials or check server connectivity.'}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-32">
            {/* Diagnostic Alert (Only show if empty or for debugging) */}
            {products.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[32px] flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                        <h4 className="text-amber-500 font-bold text-sm">Registry Diagnostic Notice</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                            Server reported <span className="text-white">{diagnostics?.total_found || 0}</span> raw records. 
                            Active Admin: <span className="text-white">{diagnostics?.admin_identity || 'Unidentified'}</span>. 
                            <br />
                            User: <span className="text-white font-mono">{user?.email || 'None'}</span> (<span className="text-slate-500">{user?.id || 'No ID'}</span>)
                            <br />
                            Tables in DB: <span className="text-amber-200/70">{diagnostics?.table_names?.join(', ') || 'None reported'}</span>
                            <br />
                            If count &gt; 0 but list is empty, a frontend rendering regression is present.
                        </p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Registry', value: products.length, icon: Package, color: 'text-teal-500' },
                    { label: 'Live Listings', value: products.filter((p: any) => p.status === 'PUBLISHED').length, icon: ShoppingBag, color: 'text-[#FFBF00]' },
                    { label: 'Draft Assets', value: products.filter((p: any) => p.status === 'DRAFT').length, icon: Tag, color: 'text-slate-400' },
                ].map((stat, i) => (
                    <m.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-[#0A1128] border border-white/5 p-6 rounded-[32px] flex items-center gap-6"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </m.div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#0A1128] p-4 rounded-[2.5rem] border border-white/5">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by product, store, or registry ID..."
                        className="w-full bg-white/[0.02] border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#FFBF00]/40 transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
                        {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    statusFilter === s ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-[#0A1128] border border-white/5 rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Info</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Merchant</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Price / Region</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((prod: any) => (
                                    <m.tr 
                                        layout
                                        key={prod.id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] overflow-hidden flex-shrink-0">
                                                    {prod.images?.[0] ? (
                                                        <img src={prod.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-white truncate italic">{prod.nama_produk}</p>
                                                    <p className="text-[10px] text-slate-600 font-bold truncate mt-0.5">ID: {prod.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Store className="w-3.5 h-3.5 text-[#FFBF00] opacity-50" />
                                                <span className="text-xs font-bold text-slate-300">{prod.nama_toko}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-600 uppercase tracking-tight mt-1">/{prod.merchant_slug}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {prod.status === 'PUBLISHED' ? (
                                                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest border border-teal-500/20">LIVE</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5">DRAFT</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-white">{formatCurrency(prod.harga_estimasi || 0)}</p>
                                            <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{prod.kota || 'Global'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a 
                                                    href={`https://tamuu.id/shop/${prod.merchant_slug}`} 
                                                    target="_blank" rel="noreferrer"
                                                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-[#FFBF00] transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button 
                                                    onClick={() => handleDelete(prod.id, prod.nama_produk)}
                                                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </m.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    
                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-slate-700" />
                            </div>
                            <p className="text-slate-500 font-bold">No products matching your search criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Diagnostic Footer */}
            <div className="flex items-center justify-between px-8 py-4 bg-white/[0.01] rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        Registry Latency: Stable
                    </span>
                </div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    Enterprise Asset Governance v1.0
                </p>
            </div>
        </div>
    );
};

const ImageIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
