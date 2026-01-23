import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useProfileStore } from '../store/useProfileStore';
import { useNavigate } from 'react-router-dom';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { motion as m } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { useSubscriptionTimer } from '../hooks/useSubscriptionTimer';

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
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

// ============================================
// TIER CONFIG
// ============================================
const getTierConfig = (plan: string) => {
    const configs: Record<string, { label: string; bgClass: string; textClass: string }> = {
        free: { label: 'FREE EXPLORER', bgClass: 'bg-slate-100', textClass: 'text-slate-700 border-slate-200' },
        vip: { label: 'VIP PREMIERE', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700 border-indigo-200' },
        vvip: { label: 'VVIP EXCLUSIVE', bgClass: 'bg-amber-100', textClass: 'text-amber-700 border-amber-200' },
    };
    return configs[plan.toLowerCase()] || configs.free;
};

// ============================================
// MAIN PROFILE PAGE COMPONENT
// ============================================
export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useStore();
    const { profile, fetchProfile, updateProfile, isLoading: isStoreLoading } = useProfileStore();
    const subStatus = useSubscriptionTimer(profile?.expires_at || null);

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        gender: '' as 'male' | 'female' | '',
        birthDate: '',
        bank1Name: '',
        bank1Number: '',
        bank1Holder: '',
        bank2Name: '',
        bank2Number: '',
        bank2Holder: '',
        emoneyType: '' as 'dana' | 'shopeepay' | '',
        emoneyNumber: '',
        giftAddress: '',
    });

    const [activeTab, setActiveTab] = useState<'profile' | 'gift'>('profile');

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isHoveringTamuuId, setIsHoveringTamuuId] = useState(false);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Initial fetch
    React.useEffect(() => {
        if (user?.email) {
            fetchProfile(user.email);
        }
    }, [user?.email, fetchProfile]);

    // Sync local form with store profile
    React.useEffect(() => {
        if (profile) {
            setProfileData({
                name: profile.name || '',
                phone: profile.phone || '',
                gender: (profile.gender as 'male' | 'female' | '') || '',
                birthDate: profile.birthDate || '',
                bank1Name: profile.bank1Name || '',
                bank1Number: profile.bank1Number || '',
                bank1Holder: profile.bank1Holder || '',
                bank2Name: profile.bank2Name || '',
                bank2Number: profile.bank2Number || '',
                bank2Holder: profile.bank2Holder || '',
                emoneyType: (profile.emoneyType as 'dana' | 'shopeepay' | '') || '',
                emoneyNumber: profile.emoneyNumber || '',
                giftAddress: profile.giftAddress || '',
            });
        }
    }, [profile]);

    const tierConfig = getTierConfig(profile?.tier || 'free');

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

        const success = await updateProfile(profileData);

        setIsSaving(false);
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const copyTamuuId = async () => {
        if (!profile?.tamuuId) return;
        try {
            await navigator.clipboard.writeText(profile.tamuuId);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (isStoreLoading && !profile) {
        return (
            <PremiumLoader showLabel label="Synchronizing Identity..." />
        );
    }

    if (!profile) return null;

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
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-10 h-10 text-indigo-500" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{profile.name || 'Set your name'}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${tierConfig.bgClass} ${tierConfig.textClass}`}>
                                        {tierConfig.label}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500 text-sm">{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-10 w-fit">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Informasi Profil
                            </button>
                            <button
                                onClick={() => setActiveTab('gift')}
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'gift' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Kado Digital
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="min-h-[400px]">
                            {activeTab === 'profile' && (
                                <m.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Super Ultra Subscription Active Period Section */}
                                    <m.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mb-12 rounded-[2.5rem] border transition-all duration-700 overflow-hidden relative group shadow-2xl shadow-indigo-100/20 ${subStatus.urgency === 'critical' || subStatus.isExpired
                                                ? 'bg-rose-50/30 border-rose-100'
                                                : subStatus.urgency === 'high'
                                                    ? 'bg-amber-50/30 border-amber-100'
                                                    : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <div className="p-8 relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                                <div className="flex items-center gap-8">
                                                    {/* Status Icon Wrapper */}
                                                    <div className="relative">
                                                        <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 ${subStatus.isExpired ? 'bg-rose-600 text-white shadow-rose-200' :
                                                                subStatus.urgency === 'critical' ? 'bg-rose-500 text-white shadow-rose-200 animate-pulse' :
                                                                    subStatus.urgency === 'high' ? 'bg-amber-500 text-white shadow-amber-200' :
                                                                        'bg-indigo-600 text-white shadow-indigo-100'
                                                            }`}>
                                                            <ClockIcon className="w-10 h-10" />
                                                        </div>
                                                        {subStatus.isExpired && (
                                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center border-2 border-white font-black text-[10px] animate-bounce">
                                                                !
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Masa Aktif</h3>
                                                            <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${subStatus.isExpired
                                                                    ? 'bg-rose-100 text-rose-600 border-rose-200'
                                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                                }`}>
                                                                {!subStatus.isExpired && (
                                                                    <span className="relative flex h-2 w-2">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                    </span>
                                                                )}
                                                                {subStatus.isExpired ? 'Masa Berlaku Habis' : 'Layanan Aktif'}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <div className={`text-4xl font-bold tracking-tight font-outfit transition-colors duration-500 ${subStatus.isExpired ? 'text-rose-600' :
                                                                    subStatus.urgency === 'critical' ? 'text-rose-500' :
                                                                        subStatus.urgency === 'high' ? 'text-amber-600' :
                                                                            'text-slate-900'
                                                                }`}>
                                                                {(profile?.email === 'user@tamuu.id' || profile?.email === 'admin@tamuu.id')
                                                                    ? 'Unlimited Activation'
                                                                    : (profile?.expires_at ? subStatus.label : 'Free Forever')}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                                                                {subStatus.isExpired ? (
                                                                    <span className="text-rose-600/80 font-bold uppercase tracking-wider text-[11px]">Data dihapus dalam {30 - subStatus.daysSinceExpiry} hari</span>
                                                                ) : (profile?.email === 'user@tamuu.id' || profile?.email === 'admin@tamuu.id') ? (
                                                                    <span className="text-indigo-500 font-bold uppercase tracking-[0.1em] text-[11px]">Super Ultra Unlimited Access</span>
                                                                ) : profile?.expires_at ? (
                                                                    <span className="opacity-80">Aktif hingga {new Date(profile.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                ) : (
                                                                    <span className="opacity-80">Akun Tamuu Basic Explorer</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => navigate('/dashboard?tab=invoice')}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold rounded-[1.25rem] border border-slate-200 transition-all shadow-sm active:scale-95 uppercase tracking-widest whitespace-nowrap"
                                                    >
                                                        <CreditCardIcon className="w-4 h-4" />
                                                        Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/billing')}
                                                        className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-3.5 text-white text-xs font-bold rounded-[1.25rem] transition-all shadow-lg active:scale-95 uppercase tracking-widest ${subStatus.urgency === 'critical' || subStatus.isExpired
                                                                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                                                            }`}
                                                    >
                                                        Perpanjang
                                                        <ExternalLinkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Advanced Progress Bar */}
                                            {!subStatus.isExpired && profile?.expires_at && (
                                                <div className="mt-10">
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                                        <m.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.max(2, (subStatus.days / 365) * 100)}%` }}
                                                            transition={{ duration: 2, ease: "circOut" }}
                                                            className={`h-full rounded-full relative ${subStatus.urgency === 'critical' ? 'bg-rose-500' :
                                                                    subStatus.urgency === 'high' ? 'bg-amber-500' :
                                                                        'bg-indigo-600'
                                                                }`}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilized Balance</span>
                                                        <span className="text-[10px] font-black text-slate-900 uppercase">
                                                            {subStatus.days} Hari Tersisa
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </m.div>

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
                                                value={profile.email}
                                                disabled
                                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                                            />
                                        </div>
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
                                                value={profile.tamuuId}
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
                                </m.div>
                            )}

                            {activeTab === 'gift' && (
                                <m.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Bank Accounts Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                                <CreditCardIcon className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">Rekening Bank (Maks. 2)</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                            {/* Bank 1 */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Bank Utama #1</h4>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        value={profileData.bank1Name}
                                                        onChange={(e) => handleInputChange('bank1Name', e.target.value)}
                                                        className="block w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                                        placeholder="Nama Bank (e.g. BCA)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={profileData.bank1Number}
                                                        onChange={(e) => handleInputChange('bank1Number', e.target.value)}
                                                        className="block w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                                                        placeholder="Nomor Rekening"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={profileData.bank1Holder}
                                                        onChange={(e) => handleInputChange('bank1Holder', e.target.value)}
                                                        className="block w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                        placeholder="Atas Nama"
                                                    />
                                                </div>
                                            </div>

                                            {/* Bank 2 */}
                                            <div className="space-y-4 pt-8 md:pt-0 md:border-l md:pl-8 border-slate-200">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Bank Alternatif #2</h4>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        value={profileData.bank2Name}
                                                        onChange={(e) => handleInputChange('bank2Name', e.target.value)}
                                                        className="block w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                                        placeholder="Nama Bank (e.g. Mandiri)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={profileData.bank2Number}
                                                        onChange={(e) => handleInputChange('bank2Number', e.target.value)}
                                                        className="block w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                                                        placeholder="Nomor Rekening"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={profileData.bank2Holder}
                                                        onChange={(e) => handleInputChange('bank2Holder', e.target.value)}
                                                        className="block w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                        placeholder="Atas Nama"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* E-Money Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <PhoneIcon className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">E-Money</h3>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex flex-col sm:flex-row gap-6">
                                            <div className="w-full sm:w-1/3">
                                                <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">Provider</label>
                                                <select
                                                    value={profileData.emoneyType}
                                                    onChange={(e) => handleInputChange('emoneyType', e.target.value)}
                                                    className="block w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold appearance-none"
                                                >
                                                    <option value="">Pilih E-Money</option>
                                                    <option value="dana">DANA</option>
                                                    <option value="shopeepay">ShopeePay</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">Nomor HP</label>
                                                <input
                                                    type="text"
                                                    value={profileData.emoneyNumber}
                                                    onChange={(e) => handleInputChange('emoneyNumber', e.target.value)}
                                                    className="block w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                                                    placeholder="08xx xxxx xxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gift Address Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <MapPinIcon className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">Alamat Pengiriman Kado Fisik</h3>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100">
                                            <textarea
                                                value={profileData.giftAddress}
                                                onChange={(e) => handleInputChange('giftAddress', e.target.value)}
                                                className="block w-full px-4 py-3 bg-white border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
                                                rows={4}
                                                placeholder="Contoh: BSD City, Tangerang, Banten (UP: Jane Doe / 08123456789)"
                                            />
                                            <p className="mt-3 text-xs text-indigo-400 font-medium italic">
                                                *Alamat ini akan ditampilkan di bagian 'Kirim Kado' untuk memudahkan tamu mengirim kado fisik.
                                            </p>
                                        </div>
                                    </div>
                                </m.div>
                            )}
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
                            {isSaving ? <PremiumLoader variant="inline" size="sm" color="white" /> : <SaveIcon className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </m.div>
            </div>
        </div>
    );
};

export default ProfilePage;
