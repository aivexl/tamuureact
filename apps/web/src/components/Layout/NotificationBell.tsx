import React, { useState } from 'react';
import { Bell, Check, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useNotifications, useMarkNotificationRead } from '../../hooks/queries/useNotifications';
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export const NotificationBell: React.FC = () => {
    const user = useStore(s => s.user);
    const [isOpen, setIsOpen] = useState(false);
    
    const { data: notifications = [] } = useNotifications(user?.id);
    const markReadMutation = useMarkNotificationRead();

    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    const handleMarkAllRead = () => {
        if (user?.id) {
            markReadMutation.mutate({ userId: user.id });
        }
    };

    const handleNotificationClick = (notificationId: string) => {
        if (user?.id) {
            markReadMutation.mutate({ userId: user.id, notificationId });
        }
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-teal-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Bell className="w-4 h-4 text-indigo-500" />;
        }
    };

    return (
        <div className="relative notification-container">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all relative ${isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <m.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                            className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50"
                        >
                            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                                    >
                                        <Check className="w-3 h-3" /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((n: any) => (
                                        <Link 
                                            key={n.id}
                                            to={n.link || '#'}
                                            onClick={() => handleNotificationClick(n.id)}
                                            className={`flex gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                n.type === 'success' ? 'bg-teal-50' : 
                                                n.type === 'error' ? 'bg-rose-50' : 
                                                n.type === 'warning' ? 'bg-amber-50' : 'bg-indigo-50'
                                            }`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-xs font-bold text-slate-900 leading-tight mb-1 ${!n.is_read ? 'pr-4' : ''}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="w-3 h-3 text-slate-300" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                                                    </span>
                                                </div>
                                            </div>
                                            {!n.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 self-center" />
                                            )}
                                        </Link>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                        View all history
                                    </button>
                                </div>
                            )}
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
