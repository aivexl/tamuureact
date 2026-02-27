import React from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { useAdminShopReports, useUpdateReportStatus } from '../../hooks/queries/useShop';
import { useSEO } from '../../hooks/useSEO';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { Clock, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export const AdminReportsPage: React.FC = () => {
    useSEO({
        title: 'Laporan Produk | Tamuu Admin',
        description: 'Moderasi laporan produk dari pengguna.'
    });

    const { data: reports = [], isLoading } = useAdminShopReports();
    const updateStatus = useUpdateReportStatus();

    const handleResolve = async (id: string) => {
        await updateStatus.mutateAsync({ reportId: id, status: 'RESOLVED' });
    };

    return (
        <AdminLayout>
            <div className="w-full h-full max-w-[1600px] mx-auto py-4 px-6">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase block">Laporan <span className="text-rose-500">Produk</span></h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] mt-3 block text-[10px]">Moderasi & Keamanan Marketplace</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><PremiumLoader /></div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Detail Produk</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Kategori Laporan</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Pelapor</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Waktu</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {reports.map((report: any) => (
                                        <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div>
                                                    <p className="font-black text-white uppercase text-sm leading-tight tracking-tight italic">{report.nama_produk}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Toko: {report.nama_toko}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest w-fit">
                                                        {report.category}
                                                    </span>
                                                    {report.reason && (
                                                        <p className="text-[10px] text-slate-400 italic line-clamp-2 max-w-xs">"{report.reason}"</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-xs font-bold text-slate-300">{report.reporter_email || 'Anonim'}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {format(new Date(report.created_at), 'dd MMM yyyy, HH:mm')}
                                                </p>
                                            </td>
                                            <td className="px-10 py-8">
                                                {report.status === 'PENDING' ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest w-fit">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-black uppercase tracking-widest w-fit">
                                                        <CheckCircle2 className="w-3 h-3" /> Resolved
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <a 
                                                        href={`/shop/${report.merchant_slug}/${report.product_slug || report.product_id}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-[#FFBF00] hover:bg-[#FFBF00]/5 transition-all shadow-lg"
                                                        title="Lihat Produk"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    {report.status === 'PENDING' && (
                                                        <button 
                                                            onClick={() => handleResolve(report.id)}
                                                            className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 hover:bg-teal-500/20 transition-all shadow-lg"
                                                            title="Tandai Selesai"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-slate-500 uppercase tracking-widest text-xs font-black">
                                                Tidak ada laporan produk saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminReportsPage;
