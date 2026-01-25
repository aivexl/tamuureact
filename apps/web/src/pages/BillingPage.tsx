import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { billing as billingApi, users as usersApi } from "../lib/api";
import {
  Zap,
  History,
  ExternalLink,
  CreditCard,
  Shield,
  CheckCircle2,
  Clock,
  Download,
  X,
  AlertTriangle,
} from "lucide-react";
import { PremiumLoader } from "../components/ui/PremiumLoader";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { formatDateFull } from "../lib/utils";


export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setAuthSession, token, showModal } = useStore();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [paymentStatus, setPaymentStatus] = React.useState<
    "success" | "pending" | null
  >(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const fetchTransactions = React.useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await billingApi.listTransactions(user.id);
      setTransactions(data || []);
    } catch (err) {
      console.error("[BillingPage] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const syncUserData = React.useCallback(async () => {
    if (!user?.email || !token) return;
    try {
      const freshUser = await usersApi.getMe(user.email);
      if (freshUser) {
        setAuthSession({ user: { ...user, ...freshUser }, token });
      }
    } catch (err) {
      console.error("[BillingPage] Profile sync error:", err);
    }
  }, [user, token, setAuthSession]);

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
    setIsCancelling(true);
    try {
      console.log("[Billing] Confirming cancel for:", orderId);
      const res = await billingApi.cancelTransaction(
        orderId,
        user.id,
      );
      console.log("[Billing] Cancel response:", res);

      if (res.success) {
        setPaymentStatus(null);
        navigate("/billing", { replace: true });
        showModal({
          title: 'Dibatalkan',
          message: 'Pesanan Anda telah berhasil dibatalkan.',
          type: 'success'
        });
      } else if (res.code === 'NOT_FOUND') {
        showModal({
          title: 'Tidak Ditemukan',
          message: 'Transaksi tidak ditemukan. Transaksi mungkin tidak tercatat dengan benar di sistem.',
          type: 'error'
        });
      } else if (res.code === 'ALREADY_PAID') {
        showModal({
          title: 'Sudah Dibayar',
          message: 'Transaksi ini sudah dibayar dan tidak dapat dibatalkan.',
          type: 'warning'
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
        message: 'Terjadi kesalahan saat membatalkan pesanan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsCancelling(false);
      await fetchTransactions();
    }
  };


  const handleDownloadReceipt = async (tx: any) => {
    // Create a temporary container for the receipt
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
                <!-- Watermark -->
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

                    <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 30px 0;">
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
                                    <p style="font-size: 16px; font-weight: 700; color: #0A1128; margin: 0;">Subscription Plan: ${tx.tier === 'pro' ? 'PRO' : tx.tier === 'ultimate' ? 'ULTIMATE' : tx.tier === 'elite' ? 'ELITE' : tx.tier.toUpperCase()}</p>
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

                    <div style="margin-top: 40px; text-align: center;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Thank you for using Tamuu.</p>
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

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status === "success") {
      setPaymentStatus("success");
      syncUserData();
    } else if (status === "pending") {
      setPaymentStatus("pending");
    }

    fetchTransactions();
  }, [
    isAuthenticated,
    navigate,
    location.search,
    fetchTransactions,
    syncUserData,
  ]);

  const tierLabels: Record<string, string> = {
    free: "FREE EXPLORER",
    pro: "PRO ACCESS",
    ultimate: "ULTIMATE EVENT",
    elite: "ELITE EXCLUSIVE",
    // Legacy support
    vip: "PRO ACCESS",
    platinum: "ULTIMATE EVENT",
    vvip: "ELITE EXCLUSIVE",
  };

  const tierColors: Record<string, string> = {
    free: "bg-slate-100 text-slate-600",
    pro: "bg-indigo-100 text-indigo-600",
    ultimate: "bg-emerald-100 text-emerald-600",
    elite: "bg-[#FFBF00]/10 text-[#B8860B]",
    vip: "bg-indigo-100 text-indigo-600",
    platinum: "bg-emerald-100 text-emerald-600",
    vvip: "bg-[#FFBF00]/10 text-[#B8860B]",
  };

  const tierDisplay: Record<string, string> = {
    free: "Standard Access",
    pro: "Pro Annual",
    ultimate: "Ultimate Annual",
    elite: "Elite Annual",
    vip: "Pro Annual",
    platinum: "Ultimate Annual",
    vvip: "Elite Annual"
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#0A1128] mb-2">
              Billing & Subscription
            </h1>
            <p className="text-slate-500">
              Manage your plan, payment methods, and billing history.
            </p>
          </div>

          <AnimatePresence>
            {paymentStatus && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-4 ${paymentStatus === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
              >
                {paymentStatus === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {paymentStatus === "success"
                      ? "Pembayaran Berhasil! Paket Anda telah diperbarui."
                      : "Pembayaran Menunggu: Menunggu konfirmasi dari sistem pembayaran."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPaymentStatus(null);
                    navigate("/billing", { replace: true });
                  }}
                  className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  Tutup
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Plan Card */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Active Plan
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${tierColors[user?.tier || "free"] || tierColors.free}`}
                  >
                    {tierLabels[user?.tier || "free"] || tierLabels.free}
                  </span>
                </div>

                <h2 className="text-4xl font-black text-[#0A1128] mb-1">
                  {tierDisplay[user?.tier || "free"] || "Standard Access"}
                </h2>
                <p className="text-slate-500 mb-8">
                  {user?.tier === "free"
                    ? "Upgrade to unlock premium features and templates."
                    : `Your subscription is active until ${user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : "next year"}.`}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/upgrade"
                    className="bg-[#0A1128] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#152042] transition-colors"
                  >
                    {user?.tier === "free"
                      ? "Upgrade Plan"
                      : "Manage Subscription"}
                  </Link>
                  {user?.tier !== "free" && (
                    <button className="text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors">
                      Cancel Plan
                    </button>
                  )}
                </div>
              </div>
              {/* Abstract Background */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Stats/Usage Card */}
            <div className="bg-[#0A1128] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <Zap className="w-8 h-8 text-[#FFBF00] mb-4" />
                  <h3 className="text-lg font-bold mb-1">Usage</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black text-[#FFBF00]">
                      {user?.invitationCount || 0}
                    </span>
                    <span className="text-white/40 text-sm">
                      / {user?.maxInvitations} Invitations
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((user?.invitationCount || 0) / (user?.maxInvitations || 1)) * 100}%`,
                      }}
                      className="h-full bg-[#FFBF00]"
                    />
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Invitation quota
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-bold text-[#0A1128]">Payment History</h3>
              </div>
              <button className="text-[#FFBF00] text-sm font-black hover:underline px-4 py-2 bg-[#FFBF00]/5 rounded-xl">
                Download All
              </button>
            </div>

            <div className="p-0">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <PremiumLoader variant="inline" color="#6366f1" />
                  <p className="text-slate-400 text-sm font-medium mt-4">
                    Memuat riwayat transaksi...
                  </p>
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400">
                        <th className="px-8 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Action</th>
                        <th className="px-4 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic font-medium">
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-8 py-5 text-xs text-slate-400 font-mono">
                            {tx.external_id?.substring(0, 16)}
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
                              <div
                                className={`w-2 h-2 rounded-full ${tx.status === "PAID"
                                  ? "bg-emerald-500"
                                  : tx.status === "PENDING"
                                    ? "bg-amber-500"
                                    : tx.status === "EXPIRED"
                                      ? "bg-slate-400"
                                      : "bg-rose-500"
                                  }`}
                              />
                              <span
                                className={`text-[10px] font-black uppercase tracking-tighter ${tx.status === "PAID"
                                  ? "text-emerald-600"
                                  : tx.status === "PENDING"
                                    ? "text-amber-600"
                                    : tx.status === "EXPIRED"
                                      ? "text-slate-500"
                                      : "text-rose-600"
                                  }`}
                              >
                                {tx.status === "PAID"
                                  ? "Paid"
                                  : tx.status === "PENDING"
                                    ? "Pending"
                                    : tx.status === "EXPIRED"
                                      ? "Expired"
                                      : "Cancelled"}
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
                                    className="bg-[#FFBF00] text-[#0A1128] px-3 py-1.5 rounded-lg text-[10px] font-black hover:shadow-md transition-all flex items-center gap-1"
                                  >
                                    PAY
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                  <button
                                    onClick={() => handleCancel(tx.external_id)}
                                    className="bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-rose-100 transition-all"
                                  >
                                    CANCEL
                                  </button>
                                </>
                              )}
                              {tx.status === "PAID" && (
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                  Paid
                                </span>
                              )}
                              {tx.status === "EXPIRED" && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Expired
                                </span>
                              )}
                              {(tx.status === "CANCELLED" ||
                                tx.status === "FAILED") && (
                                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                                    Cancelled
                                  </span>
                                )}
                            </div>
                          </td>
                          {/* Download Receipt Column */}
                          <td className="px-4 py-5 text-center">
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
              ) : (
                /* Empty State */
                <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-slate-900 font-bold mb-1">
                    No invoices yet
                  </h4>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Once you make a purchase, your invoices will appear here for
                    you to download and manage.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Security */}
          <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tighter">
                Secure SSL Encryption
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tighter">
                Processed by Midtrans
              </span>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};
