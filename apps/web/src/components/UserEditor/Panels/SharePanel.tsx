import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Copy, Share2, MessageCircle, Send, Globe, Check } from 'lucide-react';

interface SharePanelProps {
    slug: string;
}

export const SharePanel: React.FC<SharePanelProps> = ({ slug }) => {
    const [copied, setCopied] = useState(false);
    const url = `tamuu.id/preview/${slug}`;


    const handleCopy = () => {
        navigator.clipboard.writeText(`https://${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-emerald-500', link: `https://wa.me/?text=Buka%20undangan%20saya%20di%20https://${url}` },
        { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-sky-500', link: `https://t.me/share/url?url=https://${url}` },
        { id: 'facebook', name: 'Facebook', icon: Globe, color: 'bg-blue-600', link: `https://www.facebook.com/sharer/sharer.php?u=https://${url}` },
    ];

    return (
        <div className="space-y-8">
            {/* Main Link Card */}
            <div className="p-8 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-[2.5rem] border border-teal-100/50 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10 text-teal-600">
                    <Share2 className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-wider">Bagikan Undangan</h3>
                    <p className="text-xs text-slate-500 font-medium">Link ini sudah siap untuk dikirimkan ke para tamu.</p>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex-1 px-4 text-left font-bold text-slate-900 truncate">
                        {url}
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Salin!' : 'Salin'}
                    </button>
                </div>
            </div>

            {/* Share to Apps */}
            <div className="space-y-4">
                <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kirim Lewat Aplikasi</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {shareOptions.map((opt) => (
                        <m.a
                            key={opt.id}
                            href={opt.link}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group"
                        >
                            <div className={`w-12 h-12 ${opt.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${opt.color}/20 group-hover:scale-110 transition-transform duration-500`}>
                                <opt.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{opt.name}</span>
                        </m.a>
                    ))}
                </div>
            </div>

            {/* Instruction Card */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500">
                    <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h5 className="font-black text-slate-800 tracking-tight text-xs uppercase tracking-widest">Tips Berbagi</h5>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Pastikan status undangan dalam keadaan <span className="text-emerald-600 font-bold">Aktif</span> sebelum dibagikan agar tamu dapat melihat isi undangan Anda.
                    </p>
                </div>
            </div>
        </div>
    );
};
