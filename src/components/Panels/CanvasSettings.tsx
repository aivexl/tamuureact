import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Palette, Image } from 'lucide-react';

export const CanvasSettings: React.FC = () => {
    const { backgroundColor, setBackgroundColor } = useStore();

    const presetColors = [
        { color: '#0a0a0a', label: 'Dark' },
        { color: '#1a1a1a', label: 'Charcoal' },
        { color: '#0f172a', label: 'Navy' },
        { color: '#1e1b4b', label: 'Indigo' },
        { color: '#422006', label: 'Brown' },
        { color: '#ffffff', label: 'White' },
        { color: '#fef3c7', label: 'Cream' },
        { color: '#fce7f3', label: 'Pink' }
    ];

    return (
        <div className="h-full p-4 space-y-6">
            <div className="flex items-center gap-2 text-white/60">
                <Palette className="w-4 h-4" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Canvas Background</h4>
            </div>

            <div className="space-y-4">
                {/* Preset Colors */}
                <div>
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Presets</label>
                    <div className="grid grid-cols-4 gap-2">
                        {presetColors.map((preset) => (
                            <motion.button
                                key={preset.color}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setBackgroundColor(preset.color)}
                                className={`w-full aspect-square rounded-lg border-2 transition-all ${backgroundColor === preset.color
                                    ? 'border-premium-accent ring-2 ring-premium-accent/30'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Custom Color */}
                <div>
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Custom Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={/^#[0-9A-F]{6}$/i.test(backgroundColor) ? backgroundColor : '#0a0a0a'}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                        />
                        <input
                            type="text"
                            value={backgroundColor || '#0a0a0a'}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none font-mono"
                        />
                    </div>
                </div>

                {/* Background Image (Future) */}
                <div className="pt-4 border-t border-white/10">
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Background Image</label>
                    <div className="p-4 border-2 border-dashed border-white/10 rounded-xl text-center">
                        <Image className="w-6 h-6 mx-auto mb-2 text-white/20" />
                        <p className="text-[10px] text-white/30">Coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
