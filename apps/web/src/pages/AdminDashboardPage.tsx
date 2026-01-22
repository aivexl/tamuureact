import { useNavigate } from 'react-router-dom';

// ... (keep existing imports)

// ... (keep StatCard component)

export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(INITIAL_STATS);
    // ... (keep existing states)

    // ... (keep formatTime and getActivityIcon functions)

    const handleViewDetail = (activity: any) => {
        if (!activity.target_id) return;

        switch (activity.type) {
            case 'user':
                navigate(`/admin/users?id=${activity.target_id}`);
                break;
            case 'invitation':
                navigate(`/user/editor/${activity.target_id}`);
                break;
            case 'rsvp':
                navigate(`/guests/${activity.target_id}`);
                break;
            default:
                break;
        }
    };

    return (
        <AdminLayout>
            {/* ... (keep header and stats grid) */}

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                {/* ... (keep search and filter UI) */}

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {/* ... (keep loading and empty states) */}
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
        </AdminLayout >
    );
};
