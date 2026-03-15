import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { useStore } from '@/store/useStore';
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
    Download,
    Monitor,
    Calendar,
    MapPin,
    Gift,
    Search,
    Image,
    Video,
    Heart,
    Quote,
    Dice6,
    Clock
} from 'lucide-react';

const BASE_MENU_ITEMS = [
    { id: 'music', label: 'Musik', icon: Music, color: 'text-pink-600', bg: 'bg-pink-50', gradient: 'from-pink-500/20 to-rose-500/20' },
    { id: 'luckydraw', label: 'Undian', icon: Dice6, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500/20 to-indigo-500/20' },
    { id: 'template', label: 'Template', icon: LayoutTemplate, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/20 to-indigo-500/20' },
    { id: 'guests', label: 'Tamu', icon: Users, color: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500/20 to-emerald-500/20' },
    { id: 'wishes', label: 'Ucapan', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500/20 to-amber-500/20' },
    // { id: 'display', label: 'Display', icon: Monitor, color: 'text-cyan-600', bg: 'bg-cyan-50', gradient: 'from-cyan-500/20 to-teal-500/20' },
    { id: 'analytics', label: 'Analitik', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/20 to-blue-500/20' },
    { id: 'download', label: 'Download', icon: Download, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/20 to-pink-500/20' },
];

interface IconGridMenuProps {
    onOpenPanel: (id: string) => void;
}

export const IconGridMenu: React.FC<IconGridMenuProps> = ({ onOpenPanel }) => {
    const sections = useStore(s => s.sections);

    // Smart Detector: Only show dynamic panels if the corresponding element exists
    const dynamicMenuItems = useMemo(() => {
        const types = new Set<string>();
        const names = new Set<string>();

        sections.forEach((s: any) => {
            const allElements = [...(s.elements || []), ...(s.layers || [])];
            allElements.forEach((el: any) => {
                if (el.type) types.add(el.type);
                if (el.name) names.add(el.name.toLowerCase());
            });
        });

        const items = [...BASE_MENU_ITEMS];

        if (types.has('maps_point') || Array.from(names).some(n => n.includes('lokasi') || n.includes('map'))) {
            items.splice(5, 0, { id: 'location', label: 'Lokasi', icon: MapPin, color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500/20 to-rose-500/20' });
        }
        if (types.has('digital_gift') || types.has('gift_address') || Array.from(names).some(n => n.includes('kado') || n.includes('gift') || n.includes('rekening'))) {
            items.splice(6, 0, { id: 'gift', label: 'Kado', icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/20 to-teal-500/20' });
        }
        if (types.has('photo_grid') || Array.from(names).some(n => n.includes('gallery') || n.includes('galeri'))) {
            items.splice(8, 0, { id: 'gallery', label: 'Galeri', icon: Image, color: 'text-violet-600', bg: 'bg-violet-50', gradient: 'from-violet-500/20 to-purple-500/20' });
        }
        if (types.has('live_streaming') || Array.from(names).some(n => n.includes('live'))) {
            items.splice(9, 0, { id: 'livestream', label: 'Live', icon: Video, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/20 to-red-500/20' });
        }

        return items;
    }, [sections]);

    return (
        <div id="tutorial-grid-menu" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {dynamicMenuItems.map((item, i) => (
                <m.button
                    key={item.id}
                    id={`tutorial-grid-item-${item.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: i * 0.08,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    whileHover={{
                        y: -5,
                        scale: 1.02,
                        transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenPanel(item.id)}
                    className="group relative bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden"
                >
                    {/* Inner Content */}
                    <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                        <div
                            className={`w-12 h-12 sm:w-16 sm:h-16 ${item.bg} rounded-[1.25rem] sm:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
                        >
                            <item.icon className={`w-6 h-6 sm:w-8 h-8 ${item.color} transition-all duration-500`} />
                        </div>

                        <div className="space-y-1 text-center">
                            <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-[0.15em] sm:tracking-[0.2em] group-hover:text-slate-900 transition-colors">
                                {item.label}
                            </span>
                        </div>
                    </div>

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
                </m.button>
            ))}
        </div>
    );
};
