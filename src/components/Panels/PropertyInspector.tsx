import React from 'react';
import { useStore } from '@/store/useStore';
import {
    RotateCw,
    Move,
    Layers,
    Zap,
    Palette,
    Trash2,
    Lock,
    Unlock,
    EyeOff,
    Eye,
    Type,
    ImageIcon,
    Smile,
    Clock,
    MousePointerClick,
    MailOpen,
    Shield,
    Copy,
    Edit3,
    MapPin,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignStartVertical,
    AlignCenterVertical,
    AlignEndVertical,
    ChevronsUp,
    ArrowUp,
    ArrowDown,
    ChevronsDown
} from 'lucide-react';

export const PropertyInspector: React.FC = () => {
    const { layers, selectedLayerId, updateLayer, removeLayer, selectLayer, activeSectionId, sections, updateElementInSection, removeElementFromSection } = useStore();

    // Find active section and element
    const activeSection = sections.find(s => s.id === activeSectionId);
    const sectionLayer = activeSection?.elements.find(l => l.id === selectedLayerId);
    const globalLayer = layers.find((l) => l.id === selectedLayerId);
    const layer = sectionLayer || globalLayer;

    if (!layer) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-white/20 p-8 text-center">
                <Layers className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-sm">Select an element to customize its properties</p>
            </div>
        );
    }

    const handleUpdate = (updates: any) => {
        if (sectionLayer && activeSectionId) {
            updateElementInSection(activeSectionId, layer.id, updates);
        } else {
            updateLayer(layer.id, updates);
        }
    };

    const handleRemove = () => {
        if (confirm('Are you sure you want to delete this element?')) {
            if (sectionLayer && activeSectionId) {
                removeElementFromSection(activeSectionId, layer.id);
            } else {
                removeLayer(layer.id);
            }
            selectLayer(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
            {/* Header Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-premium-accent">
                    {layer.type === 'image' && <ImageIcon className="w-4 h-4" />}
                    {layer.type === 'text' && <Type className="w-4 h-4" />}
                    {layer.type === 'icon' && <Palette className="w-4 h-4" />}
                    {layer.type === 'gif' && <Smile className="w-4 h-4" />}
                    {layer.type === 'countdown' && <Clock className="w-4 h-4" />}
                    {layer.type === 'button' && <MousePointerClick className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase tracking-widest">{layer.type}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleUpdate({ isLocked: !layer.isLocked })}
                        className={`p-2 rounded-lg transition-colors ${layer.isLocked ? 'text-premium-accent bg-premium-accent/10' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        {layer.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => handleUpdate({ isVisible: !layer.isVisible })}
                        className={`p-2 rounded-lg transition-colors ${!layer.isVisible ? 'text-premium-accent bg-premium-accent/10' : 'text-white/40 hover:bg-white/5'}`}
                    >
                        {!layer.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleRemove}
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="h-[1px] bg-white/10" />

            {/* Transform Section - Matching Legacy */}
            <section className="space-y-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Move className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest flex-1">Transform</h4>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {/* Position */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Position</span>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-white/30">X</span>
                                <input
                                    type="number"
                                    value={Math.round(layer.x)}
                                    onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                                    className="w-full pl-5 pr-1.5 py-1.5 text-xs font-mono bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-accent/20 focus:border-premium-accent transition-all"
                                />
                            </div>
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-white/30">Y</span>
                                <input
                                    type="number"
                                    value={Math.round(layer.y)}
                                    onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                                    className="w-full pl-5 pr-1.5 py-1.5 text-xs font-mono bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-accent/20 focus:border-premium-accent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Dimensions</span>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-white/30">W</span>
                                <input
                                    type="number"
                                    value={Math.round(layer.width)}
                                    onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
                                    className="w-full pl-5 pr-1.5 py-1.5 text-xs font-mono bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-accent/20 focus:border-premium-accent transition-all"
                                />
                            </div>
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-white/30">H</span>
                                <input
                                    type="number"
                                    value={Math.round(layer.height)}
                                    onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                                    className="w-full pl-5 pr-1.5 py-1.5 text-xs font-mono bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-accent/20 focus:border-premium-accent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alignment Tools - Figma Style */}
                <div className="pt-4 border-t border-white/5 mt-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase block mb-3 tracking-tighter">Align</span>
                    <div className="flex gap-1">
                        {/* Align Left */}
                        <button
                            onClick={() => handleUpdate({ x: 0 })}
                            className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Align Left"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="7" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        {/* Align Center H */}
                        <button
                            onClick={() => handleUpdate({ x: (414 - layer.width) / 2 })}
                            className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Align Center Horizontal"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="11" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                <rect x="5" y="7" width="14" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="7" y="13" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        {/* Align Right */}
                        <button
                            onClick={() => handleUpdate({ x: 414 - layer.width })}
                            className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Align Right"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="19" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="11" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        {/* Align Top */}
                        <button
                            onClick={() => handleUpdate({ y: 0 })}
                            className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Align Top"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="3" width="16" height="2" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="13" y="7" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        {/* Align Center V */}
                        <button
                            onClick={() => handleUpdate({ y: (896 - layer.height) / 2 })}
                            className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Align Center Vertical"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="11" width="16" height="2" rx="0.5" fill="currentColor" />
                                <rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="13" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        {/* Align Bottom */}
                        <button
                            onClick={() => handleUpdate({ y: 896 - layer.height })}
                            className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            title="Align Bottom"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="19" width="16" height="2" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="13" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Depth Control */}
                <div className="pt-4 border-t border-white/5">
                    <span className="text-[9px] font-bold text-white/30 uppercase block mb-3 tracking-tighter">Depth Control</span>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => handleUpdate({ zIndex: 100 })}
                            className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-premium-accent hover:border-premium-accent/50 hover:bg-premium-accent/10 transition-all active:scale-90"
                            title="Bring to Front"
                        >
                            <ChevronsUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleUpdate({ zIndex: Math.min(100, (layer.zIndex || 0) + 1) })}
                            className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-premium-accent hover:border-premium-accent/50 hover:bg-premium-accent/10 transition-all active:scale-90"
                            title="Move Up"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleUpdate({ zIndex: Math.max(0, (layer.zIndex || 0) - 1) })}
                            className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-premium-accent hover:border-premium-accent/50 hover:bg-premium-accent/10 transition-all active:scale-90"
                            title="Move Down"
                        >
                            <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleUpdate({ zIndex: 0 })}
                            className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-premium-accent hover:border-premium-accent/50 hover:bg-premium-accent/10 transition-all active:scale-90"
                            title="Send to Back"
                        >
                            <ChevronsDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Rotation */}
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Rotation</label>
                                <span className="text-xs text-white/60">{layer.rotation}°</span>
                            </div>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={layer.rotation}
                                onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
                                className="w-full accent-premium-accent opacity-50 hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <button
                            onClick={() => handleUpdate({ rotation: 0 })}
                            className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                        >
                            <RotateCw className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </section>

            <div className="h-[1px] bg-white/10" />

            {/* Animation Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Animations</h4>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Entrance Effect</label>
                        <select
                            value={layer.animation?.entrance || 'none'}
                            onChange={(e) => handleUpdate({ animation: { ...layer.animation, entrance: e.target.value } })}
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                        >
                            <option value="none" className="bg-premium-dark text-white">None</option>
                            <option value="fade" className="bg-premium-dark text-white">Fade In</option>
                            <option value="scale" className="bg-premium-dark text-white">Scale Up</option>
                            <option value="slide-up" className="bg-premium-dark text-white">Slide Up</option>
                            <option value="blur" className="bg-premium-dark text-white">Blur In</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Looping Effect (Smooth)</label>
                        <select
                            value={typeof layer.animation?.looping === 'string' ? layer.animation.looping : (layer.animation?.looping ? 'glow' : 'none')}
                            onChange={(e) => handleUpdate({ animation: { ...layer.animation, looping: e.target.value } })}
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                        >
                            <option value="none" className="bg-premium-dark text-white">None</option>
                            <option value="float" className="bg-premium-dark text-white">Float (Floating)</option>
                            <option value="breath" className="bg-premium-dark text-white">Breath (Pulse)</option>
                            <option value="wiggle" className="bg-premium-dark text-white">Wiggle (Organic)</option>
                            <option value="glow" className="bg-premium-dark text-white">Glow (Pulsing)</option>
                        </select>
                    </div>
                </div>
            </section>

            <div className="h-[1px] bg-white/10" />

            {/* Open Invitation Config Section */}
            {layer.type === 'open_invitation_button' && layer.openInvitationConfig && (
                <>
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-white/60 mb-2">
                            <MailOpen className="w-4 h-4" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Button Config</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold">Button Text</label>
                                <input
                                    type="text"
                                    value={layer.openInvitationConfig.buttonText}
                                    onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, buttonText: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold">Sub Text</label>
                                <input
                                    type="text"
                                    value={layer.openInvitationConfig.subText || ''}
                                    onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, subText: e.target.value } })}
                                    placeholder="Optional subtext"
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Style</label>
                                    <select
                                        value={layer.openInvitationConfig.buttonStyle}
                                        onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, buttonStyle: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                                    >
                                        <option value="elegant" className="bg-premium-dark text-white">Elegant</option>
                                        <option value="modern" className="bg-premium-dark text-white">Modern</option>
                                        <option value="glass" className="bg-premium-dark text-white">Glass</option>
                                        <option value="minimal" className="bg-premium-dark text-white">Minimal</option>
                                        <option value="luxury" className="bg-premium-dark text-white">Luxury</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Shape</label>
                                    <select
                                        value={layer.openInvitationConfig.buttonShape}
                                        onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, buttonShape: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                                    >
                                        <option value="pill" className="bg-premium-dark text-white">Pill</option>
                                        <option value="rounded" className="bg-premium-dark text-white">Rounded</option>
                                        <option value="rectangle" className="bg-premium-dark text-white">Rectangle</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Button Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={/^#[0-9A-F]{6}$/i.test(layer.openInvitationConfig.buttonColor) ? layer.openInvitationConfig.buttonColor : '#000000'}
                                            onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, buttonColor: e.target.value } })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <input
                                            type="text"
                                            value={layer.openInvitationConfig.buttonColor}
                                            onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, buttonColor: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs focus:border-premium-accent/50 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Text Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={/^#[0-9A-F]{6}$/i.test(layer.openInvitationConfig.textColor) ? layer.openInvitationConfig.textColor : '#ffffff'}
                                            onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, textColor: e.target.value } })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <input
                                            type="text"
                                            value={layer.openInvitationConfig.textColor}
                                            onChange={(e) => handleUpdate({ openInvitationConfig: { ...layer.openInvitationConfig, textColor: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs focus:border-premium-accent/50 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="h-[1px] bg-white/10" />
                </>
            )}

            {/* Countdown Config */}
            {layer.type === 'countdown' && layer.countdownConfig && (
                <>
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-white/60 mb-2">
                            <Clock className="w-4 h-4" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Countdown Config</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold">Target Date</label>
                                <input
                                    type="datetime-local"
                                    value={layer.countdownConfig.targetDate ? new Date(layer.countdownConfig.targetDate).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => handleUpdate({ countdownConfig: { ...layer.countdownConfig, targetDate: new Date(e.target.value).toISOString() } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Style</label>
                                    <select
                                        value={layer.countdownConfig.style}
                                        onChange={(e) => handleUpdate({ countdownConfig: { ...layer.countdownConfig, style: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
                                    >
                                        <option value="classic" className="bg-premium-dark text-white">Classic</option>
                                        <option value="minimal" className="bg-premium-dark text-white">Minimal</option>
                                        <option value="elegant" className="bg-premium-dark text-white">Elegant</option>
                                        <option value="flip" className="bg-premium-dark text-white">Flip</option>
                                        <option value="card" className="bg-premium-dark text-white">Card</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Text Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={/^#[0-9A-F]{6}$/i.test(layer.countdownConfig.textColor) ? layer.countdownConfig.textColor : '#ffffff'}
                                            onChange={(e) => handleUpdate({ countdownConfig: { ...layer.countdownConfig, textColor: e.target.value } })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="h-[1px] bg-white/10" />
                </>
            )}

            {/* Maps Config */}
            {layer.type === 'maps_point' && layer.mapsConfig && (
                <>
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-white/60 mb-2">
                            <MapPin className="w-4 h-4" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Maps Config</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold">Display Name</label>
                                <input
                                    type="text"
                                    value={layer.mapsConfig.displayName}
                                    onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig, displayName: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold">Google Maps URL</label>
                                <input
                                    type="text"
                                    value={layer.mapsConfig.googleMapsUrl}
                                    onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig, googleMapsUrl: e.target.value } })}
                                    placeholder="https://maps.google.com/..."
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Pin Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={/^#[0-9A-F]{6}$/i.test(layer.mapsConfig.pinColor) ? layer.mapsConfig.pinColor : '#EF4444'}
                                            onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig, pinColor: e.target.value } })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-white/30 uppercase font-bold">Button Text</label>
                                    <input
                                        type="text"
                                        value={layer.mapsConfig.buttonText}
                                        onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig, buttonText: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs focus:border-premium-accent/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="h-[1px] bg-white/10" />
                </>
            )}

            {/* Visual Effects Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Palette className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Visual Effects</h4>
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] text-white/30 uppercase font-bold">Opacity</label>
                            <span className="text-xs text-white/60">{Math.round((layer.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={layer.opacity ?? 1}
                            onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
                            className="w-full accent-premium-accent opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] text-white/30 uppercase font-bold">Blur</label>
                            <span className="text-xs text-white/60">{layer.filters?.blur || 0}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={layer.filters?.blur || 0}
                            onChange={(e) => handleUpdate({ filters: { ...layer.filters, blur: Number(e.target.value) } })}
                            className="w-full accent-premium-accent opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </section>

            <div className="h-[1px] bg-white/10" />

            {/* Permissions Section (Admin Only) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Shield className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Permissions</h4>
                </div>

                <div className="space-y-4">
                    {/* Can Edit Position */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-white/5 rounded-md border border-white/5 text-white/40">
                                <Move className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="text-xs text-white/80 block">Moveable</span>
                                <span className="text-[10px] text-white/40 block">User can drag position</span>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={layer.canEditPosition || false}
                            onChange={(e) => handleUpdate({ canEditPosition: e.target.checked })}
                            className="w-4 h-4 accent-premium-accent bg-white/5 border-white/10 rounded cursor-pointer"
                        />
                    </div>

                    {/* Can Edit Content */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-white/5 rounded-md border border-white/5 text-white/40">
                                <Edit3 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="text-xs text-white/80 block">Editable</span>
                                <span className="text-[10px] text-white/40 block">User can edit content</span>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={layer.canEditContent || false}
                            onChange={(e) => handleUpdate({ canEditContent: e.target.checked })}
                            className="w-4 h-4 accent-premium-accent bg-white/5 border-white/10 rounded cursor-pointer"
                        />
                    </div>

                    {/* Text Specific Permissions */}
                    {layer.type === 'text' && (
                        <>
                            <div className="h-[1px] bg-white/5" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-white/5 rounded-md border border-white/5 text-white/40">
                                        <Shield className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-white/80 block">Protected</span>
                                        <span className="text-[10px] text-white/40 block">Disable copy/select</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={layer.isContentProtected || false}
                                    onChange={(e) => handleUpdate({ isContentProtected: e.target.checked })}
                                    className="w-4 h-4 accent-premium-accent bg-white/5 border-white/10 rounded cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-white/5 rounded-md border border-white/5 text-white/40">
                                        <Copy className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-white/80 block">Copy Button</span>
                                        <span className="text-[10px] text-white/40 block">Show copy icon</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={layer.showCopyButton || false}
                                    onChange={(e) => handleUpdate({ showCopyButton: e.target.checked })}
                                    className="w-4 h-4 accent-premium-accent bg-white/5 border-white/10 rounded cursor-pointer"
                                />
                            </div>
                        </>
                    )}
                </div>
            </section>

            <div className="h-[1px] bg-white/10" />

            <button
                onClick={handleRemove}
                className="w-full py-3 rounded-lg bg-red-400/10 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Delete Element
            </button>
        </div>
    );
};
