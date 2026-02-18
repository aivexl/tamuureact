import React, { useRef } from 'react';
import { m } from 'framer-motion';
import {
    Play,
    Pause,
    RotateCcw,
    Layers,
    ChevronRight,
    Search,
    Plus,
    Square
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/**
 * SequenceTimeline Component
 * 
 * A professional-grade, high-precision motion graphics timeline.
 * Adheres to the "Citadel Onyx" aesthetic: Matte, Minimalist, Enterprise.
 */
const TIMELINE_GRID_STYLE = {
    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px)',
    backgroundSize: '40px 100%'
};

export const SequenceTimeline: React.FC = () => {
    const {
        playhead,
        duration,
        isPlaying,
        togglePlayback,
        setPlayhead,
        resetClock,
        sections,
        activeSectionId
    } = useStore();

    const timelineRef = useRef<HTMLDivElement>(null);
    const activeSection = sections.find(s => s.id === activeSectionId);
    const layers = activeSection?.elements || [];

    // Pixels per millisecond (Zoom factor)
    const pxPerMs = 0.1;
    const timelineWidth = duration * pxPerMs;

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor(ms % 1000);
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    };

    const handleScrub = (e: React.MouseEvent | React.TouchEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX : e.clientX;
        const offsetX = x - rect.left;
        const newTime = (offsetX / pxPerMs);
        setPlayhead(newTime);
    };

    return (
        <div className="w-full bg-[#020617] border-t border-white/5 flex flex-col h-72 select-none font-outfit">
            {/* 1. TIMELINE HEADER (Controls) */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f172a]/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                        <button
                            onClick={resetClock}
                            className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                if (playhead >= duration) {
                                    setPlayhead(0);
                                }
                                togglePlayback();
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-[#0D99FF] hover:bg-[#0D99FF]/80 text-white rounded-lg shadow-lg shadow-[#0D99FF]/20 transition-all active:scale-95"
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        <button
                            onClick={resetClock}
                            className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-all"
                            title="Stop & Reset"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>

                    <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
                        <span className="text-sm font-mono font-bold text-[#0D99FF]">
                            {formatTime(playhead)}
                        </span>
                        <span className="text-slate-600 mx-2">/</span>
                        <span className="text-sm font-mono font-medium text-slate-500">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <Layers className="w-3.5 h-3.5" />
                        {layers.length} Layers
                    </div>
                    <div className="h-4 w-px bg-white/5 mx-2" />
                    <button className="p-2 hover:bg-white/5 text-slate-300 rounded-lg transition-all border border-white/5">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 text-slate-300 rounded-lg transition-all border border-white/5">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 2. TIMELINE BODY */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: LAYER NAMES */}
                <div className="w-64 border-r border-white/5 bg-[#020617] overflow-y-auto no-scrollbar">
                    {layers.map((layer) => (
                        <div
                            key={`track-label-${layer.id}`}
                            className="h-10 border-b border-white/5 flex items-center px-4 gap-3 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-[11px] font-bold text-slate-400 truncate tracking-tight uppercase group-hover:text-white transition-colors">
                                {layer.name || layer.type}
                            </span>
                        </div>
                    ))}
                    {layers.length === 0 && (
                        <div className="h-full flex items-center justify-center p-8 text-center">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No active layers</p>
                        </div>
                    )}
                </div>

                {/* RIGHT: TRACK AREA + RULER */}
                <div className="flex-1 relative overflow-auto no-scrollbar bg-[#050b18]">
                    {/* TIME RULER */}
                    <div
                        ref={timelineRef}
                        onMouseDown={handleScrub}
                        className="h-8 border-b border-white/5 bg-[#0f172a]/30 sticky top-0 z-20 cursor-crosshair"
                        style={{ width: Math.max(timelineWidth, 1000), ...TIMELINE_GRID_STYLE }}
                    >
                        {/* RULER TICKS (Simple logic for now) */}
                        {Array.from({ length: Math.ceil(duration / 1000) + 1 }).map((_, i) => (
                            <div
                                key={`tick-${i}`}
                                className="absolute top-0 flex flex-col items-center"
                                style={{ left: i * 1000 * pxPerMs }}
                            >
                                <div className="h-2 w-px bg-slate-700" />
                                <span className="text-[9px] font-mono text-slate-500 mt-1">{i}s</span>
                            </div>
                        ))}
                    </div>

                    {/* TRACKS GRID */}
                    <div className="relative" style={{ width: Math.max(timelineWidth, 1000), ...TIMELINE_GRID_STYLE }}>
                        {layers.map((layer) => {
                            const sequence = layer.sequence || { startTime: 0, duration: 2000 };
                            const layerKeyframes = layer.keyframes || [];

                            return (
                                <div
                                    key={`track-area-${layer.id}`}
                                    className="h-10 border-b border-white/5 relative group/track"
                                >
                                    {/* SEQUENCE BLOCK */}
                                    <m.div
                                        className="absolute top-1 bottom-1 bg-[#0D99FF]/10 border border-[#0D99FF]/20 rounded-md backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-[#0D99FF]/20 transition-colors flex items-center px-1 overflow-visible"
                                        style={{
                                            left: (sequence.startTime || 0) * pxPerMs,
                                            width: (sequence.duration || 2000) * pxPerMs
                                        }}
                                    >
                                        <div className="w-1 h-full bg-[#0D99FF]/40 rounded-full mr-1 shrink-0" />

                                        {/* KEYFRAME MARKERS (Diamonds) */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {layerKeyframes.map((kf) => (
                                                <div
                                                    key={kf.id}
                                                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#0D99FF] rotate-45 border border-white/20 shadow-[0_0_10px_rgba(13,153,255,0.5)] pointer-events-auto cursor-pointer hover:scale-125 transition-transform"
                                                    style={{ left: kf.time * pxPerMs }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPlayhead(kf.time);
                                                    }}
                                                >
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#020617] text-white text-[8px] px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {kf.property}: {typeof kf.value === 'number' ? kf.value.toFixed(1) : kf.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <span className="text-[8px] font-black text-[#0D99FF]/30 uppercase truncate">
                                            {layer.name || layer.type}
                                        </span>
                                    </m.div>

                                    {/* ADD KEYFRAME BUTTON ON HOVER */}
                                    <button
                                        onClick={() => {
                                            const id = `kf-${Date.now()}`;
                                            const startTime = layer.sequence?.startTime || 0;
                                            const effectiveTime = Math.max(0, playhead - startTime);

                                            useStore.getState().addKeyframe(layer.id, {
                                                id,
                                                time: effectiveTime,
                                                property: 'opacity',
                                                value: 1,
                                                easing: 'ease-in-out'
                                            });
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/5 opacity-0 group-hover/track:opacity-100 hover:bg-[#0D99FF]/20 rounded transition-all z-40"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-[#0D99FF]" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* PLAYHEAD */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-[#0D99FF] z-30 pointer-events-none"
                        style={{ left: playhead * pxPerMs }}
                    >
                        <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-[#0D99FF] rotate-45 border-2 border-[#020617] shadow-lg" />
                        <div className="absolute inset-0 w-4 -left-2 bg-[#0D99FF]/5 blur-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};
