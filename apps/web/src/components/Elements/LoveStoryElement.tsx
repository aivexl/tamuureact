import React from 'react';
import { m } from 'framer-motion';
import { Heart, Star, Circle, Calendar, MapPin } from 'lucide-react';
import { Layer } from '@/store/layersSlice';

interface LoveStoryElementProps {
    layer: Layer;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

export const LoveStoryElement: React.FC<LoveStoryElementProps> = ({ layer, isEditor, onContentLoad }) => {
    const config = layer.loveStoryConfig;

    React.useEffect(() => {
        onContentLoad?.();
    }, []);

    if (!config || !config.events || config.events.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <Heart className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Love Story Timeline</h3>
                <p className="text-slate-300 text-xs mt-2">Tambahkan momen spesial di panel editor</p>
            </div>
        );
    }

    const { variant = 'elegant', themeColor = '#db2777', markerStyle = 'heart', events } = config;

    const MarkerIcon = () => {
        switch (markerStyle) {
            case 'star': return <Star size={16} fill={themeColor} />;
            case 'diamond': return <div className="w-3 h-3 rotate-45" style={{ backgroundColor: themeColor }} />;
            default: return <Heart size={16} fill={themeColor} />;
        }
    };

    // -------------------------------------------------------------------------
    // RENDER VARIANTS
    // -------------------------------------------------------------------------

    const renderElegant = () => (
        <div className="relative w-full py-10 px-6">
            {/* Center Line */}
            <div
                className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 opacity-20"
                style={{ backgroundColor: themeColor }}
            />

            <div className="space-y-16">
                {events.map((event, index) => (
                    <m.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative flex flex-col items-center"
                    >
                        {/* Marker */}
                        <div className="relative z-10 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                            <m.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <MarkerIcon />
                            </m.div>
                        </div>

                        {/* Content */}
                        <div className="text-center max-w-[85%]">
                            <span
                                className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block"
                                style={{ color: themeColor }}
                            >
                                {event.date}
                            </span>
                            <h3 className="text-xl font-serif text-slate-900 mb-3 leading-tight">
                                {event.title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {event.description}
                            </p>
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    );

    const renderModern = () => (
        <div className="w-full py-8 px-6 space-y-12">
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6"
                >
                    <div className="flex flex-col items-center">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                            style={{ backgroundColor: themeColor }}
                        >
                            {index + 1}
                        </div>
                        {index !== events.length - 1 && (
                            <div className="w-1 h-full bg-slate-100 my-2 rounded-full" />
                        )}
                    </div>
                    <div className="flex-1 pb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {event.date}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {event.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                </m.div>
            ))}
        </div>
    );

    const renderZigzag = () => (
        <div className="relative w-full py-12 px-4 overflow-hidden">
            <div
                className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 border-l-2 border-dashed border-slate-200"
            />

            <div className="space-y-20">
                {events.map((event, index) => (
                    <m.div
                        key={event.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`relative flex items-center w-full ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                    >
                        {/* Marker on Line */}
                        <div className="absolute left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-white border-4 shadow-sm" style={{ borderColor: themeColor }} />

                        {/* Card */}
                        <div className={`w-[45%] p-5 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                            <div
                                className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-3"
                                style={{ backgroundColor: themeColor }}
                            >
                                {event.date}
                            </div>
                            <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">
                                {event.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 leading-normal line-clamp-3">
                                {event.description}
                            </p>
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    );

    const renderCards = () => (
        <div className="w-full py-10 px-4 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6">
            {events.map((event, index) => (
                <m.div
                    key={event.id}
                    className="flex-shrink-0 w-[280px] snap-center p-8 bg-white rounded-[32px] shadow-2xl border border-slate-50 flex flex-col items-center text-center"
                >
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                        <MarkerIcon />
                    </div>
                    <span
                        className="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
                        style={{ color: themeColor }}
                    >
                        {event.date}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 px-2 italic font-serif">
                        {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">
                        {event.description}
                    </p>

                    <div className="mt-8 flex gap-2">
                        {events.map((_, dotIndex) => (
                            <div
                                key={dotIndex}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === dotIndex ? 'w-4' : 'opacity-20'}`}
                                style={{ backgroundColor: themeColor }}
                            />
                        ))}
                    </div>
                </m.div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full overflow-y-auto hide-scrollbar bg-transparent select-none antialiased">
            {variant === 'elegant' && renderElegant()}
            {variant === 'modern' && renderModern()}
            {variant === 'zigzag' && renderZigzag()}
            {variant === 'cards' && renderCards()}
        </div>
    );
};
