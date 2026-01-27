import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import {
    Search,
    Download,
    Calendar,
    ArrowUpRight,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Copy,
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface Transaction {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    external_id: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CANCELLED';
    tier: string;
    payment_method: string;
    payment_channel: string;
    paid_at: string | null;
    created_at: string;
}

export const AdminTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState('all'); // all, week, month, year
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        // If string doesn't have a timezone indicator, treat as UTC
        const normalized = (dateStr.includes('Z') || dateStr.includes('+'))
            ? dateStr
            : dateStr.replace(' ', 'T') + 'Z';
        return new Date(normalized);
    };

    const formatDate = (dateStr: string) => {
        return parseDate(dateStr).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterStatus, dateRange, customStartDate, customEndDate]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const filters: any = { status: filterStatus };

            const now = new Date();
            if (dateRange === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                filters.startDate = weekAgo.toISOString();
            } else if (dateRange === 'month') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                filters.startDate = monthAgo.toISOString();
            } else if (dateRange === 'year') {
                const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                filters.startDate = yearAgo.toISOString();
            } else if (customStartDate && customEndDate) {
                filters.startDate = new Date(customStartDate).toISOString();
                filters.endDate = new Date(customEndDate).toISOString();
            }

            const data = await admin.listTransactions(filters);
            setTransactions(data);
        } catch (err) {
            console.error('[AdminTransactions] Fetch error:', err);
            toast.error('Gagal mengambil data transaksi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        const dataToExport = transactions.map(t => ({
            'ID': t.id,
            'User Name': t.user_name || 'Anonymous',
            'User Email': t.user_email,
            'External ID': t.external_id,
            'Amount': t.amount,
            'Currency': t.currency,
            'Status': t.status,
            // Automatic local time (Deep Fix: Force UTC parsing before local conversion)
            'Date': parseDate(t.created_at).toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            'Payment Method': t.payment_method,
            'Payment Channel': t.payment_channel
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Auto-width columns (simple heuristic)
        const wscols = Object.keys(dataToExport[0] || {}).map(k => ({ wch: 20 }));
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `transactions_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`);
    };

    const filteredTransactions = transactions.filter(t =>
    (t.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.external_id?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'PENDING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'FAILED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'EXPIRED': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-400 bg-white/5 border-white/10';
        }
    };

    const totalRevenue = transactions
        .filter(t => t.status === 'PAID')
        .reduce((sum, t) => sum + t.amount, 0);

    const handleSync = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const btn = e.currentTarget as HTMLButtonElement;
        btn.classList.add('animate-spin');
        try {
            const res = await admin.syncTransaction(id);
            if (res.updated) {
                toast.success(`Status updated: ${res.status}`);
                fetchTransactions();
            } else {
                toast.success('Status is up to date');
            }
        } catch (err) {
            toast.error('Sync failed');
        } finally {
            btn.classList.remove('animate-spin');
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
                    <p className="text-slate-400">Monitor revenue, track payments, and export financial reports.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="px-6 py-3.5 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-white font-bold rounded-2xl border border-white/5 transition-all text-sm flex items-center gap-2 group"
                    >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Export Excel
                    </button>
                    <button
                        onClick={fetchTransactions}
                        className="px-6 py-3.5 bg-teal-500 text-slate-900 font-black rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:bg-teal-400 -translate-y-0.5 transition-all active:scale-95 text-sm flex items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpRight className="w-24 h-24 text-teal-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                    <div className="mt-4 flex items-center gap-2 text-teal-400 text-xs font-bold bg-teal-500/10 w-fit px-3 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Based on current view</span>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-24 h-24 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Success Rate</p>
                    <h3 className="text-3xl font-bold text-white">
                        {transactions.length > 0
                            ? Math.round((transactions.filter(t => t.status === 'PAID').length / transactions.length) * 100)
                            : 0}%
                    </h3>
                    <span className="text-xs text-slate-500 mt-2 block">of total transactions</span>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24 text-amber-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Pending Payments</p>
                    <h3 className="text-3xl font-bold text-white">
                        {transactions.filter(t => t.status === 'PENDING').length}
                    </h3>
                    <span className="text-xs text-slate-500 mt-2 block">awaiting confirmation</span>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <XCircle className="w-24 h-24 text-rose-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Cancelled</p>
                    <h3 className="text-3xl font-bold text-white">
                        {transactions.filter(t => t.status === 'CANCELLED').length}
                    </h3>
                    <span className="text-xs text-slate-500 mt-2 block">by user or system</span>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <RefreshCw className="w-24 h-24 text-slate-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Expired</p>
                    <h3 className="text-3xl font-bold text-white">
                        {transactions.filter(t => t.status === 'EXPIRED').length}
                    </h3>
                    <span className="text-xs text-slate-500 mt-2 block">time limit reached</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 mb-8">
                <div className="flex flex-col xl:flex-row gap-4 justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or order ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-bold uppercase tracking-widest text-xs outline-none cursor-pointer whitespace-nowrap"
                            >
                                <option value="all" className="bg-[#111]">All Status</option>
                                <option value="PAID" className="bg-[#111]">Success</option>
                                <option value="PENDING" className="bg-[#111]">Pending</option>
                                <option value="EXPIRED" className="bg-[#111]">Expired</option>
                                <option value="FAILED" className="bg-[#111]">Failed</option>
                            </select>

                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-bold uppercase tracking-widest text-xs outline-none cursor-pointer whitespace-nowrap"
                            >
                                <option value="all" className="bg-[#111]">All Time</option>
                                <option value="week" className="bg-[#111]">This Week</option>
                                <option value="month" className="bg-[#111]">This Month</option>
                                <option value="year" className="bg-[#111]">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Order ID & Date</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User Details</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Payment</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Sync</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fetching Transactions...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <CreditCard className="w-12 h-12" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em]">No transactions found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredTransactions.map((t) => (
                            <motion.tr
                                layout
                                key={t.id}
                                className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                            >
                                <td className="px-8 py-6">
                                    <button
                                        onClick={() => handleCopy(t.external_id || t.id)}
                                        className="flex items-center gap-2 text-white font-mono text-xs mb-1 hover:text-teal-400 transition-colors group/copy"
                                    >
                                        {t.external_id || t.id.slice(0, 8)}
                                        {copiedId === (t.external_id || t.id) ? (
                                            <Check className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(t.created_at)}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-white font-bold text-sm">{t.user_name || 'Anonymous'}</p>
                                    <p className="text-xs text-slate-500 opacity-70">{t.user_email}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-white font-bold">Rp {t.amount.toLocaleString('id-ID')}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.tier || 'Upgrade'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(t.status)}`}>
                                        {t.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> :
                                            t.status === 'PENDING' ? <Clock className="w-3 h-3" /> :
                                                <XCircle className="w-3 h-3" />}
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <p className="text-white font-medium text-xs uppercase">{t.payment_method || '-'}</p>
                                    <p className="text-[10px] text-slate-500">{t.payment_channel}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={(e) => handleSync(e, t.id)}
                                        className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-teal-400 transition-colors"
                                        title="Sync Status with Midtrans"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};
