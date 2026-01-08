import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, History, Zap, Shield, ExternalLink, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const BillingPage: React.FC = () => {
    const { user } = useStore();

    const tierLabels = {
        free: 'Free Explorer',
        vip: 'VIP Premiere',
        vvip: 'VVIP Exclusive'
    };

    const tierColors = {
        free: 'bg-slate-100 text-slate-600',
        vip: 'bg-indigo-100 text-indigo-600',
        vvip: 'bg-[#FFBF00]/10 text-[#B8860B]'
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-[#0A1128] mb-2">Billing & Subscription</h1>
                    <p className="text-slate-500">Manage your plan, payment methods, and billing history.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Current Plan Card */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Plan</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${tierColors[user?.tier || 'free']}`}>
                                    {tierLabels[user?.tier || 'free']}
                                </span>
                            </div>

                            <h2 className="text-4xl font-black text-[#0A1128] mb-1">
                                {user?.tier === 'free' ? 'Standard Access' : user?.tier === 'vip' ? 'VIP Annual' : 'VVIP Annual'}
                            </h2>
                            <p className="text-slate-500 mb-8">
                                {user?.tier === 'free'
                                    ? 'Upgrade to unlock premium features and templates.'
                                    : `Your subscription is active until ${user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'next year'}.`}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/upgrade"
                                    className="bg-[#0A1128] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#152042] transition-colors"
                                >
                                    {user?.tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                                </Link>
                                {user?.tier !== 'free' && (
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
                                    <span className="text-3xl font-black text-[#FFBF00]">{user?.invitationCount || 0}</span>
                                    <span className="text-white/40 text-sm">/ {user?.maxInvitations} Invitations</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((user?.invitationCount || 0) / (user?.maxInvitations || 1)) * 100}%` }}
                                        className="h-full bg-[#FFBF00]"
                                    />
                                </div>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Invitation quota</p>
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
                        {/* Empty State placeholder */}
                        <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                <CreditCard className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">No invoices yet</h4>
                            <p className="text-slate-400 text-sm max-w-xs">Once you make a purchase, your invoices will appear here for you to download and manage.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Security */}
                <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-tighter">Secure SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-tighter">Processed by Xendit</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
