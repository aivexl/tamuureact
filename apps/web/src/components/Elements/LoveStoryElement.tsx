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

    // --- SMART SCALING LOGIC ---
    // Proportional scaling to fit canvas without cropping
    const count = Math.max(1, events.length);
    const scaleFactor = count <= 2 ? 1 : count <= 4 ? 0.85 : count <= 6 ? 0.75 : 0.65;

    // Base dimensions that will be scaled
    const baseGap = {
        elegant: 64,  // space-y-16
        modern: 48,   // space-y-12
        zigzag: 80,   // space-y-20
        cards: 24     // gap-6
    }[variant] || 40;

    const basePadding = 40; // py-10
    const scaledGap = baseGap * scaleFactor;
    const scaledPadding = basePadding * scaleFactor;
    const scaledFontSize = scaleFactor < 0.8 ? '0.9em' : '1em';
    const scaledIconSize = scaleFactor < 0.8 ? 0.8 : 1;

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
        <div className="relative w-full h-full px-6 flex flex-col items-center justify-center" style={{ paddingBlock: scaledPadding }}>
            <div
                className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 opacity-20"
                style={{ backgroundColor: themeColor }}
            />

            <div className="w-full flex flex-col items-center" style={{ gap: scaledGap, fontSize: scaledFontSize }}>
                {events.map((event, index) => (
                    <m.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative flex flex-col items-center w-full"
                    >
                        <div
                            className="relative z-10 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100"
                            style={{ width: 40 * scaledIconSize, height: 40 * scaledIconSize, marginBottom: 24 * scaleFactor }}
                        >
                            <m.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <MarkerIcon size={16} />
                            </m.div>
                        </div>

                        <div className="text-center max-w-[90%]">
                            <span
                                className="font-black uppercase tracking-[0.2em] block"
                                style={{ color: themeColor, fontSize: '10px', marginBottom: 8 * scaleFactor }}
                            >
                                {event.date}
                            </span>
                            <h3 className="font-bold text-slate-900 leading-tight uppercase tracking-tight" style={{ fontSize: scaleFactor < 0.8 ? '14px' : '18px', marginBottom: 12 * scaleFactor }}>
                                {event.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed font-medium" style={{ fontSize: scaleFactor < 0.8 ? '11px' : '14px' }}>
                                {event.description}
                            </p>
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    );

    const renderModern = () => (
        <div className="w-full h-full px-6 flex flex-col justify-center" style={{ paddingBlock: scaledPadding, gap: scaledGap, fontSize: scaledFontSize }}>
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6 items-center"
                >
                    <div className="flex flex-col items-center shrink-0">
                        <div
                            className="rounded-2xl flex items-center justify-center text-white font-black shadow-lg"
                            style={{
                                backgroundColor: themeColor,
                                width: 48 * scaledIconSize,
                                height: 48 * scaledIconSize,
                                fontSize: scaleFactor < 0.8 ? '14px' : '18px'
                            }}
                        >
                            {index + 1}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '9px', marginBottom: 4 * scaleFactor }}>
                            {event.date}
                        </span>
                        <h3 className="font-bold text-slate-900 truncate" style={{ fontSize: scaleFactor < 0.8 ? '14px' : '18px', marginBottom: 8 * scaleFactor }}>
                            {event.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed line-clamp-2" style={{ fontSize: scaleFactor < 0.8 ? '11px' : '14px' }}>
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    const renderZigzag = () => (
        <div className="relative w-full h-full px-4 flex flex-col justify-center" style={{ paddingBlock: scaledPadding }}>
            <div
                className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 opacity-20"
                style={{ width: config.lineThickness || 2, backgroundColor: themeColor }}
            />

            <div className="relative z-10 w-full flex flex-col" style={{ gap: scaledGap, fontSize: scaledFontSize }}>
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
                                    style={{ width: 32 * scaledIconSize, height: 32 * scaledIconSize }}
                                >
                                    <MarkerIcon size={14} />
                                </div>
                            </div>

                            {/* Content Side */}
                            <m.div
                                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8 text-left'}`}
                            >
                                <span className="font-black text-slate-400 uppercase tracking-widest block" style={{ fontSize: '9px', marginBottom: 8 * scaleFactor }}>
                                    {event.date}
                                </span>
                                <h4 className="font-black text-slate-900 leading-tight uppercase tracking-tight" style={{ fontSize: scaleFactor < 0.8 ? '13px' : '16px', marginBottom: 8 * scaleFactor }}>
                                    {event.title}
                                </h4>
                                <p className="text-slate-500 leading-relaxed font-medium line-clamp-2" style={{ fontSize: scaleFactor < 0.8 ? '10px' : '11px' }}>
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
        <div className="w-full h-full px-4 flex flex-col justify-center" style={{ paddingBlock: scaledPadding, gap: scaledGap }}>
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[24px] shadow-2xl border border-slate-50 flex flex-col items-center text-center w-full"
                    style={{ padding: 24 * scaleFactor }}
                >
                    <div
                        className="rounded-2xl bg-slate-50 flex items-center justify-center self-center"
                        style={{ width: 48 * scaledIconSize, height: 48 * scaledIconSize, marginBottom: 16 * scaleFactor }}
                    >
                        <MarkerIcon size={20} />
                    </div>
                    <span
                        className="font-black uppercase tracking-[0.2em]"
                        style={{ color: themeColor, fontSize: '10px', marginBottom: 8 * scaleFactor }}
                    >
                        {event.date}
                    </span>
                    <h3 className="font-bold text-slate-900 px-2 tracking-tight truncate w-full" style={{ fontSize: scaleFactor < 0.8 ? '16px' : '20px', marginBottom: 4 * scaleFactor }}>
                        {event.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed line-clamp-1" style={{ fontSize: scaleFactor < 0.8 ? '11px' : '14px' }}>
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

