import React from 'react';
import { m } from 'framer-motion';
import {
    Palette,
    Music,
    LayoutTemplate,
    Users,
    MessageSquare,
    BarChart2,
    Share2,
    Settings,
    Sparkles
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const MENU_ITEMS = [
    { id: 'theme', label: 'Tema', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500/20 to-indigo-500/20' },
    { id: 'music', label: 'Musik', icon: Music, color: 'text-pink-600', bg: 'bg-pink-50', gradient: 'from-pink-500/20 to-rose-500/20' },
    { id: 'template', label: 'Template', icon: LayoutTemplate, color: 'text-teal-600', bg: 'bg-teal-50', gradient: 'from-teal-500/20 to-emerald-500/20' },
    { id: 'guests', label: 'Tamu', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/20 to-sky-500/20' },
    { id: 'wishes', label: 'Ucapan', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/20 to-blue-500/20' },
    { id: 'analytics', label: 'Statistik', icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/20 to-orange-500/20' },
    { id: 'share', label: 'Bagikan', icon: Share2, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/20 to-teal-500/20' },
    { id: 'settings', label: 'Pengaturan', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50', gradient: 'from-slate-500/20 to-gray-500/20' },
];

interface IconGridMenuProps {
    onOpenPanel: (id: string) => void;
}

export const IconGridMenu: React.FC<IconGridMenuProps> = ({ onOpenPanel }) => {
    const handleMenuClick = (id: string) => {
        onOpenPanel(id);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MENU_ITEMS.map((item, i) => (
                <m.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMenuClick(item.id)}
                    className={`group relative bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.02)] transition-all overflow-hidden`}
                >
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                            <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.label}</span>
                    </div>

                    {/* Badge for highlight (optional) */}
                    {item.id === 'theme' && (
                        <div className="absolute top-3 right-3">
                            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        </div>
                    )}
                </m.button>
            ))}
        </div>
    );
};
