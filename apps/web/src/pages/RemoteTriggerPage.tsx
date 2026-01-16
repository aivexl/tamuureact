import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart, Wind, Star, Sun, Cloud, Moon, Terminal, Palette, Wand2, PartyPopper } from 'lucide-react';
import { admin } from '@/lib/api';

const CATEGORIES = [
    {
        name: 'Celebratory',
        icon: <PartyPopper className="w-4 h-4" />,
        effects: [
            { id: 'confetti', label: 'Confetti', icon: '🎉' },
            { id: 'gold_rain', label: 'Gold Rain', icon: '💰' },
            { id: 'party_poppers', label: 'Poppers', icon: '🎊' },
            { id: 'glitter', label: 'Glitter', icon: '✨' }
        ]
    },
    {
        name: 'Nature & Romance',
        icon: <Heart className="w-4 h-4" />,
        effects: [
            { id: 'rose_petals', label: 'Roses', icon: '🌹' },
            { id: 'sakura', label: 'Sakura', icon: '🌸' },
            { id: 'autumn_leaves', label: 'Leaves', icon: '🍁' },
            { id: 'hearts', label: 'Hearts', icon: '❤️' }
        ]
    },
    {
        name: 'Techno & Matrix',
        icon: <Terminal className="w-4 h-4" />,
        effects: [
            { id: 'matrix', label: 'Matrix', icon: '📟' },
            { id: 'sparks', label: 'Sparks', icon: '⚡' },
            { id: 'glitch', label: 'Glitch', icon: '📺' },
            { id: 'hexagons', label: 'Hexagons', icon: '⬢' }
        ]
    },
    {
        name: 'Magic & Mystical',
        icon: <Wand2 className="w-4 h-4" />,
        effects: [
            { id: 'aurora', label: 'Aurora', icon: '🌌' },
            { id: 'stars', label: 'Starry', icon: '⭐' },
            { id: 'orbs', label: 'Orbs', icon: '🔮' },
            { id: 'plasma', label: 'Plasma', icon: '🌀' }
        ]
    }
];

export const RemoteTriggerPage: React.FC = () => {
    const { id } = useParams();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const triggerEffect = async (effect: string) => {
        if (!id) return;
        setLoading(effect);
        try {
            await admin.triggerDisplay(id, { name: 'Remote Control', effect, timestamp: Date.now() });
            setStatus(`Triggered ${effect}!`);
            setTimeout(() => setStatus(null), 2000);
        } catch (err) {
            console.error('Trigger failed:', err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans overflow-x-hidden">
            <header className="mb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-premium-accent/20 rounded-2xl flex items-center justify-center mb-4 border border-premium-accent/30">
                    <Zap className="w-8 h-8 text-premium-accent" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-[0.3em] text-white">Tamuu Remote</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Host Interaction Control</p>
                <div className="mt-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-mono text-white/30 uppercase tracking-tighter">
                    Display ID: {id}
                </div>
            </header>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-premium-accent text-premium-dark rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-premium-accent/40"
                >
                    {status}
                </motion.div>
            )}

            <div className="space-y-8 pb-32">
                {CATEGORIES.map((cat, idx) => (
                    <section key={idx} className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <span className="p-1.5 bg-white/5 rounded-lg text-premium-accent border border-white/10">
                                {cat.icon}
                            </span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                                {cat.name}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {cat.effects.map((eff) => (
                                <button
                                    key={eff.id}
                                    onClick={() => triggerEffect(eff.id)}
                                    disabled={loading !== null}
                                    className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all active:scale-95 ${loading === eff.id
                                        ? 'bg-premium-accent border-premium-accent text-premium-dark'
                                        : 'bg-white/5 border-white/5 active:border-premium-accent/50'
                                        }`}
                                >
                                    <span className="text-3xl">{eff.icon}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                        {eff.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent">
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                    <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-tighter">
                        Tap any effect to trigger it on the live TV display.<br />
                        Only visible to you (The Host).
                    </p>
                </div>
            </footer>
        </div>
    );
};
