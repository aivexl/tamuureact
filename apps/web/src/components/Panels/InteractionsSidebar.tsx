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
    { id: 'confetti', label: 'Classic Confetti', category: 'celebratory' },
    { id: 'gold_rain', label: 'Golden Rain', category: 'celebratory' },
    { id: 'party_poppers', label: 'Party Poppers', category: 'celebratory' },
    { id: 'glitter', label: 'Glitter', category: 'celebratory' },
    { id: 'balloons', label: 'Balloons', category: 'celebratory' },

    { id: 'rose_petals', label: 'Rose Petals', category: 'nature' },
    { id: 'sakura', label: 'Sakura Petals', category: 'nature' },
    { id: 'autumn_leaves', label: 'Autumn Leaves', category: 'nature' },
    { id: 'hearts', label: 'Hearts', category: 'nature' },
    { id: 'feathers', label: 'Soft Feathers', category: 'nature' },

    { id: 'snow', label: 'Gentle Snow', category: 'atmospheric' },
    { id: 'fireflies', label: 'Fireflies', category: 'atmospheric' },
    { id: 'rain', label: 'Romantic Rain', category: 'atmospheric' },
    { id: 'mist', label: 'Mist Glow', category: 'atmospheric' },

    { id: 'matrix', label: 'Digital Rain', category: 'hitech' },
    { id: 'sparks', label: 'Cyber Sparks', category: 'hitech' },
    { id: 'glitch', label: 'Neon Glitch', category: 'hitech' },
    { id: 'hologram', label: 'Hologram', category: 'hitech' },

    { id: 'aurora', label: 'Aurora', category: 'magic' },
    { id: 'stars', label: 'Star Night', category: 'magic' },
    { id: 'fairy_dust', label: 'Fairy Dust', category: 'magic' },
    { id: 'phoenix', label: 'Phoenix Fire', category: 'magic' },
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

            {/* Simulation Controls - Tamuu Signature Architecture */}
            <div className="p-6 space-y-6 border-b border-white/5 bg-white/[0.02]">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-1">Target Recipient</label>
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-premium-accent transition-colors" />
                        <input
                            type="text"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            placeholder="Recipient name..."
                            className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:ring-0 focus:bg-white/[0.08] transition-all duration-500 placeholder:text-white/10"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFire}
                    className="w-full py-4 rounded-2xl bg-premium-accent hover:bg-[#d4ae8b] flex items-center justify-center gap-3 group overflow-hidden relative shadow-2xl shadow-premium-accent/10 transition-all duration-500"
                >
                    <Play className="w-4 h-4 text-slate-900 fill-current" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Deploy Blast</span>
                </motion.button>
                <p className="text-[8px] text-white/20 text-center uppercase tracking-widest font-bold">Simulation fires locally across edge nodes</p>
            </div>

            {/* Gallery Search & Filter - Minimalist Glassmorphism */}
            <div className="p-6 space-y-5">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-premium-accent transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter effects..."
                        className="w-full bg-white/[0.02] border border-white/5 rounded-full py-3.5 pl-12 pr-6 text-xs text-white placeholder:text-white/10 focus:ring-0 focus:bg-white/[0.05] transition-all duration-500"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`shrink-0 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 border ${activeCategory === 'all' ? 'bg-white text-slate-900 border-white shadow-xl' : 'text-white/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 border ${activeCategory === cat.id ? 'bg-white text-slate-900 border-white shadow-xl' : 'text-white/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                        >
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
