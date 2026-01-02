import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Layers, Eye, EyeOff, Layout } from 'lucide-react';

export const OrbitSidebar: React.FC = () => {
    const {
        orbit,
        activeCanvas,
        setActiveCanvas,
        updateOrbitCanvas
    } = useStore();

    const stages = [
        { id: 'left', label: 'Left Stage', icon: '👈' },
        { id: 'right', label: 'Right Stage', icon: '👉' }
    ];

    return (
        <div className="flex-1 flex flex-col p-2 space-y-4">
            {/* Stage Selector */}
            <div className="space-y-2">
                <label className="text-[9px] text-white/30 uppercase font-bold px-1">Select Active Stage</label>
                <div className="grid grid-cols-1 gap-1">
                    {stages.map((stage) => {
                        const isActive = activeCanvas === stage.id;
                        const config = orbit[stage.id as 'left' | 'right'];

                        return (
                            <motion.div
                                key={stage.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setActiveCanvas(stage.id as any)}
                                className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all border ${isActive
                                        ? 'bg-purple-500/20 border-purple-500/40 ring-1 ring-purple-500/20'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isActive ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/40'
                                    }`}>
                                    {stage.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold uppercase tracking-tight ${isActive ? 'text-purple-400' : 'text-white/60'}`}>
                                            {stage.label}
                                        </span>
                                        <span className="text-[10px] text-white/20 tabular-nums font-mono">
                                            {config.elements.length} Elements
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.backgroundColor }} />
                                        <span className="text-[9px] text-white/30 truncate">
                                            {config.backgroundUrl ? 'Image Background' : 'Solid Color'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrbitCanvas(stage.id as 'left' | 'right', { isVisible: !config.isVisible });
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${config.isVisible ? 'text-purple-400 hover:bg-purple-400/10' : 'text-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {config.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Stage Tips */}
            <div className="mt-auto p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Orbit Logic</span>
                </div>
                <p className="text-[10px] text-purple-300/50 leading-relaxed">
                    Cinematic stages are fixed to the viewport. Use them for flanking decorations that frame the main invitation.
                </p>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[9px] text-purple-400/80">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <span>Fixed Background Position</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-purple-400/80">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <span>Independent Layer Stack</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
