import React from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import {
    Users,
    Smartphone,
    Monitor,
    ArrowUpRight,
    Clock,
    Zap,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data for Phase 1
const STATS = [
    { label: 'Total Users', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Templates', value: '42', change: '+4', icon: Smartphone, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { label: 'Display Designs', value: '15', change: '+8', icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Total RSVPs', value: '8,932', change: '+24%', icon: MessageSquare, color: 'text-rose-400', bg: 'bg-rose-400/10' },
];

const RECENT_ACTIVITY = [
    { user: 'Budi Santoso', action: 'Created new invitation', time: '2 mins ago', type: 'create' },
    { user: 'Siti Aminah', action: 'Published "Rustic Gold"', time: '15 mins ago', type: 'publish' },
    { user: 'System', action: 'Backup completed', time: '1 hour ago', type: 'system' },
    { user: 'Admin', action: 'Updated "Neon Future" template', time: '2 hours ago', type: 'edit' },
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
                {STATS.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">Recent Activity</h2>
                        <button className="text-teal-400 text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {RECENT_ACTIVITY.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-colors">
                                    <Clock className="w-4 h-4 text-slate-400 group-hover:text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">
                                        <span className="font-bold text-teal-400">{activity.user}</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                </div>
                                <button className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                                    Detail
                                </button>
                            </div>
                        ))}
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
                                <span className="text-sm text-slate-400">API Latency</span>
                                <span className="text-sm font-bold text-emerald-400">42ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Database (D1)</span>
                                <span className="text-sm font-bold text-emerald-400">Healthy</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Storage (R2)</span>
                                <span className="text-sm font-bold text-emerald-400">Healthy</span>
                            </div>

                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                                <div className="w-[98%] h-full bg-emerald-500 rounded-full" />
                            </div>
                            <p className="text-xs text-center text-slate-500 mt-2">99.9% Uptime</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
