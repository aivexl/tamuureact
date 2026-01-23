import React from 'react';
import { m } from 'framer-motion';
import { useTransactions } from '@/hooks/queries/useBilling';
import { useStore } from '@/store/useStore';
import { billing as billingApi } from '@/lib/api';
import { formatDateFull } from '@/lib/utils';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import {
    FileText,
    Download,
    ExternalLink,
    CreditCard,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Transaction {
    id: string;
    external_id: string;
    created_at: string;
    tier: string;
    amount: number;
    status: string;
    payment_url?: string;
    payment_channel?: string;
}

export const BillingHistoryTab: React.FC = () => {
    const { user, showModal } = useStore();
    const { data: transactions = [], isLoading, refetch } = useTransactions(user?.id);

    const handleCancel = async (orderId: string) => {
        showModal({
            title: 'Membatalkan Pesanan?',
            message: 'Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            confirmText: 'Ya, Batalkan',
            cancelText: 'Tetap Simpan',
            onConfirm: () => confirmCancel(orderId)
        });
    };

    const confirmCancel = async (orderId: string) => {
        if (!user?.id) return;
        try {
            const res = await billingApi.cancelTransaction(orderId, user.id);
            if (res.success) {
                showModal({
                    title: 'Dibatalkan',
                    message: 'Pesanan Anda telah berhasil dibatalkan.',
                    type: 'success'
                });
            } else {
                showModal({
                    title: 'Gagal',
                    message: res.error || "Gagal membatalkan pesanan",
                    type: 'error'
                });
            }
        } catch (err) {
            console.error("Cancel error:", err);
            showModal({
                title: 'Kesalahan',
                message: 'Terjadi kesalahan saat membatalkan pesanan.',
                type: 'error'
            });
        } finally {
            refetch();
        }
    };

    const handleDownloadReceipt = async (tx: Transaction) => {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = "800px";
        container.style.background = "white";
        container.style.padding = "60px";
        container.style.fontFamily = "Inter, sans-serif";

        const statusLabel =
            tx.status === "PAID"
                ? "LUNAS"
                : tx.status === "EXPIRED"
                    ? "KADALUWARSA"
                    : "DIBATALKAN";
        const statusColor =
            tx.status === "PAID"
                ? "#10b981"
                : tx.status === "EXPIRED"
                    ? "#f59e0b"
                    : "#ef4444";

        container.innerHTML = `
            <div style="border: 2px solid #f1f5f9; padding: 40px; border-radius: 24px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120px; font-weight: 900; color: ${statusColor}15; pointer-events: none; z-index: 0; white-space: nowrap;">
                    ${statusLabel}
                </div>
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px;">
                        <div>
                            <h1 style="font-size: 32px; font-weight: 900; color: #0A1128; margin: 0;">TAMUU</h1>
                            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Premium Digital Invitations</p>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="font-size: 18px; font-weight: 800; color: #0A1128; margin: 0;">STRUK TRANSAKSI</h2>
                            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px; font-family: monospace;">#${tx.external_id}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 30px 0;">
                        <div>
                            <p style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0 0 10px 0;">Informasi Pelanggan</p>
                            <p style="font-size: 14px; font-weight: 700; color: #0A1128; margin: 0 0 5px 0;">${user?.name || "User Tamuu"}</p>
                            <p style="font-size: 14px; color: #64748b; margin: 0;">${user?.email}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0 0 10px 0;">Detail Pembayaran</p>
                            <p style="font-size: 14px; color: #64748b; margin: 0 0 5px 0;">Waktu: ${formatDateFull(tx.created_at)}</p>
                            <p style="font-size: 14px; color: #64748b; margin: 0;">Metode: ${tx.payment_channel || "Midtrans"}</p>
                        </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="text-align: left; padding: 15px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase;">Deskripsi</th>
                                <th style="text-align: right; padding: 15px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase;">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f1f5f9;">
                                    <p style="font-size: 16px; font-weight: 700; color: #0A1128; margin: 0;">Subscription Plan: ${tx.tier?.toUpperCase()}</p>
                                    <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">Akses premium Tamuu selama 1 tahun</p>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 16px; font-weight: 800; color: #0A1128;">
                                    Rp ${tx.amount?.toLocaleString("id-ID")}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="padding: 20px 15px; text-align: right; font-size: 14px; font-weight: 700; color: #64748b;">TOTAL</td>
                                <td style="padding: 20px 15px; text-align: right; font-size: 24px; font-weight: 900; color: #0A1128;">
                                    Rp ${tx.amount?.toLocaleString("id-ID")}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    <div style="background: ${statusColor}10; border-radius: 16px; padding: 20px; text-align: center;">
                        <p style="font-size: 14px; font-weight: 900; color: ${statusColor}; margin: 0; letter-spacing: 2px;">STATUS: ${statusLabel}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container, {
                scale: 2,
                backgroundColor: "#ffffff",
                logging: false,
                useCORS: true,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`tamuu-receipt-${tx.external_id}.pdf`);
        } catch (err) {
            console.error("PDF Generation error:", err);
            showModal({
                title: 'Unduh Gagal',
                message: 'Gagal mengunduh struk. Silakan coba lagi.',
                type: 'error'
            });
        } finally {
            document.body.removeChild(container);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <PremiumLoader variant="inline" color="#0EA5E9" />
                <p className="text-slate-400 text-sm font-medium mt-4 uppercase tracking-widest">Memuat Riwayat...</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed"
            >
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Invoice</h3>
                <p className="text-slate-500 text-center max-w-sm">Riwayat pembayaran & invoice akan muncul di sini setelah Anda melakukan upgrade paket.</p>
            </m.div>
        );
    }

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Riwayat Pembayaran</h2>
                    <p className="text-slate-500 text-sm">Kelola semua transaksi dan download invoice Anda.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400">
                                <th className="px-8 py-4">ID Transaksi</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Paket</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((tx: Transaction) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 text-[10px] text-slate-400 font-mono">
                                        #{tx.external_id?.substring(0, 12)}...
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">
                                        {formatDateFull(tx.created_at)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                            {tx.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-slate-900">
                                        Rp {tx.amount?.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${tx.status === "PAID" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                                                tx.status === "PENDING" ? "bg-amber-500 animate-pulse" :
                                                    tx.status === "EXPIRED" ? "bg-slate-300" : "bg-rose-500"
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${tx.status === "PAID" ? "text-emerald-600" :
                                                tx.status === "PENDING" ? "text-amber-600" :
                                                    tx.status === "EXPIRED" ? "text-slate-400" : "text-rose-600"
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {tx.status === "PENDING" && (
                                                <>
                                                    <a
                                                        href={tx.payment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-teal-500 hover:text-slate-900 transition-all flex items-center gap-1.5"
                                                    >
                                                        BAYAR <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleCancel(tx.external_id)}
                                                        className="bg-rose-50 text-rose-600 p-1.5 rounded-xl hover:bg-rose-100 transition-all"
                                                        title="Batalkan"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {tx.status === "PAID" && (
                                                <button
                                                    onClick={() => handleDownloadReceipt(tx)}
                                                    className="bg-slate-50 text-slate-600 p-2 rounded-xl hover:bg-slate-100 group-hover:scale-110 transition-all border border-slate-100"
                                                    title="Download Struk"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </m.div>
    );
};
