import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    User,
    LayoutDashboard,
    LogOut,
    ChevronDown,
    Menu,
    X,
    CreditCard,
    ShieldAlert,
    Search,
    MapPin,
    Heart,
    MessageSquare
} from 'lucide-react';

import { useStore } from '../../store/useStore';
import { useChat } from '../../hooks/useChat';
import { NotificationBell } from './NotificationBell';
import { INDONESIA_REGIONS } from '../../constants/regions';
import { getAbsoluteUrl, getIsCrossDomain } from '../../lib/utils';

export const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useStore();
    const isLoggedIn = isAuthenticated;

    // DEBUG: Log user role to console
    useEffect(() => {
        console.log('[Navbar] User from store:', {
            email: user?.email,
            role: user?.role,
            isAuthenticated,
            hasUser: !!user
        });
    }, [user?.role, user?.email, isAuthenticated]);

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('All');
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    // Chat Unread Count Logic
    const { useConversations } = useChat();
    const { data: chatData } = useConversations();
    const totalUnread = useMemo(() => {
        if (!chatData?.conversations) return 0;
        return chatData.conversations.reduce((acc: number, conv: any) => acc + (conv.unread_count_user || 0), 0);
    }, [chatData]);

    useEffect(() => {
        const handleScroll = () => {
            const pos = window.scrollY || document.documentElement.scrollTop;
            setIsScrolled(pos > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const city = params.get('city');
        if (q) setSearchQuery(q);
        if (city) setSelectedCity(city);
    }, [window.location.search]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
        setIsLocationOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isProfileOpen && !target.closest('.profile-dropdown-container')) {
                setIsProfileOpen(false);
            }
            if (isLocationOpen && !target.closest('.location-dropdown-container')) {
                setIsLocationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen, isLocationOpen]);

    const SmartLink = ({ href, className, children, onClick }: { href: string, className?: string, children: React.ReactNode, onClick?: () => void }) => {
        const absoluteUrl = getAbsoluteUrl(href);
        const isCrossDomain = getIsCrossDomain(absoluteUrl);

        if (isCrossDomain) {
            return <a href={absoluteUrl} className={className} onClick={onClick}>{children}</a>;
        }
        // If it's the same domain, strip the domain part so react-router Link handles it as a relative path
        const relativePath = absoluteUrl.replace(/^https?:\/\/[^\/]+/, '');
        return <Link to={relativePath || '/'} className={className} onClick={onClick}>{children}</Link>;
    };

    const isAppRoute = true; // Vite app is basically entirely app routes or heavily proxied routes

    const navLinks = isLoggedIn ? [
        { name: 'Home', path: `/` },
        { name: 'Undangan Digital', path: `/undangan-digital` },
        { name: 'Invitations', path: `/invitations` },
        { name: 'Blog', path: `/blog` },
        { name: 'Dashboard', path: `/dashboard` },
        { name: 'Bantuan', path: `/support` },
    ] : [
        { name: 'Home', path: `/` },
        { name: 'Undangan Digital', path: `/undangan-digital` },
        { name: 'Invitations', path: `/invitations` },
        { name: 'Blog', path: `/blog` },
        { name: 'Fitur', path: `/undangan-digital#features` },
        { name: 'Harga', path: `/undangan-digital#pricing` },
    ];

    const handleNavClick = (e: React.MouseEvent, path: string) => {
        if (path.includes('#')) {
            const id = path.split('#')[1];
            const element = document.getElementById(id);
            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
            }
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (selectedCity !== 'All') params.append('city', selectedCity);
        
        const targetUrl = getAbsoluteUrl(`/?${params.toString()}`);
        if (getIsCrossDomain(targetUrl)) {
            window.location.href = targetUrl;
        } else {
            navigate(`/?${params.toString()}`);
        }
    };

    const filteredCities = useMemo(() => {
        const cleanQuery = citySearchQuery.trim().toLowerCase();
        const baseCities = ['All', ...INDONESIA_REGIONS];
        if (!cleanQuery) return baseCities;
        return baseCities.filter(city => city.toLowerCase().includes(cleanQuery));
    }, [citySearchQuery]);

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-500`}>
                <div className={`w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-sm ${isAppRoute ? 'py-2' : ''}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between h-16 gap-4">
                            
                            <div className="flex items-center shrink-0">
                                {/* ALWAYS use <a> for logo to ensure clean cross-domain root landing */}
                                <a href={getAbsoluteUrl('/')} className="flex items-center gap-3 group" aria-label="Tamuu - Halaman Utama">
                                    <img
                                        src="/images/logo-tamuu-vfinal-v1.webp"
                                        alt="Tamuu"
                                        className="h-7 md:h-9 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                </a>
                            </div>

                            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-auto items-center bg-slate-100/80 border border-slate-200 rounded-full px-2 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FFBF00]/20 focus-within:border-[#FFBF00]/30 transition-all">
                                <div className="relative location-dropdown-container">
                                    <div 
                                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-200/50 rounded-full cursor-pointer transition-all"
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-[#FFBF00]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0A1128] whitespace-nowrap max-w-[100px] truncate">
                                            {selectedCity === 'All' ? 'Indonesia' : selectedCity}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isLocationOpen && (
                                            <m.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 mt-3 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[120] overflow-hidden flex flex-col max-h-[350px]"
                                            >
                                                <div className="p-3 border-b border-slate-50">
                                                    <input 
                                                        type="text"
                                                        placeholder="Cari wilayah..."
                                                        value={citySearchQuery}
                                                        onChange={(e) => setCitySearchQuery(e.target.value)}
                                                        className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-0"
                                                    />
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                                                    {filteredCities.map((city) => (
                                                        <button
                                                            key={city}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCity(city);
                                                                setIsLocationOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#0A1128]"
                                                        >
                                                            {city === 'All' ? 'Seluruh Indonesia' : city}
                                                        </button>
                                                    ))}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="w-px h-5 bg-slate-300 mx-1" />

                                <div className="flex-1 flex items-center px-2">
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Cari vendor, catering, atau paket..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-[#0A1128] py-1 px-2 placeholder:text-slate-400"
                                    />
                                </div>
                                
                                <button type="submit" className="w-8 h-8 rounded-full bg-[#FFBF00] flex items-center justify-center text-[#0A1128] hover:bg-[#e5ac00] transition-colors shrink-0">
                                    <Search className="w-3.5 h-3.5" />
                                </button>
                            </form>

                            <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                                {!isLoggedIn ? (
                                    <div className="hidden md:flex items-center gap-2">
                                        <a
                                            href={getAbsoluteUrl('/login')}
                                            className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-black transition-colors"
                                        >
                                            Masuk
                                        </a>
                                        <a
                                            href={getAbsoluteUrl('/signup')}
                                            className="bg-[#0A1128] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300"
                                        >
                                            Buat Undangan
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <SmartLink
                                            href="/dashboard?tab=wishlist"
                                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-rose-500 transition-all"
                                        >
                                            <Heart className="w-5 h-5" />
                                        </SmartLink>
                                        
                                        <SmartLink
                                            href="/dashboard?tab=messages"
                                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all relative"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            {totalUnread > 0 && (
                                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                                            )}
                                        </SmartLink>

                                        <NotificationBell />
                                        
                                        <div className="relative profile-dropdown-container">
                                            <button
                                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                                className={`flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border transition-all duration-200 ${isProfileOpen
                                                    ? 'bg-slate-100 border-slate-200'
                                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'
                                                    }`}
                                            >
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                    {user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isProfileOpen && (
                                                    <m.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                                                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl overflow-hidden z-[110]"
                                                    >
                                                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Signed in as</p>
                                                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.email || 'user@example.com'}</p>
                                                        </div>

                                                        <div className="p-2 space-y-0.5">
                                                            <SmartLink href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                                <User className="w-4 h-4" />
                                                                <span>Profil Saya</span>
                                                            </SmartLink>
                                                            <SmartLink href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                                <LayoutDashboard className="w-4 h-4" />
                                                                <span>Dashboard</span>
                                                            </SmartLink>
                                                            {user?.role === 'admin' && (
                                                                <SmartLink href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition-colors">
                                                                    <ShieldAlert className="w-4 h-4" />
                                                                    <span>Admin Dashboard</span>
                                                                </SmartLink>
                                                            )}
                                                            <SmartLink href="/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                                <CreditCard className="w-4 h-4" />
                                                                <span>Billing</span>
                                                            </SmartLink>
                                                        </div>

                                                        <div className="mx-2 h-px bg-slate-100" />

                                                        <div className="p-2">
                                                            <button
                                                                onClick={() => {
                                                                    logout();
                                                                    window.location.href = getAbsoluteUrl('/');
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                                            >
                                                                <LogOut className="w-4 h-4" />
                                                                <span>Sign Out</span>
                                                            </button>
                                                        </div>
                                                    </m.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center gap-6 py-2 border-t border-slate-100">
                            {navLinks.map((link) => (
                                <SmartLink
                                    key={link.name}
                                    href={link.path}
                                    className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0A1128] transition-colors"
                                >
                                    {link.name}
                                </SmartLink>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-white/95 backdrop-blur-2xl pt-[140px] px-6 pb-6 overflow-y-auto"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <SmartLink
                                    key={link.name}
                                    href={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-black text-slate-800"
                                >
                                    {link.name}
                                </SmartLink>
                            ))}
                        </div>

                        {!isLoggedIn && (
                            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col gap-4">
                                <a
                                    href={getAbsoluteUrl('/login')}
                                    className="w-full py-4 text-center font-bold text-slate-700 bg-slate-100 rounded-2xl"
                                >
                                    Masuk
                                </a>
                                <a
                                    href={getAbsoluteUrl('/signup')}
                                    className="w-full py-4 text-center font-bold text-white bg-[#0A1128] rounded-2xl"
                                >
                                    Buat Undangan
                                </a>
                            </div>
                        )}
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
};
