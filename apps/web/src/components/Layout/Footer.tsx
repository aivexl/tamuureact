import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0A1128] pt-20 pb-10 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#FFBF00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFBF00]/20">
                                <Sparkles className="w-7 h-7 text-[#0A1128]" aria-hidden="true" />
                            </div>
                            <span className="text-3xl font-black text-white tracking-tighter">Tamuu</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            Platform undangan digital tercanggih di Indonesia. Menghadirkan kemewahan dan kemudahan dalam setiap momen berharga Anda.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="Instagram Tamuu">
                                <Instagram className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="Twitter Tamuu">
                                <Twitter className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#FFBF00] hover:bg-white/10 transition-all duration-300 border border-white/5" aria-label="Facebook Tamuu">
                                <Facebook className="w-5 h-5" aria-hidden="true" />
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
                            <li className="flex items-center gap-3 text-slate-300">
                                <Phone className="w-4 h-4 text-[#FFBF00]" aria-hidden="true" />
                                <span className="text-xs font-bold uppercase tracking-tight">+62 812 3456 7890</span>
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
                    <div className="flex items-center gap-8">
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Crafted by Unicorn Team</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
