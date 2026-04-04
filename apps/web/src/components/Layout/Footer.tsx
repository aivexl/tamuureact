import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Facebook, Youtube, Mail, MapPin } from 'lucide-react';
import { getAbsoluteUrl, getIsCrossDomain } from '../../lib/utils';

export const Footer: React.FC = () => {
    const SmartLink = ({ href, className, children }: { href: string, className?: string, children: React.ReactNode }) => {
        const absoluteUrl = getAbsoluteUrl(href);
        if (getIsCrossDomain(absoluteUrl)) {
            return <a href={absoluteUrl} className={className}>{children}</a>;
        }
        // Internal to the domain, use react-router Link
        const relativePath = absoluteUrl.replace(/^https?:\/\/[^\/]+/, '');
        return <Link to={relativePath || '/'} className={className}>{children}</Link>;
    };

    return (
        <footer className="bg-[#0A1128] pt-20 pb-10 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <a href={getAbsoluteUrl('/')}>
                                <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu Logo" className="h-8 sm:h-10 w-auto brightness-0 invert cursor-pointer" draggable="false" />
                            </a>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            Tamuu adalah platform all-in-one yang memudahkan Anda mencari vendor pernikahan terbaik sekaligus mengelola undangan digital premium dalam satu platform.
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
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-xs mb-8">Platform</h2>
                        <ul className="space-y-4">
                            <li><SmartLink href="/about" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">About Us</SmartLink></li>
                            <li><SmartLink href="/undangan-digital" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Undangan Digital</SmartLink></li>
                            <li><SmartLink href="/invitations" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Templates</SmartLink></li>
                            <li><SmartLink href="/blog" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Blog & Artikel</SmartLink></li>
                            <li><SmartLink href="/support" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Support Center</SmartLink></li>
                        </ul>
                    </div>

                    {/* Discovery Links */}
                    <div>
                        <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-xs mb-8">Discovery</h2>
                        <ul className="space-y-4">
                            <li><SmartLink href="/shop" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Vendor Discovery</SmartLink></li>
                            <li><SmartLink href="/c/mua" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Makeup Artist</SmartLink></li>
                            <li><SmartLink href="/c/catering" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Catering & Food</SmartLink></li>
                            <li><SmartLink href="/c/venue" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Wedding Venues</SmartLink></li>
                            <li><SmartLink href="/c/photography" className="text-slate-300 hover:text-white transition-colors text-sm font-bold">Photography</SmartLink></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-xs mb-8">Hubungi Kami</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#FFBF00] shrink-0 border border-white/5">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold mb-1">Email Support</p>
                                    <a href="mailto:support@tamuu.id" className="text-slate-400 hover:text-[#FFBF00] transition-colors text-xs font-medium tracking-tight">support@tamuu.id</a>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#FFBF00] shrink-0 border border-white/5">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold mb-1">Office</p>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed tracking-tight">Jakarta Selatan, DKI Jakarta<br/>Indonesia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-white/5 mb-10" aria-hidden="true" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        © 2026 Tamuu Indonesia. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <SmartLink href="/privacy" className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Privacy Policy</SmartLink>
                        <SmartLink href="/terms" className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Terms of Service</SmartLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};
