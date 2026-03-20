import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useVendorProfile, useAdCampaigns, useUpdateAdCampaign } from '../../hooks/queries/useShop';
import { 
    Plus, Wallet, BarChart3, 
    Pause, Play, AlertCircle, CheckCircle2,
    Clock, Archive, ArrowUpRight, Search,
    Edit3, Trash2
} from 'lucide-react';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { AdCampaignWizard } from './AdCampaignWizard';
import { usePayment } from '../../hooks/usePayment';
import { shop } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const VendorAds: React.FC = () => {
    const { user, showModal } = useStore();
    const queryClient = useQueryClient();
    const { data: vendorData, isLoading: isVendorLoading } = useVendorProfile(user?.id);
    const vendor = vendorData?.vendor;
    const globalBalance = vendor?.ad_balance || 0;
    
    const { data: campaignsRes, isLoading: isAdsLoading } = useAdCampaigns(vendor?.id);
    const campaigns = campaignsRes?.campaigns || [];
    
    const updateCampaign = useUpdateAdCampaign();
    const { processAdPayment } = usePayment();

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<any>(null);
    const [topupTarget, setTopupModal] = useState<{ id: string, title: string } | null>(null);
    const [topupAmount, setTopupAmount] = useState(50000);

    const handleTopup = async () => {
        if (!topupTarget || !user) return;
        try {
            await processAdPayment({
                userId: user.id,
                email: user.email,
                name: user.name || 'Vendor',
                tier: `AD_TOPUP:${topupTarget.id === 'global' ? (campaigns[0]?.id || 'global') : topupTarget.id}`,
                amount: topupAmount
            });
            setTopupModal(null);
        } catch (err: any) {
            toast.error(err.message || 'Gagal memproses pembayaran');
        }
    };

    const handleEdit = (campaign: any) => {
        setEditingCampaign(campaign);
        setIsWizardOpen(true);
    };

    const handleToggleStatus = async (campaign: any) => {
        const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        const newIsActive = newStatus === 'ACTIVE' ? 1 : 0;
        try {
            await updateCampaign.mutateAsync({ 
                id: campaign.id, 
                data: { status: newStatus, is_active: newIsActive } 
            });
            toast.success(newStatus === 'ACTIVE' ? 'Iklan diaktifkan' : 'Iklan dijeda');
        } catch (err) {
            toast.error('Gagal memperbarui status');
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        showModal({
            title: 'Hapus Iklan?',
            message: 'Apakah Anda yakin ingin menghapus kampanye iklan ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            onConfirm: async () => {
                try {
                    await shop.deleteAdCampaign(id);
                    toast.success('Iklan berhasil dihapus');
                    queryClient.invalidateQueries({ queryKey: ['ad_campaigns', vendor?.id] });
                } catch (err) {
                    toast.error('Gagal menghapus iklan');
                }
            }
        });
    };

    if (isVendorLoading || isAdsLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <div className="px-4 md:px-12 py-10 max-w-7xl mx-auto w-full space-y-12 pb-32">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Iklan & Promosi</h1>
                        <p className="text-slate-500 text-sm font-medium">Kelola jangkauan produk Anda di pasar Tamuu.</p>
                    </div>

                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 flex items-center gap-2 transition-all active:scale-95 hover:bg-black"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Iklan Baru
                    </button>
                </header>

                {/* SUMMARY CARD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
                                <Wallet className="w-5 h-5 text-[#FFBF00]" />
                            </div>
                            <button 
                                onClick={() => setTopupModal({ id: 'global', title: 'Saldo Iklan' })}
                                className="px-4 py-2 bg-[#FFBF00] text-[#0A1128] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#FFD700] transition-all active:scale-95 shadow-lg shadow-[#FFBF00]/20"
                            >
                                Top Up
                            </button>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Saldo Iklan</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{formatCurrency(globalBalance)}</h3>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <BarChart3 className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Klik Iklan</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {formatAbbreviatedNumber(campaigns.reduce((sum: number, c: any) => sum + (c.total_clicks || 0), 0))}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <ArrowUpRight className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Tayangan</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {formatAbbreviatedNumber(campaigns.reduce((sum: number, c: any) => sum + (c.total_impressions || 0), 0))}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* CAMPAIGNS TABLE */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-900">Daftar Iklan</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Terupdate otomatis</span>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Kampanye</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Posisi</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Statistik</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Bid</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Kelola</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {campaigns.map((c: any) => (
                                        <CampaignTableRow 
                                            key={c.id} 
                                            campaign={c} 
                                            onEdit={() => handleEdit(c)}
                                            onToggle={() => handleToggleStatus(c)} 
                                            onDelete={() => handleDeleteCampaign(c.id)}
                                        />
                                    ))}
                                    {campaigns.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="max-w-xs mx-auto space-y-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
                                                        <Plus className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900">Belum ada iklan</p>
                                                    <p className="text-xs text-slate-400">Mulai promosikan produk Anda untuk menjangkau lebih banyak pelanggan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {/* MODALS */}
            <AdCampaignWizard 
                isOpen={isWizardOpen} 
                onClose={() => { setIsWizardOpen(false); setEditingCampaign(null); }} 
                vendorId={vendor?.id || ''} 
                initialData={editingCampaign}
            />

            {/* TOPUP MODAL */}
            <AnimatePresence>
                {topupTarget && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <m.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setTopupModal(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <m.div 
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
                        >
                            <div className="text-center space-y-3">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tambah Saldo Iklan</h2>
                                <p className="text-xs text-slate-500 font-medium">Dana akan masuk ke saldo global vendor.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-2">
                                    {[10000, 50000, 100000, 250000].map(amt => (
                                        <button 
                                            key={amt} 
                                            onClick={() => setTopupAmount(amt)}
                                            className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${topupAmount === amt ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            {formatAbbreviatedNumber(amt)}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 font-bold text-sm">Rp</div>
                                    <input 
                                        type="number"
                                        value={topupAmount}
                                        onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-100 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-900"
                                    />
                                </div>

                                <button
                                    onClick={handleTopup}
                                    className="w-full py-4 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-95 hover:bg-black"
                                >
                                    Bayar Sekarang
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CampaignTableRow = ({ campaign, onToggle, onDelete, onEdit }: any) => {
    const statusConfig: any = {
        'ACTIVE': { bg: 'bg-emerald-50 text-emerald-600', label: 'Aktif', icon: Play },
        'PAUSED': { bg: 'bg-amber-50 text-amber-600', label: 'Dijeda', icon: Pause },
        'PENDING': { bg: 'bg-slate-50 text-slate-500', label: 'Ditinjau', icon: Clock },
        'DRAFT': { bg: 'bg-slate-100 text-slate-400', label: 'Draft', icon: Archive },
        'REJECTED': { bg: 'bg-rose-50 text-rose-600', label: 'Ditolak', icon: AlertCircle },
        'COMPLETED': { bg: 'bg-slate-900 text-white', label: 'Selesai', icon: CheckCircle2 },
    };

    const config = statusConfig[campaign.status] || statusConfig.PENDING;

    return (
        <tr className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {(campaign.thumbnail_url || campaign.image_url) && (
                            <img src={campaign.thumbnail_url || campaign.image_url} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{campaign.title || 'Tanpa Judul'}</div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">ID: {campaign.id.substring(0,8)}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                    {campaign.position?.replace(/_/g, ' ')}
                </span>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="text-xs font-bold text-slate-900">{formatAbbreviatedNumber(campaign.total_clicks || 0)} Klik</div>
                <div className="text-[10px] text-slate-400">{formatAbbreviatedNumber(campaign.total_impressions || 0)} Dilihat</div>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="text-xs font-bold text-slate-900">{formatCurrency(campaign.bid_amount)} / Klik</div>
            </td>
            <td className="px-6 py-5 text-center">
                <div className={`px-2 py-1 rounded-lg ${config.bg} text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5`}>
                    <config.icon className="w-3 h-3" />
                    {config.label}
                </div>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={onEdit}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        title="Edit Iklan"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onDelete}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                        title="Hapus Iklan"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {(campaign.status === 'ACTIVE' || campaign.status === 'PAUSED') && (
                        <button 
                            onClick={onToggle}
                            className={`p-2 rounded-lg border transition-all shadow-sm ${campaign.status === 'ACTIVE' ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
                            title={campaign.status === 'ACTIVE' ? 'Jeda Iklan' : 'Aktifkan Iklan'}
                        >
                            {campaign.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};
