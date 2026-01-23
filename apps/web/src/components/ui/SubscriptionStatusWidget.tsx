import React from 'react';
import { motion as m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionTimer } from '../../hooks/useSubscriptionTimer';
import { CreditCard, ExternalLink, Clock } from 'lucide-react';

interface SubscriptionStatusWidgetProps {
    expiresAt: string | null;
    email?: string;
    variant?: 'dashboard' | 'compact' | 'editor';
}

export const SubscriptionStatusWidget: React.FC<SubscriptionStatusWidgetProps> = ({
    expiresAt,
    email,
    variant = 'dashboard'
}) => {
    const navigate = useNavigate();
    const subStatus = useSubscriptionTimer(expiresAt);
    const isUnlimited = email === 'user@tamuu.id' || email === 'admin@tamuu.id';

    if (variant === 'editor') {
        return (
            <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 overflow-hidden relative group shadow-lg ${subStatus.urgency === 'critical' || subStatus.isExpired
                        ? 'bg-rose-50/20 border-rose-100'
                        : subStatus.urgency === 'high'
                            ? 'bg-amber-50/20 border-amber-100'
                            : 'bg-white border-slate-200 shadow-slate-200/20'
                    }`}
            >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${subStatus.isExpired ? 'bg-rose-600 text-white shadow-rose-200' :
                        subStatus.urgency === 'critical' ? 'bg-rose-500 text-white shadow-rose-200 animate-pulse' :
                            subStatus.urgency === 'high' ? 'bg-amber-500 text-white shadow-amber-200' :
                                'bg-indigo-600 text-white shadow-indigo-100/50'
                    }`}>
                    <Clock className="w-4 h-4" />
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${subStatus.isExpired
                                ? 'bg-rose-100 text-rose-600 border-rose-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                            {subStatus.isExpired ? 'EXPIRED' : 'ACTIVE'}
                        </span>
                        <div className={`text-[10px] font-black tracking-widest font-mono ${subStatus.isExpired ? 'text-rose-600' :
                                subStatus.urgency === 'critical' ? 'text-rose-500' :
                                    subStatus.urgency === 'high' ? 'text-amber-600' :
                                        'text-slate-900'
                            }`}>
                            {isUnlimited ? 'UNLIMITED' : subStatus.label}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/billing')}
                    className="ml-auto p-1.5 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    title="Perpanjang"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </m.div>
        );
    }

    return (
        <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2rem] border transition-all duration-700 overflow-hidden relative group shadow-2xl shadow-indigo-100/10 ${subStatus.urgency === 'critical' || subStatus.isExpired
                    ? 'bg-rose-50/20 border-rose-100'
                    : subStatus.urgency === 'high'
                        ? 'bg-amber-50/20 border-amber-100'
                        : 'bg-white border-slate-200'
                }`}
        >
            <div className="p-7 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-11 h-11 rounded-[0.85rem] flex items-center justify-center shrink-0 shadow-lg ${subStatus.isExpired ? 'bg-rose-600 text-white shadow-rose-200' :
                                subStatus.urgency === 'critical' ? 'bg-rose-500 text-white shadow-rose-200 animate-pulse' :
                                    subStatus.urgency === 'high' ? 'bg-amber-500 text-white shadow-amber-200' :
                                        'bg-indigo-600 text-white shadow-indigo-100/50'
                            }`}>
                            <Clock className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status Langganan</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${subStatus.isExpired
                                        ? 'bg-rose-100 text-rose-600 border-rose-200'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    }`}>
                                    {subStatus.isExpired ? 'Kadaluarsa' : 'Aktif'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
                                <div className={`text-[11px] font-black tracking-[0.05em] font-mono transition-colors duration-500 leading-none ${subStatus.isExpired ? 'text-rose-600' :
                                        subStatus.urgency === 'critical' ? 'text-rose-500' :
                                            subStatus.urgency === 'high' ? 'text-amber-600' :
                                                'text-slate-900'
                                    }`}>
                                    {isUnlimited ? 'UNLIMITED ACCESS' : subStatus.label}
                                </div>
                                {!isUnlimited && !subStatus.isExpired && expiresAt && (
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-70 leading-none">
                                        (Hingga {new Date(expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate('/dashboard?tab=invoice')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 text-[11px] font-bold rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 uppercase tracking-widest whitespace-nowrap"
                        >
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            Invoice
                        </button>
                        <button
                            onClick={() => navigate('/billing')}
                            className={`flex items-center gap-2 px-6 py-2 text-white text-[11px] font-bold rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest whitespace-nowrap ${subStatus.urgency === 'critical' || subStatus.isExpired
                                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200/50'
                                }`}
                        >
                            Perpanjang
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {!subStatus.isExpired && expiresAt && (
                    <div className="mt-8">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <m.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${isUnlimited
                                        ? 100
                                        : Math.max(2, Math.min(100, (subStatus.days / 30) * 100))}%`
                                }}
                                transition={{ duration: 2, ease: "circOut" }}
                                className={`h-full rounded-full relative ${subStatus.urgency === 'critical' ? 'bg-rose-500' :
                                    subStatus.urgency === 'high' ? 'bg-amber-500' :
                                        'bg-indigo-600'
                                    }`}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utilized Balance</span>
                            <span className="text-[9px] font-black text-slate-900 uppercase">
                                {isUnlimited ? 'Unlimited Balance' : `${subStatus.days} Hari Tersisa`}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </m.div>
    );
};
