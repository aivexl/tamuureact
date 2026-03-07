import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { Heart, Star, Circle, Calendar, MapPin, Image as ImageIcon, Sparkles, Zap, Quote } from 'lucide-react';
import { useStore } from '@/store/useStore';

// Tier limits for preview rendering - Enterprise Grade Scaling
const LOVE_STORY_LIMITS: Record<string, number> = {
    free: 1, pro: 3, vip: 3, ultimate: 5, platinum: 5, elite: 7, vvip: 10
};

export const LoveStoryElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void, onDimensionsDetected?: (w: number, h: number) => void }> = ({ layer, isEditor, onContentLoad, onDimensionsDetected }) => {
    const { user, updateLayer } = useStore();
    const rootRef = React.useRef<HTMLDivElement>(null);
    const lastSyncRef = React.useRef<{ w: number, h: number }>({ w: 0, h: 0 });

    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    React.useLayoutEffect(() => {
        if (!rootRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const rect = entry.target.getBoundingClientRect();
            const measuredW = Math.ceil(rect.width);
            const measuredH = Math.ceil(rect.height);
            const hasChangedLocally = measuredW !== lastSyncRef.current.w || measuredH !== lastSyncRef.current.h;

            if (hasChangedLocally) {
                lastSyncRef.current = { w: measuredW, h: measuredH };
                if (onDimensionsDetected) onDimensionsDetected(measuredW, measuredH);
                if (isEditor && (Math.abs(measuredW - layer.width) > 5 || Math.abs(measuredH - layer.height) > 5)) {
                    updateLayer(layer.id, { height: measuredH });
                }
            }
        });
        observer.observe(rootRef.current);
        return () => observer.disconnect();
    }, [layer.id, layer.width, layer.height, isEditor, onDimensionsDetected, updateLayer]);

    const config = layer.loveStoryConfig || {
        variant: 'elegant',
        markerStyle: 'heart',
        themeColor: '#bfa181',
        lineThickness: 1,
        events: []
    };

    const userTier = user?.tier || 'free';
    const maxEvents = LOVE_STORY_LIMITS[userTier] || 1;

    // Filter: only filled events, sliced to tier limit (skip filter in admin editor)
    const rawEvents = config.events || [];
    const filledEvents = isEditor
        ? rawEvents 
        : rawEvents.filter(e => e.title || e.description).slice(0, maxEvents);

    const { variant = 'elegant', themeColor = '#bfa181', markerStyle = 'heart' } = config;
    const events = filledEvents;

    if (events.length === 0 && isEditor) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-12 text-center group transition-all hover:bg-white/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-premium-accent/20 to-amber-200/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Heart className="w-10 h-10 text-premium-accent/40" />
                </div>
                <h3 className="text-white/80 font-black uppercase tracking-[0.3em] text-xs">Curate Your Journey</h3>
                <p className="text-white/30 text-[10px] mt-3 font-medium uppercase tracking-widest max-w-[200px] leading-relaxed">Add moments of your love story in the property panel to begin</p>
            </div>
        );
    }

    if (events.length === 0 && !isEditor) return null;

    const MarkerIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => {
        switch (markerStyle) {
            case 'star': return <Star size={size} fill={themeColor} className={className} />;
            case 'dot':
                return <div className={`rounded-full shadow-glow ${className}`} style={{ width: size * 0.6, height: size * 0.6, backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}66` }} />;
            case 'diamond': return <div className={`rotate-45 ${className}`} style={{ width: size * 0.7, height: size * 0.7, backgroundColor: themeColor }} />;
            default: return <Heart size={size} fill={themeColor} className={className} />;
        }
    };

    // Helper for robust text wrapping - Apple standard legibility
    const wrapStyle: React.CSSProperties = {
        overflowWrap: 'break-word',
        wordBreak: 'normal',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6'
    };

    // --- VARIANT 1: ETERNAL (Ex-Elegant) ---
    // Symmetrical, refined serif, hairline vertical path
    const renderEternal = () => (
        <div className="w-full flex flex-col items-center space-y-12 py-8 relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            {events.map((event, idx) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
                    className="relative flex flex-col items-center w-full px-8 z-10"
                >
                    <div className="bg-neutral-900 border border-white/10 rounded-full p-2.5 mb-6 shadow-2xl backdrop-blur-xl">
                        <MarkerIcon size={14} />
                    </div>
                    <div className="text-center max-w-[280px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-premium-accent mb-3 block opacity-80">{event.date}</span>
                        <h3 className="text-2xl font-serif text-white/90 mb-3 tracking-tight leading-tight">{event.title}</h3>
                        <p className="text-xs text-white/40 font-medium leading-loose" style={wrapStyle}>{event.description}</p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    // --- VARIANT 2: NARRATIVE (Ex-Modern) ---
    // Asymmetric magazine style, large typography accents
    const renderNarrative = () => (
        <div className="w-full flex flex-col space-y-16 py-10">
            {events.map((event, idx) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col px-10 relative"
                >
                    <div className="absolute -left-2 top-0 text-6xl font-black text-white/[0.03] select-none italic pointer-events-none">
                        {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="pl-4 border-l-2 border-premium-accent/30">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2 block">{event.date}</span>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{event.title}</h3>
                        <p className="text-sm text-white/60 font-medium leading-relaxed" style={wrapStyle}>{event.description}</p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    // --- VARIANT 3: ODYSSEY (Ex-Zigzag) ---
    // Dynamic density, floating points, gradient path
    const renderOdyssey = () => (
        <div className="relative w-full flex flex-col py-12 space-y-12">
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-premium-accent/40 to-transparent -translate-x-1/2" />
            {events.map((event, idx) => {
                const isEven = idx % 2 === 0;
                return (
                    <div key={event.id} className={`flex items-start w-full relative ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className="absolute left-1/2 -translate-x-1/2 top-1 z-20">
                            <m.div 
                                whileHover={{ scale: 1.2, rotate: 90 }}
                                className="w-4 h-4 rounded-full bg-neutral-950 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-premium-accent shadow-[0_0_8px_rgba(191,161,129,0.8)]" />
                            </m.div>
                        </div>
                        <m.div
                            initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className={`w-1/2 ${isEven ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                        >
                            <span className="text-[8px] font-black uppercase tracking-widest text-premium-accent/60 mb-2 block">{event.date}</span>
                            <h4 className="text-base font-black text-white/90 leading-tight uppercase tracking-tighter mb-2">{event.title}</h4>
                            <p className="text-[11px] text-white/40 font-medium leading-relaxed" style={wrapStyle}>{event.description}</p>
                        </m.div>
                        <div className="w-1/2" />
                    </div>
                );
            })}
        </div>
    );

    // --- VARIANT 4: GALLERY (Ex-Cards) ---
    // Elevated frames, Apple-grade shadows, minimalism
    const renderGallery = () => (
        <div className="w-full flex flex-col items-center space-y-8 py-10">
            {events.map((event, idx) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                    className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-8 w-[85%] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Quote className="w-12 h-12 text-premium-accent" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-premium-accent mb-4 block">{event.date}</span>
                        <h3 className="text-xl font-bold text-white/90 mb-4 tracking-tight leading-snug">{event.title}</h3>
                        <p className="text-xs text-white/50 font-medium leading-relaxed" style={wrapStyle}>{event.description}</p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    // --- VARIANT 5: CHRONICLE (Ex-Numbered List) ---
    // Bold, structural, Fortune 500 aesthetic
    const renderChronicle = () => (
        <div className="w-full flex flex-col space-y-0 px-6 py-8">
            {events.map((event, idx) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex gap-8 group"
                >
                    <div className="flex flex-col items-center pt-2">
                        <div className="text-2xl font-black text-white/10 group-hover:text-premium-accent/40 transition-colors duration-500 tabular-nums">
                            {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="w-[1px] flex-1 bg-white/5 my-4 group-last:bg-transparent" />
                    </div>
                    <div className="flex-1 pb-12 border-b border-white/[0.03] group-last:border-0 pt-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-3 block">{event.date}</span>
                        <h3 className="text-lg font-black text-white/80 mb-3 tracking-wide uppercase">{event.title}</h3>
                        <p className="text-sm text-white/40 font-medium leading-relaxed" style={wrapStyle}>{event.description}</p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    // --- VARIANT 6: PRESTIGE (Ex-Premium Zigzag) ---
    // Cinematic curves, luxury strokes, serif elegance
    const renderPrestige = () => (
        <div className="relative w-full flex flex-col py-16 space-y-20">
            <svg className="absolute left-1/2 -translate-x-1/2 top-0 w-full h-full opacity-20 pointer-events-none overflow-visible" viewBox="0 0 100 1000" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="20%" stopColor={themeColor} />
                        <stop offset="80%" stopColor={themeColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path
                    d="M50,0 C70,100 30,200 50,300 C70,400 30,500 50,600 C70,700 30,800 50,900"
                    fill="none"
                    stroke="url(#pathGradient)"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                />
            </svg>

            {events.map((event, idx) => {
                const isEven = idx % 2 === 0;
                return (
                    <div key={event.id} className={`flex items-center w-full relative ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className="absolute left-1/2 -translate-x-1/2 z-20">
                            <m.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                className="w-10 h-10 rounded-full bg-neutral-900 border border-premium-accent/30 flex items-center justify-center shadow-2xl backdrop-blur-3xl"
                            >
                                <MarkerIcon size={14} className="text-premium-accent" />
                            </m.div>
                        </div>

                        <m.div
                            initial={{ opacity: 0, filter: 'blur(10px)', x: isEven ? -40 : 40 }}
                            whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className={`w-1/2 ${isEven ? 'pr-14 text-right' : 'pl-14 text-left'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-premium-accent mb-4 block">{event.date}</span>
                            <h4 className="text-2xl font-serif italic text-white/90 mb-4 tracking-tighter leading-tight">{event.title}</h4>
                            <div className={`h-[1px] w-16 mb-6 bg-gradient-to-r ${isEven ? 'from-transparent to-premium-accent/40 ml-auto' : 'from-premium-accent/40 to-transparent'}`} />
                            <p className="text-xs text-white/40 font-medium leading-relaxed italic" style={wrapStyle}>{event.description}</p>
                        </m.div>
                        <div className="w-1/2" />
                    </div>
                );
            })}
        </div>
    );

    // --- VARIANT 7: ETHEREAL (Ex-Floating Glass) ---
    // Pure Apple aesthetics, deep glass, vibrant markers
    const renderEthereal = () => (
        <div className="w-full flex flex-col items-center space-y-6 py-12">
            {events.map((event, idx) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20, delay: idx * 0.1 }}
                    className="relative w-[90%] rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-10 overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
                >
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-premium-accent/5 rounded-full blur-[60px] group-hover:bg-premium-accent/10 transition-colors duration-1000" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="h-[1px] w-8 bg-white/10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">{event.date}</span>
                            <div className="h-[1px] w-8 bg-white/10" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight leading-tight">{event.title}</h3>
                        <p className="text-sm text-white/50 font-medium leading-relaxed max-w-[240px]" style={wrapStyle}>{event.description}</p>
                        
                        <div className="mt-8">
                            <m.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-premium-accent"
                            />
                        </div>
                    </div>
                </m.div>
            ))}
        </div>
    );

    // --- SMART SCALING ENGINE ---
    // Maintains internal layout integrity while guaranteeing fit within 414px baseline
    const count = Math.max(1, events.length);
    const outerScale = count <= 3 ? 1 : count === 4 ? 0.9 : count === 5 ? 0.8 : 0.7;

    return (
        <div ref={rootRef} className="w-full h-fit bg-transparent select-none antialiased flex flex-col items-center justify-center">
            <div
                className="w-full transition-all duration-1000 ease-out origin-center"
                style={{ transform: `scale(${outerScale})` }}
            >
                {variant === 'elegant' && renderEternal()}
                {variant === 'modern' && renderNarrative()}
                {variant === 'zigzag' && renderOdyssey()}
                {variant === 'cards' && renderGallery()}
                {variant === 'numbered_list' && renderChronicle()}
                {variant === 'premium_zigzag' && renderPrestige()}
                {variant === 'floating_glass' && renderEthereal()}
            </div>
        </div>
    );
};
