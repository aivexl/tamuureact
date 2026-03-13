import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../components/Layout/AdminLayout';
import {
    Activity,
    Search,
    Filter,
    Clock,
    UserCircle,
    FileText,
    Mail,
    Zap,
    ChevronDown,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin } from '@/lib/api';
import { parseUTCDate } from '@/lib/utils';

export const AdminActivityPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [filterType, setFilterType] = useState(searchParams.get('type') || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    // Sync search with URL
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setSearchParams({ search: searchQuery, type: filterType });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, filterType]);

    const fetchActivity = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await admin.getStats({
                search: debouncedSearch,
                filter: filterType
            });
            setActivities(data.recentActivity || []);
        } catch (err) {
            console.error('[AdminActivity] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, filterType]);

    useEffect(() => {
        fetchActivity();
        const timer = setInterval(fetchActivity, 30000);
        return () => clearInterval(timer);
    }, [fetchActivity]);

    const formatTime = (dateStr: string) => {
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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user': return <UserCircle className="w-5 h-5 text-blue-400" />;
            case 'invitation': return <FileText className="w-5 h-5 text-teal-400" />;
            case 'rsvp': return <Mail className="w-5 h-5 text-rose-400" />;
            default: return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const handleViewDetail = (activity: any) => {
        if (!activity.target_id) return;
        switch (activity.type) {
            case 'user': navigate(`/admin/users?id=${activity.target_id}`); break;
            case 'invitation': navigate(`/admin/users?id=${activity.user_id || ''}&invitationId=${activity.target_id}`); break;
            case 'rsvp': /* Stay here */ break;
            default: break;
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                        <Activity className="w-8 h-8 text-teal-500" />
                        Live Activity Hub
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">Monitoring real-time interactions across the platform.</p>
                </div>
                <button
                    onClick={fetchActivity}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all text-sm font-black uppercase tracking-widest shadow-xl"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Feed
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-sm"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full md:w-auto appearance-none bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-black uppercase tracking-[0.2em] text-[10px] outline-none cursor-pointer md:pr-12"
                    >
                        <option value="all" className="bg-[#111]">ALL EVENTS</option>
                        <option value="user" className="bg-[#111]">USER JOINS</option>
                        <option value="invitation" className="bg-[#111]">INVITATIONS</option>
                        <option value="rsvp" className="bg-[#111]">RSVP ACTIONS</option>
                    </select>
                    <ChevronDown className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Activity List */}
            <div className="bg-[#111] border border-white/5 rounded-[2rem] p-4 sm:p-8 min-h-[500px] shadow-2xl">
                <div className="space-y-4 sm:space-y-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading && activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                                <RefreshCw className="w-12 h-12 animate-spin mb-6 text-teal-500" />
                                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Streaming events...</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-500 opacity-30">
                                <Zap className="w-16 h-16 mb-6" />
                                <p className="font-black uppercase tracking-[0.2em] text-[10px] text-center">Empty Feed: No interaction discovered</p>
                            </div>
                        ) : (
                            activities.map((activity, i) => (
                                <motion.div
                                    key={`${activity.target_id}-${activity.time}-${i}`}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group border border-white/5"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-all group-hover:scale-110 shrink-0">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                            <span className="font-black text-teal-400 text-sm">{activity.user}</span>
                                            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{activity.type}</span>
                                        </div>
                                        <p className="text-white font-medium text-sm group-hover:text-teal-50 transition-colors leading-relaxed">
                                            {activity.action}
                                        </p>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 font-mono">
                                            {formatTime(activity.time)}
                                        </p>
                                        <button
                                            onClick={() => handleViewDetail(activity)}
                                            className="px-4 py-2 bg-teal-500 text-slate-950 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-teal-400 active:scale-95 flex items-center gap-1.5"
                                        >
                                            Detail
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AdminLayout>
    );
};