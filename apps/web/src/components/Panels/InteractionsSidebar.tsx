import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
    Zap, Play, User as UserIcon, Sparkles,
    Heart, Snowflake, Terminal, Wand2,
    Info, Search, Filter
} from 'lucide-react';

const CATEGORIES = [
    { id: 'celebratory', name: 'Celebratory', icon: <Zap className="w-4 h-4" /> },
    { id: 'nature', name: 'Nature & Romance', icon: <Heart className="w-4 h-4" /> },
    { id: 'atmospheric', name: 'Atmospheric', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'hitech', name: 'High-Tech', icon: <Terminal className="w-4 h-4" /> },
    { id: 'magic', name: 'Magic', icon: <Wand2 className="w-4 h-4" /> },
];

const EFFECTS = [
    { id: 'confetti', label: 'Classic Confetti', icon: '🎉', category: 'celebratory' },
    { id: 'gold_rain', label: 'Golden Rain', icon: '💰', category: 'celebratory' },
    { id: 'party_poppers', label: 'Party Poppers', icon: '🎊', category: 'celebratory' },
    { id: 'glitter', label: 'Glitter', icon: '✨', category: 'celebratory' },
    { id: 'balloons', label: 'Balloons', icon: '🎈', category: 'celebratory' },

    { id: 'rose_petals', label: 'Rose Petals', icon: '🌹', category: 'nature' },
    { id: 'sakura', label: 'Sakura Petals', icon: '🌸', category: 'nature' },
    { id: 'autumn_leaves', label: 'Autumn Leaves', icon: '🍁', category: 'nature' },
    { id: 'hearts', label: 'Hearts', icon: '❤️', category: 'nature' },
    { id: 'feathers', label: 'Soft Feathers', icon: '🪶', category: 'nature' },

    { id: 'snow', label: 'Gentle Snow', icon: '❄️', category: 'atmospheric' },
    { id: 'fireflies', label: 'Fireflies', icon: '🏮', category: 'atmospheric' },
    { id: 'rain', label: 'Romantic Rain', icon: '🌧️', category: 'atmospheric' },
    { id: 'mist', label: 'Mist Glow', icon: '🌫️', category: 'atmospheric' },

    { id: 'matrix', label: 'Digital Rain', icon: '📟', category: 'hitech' },
    { id: 'sparks', label: 'Cyber Sparks', icon: '⚡', category: 'hitech' },
    { id: 'glitch', label: 'Neon Glitch', icon: '📺', category: 'hitech' },
    { id: 'hologram', label: 'Hologram', icon: '📡', category: 'hitech' },

    { id: 'aurora', label: 'Aurora', icon: '🌌', category: 'magic' },
    { id: 'stars', label: 'Star Night', icon: '⭐', category: 'magic' },
    { id: 'fairy_dust', label: 'Fairy Dust', icon: '🧚', category: 'magic' },
    { id: 'phoenix', label: 'Phoenix Fire', icon: '🔥', category: 'magic' },
];

export const InteractionsSidebar: React.FC = () => {
    const { triggerInteraction } = useStore();
    const [testName, setTestName] = useState('Budi & Ani');
    const [selectedEffect, setSelectedEffect] = useState('confetti');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const handleFire = () => {
        triggerInteraction(testName, selectedEffect as any);
    };

    const filteredEffects = EFFECTS.filter(e => {
        const matchesSearch = e.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-premium-accent" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Interactions</h2>
                </div>
                <Info className="w-4 h-4 text-white/20 hover:text-white/40 cursor-help" />
            </div>

            {/* Simulation Controls */}
            <div className="p-4 space-y-4 border-b border-white/10 bg-white/5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Test Guest Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        <input
                            type="text"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            placeholder="Type a name..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-premium-accent/50 transition-colors"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(191, 161, 129, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFire}
                    className="w-full py-4 rounded-xl bg-premium-accent/10 border border-premium-accent/30 flex items-center justify-center gap-3 group overflow-hidden relative shadow-[0_0_20px_rgba(191,161,129,0.1)] hover:shadow-[0_0_30px_rgba(191,161,129,0.2)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Play className="w-4 h-4 text-premium-accent fill-premium-accent" />
                    <span className="text-sm font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">Fire Blast</span>
                </motion.button>
                <p className="text-[9px] text-white/30 text-center italic">Simulation fires locally on this canvas and any open Preview tabs</p>
            </div>

            {/* Gallery Search & Filter */}
            <div className="p-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search effects..."
                        className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                </div>

                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${activeCategory === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Effects Gallery */}
            <div className="flex-1 overflow-y-auto premium-scroll px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                    {filteredEffects.map((effect) => (
                        <button
                            key={effect.id}
                            onClick={() => {
                                setSelectedEffect(effect.id);
                                triggerInteraction('Blast Test', effect.id as any);
                            }}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border group relative ${selectedEffect === effect.id
                                    ? 'bg-premium-accent/10 border-premium-accent/50 shadow-[0_0_15px_rgba(191,161,129,0.15)]'
                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                }`}
                        >
                            {selectedEffect === effect.id && (
                                <motion.div
                                    layoutId="effect-active"
                                    className="absolute inset-0 rounded-2xl ring-2 ring-premium-accent ring-inset pointer-events-none"
                                />
                            )}
                            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{effect.icon}</span>
                            <span className={`text-[10px] font-bold text-center ${selectedEffect === effect.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                {effect.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
