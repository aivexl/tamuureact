import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Fitur', path: '/#features' },
        { name: 'Contoh', path: '/#samples' },
        { name: 'Harga', path: '/#pricing' },
        { name: 'Testimonial', path: '/#testimonials' },
    ];

    const isLightPage = location.pathname === '/';

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 py-3'
                    : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-premium-accent to-[#d4bc9a] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xl font-bold tracking-tight ${isLightPage ? 'text-gray-900' : 'text-white'}`}>
                        Tamuu<span className="text-premium-accent">.</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.path}
                            className={`text-sm font-medium transition-colors hover:text-premium-accent ${isLightPage ? 'text-gray-600' : 'text-white/70'
                                }`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="h-4 w-[1px] bg-gray-200 mx-2" />
                    <Link
                        to="/admin/templates"
                        className={`text-sm font-medium transition-colors hover:text-premium-accent ${isLightPage ? 'text-gray-900' : 'text-white'
                            }`}
                    >
                        Masuk
                    </Link>
                    <Link
                        to="/editor"
                        className="px-5 py-2.5 rounded-full bg-premium-accent text-white text-sm font-semibold shadow-lg shadow-premium-accent/20 hover:bg-opacity-90 transition-all hover:-translate-y-0.5"
                    >
                        Buat Undangan
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-gray-900"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-gray-100" />
                            <Link
                                to="/admin/templates"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-medium text-gray-900"
                            >
                                Masuk
                            </Link>
                            <Link
                                to="/editor"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-4 rounded-2xl bg-premium-accent text-white text-center font-bold"
                            >
                                Buat Undangan Sekarang
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
