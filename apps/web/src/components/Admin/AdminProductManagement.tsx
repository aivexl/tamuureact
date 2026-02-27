import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Trash2, 
    ExternalLink, 
    ShoppingBag, 
    Filter, 
    AlertCircle,
    Store,
    MapPin,
    Tag,
    ShieldCheck,
    Database,
    Zap,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Clock
} from 'lucide-react';
import { useAdminProducts, useAdminDeleteProduct, useAdminApproveProduct } from '../../hooks/queries/useShop';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { ConfirmationModal } from '../Modals/ConfirmationModal';

export const AdminProductManagement: React.FC = () => {
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    
    const { data, isLoading } = useAdminProducts();
    const deleteMutation = useAdminDeleteProduct();
    const approveMutation = useAdminApproveProduct();

    const products = data?.products || [];
    const diagnostics = data?.diagnostics || {};

    const filteredProducts = useMemo(() => {
        return products.filter((p: any) => {
            const productNo = `tamuu-shop-${p.product_id?.substring(0, 8).toUpperCase()}`;
            const searchLower = search.toLowerCase();
            
            return p.nama_produk.toLowerCase().includes(searchLower) ||
                (p.nama_toko || '').toLowerCase().includes(searchLower) ||
                (p.custom_store_name || '').toLowerCase().includes(searchLower) ||
                productNo.toLowerCase().includes(searchLower) ||
                p.product_id.toLowerCase().includes(searchLower);
        });
    }, [products, search]);

    const handleDelete = async () => {
        if (!deleteId) return;
        
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Product purged from registry');
            setDeleteId(null);
        } catch (err: any) {
            toast.error(err.message || 'Purge failed');
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveMutation.mutateAsync({ id, is_approved: 1 });
            toast.success('Product approved and live');
        } catch (err: any) {
            toast.error(err.message || 'Approval failed');
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        
        try {
            await approveMutation.mutateAsync({ 
                id: rejectId, 
                is_approved: 2, 
                rejection_reason: rejectionReason || undefined
            });
            toast.success('Product rejected and user notified');
            setRejectId(null);
            setRejectionReason('');
        } catch (err: any) {
            toast.error(err.message || 'Rejection failed');
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><PremiumLoader /></div>;

    return (
        <div className="space-y-10 pb-20">
            {/* Governance Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#FFBF00]/10 transition-all duration-500" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#FFBF00]/10 rounded-lg text-[#FFBF00]">
                            <Database className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Produk</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <h3 className="text-5xl font-black text-white tracking-tighter italic">{diagnostics.total_found || 0}</h3>
                        <span className="text-[10px] font-bold text-[#FFBF00] mb-2 uppercase italic tracking-widest">Database</span>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-indigo-500/10 transition-all duration-500" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sesi Administrator</p>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{diagnostics.admin_identity || 'Admin'}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Akses Level 4</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                            <Zap className="w-4 h-4 text-teal-400 animate-pulse" />
                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Sistem Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Header / Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Cari berdasarkan nama produk, toko, atau ID..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold text-white focus:ring-2 focus:ring-[#FFBF00]/50 focus:bg-white/10 transition-all backdrop-blur-md"
                    />
                </div>
                <button className="p-5 bg-white/5 border border-white/10 rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md">
                    <Filter className="w-6 h-6" />
                </button>
            </div>

            {/* Registry Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Detail Produk</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Nama Toko</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Harga</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Visibility</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredProducts.map((product: any) => (
                                <tr key={product.product_id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 shadow-inner group-hover:border-[#FFBF00]/30 transition-colors">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0].image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <ShoppingBag className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase text-sm leading-tight tracking-tight italic group-hover:text-[#FFBF00] transition-colors">{product.nama_produk}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                        <Tag className="w-3 h-3" /> {product.kategori_produk || 'Umum'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                        No. Produk: tamuu-shop-{product.product_id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1.5">
                                            {product.is_admin_listing ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                        <div className="w-1 h-1 rounded-full bg-indigo-400" /> Administrative
                                                    </span>
                                                    <span className="font-bold text-slate-300 text-xs uppercase tracking-tight italic">{product.custom_store_name || 'Global Shop'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                        <div className="w-1 h-1 rounded-full bg-teal-400" /> Merchant Asset
                                                    </span>
                                                    <span className="font-bold text-slate-300 text-xs uppercase tracking-tight italic">{product.nama_toko}</span>
                                                </div>
                                            )}
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
                                        <div className="flex items-center">
                                            {product.status === 'PUBLISHED' ? (
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                                    Live
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            {product.status === 'DRAFT' ? (
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">N/A</span>
                                            ) : product.is_approved === 1 ? (
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)] flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            ) : product.is_approved === 2 ? (
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                                                    <XCircle className="w-3 h-3" /> Rejected
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> Pending Review
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            {product.is_approved !== 1 && (
                                                <button 
                                                    onClick={() => handleApprove(product.product_id)}
                                                    className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 hover:bg-teal-500/20 transition-all shadow-lg"
                                                    title="Approve Product"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {product.is_approved !== 2 && !product.is_admin_listing && (
                                                <button 
                                                    onClick={() => setRejectId(product.product_id)}
                                                    className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all shadow-lg"
                                                    title="Reject Product"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <a 
                                                href={`/shop/${product.merchant_slug === 'admin' ? 'umum' : (product.merchant_slug || 'umum')}/${product.slug || product.product_id}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-[#FFBF00] hover:bg-[#FFBF00]/5 transition-all shadow-lg"
                                                title="External View"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button 
                                                onClick={() => setDeleteId(product.product_id)}
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all shadow-lg"
                                                title="Purge from Registry"
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
                    <div className="py-32 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
                            <Database className="w-10 h-10 text-slate-700" />
                        </div>
                        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Registry Archive Empty</p>
                        <p className="text-xs text-slate-600 mt-4 tracking-widest">Global data synchronization complete</p>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            <AnimatePresence>
                {rejectId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                        <m.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Reject Product</h3>
                            </div>

                            <div className="space-y-6">
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    Optional: Provide a reason for rejecting this product. This will be sent to the merchant.
                                </p>

                                <div className="relative group">
                                    <MessageSquare className="absolute left-5 top-5 w-5 h-5 text-slate-500 group-focus-within:text-[#FFBF00] transition-colors" />
                                    <textarea 
                                        placeholder="e.g., Image quality too low, misleading description... (Optional)"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold text-white min-h-[150px] focus:ring-2 focus:ring-[#FFBF00]/50 transition-all placeholder:text-slate-600 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button 
                                        onClick={() => {
                                            setRejectId(null);
                                            setRejectionReason('');
                                        }}
                                        className="py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleReject}
                                        disabled={approveMutation.isPending}
                                        className="py-4 bg-rose-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_10px_20px_rgba(244,63,94,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {approveMutation.isPending ? <Clock className="w-4 h-4 animate-spin" /> : 'Reject Product'}
                                    </button>
                                </div>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="CRITICAL: Permanent Purge?"
                message="You are about to execute a high-level registry purge. This will permanently remove the asset from the global ecosystem. This action is tracked and irreversible."
                confirmText="Execute Purge"
                cancelText="Abort"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};
