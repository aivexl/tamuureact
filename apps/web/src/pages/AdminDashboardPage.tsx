import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/Layout/AdminLayout';
import {
    Users,
    Smartphone,
    Monitor,
    ArrowUpRight,
    Clock,
    Zap,
    MessageSquare,
    Search,
    Filter,
    ChevronDown,
    UserCircle,
    FileText,
    Mail,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin } from '@/lib/api';

// Initial state for real statistics
const INITIAL_STATS = [
    { id: 'totalUsers', label: 'Total Users', value: '0', change: '...', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'totalInvitations', label: 'Active Invitations', value: '0', change: '...', icon: Smartphone, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { id: 'totalTemplates', label: 'Invitation Templates', value: '0', change: '...', icon: Layers, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'totalDisplays', label: 'Display Templates', value: '0', change: '...', icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

const StatCard = ({ stat, index }: { stat: any, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-teal-500/30 transition-colors group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
            </div>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">{stat.value}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
    </motion.div>
);

export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(INITIAL_STATS);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await admin.getStats({
                search: debouncedSearch,
                filter: filterType
            });

            setStats(prev => prev.map(s => ({
                ...s,
                value: data[s.id as keyof typeof data]?.toLocaleString() || '0'
            })));
            setRecentActivity(data.recentActivity || []);
            setSystemHealth(data.systemHealth);
        } catch (err) {
            console.error('[AdminDashboard] Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, filterType]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Format time distance
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);

        if (diffSecs < 60) return `${diffSecs}s ago`;

        // Return HH:mm:ss for today's activities
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('id-ID', { hour12: false });
        }

        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user': return <UserCircle className="w-4 h-4 text-blue-400" />;
            case 'invitation': return <FileText className="w-4 h-4 text-teal-400" />;
            case 'rsvp': return <Mail className="w-4 h-4 text-rose-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const handleViewDetail = (activity: any) => {
        // Log to debug why some buttons might not click
        console.log('[AdminDashboard] Activity Detail Clicked:', activity);

        if (!activity.target_id) {
            console.warn('[AdminDashboard] Missing target_id for activity');
            return;
        }

        switch (activity.type) {
            case 'user':
                navigate(`/admin/users?id=${activity.target_id}`);
                break;
            case 'invitation':
                // Redirect to admin templates or users with that invitation context
                navigate(`/admin/users?id=${activity.user_id || ''}&invitationId=${activity.target_id}`);
                break;
            case 'rsvp':
                navigate(`/admin/activity?type=rsvp&id=${activity.target_id}`);
                break;
            default:
                break;
        }
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                    <p className="text-slate-400">Welcome back, Super Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 text-white text-sm font-bold rounded-xl hover:bg-white/10 border border-white/5 transition-colors">
                        View Reports
                    </button>
                    <button className="px-4 py-2 bg-teal-500 text-slate-900 text-sm font-bold rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">
                        Create Broadcast
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl p-8 flex flex-col h-[600px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold">Recent Activity</h2>
                            <p className="text-xs text-slate-500 mt-1">Real-time system events</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search events..."
                                    className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50 outline-none w-full md:w-48 transition-all"
                                />
                            </div>

                            {/* Filter */}
                            <div className="relative group">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50 outline-none cursor-pointer hover:bg-white/10 transition-all font-bold uppercase tracking-wider"
                                >
                                    <option value="all" className="bg-[#111]">ALL</option>
                                    <option value="user" className="bg-[#111]">USERS</option>
                                    <option value="invitation" className="bg-[#111]">INVITATIONS</option>
                                    <option value="rsvp" className="bg-[#111]">RSVP</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {isLoading && recentActivity.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-teal-500 animate-pulse" />
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-20">
                                    <Search className="w-12 h-12 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No activities match your criteria</p>
                                </div>
                            ) : (
                                recentActivity.map((activity, i) => (
                                    <motion.div
                                        key={`${activity.user}-${activity.time}-${i}`}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-colors">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">
                                                <span className="font-black text-teal-400">{activity.user}</span>
                                                <span className="text-slate-400 mx-1.5 opacity-50">•</span>
                                                {activity.action}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{formatTime(activity.time)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleViewDetail(activity)}
                                            className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white border border-white/5 hover:border-teal-500/30 transition-all flex-shrink-0"
                                        >
                                            Detail
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* System Health / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-3xl p-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            System Status
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">API Health</span>
                                <span className="text-sm font-bold text-emerald-400">Stable</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Database (D1)</span>
                                <span className={`text-sm font-bold ${systemHealth?.db === 'Healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {systemHealth?.db || 'Loading...'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Storage (R2)</span>
                                <span className={`text-sm font-bold ${systemHealth?.r2 === 'Healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {systemHealth?.r2 || 'Loading...'}
                                </span>
                            </div>

                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                                <div className="w-[99.9%] h-full bg-emerald-500 rounded-full" />
                            </div>
                            <p className="text-xs text-center text-slate-500 mt-2">{systemHealth?.uptime || '99.9%'} Uptime</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
