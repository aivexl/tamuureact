"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    Eye, 
    Save, 
    ChevronRight, 
    ChevronLeft,
    Layout as LayoutIcon,
    Music,
    Image as ImageIcon,
    Users,
    MapPin,
    Heart,
    MessageSquare,
    Gift,
    Zap,
    BarChart3,
    Trophy,
    Settings as SettingsIcon,
    ArrowRight
} from 'lucide-react';
import { useStore } from '@tamuu/shared';
import { Container } from '@/components/ui/Container';

export default function UserEditorPage() {
    const params = useParams();
    const id = params.id;
    const { user } = useStore();
    const [activeView, setActiveTab] = useState<'invitation' | 'orbit'>('invitation');

    return (
        <Container>
            <div className="flex flex-col gap-8">
                {/* Top: Status & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            <span>Editor</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-[#FFBF00]">Pernikahan Rizky & Sarah</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-[#0A1128] italic uppercase tracking-tighter">Edit Undangan</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                            <Eye className="w-4 h-4" /> Preview
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 bg-[#0A1128] text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-indigo-950/20 transition-all shadow-lg">
                            <Save className="w-4 h-4 text-[#FFBF00]" /> Simpan
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Menu Grid */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                <h2 className="text-xl font-black uppercase tracking-tighter">Menu Utama</h2>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: Music, label: 'Musik', id: 'music' },
                                    { icon: ImageIcon, label: 'Galeri', id: 'gallery' },
                                    { icon: Heart, label: 'Story', id: 'story' },
                                    { icon: MapPin, label: 'Lokasi', id: 'location' },
                                    { icon: Users, label: 'Tamu', id: 'guests' },
                                    { icon: Gift, label: 'Kado', id: 'gift' },
                                    { icon: MessageSquare, label: 'Ucapan', id: 'wishes' },
                                    { icon: Zap, label: 'Orbit', id: 'orbit' },
                                    { icon: BarChart3, label: 'Statistik', id: 'analytics' },
                                ].map((item) => (
                                    <button key={item.id} className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#FFBF00] hover:bg-white transition-all group">
                                        <item.icon className="w-6 h-6 text-slate-400 group-hover:text-[#FFBF00] transition-colors" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#0A1128]">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="bg-slate-900 p-2 rounded-2xl flex gap-2">
                            <button 
                                onClick={() => setActiveTab('invitation')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'invitation' ? 'bg-white text-[#0A1128]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <LayoutIcon className="w-4 h-4" /> Undangan
                            </button>
                            <button 
                                onClick={() => setActiveTab('orbit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'orbit' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Sparkles className="w-4 h-4" /> Orbit Cinematic
                            </button>
                        </div>
                    </div>

                    {/* Right: Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm min-h-[600px] p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="relative z-10 space-y-12">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-[#0A1128] italic uppercase tracking-tighter">Konten Utama</h3>
                                    <button className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest hover:text-[#0A1128] transition-colors">Reset Form</button>
                                </div>

                                <div className="space-y-8">
                                    {/* Mock Form Fields */}
                                    {[1,2,3].map((i) => (
                                        <div key={i} className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Field Label {i}</label>
                                            <input 
                                                type="text" 
                                                placeholder="Masukan data di sini..."
                                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:bg-white focus:border-[#FFBF00]/40 transition-all outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-12 border-t border-slate-50 flex justify-end">
                                    <button className="flex items-center gap-3 px-10 py-4 bg-[#0A1128] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-950/20 hover:scale-105 transition-all active:scale-95">
                                        Simpan Bagian Ini <ArrowRight className="w-4 h-4 text-[#FFBF00]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
