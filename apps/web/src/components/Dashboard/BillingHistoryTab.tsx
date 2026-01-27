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
    XCircle,
    Copy,
    Check
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
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCancel = async (orderId: string) => {
        showModal({
            title: 'Cancel Order?',
            message: 'Are you sure you want to cancel this order? This action cannot be undone.',
            type: 'warning',
            confirmText: 'Yes, Cancel',
            cancelText: 'Keep it',
            onConfirm: () => confirmCancel(orderId)
        });
    };

    const confirmCancel = async (orderId: string) => {
        if (!user?.id) return;
        try {
            const res = await billingApi.cancelTransaction(orderId, user.id);
            if (res.success) {
                showModal({
                    title: 'Cancelled',
                    message: 'Your order has been successfully cancelled.',
                    type: 'success'
                });
            } else {
                showModal({
                    title: 'Failed',
                    message: res.error || "Failed to cancel order",
                    type: 'error'
                });
            }
        } catch (err) {
            console.error("Cancel error:", err);
            showModal({
                title: 'Error',
                message: 'An error occurred while cancelling the order.',
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
                ? "PAID"
                : tx.status === "EXPIRED"
                    ? "EXPIRED"
                    : "CANCELLED";
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
                <div style="relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px;">
                        <div>
                            <h1 style="font-size: 32px; font-weight: 900; color: #0A1128; margin: 0;">TAMUU</h1>
                            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Premium Digital Invitations</p>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="font-size: 18px; font-weight: 800; color: #0A1128; margin: 0;">TRANSACTION RECEIPT</h2>
                            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px; font-family: monospace;">#${tx.external_id}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 30px 0;">
                        <div>
                            <p style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0 0 10px 0;">Customer Information</p>
                            <p style="font-size: 14px; font-weight: 700; color: #0A1128; margin: 0 0 5px 0;">${user?.name || "Tamuu User"}</p>
                            <p style="font-size: 14px; color: #64748b; margin: 0;">${user?.email}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0 0 10px 0;">Payment Details</p>
                            <p style="font-size: 14px; color: #64748b; margin: 0 0 5px 0;">Time: ${formatDateFull(tx.created_at)}</p>
                            <p style="font-size: 14px; color: #64748b; margin: 0;">Method: ${tx.payment_channel || "Midtrans"}</p>
                        </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="text-align: left; padding: 15px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase;">Description</th>
                                <th style="text-align: right; padding: 15px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f1f5f9;">
                                    <p style="font-size: 16px; font-weight: 700; color: #0A1128; margin: 0;">Subscription Plan: ${tx.tier?.toUpperCase()}</p>
                                    <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">1-year premium access to Tamuu</p>
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
                title: 'Download Failed',
                message: 'Failed to download receipt. Please try again.',
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
                <p className="text-slate-400 text-sm font-medium mt-4 uppercase tracking-widest">Loading History...</p>
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Invoices Yet</h3>
                <p className="text-slate-500 text-center max-w-sm">Your payment history and invoices will appear here after you upgrade your plan.</p>
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
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Payment History</h2>
                    <p className="text-slate-500 text-sm">Manage all your transactions and download invoices.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400">
                                <th className="px-8 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Action</th>
                                <th className="px-6 py-4 text-center">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic font-medium">
                            {transactions.map((tx: Transaction) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <button
                                            onClick={() => handleCopy(tx.external_id)}
                                            className="flex items-center gap-2 text-[10px] text-slate-400 font-mono hover:text-indigo-600 transition-colors group/copy"
                                        >
                                            #{tx.external_id}
                                            {copiedId === tx.external_id ? (
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-[11px] text-slate-600 leading-tight">
                                        {formatDateFull(tx.created_at)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {tx.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-slate-900">
                                        Rp {tx.amount?.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${tx.status === "PAID" ? "bg-emerald-500" :
                                                tx.status === "PENDING" ? "bg-amber-500 animate-pulse" :
                                                    tx.status === "EXPIRED" ? "bg-slate-400" : "bg-rose-500"
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${tx.status === "PAID" ? "text-emerald-600" :
                                                tx.status === "PENDING" ? "text-amber-600" :
                                                    tx.status === "EXPIRED" ? "text-slate-500" : "text-rose-600"
                                                }`}>
                                                {tx.status === "PAID" ? "Paid" :
                                                    tx.status === "PENDING" ? "Pending" :
                                                        tx.status === "EXPIRED" ? "Expired" : "Cancelled"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {tx.status === "PENDING" ? (
                                                <>
                                                    <a
                                                        href={tx.payment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#FFBF00] text-[#0A1128] px-3 py-1.5 rounded-lg text-[10px] font-black hover:shadow-md transition-all flex items-center gap-1"
                                                    >
                                                        PAY <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleCancel(tx.external_id)}
                                                        className="bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-rose-100 transition-all"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === "PAID" ? "text-emerald-500" :
                                                    tx.status === "EXPIRED" ? "text-slate-400" : "text-rose-400"
                                                    }`}>
                                                    {tx.status === "PAID" ? "Paid" :
                                                        tx.status === "EXPIRED" ? "Expired" : "Cancelled"}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDownloadReceipt(tx)}
                                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                                            title="Download Receipt"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
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
