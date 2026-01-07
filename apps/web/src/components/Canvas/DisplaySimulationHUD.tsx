import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Play, Sparkles, User, Settings2, X, ChevronUp, ChevronDown } from 'lucide-react';

interface DisplaySimulationHUDProps {
    className?: string;
}

export const DisplaySimulationHUD: React.FC<DisplaySimulationHUDProps> = ({ className = '' }) => {
    const { triggerInteraction } = useStore();
    const [isOpen, setIsOpen] = useState(true);
    const [guestName, setGuestName] = useState('John Doe');
    const [selectedEffect, setSelectedEffect] = useState('confetti');
    const [selectedStyle, setSelectedStyle] = useState('modern');

    const effects = [
        { id: 'confetti', label: 'Confetti', icon: '🎉' },
        { id: 'gold_rain', label: 'Gold Rain', icon: '💰' },
        { id: 'fireworks', label: 'Fireworks', icon: '🚀' },
        { id: 'snow', label: 'Snow', icon: '❄️' },
        { id: 'matrix', label: 'Matrix', icon: '📟' },
        { id: 'stars', label: 'Stars', icon: '⭐' },
        { id: 'hearts', label: 'Hearts', icon: '❤️' },
        { id: 'rose_petals', label: 'Petals', icon: '🌹' },
    ];

    const styles = [
        { id: 'modern', label: 'Modern' },
        { id: 'elegant', label: 'Elegant' },
        { id: 'bold', label: 'Bold' },
        { id: 'neon', label: 'Neon' },
        { id: 'minimal', label: 'Minimal' },
    ];

    const handleFire = () => {
        // Trigger center-screen interaction
        triggerInteraction(guestName, selectedEffect, selectedStyle as any, { x: 0.5, y: 0.5 });
    };

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] ${className}`}>
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 w-[420px] ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                    <Settings2 className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Simulation HUD</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Visual Engine 2.0</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            {/* Guest Input */}
                            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                                <div className="w-10 h-10 flex items-center justify-center text-white/20">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Simulated Guest Name..."
                                    className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-white/20 font-medium"
                                />
                            </div>

                            {/* Effect Selector */}
                            <div className="grid grid-cols-4 gap-2">
                                {effects.map(effect => (
                                    <button
                                        key={effect.id}
                                        onClick={() => setSelectedEffect(effect.id)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${selectedEffect === effect.id
                                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-xl mb-1">{effect.icon}</span>
                                        <span className="text-[9px] font-bold uppercase truncate w-full text-center">{effect.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Style Selector */}
                            <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
                                {styles.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap border transition-all ${selectedStyle === style.id
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {style.label}
                                    </button>
                                ))}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleFire}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                                SIMULATE INTERACTION
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-full shadow-2xl hover:bg-white/5 transition-colors group"
                    >
                        <div className="p-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full group-hover:scale-110 transition-transform">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm pr-2">Simulate</span>
                        <ChevronUp className="w-4 h-4 text-white/40" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};
