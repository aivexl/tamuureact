import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-premium-accent flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Tamuu<span className="text-premium-accent">.</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Platform undangan digital hiper-interaktif tercanggih untuk momen spesial Anda. Buat, kustomisasi, dan bagikan dalam hitungan menit.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-premium-accent hover:border-premium-accent transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-premium-accent hover:border-premium-accent transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-premium-accent hover:border-premium-accent transition-all">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Produk</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li><Link to="/editor" className="hover:text-premium-accent">Editor Visual</Link></li>
                            <li><Link to="/tools/background-remover" className="hover:text-premium-accent">AI Background Remover</Link></li>
                            <li><a href="#" className="hover:text-premium-accent">Template Gallery</a></li>
                            <li><a href="#" className="hover:text-premium-accent">Fitur Premium</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Dukungan</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li><a href="#" className="hover:text-premium-accent">Pusat Bantuan</a></li>
                            <li><a href="#" className="hover:text-premium-accent">Panduan Desain</a></li>
                            <li><a href="#" className="hover:text-premium-accent">Kontak Kami</a></li>
                            <li><a href="#" className="hover:text-premium-accent">API Documentation</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Stay Updated</h4>
                        <p className="text-gray-500 text-sm mb-4">Dapatkan tips desain dan info diskon terbaru.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-premium-accent/20 focus:border-premium-accent transition-all"
                            />
                            <button className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-premium-accent flex items-center justify-center text-white">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-400 font-medium">
                        © 2024 Tamuu Studio. Dipersembahkan dengan ❤️ di Indonesia.
                    </p>
                    <div className="flex gap-8 text-xs text-gray-400 font-medium tracking-wide font-sans">
                        <a href="#" className="hover:text-gray-900">PRIVACY POLICY</a>
                        <a href="#" className="hover:text-gray-900">TERMS OF SERVICE</a>
                        <a href="#" className="hover:text-gray-900">COOKIES</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
