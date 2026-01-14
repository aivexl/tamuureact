import React from 'react';
import { m } from 'framer-motion';
import {
    Palette,
    Music,
    LayoutTemplate,
    Users,
    MessageSquare,
    BarChart3,
    Share2,
    Settings,
    Sparkles,
    Download
} from 'lucide-react';

const MENU_ITEMS = [
    { id: 'theme', label: 'Tema', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500/20 to-indigo-500/20' },
    { id: 'music', label: 'Musik', icon: Music, color: 'text-pink-600', bg: 'bg-pink-50', gradient: 'from-pink-500/20 to-rose-500/20' },
    { id: 'template', label: 'Template', icon: LayoutTemplate, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/20 to-indigo-500/20' },
    { id: 'guests', label: 'Tamu', icon: Users, color: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500/20 to-emerald-500/20' },
    { id: 'wishes', label: 'Ucapan', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500/20 to-amber-500/20' },
    { id: 'orbit', label: 'Orbit', icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-50', gradient: 'from-teal-500/20 to-emerald-500/20' },
    { id: 'analytics', label: 'Analitik', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/20 to-blue-500/20' },
    { id: 'share', label: 'Bagikan', icon: Share2, color: 'text-teal-600', bg: 'bg-teal-50', gradient: 'from-teal-500/20 to-emerald-500/20' },
    { id: 'download', label: 'Download', icon: Download, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/20 to-pink-500/20', isNew: true },
    { id: 'settings', label: 'Pengaturan', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50', gradient: 'from-slate-500/20 to-gray-500/20' },
];

interface IconGridMenuProps {
    onOpenPanel: (id: string) => void;
}

export const IconGridMenu: React.FC<IconGridMenuProps> = ({ onOpenPanel }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {MENU_ITEMS.map((item, i) => (
                <m.button
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: i * 0.08,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    whileHover={{
                        y: -8,
                        transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenPanel(item.id)}
                    className="group relative bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden"
                >
                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                    {/* Inner Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <m.div
                            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                            className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:shadow-lg group-hover:scale-110`}
                        >
                            <item.icon className={`w-8 h-8 ${item.color} transition-all duration-500`} />
                        </m.div>

                        <div className="space-y-1 text-center">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">
                                {item.label}
                            </span>
                        </div>
                    </div>

                    {/* Corner Decoration */}
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />

                    {/* Special Sparkle for Theme */}
                    {item.id === 'theme' && (
                        <div className="absolute top-4 right-4">
                            <m.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            </m.div>
                        </div>
                    )}

                    {/* NEW Badge for Download */}
                    {(item as any).isNew && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider rounded-full">New</div>
                    )}
                </m.button>
            ))}
        </div>
    );
};
