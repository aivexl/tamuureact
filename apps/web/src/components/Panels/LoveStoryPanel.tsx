import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Calendar,
    MapPin,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    Settings2,
    Layout,
    Palette,
    Lock
} from 'lucide-react';
import { Layer, LoveStoryMoment } from '@/store/layersSlice';
import { generateId } from '@/lib/utils';
import { useStore } from '@/store/useStore';

// Tier-based limits for Love Story timeline events
const LOVE_STORY_LIMITS: Record<string, number> = {
    free: 1,
    pro: 3,
    vip: 3,
    ultimate: 5,
    platinum: 5,
    elite: 7,
    vvip: 7
};

interface LoveStoryPanelProps {
    layer: Layer;
    handleUpdate: (updates: any) => void;
}

export const LoveStoryPanel: React.FC<LoveStoryPanelProps> = ({ layer, handleUpdate }) => {
    const { user } = useStore();
    const userTier = user?.tier || 'free';
    const maxEvents = LOVE_STORY_LIMITS[userTier] || 1;
    const currentEventCount = (layer.loveStoryConfig?.events || []).length;
    const canAddMore = currentEventCount < maxEvents;

    const config = layer.loveStoryConfig || {
        variant: 'zigzag',
        markerStyle: 'heart',
        themeColor: '#bfa181',
        lineThickness: 2,
        events: []
    };

    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

    const updateConfig = (updates: any) => {
        handleUpdate({
            loveStoryConfig: {
                ...config,
                ...updates
            }
        });
    };

    const addEvent = () => {
        if (!canAddMore) return; // Block if limit reached

        const newEvent: LoveStoryMoment = {
            id: generateId(),
            date: '2024',
            title: 'New Moment',
            description: 'Tell your story here...'
        };
        updateConfig({
            events: [...(config.events || []), newEvent]
        });
        setExpandedEventId(newEvent.id);
    };

    const updateEvent = (id: string, updates: Partial<LoveStoryMoment>) => {
        updateConfig({
            events: (config.events || []).map(e => e.id === id ? { ...e, ...updates } : e)
        });
    };

    const removeEvent = (id: string) => {
        updateConfig({
            events: (config.events || []).filter(e => e.id !== id)
        });
    };

    return (
        <div className="space-y-6">
            {/* Design Settings */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Layout className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Timeline Design</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Variant</label>
                        <select
                            value={config.variant}
                            onChange={(e) => updateConfig({ variant: e.target.value as any })}
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                        >
                            <option value="zigzag" className="bg-premium-dark text-white">Zigzag</option>
                            <option value="elegant" className="bg-premium-dark text-white">Elegant</option>
                            <option value="modern" className="bg-premium-dark text-white">Modern</option>
                            <option value="cards" className="bg-premium-dark text-white">Cards</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Marker</label>
                        <select
                            value={config.markerStyle}
                            onChange={(e) => updateConfig({ markerStyle: e.target.value as any })}
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                        >
                            <option value="heart" className="bg-premium-dark text-white">Heart</option>
                            <option value="dot" className="bg-premium-dark text-white">Classic Dot</option>
                            <option value="diamond" className="bg-premium-dark text-white">Diamond</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Theme Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={config.themeColor || '#bfa181'}
                                onChange={(e) => updateConfig({ themeColor: e.target.value })}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                            />
                            <input
                                type="text"
                                value={config.themeColor}
                                onChange={(e) => updateConfig({ themeColor: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs focus:border-premium-accent/50 focus:outline-none transition-colors font-mono"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Line Thickness</label>
                        <input
                            type="range"
                            min="1"
                            max="8"
                            value={config.lineThickness}
                            onChange={(e) => updateConfig({ lineThickness: Number(e.target.value) })}
                            className="w-full accent-premium-accent opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </section>

            <div className="h-[1px] bg-white/10" />

            {/* Events Management */}
            <section className="space-y-4">
                <div className="flex items-center justify-between text-white/60 mb-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Timeline Events</h4>
                        <span className="text-[9px] font-mono text-premium-accent/60">
                            {currentEventCount}/{maxEvents}
                        </span>
                    </div>
                    <button
                        onClick={addEvent}
                        disabled={!canAddMore}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${canAddMore
                            ? 'bg-premium-accent/10 border border-premium-accent/20 text-premium-accent hover:bg-premium-accent/20'
                            : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        {canAddMore ? <Plus className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {canAddMore ? 'Add Moment' : 'Limit Reached'}
                    </button>
                </div>

                <div className="space-y-3">
                    {(config.events || []).map((event, index) => (
                        <div
                            key={event.id}
                            className={`rounded-2xl border transition-all ${expandedEventId === event.id ? 'bg-white/5 border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                        >
                            <button
                                onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                                className="w-full flex items-center justify-between p-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-premium-accent/10 flex items-center justify-center text-[10px] font-black text-premium-accent border border-premium-accent/20">
                                        {index + 1}
                                    </div>
                                    <div className="text-left min-w-0">
                                        <h5 className="text-xs font-bold text-white/90 truncate uppercase tracking-tight font-display">
                                            {event.title || 'Untitled Moment'}
                                        </h5>
                                        <span className="text-[9px] font-medium text-premium-accent/60 uppercase tracking-widest">
                                            {event.date || 'No Date'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeEvent(event.id);
                                        }}
                                        className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    {expandedEventId === event.id ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedEventId === event.id && (
                                    <m.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 border-t border-white/5 space-y-4 bg-white/[0.01]">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] text-white/30 uppercase font-bold">Date / Label</label>
                                                    <input
                                                        type="text"
                                                        value={event.date}
                                                        onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                                                        placeholder="e.g. 2024"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] text-white/30 uppercase font-bold">Moment Title</label>
                                                    <input
                                                        type="text"
                                                        value={event.title}
                                                        onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                                                        placeholder="First Meet"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-all font-display"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] text-white/30 uppercase font-bold">Story Description</label>
                                                <textarea
                                                    value={event.description}
                                                    onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                                                    placeholder="Share the story..."
                                                    rows={2}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none resize-none transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] text-white/30 uppercase font-bold">Image URL (Optional)</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={event.imageUrl || ''}
                                                        onChange={(e) => updateEvent(event.id, { imageUrl: e.target.value })}
                                                        placeholder="https://..."
                                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-premium-accent/50 focus:outline-none font-mono"
                                                    />
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                                                        {event.imageUrl ? (
                                                            <img src={event.imageUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="w-4 h-4 text-white/10" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {(config.events || []).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed border-white/5 text-white/20">
                            <Heart className="w-8 h-8 mb-2 opacity-10" />
                            <p className="text-[10px] uppercase font-black tracking-widest">No events added</p>
                            <button
                                onClick={addEvent}
                                className="mt-4 text-[9px] font-black text-premium-accent hover:underline uppercase tracking-widest"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
