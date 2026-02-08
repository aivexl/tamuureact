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

    // --- ULTRA-AGGRESSIVE SMART SCALING LOGIC ---
    // Heavily shrink everything as count increases to avoid cropping
    const count = Math.max(1, events.length);
    const scaleFactor = count <= 2 ? 1 : count <= 4 ? 0.8 : count <= 6 ? 0.65 : 0.5;

    const baseGap = {
        elegant: 48,
        modern: 32,
        zigzag: 48,
        cards: 16
    }[variant] || 32;

    const basePadding = 24;
    const scaledGap = Math.max(8, baseGap * scaleFactor);
    const scaledPadding = Math.max(12, basePadding * scaleFactor);
    const scaledFontSize = scaleFactor < 0.6 ? '0.75em' : scaleFactor < 0.8 ? '0.85em' : '1em';
    const scaledIconSize = scaleFactor < 0.6 ? 0.6 : scaleFactor < 0.8 ? 0.8 : 1;

    if (events.length === 0 && isEditor) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <Heart className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Love Story Timeline</h3>
                <p className="text-slate-300 text-xs mt-2">Tambahkan momen spesial di panel editor</p>
            </div>
        );
    }

    // Don't render anything if no filled events in preview mode
    if (events.length === 0 && !isEditor) {
        return null;
    }

    const MarkerIcon = ({ size = 16 }: { size?: number }) => {
        const adjustedSize = size * (scaledIconSize || 1);
        switch (markerStyle) {
            case 'star': return <Star size={adjustedSize} fill={themeColor} />;
            case 'dot':
                return <div className="rounded-full shadow-lg" style={{ width: adjustedSize * 0.6, height: adjustedSize * 0.6, backgroundColor: themeColor, border: '2px solid white' }} />;
            case 'diamond': return <div className="rotate-45" style={{ width: adjustedSize * 0.7, height: adjustedSize * 0.7, backgroundColor: themeColor }} />;
            default: return <Heart size={adjustedSize} fill={themeColor} />;
        }
    };

    // -------------------------------------------------------------------------
    // RENDER VARIANTS
    // -------------------------------------------------------------------------

    const renderElegant = () => (
        <div className="relative w-full h-full px-6 flex flex-col items-center justify-around" style={{ paddingBlock: scaledPadding }}>
            <div
                className="absolute left-1/2 top-4 bottom-4 w-[1px] -translate-x-1/2 opacity-20"
                style={{ backgroundColor: themeColor }}
            />

            <div className="w-full flex flex-col items-center h-full justify-around" style={{ gap: scaledGap, fontSize: scaledFontSize }}>
                {events.map((event, index) => (
                    <m.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative flex flex-col items-center w-full"
                    >
                        <div
                            className="relative z-10 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100"
                            style={{ width: 32 * scaledIconSize, height: 32 * scaledIconSize, marginBottom: 12 * scaleFactor }}
                        >
                            <m.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <MarkerIcon size={14} />
                            </m.div>
                        </div>

                        <div className="text-center max-w-[95%]">
                            <span
                                className="font-black uppercase tracking-[0.2em] block"
                                style={{ color: themeColor, fontSize: '8px', marginBottom: 4 * scaleFactor }}
                            >
                                {event.date}
                            </span>
                            <h3 className="font-bold text-slate-900 leading-tight uppercase tracking-tight" style={{ fontSize: scaleFactor < 0.6 ? '12px' : scaleFactor < 0.8 ? '14px' : '18px', marginBottom: 6 * scaleFactor }}>
                                {event.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed font-medium line-clamp-2" style={{ fontSize: scaleFactor < 0.6 ? '9px' : scaleFactor < 0.8 ? '11px' : '14px' }}>
                                {event.description}
                            </p>
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    );

    const renderModern = () => (
        <div className="w-full h-full px-6 flex flex-col justify-around" style={{ paddingBlock: scaledPadding, gap: scaledGap, fontSize: scaledFontSize }}>
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-4 items-center"
                >
                    <div className="flex flex-col items-center shrink-0">
                        <div
                            className="rounded-xl flex items-center justify-center text-white font-black shadow-lg"
                            style={{
                                backgroundColor: themeColor,
                                width: 36 * scaledIconSize,
                                height: 36 * scaledIconSize,
                                fontSize: scaleFactor < 0.6 ? '12px' : scaleFactor < 0.8 ? '14px' : '18px'
                            }}
                        >
                            {index + 1}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '8px', marginBottom: 2 * scaleFactor }}>
                            {event.date}
                        </span>
                        <h3 className="font-bold text-slate-900 truncate" style={{ fontSize: scaleFactor < 0.6 ? '12px' : scaleFactor < 0.8 ? '14px' : '18px', marginBottom: 4 * scaleFactor }}>
                            {event.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed line-clamp-1" style={{ fontSize: scaleFactor < 0.6 ? '9px' : scaleFactor < 0.8 ? '11px' : '14px' }}>
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    const renderZigzag = () => (
        <div className="relative w-full h-full px-4 flex flex-col justify-around" style={{ paddingBlock: scaledPadding }}>
            <div
                className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 opacity-20"
                style={{ width: config.lineThickness || 2, backgroundColor: themeColor }}
            />

            <div className="relative z-10 w-full flex flex-col h-full justify-around" style={{ gap: scaledGap, fontSize: scaledFontSize }}>
                {events.map((event, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <div
                            key={event.id}
                            className={`flex items-start w-full relative ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                            {/* Marker */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-0">
                                <div
                                    className="rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center"
                                    style={{ width: 28 * scaledIconSize, height: 28 * scaledIconSize }}
                                >
                                    <MarkerIcon size={12} />
                                </div>
                            </div>

                            {/* Content Side */}
                            <m.div
                                initial={{ opacity: 0, x: isEven ? -10 : 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={`w-1/2 ${isEven ? 'pr-6 text-right' : 'pl-6 text-left'}`}
                            >
                                <span className="font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '7px', marginBottom: 4 * scaleFactor }}>
                                    {event.date}
                                </span>
                                <h4 className="font-black text-slate-900 leading-tight uppercase tracking-tight" style={{ fontSize: scaleFactor < 0.6 ? '11px' : scaleFactor < 0.8 ? '13px' : '16px', marginBottom: 4 * scaleFactor }}>
                                    {event.title}
                                </h4>
                                <p className="text-slate-500 leading-relaxed font-medium line-clamp-1" style={{ fontSize: scaleFactor < 0.6 ? '8px' : scaleFactor < 0.8 ? '10px' : '11px' }}>
                                    {event.description}
                                </p>
                            </m.div>

                            <div className="w-1/2" />
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderCards = () => (
        <div className="w-full h-full px-4 flex flex-col justify-around" style={{ paddingBlock: scaledPadding, gap: scaledGap }}>
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-50 flex flex-col items-center text-center w-full"
                    style={{ padding: 12 * scaleFactor }}
                >
                    <div
                        className="rounded-xl bg-slate-50 flex items-center justify-center self-center"
                        style={{ width: 32 * scaledIconSize, height: 32 * scaledIconSize, marginBottom: 8 * scaleFactor }}
                    >
                        <MarkerIcon size={14} />
                    </div>
                    <span
                        className="font-black uppercase tracking-[0.2em]"
                        style={{ color: themeColor, fontSize: '8px', marginBottom: 4 * scaleFactor }}
                    >
                        {event.date}
                    </span>
                    <h3 className="font-bold text-slate-900 px-2 tracking-tight truncate w-full" style={{ fontSize: scaleFactor < 0.6 ? '12px' : scaleFactor < 0.8 ? '16px' : '20px', marginBottom: 2 * scaleFactor }}>
                        {event.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed line-clamp-1" style={{ fontSize: scaleFactor < 0.6 ? '9px' : scaleFactor < 0.8 ? '11px' : '14px' }}>
                        {event.description}
                    </p>
                </m.div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full bg-transparent select-none antialiased flex flex-col overflow-hidden">
            {variant === 'elegant' && renderElegant()}
            {variant === 'modern' && renderModern()}
            {variant === 'zigzag' && renderZigzag()}
            {variant === 'cards' && renderCards()}
        </div>
    );
};

