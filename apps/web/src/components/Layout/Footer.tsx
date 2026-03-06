import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Facebook, Youtube, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0A1128] pt-20 pb-10 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo-tamuu.webp" alt="Tamuu Logo" className="h-8 sm:h-10 w-auto brightness-0 invert" draggable="false" />
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            Platform undangan digital tercanggih di Indonesia. Menghadirkan kemewahan dan kemudahan dalam setiap momen berharga Anda.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="Instagram Tamuu">
                                <Instagram className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="X Tamuu">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="Facebook Tamuu">
                                <Facebook className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="YouTube Tamuu">
                                <Youtube className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="TikTok Tamuu">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-xs mb-8">Platform</h2>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">About Us</Link></li>
                            <li><a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Fitur</a></li>
                            <li><a href="#pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Harga</a></li>
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-xs mb-8">Bantuan</h2>
                        <ul className="space-y-4">
                            <li><Link to="/contact" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Contact Support</Link></li>
                            <li><Link to="/terms" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Privacy Policy</Link></li>
                            <li><Link to="/refund" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-xs mb-8">Hubungi Kami</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-slate-300 group">
                                <Mail className="w-4 h-4 text-[#FFBF00] flex-shrink-0" aria-hidden="true" />
                                <span className="text-xs font-bold uppercase tracking-tight break-all">cs@tamuu.id</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <MapPin className="w-4 h-4 text-[#FFBF00] mt-1" aria-hidden="true" />
                                <span className="text-xs font-bold uppercase tracking-tight">BSD, Tangerang, Banten, Indonesia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-white/5 mb-10" aria-hidden="true" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center sm:text-left">
                        &copy; {new Date().getFullYear()} Tamuu.id. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
