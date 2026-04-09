import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import {
    ShieldAlert,
    Search,
    Clock,
    User,
    Globe,
    Zap,
    RefreshCw,
    AlertTriangle,
    ShieldCheck,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin } from '@/lib/api';
import { parseUTCDate } from '@/lib/utils';

export const AdminSecurityPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await admin.getSecurityLogs();
            setLogs(data || []);
        } catch (err) {
            console.error('[AdminSecurity] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        const timer = setInterval(fetchLogs, 60000); // Refresh every minute
        return () => clearInterval(timer);
    }, [fetchLogs]);

    const formatTime = (dateStr: string) => {
        if (!dateStr) return 'Unknown';
        const date = parseUTCDate(dateStr);
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const getSeverityStyle = (severity: string) => {
        switch (severity?.toUpperCase()) {
            case 'HIGH': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'JWT_VERIFY_FAIL': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
            case 'ADMIN_ACCESS_DENIED': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'IDOR_ATTEMPT': return <Zap className="w-5 h-5 text-rose-500" />;
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const filteredLogs = logs.filter(log => 
        log.event_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip_address?.includes(searchQuery) ||
        log.user_id?.includes(searchQuery)
    );

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                        <ShieldCheck className="w-8 h-8 text-teal-500" />
                        Security Audit Center
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">Forensic monitoring of authentication and authorization events.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchLogs}
                        disabled={isLoading}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by event, IP, or details..."
                            className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Total Events: {filteredLogs.length}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Event / Time</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Identity / Source</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Location</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Severity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {isLoading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">Scanning D1 Security Registry...</p>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">No security threats detected.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, i) => (
                                        <motion.tr 
                                            key={log.id || i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                                                        {getEventIcon(log.event_type)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm tracking-tight">{log.event_type}</div>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(log.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                                        {log.user_id ? (
                                                            <span className="truncate max-w-[150px]">{log.user_id}</span>
                                                        ) : (
                                                            <span className="text-slate-600 italic">Anonymous</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold tracking-wider">
                                                        <Globe className="w-3 h-3" />
                                                        {log.ip_address}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm">
                                                <div className="font-mono text-[11px] text-teal-400 bg-teal-400/5 px-2 py-1 rounded-md inline-block border border-teal-400/10 uppercase font-bold tracking-widest">
                                                    {log.method} {log.endpoint}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter border ${getSeverityStyle(log.severity)}`}>
                                                    {log.severity || 'INFO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <p className="text-xs text-slate-400 max-w-xs ml-auto leading-relaxed italic">
                                                    "{log.details}"
                                                </p>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};
