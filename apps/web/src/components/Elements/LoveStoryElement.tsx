import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { Heart, Star, Circle, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';

// Tier limits for preview rendering
const LOVE_STORY_LIMITS: Record<string, number> = {
    free: 1, pro: 3, vip: 3, ultimate: 5, platinum: 5, elite: 7, vvip: 7
};

export const LoveStoryElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const { user } = useStore();

    useEffect(() => {
        onContentLoad?.();
    }, []);

    const config = layer.loveStoryConfig || {
        variant: 'zigzag',
        markerStyle: 'heart',
        themeColor: '#db2777',
        lineThickness: 2,
        events: []
    };

    const userTier = user?.tier || 'free';
    const maxEvents = LOVE_STORY_LIMITS[userTier] || 1;

    // Filter: only filled events, sliced to tier limit (skip filter in admin editor)
    const rawEvents = config.events || [];
    const filledEvents = isEditor
        ? rawEvents  // Admin editor sees all
        : rawEvents.filter(e => e.title || e.description).slice(0, maxEvents);

    const { variant = 'zigzag', themeColor = '#db2777', markerStyle = 'heart' } = config;
    const events = filledEvents;

    // --- ZERO-CROPPING ARCHITECT & PERFECT VISIBILITY ---
    const count = Math.max(1, events.length);

    // 1. Adaptive Base Sizing (benchmark: Image 5)
    // We start with larger, more readable bases and scale down gaps/padding slightly for density
    const densityRatio = count <= 3 ? 1 : count <= 5 ? 0.85 : 0.75;

    const baseGap = {
        elegant: 40,
        modern: 24,
        zigzag: 32,
        cards: 16,
        numbered_list: 32,
        premium_zigzag: 48,
        floating_glass: 24
    }[variant] || 24;

    const scaledGap = baseGap * densityRatio;
    const scaledPadding = 20 * densityRatio;

    // Font benchmarks from Image 5 (perfect visibility)
    const fontSizes = {
        date: '8px',
        title: count > 5 ? '14px' : '16px',
        description: count > 5 ? '11px' : '12px'
    };

    const iconSize = count > 5 ? 0.8 : 1;

    if (events.length === 0 && isEditor) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <Heart className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Love Story Timeline</h3>
                <p className="text-slate-300 text-xs mt-2">Tambahkan momen spesial di panel editor</p>
            </div>
        );
    }

    if (events.length === 0 && !isEditor) return null;

    const MarkerIcon = ({ size = 16 }: { size?: number }) => {
        const adjustedSize = size * iconSize;
        switch (markerStyle) {
            case 'star': return <Star size={adjustedSize} fill={themeColor} />;
            case 'dot':
                return <div className="rounded-full shadow-lg" style={{ width: adjustedSize * 0.6, height: adjustedSize * 0.6, backgroundColor: themeColor, border: '2px solid white' }} />;
            case 'diamond': return <div className="rotate-45" style={{ width: adjustedSize * 0.7, height: adjustedSize * 0.7, backgroundColor: themeColor }} />;
            default: return <Heart size={adjustedSize} fill={themeColor} />;
        }
    };

    // Helper for robust text wrapping
    const wrapStyle: React.CSSProperties = {
        overflowWrap: 'anywhere',
        wordBreak: 'break-all', // Forced break for junk strings
        whiteSpace: 'normal'
    };

    const renderElegant = () => (
        <div className="w-full flex flex-col items-center" style={{ gap: scaledGap, paddingBlock: scaledPadding }}>
            {events.map((event) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col items-center w-full px-4"
                >
                    <div
                        className="relative z-10 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100"
                        style={{ width: 32 * iconSize, height: 32 * iconSize, marginBottom: 8 }}
                    >
                        <MarkerIcon size={14} />
                    </div>

                    <div className="text-center w-full">
                        <span
                            className="font-black uppercase tracking-[0.2em] block"
                            style={{ color: config.dateColor || themeColor, fontSize: fontSizes.date, marginBottom: 4 }}
                        >
                            {event.date}
                        </span>
                        <h3 className="font-bold leading-tight uppercase tracking-tight" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 4, ...wrapStyle }}>
                            {event.title}
                        </h3>
                        <p className="leading-relaxed font-medium" style={{ color: config.descriptionColor || '#64748b', fontSize: fontSizes.description, ...wrapStyle }}>
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    const renderModern = () => (
        <div className="w-full flex flex-col" style={{ gap: scaledGap, paddingBlock: scaledPadding }}>
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-center px-6"
                >
                    <div
                        className="rounded-xl flex items-center justify-center text-white font-black shadow-lg shrink-0"
                        style={{ backgroundColor: themeColor, width: 32 * iconSize, height: 32 * iconSize, fontSize: fontSizes.description }}
                    >
                        {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black uppercase tracking-widest block" style={{ color: config.dateColor || '#94a3b8', fontSize: fontSizes.date, marginBottom: 2 }}>
                            {event.date}
                        </span>
                        <h3 className="font-bold" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 2, ...wrapStyle }}>
                            {event.title}
                        </h3>
                        <p className="leading-relaxed" style={{ color: config.descriptionColor || '#475569', fontSize: fontSizes.description, ...wrapStyle }}>
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    const renderZigzag = () => (
        <div className="relative w-full flex flex-col" style={{ gap: scaledGap, paddingBlock: scaledPadding }}>
            <div
                className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 opacity-20"
                style={{ width: config.lineThickness || 2, backgroundColor: themeColor }}
            />
            {events.map((event, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div key={event.id} className={`flex items-start w-full relative ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className="absolute left-1/2 -translate-x-1/2 top-0">
                            <div
                                className="rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center"
                                style={{ width: 24 * iconSize, height: 24 * iconSize }}
                            >
                                <MarkerIcon size={12} />
                            </div>
                        </div>
                        <m.div
                            initial={{ opacity: 0, x: isEven ? -10 : 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`w-1/2 ${isEven ? 'pr-6 text-right' : 'pl-6 text-left'}`}
                        >
                            <span className="font-black uppercase tracking-widest block" style={{ color: config.dateColor || '#94a3b8', fontSize: fontSizes.date, marginBottom: 4 }}>
                                {event.date}
                            </span>
                            <h4 className="font-black leading-tight uppercase tracking-tight" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 4, ...wrapStyle }}>
                                {event.title}
                            </h4>
                            <p className="leading-relaxed font-medium" style={{ color: config.descriptionColor || '#64748b', fontSize: fontSizes.description, ...wrapStyle }}>
                                {event.description}
                            </p>
                        </m.div>
                        <div className="w-1/2" />
                    </div>
                );
            })}
        </div>
    );

    const renderCards = () => (
        <div className="w-full flex flex-col items-center" style={{ gap: scaledGap, paddingBlock: scaledPadding }}>
            {events.map((event) => (
                <m.div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-xl border border-slate-50 flex flex-col items-center text-center w-[90%]"
                    style={{ padding: 12 }}
                >
                    <span className="font-black uppercase tracking-[0.2em]" style={{ color: config.dateColor || themeColor, fontSize: fontSizes.date, marginBottom: 4 }}>
                        {event.date}
                    </span>
                    <h3 className="font-bold px-2 tracking-tight" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 2, ...wrapStyle }}>
                        {event.title}
                    </h3>
                    <p className="leading-relaxed px-4" style={{ color: config.descriptionColor || '#64748b', fontSize: fontSizes.description, ...wrapStyle }}>
                        {event.description}
                    </p>
                </m.div>
            ))}
        </div>
    );

    const renderNumberedList = () => (
        <div className="w-full flex flex-col" style={{ gap: scaledGap, paddingBlock: scaledPadding }}>
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-6 px-8 group relative"
                >
                    <div className="flex flex-col items-center shrink-0 pt-1">
                        <span
                            className="font-black opacity-10 group-hover:opacity-20 transition-opacity leading-none select-none"
                            style={{ color: themeColor, fontSize: '40px' }}
                        >
                            {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="w-px h-full bg-slate-200 mt-2 opacity-50 absolute left-8 top-12 bottom-0" />
                    </div>
                    <div className="flex-1 min-w-0 pb-6 border-b border-slate-100 last:border-0 text-left">
                        <span className="font-black uppercase tracking-widest block" style={{ color: config.dateColor || '#94a3b8', fontSize: fontSizes.date, marginBottom: 4 }}>
                            {event.date}
                        </span>
                        <h3 className="font-bold leading-tight" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 4, ...wrapStyle }}>
                            {event.title}
                        </h3>
                        <p className="leading-relaxed font-medium" style={{ color: config.descriptionColor || '#64748b', fontSize: fontSizes.description, ...wrapStyle }}>
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    const renderPremiumZigzag = () => (
        <div className="relative w-full flex flex-col" style={{ gap: scaledGap * 1.5, paddingBlock: scaledPadding }}>
            {/* Curved Path Background */}
            <svg className="absolute left-1/2 -translate-x-1/2 top-0 w-full h-full opacity-10 pointer-events-none overflow-visible" viewBox="0 0 100 1000" preserveAspectRatio="none">
                <path
                    d="M50,0 Q60,50 50,100 T50,200 T50,300 T50,400 T50,500 T50,600 T50,700 T50,800 T50,900 T50,1000"
                    fill="none"
                    stroke={themeColor}
                    strokeWidth="2"
                />
            </svg>

            {events.map((event, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div key={event.id} className={`flex items-center w-full relative ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Centered Marker */}
                        <div className="absolute left-1/2 -translate-x-1/2 z-10">
                            <m.div
                                className="rounded-full bg-white shadow-xl flex items-center justify-center border-2"
                                style={{
                                    width: 36 * iconSize,
                                    height: 36 * iconSize,
                                    borderColor: themeColor,
                                    boxShadow: `0 0 15px ${themeColor}33`
                                }}
                                whileHover={{ scale: 1.1 }}
                            >
                                <MarkerIcon size={16} />
                            </m.div>
                        </div>

                        <m.div
                            initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`w-1/2 ${isEven ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                        >
                            <span className="font-black uppercase tracking-[0.2em] block" style={{ color: config.dateColor || themeColor, fontSize: fontSizes.date, marginBottom: 6 }}>
                                {event.date}
                            </span>
                            <h4 className="font-black leading-tight uppercase tracking-tight" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 6, ...wrapStyle }}>
                                {event.title}
                            </h4>
                            <div className={`h-1 w-12 mb-3 bg-gradient-to-r ${isEven ? 'from-transparent to-current ml-auto' : 'from-current to-transparent'}`} style={{ color: themeColor }} />
                            <p className="leading-relaxed font-serif italic" style={{ color: config.descriptionColor || '#64748b', fontSize: fontSizes.description, ...wrapStyle }}>
                                {event.description}
                            </p>
                        </m.div>
                        <div className="w-1/2" />
                    </div>
                );
            })}
        </div>
    );

    const renderFloatingGlass = () => (
        <div className="w-full flex flex-col items-center" style={{ gap: scaledGap * 0.8, paddingBlock: scaledPadding }}>
            {events.map((event) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="backdrop-blur-md bg-white/40 rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col items-center text-center w-[85%] overflow-hidden"
                    whileHover={{ y: -5 }}
                >
                    <div className="w-full bg-gradient-to-b from-white/60 to-transparent p-6 flex flex-col items-center">
                        <span className="font-black uppercase tracking-[0.3em] block opacity-40 mb-2" style={{ color: config.dateColor || '#000', fontSize: '9px' }}>
                            {event.date}
                        </span>
                        <div className="h-px w-12 bg-black/10 mb-4" />
                        <h3 className="font-bold tracking-tight px-4" style={{ color: config.titleColor || '#0f172a', fontSize: fontSizes.title, marginBottom: 4, ...wrapStyle }}>
                            {event.title}
                        </h3>
                    </div>
                    <div className="p-6 pt-0">
                        <p className="leading-relaxed font-medium opacity-70" style={{ color: config.descriptionColor || '#475569', fontSize: fontSizes.description, ...wrapStyle }}>
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    // --- SMART CONTAINER AUTO-SCALE ---
    // Instead of shrinking individual font components to illegible levels, 
    // we render the container and use a last-resort transform scale if density is extremely high.
    // This maintains internal proportions while ensuring zero-cropping.
    const outerScale = count <= 5 ? 1 : count === 6 ? 0.95 : 0.88;

    return (
        <div className="w-full h-full bg-transparent select-none antialiased flex flex-col items-center justify-center overflow-hidden">
            <div
                className="w-full transition-transform duration-500 ease-out origin-center"
                style={{ transform: `scale(${outerScale})` }}
            >
                {variant === 'elegant' && renderElegant()}
                {variant === 'modern' && renderModern()}
                {variant === 'zigzag' && renderZigzag()}
                {variant === 'cards' && renderCards()}
                {variant === 'numbered_list' && renderNumberedList()}
                {variant === 'premium_zigzag' && renderPremiumZigzag()}
                {variant === 'floating_glass' && renderFloatingGlass()}
            </div>
        </div>
    );
};
