import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { Heart, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

export const LoveStoryElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const config = layer.loveStoryConfig || {
        variant: 'zigzag',
        markerStyle: 'heart',
        themeColor: '#bfa181',
        lineThickness: 2,
        events: []
    };

    const events = config.events || [];
    const variant = config.variant || 'zigzag';

    const renderMarker = () => (
        <div className="relative group">
            <div
                className="absolute inset-0 blur-md opacity-40 group-hover:opacity-80 transition-opacity"
                style={{ backgroundColor: config.themeColor }}
            />
            <div
                className="w-5 h-5 rounded-full flex items-center justify-center relative z-10 shadow-lg border border-white/20"
                style={{ backgroundColor: config.themeColor }}
            >
                {config.markerStyle === 'heart' ? (
                    <Heart className="w-2.5 h-2.5 text-black fill-current" />
                ) : (
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                )}
            </div>
        </div>
    );

    if (variant === 'cards') {
        return (
            <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto scrollbar-hide">
                {events.map((event, index) => (
                    <m.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel p-4 flex gap-4 border border-white/10 hover:border-white/20 transition-all group"
                        style={{ borderRadius: 16 }}
                    >
                        {event.imageUrl ? (
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                                <ImageIcon className="w-6 h-6 text-white/10" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black tracking-widest uppercase py-0.5 px-2 rounded-full bg-white/10 text-white/60">
                                    {event.date}
                                </span>
                            </div>
                            <h4 className="text-sm font-black text-white truncate group-hover:text-premium-accent transition-colors">
                                {event.title}
                            </h4>
                            <p className="text-[10px] text-white/50 line-clamp-2 mt-1 leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    </m.div>
                ))}
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col items-center py-10 px-4 overflow-y-auto scrollbar-hide`}>
            <div className="relative w-full max-w-md">
                {/* Main Timeline Line */}
                <div
                    className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 opacity-20"
                    style={{ width: config.lineThickness, backgroundColor: config.themeColor }}
                />

                <div className="space-y-16 relative z-10">
                    {events.map((event, index) => {
                        const isEven = index % 2 === 0;
                        const side = variant === 'zigzag' ? (isEven ? 'left' : 'right') : 'right';

                        return (
                            <div
                                key={event.id}
                                className={`flex items-start w-full relative ${side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                                {/* Marker (Absolute Center) */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-0">
                                    {renderMarker()}
                                </div>

                                {/* Content Side */}
                                <m.div
                                    initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className={`w-1/2 ${side === 'left' ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                                >
                                    <div className={`flex flex-col ${side === 'left' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-3 h-3 opacity-40" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                {event.date}
                                            </span>
                                        </div>

                                        <div className="relative group/content">
                                            {event.imageUrl && (
                                                <div className={`mb-4 overflow-hidden rounded-2xl shadow-2xl border border-white/10 group-hover/content:border-premium-accent/40 transition-colors`}>
                                                    <img src={event.imageUrl} alt={event.title} className="w-full aspect-[4/3] object-cover group-hover/content:scale-105 transition-transform duration-1000" />
                                                </div>
                                            )}

                                            <h4 className="text-base font-black text-white leading-tight mb-2 uppercase tracking-tight">
                                                {event.title}
                                            </h4>

                                            <div
                                                className={`h-px w-12 bg-gradient-to-r ${side === 'left' ? 'from-transparent to-premium-accent' : 'from-premium-accent to-transparent'} opacity-30 mb-3`}
                                            />

                                            <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                </m.div>

                                {/* Empty Side */}
                                <div className="w-1/2" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Visual Footer */}
            <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-20 flex flex-col items-center gap-4 opacity-20"
            >
                <div className="w-px h-12 bg-gradient-to-b from-premium-accent to-transparent" />
                <Heart className="w-4 h-4" />
            </m.div>
        </div>
    );
};
