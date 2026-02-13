import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    User,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronDown,
    Sparkles,
    CreditCard
} from 'lucide-react';

import { useStore } from '../../store/useStore';

export const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useStore();
    const isLoggedIn = isAuthenticated;

    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollPos, setScrollPos] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const pos = window.scrollY || document.documentElement.scrollTop;
            setScrollPos(pos);
            setIsScrolled(pos > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isProfileOpen && !target.closest('.profile-dropdown-container')) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    // Theme logic for landing page:
    // - Hero (0-700px): dark background -> light text (isDarkTheme = false)
    // - Features/Pricing (700-2000px): white background -> dark text (isDarkTheme = true)
    // - Testimonials/CTA (2000px+): dark background -> light text (isDarkTheme = false)
    const isLandingPage = location.pathname === '/';
    const isAppRoute = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/user') ||
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/guests') ||
        location.pathname.startsWith('/onboarding') ||
        location.pathname.startsWith('/tools') ||
        (location.pathname === '/invitations' && location.search.includes('onboarding=true'));


    const isInWhiteSection = scrollPos > 700 && scrollPos < 2000;
    const isDarkTheme = !isLandingPage || isInWhiteSection;


    const navLinks = isLoggedIn ? [
        { name: 'Home', path: '/' },
        { name: 'Invitations', path: '/invitations' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Event Saya', path: '/dashboard' },
        { name: 'Bantuan', path: '/support' },
    ] : [
        { name: 'Home', path: '/' },
        { name: 'Invitations', path: '/invitations' },
        { name: 'Blog', path: '/blog' },
        { name: 'Fitur', path: '/#features' },
        { name: 'Harga', path: '/#pricing' },
    ];

    const isAppDomain = window.location.hostname.startsWith('app.') ||
        window.location.hostname.includes('tamuu-app');

    const handleNavClick = (e: React.MouseEvent, path: string) => {
        if (path.startsWith('/#')) {
            const id = path.split('#')[1];
            const element = document.getElementById(id);
            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
            }
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out px-4 md:px-8 ${isScrolled || isAppRoute
                ? 'backdrop-blur-2xl bg-white/80 border-b border-slate-200 shadow-sm py-2'
                : 'py-4'
                }`}
        >
            <div className={`${isAppRoute ? 'w-full' : 'max-w-7xl'} mx-auto flex items-center justify-between`}>
                {/* Logo */}
                {isAppDomain ? (
                    <a href="https://tamuu.id" className="flex items-center gap-3 group" aria-label="Tamuu - Halaman Utama">
                        <div
                            className={`w-10 h-10 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${isScrolled || isAppRoute ? 'shadow-rose-500/20' : 'shadow-rose-500/40'
                                }`}
                        >
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /></svg>
                        </div>
                        <span
                            className={`text-2xl font-black transition-all duration-500 tracking-tighter transform translate-y-[1px] ${isDarkTheme || isAppRoute ? 'text-slate-900' : 'text-white'
                                }`}
                        >
                            Tamuu
                        </span>
                    </a>
                ) : (
                    <Link to="/" className="flex items-center gap-3 group" aria-label="Tamuu - Halaman Utama">
                        <div
                            className={`w-10 h-10 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${isScrolled || isAppRoute ? 'shadow-rose-500/20' : 'shadow-rose-500/40'
                                }`}
                        >
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /></svg>
                        </div>
                        <span
                            className={`text-2xl font-black transition-all duration-500 tracking-tighter transform translate-y-[1px] ${isDarkTheme || isAppRoute ? 'text-slate-900' : 'text-white'
                                }`}
                        >
                            Tamuu
                        </span>
                    </Link>
                )}

                {/* Desktop Navigation */}
                {!isAppRoute && (
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            link.path.startsWith('/#') ? (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    className={`text-sm font-semibold transition-colors duration-200 cursor-pointer ${isDarkTheme
                                        ? 'text-slate-600 hover:text-rose-600'
                                        : 'text-white/90 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-semibold transition-colors duration-200 ${isDarkTheme
                                        ? 'text-slate-600 hover:text-rose-600'
                                        : 'text-white/90 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                    </div>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {!isLoggedIn ? (
                        !isAppRoute && (
                            <div className="hidden lg:flex items-center gap-4">
                                {isAppDomain ? (
                                    <Link
                                        to="/login"
                                        className={`text-sm font-bold transition-colors px-4 py-2 ${isDarkTheme
                                            ? 'text-slate-700 hover:text-rose-600'
                                            : 'text-white hover:text-white'
                                            }`}
                                    >
                                        Masuk
                                    </Link>
                                ) : (
                                    <a
                                        href="https://app.tamuu.id/login"
                                        className={`text-sm font-bold transition-colors px-4 py-2 ${isDarkTheme
                                            ? 'text-slate-700 hover:text-rose-600'
                                            : 'text-white hover:text-white'
                                            }`}
                                    >
                                        Masuk
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        if (isAppDomain) {
                                            navigate(isAuthenticated ? '/onboarding' : '/login?redirect=/onboarding');
                                        } else {
                                            window.location.href = 'https://app.tamuu.id/signup';
                                        }
                                    }}
                                    className={`group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isDarkTheme
                                        ? 'bg-[#0A1128] text-white shadow-xl shadow-slate-200 hover:bg-rose-600 hover:shadow-rose-100'
                                        : 'bg-white text-[#0A1128] shadow-xl shadow-rose-950/20 hover:bg-rose-50'
                                        }`}
                                >
                                    Buat Undangan
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="relative profile-dropdown-container">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 md:gap-3 pl-2 md:pl-4 py-1 pr-1 md:pr-2 rounded-2xl transition-all ${isProfileOpen
                                    ? (isDarkTheme ? 'bg-slate-100' : 'bg-white/10')
                                    : (isDarkTheme ? 'hover:bg-slate-50' : 'hover:bg-white/5')
                                    }`}
                            >
                                <div className="flex flex-col items-end hidden md:flex">
                                    <span className={`text-sm font-bold leading-tight ${isDarkTheme ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'User'}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${user?.tier === 'vvip' ? 'text-[#FFBF00]' : user?.tier === 'platinum' ? 'text-emerald-500' : user?.tier === 'vip' ? 'text-indigo-500' : 'text-slate-400'}`}>
                                        {user?.tier === 'vvip' ? 'ELITE EXCLUSIVE' : user?.tier === 'platinum' ? 'ULTIMATE EVENT' : user?.tier === 'vip' ? 'PRO ACCESS' : 'FREE EXPLORER'}
                                    </span>
                                </div>
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-teal-500/20 ring-2 ring-white/10 group-hover:ring-teal-500 transition-all">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''} ${isDarkTheme ? 'text-slate-400' : 'text-white/40'}`} />
                            </button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <m.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl border z-[110] ${isDarkTheme
                                            ? 'bg-white border-slate-100'
                                            : 'bg-[#0F172A] border-white/10'
                                            }`}
                                    >
                                        <div className={`p-4 border-b ${isDarkTheme ? 'bg-slate-50/50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                            <p className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${isDarkTheme ? 'text-slate-400' : 'text-white/30'}`}>Akun Anda</p>
                                            <p className={`font-bold truncate ${isDarkTheme ? 'text-slate-900' : 'text-white'}`}>{user?.email || 'user@example.com'}</p>
                                        </div>

                                        <div className="p-2">
                                            <Link to="/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDarkTheme ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                                                <User className="w-4 h-4" />
                                                <span className="text-sm font-bold">Profil Saya</span>
                                            </Link>
                                            <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDarkTheme ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span className="text-sm font-bold">Dashboard Saya</span>
                                            </Link>
                                            <Link to="/billing" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDarkTheme ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                                                <CreditCard className="w-4 h-4" />
                                                <span className="text-sm font-bold">Langganan & Billing</span>
                                            </Link>
                                        </div>

                                        <div className={`mx-2 h-px ${isDarkTheme ? 'bg-slate-100' : 'bg-white/5'}`} />

                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    navigate('/');
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm font-bold">Keluar Aplikasi</span>
                                            </button>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Mobile Menu Button - only on landing/non-app routes */}
                    {!isAppRoute && (
                        <button
                            className={`lg:hidden p-2 rounded-xl transition-colors ${isDarkTheme
                                ? 'text-slate-600 hover:bg-slate-100'
                                : 'text-white hover:bg-white/10'
                                }`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen
                                ? <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                : <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                            }
                        </button>
                    )}
                </div>
            </div>{/* Mobile Navigation - only on landing */}
            {!isAppRoute && (
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`lg:hidden absolute top-full left-0 right-0 backdrop-blur-3xl border-b shadow-2xl p-6 ${isDarkTheme
                                ? 'bg-white/98 border-slate-100 shadow-slate-200/50'
                                : 'bg-[#0A1128]/98 border-white/5 shadow-black/20'
                                }`}
                        >
                            <div className="flex flex-col gap-5">
                                {navLinks.map((link) => (
                                    link.path.startsWith('/#') ? (
                                        <a
                                            key={link.name}
                                            href={link.path}
                                            onClick={(e) => handleNavClick(e, link.path)}
                                            className={`text-lg font-bold px-4 py-2 rounded-xl transition-all ${isDarkTheme
                                                ? 'text-slate-900 hover:bg-slate-50'
                                                : 'text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={`text-lg font-bold px-4 py-2 rounded-xl transition-all ${isDarkTheme
                                                ? 'text-slate-900 hover:bg-slate-50'
                                                : 'text-white hover:bg-white/10'
                                                }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    )
                                ))}

                                <div className={`h-[1px] my-1 ${isDarkTheme ? 'bg-slate-100' : 'bg-white/5'}`} />

                                <div className="flex flex-col gap-3">
                                    {!isLoggedIn ? (
                                        <>
                                            <Link
                                                to="/login"
                                                className={`text-center py-3 font-extrabold rounded-xl border transition-all ${isDarkTheme
                                                    ? 'text-slate-900 border-slate-200 hover:bg-slate-50'
                                                    : 'text-white border-white/20 hover:bg-white/10'
                                                    }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Masuk
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    if (isAuthenticated) {
                                                        navigate('/onboarding');
                                                    } else {
                                                        navigate('/login?redirect=/onboarding');
                                                    }
                                                }}
                                                className={`text-center py-3 font-extrabold rounded-xl shadow-lg transition-all ${isDarkTheme
                                                    ? 'bg-[#0A1128] text-white shadow-[#0A1128]/20'
                                                    : 'bg-white text-[#0A1128] shadow-white/10'
                                                    }`}
                                            >
                                                Buat Undangan
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDarkTheme ? 'bg-slate-50' : 'bg-white/5'}`}>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg">
                                                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${isDarkTheme ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'User'}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${user?.tier === 'vvip' ? 'text-[#FFBF00]' : user?.tier === 'platinum' ? 'text-emerald-500' : user?.tier === 'vip' ? 'text-indigo-500' : 'text-slate-400'}`}>
                                                    {user?.tier === 'vvip' ? 'ELITE EXCLUSIVE' : user?.tier === 'platinum' ? 'ULTIMATE EVENT' : user?.tier === 'vip' ? 'PRO ACCESS' : 'FREE EXPLORER'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            )}

        </nav>
    );
};
