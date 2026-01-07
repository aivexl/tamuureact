import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

// ============================================
// DUMMY USER DATA (Replace with auth later)
// ============================================
const DUMMY_USER = {
    id: 'usr_premium_001',
    tamuuId: 'TAMUU-2025-ANISA-7X9K',
    email: 'anisa.rahma@gmail.com',
    name: 'Anisa Rahma Putri',
    phone: '+62 812 3456 7890',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop&crop=face&q=80',
    gender: 'female' as 'male' | 'female' | '',
    birthDate: '1995-06-15',
    plan: 'premium' as 'free' | 'basic' | 'premium' | 'priority',
    subscriptionStart: '2025-06-15',
    subscriptionEnd: '2026-06-15',
};

// ============================================
// INLINE SVG ICONS (Zero dependency)
// ============================================
const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const ShieldIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const SaveIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);
const CopyIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const LoaderIcon = ({ className }: { className?: string }) => (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
);
const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
    </svg>
);

// ============================================
// TIER CONFIG
// ============================================
const getTierConfig = (plan: string) => {
    const configs: Record<string, { label: string; bgClass: string; textClass: string }> = {
        free: { label: 'FREE', bgClass: 'bg-slate-100', textClass: 'text-slate-700 border-slate-300' },
        basic: { label: 'BASIC', bgClass: 'bg-blue-100', textClass: 'text-blue-700 border-blue-300' },
        premium: { label: 'PREMIUM', bgClass: 'bg-purple-100', textClass: 'text-purple-700 border-purple-300' },
        priority: { label: 'PRIORITY', bgClass: 'bg-amber-100', textClass: 'text-amber-700 border-amber-300' },
    };
    return configs[plan] || configs.free;
};

// ============================================
// MAIN PROFILE PAGE COMPONENT
// ============================================
export const ProfilePage: React.FC = () => {
    const [profileData, setProfileData] = useState({
        name: DUMMY_USER.name,
        phone: DUMMY_USER.phone,
        gender: DUMMY_USER.gender,
        birthDate: DUMMY_USER.birthDate,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isHoveringTamuuId, setIsHoveringTamuuId] = useState(false);

    const tierConfig = getTierConfig(DUMMY_USER.plan);

    useSEO({
        title: 'Account Settings - Tamuu',
        description: 'Manage your profile information and security preferences.',
    });

    const handleInputChange = (field: string, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const copyTamuuId = async () => {
        try {
            await navigator.clipboard.writeText(DUMMY_USER.tamuuId);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                    <p className="mt-2 text-slate-600">Manage your profile information and security preferences.</p>
                </m.div>

                {/* Profile Card */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                    <div className="p-8">
                        {/* Avatar + Name + Tier */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                                    {DUMMY_USER.avatarUrl ? (
                                        <img src={DUMMY_USER.avatarUrl} alt={DUMMY_USER.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-10 h-10 text-indigo-500" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{DUMMY_USER.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${tierConfig.bgClass} ${tierConfig.textClass}`}>
                                        {tierConfig.label}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500 text-sm">{DUMMY_USER.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Active Period Section */}
                        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center shrink-0">
                                        <ClockIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">Masa Aktif Subscription</h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-slate-500">Berakhir pada:</span>
                                                <span className="text-sm font-bold text-indigo-700">
                                                    {new Date(DUMMY_USER.subscriptionEnd).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-slate-500">Status:</span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-black uppercase text-emerald-600">Aktif</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all shadow-sm">
                                        <CreditCardIcon className="w-3.5 h-3.5" />
                                        Invoice
                                    </button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100">
                                        Perpanjang
                                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* Name & Phone Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-all outline-none text-sm"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <PhoneIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-all outline-none text-sm"
                                            placeholder="+62 812..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gender & Birth Date Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Gender */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Gender</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <UsersIcon className="w-4 h-4" />
                                        </div>
                                        <select
                                            value={profileData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-all outline-none text-sm appearance-none"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Birth Date */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Birth Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <CalendarIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="date"
                                            value={profileData.birthDate}
                                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email (Read-only) */}
                            <div className="space-y-1.5 opacity-60">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <MailIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        value={DUMMY_USER.email}
                                        disabled
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Email cannot be changed for security reasons.</p>
                            </div>

                            {/* Tamuu ID (Read-only with Copy) */}
                            <div
                                className="space-y-1.5 group"
                                onMouseEnter={() => setIsHoveringTamuuId(true)}
                                onMouseLeave={() => setIsHoveringTamuuId(false)}
                            >
                                <label className="text-sm font-medium text-slate-700">Tamuu ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <ShieldIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        value={DUMMY_USER.tamuuId}
                                        disabled
                                        className="block w-full pl-10 pr-12 py-2.5 bg-gradient-to-r from-slate-50 to-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-mono text-sm cursor-default tracking-wide"
                                    />
                                    {/* Copy Button */}
                                    {(isHoveringTamuuId || copySuccess) && (
                                        <button
                                            onClick={copyTamuuId}
                                            className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all ${copySuccess ? 'text-emerald-600' : 'text-indigo-500 hover:text-indigo-700'}`}
                                        >
                                            {copySuccess ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Save Button */}
                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div>
                            {saveSuccess && (
                                <m.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 text-emerald-600 text-sm font-medium"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    Profile updated successfully
                                </m.div>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                        >
                            {isSaving ? <LoaderIcon className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </m.div>
            </div>
        </div>
    );
};

export default ProfilePage;
