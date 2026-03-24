import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { 
    Zap, Search, Filter, CheckCircle2, XCircle, 
    Clock, Eye, MousePointerClick, TrendingUp, 
    ExternalLink, AlertCircle, ShoppingBag, 
    Calendar, MoreVertical, ShieldCheck, ChevronRight,
    X
} from 'lucide-react';
import { useAdminAdCampaigns, useApproveAdCampaign, useProductDetails } from '../../hooks/queries/useShop';
import { formatCurrency, formatDateFull } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const AdProductPreview = ({ productId }: { productId: string }) => {
    const { data: product, isLoading } = useProductDetails(productId);

    if (isLoading) return <div className="animate-pulse text-[10px] font-bold text-slate-500 uppercase tracking-widest">Memuat Detail Produk...</div>;
    if (!product) return <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Gagal Memuat Produk</div>;

    const mainImage = product.images?.[0]?.image_url || product.logo_url;

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center w-full">
            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 mb-4 overflow-hidden shadow-xl">
                {mainImage ? (
                    <img src={mainImage} alt={product.nama_produk} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-slate-700" />
                    </div>
                )}
            </div>
            <div className="space-y-1 max-w-[280px]">
                <div className="text-sm font-bold text-white truncate px-4">{product.nama_produk}</div>
                <div className="text-xs font-bold text-teal-400">{formatCurrency(product.harga_estimasi)}</div>
            </div>
            <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Menggunakan Kartu Produk Standar
            </div>
        </div>
    );
};

export const AdminAdsPage: React.FC = () => {
    const { data: campaignsRes, isLoading } = useAdminAdCampaigns();
    const campaigns = campaignsRes?.campaigns || [];
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    const approveMutation = useApproveAdCampaign();

    const handleApprove = async (id: string) => {
        try {
            await approveMutation.mutateAsync({ id, is_approved: 1 });
            setSelectedCampaign(null);
        } catch (err) {}
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            await approveMutation.mutateAsync({ id, is_approved: 2, rejection_reason: reason });
            setSelectedCampaign(null);
        } catch (err) {}
    };

    const filteredCampaigns = campaigns.filter((c: any) => {
        const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             c.vendor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             c.nama_toko?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-10 px-4 md:px-0">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Persetujuan Iklan</h1>
                        <p className="text-slate-500 text-sm font-medium">Tinjau dan setujui kampanye iklan dari vendor.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Cari vendor atau iklan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 w-full sm:w-64 transition-all"
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-sm text-white focus:outline-none appearance-none font-bold cursor-pointer"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="PENDING">Menunggu</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="DRAFT">Draft</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                    </div>
                </header>

                {/* Table Area */}
                <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Iklan & Vendor</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penempatan</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Bid & Saldo</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-teal-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 text-sm">
                                            Tidak ada kampanye iklan ditemukan.
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                                    {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 text-slate-600" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-white truncate">{c.title || 'Tanpa Judul'}</div>
                                                    <div className="text-[10px] font-medium text-slate-500 truncate">{c.nama_toko} • {c.vendor_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[8px] font-bold uppercase tracking-widest inline-block">
                                                {c.position?.replace(/_/g, ' ')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-bold text-white">{formatCurrency(c.bid_amount)} / klik</div>
                                            <div className="flex flex-col items-end gap-0.5">
                                                <div className="text-[9px] font-bold text-teal-400 uppercase tracking-tighter">Sisa Ad: {formatCurrency(c.budget_remaining)}</div>
                                                <div className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter">Saldo Vendor: {formatCurrency(c.ad_balance)}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => setSelectedCampaign(c)}
                                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95 ${c.status === 'PENDING' ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20 hover:bg-teal-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {c.status === 'PENDING' ? 'Tinjau' : 'Detail'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {selectedCampaign && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <m.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedCampaign(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <m.div 
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="relative w-full max-w-lg bg-[#111] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white tracking-tight">Detail Kampanye</h2>
                                <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aset Visual</label>
                                    <div className="w-full min-h-[12rem] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                                        {selectedCampaign.image_url ? (
                                            <img src={selectedCampaign.image_url} className="w-full h-full object-cover" />
                                        ) : selectedCampaign.target_type === 'PRODUCT' && selectedCampaign.target_id ? (
                                            <AdProductPreview productId={selectedCampaign.target_id} />
                                        ) : (
                                            <div className="text-center space-y-2 text-slate-600">
                                                <ShoppingBag className="w-8 h-8 mx-auto" />
                                                <div className="text-[10px] font-bold uppercase tracking-widest">Menggunakan Kartu Produk Standar</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <DetailItem label="Vendor" value={selectedCampaign.nama_toko} />
                                    <DetailItem label="Posisi Iklan" value={selectedCampaign.position?.replace(/_/g, ' ')} />
                                    <DetailItem label="Nilai Bid" value={`${formatCurrency(selectedCampaign.bid_amount)} / klik`} />
                                    <DetailItem label="Sisa Saldo Ad" value={formatCurrency(selectedCampaign.budget_remaining)} />
                                    <DetailItem label="Saldo Global Vendor" value={formatCurrency(selectedCampaign.ad_balance)} />
                                    {selectedCampaign.target_type === 'PRODUCT' && (
                                        <>
                                            <DetailItem 
                                                label="ID Produk" 
                                                value={selectedCampaign.target_id ? `tamuu-shop-${selectedCampaign.target_id.substring(0, 8).toUpperCase()}` : '-'} 
                                            />
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Link Produk</span>
                                                <a 
                                                    href={`/shop/product/${selectedCampaign.target_id}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold text-teal-400 flex items-center gap-1.5 hover:text-teal-300 transition-colors uppercase tracking-widest"
                                                >
                                                    Buka di Shop <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="p-5 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-teal-400 mt-0.5" />
                                    <p className="text-xs text-slate-400 leading-relaxed italic">
                                        Pastikan aset visual dan konten produk tidak melanggar aturan komunitas Tamuu sebelum memberikan otorisasi.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-3">
                                {selectedCampaign.status === 'PENDING' && (
                                    <>
                                        <button 
                                            onClick={() => handleReject(selectedCampaign.id, 'Konten tidak memenuhi standar kualitas')}
                                            className="flex-1 py-4 rounded-xl border border-rose-500/30 text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                                        >
                                            Tolak Iklan
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(selectedCampaign.id)}
                                            className="flex-1 py-4 rounded-xl bg-teal-500 text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-teal-400 transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                                        >
                                            Setujui Iklan
                                        </button>
                                    </>
                                )}
                                {selectedCampaign.status !== 'PENDING' && (
                                    <button 
                                        onClick={() => setSelectedCampaign(null)}
                                        className="w-full py-4 rounded-xl bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Tutup
                                    </button>
                                )}
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        'ACTIVE': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'PAUSED': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'PENDING': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        'DRAFT': 'bg-white/5 text-slate-500 border-white/5',
        'REJECTED': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        'COMPLETED': 'bg-white/10 text-white border-white/20',
    };
    return (
        <span className={`px-2 py-1 rounded-md border ${config[status] || config.PENDING} text-[8px] font-bold uppercase tracking-widest inline-block`}>
            {status}
        </span>
    );
};

const DetailItem = ({ label, value }: any) => (
    <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className="text-sm font-bold text-white truncate">{value}</div>
    </div>
);
