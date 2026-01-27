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
        // Polling for "Live" effect
        const timer = setInterval(fetchActivity, 30000);
        return () => clearInterval(timer);
    }, [fetchActivity]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
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
            case 'rsvp': /* Stay here or deep link */ break;
            default: break;
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-teal-500" />
                        Live Activity Hub
                    </h1>
                    <p className="text-slate-400">Monitoring real-time interactions across the platform.</p>
                </div>
                <button
                    onClick={fetchActivity}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-bold"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by user or action..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="appearance-none bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-bold uppercase tracking-widest text-xs outline-none cursor-pointer pr-12"
                    >
                        <option value="all" className="bg-[#111]">All Events</option>
                        <option value="user" className="bg-[#111]">User Joins</option>
                        <option value="invitation" className="bg-[#111]">Invitations</option>
                        <option value="rsvp" className="bg-[#111]">RSVP Actions</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Activity List */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 min-h-[500px]">
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading && activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <RefreshCw className="w-10 h-10 animate-spin mb-4 text-teal-500" />
                                <p className="font-bold uppercase tracking-[0.2em] text-xs">Streaming events...</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <Zap className="w-12 h-12 opacity-20 mb-4" />
                                <p className="font-bold uppercase tracking-[0.2em] text-xs text-center">No matching events found in the stream</p>
                            </div>
                        ) : (
                            activities.map((activity, i) => (
                                <motion.div
                                    key={`${activity.target_id}-${activity.time}-${i}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-all group-hover:scale-110 shadow-lg">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black text-teal-400 text-sm">{activity.user}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activity.type}</span>
                                        </div>
                                        <p className="text-white font-medium text-sm group-hover:text-teal-50 transition-colors">
                                            {activity.action}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                            {formatTime(activity.time)}
                                        </p>
                                        <button
                                            onClick={() => handleViewDetail(activity)}
                                            className="px-4 py-1.5 bg-teal-500 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-400 active:scale-95 flex items-center gap-1.5"
                                        >
                                            View Detail
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
