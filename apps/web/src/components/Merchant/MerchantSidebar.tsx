import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useMerchantProfile } from '../../hooks/queries/useShop';
import { m, AnimatePresence } from 'framer-motion';

// Icons (Lucide-like SVG)
const LayoutDashboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);
const BarChart2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
const StoreIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.71 12 2.5V11h8l-8 12.5V13H4Z" /></svg>
);

interface MerchantSidebarProps {
    isMobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export const MerchantSidebar: React.FC<MerchantSidebarProps> = ({ isMobileMenuOpen, setMobileMenuOpen }) => {
    const user = useStore(s => s.user);
    const { data: merchantData } = useMerchantProfile(user?.id);
    const navigate = useNavigate();

    const merchant = merchantData?.merchant;

    const navItems = [
        { label: 'Overview', icon: LayoutDashboardIcon, path: `/store/${merchant?.slug || 'dashboard'}/dashboard`, exact: true },
        { label: 'Products & Inventory', icon: PackageIcon, path: `/store/${merchant?.slug || 'dashboard'}/products` },
        { label: 'Ads & Growth', icon: ZapIcon, path: `/store/${merchant?.slug || 'dashboard'}/ads` },
        { label: 'Analytics Hub', icon: BarChart2Icon, path: `/store/${merchant?.slug || 'dashboard'}/analytics` },
        { label: 'Shop Settings', icon: SettingsIcon, path: `/store/${merchant?.slug || 'dashboard'}/settings` },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#FBFBFB] border-r border-slate-200 text-slate-600 w-full pt-8 pb-4">
            {/* Header / Store Name */}
            <div className="px-6 mb-10">
                <div className="flex items-center gap-4 mb-6 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FFBF00] to-amber-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {merchant?.logo_url ? (
                            <img src={merchant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <StoreIcon className="w-7 h-7 text-[#0A1128]" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-base font-black text-[#0A1128] leading-tight break-words truncate max-w-[140px] tracking-tight">{merchant?.nama_toko || 'Merchant Portal'}</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-[#FFBF00] shadow-[0_0_8px_rgba(255,191,0,0.5)]"></span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#FFBF00]">Verified Seller</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                <p className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Main Control</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative ${isActive
                                ? 'bg-white text-[#0A1128] shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-slate-200'
                                : 'text-slate-500 hover:bg-white hover:text-[#0A1128] hover:border-slate-100 border border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#FFBF00]' : 'group-hover:text-[#0A1128]'}`} />
                                <span className="tracking-tight">{item.label}</span>
                                {isActive && (
                                    <m.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 w-1.5 h-6 bg-[#FFBF00] rounded-r-full shadow-[0_0_15px_rgba(255,191,0,0.4)]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="px-4 mt-auto space-y-3">
                <a
                    href={`/shop/${merchant?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:border-[#FFBF00]/30 hover:bg-[#FFBF00]/5 transition-all group"
                >
                    <span className="flex items-center gap-3 truncate">
                        <ExternalLinkIcon className="w-4 h-4 text-[#0A1128]" />
                        View Storefront
                    </span>
                </a>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex w-full items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-[#0A1128] transition-all"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    User Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 fixed inset-y-0 left-0 z-40 bg-[#FBFBFB]">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
                        />
                        <m.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-[300px] z-50 lg:hidden"
                        >
                            <SidebarContent />
                        </m.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
