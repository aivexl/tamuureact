import React from 'react';
import { useStore } from '../../store/useStore';
import { useMerchantProfile } from '../../hooks/queries/useShop';
import { useInvitations } from '../../hooks/queries/useInvitations';
import { m } from 'framer-motion';

const DonutChart: React.FC<{ 
    current: number; 
    max: number; 
    color: string; 
    label: string;
    icon: React.ReactNode;
    customDisplay?: string;
}> = ({ current, max, color, label, icon, customDisplay }) => {
    const size = 64;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // For admins/infinity or full quota, show a full circle (100%)
    const isInfinity = customDisplay === "∞/∞";
    const displayPercentage = isInfinity ? 100 : (max > 0 ? Math.min((current / max) * 100, 100) : 0);
    const offset = circumference - (displayPercentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-slate-100"
                    />
                    {/* Progress Circle */}
                    <m.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[10px] font-black text-slate-900">
                        {customDisplay || `${current}/${max}`}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="text-slate-400">{icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            </div>
        </div>
    );
};

export const DashboardQuotaWidget: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData } = useMerchantProfile(user?.id);
    const { data: invitations = [] } = useInvitations(user?.id);

    // ONLY admin@tamuu.id gets infinity display
    const isSuperAdmin = user?.email === 'admin@tamuu.id';

    // Invitation Quota Logic
    const invCount = invitations.length || 0;
    // Default to 1 if not defined, but use actual value from DB
    const invMax = user?.maxInvitations || 1; 

    // Store Quota Logic
    const storeCount = merchantData?.isMerchant ? 1 : 0;
    const storeMax = 1;

    return (
        <div className="flex justify-around items-center bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm">
            <DonutChart 
                current={invCount} 
                max={invMax} 
                color="#0D9488" // teal-600
                label="Undangan"
                icon={<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
                customDisplay={isSuperAdmin ? "∞/∞" : undefined}
            />
            
            <div className="h-10 w-px bg-slate-100 mx-2" />

            <DonutChart 
                current={storeCount} 
                max={storeMax} 
                color="#4F46E5" // indigo-600
                label="Store"
                icon={<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /></svg>}
                customDisplay={isSuperAdmin ? "∞/∞" : undefined}
            />
        </div>
    );
};
