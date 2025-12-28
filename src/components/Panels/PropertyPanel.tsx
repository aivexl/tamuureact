import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Layer, AnimationType, TextStyle, CountdownConfig, ButtonConfig, ShapeConfig, IconStyle } from '@/store/layersSlice';
import { generateId } from '@/lib/utils';
import {
    AlignLeft, AlignCenter, AlignRight,
    ArrowUpToLine, ArrowDownToLine,
    Bold, Italic, Calendar, Clock,
    ChevronUp, ChevronDown, Copy,
    Eye, EyeOff, FlipHorizontal, FlipVertical,
    FlipHorizontal2, FlipVertical2,
    Heart, ImageIcon, Layout, Layers,
    Lock, Unlock, MailOpen, MapPin,
    Maximize2, MousePointer2, Move, MoveHorizontal,
    Palette, Plane, Settings2, Sliders,
    Sparkles, Square, Star, Trash2,
    Type, Users, Video, Wind, Zap
} from 'lucide-react';
import { ElementToolbar } from '@/components/Layout/ElementToolbar';

export const PropertyPanel: React.FC = () => {
    const {
        // Global/Legacy layers (optional, kept for safety)
        layers,
        selectedLayerId,
        selectLayer,

        // Section Actions
        activeSectionId,
        sections,
        updateSection,
        updateElementInSection,
        removeElementFromSection,
        duplicateSection, // needed? maybe duplicateElementInSection if it existed

        // UI Actions
        bringToFront, // This needs to be section-aware too, but let's stick to basic update first
        sendToBack,

        pathEditingId,
        setPathEditingId
    } = useStore();

    // 1. Find the Active Section
    const activeSection = sections.find(s => s.id === activeSectionId);

    // 2. Find the Layer: Check active section elements first (Primary), then global layers (Legacy/Fallback)
    // We prioritize the layer in the active section if 'selectedLayerId' matches one there.
    const sectionLayer = activeSection?.elements.find(l => l.id === selectedLayerId);
    const globalLayer = layers.find(l => l.id === selectedLayerId);

    const layer = sectionLayer || globalLayer;

    // 3. Handle Updates: Redirect to correct store action
    const handleUpdate = (updates: Partial<Layer>) => {
        if (sectionLayer && activeSectionId) {
            updateElementInSection(activeSectionId, layer!.id, updates);
        } else if (globalLayer) {
            // Fallback for global layers
            useStore.getState().updateLayer(layer!.id, updates);
        }
    };

    // 4. Handle Alignment Updates: Deselect then reselect to force Moveable remount
    // This fixes the selection handles staying in old position after alignment
    const handleAlignmentUpdate = (updates: Partial<Layer>) => {
        const layerId = layer!.id;

        // First deselect
        selectLayer(null);

        // Update position
        if (sectionLayer && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, updates);
        } else if (globalLayer) {
            useStore.getState().updateLayer(layerId, updates);
        }

        // Reselect after a brief delay to allow position update to propagate
        setTimeout(() => {
            selectLayer(layerId);
        }, 50);
    };

    const handleRemove = () => {
        if (sectionLayer && activeSectionId) {
            removeElementFromSection(activeSectionId, layer!.id);
            selectLayer(null); // Deselect after removal
        } else if (globalLayer) {
            useStore.getState().removeLayer(layer!.id);
            selectLayer(null);
        }
    };

    const handleDuplicate = () => {
        if (sectionLayer && activeSectionId) {
            // We need to implement duplicateElementInSection manually or add it to store
            // For now, let's manually create a copy
            const newLayer = {
                ...sectionLayer,
                id: generateId('layer'),
                name: `${sectionLayer.name} (Copy)`,
                x: sectionLayer.x + 20,
                y: sectionLayer.y + 20
            };
            useStore.getState().addElementToSection(activeSectionId, newLayer);
            selectLayer(newLayer.id);
        } else if (globalLayer) {
            useStore.getState().duplicateLayer(layer!.id);
        }
    };

    // Check if we have a layer to show
    if (!layer) {
        if (!activeSection) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-white/20 p-8 text-center">
                    <Layers className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm">Select an element or section to customize</p>
                </div>
            );
        }

        // Section settings when no layer is selected
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/10 shrink-0">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-premium-accent">Section Settings</h3>
                    <p className="text-[10px] text-white/40 font-mono">{activeSection.title}</p>
                </div>
                <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-6">



                    {/* Element Toolbar */}
                    <ElementToolbar embedded />

                    {/* Zoom Effect Settings */}
                    <SectionComponent title="Zoom Effect" icon={<Maximize2 className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/70 font-medium">Enable Zoom Engine</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateSection(activeSection.id, {
                                        zoomConfig: {
                                            enabled: !activeSection.zoomConfig?.enabled,
                                            direction: 'in',
                                            trigger: 'scroll',
                                            behavior: 'stay',
                                            scale: 2,
                                            duration: 3000,
                                            transitionDuration: 1000,
                                            loop: false,
                                            points: activeSection.zoomConfig?.points || []
                                        }
                                    })}
                                    className={`w-10 h-5 rounded-full transition-colors ${activeSection.zoomConfig?.enabled ? 'bg-premium-accent' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: activeSection.zoomConfig?.enabled ? 22 : 2 }}
                                    />
                                </motion.button>
                            </div>

                            {activeSection.zoomConfig?.enabled && (
                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <SelectInput
                                        label="Direction"
                                        value={activeSection.zoomConfig.direction}
                                        options={[
                                            { value: 'in', label: 'Zoom In' },
                                            { value: 'out', label: 'Zoom Out' }
                                        ]}
                                        onChange={(v) => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, direction: v as any } })}
                                    />
                                    <SelectInput
                                        label="Trigger"
                                        value={activeSection.zoomConfig.trigger}
                                        options={[
                                            { value: 'scroll', label: 'On Scroll' },
                                            { value: 'click', label: 'On Click' },
                                            { value: 'open_btn', label: 'On Invitation Open' }
                                        ]}
                                        onChange={(v) => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, trigger: v as any } })}
                                    />
                                    <SelectInput
                                        label="After Zoom"
                                        value={activeSection.zoomConfig.behavior}
                                        options={[
                                            { value: 'stay', label: 'Stay Zoomed' },
                                            { value: 'reset', label: 'Reset back to 1x' }
                                        ]}
                                        onChange={(v) => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, behavior: v as any } })}
                                    />
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] text-white/30 uppercase font-bold">Zoom Scale</span>
                                            <span className="text-xs text-white/60">{activeSection.zoomConfig.scale}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            step="0.1"
                                            value={activeSection.zoomConfig.scale}
                                            onChange={(e) => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, scale: Number(e.target.value) } })}
                                            className="w-full accent-premium-accent"
                                        />
                                    </div>
                                    <NumberInput
                                        label="Zoom Duration (ms)"
                                        value={activeSection.zoomConfig.duration}
                                        onChange={(v) => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, duration: v } })}
                                    />
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-[9px] text-white/30 uppercase font-bold">Cinematic Points</label>
                                            <button
                                                onClick={() => {
                                                    const newPoints = [...(activeSection.zoomConfig?.points || [])];
                                                    newPoints.push({
                                                        id: generateId('zp'),
                                                        label: `Point ${newPoints.length + 1}`,
                                                        duration: 2000,
                                                        targetRegion: { x: 50, y: 50, width: 200, height: 200 }
                                                    });
                                                    // Auto-select the newly added point so it appears on canvas immediately
                                                    updateSection(activeSection.id, {
                                                        zoomConfig: {
                                                            ...activeSection.zoomConfig!,
                                                            points: newPoints,
                                                            selectedPointIndex: newPoints.length - 1
                                                        }
                                                    });
                                                }}
                                                className="text-[9px] bg-premium-accent/10 hover:bg-premium-accent/20 text-premium-accent px-2 py-0.5 rounded transition-colors"
                                            >
                                                + ADD POINT
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {activeSection.zoomConfig.points.map((p, idx) => {
                                                const ZOOM_POINT_COLORS = ['#bfa181', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                                                const pointColor = p.color || ZOOM_POINT_COLORS[idx % ZOOM_POINT_COLORS.length];

                                                return (
                                                    <div key={p.id} className={`p-2 rounded border border-white/5 bg-white/5 group/zp ${activeSection.zoomConfig?.selectedPointIndex === idx ? 'ring-1 ring-premium-accent' : ''}`}>
                                                        <div className="flex items-center justify-between">
                                                            {/* Color Picker */}
                                                            <div className="relative mr-2">
                                                                <input
                                                                    type="color"
                                                                    value={pointColor}
                                                                    onChange={(e) => {
                                                                        if (!activeSection.zoomConfig) return;
                                                                        const newPoints = [...activeSection.zoomConfig.points];
                                                                        newPoints[idx] = { ...p, color: e.target.value };
                                                                        updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                    }}
                                                                    className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                                                                    style={{ backgroundColor: pointColor }}
                                                                />
                                                            </div>
                                                            {/* Label Input */}
                                                            <div className="flex-1 min-w-0 pr-2">
                                                                <input
                                                                    type="text"
                                                                    value={p.label}
                                                                    onChange={(e) => {
                                                                        if (!activeSection.zoomConfig) return;
                                                                        const newPoints = [...activeSection.zoomConfig.points];
                                                                        newPoints[idx] = { ...p, label: e.target.value };
                                                                        updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                    }}
                                                                    className="bg-transparent border-none p-0 text-[11px] text-white/80 focus:ring-0 w-full truncate"
                                                                />
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => activeSection.zoomConfig && updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, selectedPointIndex: idx } })}
                                                                    className={`p-1 hover:bg-white/10 rounded ${activeSection.zoomConfig?.selectedPointIndex === idx ? 'text-premium-accent' : 'text-white/30'}`}
                                                                    title="Select to edit on canvas"
                                                                >
                                                                    <Settings2 className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (!activeSection.zoomConfig) return;
                                                                        const newPoints = activeSection.zoomConfig.points.filter((_, i) => i !== idx);
                                                                        updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                    }}
                                                                    className="p-1 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded"
                                                                    title="Delete point"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {activeSection.zoomConfig.points.length === 0 && (
                                                <div className="text-[10px] text-white/20 text-center py-4 border border-dashed border-white/5 rounded">
                                                    No zoom points defined
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionComponent>
                </div >
            </div >
        );
    }

    // REMOVED: Redundant handleUpdate function wrapper - used the one defined above

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold capitalize">{layer.type.replace('_', ' ')}</h3>
                        <p className="text-[10px] text-white/40 font-mono">{layer.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUpdate({ isLocked: !layer.isLocked })}
                            className={`p-2 rounded-lg ${layer.isLocked ? 'text-premium-accent bg-premium-accent/10' : 'text-white/40 hover:bg-white/5'}`}
                        >
                            {layer.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDuplicate}
                            className="p-2 rounded-lg text-white/40 hover:bg-white/5"
                        >
                            <Copy className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRemove}
                            className="p-2 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400"
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-6">
                {/* Transform Section */}
                <SectionComponent title="Transform" icon={<Move className="w-4 h-4" />}>
                    {/* Alignment Tools - Figma Style */}
                    <div className="grid grid-cols-6 gap-1 mb-4 p-1 bg-white/5 rounded-lg border border-white/5">
                        <button onClick={() => handleAlignmentUpdate({ x: 0 })} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Left">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="7" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        <button onClick={() => handleAlignmentUpdate({ x: (414 - (layer.width || 0)) / 2 })} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="11" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                <rect x="5" y="7" width="14" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="7" y="13" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        <button onClick={() => handleAlignmentUpdate({ x: 414 - (layer.width || 0) })} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Right">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="19" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="11" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        <button onClick={() => handleAlignmentUpdate({ y: 0 })} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Top">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="3" width="16" height="2" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="13" y="7" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        <button onClick={() => handleAlignmentUpdate({ y: (896 - (layer.height || 0)) / 2 })} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Middle">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="11" width="16" height="2" rx="0.5" fill="currentColor" />
                                <rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="13" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        <button onClick={() => handleAlignmentUpdate({ y: 896 - (layer.height || 0) })} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Bottom">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="19" width="16" height="2" rx="0.5" fill="currentColor" />
                                <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                <rect x="13" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <NumberInput label="X" value={layer.x} onChange={(v) => handleUpdate({ x: v })} />
                        <NumberInput label="Y" value={layer.y} onChange={(v) => handleUpdate({ y: v })} />
                        <NumberInput label="Width" value={layer.width} onChange={(v) => handleUpdate({ width: v })} />
                        <NumberInput label="Height" value={layer.height} onChange={(v) => handleUpdate({ height: v })} />
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] text-white/30 uppercase font-bold">Rotation</span>
                            <span className="text-xs text-white/60">{layer.rotation || 0}°</span>
                        </div>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={layer.rotation || 0}
                            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
                            className="w-full accent-premium-accent"
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdate({ flipHorizontal: !layer.flipHorizontal })}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${layer.flipHorizontal ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'
                                }`}
                        >
                            <FlipHorizontal2 className="w-4 h-4" />
                            Flip H
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdate({ flipVertical: !layer.flipVertical })}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${layer.flipVertical ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'
                                }`}
                        >
                            <FlipVertical2 className="w-4 h-4" />
                            Flip V
                        </motion.button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] text-white/30 uppercase font-bold">Mouse Parallax (3D Depth)</span>
                            <span className="text-xs text-premium-accent font-mono">{layer.parallaxFactor || 0}</span>
                        </div>
                        <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.1"
                            value={layer.parallaxFactor || 0}
                            onChange={(e) => handleUpdate({ parallaxFactor: Number(e.target.value) })}
                            className="w-full accent-premium-accent"
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-[8px] text-white/20 uppercase">Reverse</span>
                            <span className="text-[8px] text-white/20 uppercase">None</span>
                            <span className="text-[8px] text-white/20 uppercase">Follow</span>
                        </div>
                    </div>
                </SectionComponent>

                {/* Image/GIF Config - Only for image and gif elements */}
                {(layer.type === 'image' || layer.type === 'gif' || layer.type === 'sticker') && (
                    <SectionComponent title="Image Settings" icon={<Palette className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Image URL</label>
                                <input
                                    type="text"
                                    value={layer.imageUrl || ''}
                                    onChange={(e) => handleUpdate({ imageUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="text-[10px] text-white/30 text-center">
                                Paste an image URL or drag and drop an image onto the canvas
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Video Config - Only for video elements */}
                {layer.type === 'video' && (
                    <SectionComponent title="Video Settings" icon={<Video className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Video URL</label>
                                <input
                                    type="text"
                                    value={layer.videoUrl || ''}
                                    onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    placeholder="https://example.com/video.mp4"
                                />
                            </div>
                            <div className="text-[10px] text-white/30 text-center">
                                Supported formats: MP4, WebM
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Text Style Section - Only for text elements */}
                {
                    layer.type === 'text' && (
                        <SectionComponent title="Text Style" icon={<Type className="w-4 h-4" />}>
                            <div className="space-y-4">
                                {/* Content */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Content</label>
                                    <textarea
                                        value={layer.content || ''}
                                        onChange={(e) => handleUpdate({ content: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none resize-none h-20"
                                        placeholder="Enter text..."
                                    />
                                </div>

                                {/* Font Family */}
                                <SelectInput
                                    label="Font Family"
                                    value={layer.textStyle?.fontFamily || 'Outfit'}
                                    options={[
                                        { value: 'Outfit', label: 'Outfit' },
                                        { value: 'Inter', label: 'Inter' },
                                        { value: 'Playfair Display', label: 'Playfair Display' },
                                        { value: 'Montserrat', label: 'Montserrat' },
                                        { value: 'Lora', label: 'Lora' },
                                        { value: 'Dancing Script', label: 'Dancing Script' },
                                        { value: 'Great Vibes', label: 'Great Vibes' }
                                    ]}
                                    onChange={(v) => handleUpdate({ textStyle: { ...layer.textStyle!, fontFamily: v } })}
                                />

                                {/* Font Size */}
                                <NumberInput
                                    label="Font Size"
                                    value={layer.textStyle?.fontSize || 24}
                                    onChange={(v) => handleUpdate({ textStyle: { ...layer.textStyle!, fontSize: v } })}
                                />

                                {/* Font Weight & Style */}
                                <div className="flex gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({
                                            textStyle: {
                                                ...layer.textStyle!,
                                                fontWeight: layer.textStyle?.fontWeight === 'bold' ? 'normal' : 'bold'
                                            }
                                        })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${layer.textStyle?.fontWeight === 'bold' ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'
                                            }`}
                                    >
                                        <Bold className="w-4 h-4" />
                                        Bold
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({
                                            textStyle: {
                                                ...layer.textStyle!,
                                                fontStyle: layer.textStyle?.fontStyle === 'italic' ? 'normal' : 'italic'
                                            }
                                        })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${layer.textStyle?.fontStyle === 'italic' ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'
                                            }`}
                                    >
                                        <Italic className="w-4 h-4" />
                                        Italic
                                    </motion.button>
                                </div>

                                {/* Text Align */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Alignment</label>
                                    <div className="flex gap-2">
                                        {(['left', 'center', 'right'] as const).map((align) => (
                                            <motion.button
                                                key={align}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleUpdate({ textStyle: { ...layer.textStyle!, textAlign: align } })}
                                                className={`flex-1 py-2 rounded-lg flex items-center justify-center ${layer.textStyle?.textAlign === align ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'
                                                    }`}
                                            >
                                                {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                                {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                                {align === 'right' && <AlignRight className="w-4 h-4" />}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Color */}
                                <ColorInput
                                    label="Color"
                                    value={layer.textStyle?.color || '#ffffff'}
                                    onChange={(v) => handleUpdate({ textStyle: { ...layer.textStyle!, color: v } })}
                                />
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Countdown Config - Only for countdown elements */}
                {
                    layer.type === 'countdown' && (
                        <SectionComponent title="Countdown Settings" icon={<Clock className="w-4 h-4" />}>
                            <div className="space-y-4">
                                {/* Target Date */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Target Date</label>
                                    <input
                                        type="datetime-local"
                                        value={layer.countdownConfig?.targetDate?.slice(0, 16) || ''}
                                        onChange={(e) => handleUpdate({
                                            countdownConfig: {
                                                ...layer.countdownConfig!,
                                                targetDate: new Date(e.target.value).toISOString()
                                            }
                                        })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    />
                                </div>

                                {/* Style */}
                                <SelectInput
                                    label="Style"
                                    value={layer.countdownConfig?.style || 'elegant'}
                                    options={[
                                        { value: 'classic', label: 'Classic' },
                                        { value: 'minimal', label: 'Minimal' },
                                        { value: 'elegant', label: 'Elegant' },
                                        { value: 'flip', label: 'Flip' },
                                        { value: 'card', label: 'Card' }
                                    ]}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, style: v as any } })}
                                />

                                {/* Show/Hide Units */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Show Units</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['showDays', 'showHours', 'showMinutes', 'showSeconds'] as const).map((key) => (
                                            <motion.button
                                                key={key}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleUpdate({
                                                    countdownConfig: {
                                                        ...layer.countdownConfig!,
                                                        [key]: !layer.countdownConfig?.[key]
                                                    }
                                                })}
                                                className={`py-2 rounded-lg text-xs font-medium ${layer.countdownConfig?.[key] !== false ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'
                                                    }`}
                                            >
                                                {key.replace('show', '')}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <ColorInput
                                    label="Text Color"
                                    value={layer.countdownConfig?.textColor || '#ffffff'}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, textColor: v } })}
                                />
                                <ColorInput
                                    label="Accent Color"
                                    value={layer.countdownConfig?.accentColor || '#bfa181'}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, accentColor: v } })}
                                />
                                <ColorInput
                                    label="Label Color"
                                    value={layer.countdownConfig?.labelColor || '#888888'}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, labelColor: v } })}
                                />
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Button Config - Only for button elements */}
                {
                    layer.type === 'button' && (
                        <SectionComponent title="Button Settings" icon={<Calendar className="w-4 h-4" />}>
                            <div className="space-y-4">
                                {/* Button Text */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Button Text</label>
                                    <input
                                        type="text"
                                        value={layer.buttonConfig?.buttonText || 'Buka Undangan'}
                                        onChange={(e) => handleUpdate({ buttonConfig: { ...layer.buttonConfig!, buttonText: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    />
                                </div>

                                {/* Button Shape */}
                                <SelectInput
                                    label="Shape"
                                    value={layer.buttonConfig?.buttonShape || 'pill'}
                                    options={[
                                        { value: 'pill', label: 'Pill' },
                                        { value: 'rounded', label: 'Rounded' },
                                        { value: 'rectangle', label: 'Rectangle' }
                                    ]}
                                    onChange={(v) => handleUpdate({ buttonConfig: { ...layer.buttonConfig!, buttonShape: v as any } })}
                                />

                                {/* Button Style */}
                                <SelectInput
                                    label="Style"
                                    value={layer.buttonConfig?.buttonStyle || 'elegant'}
                                    options={[
                                        { value: 'elegant', label: 'Elegant' },
                                        { value: 'modern', label: 'Modern' },
                                        { value: 'glass', label: 'Glass' },
                                        { value: 'neon', label: 'Neon' }
                                    ]}
                                    onChange={(v) => handleUpdate({ buttonConfig: { ...layer.buttonConfig!, buttonStyle: v as any } })}
                                />

                                {/* Colors */}
                                <ColorInput
                                    label="Button Color"
                                    value={layer.buttonConfig?.buttonColor || '#bfa181'}
                                    onChange={(v) => handleUpdate({ buttonConfig: { ...layer.buttonConfig!, buttonColor: v } })}
                                />
                                <ColorInput
                                    label="Text Color"
                                    value={layer.buttonConfig?.textColor || '#0a0a0a'}
                                    onChange={(v) => handleUpdate({ buttonConfig: { ...layer.buttonConfig!, textColor: v } })}
                                />

                                {/* Show Icon Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/30 uppercase font-bold">Show Icon</span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({ buttonConfig: { ...layer.buttonConfig!, showIcon: !layer.buttonConfig?.showIcon } })}
                                        className={`w-12 h-6 rounded-full transition-colors ${layer.buttonConfig?.showIcon !== false ? 'bg-premium-accent' : 'bg-white/10'
                                            }`}
                                    >
                                        <motion.div
                                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                                            animate={{ x: layer.buttonConfig?.showIcon !== false ? 26 : 2 }}
                                        />
                                    </motion.button>
                                </div>
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Icon Config - Only for icon elements */}
                {
                    layer.type === 'icon' && (
                        <SectionComponent title="Icon Settings" icon={<Palette className="w-4 h-4" />}>
                            <div className="space-y-4">
                                <SelectInput
                                    label="Icon"
                                    value={layer.iconStyle?.iconName || 'heart'}
                                    options={[
                                        { value: 'heart', label: 'Heart' },
                                        { value: 'star', label: 'Star' },
                                        { value: 'mail', label: 'Mail' },
                                        { value: 'calendar', label: 'Calendar' },
                                        { value: 'clock', label: 'Clock' },
                                        { value: 'map-pin', label: 'Map Pin' },
                                        { value: 'music', label: 'Music' },
                                        { value: 'camera', label: 'Camera' },
                                        { value: 'gift', label: 'Gift' },
                                        { value: 'flower-2', label: 'Flower' }
                                    ]}
                                    onChange={(v) => handleUpdate({ iconStyle: { ...layer.iconStyle!, iconName: v } })}
                                />
                                <NumberInput
                                    label="Size"
                                    value={layer.iconStyle?.iconSize || 48}
                                    onChange={(v) => handleUpdate({ iconStyle: { ...layer.iconStyle!, iconSize: v } })}
                                />
                                <ColorInput
                                    label="Color"
                                    value={layer.iconStyle?.iconColor || '#bfa181'}
                                    onChange={(v) => handleUpdate({ iconStyle: { ...layer.iconStyle!, iconColor: v } })}
                                />
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Shape Config - Only for shape elements */}
                {
                    layer.type === 'shape' && (
                        <SectionComponent title="Shape Settings" icon={<Palette className="w-4 h-4" />}>
                            <div className="space-y-4">
                                <SelectInput
                                    label="Shape Type"
                                    value={layer.shapeConfig?.shapeType || 'rectangle'}
                                    options={[
                                        { value: 'rectangle', label: 'Rectangle' },
                                        { value: 'circle', label: 'Circle' },
                                        { value: 'triangle', label: 'Triangle' },
                                        { value: 'diamond', label: 'Diamond' },
                                        { value: 'heart', label: 'Heart' },
                                        { value: 'star', label: 'Star' }
                                    ]}
                                    onChange={(v) => handleUpdate({ shapeConfig: { ...layer.shapeConfig!, shapeType: v as any } })}
                                />
                                <ColorInput
                                    label="Fill Color"
                                    value={layer.shapeConfig?.fill || '#bfa181'}
                                    onChange={(v) => handleUpdate({ shapeConfig: { ...layer.shapeConfig!, fill: v } })}
                                />
                                <ColorInput
                                    label="Stroke Color"
                                    value={layer.shapeConfig?.stroke || 'transparent'}
                                    onChange={(v) => handleUpdate({ shapeConfig: { ...layer.shapeConfig!, stroke: v === 'transparent' ? null : v } })}
                                />
                                <NumberInput
                                    label="Stroke Width"
                                    value={layer.shapeConfig?.strokeWidth || 0}
                                    onChange={(v) => handleUpdate({ shapeConfig: { ...layer.shapeConfig!, strokeWidth: v } })}
                                />
                                {layer.shapeConfig?.shapeType === 'rectangle' && (
                                    <NumberInput
                                        label="Corner Radius"
                                        value={layer.shapeConfig?.cornerRadius || 0}
                                        onChange={(v) => handleUpdate({ shapeConfig: { ...layer.shapeConfig!, cornerRadius: v } })}
                                    />
                                )}
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Maps Config - Only for maps_point elements */}
                {
                    layer.type === 'maps_point' && (
                        <SectionComponent title="Maps Settings" icon={<Palette className="w-4 h-4" />}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Display Name</label>
                                    <input
                                        type="text"
                                        value={layer.mapsConfig?.displayName || 'Location'}
                                        onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig!, displayName: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Google Maps URL</label>
                                    <input
                                        type="text"
                                        value={layer.mapsConfig?.googleMapsUrl || ''}
                                        onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig!, googleMapsUrl: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>
                                <ColorInput
                                    label="Pin Color"
                                    value={layer.mapsConfig?.pinColor || '#EF4444'}
                                    onChange={(v) => handleUpdate({ mapsConfig: { ...layer.mapsConfig!, pinColor: v } })}
                                />
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Button Text</label>
                                    <input
                                        type="text"
                                        value={layer.mapsConfig?.buttonText || 'View Map'}
                                        onChange={(e) => handleUpdate({ mapsConfig: { ...layer.mapsConfig!, buttonText: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/30 uppercase font-bold">Show Link Button</span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({ mapsConfig: { ...layer.mapsConfig!, showLinkButton: !layer.mapsConfig?.showLinkButton } })}
                                        className={`w-12 h-6 rounded-full transition-colors ${layer.mapsConfig?.showLinkButton !== false ? 'bg-premium-accent' : 'bg-white/10'
                                            }`}
                                    >
                                        <motion.div
                                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                                            animate={{ x: layer.mapsConfig?.showLinkButton !== false ? 26 : 2 }}
                                        />
                                    </motion.button>
                                </div>
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Lottie Config */}
                {layer.type === 'lottie' && (
                    <SectionComponent title="Lottie Animation" icon={<Zap className="w-4 h-4 text-purple-400" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Animation JSON URL</label>
                                <input
                                    type="text"
                                    value={layer.lottieConfig?.url || ''}
                                    onChange={(e) => handleUpdate({ lottieConfig: { ...layer.lottieConfig!, url: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    placeholder="https://lottie.host/..."
                                />
                                <p className="text-[8px] text-white/20 mt-1 italic">Example: LottieFiles.com</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <NumberInput
                                    label="Playback Speed"
                                    value={layer.lottieConfig?.speed || 1}
                                    onChange={(v) => handleUpdate({ lottieConfig: { ...layer.lottieConfig!, speed: v } })}
                                />
                                <SelectInput
                                    label="Direction"
                                    value={layer.lottieConfig?.direction || 'left'}
                                    options={[
                                        { value: 'left', label: 'Original' },
                                        { value: 'right', label: 'Mirrored' }
                                    ]}
                                    onChange={(v) => handleUpdate({ lottieConfig: { ...layer.lottieConfig!, direction: v as any } })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-white/30 uppercase font-bold">Loop Animation</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate({ lottieConfig: { ...layer.lottieConfig!, loop: !layer.lottieConfig?.loop } })}
                                    className={`w-10 h-5 rounded-full transition-colors ${layer.lottieConfig?.loop !== false ? 'bg-purple-500' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: layer.lottieConfig?.loop !== false ? 22 : 2 }}
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Flying Bird Config */}
                {layer.type === 'flying_bird' && (
                    <SectionComponent title="Flying Bird Settings" icon={<Wind className="w-4 h-4 text-blue-400" />}>
                        <div className="space-y-4">
                            <SelectInput
                                label="Direction"
                                value={layer.flyingBirdConfig?.direction || 'left'}
                                options={[
                                    { value: 'left', label: '← Fly Left' },
                                    { value: 'right', label: '→ Fly Right' }
                                ]}
                                onChange={(v) => handleUpdate({ flyingBirdConfig: { ...layer.flyingBirdConfig!, direction: v as any } })}
                            />
                            <ColorInput
                                label="Bird Color"
                                value={layer.flyingBirdConfig?.birdColor || '#1a1a1a'}
                                onChange={(v) => handleUpdate({ flyingBirdConfig: { ...layer.flyingBirdConfig!, birdColor: v } })}
                            />
                            <SelectInput
                                label="Flap Speed"
                                value={String(layer.flyingBirdConfig?.flapSpeed || 0.3)}
                                options={[
                                    { value: '0.15', label: 'Fast (0.15s)' },
                                    { value: '0.3', label: 'Normal (0.3s)' },
                                    { value: '0.5', label: 'Slow (0.5s)' },
                                    { value: '0.8', label: 'Very Slow (0.8s)' }
                                ]}
                                onChange={(v) => handleUpdate({ flyingBirdConfig: { ...layer.flyingBirdConfig!, flapSpeed: Number(v) } })}
                            />
                        </div>
                    </SectionComponent>
                )}

                {/* RSVP Form Config */}
                {layer.type === 'rsvp_form' && (
                    <SectionComponent title="RSVP Form Settings" icon={<Settings2 className="w-4 h-4 text-premium-accent" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Form Title</label>
                                <input
                                    type="text"
                                    value={layer.rsvpFormConfig?.title || 'RSVP Form'}
                                    onChange={(e) => handleUpdate({ rsvpFormConfig: { ...layer.rsvpFormConfig!, title: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-2">Visible Fields</label>
                                {[
                                    { id: 'showNameField', label: 'Name' },
                                    { id: 'showEmailField', label: 'Email' },
                                    { id: 'showPhoneField', label: 'Phone' },
                                    { id: 'showMessageField', label: 'Message' },
                                    { id: 'showAttendanceField', label: 'Attendance' }
                                ].map(field => (
                                    <div key={field.id} className="flex items-center justify-between">
                                        <span className="text-[10px] text-white/70">{field.label}</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate({ rsvpFormConfig: { ...layer.rsvpFormConfig!, [field.id]: !((layer.rsvpFormConfig as any)?.[field.id] !== false) } })}
                                            className={`w-8 h-4 rounded-full transition-colors ${((layer.rsvpFormConfig as any)?.[field.id] !== false) ? 'bg-premium-accent' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                className="w-3 h-3 bg-white rounded-full shadow-sm"
                                                animate={{ x: ((layer.rsvpFormConfig as any)?.[field.id] !== false) ? 18 : 2 }}
                                            />
                                        </motion.button>
                                    </div>
                                ))}
                            </div>
                            <ColorInput
                                label="Submit Button Color"
                                value={layer.rsvpFormConfig?.buttonColor || '#bfa181'}
                                onChange={(v) => handleUpdate({ rsvpFormConfig: { ...layer.rsvpFormConfig!, buttonColor: v } })}
                            />
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Submit Button Text</label>
                                <input
                                    type="text"
                                    value={layer.rsvpFormConfig?.submitButtonText || 'Kirim Ucapan'}
                                    onChange={(e) => handleUpdate({ rsvpFormConfig: { ...layer.rsvpFormConfig!, submitButtonText: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                />
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Guest Wishes Config */}
                {layer.type === 'guest_wishes' && (
                    <SectionComponent title="Guest Wishes Settings" icon={<Users className="w-4 h-4 text-rose-400" />}>
                        <div className="space-y-4">
                            <SelectInput
                                label="Style"
                                value={layer.guestWishesConfig?.style || 'classic'}
                                options={[
                                    { value: 'classic', label: 'Classic' },
                                    { value: 'modern', label: 'Modern' },
                                    { value: 'glass', label: 'Glass' }
                                ]}
                                onChange={(v) => handleUpdate({ guestWishesConfig: { ...layer.guestWishesConfig!, style: v as any } })}
                            />
                            <SelectInput
                                label="Layout"
                                value={layer.guestWishesConfig?.layout || 'list'}
                                options={[
                                    { value: 'list', label: 'List' },
                                    { value: 'grid', label: 'Grid' },
                                    { value: 'masonry', label: 'Masonry' }
                                ]}
                                onChange={(v) => handleUpdate({ guestWishesConfig: { ...layer.guestWishesConfig!, layout: v as any } })}
                            />
                            <NumberInput
                                label="Max Display Count"
                                value={layer.guestWishesConfig?.maxDisplayCount || 20}
                                onChange={(v) => handleUpdate({ guestWishesConfig: { ...layer.guestWishesConfig!, maxDisplayCount: v } })}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-white/30 uppercase font-bold">Show Timestamp</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate({ guestWishesConfig: { ...layer.guestWishesConfig!, showTimestamp: !layer.guestWishesConfig?.showTimestamp } })}
                                    className={`w-8 h-4 rounded-full transition-colors ${layer.guestWishesConfig?.showTimestamp !== false ? 'bg-premium-accent' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        className="w-3 h-3 bg-white rounded-full shadow-sm"
                                        animate={{ x: layer.guestWishesConfig?.showTimestamp !== false ? 18 : 2 }}
                                    />
                                </motion.button>
                            </div>
                            <ColorInput
                                label="Card Background"
                                value={layer.guestWishesConfig?.cardBackgroundColor || '#ffffff'}
                                onChange={(v) => handleUpdate({ guestWishesConfig: { ...layer.guestWishesConfig!, cardBackgroundColor: v } })}
                            />
                            <ColorInput
                                label="Text Color"
                                value={layer.guestWishesConfig?.textColor || '#000000'}
                                onChange={(v) => handleUpdate({ guestWishesConfig: { ...layer.guestWishesConfig!, textColor: v } })}
                            />
                        </div>
                    </SectionComponent>
                )}

                {/* Animation Section */}
                <SectionComponent title="Animation" icon={<Zap className="w-4 h-4" />}>
                    <div className="space-y-3">
                        <SelectInput
                            label="Trigger"
                            value={layer.animation?.trigger || 'scroll'}
                            options={[
                                { value: 'scroll', label: 'On Scroll (Default)' },
                                { value: 'load', label: 'On Load' },
                                { value: 'click', label: 'On Click' },
                                { value: 'open_btn', label: 'With Open Button' }
                            ]}
                            onChange={(v) => handleUpdate({ animation: { ...layer.animation, trigger: v as any } })}
                        />
                        <SelectInput
                            label="Entrance"
                            value={layer.animation?.entrance || 'none'}
                            options={[
                                { value: 'none', label: 'None' },
                                { value: 'fade-in', label: 'Fade In' },
                                { value: 'slide-up', label: 'Slide Up' },
                                { value: 'slide-down', label: 'Slide Down' },
                                { value: 'slide-left', label: 'Slide Left' },
                                { value: 'slide-right', label: 'Slide Right' },
                                { value: 'zoom-in', label: 'Zoom In' },
                                { value: 'bounce', label: 'Bounce' },
                                { value: 'pop-in', label: 'Pop In' },
                                { value: 'blur-in', label: 'Blur In' }
                            ]}
                            onChange={(v) => handleUpdate({ animation: { ...layer.animation, entrance: v as AnimationType } })}
                        />
                        <SelectInput
                            label="Looping"
                            value={layer.animation?.looping || 'none'}
                            options={[
                                { value: 'none', label: 'None' },
                                { value: 'float', label: 'Float' },
                                { value: 'pulse', label: 'Pulse' },
                                { value: 'sway', label: 'Sway' },
                                { value: 'spin', label: 'Spin' },
                                { value: 'glow', label: 'Glow' },
                                { value: 'heartbeat', label: 'Heartbeat' },
                                { value: 'sparkle', label: 'Sparkle' },
                                { value: 'flap-bob', label: '🪶 Kepak + Naik-Turun' },
                                { value: 'float-flap', label: '🌊 Melayang + Kepak' },
                                { value: 'fly-left', label: '⬅️ Terjang Kiri' },
                                { value: 'fly-right', label: '➡️ Terjang Kanan' },
                                { value: 'fly-up', label: '⬆️ Terbang Atas' },
                                { value: 'fly-down', label: '⬇️ Terbang Bawah' },
                                { value: 'fly-random', label: '🎲 Gerakan Acak' }
                            ]}
                            onChange={(v) => handleUpdate({ animation: { ...layer.animation, looping: v as AnimationType } })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                                label="Delay (ms)"
                                value={layer.animation?.delay || 0}
                                onChange={(v) => handleUpdate({ animation: { ...layer.animation, delay: v } })}
                            />
                            <NumberInput
                                label="Duration (ms)"
                                value={layer.animation?.duration || 1000}
                                onChange={(v) => handleUpdate({ animation: { ...layer.animation, duration: v } })}
                            />
                        </div>
                    </div>
                </SectionComponent>

                {/* Motion Path Section */}
                <SectionComponent title="Motion Path" icon={<Wind className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/70 font-medium">Enable Flight Path</span>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate({
                                    motionPathConfig: {
                                        enabled: !layer.motionPathConfig?.enabled,
                                        points: layer.motionPathConfig?.points || [],
                                        duration: layer.motionPathConfig?.duration || 3000,
                                        loop: layer.motionPathConfig?.loop ?? true
                                    }
                                })}
                                className={`w-10 h-5 rounded-full transition-colors ${layer.motionPathConfig?.enabled ? 'bg-premium-accent' : 'bg-white/10'}`}
                            >
                                <motion.div
                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    animate={{ x: layer.motionPathConfig?.enabled ? 22 : 2 }}
                                />
                            </motion.button>
                        </div>

                        {layer.motionPathConfig?.enabled && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <button
                                    onClick={() => setPathEditingId(pathEditingId === layer.id ? null : layer.id)}
                                    className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${pathEditingId === layer.id
                                        ? 'bg-premium-accent text-premium-dark border-premium-accent shadow-lg shadow-premium-accent/20'
                                        : 'bg-premium-accent/10 text-premium-accent border-premium-accent/30 hover:bg-premium-accent/20'
                                        }`}
                                >
                                    <MousePointer2 className="w-3.5 h-3.5" />
                                    {pathEditingId === layer.id ? 'FINISH EDITING PATH' : 'EDIT FLIGHT PATH'}
                                </button>

                                {pathEditingId === layer.id && (
                                    <div className="text-[9px] text-white/40 bg-white/5 p-2 rounded italic text-center leading-relaxed">
                                        Click anywhere on the canvas to add flight points. Drag points to adjust the path.
                                    </div>
                                )}

                                <NumberInput
                                    label="Speed / Duration (ms)"
                                    value={layer.motionPathConfig.duration}
                                    onChange={(v) => handleUpdate({ motionPathConfig: { ...layer.motionPathConfig!, duration: v } })}
                                />

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/50">Loop Animation</span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({ motionPathConfig: { ...layer.motionPathConfig!, loop: !layer.motionPathConfig?.loop } })}
                                        className={`w-8 h-4 rounded-full transition-colors ${layer.motionPathConfig.loop ? 'bg-premium-accent/60' : 'bg-white/5'}`}
                                    >
                                        <motion.div
                                            className="w-3 h-3 bg-white rounded-full"
                                            animate={{ x: layer.motionPathConfig.loop ? 18 : 2 }}
                                        />
                                    </motion.button>
                                </div>

                                {/* Path Points List */}
                                {layer.motionPathConfig.points.length > 0 && (
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-[9px] text-white/30 uppercase font-bold">
                                                Path Points ({layer.motionPathConfig.points.length})
                                            </label>
                                        </div>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {layer.motionPathConfig.points.map((point, idx) => (
                                                <div key={idx} className="p-2.5 rounded-lg border border-white/10 bg-white/5 group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] text-premium-accent font-semibold">
                                                            Point {idx + 1}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                const newPoints = [...layer.motionPathConfig!.points];
                                                                newPoints.splice(idx, 1);
                                                                handleUpdate({ motionPathConfig: { ...layer.motionPathConfig!, points: newPoints } });
                                                            }}
                                                            className="text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Position (read-only) */}
                                                    <div className="grid grid-cols-2 gap-2 text-[9px] text-white/40 mb-2 bg-white/5 rounded px-2 py-1">
                                                        <div>X: {Math.round(point.x)}</div>
                                                        <div>Y: {Math.round(point.y)}</div>
                                                    </div>

                                                    {/* Rotation */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[9px] text-white/40 w-14">Rotation</span>
                                                        <input
                                                            type="number"
                                                            min="-360"
                                                            max="360"
                                                            step="15"
                                                            value={point.rotation || 0}
                                                            onChange={(e) => {
                                                                const newPoints = [...layer.motionPathConfig!.points];
                                                                newPoints[idx] = { ...newPoints[idx], rotation: Number(e.target.value) };
                                                                handleUpdate({ motionPathConfig: { ...layer.motionPathConfig!, points: newPoints } });
                                                            }}
                                                            className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-[10px] text-white/70 focus:outline-none focus:border-premium-accent/50"
                                                        />
                                                        <span className="text-[9px] text-white/30">°</span>
                                                    </div>

                                                    {/* Scale */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-white/40 w-14">Scale</span>
                                                        <input
                                                            type="number"
                                                            min="0.1"
                                                            max="3"
                                                            step="0.1"
                                                            value={point.scale || 1}
                                                            onChange={(e) => {
                                                                const newPoints = [...layer.motionPathConfig!.points];
                                                                newPoints[idx] = { ...newPoints[idx], scale: Number(e.target.value) };
                                                                handleUpdate({ motionPathConfig: { ...layer.motionPathConfig!, points: newPoints } });
                                                            }}
                                                            className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-[10px] text-white/70 focus:outline-none focus:border-premium-accent/50"
                                                        />
                                                        <span className="text-[9px] text-white/30">x</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        )}
                    </div>
                </SectionComponent>

                {/* Appearance Section */}
                <SectionComponent title="Appearance" icon={<Palette className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] text-white/30 uppercase font-bold">Opacity</span>
                                <span className="text-xs text-white/60">{Math.round((layer.opacity ?? 1) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={layer.opacity ?? 1}
                                onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </SectionComponent>

                {/* Layer Order Section */}
                <SectionComponent title="Layer Order" icon={<Layers className="w-4 h-4" />}>
                    <div className="grid grid-cols-4 gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => bringToFront(layer.id)}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                            title="Bring to Front"
                        >
                            <ArrowUpToLine className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdate({ zIndex: (layer.zIndex || 0) + 1 })}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdate({ zIndex: Math.max(0, (layer.zIndex || 0) - 1) })}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendToBack(layer.id)}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                            title="Send to Back"
                        >
                            <ArrowDownToLine className="w-4 h-4" />
                        </motion.button>
                    </div>
                    <p className="text-[10px] text-white/30 mt-2 text-center">Z-Index: {layer.zIndex}</p>
                </SectionComponent>

                <div className="h-[1px] bg-white/10" />

                <button
                    onClick={handleRemove}
                    className="w-full py-3 rounded-lg bg-red-400/10 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Element
                </button>
            </div >
        </div >
    );
};

// ============================================
// UI COMPONENTS
// ============================================
const SectionComponent: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/60">
            {icon}
            <h4 className="text-[10px] font-bold uppercase tracking-widest">{title}</h4>
        </div>
        {children}
    </div>
);

const NumberInput: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">{label}</label>
        <input
            type="number"
            value={Math.round(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
        />
    </div>
);

const SelectInput: React.FC<{ label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
    <div>
        <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">{opt.label}</option>
            ))}
        </select>
    </div>
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">{label}</label>
        <div className="flex gap-2">
            <input
                type="color"
                value={/^#[0-9A-F]{6}$/i.test(value) ? value : '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none font-mono"
            />
        </div>
    </div>
);
