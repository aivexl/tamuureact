import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Power, MousePointer2, Layout, Check, ChevronRight } from 'lucide-react';

export const StatusToggles: React.FC = () => {
    const [isActive, setIsActive] = useState(true);
    const [isScroll, setIsScroll] = useState(true);
    const [coverEnabled, setCoverEnabled] = useState(true);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToggleCard
                icon={Power}
                label="Status Undangan"
                description="Aktifkan/Nonaktifkan publikasi"
                value={isActive}
                onChange={setIsActive}
                color="teal"
            />
            <ToggleCard
                icon={MousePointer2}
                label="Mode Scroll"
                description="Scrolling vs. Paging"
                value={isScroll}
                onChange={setIsScroll}
                color="indigo"
            />
            <ToggleCard
                icon={Layout}
                label="Cover Depan"
                description="Tampilkan cover sapaan"
                value={coverEnabled}
                onChange={setCoverEnabled}
                color="purple"
            />
        </div>
    );
};

interface ToggleCardProps {
    icon: any;
    label: string;
    description: string;
    value: boolean;
    onChange: (val: boolean) => void;
    color: 'teal' | 'indigo' | 'purple';
}

const ToggleCard: React.FC<ToggleCardProps> = ({ icon: Icon, label, description, value, onChange, color }) => {
    const colors = {
        teal: 'text-teal-600 bg-teal-50 border-teal-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
    };

    const activeColors = {
        teal: 'bg-teal-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500',
    };

    return (
        <m.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(!value)}
            className="flex items-center justify-between p-6 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.02)] transition-all text-left w-full group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{description}</p>
                </div>
            </div>

            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${value ? activeColors[color] : 'bg-slate-100'}`}>
                <m.div
                    animate={{ x: value ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
            </div>
        </m.button>
    );
};
