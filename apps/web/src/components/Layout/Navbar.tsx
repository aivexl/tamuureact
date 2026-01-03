import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollPos, setScrollPos] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const pos = window.scrollY || document.documentElement.scrollTop;
            setScrollPos(pos);
            setIsScrolled(pos > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Dark theme when scrolled past 800px on landing page
    const isLandingPage = location.pathname === '/';
    const isDarkTheme = !isLandingPage || scrollPos > 800;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Invitations', path: '/admin/templates' },
        { name: 'Fitur', path: '/#features' },
        { name: 'Harga', path: '/#pricing' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out px-4 md:px-8 ${isScrolled
                ? 'backdrop-blur-2xl bg-white/5 border-b border-white/5 shadow-2xl py-2'
                : 'py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div
                        className={`w-10 h-10 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${isScrolled ? 'shadow-rose-500/20' : 'shadow-rose-500/40'
                            }`}
                    >
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span
                        className={`text-2xl font-black transition-all duration-500 tracking-tighter transform translate-y-[1px] ${isDarkTheme ? 'text-slate-900' : 'text-white'
                            }`}
                    >
                        Tamuu
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        {navLinks.map((link) => (
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
                        ))}
                    </div>

                    <div className={`h-6 w-[1px] ${isDarkTheme ? 'bg-slate-200' : 'bg-white/20'}`} />

                    {/* Auth Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/templates"
                            className={`text-sm font-bold transition-colors px-4 py-2 ${isDarkTheme
                                ? 'text-slate-700 hover:text-rose-600'
                                : 'text-white hover:text-white'
                                }`}
                        >
                            Masuk
                        </Link>
                        <Link
                            to="/editor"
                            className={`group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isDarkTheme
                                ? 'bg-[#0A1128] text-white shadow-xl shadow-slate-200 hover:bg-rose-600 hover:shadow-rose-100'
                                : 'bg-white text-[#0A1128] shadow-xl shadow-rose-950/20 hover:bg-rose-50'
                                }`}
                        >
                            Buat Undangan
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`lg:hidden p-2 rounded-xl transition-colors ${isDarkTheme
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-white hover:bg-white/10'
                        }`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
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
                            ))}

                            <div className={`h-[1px] my-1 ${isDarkTheme ? 'bg-slate-100' : 'bg-white/5'}`} />

                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/admin/templates"
                                    className={`text-center py-3 font-extrabold rounded-xl border transition-all ${isDarkTheme
                                        ? 'text-slate-900 border-slate-200 hover:bg-slate-50'
                                        : 'text-white border-white/20 hover:bg-white/10'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/editor"
                                    className={`text-center py-3 font-extrabold rounded-xl shadow-lg transition-all ${isDarkTheme
                                        ? 'bg-[#0A1128] text-white shadow-[#0A1128]/20'
                                        : 'bg-white text-[#0A1128] shadow-white/10'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Buat Undangan
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
