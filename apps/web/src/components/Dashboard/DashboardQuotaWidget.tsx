import React from 'react';
import { useStore } from '../../store/useStore';
import { useMerchantProfile } from '../../hooks/queries/useShop';
import { useInvitations } from '../../hooks/queries/useInvitations';
import { m } from 'framer-motion';

// ============================================
// INLINE ICONS
// ============================================
const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const StoreIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" />
    </svg>
);

export const DashboardQuotaWidget: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData } = useMerchantProfile(user?.id);
    const { data: invitations = [] } = useInvitations(user?.id);

    const invCount = invitations.length;
    const invMax = user?.maxInvitations || 1;
    const storeCount = merchantData?.isMerchant ? 1 : 0;
    const storeMax = 1;

    return (
        <div className="flex gap-3 px-1">
            {/* Invitation Quota */}
            <m.div 
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
            >
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <MailIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Undangan</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">
                        {invCount}<span className="text-slate-300 font-medium mx-0.5">/</span>{invMax}
                    </p>
                </div>
            </m.div>

            {/* Store Quota */}
            <m.div 
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
            >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <StoreIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Toko</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">
                        {storeCount}<span className="text-slate-300 font-medium mx-0.5">/</span>{storeMax}
                    </p>
                </div>
            </m.div>
        </div>
    );
};
