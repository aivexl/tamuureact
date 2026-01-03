import React from 'react';
import { m } from 'framer-motion';
import { Palette, Sparkles, Check, CheckCircle2 } from 'lucide-react';

const THEMES = [
    { id: '1', name: 'Rustic Gold', primary: '#B8860B', tag: 'Elegant', gradient: 'from-[#B8860B]/20 to-[#FFD700]/20' },
    { id: '2', name: 'Midnight Blue', primary: '#1A237E', tag: 'Luxury', gradient: 'from-[#1A237E]/20 to-[#3F51B5]/20' },
    { id: '3', name: 'Rose Petal', primary: '#E91E63', tag: 'Romantic', gradient: 'from-[#E91E63]/20 to-[#F48FB1]/20' },
    { id: '4', name: 'Emerald Forest', primary: '#2E7D32', tag: 'Nature', gradient: 'from-[#2E7D32]/20 to-[#81C784]/20' },
];

export const ThemePanel: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Koleksi Tema</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Premium Only
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((theme) => (
                    <m.button
                        key={theme.id}
                        whileHover={{ y: -4 }}
                        className="group relative h-48 bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-purple-200 transition-all hover:shadow-2xl hover:shadow-purple-500/5 text-left"
                    >
                        {/* Preview Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} transition-transform group-hover:scale-110 duration-700`} />

                        {/* Theme Content Mockup */}
                        <div className="absolute inset-x-6 top-8 space-y-2 pointer-events-none">
                            <div className="h-4 w-2/3 bg-white/60 rounded-full blur-[1px]" />
                            <div className="h-8 w-1/2 bg-white/80 rounded-xl" />
                            <div className="h-4 w-3/4 bg-white/40 rounded-full blur-[2px]" />
                        </div>

                        {/* Theme Info */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-between">
                            <div>
                                <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest rounded-full mb-1 inline-block">
                                    {theme.tag}
                                </span>
                                <h4 className="font-black text-slate-800 tracking-tight text-sm font-outfit">{theme.name}</h4>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-purple-500 group-hover:text-white transition-all cursor-pointer">
                                <Check className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Active Indicator */}
                        {theme.id === '1' && (
                            <div className="absolute top-4 right-4 text-purple-600 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-purple-100 flex items-center gap-1.5 animate-in fade-in zoom-in">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Terpilih</span>
                            </div>
                        )}
                    </m.button>
                ))}
            </div>

            {/* Custom Color Option */}
            <div className="mt-4 p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                {/* Abstract pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="relative z-10 space-y-4">
                    <h5 className="text-white font-black font-outfit text-xl tracking-tight leading-tight">
                        Punya Warna Impian Sendiri?
                    </h5>
                    <p className="text-white/40 text-xs font-medium max-w-[200px]">
                        Kostumisasi setiap detail warna sesuai keinginanmu dengan fitur Custom Theme.
                    </p>
                    <button className="px-6 py-3 bg-white text-slate-900 font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-black/20 hover:scale-105 transition-all">
                        Coba Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};
