import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    User,
    LayoutDashboard,
    LogOut,
    ChevronDown,
    Menu,
    X,
    CreditCard
} from 'lucide-react';

import { useStore } from '../../store/useStore';

export const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useStore();
    const isLoggedIn = isAuthenticated;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const pos = window.scrollY || document.documentElement.scrollTop;
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

    const isAppRoute = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/user') ||
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/guests') ||
        location.pathname.startsWith('/onboarding') ||
        location.pathname.startsWith('/tools') ||
        (location.pathname === '/invitations' && location.search.includes('onboarding=true'));

    const navLinks = isLoggedIn ? [
        { name: 'Home', path: '/' },
        { name: 'Invitations', path: '/invitations' },
        { name: 'Blog', path: '/blog' },
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
        <header className={`fixed top-0 left-0 right-0 z-[100] flex justify-center transition-all duration-500 ${isAppRoute ? 'px-4 py-2' : 'px-4 pt-6'}`}>
            <nav
                className={`
                    relative w-full transition-all duration-500 ease-spring
                    ${isAppRoute
                        ? 'max-w-full rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-sm'
                        : 'max-w-5xl rounded-full bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
                    }
                    px-5 py-3 md:px-6 md:py-3.5 flex items-center justify-between
                `}
            >
                {/* Logo */}
                <div className="flex items-center shrink-0">
                    {isAppDomain ? (
                        <a href="https://tamuu.id" className="flex items-center gap-3 group" aria-label="Tamuu - Halaman Utama">
                            <img
                                src="/assets/tamuu-logo-header.jpg"
                                alt="Tamuu"
                                className="h-8 md:h-9 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </a>
                    ) : (
                        <Link to="/" className="flex items-center gap-3 group" aria-label="Tamuu - Halaman Utama">
                            <img
                                src="/assets/tamuu-logo-header.jpg"
                                alt="Tamuu"
                                className="h-8 md:h-9 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </Link>
                    )}
                </div>

                {/* Desktop Links */}
                {!isAppRoute && (
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            link.path.startsWith('/#') ? (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded-full transition-all duration-200"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded-full transition-all duration-200"
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                    </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {!isLoggedIn ? (
                        !isAppRoute && (
                            <div className="hidden md:flex items-center gap-2">
                                {isAppDomain ? (
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-black transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                ) : (
                                    <a
                                        href="https://app.tamuu.id/login"
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-black transition-colors"
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
                                    className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    Buat Undangan
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="relative profile-dropdown-container">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border transition-all duration-200 ${isProfileOpen
                                    ? 'bg-slate-100 border-slate-200'
                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <m.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl overflow-hidden z-[110]"
                                    >
                                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.email || 'user@example.com'}</p>
                                        </div>

                                        <div className="p-2 space-y-0.5">
                                            <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                <User className="w-4 h-4" />
                                                <span>Profil Saya</span>
                                            </Link>
                                            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                            <Link to="/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                <CreditCard className="w-4 h-4" />
                                                <span>Billing</span>
                                            </Link>
                                        </div>

                                        <div className="mx-2 h-px bg-slate-100" />

                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    navigate('/');
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
                    )}

                    {/* Mobile Menu Button */}
                    {!isAppRoute && (
                        <button
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Navigation Overlay */}
            {!isAppRoute && (
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <m.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:hidden absolute top-[80px] left-4 right-4 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                        >
                            <div className="p-2 space-y-1">
                                {navLinks.map((link) => (
                                    link.path.startsWith('/#') ? (
                                        <a
                                            key={link.name}
                                            href={link.path}
                                            onClick={(e) => handleNavClick(e, link.path)}
                                            className="block px-6 py-4 text-lg font-bold text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-6 py-4 text-lg font-bold text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    )
                                ))}
                            </div>

                            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                                {!isLoggedIn ? (
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full py-3 text-center font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm"
                                        >
                                            Masuk
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                navigate(isAuthenticated ? '/onboarding' : '/signup');
                                            }}
                                            className="w-full py-3 text-center font-bold text-white bg-black rounded-xl shadow-lg"
                                        >
                                            Buat Undangan
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{user?.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            )}
        </header>
    );
};

