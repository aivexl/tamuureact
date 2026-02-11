import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Layer, AnimationType, TextStyle, CountdownConfig, ButtonConfig, QuoteConfig, ShapeConfig, IconStyle, RSVPWishesConfig, RSVPVariantId, LayerPermissions } from '@/store/layersSlice';
import { generateId } from '@/lib/utils';
import { RSVP_VARIANTS, DEFAULT_RSVP_WISHES_CONFIG } from '@/lib/rsvp-variants';
import { SUPPORTED_FONTS } from '@/lib/fonts';
import { SUPPORTED_BANKS } from '@/lib/banks';
import { QUOTES_LIBRARY } from '@/constants/quotes';

import {
    Type, Image as ImageIcon, Clock, MailOpen,
    Heart, Square, Film, MapPin, Video, Sparkles, X,
    MessageSquare, Users, Circle, Triangle, Diamond, Star, Zap, Wind, Layout,
    Gift, Music, QrCode, Waves, Layers, Monitor, Share2, Sun, Hash, PlaySquare,
    Component, Palette, Eye, Shield, CreditCard,
    ChevronDown, ChevronUp, GripVertical, Settings2, Trash2, Copy, Lock, Unlock,
    Maximize2, Minimize2, Move, RotateCw, Type as TextIcon, Plus, Info, Home,
    MousePointer2, FlipHorizontal2, FlipVertical2, Anchor, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Quote, Check, Calendar, Sliders, MoveHorizontal, ArrowUpToLine, ArrowDownToLine
} from 'lucide-react';

import { ElementToolbar } from '@/components/Layout/ElementToolbar';
import { UserElementEditor } from '@/components/UserEditor/UserElementEditor';
import { LoveStoryPanel } from './LoveStoryPanel';

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

        // Orbit Actions
        orbit,
        activeCanvas,
        updateOrbitCanvas,
        updateOrbitElement,
        removeOrbitElement,
        duplicateOrbitElement,
        bringOrbitElementToFront,
        sendOrbitElementToBack,
        moveOrbitElementUp,
        moveOrbitElementDown,
        duplicateElementInSection,
        bringElementToFront,
        sendElementToBack,
        moveElementUp,
        moveElementDown,
        setActiveCanvas,
        autoAnchorElement,

        pathEditingId,
        setPathEditingId,

        // Image Crop Modal
        openImageCropModal,
        isTemplate,
        isSimulationMode
    } = useStore();

    // 1. Context-Aware Discovery
    const activeSection = sections.find(s => s.id === activeSectionId);

    // Find the Layer based on activeCanvas context
    const getActiveLayer = () => {
        if (activeCanvas === 'main') {
            return activeSection?.elements.find(l => l.id === selectedLayerId);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            return orbit[activeCanvas].elements.find(l => l.id === selectedLayerId);
        }
        return layers.find(l => l.id === selectedLayerId); // Fallback to global
    };

    const layer = getActiveLayer();

    // 3. Handle Updates: Redirect to correct store action
    const handleUpdate = (updates: Partial<Layer>) => {
        if (!layer) return;

        if (activeCanvas === 'main' && activeSectionId) {
            updateElementInSection(activeSectionId, layer.id, updates);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElement(activeCanvas, layer.id, updates);
        } else {
            useStore.getState().updateLayer(layer.id, updates);
        }
    };

    // 4. Handle Alignment Updates: Deselect then reselect to force Moveable remount
    const handleAlignmentUpdate = (updates: Partial<Layer>) => {
        if (!layer) return;
        const layerId = layer.id;

        // First deselect
        selectLayer(null);

        // Update position
        if (activeCanvas === 'main' && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, updates);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElement(activeCanvas, layerId, updates);
        } else {
            useStore.getState().updateLayer(layerId, updates);
        }

        // Reselect after a brief delay to allow position update to propagate
        setTimeout(() => {
            selectLayer(layerId);
        }, 50);
    };

    const handleRemove = () => {
        if (!layer) return;

        if (activeCanvas === 'main' && activeSectionId) {
            removeElementFromSection(activeSectionId, layer.id);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            removeOrbitElement(activeCanvas, layer.id);
        } else {
            useStore.getState().removeLayer(layer.id);
        }
        selectLayer(null);
    };

    const handleDuplicate = () => {
        if (!layer) return;

        if (activeCanvas === 'main' && activeSectionId) {
            duplicateElementInSection(activeSectionId, layer.id);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            duplicateOrbitElement(activeCanvas, layer.id);
        } else {
            useStore.getState().duplicateLayer(layer.id);
        }
    };

    const handleOrder = (direction: 'front' | 'back' | 'up' | 'down') => {
        if (!layer) return;
        if (activeCanvas === 'main' && activeSectionId) {
            if (direction === 'front') bringElementToFront(activeSectionId, layer.id);
            if (direction === 'back') sendElementToBack(activeSectionId, layer.id);
            if (direction === 'up') moveElementUp(activeSectionId, layer.id);
            if (direction === 'down') moveElementDown(activeSectionId, layer.id);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            if (direction === 'front') bringOrbitElementToFront(activeCanvas, layer.id);
            if (direction === 'back') sendOrbitElementToBack(activeCanvas, layer.id);
            if (direction === 'up') moveOrbitElementUp(activeCanvas, layer.id);
            if (direction === 'down') moveOrbitElementDown(activeCanvas, layer.id);
        }
    };

    // ============================================
    // SIMULATION MODE: SHOW USER VIEW
    // ============================================
    if (isTemplate && isSimulationMode && layer) {
        return (
            <div className="h-full flex flex-col bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-amber-500/10 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Simulation: User View</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <UserElementEditor element={layer} sectionId={activeSectionId || ''} />

                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-medium italic">
                            In Simulation Mode, you are seeing what the end-user sees. Admin controls are hidden, and permissions are enforced.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Check if we have a layer to show
    if (!layer) {
        if (activeCanvas === 'main') {
            if (!activeSection) {
                return (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 p-8 text-center">
                        <Layers className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-sm">Select an element or section to customize</p>
                    </div>
                );
            }
            // Section settings for main canvas
            return (
                <div className="h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 shrink-0">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-premium-accent">Section Settings</h3>
                        <p className="text-[10px] text-white/40 font-mono">{activeSection.title}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-6">
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

                                        {/* Zoom Mode Toggle - CTOR Ultra Precision */}
                                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                                            <button
                                                onClick={() => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, zoomMode: 'fit' } })}
                                                className={`flex-1 flex flex-col items-center py-1.5 rounded-md transition-all ${activeSection.zoomConfig.zoomMode !== 'fill' ? 'bg-premium-accent/10 border border-premium-accent/20 text-premium-accent' : 'text-white/40 hover:text-white/60'}`}
                                            >
                                                <span className="text-[9px] font-bold uppercase">Fit</span>
                                                <span className="text-[7px] opacity-60">Contain Whole Box</span>
                                            </button>
                                            <button
                                                onClick={() => updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig!, zoomMode: 'fill' } })}
                                                className={`flex-1 flex flex-col items-center py-1.5 rounded-md transition-all ${activeSection.zoomConfig.zoomMode === 'fill' ? 'bg-premium-accent/10 border border-premium-accent/20 text-premium-accent' : 'text-white/40 hover:text-white/60'}`}
                                            >
                                                <span className="text-[9px] font-bold uppercase">Fill</span>
                                                <span className="text-[7px] opacity-60">Full Screen Blur</span>
                                            </button>
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
                                                            transitionDuration: 1000,
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
                                                                        className="w-4 h-4 rounded cursor-pointer border-0 p-0"
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
                                                                        className="bg-transparent border-none p-0 text-[10px] uppercase font-bold text-white/80 focus:ring-0 w-full truncate"
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

                                                            {/* TIMING CONTROLS PER POINT */}
                                                            <div className="mt-2 pt-2 border-t border-white/5 flex gap-3">
                                                                <div className="flex-1">
                                                                    <label className="text-[8px] text-white/30 uppercase font-bold block mb-1">Move (ms)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={p.transitionDuration ?? 1000}
                                                                        onChange={(e) => {
                                                                            if (!activeSection.zoomConfig) return;
                                                                            const newPoints = [...activeSection.zoomConfig.points];
                                                                            newPoints[idx] = { ...p, transitionDuration: Number(e.target.value) };
                                                                            updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                        }}
                                                                        className="w-full bg-black/20 border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-white focus:border-premium-accent/50 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[8px] text-white/30 uppercase font-bold block mb-1">Stay (ms)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={p.duration}
                                                                        onChange={(e) => {
                                                                            if (!activeSection.zoomConfig) return;
                                                                            const newPoints = [...activeSection.zoomConfig.points];
                                                                            newPoints[idx] = { ...p, duration: Number(e.target.value) };
                                                                            updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                        }}
                                                                        className="w-full bg-black/20 border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-white focus:border-premium-accent/50 focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 grid grid-cols-4 gap-1.5">
                                                                <div className="relative">
                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-bold">X</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={p.targetRegion.x}
                                                                        onChange={(e) => {
                                                                            if (!activeSection.zoomConfig) return;
                                                                            const newPoints = [...activeSection.zoomConfig.points];
                                                                            newPoints[idx] = { ...p, targetRegion: { ...p.targetRegion, x: Number(e.target.value) } };
                                                                            updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/5 rounded pl-4 pr-1 py-0.5 text-[9px] text-white focus:border-premium-accent/50 focus:outline-none font-mono"
                                                                    />
                                                                </div>
                                                                <div className="relative">
                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-bold">Y</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={p.targetRegion.y}
                                                                        onChange={(e) => {
                                                                            if (!activeSection.zoomConfig) return;
                                                                            const newPoints = [...activeSection.zoomConfig.points];
                                                                            newPoints[idx] = { ...p, targetRegion: { ...p.targetRegion, y: Number(e.target.value) } };
                                                                            updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/5 rounded pl-4 pr-1 py-0.5 text-[9px] text-white focus:border-premium-accent/50 focus:outline-none font-mono"
                                                                    />
                                                                </div>
                                                                <div className="relative">
                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-bold">W</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={p.targetRegion.width}
                                                                        onChange={(e) => {
                                                                            if (!activeSection.zoomConfig) return;
                                                                            const newPoints = [...activeSection.zoomConfig.points];
                                                                            newPoints[idx] = { ...p, targetRegion: { ...p.targetRegion, width: Number(e.target.value) } };
                                                                            updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/5 rounded pl-4 pr-1 py-0.5 text-[9px] text-white focus:border-premium-accent/50 focus:outline-none font-mono"
                                                                    />
                                                                </div>
                                                                <div className="relative">
                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-bold">H</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={p.targetRegion.height}
                                                                        onChange={(e) => {
                                                                            if (!activeSection.zoomConfig) return;
                                                                            const newPoints = [...activeSection.zoomConfig.points];
                                                                            newPoints[idx] = { ...p, targetRegion: { ...p.targetRegion, height: Number(e.target.value) } };
                                                                            updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/5 rounded pl-4 pr-1 py-0.5 text-[9px] text-white focus:border-premium-accent/50 focus:outline-none font-mono"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 flex gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!activeSection.zoomConfig) return;
                                                                        const newPoints = [...activeSection.zoomConfig.points];
                                                                        newPoints[idx] = { ...p, targetRegion: { x: 0, y: p.targetRegion.y, width: 414, height: p.targetRegion.height } };
                                                                        updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                    }}
                                                                    className="flex-1 bg-white/5 hover:bg-white/10 text-[8px] text-white/40 hover:text-white py-1 rounded border border-white/5 uppercase font-bold"
                                                                >
                                                                    Full Width
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!activeSection.zoomConfig) return;
                                                                        const ratio = 896 / 414;
                                                                        const newHeight = p.targetRegion.width * ratio;
                                                                        const newPoints = [...activeSection.zoomConfig.points];
                                                                        newPoints[idx] = { ...p, targetRegion: { ...p.targetRegion, height: newHeight } };
                                                                        updateSection(activeSection.id, { zoomConfig: { ...activeSection.zoomConfig, points: newPoints } });
                                                                    }}
                                                                    className="flex-1 bg-white/5 hover:bg-white/10 text-[8px] text-white/40 hover:text-white py-1 rounded border border-white/5 uppercase font-bold"
                                                                >
                                                                    Mobile Ratio
                                                                </button>
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

        if (activeCanvas === 'left' || activeCanvas === 'right') {
            const orbitCanvas = orbit[activeCanvas];
            return (
                <div className="h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 shrink-0">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-purple-400">Stage Settings</h3>
                        <p className="text-[10px] text-white/40 font-mono">{activeCanvas.toUpperCase()} DECOR STAGE</p>
                    </div>
                    <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-6">
                        <ElementToolbar embedded />

                        {/* Background Settings */}
                        <SectionComponent title="Stage Background" icon={<Palette className="w-4 h-4" />}>
                            <div className="space-y-4">
                                <ColorInput
                                    label="Background Color"
                                    value={orbitCanvas.backgroundColor}
                                    onChange={(v) => updateOrbitCanvas(activeCanvas as 'left' | 'right', { backgroundColor: v })}
                                />
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Background Image URL</label>
                                    <input
                                        type="text"
                                        value={orbitCanvas.backgroundUrl || ''}
                                        onChange={(e) => updateOrbitCanvas(activeCanvas as 'left' | 'right', { backgroundUrl: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none font-mono"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/70 font-medium">Stage Visible</span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateOrbitCanvas(activeCanvas as 'left' | 'right', { isVisible: !orbitCanvas.isVisible })}
                                        className={`w-10 h-5 rounded-full transition-colors ${orbitCanvas.isVisible ? 'bg-purple-500' : 'bg-white/10'}`}
                                    >
                                        <motion.div
                                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                                            animate={{ x: orbitCanvas.isVisible ? 22 : 2 }}
                                        />
                                    </motion.button>
                                </div>
                            </div>
                        </SectionComponent>

                        <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 text-[10px] text-purple-300/60 leading-relaxed italic">
                            Tip: Decorations on this stage are "Fixed". They will stay in position even when the main invitation scrolls.
                        </div>
                    </div>
                </div>
            );
        }

        // Final fallback for !layer if no other return was hit
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                    <MousePointer2 className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-sm font-bold text-white/60">No Selection</h3>
                <p className="text-xs text-white/30 leading-relaxed">Select an element or section to customize</p>
            </div>
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
                    {/* CTO COMPUTE: Use correct design dimensions based on active canvas context */}
                    {(() => {
                        const isOrbit = activeCanvas === 'left' || activeCanvas === 'right';
                        const designWidth = isOrbit ? 800 : 414;
                        const designHeight = 896;

                        // CTO FIX: Calculate VISUAL bounding box accounting for rotation and scale
                        const getVisualBounds = () => {
                            const w = layer.width || 0;
                            const h = layer.height || 0;
                            const rotation = (layer.rotation || 0) * Math.PI / 180;
                            const scale = layer.scale || 1;

                            // Apply scale first
                            const scaledW = w * scale;
                            const scaledH = h * scale;

                            // Calculate rotated bounding box
                            const cos = Math.abs(Math.cos(rotation));
                            const sin = Math.abs(Math.sin(rotation));
                            const visualWidth = scaledW * cos + scaledH * sin;
                            const visualHeight = scaledW * sin + scaledH * cos;

                            return { visualWidth, visualHeight, scaledW, scaledH };
                        };

                        const { visualWidth, visualHeight } = getVisualBounds();

                        // Calculate alignment positions using visual bounds
                        const alignLeft = () => {
                            const offsetX = (visualWidth - (layer.width || 0)) / 2;
                            handleAlignmentUpdate({ x: offsetX });
                        };
                        const alignCenterX = () => {
                            const offsetX = (visualWidth - (layer.width || 0)) / 2;
                            handleAlignmentUpdate({ x: (designWidth - visualWidth) / 2 + offsetX });
                        };
                        const alignRight = () => {
                            const offsetX = (visualWidth - (layer.width || 0)) / 2;
                            handleAlignmentUpdate({ x: designWidth - visualWidth + offsetX });
                        };
                        const alignTop = () => {
                            const offsetY = (visualHeight - (layer.height || 0)) / 2;
                            handleAlignmentUpdate({ y: offsetY });
                        };
                        const alignMiddleY = () => {
                            const offsetY = (visualHeight - (layer.height || 0)) / 2;
                            handleAlignmentUpdate({ y: (designHeight - visualHeight) / 2 + offsetY });
                        };
                        const alignBottom = () => {
                            const offsetY = (visualHeight - (layer.height || 0)) / 2;
                            handleAlignmentUpdate({ y: designHeight - visualHeight + offsetY });
                        };

                        return (
                            <>
                                {/* Alignment Tools - Figma Style */}
                                <div className="grid grid-cols-6 gap-1 mb-4 p-1 bg-white/5 rounded-lg border border-white/5">
                                    <button onClick={alignLeft} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Left">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                            <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                            <rect x="7" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                        </svg>
                                    </button>
                                    <button onClick={alignCenterX} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <rect x="11" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                            <rect x="5" y="7" width="14" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                            <rect x="7" y="13" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                        </svg>
                                    </button>
                                    <button onClick={alignRight} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Right">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <rect x="19" y="4" width="2" height="16" rx="0.5" fill="currentColor" />
                                            <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                            <rect x="11" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
                                        </svg>
                                    </button>
                                    <button onClick={alignTop} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Top">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <rect x="4" y="3" width="16" height="2" rx="0.5" fill="currentColor" />
                                            <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                            <rect x="13" y="7" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" />
                                        </svg>
                                    </button>
                                    <button onClick={alignMiddleY} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Middle">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <rect x="4" y="11" width="16" height="2" rx="0.5" fill="currentColor" />
                                            <rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" />
                                            <rect x="13" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                        </svg>
                                    </button>
                                    <button onClick={alignBottom} className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white flex justify-center" title="Align Bottom">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <rect x="4" y="19" width="16" height="2" rx="0.5" fill="currentColor" />
                                            <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" />
                                            <rect x="13" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        );
                    })()}

                    <div className="grid grid-cols-2 gap-3">
                        <NumberInput label="X" value={layer.x} onChange={(v) => handleUpdate({ x: v })} />
                        <NumberInput label="Y" value={layer.y} onChange={(v) => handleUpdate({ y: v })} />
                        <NumberInput label="Width" value={layer.width} onChange={(v) => handleUpdate({ width: v })} />
                        <NumberInput label="Height" value={layer.height} onChange={(v) => handleUpdate({ height: v })} />
                    </div>

                    {/* Precision Fitting Tools - CTO Unicorn Implementation */}
                    {layer.assetMetadata && (
                        <div className="mt-3 flex gap-2">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    const meta = layer.assetMetadata;
                                    if (meta && meta.aspectRatio) {
                                        // Fit height to current width maintaining ratio
                                        handleUpdate({ height: Math.round(layer.width / meta.aspectRatio) });
                                    }
                                }}
                                className="flex-1 bg-premium-accent/10 hover:bg-premium-accent/20 text-premium-accent text-[9px] font-bold py-2 rounded-lg border border-premium-accent/20 transition-all flex items-center justify-center gap-1.5 group"
                            >
                                <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                FIT BOUNDARY TO CONTENT
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    const meta = layer.assetMetadata;
                                    if (meta && meta.naturalWidth && meta.naturalHeight && meta.aspectRatio) {
                                        // Reset to original size (clamped to pro max 400 for initial safety)
                                        let w = meta.naturalWidth;
                                        let h = meta.naturalHeight;
                                        const maxDim = 400;
                                        if (w > maxDim || h > maxDim) {
                                            if (meta.aspectRatio > 1) {
                                                w = maxDim;
                                                h = maxDim / meta.aspectRatio;
                                            } else {
                                                h = maxDim;
                                                w = maxDim * meta.aspectRatio;
                                            }
                                        }
                                        handleUpdate({ width: Math.round(w), height: Math.round(h) });
                                    }
                                }}
                                className="px-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[9px] font-bold py-2 rounded-lg border border-white/5 transition-all"
                                title="Reset to Original Size (Clamped)"
                            >
                                RESET
                            </motion.button>
                        </div>
                    )}

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

                {/* ============================================ */}
                {/* ADMIN - USER PERMISSIONS & ANCHORING */}
                {/* ============================================ */}
                {isTemplate && !isSimulationMode && (
                    <SectionComponent title="User Permissions & Anchoring" icon={<Shield className="w-4 h-4 text-premium-accent" />}>
                        <div className="space-y-4 p-3 bg-premium-accent/5 rounded-xl border border-premium-accent/10">
                            {/* Granular Permissions */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-premium-accent font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> User Can Edit:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'canEditText', label: 'Text', type: 'text' },
                                        { key: 'canEditImage', label: 'Image', type: 'image' },
                                        { key: 'canEditStyle', label: 'Style', any: true },
                                        { key: 'canEditPosition', label: 'Position', any: true },
                                        { key: 'canDelete', label: 'Delete', any: true },
                                        { key: 'isVisibleInUserEditor', label: 'Visible', any: true },
                                    ].map((perm) => {
                                        if (perm.type && layer.type !== perm.type && !perm.any) return null;
                                        const isChecked = layer.permissions?.[perm.key as keyof typeof layer.permissions] ?? false;
                                        return (
                                            <button
                                                key={perm.key}
                                                onClick={() => {
                                                    const nextChecked = !isChecked;
                                                    const newPermissions = {
                                                        ...(layer.permissions || {
                                                            canEditText: false,
                                                            canEditImage: false,
                                                            canEditStyle: false,
                                                            canEditPosition: false,
                                                            canDelete: false,
                                                            isVisibleInUserEditor: false,
                                                            isContentProtected: false
                                                        }),
                                                        [perm.key]: nextChecked
                                                    };

                                                    // AUTO-UX: If any edit permission is turned ON, also enable 'Visible'
                                                    if (nextChecked && perm.key !== 'isVisibleInUserEditor' && perm.key !== 'isContentProtected') {
                                                        newPermissions.isVisibleInUserEditor = true;
                                                    }

                                                    // AUTO-UX: If 'Text' is turned ON, also enable 'Style' so they get the toolbar
                                                    if (nextChecked && perm.key === 'canEditText' && layer.type === 'text') {
                                                        newPermissions.canEditStyle = true;
                                                    }

                                                    handleUpdate({ permissions: newPermissions });
                                                }}
                                                className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all ${isChecked ? 'bg-premium-accent/10 border-premium-accent/30 text-premium-accent' : 'bg-white/5 border-white/5 text-white/40'}`}
                                            >
                                                <span className="text-[10px] font-medium">{perm.label}</span>
                                                <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${isChecked ? 'bg-premium-accent border-premium-accent' : 'border-white/20'}`}>
                                                    {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="h-[1px] bg-premium-accent/10 my-2" />

                            {/* Anchoring / Smart Position */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-premium-accent font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Anchor className="w-3 h-3" /> Smart Anchoring:
                                </label>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] text-white/40">Enable Relative Shifting</span>
                                    <button
                                        onClick={() => handleUpdate({
                                            anchoring: {
                                                targetId: layer.anchoring?.targetId || '',
                                                edge: layer.anchoring?.edge || 'bottom',
                                                offset: layer.anchoring?.offset || 20,
                                                isRelative: !layer.anchoring?.isRelative
                                            }
                                        })}
                                        className={`w-8 h-4 rounded-full transition-colors relative ${layer.anchoring?.isRelative ? 'bg-premium-accent' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${layer.anchoring?.isRelative ? 'left-[18px]' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {layer.anchoring?.isRelative && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {/* Magic Button */}
                                        <button
                                            onClick={() => {
                                                if (activeCanvas === 'main' && activeSectionId) {
                                                    autoAnchorElement(activeSectionId, layer.id);
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 bg-premium-accent/20 hover:bg-premium-accent/30 text-premium-accent rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider transition-all border border-premium-accent/20"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Active Smart Layout (Auto-Wrap Text)
                                        </button>

                                        <div className="space-y-1">
                                            <label className="text-[8px] text-white/30 uppercase font-bold">Anchor Target</label>
                                            <select
                                                value={layer.anchoring?.targetId || ''}
                                                onChange={(e) => handleUpdate({ anchoring: { ...layer.anchoring!, targetId: e.target.value } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-premium-accent/50 appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-[#1a1a1a] text-white">Select Element...</option>
                                                {/* Filter elements in the same context that are NOT the current element */}
                                                {(activeCanvas === 'main' ? activeSection?.elements : orbit[activeCanvas as 'left' | 'right'].elements)
                                                    ?.filter(l => l.id !== layer.id)
                                                    .map(l => (
                                                        <option key={l.id} value={l.id} className="bg-[#1a1a1a] text-white">
                                                            {l.name ? l.name : (
                                                                l.type === 'text'
                                                                    ? `Text: "${l.content?.substring(0, 20)}..."`
                                                                    : `${l.type.charAt(0).toUpperCase() + l.type.slice(1)}${l.imageUrl ? ` (${l.imageUrl.split('/').pop()?.substring(0, 10)})` : ''}`
                                                            )}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[8px] text-white/30 uppercase font-bold">Edge</label>
                                                <select
                                                    value={layer.anchoring?.edge || 'bottom'}
                                                    onChange={(e) => handleUpdate({ anchoring: { ...layer.anchoring!, edge: e.target.value as any } })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 appearance-none cursor-pointer"
                                                >
                                                    <option value="top" className="bg-[#1a1a1a] text-white">Top</option>
                                                    <option value="bottom" className="bg-[#1a1a1a] text-white">Bottom</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] text-white/30 uppercase font-bold">Offset</label>
                                                <input
                                                    type="number"
                                                    value={layer.anchoring?.offset || 0}
                                                    onChange={(e) => handleUpdate({ anchoring: { ...layer.anchoring!, offset: Number(e.target.value) } })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[8px] text-white/20 italic">
                                            {layer.name} will maintain this distance from the target even if the target grows.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionComponent>
                )}

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
                                    options={SUPPORTED_FONTS.map(f => ({ value: f.name, label: f.name }))}
                                    isFontPicker
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

                                {/* Multiline Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/30 uppercase font-bold">Multiline</span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({ textStyle: { ...layer.textStyle!, multiline: !layer.textStyle?.multiline } })}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${layer.textStyle?.multiline ? 'bg-premium-accent' : 'bg-white/10'}`}
                                    >
                                        <motion.div
                                            animate={{ x: layer.textStyle?.multiline ? 20 : 2 }}
                                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                        />
                                    </motion.button>
                                </div>

                                {/* Curved Text Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/30 uppercase font-bold">Curved Text</span>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({
                                            curvedTextConfig: {
                                                ...layer.curvedTextConfig,
                                                enabled: !layer.curvedTextConfig?.enabled,
                                                radius: layer.curvedTextConfig?.radius || 100,
                                                angle: layer.curvedTextConfig?.angle || 0,
                                                spacing: layer.curvedTextConfig?.spacing || 0,
                                                reverse: layer.curvedTextConfig?.reverse || false
                                            }
                                        })}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${layer.curvedTextConfig?.enabled ? 'bg-premium-accent' : 'bg-white/10'}`}
                                    >
                                        <motion.div
                                            animate={{ x: layer.curvedTextConfig?.enabled ? 20 : 2 }}
                                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                        />
                                    </motion.button>
                                </div>

                                {/* Curved Text Controls - Only show when enabled */}
                                {layer.curvedTextConfig?.enabled && (
                                    <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <NumberInput
                                            label="Radius"
                                            value={layer.curvedTextConfig?.radius || 100}
                                            min={20}
                                            max={500}
                                            step={10}
                                            onChange={(v) => handleUpdate({
                                                curvedTextConfig: { ...layer.curvedTextConfig!, radius: v }
                                            })}
                                        />
                                        <NumberInput
                                            label="Angle"
                                            value={layer.curvedTextConfig?.angle || 0}
                                            min={-180}
                                            max={180}
                                            step={5}
                                            onChange={(v) => handleUpdate({
                                                curvedTextConfig: { ...layer.curvedTextConfig!, angle: v }
                                            })}
                                        />
                                        <NumberInput
                                            label="Spacing"
                                            value={layer.curvedTextConfig?.spacing || 0}
                                            min={-10}
                                            max={50}
                                            step={1}
                                            onChange={(v) => handleUpdate({
                                                curvedTextConfig: { ...layer.curvedTextConfig!, spacing: v }
                                            })}
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] text-white/30 uppercase font-bold">Reverse</span>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleUpdate({
                                                    curvedTextConfig: { ...layer.curvedTextConfig!, reverse: !layer.curvedTextConfig?.reverse }
                                                })}
                                                className={`relative w-10 h-5 rounded-full transition-colors ${layer.curvedTextConfig?.reverse ? 'bg-premium-accent' : 'bg-white/10'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: layer.curvedTextConfig?.reverse ? 20 : 2 }}
                                                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                                />
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Quote Config - Only for quote elements */}
                {
                    layer.type === 'quote' && (
                        <SectionComponent title="Quote Settings" icon={<Quote className="w-4 h-4" />}>
                            <div className="space-y-4">
                                {/* Variant Selection */}
                                <SelectInput
                                    label="Variant"
                                    value={layer.quoteConfig?.variant || 'cinematic'}
                                    options={[
                                        { value: 'cinematic', label: '🎬 Cinematic Glass' },
                                        { value: 'solid', label: '🎨 Solid Color' },
                                        { value: 'transparent', label: '👻 Transparent' }
                                    ]}
                                    onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, variant: v as any } })}
                                />

                                {/* Arabic Content */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block font-arabic">Teks Arab (Optional)</label>
                                    <textarea
                                        value={layer.quoteConfig?.textArabic || ''}
                                        onChange={(e) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, textArabic: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none resize-none h-20 font-arabic text-right"
                                        dir="rtl"
                                        placeholder="Tuliskan teks Arab..."
                                    />
                                </div>

                                {/* Translation/Main Content */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Teks Kutipan / Terjemahan</label>
                                    <textarea
                                        value={layer.quoteConfig?.text || ''}
                                        onChange={(e) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, text: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none resize-none h-24"
                                        placeholder="Tuliskan terjemahan atau kutipan..."
                                    />
                                </div>

                                {/* Category Selection */}
                                <SelectInput
                                    label="Kategori"
                                    value={layer.quoteConfig?.category || 'international'}
                                    options={[
                                        { value: 'international', label: '🌍 Kutipan Internasional' },
                                        { value: 'quran', label: '📖 Ayat Suci / Quran' }
                                    ]}
                                    onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, category: v as any } })}
                                />

                                {/* Author */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Author</label>
                                    <input
                                        type="text"
                                        value={layer.quoteConfig?.author || ''}
                                        onChange={(e) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, author: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                        placeholder="Author name..."
                                    />
                                </div>

                                {/* Typography Group */}
                                <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="text-[8px] text-white/40 uppercase font-bold">Typography</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectInput
                                            label="Quote Font"
                                            value={layer.quoteConfig?.fontFamily || 'Outfit'}
                                            options={SUPPORTED_FONTS.map(f => ({ value: f.name, label: f.name }))}
                                            isFontPicker
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, fontFamily: v } })}
                                        />
                                        <NumberInput
                                            label="Quote Size"
                                            value={layer.quoteConfig?.fontSize || 24}
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, fontSize: v } })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectInput
                                            label="Author Font"
                                            value={layer.quoteConfig?.authorFontFamily || 'Outfit'}
                                            options={SUPPORTED_FONTS.map(f => ({ value: f.name, label: f.name }))}
                                            isFontPicker
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, authorFontFamily: v } })}
                                        />
                                        <NumberInput
                                            label="Author Size"
                                            value={layer.quoteConfig?.authorFontSize || 16}
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, authorFontSize: v } })}
                                        />
                                    </div>
                                </div>

                                {/* Colors Group */}
                                <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="text-[8px] text-white/40 uppercase font-bold">Colors</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ColorInput
                                            label="Quote Text"
                                            value={layer.quoteConfig?.quoteColor || '#ffffff'}
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, quoteColor: v } })}
                                        />
                                        <ColorInput
                                            label="Author Text"
                                            value={layer.quoteConfig?.authorColor || '#ffffff'}
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, authorColor: v } })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ColorInput
                                            label="Accent/Quotes"
                                            value={layer.quoteConfig?.decorativeColor || '#bfa181'}
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, decorativeColor: v } })}
                                        />
                                        {layer.quoteConfig?.variant === 'solid' && (
                                            <ColorInput
                                                label="Background"
                                                value={layer.quoteConfig?.backgroundColor || '#bfa181'}
                                                onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, backgroundColor: v } })}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Advanced Group */}
                                <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="text-[8px] text-white/40 uppercase font-bold">Advanced Effects</h4>

                                    {layer.quoteConfig?.variant === 'cinematic' && (
                                        <NumberInput
                                            label="Glass Blur"
                                            value={layer.quoteConfig?.glassBlur || 20}
                                            min={0}
                                            max={100}
                                            onChange={(v) => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, glassBlur: v } })}
                                        />
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-white/30 uppercase font-bold">Show Watermark</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, showWatermark: !layer.quoteConfig?.showWatermark } })}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${layer.quoteConfig?.showWatermark ? 'bg-premium-accent' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                animate={{ x: layer.quoteConfig?.showWatermark ? 20 : 2 }}
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                            />
                                        </motion.button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-white/30 uppercase font-bold">3D Tilt Effect</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate({ quoteConfig: { ...layer.quoteConfig!, tiltEnabled: !layer.quoteConfig?.tiltEnabled } })}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${layer.quoteConfig?.tiltEnabled ? 'bg-premium-accent' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                animate={{ x: layer.quoteConfig?.tiltEnabled ? 20 : 2 }}
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                            />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Quote Library Integration */}
                                <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="text-[8px] text-white/40 uppercase font-bold flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Quote Library
                                    </h4>

                                    <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                                        {QUOTES_LIBRARY.map((quote) => (
                                            <button
                                                key={quote.id}
                                                onClick={() => handleUpdate({
                                                    quoteConfig: {
                                                        ...layer.quoteConfig!,
                                                        text: quote.text,
                                                        textArabic: quote.textArabic,
                                                        author: quote.author,
                                                        category: quote.category
                                                    }
                                                })}
                                                className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:border-premium-accent/50 hover:bg-white/10 transition-all space-y-2 group"
                                            >
                                                {quote.textArabic && (
                                                    <p className="text-xs text-white/90 font-arabic text-right leading-relaxed" dir="rtl">
                                                        {quote.textArabic}
                                                    </p>
                                                )}
                                                <p className="text-[9px] text-white/60 italic leading-relaxed line-clamp-2">
                                                    {quote.text}
                                                </p>
                                                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                                    <span className="text-[8px] font-bold text-premium-accent uppercase tracking-widest">{quote.author}</span>
                                                    <Check className="w-2.5 h-2.5 text-premium-accent opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
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

                                {/* Variant Selection - 20 Premium Variants */}
                                <SelectInput
                                    label="Variant"
                                    value={layer.countdownConfig?.variant || 'elegant'}
                                    options={[
                                        { value: 'elegant', label: '✨ Elegant' },
                                        { value: 'classic', label: '✨ Classic' },
                                        { value: 'minimal', label: '✨ Minimal' },
                                        { value: 'flip', label: '🔄 Flip Clock' },
                                        { value: 'flip-dark', label: '🔄 Flip Dark' },
                                        { value: 'flip-neon', label: '🔄 Flip Neon' },
                                        { value: 'boxed', label: '⬜ Boxed' },
                                        { value: 'boxed-gradient', label: '⬜ Boxed Gradient' },
                                        { value: 'card-glass', label: '⬜ Card Glass' },
                                        { value: 'card-solid', label: '⬜ Card Solid' },
                                        { value: 'circle-progress', label: '⭕ Circle Progress' },
                                        { value: 'circle-minimal', label: '⭕ Circle Minimal' },
                                        { value: 'ring', label: '⭕ Ring' },
                                        { value: 'modern-split', label: '💫 Modern Split' },
                                        { value: 'neon-glow', label: '💫 Neon Glow' },
                                        { value: 'cyber', label: '💫 Cyber' },
                                        { value: 'luxury-gold', label: '👑 Luxury Gold' },
                                        { value: 'luxury-rose', label: '👑 Luxury Rose' },
                                        { value: 'wedding-script', label: '👑 Wedding Script' },
                                        { value: 'typewriter', label: '🎯 Typewriter' },
                                    ]}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, variant: v as any } })}
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

                                {/* Typography Controls */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Typography</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <NumberInput
                                            label="Font Size"
                                            value={layer.countdownConfig?.fontSize || 32}
                                            min={12}
                                            max={72}
                                            onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, fontSize: v } })}
                                        />
                                        <SelectInput
                                            label="Font Weight"
                                            value={layer.countdownConfig?.fontWeight || 'bold'}
                                            options={[
                                                { value: 'normal', label: 'Normal' },
                                                { value: 'medium', label: 'Medium' },
                                                { value: 'semibold', label: 'Semibold' },
                                                { value: 'bold', label: 'Bold' },
                                                { value: 'black', label: 'Black' },
                                            ]}
                                            onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, fontWeight: v as any } })}
                                        />
                                    </div>
                                </div>

                                {/* Separator Style */}
                                <SelectInput
                                    label="Separator Style"
                                    value={layer.countdownConfig?.separatorStyle || 'colon'}
                                    options={[
                                        { value: 'colon', label: 'Colon (:)' },
                                        { value: 'dot', label: 'Dot (•)' },
                                        { value: 'line', label: 'Line (|)' },
                                        { value: 'slash', label: 'Slash (/)' },
                                        { value: 'none', label: 'None' },
                                    ]}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, separatorStyle: v as any } })}
                                />

                                {/* Box Styling */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Box Styling</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <NumberInput
                                            label="Radius"
                                            value={layer.countdownConfig?.borderRadius || 12}
                                            min={0}
                                            max={100}
                                            onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, borderRadius: v } })}
                                        />
                                        <NumberInput
                                            label="Padding"
                                            value={layer.countdownConfig?.boxPadding || 16}
                                            min={0}
                                            max={48}
                                            onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, boxPadding: v } })}
                                        />
                                        <NumberInput
                                            label="Gap"
                                            value={layer.countdownConfig?.boxGap || 12}
                                            min={0}
                                            max={40}
                                            onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, boxGap: v } })}
                                        />
                                    </div>
                                </div>

                                {/* Shadow */}
                                <SelectInput
                                    label="Shadow"
                                    value={layer.countdownConfig?.boxShadow || 'none'}
                                    options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'soft', label: 'Soft' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'heavy', label: 'Heavy' },
                                        { value: 'glow', label: 'Glow' },
                                        { value: 'neon', label: 'Neon' },
                                    ]}
                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, boxShadow: v as any } })}
                                />

                                {/* Colors */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Colors</label>
                                    <div className="space-y-2">
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
                                        <ColorInput
                                            label="Background"
                                            value={layer.countdownConfig?.backgroundColor || 'transparent'}
                                            onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, backgroundColor: v } })}
                                        />
                                    </div>
                                </div>

                                {/* Glow Settings (for neon variants) */}
                                {(layer.countdownConfig?.variant === 'neon-glow' ||
                                    layer.countdownConfig?.variant === 'flip-neon' ||
                                    layer.countdownConfig?.variant === 'cyber') && (
                                        <div>
                                            <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Glow Settings</label>
                                            <div className="space-y-2">
                                                <ColorInput
                                                    label="Glow Color"
                                                    value={layer.countdownConfig?.glowColor || '#00ffff'}
                                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, glowColor: v } })}
                                                />
                                                <NumberInput
                                                    label="Glow Intensity"
                                                    value={layer.countdownConfig?.glowIntensity || 100}
                                                    min={0}
                                                    max={100}
                                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, glowIntensity: v } })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                {/* Gradient Settings (for gradient/luxury variants) */}
                                {(layer.countdownConfig?.variant === 'boxed-gradient' ||
                                    layer.countdownConfig?.variant?.startsWith('luxury')) && (
                                        <div>
                                            <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Gradient</label>
                                            <div className="space-y-2">
                                                <ColorInput
                                                    label="Gradient From"
                                                    value={layer.countdownConfig?.gradientFrom || '#667eea'}
                                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, gradientFrom: v } })}
                                                />
                                                <ColorInput
                                                    label="Gradient To"
                                                    value={layer.countdownConfig?.gradientTo || '#764ba2'}
                                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, gradientTo: v } })}
                                                />
                                                <NumberInput
                                                    label="Gradient Angle"
                                                    value={layer.countdownConfig?.gradientAngle || 135}
                                                    min={0}
                                                    max={360}
                                                    onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, gradientAngle: v } })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                {/* Circle Progress Settings */}
                                {layer.countdownConfig?.variant?.startsWith('circle') && (
                                    <div>
                                        <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Progress Ring</label>
                                        <div className="space-y-2">
                                            <ColorInput
                                                label="Progress Color"
                                                value={layer.countdownConfig?.progressColor || '#bfa181'}
                                                onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, progressColor: v } })}
                                            />
                                            <NumberInput
                                                label="Ring Width"
                                                value={layer.countdownConfig?.progressWidth || 4}
                                                min={1}
                                                max={12}
                                                onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, progressWidth: v } })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Animation Settings */}
                                <div>
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Animation</label>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdate({
                                            countdownConfig: {
                                                ...layer.countdownConfig!,
                                                animateOnChange: !layer.countdownConfig?.animateOnChange
                                            }
                                        })}
                                        className={`w-full py-2 rounded-lg text-xs font-medium mb-2 ${layer.countdownConfig?.animateOnChange !== false ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'}`}
                                    >
                                        {layer.countdownConfig?.animateOnChange !== false ? '✓ Animate on Change' : 'Animate on Change'}
                                    </motion.button>
                                    <SelectInput
                                        label="Animation Type"
                                        value={layer.countdownConfig?.animationType || 'fade'}
                                        options={[
                                            { value: 'none', label: 'None' },
                                            { value: 'fade', label: 'Fade' },
                                            { value: 'slide', label: 'Slide' },
                                            { value: 'flip', label: 'Flip' },
                                            { value: 'bounce', label: 'Bounce' },
                                            { value: 'scale', label: 'Scale' },
                                            { value: 'blur', label: 'Blur' },
                                        ]}
                                        onChange={(v) => handleUpdate({ countdownConfig: { ...layer.countdownConfig!, animationType: v as any } })}
                                    />
                                </div>

                                {/* Show Labels Toggle */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate({
                                        countdownConfig: {
                                            ...layer.countdownConfig!,
                                            showLabels: !layer.countdownConfig?.showLabels
                                        }
                                    })}
                                    className={`w-full py-2 rounded-lg text-xs font-medium ${layer.countdownConfig?.showLabels !== false ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'}`}
                                >
                                    {layer.countdownConfig?.showLabels !== false ? '✓ Show Labels' : 'Show Labels'}
                                </motion.button>

                                {/* Show Separators Toggle */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate({
                                        countdownConfig: {
                                            ...layer.countdownConfig!,
                                            showSeparators: !layer.countdownConfig?.showSeparators
                                        }
                                    })}
                                    className={`w-full py-2 rounded-lg text-xs font-medium ${layer.countdownConfig?.showSeparators !== false ? 'bg-premium-accent/20 text-premium-accent' : 'bg-white/5 text-white/60'}`}
                                >
                                    {layer.countdownConfig?.showSeparators !== false ? '✓ Show Separators' : 'Show Separators'}
                                </motion.button>
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

                {/* Love Story Config - Only for love_story elements */}
                {
                    layer.type === 'love_story' && (
                        <SectionComponent title="Love Story Timeline" icon={<Heart className="w-4 h-4 text-premium-accent" />}>
                            <LoveStoryPanel layer={layer} handleUpdate={handleUpdate} />
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
                                    onChange={(v) => handleUpdate({ shapeConfig: { ...layer.shapeConfig!, stroke: v === 'transparent' ? undefined : v } })}
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

                {/* Live Streaming Config */}
                {layer.type === 'live_streaming' && (
                    <SectionComponent title="Live Stream Settings" icon={<Video className="w-4 h-4 text-rose-500" />}>
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Stream Title</label>
                                <input
                                    type="text"
                                    value={layer.liveStreamingConfig?.title || ''}
                                    onChange={(e) => handleUpdate({ liveStreamingConfig: { ...layer.liveStreamingConfig!, title: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    placeholder="Wedding Live Stream"
                                />
                            </div>

                            {/* URL */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Live URL</label>
                                <input
                                    type="text"
                                    value={layer.liveStreamingConfig?.url || ''}
                                    onChange={(e) => handleUpdate({ liveStreamingConfig: { ...layer.liveStreamingConfig!, url: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                    placeholder="https://youtube.com/live/..."
                                />
                            </div>

                            {/* Platform */}
                            <SelectInput
                                label="Platform"
                                value={layer.liveStreamingConfig?.platform || 'other'}
                                options={[
                                    { value: 'youtube', label: 'YouTube' },
                                    { value: 'instagram', label: 'Instagram' },
                                    { value: 'zoom', label: 'Zoom' },
                                    { value: 'meet', label: 'Google Meet' },
                                    { value: 'tiktok', label: 'TikTok' },
                                    { value: 'twitch', label: 'Twitch' },
                                    { value: 'other', label: 'Other' }
                                ]}
                                onChange={(v) => handleUpdate({ liveStreamingConfig: { ...layer.liveStreamingConfig!, platform: v as any } })}
                            />

                            {/* Start Time */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={layer.liveStreamingConfig?.startTime?.slice(0, 16) || ''}
                                    onChange={(e) => handleUpdate({
                                        liveStreamingConfig: {
                                            ...layer.liveStreamingConfig!,
                                            startTime: e.target.value ? new Date(e.target.value).toISOString() : ''
                                        }
                                    })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                                />
                            </div>

                            {/* Theme Color */}
                            <ColorInput
                                label="Accent/Background"
                                value={layer.liveStreamingConfig?.themeColor || '#14b8a6'}
                                onChange={(v) => handleUpdate({ liveStreamingConfig: { ...layer.liveStreamingConfig!, themeColor: v } })}
                            />

                            {/* Live Status Toggle */}
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-white/30 uppercase font-bold">Is Live Now</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate({ liveStreamingConfig: { ...layer.liveStreamingConfig!, isLive: !layer.liveStreamingConfig?.isLive } })}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${layer.liveStreamingConfig?.isLive ? 'bg-rose-500' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        animate={{ x: layer.liveStreamingConfig?.isLive ? 20 : 2 }}
                                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Interaction Config - Only for interaction elements */}
                {
                    layer.type === 'interaction' && (
                        <SectionComponent title="Interaction Setup" icon={<Zap className="w-4 h-4 text-premium-accent" />}>
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-premium-accent/10 border border-premium-accent/20">
                                    <div className="flex items-start gap-2">
                                        <Zap className="w-4 h-4 text-premium-accent mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-bold text-premium-accent">Cinematic Trigger</h4>
                                            <p className="text-[10px] text-white/60 leading-relaxed mt-1">
                                                This element is invisible on the live site but clickable. When clicked, it triggers a fullscreen effect and reveals the guest's name.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Trigger Method */}
                                <SelectInput
                                    label="Trigger Method"
                                    value={layer.interactionConfig?.triggerType || 'click'}
                                    options={[
                                        { value: 'click', label: '👆 On Click/Tap' },
                                        { value: 'hover', label: '🖱️ On Hover' },
                                        { value: 'auto', label: '⚡ Auto (On Load)' }
                                    ]}
                                    onChange={(v) => handleUpdate({ interactionConfig: { ...layer.interactionConfig!, triggerType: v as any } })}
                                />

                                {/* Effect Selection */}
                                <SelectInput
                                    label="Visual Effect"
                                    value={layer.interactionConfig?.effect || 'confetti'}
                                    options={[
                                        { value: 'confetti', label: '🎉 Confetti' },
                                        { value: 'gold_rain', label: '💰 Golden Rain' },
                                        { value: 'rose_petals', label: '🌹 Rose Petals' },
                                        { value: 'snow', label: '❄️ Snow' },
                                        { value: 'matrix', label: '📟 Digital Matrix' },
                                        { value: 'stars', label: '⭐ Stars' },
                                        { value: 'hearts', label: '❤️ Hearts' },
                                        { value: 'fireworks', label: '🚀 Fireworks' }
                                    ]}
                                    onChange={(v) => handleUpdate({ interactionConfig: { ...layer.interactionConfig!, effect: v as any } })}
                                />

                                {/* Greeting Style */}
                                <SelectInput
                                    label="Greeting Style"
                                    value={layer.interactionConfig?.greetingStyle || 'cinematic'}
                                    options={[
                                        { value: 'cinematic', label: '🎬 Cinematic Typography' },
                                        { value: 'simple', label: '📝 Simple Text' },
                                        { value: 'none', label: '🚫 No Text (Effect Only)' }
                                    ]}
                                    onChange={(v) => handleUpdate({ interactionConfig: { ...layer.interactionConfig!, greetingStyle: v as any } })}
                                />

                                {/* Duration */}
                                <NumberInput
                                    label="Effect Duration (ms)"
                                    value={layer.interactionConfig?.duration || 5000}
                                    min={1000}
                                    max={10000}
                                    step={500}
                                    onChange={(v) => handleUpdate({ interactionConfig: { ...layer.interactionConfig!, duration: v } })}
                                />

                                {/* Test Name Input */}
                                <div>
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2 block">Test Name</label>
                                    <input
                                        type="text"
                                        value={layer.interactionConfig?.testName || 'Guest Name'}
                                        onChange={(e) => handleUpdate({ interactionConfig: { ...layer.interactionConfig!, testName: e.target.value } })}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-premium-accent/50 focus:ring-1 focus:ring-premium-accent/20"
                                        placeholder="Enter guest name for testing"
                                    />
                                </div>

                                {/* Click Instruction */}
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                    <div className="text-[10px] text-white/60 mb-1">💡 Cara Test</div>
                                    <div className="text-xs text-white/80 font-medium">Klik elemen Blast di canvas untuk melihat efek</div>
                                </div>
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Name Board Config - Only for name_board elements */}
                {
                    layer.type === 'name_board' && (
                        <SectionComponent title="Name Board Setup" icon={<Users className="w-4 h-4 text-amber-400" />}>
                            <div className="space-y-4">
                                {/* Variant Gallery */}
                                <div>
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2 block">Style Variant</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {Array.from({ length: 27 }, (_, i) => i + 1).map((v) => {
                                            const variants = [
                                                { id: 1, name: 'Classic Elegant', bg: '#1a1a2e', text: '#f8f9fa' },
                                                { id: 2, name: 'Classic Light', bg: '#ffffff', text: '#2d3436' },
                                                { id: 3, name: 'Classic Gold', bg: '#0a0a0a', text: '#d4af37' },
                                                { id: 4, name: 'Classic Rose', bg: '#fff5f5', text: '#c53030' },
                                                { id: 5, name: 'Classic Navy', bg: '#1a365d', text: '#ffffff' },
                                                { id: 6, name: 'Frosted Glass', bg: 'rgba(255,255,255,0.1)', text: '#ffffff' },
                                                { id: 7, name: 'Dark Glass', bg: 'rgba(0,0,0,0.3)', text: '#ffffff' },
                                                { id: 8, name: 'Blue Glass', bg: 'rgba(59,130,246,0.2)', text: '#ffffff' },
                                                { id: 9, name: 'Purple Glass', bg: 'rgba(139,92,246,0.2)', text: '#ffffff' },
                                                { id: 10, name: 'Rose Glass', bg: 'rgba(244,63,94,0.15)', text: '#ffffff' },
                                                { id: 11, name: 'Neon Cyan', bg: '#0a0a0a', text: '#00ffff' },
                                                { id: 12, name: 'Neon Pink', bg: '#0a0a0a', text: '#ff00ff' },
                                                { id: 13, name: 'Neon Green', bg: '#0a0a0a', text: '#00ff00' },
                                                { id: 14, name: 'Neon Orange', bg: '#0a0a0a', text: '#ff6600' },
                                                { id: 15, name: 'Neon Blue', bg: '#0a0a0a', text: '#0066ff' },
                                                { id: 16, name: 'VIP Badge', bg: 'linear-gradient(135deg, #d4af37, #f4e4a6)', text: '#1a1a1a' },
                                                { id: 17, name: 'Premium Badge', bg: 'linear-gradient(135deg, #667eea, #764ba2)', text: '#ffffff' },
                                                { id: 18, name: 'Royal Badge', bg: 'linear-gradient(135deg, #1a1a2e, #4a4a6a)', text: '#d4af37' },
                                                { id: 19, name: 'Coral Badge', bg: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)', text: '#ffffff' },
                                                { id: 20, name: 'Ocean Badge', bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', text: '#ffffff' },
                                                { id: 21, name: 'Black Tie', bg: '#000000', text: '#d4af37' },
                                                { id: 22, name: 'Champagne', bg: '#f5f5dc', text: '#8b7355' },
                                                { id: 23, name: 'Velvet Red', bg: '#800020', text: '#ffd700' },
                                                { id: 24, name: 'Midnight Sparkle', bg: '#0c0c1e', text: '#e8e8e8' },
                                                { id: 25, name: 'Pure White', bg: '#ffffff', text: '#000000' },
                                                { id: 26, name: 'Pure Black', bg: '#000000', text: '#ffffff' },
                                                { id: 27, name: 'Soft Gray', bg: '#f0f0f0', text: '#333333' },
                                            ];
                                            const preset = variants.find(p => p.id === v) || variants[0];
                                            const isSelected = (layer.nameBoardConfig?.variant || 1) === v;
                                            return (
                                                <button
                                                    key={v}
                                                    onClick={() => handleUpdate({
                                                        nameBoardConfig: {
                                                            ...layer.nameBoardConfig!,
                                                            variant: v,
                                                            backgroundColor: preset.bg,
                                                            textColor: preset.text
                                                        }
                                                    })}
                                                    className={`p-2 rounded-lg border transition-all text-center ${isSelected ? 'border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/50' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                                    style={{ background: preset.bg.includes('gradient') ? preset.bg : preset.bg }}
                                                >
                                                    <div className="text-[8px] font-bold truncate" style={{ color: preset.text }}>{preset.name}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Display Text */}
                                <div>
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2 block">Preview Text</label>
                                    <input
                                        type="text"
                                        value={layer.nameBoardConfig?.displayText || 'Guest Name'}
                                        onChange={(e) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, displayText: e.target.value } })}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                                        placeholder="Guest Name"
                                    />
                                </div>

                                {/* Font Selection */}
                                <SelectInput
                                    label="Font Family"
                                    value={layer.nameBoardConfig?.fontFamily || 'Playfair Display'}
                                    isFontPicker={true}
                                    options={[
                                        { value: 'Playfair Display', label: 'Playfair Display' },
                                        { value: 'Great Vibes', label: 'Great Vibes' },
                                        { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
                                        { value: 'Montserrat', label: 'Montserrat' },
                                        { value: 'Outfit', label: 'Outfit' },
                                        { value: 'Inter', label: 'Inter' },
                                        { value: 'Poppins', label: 'Poppins' },
                                    ]}
                                    onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, fontFamily: v } })}
                                />

                                {/* Font Size */}
                                <NumberInput
                                    label="Font Size"
                                    value={layer.nameBoardConfig?.fontSize || 48}
                                    min={12}
                                    max={120}
                                    step={2}
                                    onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, fontSize: v } })}
                                />

                                {/* Colors */}
                                <div className="grid grid-cols-2 gap-3">
                                    <ColorInput
                                        label="Text Color"
                                        value={layer.nameBoardConfig?.textColor || '#f8f9fa'}
                                        onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, textColor: v } })}
                                    />
                                    <ColorInput
                                        label="Background"
                                        value={layer.nameBoardConfig?.backgroundColor || '#1a1a2e'}
                                        onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, backgroundColor: v } })}
                                    />
                                </div>

                                {/* Border */}
                                <div className="grid grid-cols-2 gap-3">
                                    <ColorInput
                                        label="Border Color"
                                        value={layer.nameBoardConfig?.borderColor || '#4a4a6a'}
                                        onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, borderColor: v } })}
                                    />
                                    <NumberInput
                                        label="Border Width"
                                        value={layer.nameBoardConfig?.borderWidth || 2}
                                        min={0}
                                        max={10}
                                        step={1}
                                        onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, borderWidth: v } })}
                                    />
                                </div>

                                {/* Border Radius */}
                                <NumberInput
                                    label="Corner Radius"
                                    value={layer.nameBoardConfig?.borderRadius || 16}
                                    min={0}
                                    max={50}
                                    step={2}
                                    onChange={(v) => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, borderRadius: v } })}
                                />

                                {/* Shadow Toggle */}
                                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <span className="text-xs font-medium text-white/80">Enable Shadow</span>
                                    <button
                                        onClick={() => handleUpdate({ nameBoardConfig: { ...layer.nameBoardConfig!, shadowEnabled: !layer.nameBoardConfig?.shadowEnabled } })}
                                        className={`w-10 h-5 rounded-full transition-colors ${layer.nameBoardConfig?.shadowEnabled ? 'bg-amber-500' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${layer.nameBoardConfig?.shadowEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </SectionComponent>
                    )
                }

                {/* Digital Gift (Angpao) Settings */}
                {layer.type === 'digital_gift' && (
                    <SectionComponent title="Angpao Settings" icon={<Gift className="w-4 h-4 text-red-400" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={layer.digitalGiftConfig?.title || 'Kado Digital'}
                                    onChange={(e) => handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, title: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white"
                                />
                            </div>
                            <SelectInput
                                label="Bank Name"
                                value={((layer.digitalGiftConfig?.bankName && SUPPORTED_BANKS.find(b => b.name === layer.digitalGiftConfig?.bankName)) ? layer.digitalGiftConfig.bankName : 'other') as string}
                                options={[
                                    ...SUPPORTED_BANKS.map(bank => ({ value: bank.name, label: bank.name })),
                                    { value: 'other', label: 'Other / Custom Bank' }
                                ]}
                                onChange={(v) => {
                                    if (v === 'other') {
                                        handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, bankName: 'Custom Bank' } });
                                    } else {
                                        handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, bankName: v } });
                                    }
                                }}
                            />
                            {(!SUPPORTED_BANKS.find(b => b.name === layer.digitalGiftConfig?.bankName)) && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Custom Bank Name</label>
                                    <input
                                        type="text"
                                        value={layer.digitalGiftConfig?.bankName || ''}
                                        onChange={(e) => handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, bankName: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white"
                                        placeholder="Enter Bank Name"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Account Number</label>
                                <input
                                    type="text"
                                    value={layer.digitalGiftConfig?.accountNumber || ''}
                                    onChange={(e) => handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, accountNumber: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white"
                                    placeholder="1234567890"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Account Holder</label>
                                <input
                                    type="text"
                                    value={layer.digitalGiftConfig?.accountHolder || ''}
                                    onChange={(e) => handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, accountHolder: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <ColorInput
                                    label="Custom Card Color"
                                    value={layer.digitalGiftConfig?.customColor || ''}
                                    onChange={(v) => handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, customColor: v } })}
                                />
                            </div>

                            <SelectInput
                                label="Theme Preset"
                                value={layer.digitalGiftConfig?.theme || 'gold'}
                                options={[
                                    { value: 'gold', label: 'Gold Premium' },
                                    { value: 'silver', label: 'Silver Elegant' },
                                    { value: 'glass', label: 'Glassmorphism' }
                                ]}
                                onChange={(v) => handleUpdate({ digitalGiftConfig: { ...layer.digitalGiftConfig!, theme: v as any } })}
                            />
                        </div>
                    </SectionComponent>
                )}

                {/* Gift Address Settings */}
                {layer.type === 'gift_address' && (
                    <SectionComponent title="Gift Address Settings" icon={<Home className="w-4 h-4 text-emerald-400" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Recipient Name</label>
                                <input
                                    type="text"
                                    value={layer.giftAddressConfig?.recipientName || ''}
                                    onChange={(e) => handleUpdate({ giftAddressConfig: { ...layer.giftAddressConfig!, recipientName: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white"
                                    placeholder="Nama Penerima"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Full Address</label>
                                <textarea
                                    value={layer.giftAddressConfig?.address || ''}
                                    onChange={(e) => handleUpdate({ giftAddressConfig: { ...layer.giftAddressConfig!, address: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white resize-none"
                                    rows={4}
                                    placeholder="Alamat lengkap pengiriman..."
                                />
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <ColorInput
                                    label="Custom Card Color"
                                    value={layer.giftAddressConfig?.customColor || ''}
                                    onChange={(v) => handleUpdate({ giftAddressConfig: { ...layer.giftAddressConfig!, customColor: v } })}
                                />
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Social Mockup Settings */}
                {layer.type === 'social_mockup' && (
                    <SectionComponent title="Social Link Settings" icon={<Share2 className="w-4 h-4 text-sky-400" />}>
                        <div className="space-y-4">
                            <SelectInput
                                label="Platform"
                                value={layer.socialMockupConfig?.platform || 'instagram'}
                                options={[
                                    { value: 'instagram', label: 'Instagram' },
                                    { value: 'twitter', label: 'Twitter' },
                                    { value: 'tiktok', label: 'TikTok' },
                                    { value: 'whatsapp', label: 'WhatsApp' },
                                    { value: 'other', label: 'Other/Custom' }
                                ]}
                                onChange={(v) => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, platform: v as any } })}
                            />
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">Username / ID</label>
                                <input
                                    type="text"
                                    value={layer.socialMockupConfig?.username || ''}
                                    onChange={(e) => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, username: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none text-white"
                                    placeholder="tamuu.id"
                                />
                            </div>
                            <SelectInput
                                label="Background Variant"
                                value={layer.socialMockupConfig?.variant || 'luxury'}
                                options={[
                                    { value: 'luxury', label: 'Luxury (Premium)' },
                                    { value: 'solid', label: 'Solid White' },
                                    { value: 'transparent', label: 'Transparent (No BG)' }
                                ]}
                                onChange={(v) => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, variant: v as any } })}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-white/30 uppercase font-bold">Show Platform Icon</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, showIcon: !(layer.socialMockupConfig?.showIcon ?? true) } })}
                                    className={`w-10 h-5 rounded-full transition-colors ${layer.socialMockupConfig?.showIcon !== false ? 'bg-premium-accent' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: layer.socialMockupConfig?.showIcon !== false ? 22 : 2 }}
                                    />
                                </motion.button>
                            </div>

                            <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10 mt-2">
                                <h4 className="text-[8px] text-white/40 uppercase font-bold">Typography</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectInput
                                        label="Font Family"
                                        value={layer.socialMockupConfig?.fontFamily || 'Inter'}
                                        options={SUPPORTED_FONTS.map(f => ({ value: f.name, label: f.name }))}
                                        isFontPicker
                                        onChange={(v) => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, fontFamily: v } })}
                                    />
                                    <NumberInput
                                        label="Font Size"
                                        value={layer.socialMockupConfig?.fontSize || 18}
                                        onChange={(v) => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, fontSize: v } })}
                                    />
                                </div>
                                <ColorInput
                                    label="Text Color"
                                    value={layer.socialMockupConfig?.textColor || '#ffffff'}
                                    onChange={(v) => handleUpdate({ socialMockupConfig: { ...layer.socialMockupConfig!, textColor: v } })}
                                />
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* Permissions & Visibility - Mandatory for Master Templates (Admin Only) */}
                {isTemplate && (
                    <SectionComponent title="Permissions & Visibility" icon={<Shield className="w-4 h-4 text-orange-400" />}>
                        <div className="space-y-4">
                            <p className="text-[10px] text-white/40 italic leading-relaxed">
                                Control what the end-user can see and modify in their own editor.
                            </p>

                            <div className="space-y-3">
                                {[
                                    { key: 'isVisibleInUserEditor', label: 'Visible in User Editor' },
                                    { key: 'canEditContent', label: 'Can Edit Content/Text' },
                                    { key: 'canEditImage', label: 'Can Edit Image/Media' },
                                    { key: 'canEditStyle', label: 'Can Edit Styling' },
                                    { key: 'canEditPosition', label: 'Can Edit Position' },
                                    { key: 'canDelete', label: 'Can User Delete' },
                                ].map((perm) => (
                                    <div key={perm.key} className="flex items-center justify-between">
                                        <span className="text-[10px] text-white/70">{perm.label}</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate({
                                                permissions: {
                                                    ...(layer.permissions || {}),
                                                    [perm.key]: !(layer.permissions?.[perm.key as keyof LayerPermissions] ?? true)
                                                }
                                            })}
                                            className={`w-10 h-5 rounded-full transition-colors ${(layer.permissions?.[perm.key as keyof LayerPermissions] ?? true) ? 'bg-orange-500' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                                                animate={{ x: (layer.permissions?.[perm.key as keyof LayerPermissions] ?? true) ? 22 : 2 }}
                                            />
                                        </motion.button>
                                    </div>
                                ))}
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

                {/* Photo Grid Config */}
                {layer.type === 'photo_grid' && layer.photoGridConfig && (
                    <SectionComponent title="Photo Grid Settings" icon={<Layout className="w-4 h-4 text-blue-400" />}>
                        <div className="space-y-4">
                            <SelectInput
                                label="Layout Variant"
                                value={layer.photoGridConfig.variant || 'quad'}
                                options={[
                                    { value: 'single', label: 'Single' },
                                    { value: 'split-h', label: 'Split Horizontal' },
                                    { value: 'split-v', label: 'Split Vertical' },
                                    { value: 'quad', label: 'Quad (2x2)' },
                                    { value: 'triple-h', label: 'Triple Horizontal' },
                                    { value: 'hero-left', label: 'Hero Left' },
                                    { value: 'hero-right', label: 'Hero Right' },
                                    { value: 'mosaic', label: 'Mosaic' },
                                    { value: 'featured', label: 'Featured' },
                                    { value: 'cluster', label: 'Cluster' }
                                ]}
                                onChange={(v) => handleUpdate({ photoGridConfig: { ...layer.photoGridConfig!, variant: v as any } })}
                            />
                            <NumberInput
                                label="Gap (px)"
                                value={layer.photoGridConfig.gap ?? 8}
                                min={0}
                                onChange={(v) => handleUpdate({ photoGridConfig: { ...layer.photoGridConfig!, gap: v } })}
                            />
                            <NumberInput
                                label="Corner Radius"
                                value={layer.photoGridConfig.cornerRadius ?? 12}
                                min={0}
                                onChange={(v) => handleUpdate({ photoGridConfig: { ...layer.photoGridConfig!, cornerRadius: v } })}
                            />
                            <div className="space-y-2">
                                <label className="text-[9px] text-white/30 uppercase font-bold block">Images (click to upload)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[0, 1, 2, 3].map((idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors relative overflow-hidden group"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (!file) return;
                                                    // Read file as data URL and open crop modal
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const imageSrc = event.target?.result as string;
                                                        if (imageSrc && layer.id) {
                                                            openImageCropModal(imageSrc, layer.id, idx, 1);
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                };
                                                input.click();
                                            }}
                                        >
                                            {layer.photoGridConfig?.images?.[idx] ? (
                                                <img src={layer.photoGridConfig?.images[idx]} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-white/20" />
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[9px] text-white/80">Slot {idx + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-white/30 italic">Upload images for each grid slot.</p>
                            </div>
                        </div>
                    </SectionComponent>
                )}

                {/* RSVP Wishes Settings */}
                {layer?.type === 'rsvp_wishes' && (
                    <SectionComponent title="RSVP & Wishes Settings" icon={<MessageSquare className="w-4 h-4" />}>
                        <div className="space-y-4">
                            {/* Variant Selector */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-2">Design Variant</label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {Object.values(RSVP_VARIANTS).map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => handleUpdate({
                                                rsvpWishesConfig: {
                                                    ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                                    style: variant.id,
                                                    variant: variant.id,
                                                    primaryColor: variant.accentColor
                                                }
                                            })}
                                            className={`p-2 rounded-lg text-left transition-all ${(layer.rsvpWishesConfig?.style || layer.rsvpWishesConfig?.variant || 'modern') === variant.id
                                                ? 'ring-2 ring-premium-accent bg-white/10'
                                                : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="text-[10px] font-semibold text-white/90">{variant.name}</div>
                                            <div className="text-[8px] text-white/40 capitalize">{(variant as any).category}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form Title */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-1">Form Title</label>
                                <input
                                    type="text"
                                    value={layer.rsvpWishesConfig?.title || 'Konfirmasi Kehadiran'}
                                    onChange={(e) => handleUpdate({
                                        rsvpWishesConfig: {
                                            ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                            title: e.target.value
                                        }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                />
                            </div>

                            {/* Wishes Title */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-1">Wishes Title</label>
                                <input
                                    type="text"
                                    value={layer.rsvpWishesConfig?.wishesTitle || 'Ucapan & Doa'}
                                    onChange={(e) => handleUpdate({
                                        rsvpWishesConfig: {
                                            ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                            wishesTitle: e.target.value
                                        }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                />
                            </div>

                            {/* Form Fields Toggle */}
                            <div>
                                <label className="text-[9px] text-white/30 uppercase font-bold block mb-2">Show Fields</label>
                                <div className="space-y-2">
                                    {[
                                        { key: 'showNameField', label: 'Name Field' },
                                        { key: 'showPhoneField', label: 'Phone/WhatsApp' },
                                        { key: 'showEmailField', label: 'Email Field' },
                                        { key: 'showAttendanceField', label: 'Attendance Options' },
                                        { key: 'showGuestCountField', label: 'Guest Count' },
                                        { key: 'showMessageField', label: 'Message/Wishes' },
                                        { key: 'showMealPreference', label: 'Meal Preference' },
                                        { key: 'showSongRequest', label: 'Song Request' },
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-[10px] text-white/70 group-hover:text-white transition-colors">{label}</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={(layer.rsvpWishesConfig as any)?.[key] ?? (DEFAULT_RSVP_WISHES_CONFIG as any)[key]}
                                                    onChange={(e) => handleUpdate({
                                                        rsvpWishesConfig: {
                                                            ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                                            [key]: e.target.checked
                                                        }
                                                    })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-8 h-4 bg-white/10 rounded-full peer-checked:bg-premium-accent/50 transition-colors" />
                                                <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white/50 rounded-full peer-checked:translate-x-4 peer-checked:bg-premium-accent transition-all" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Wishes Layout */}
                            <SelectInput
                                label="Wishes Layout"
                                value={layer.rsvpWishesConfig?.wishesLayout || 'list'}
                                options={[
                                    { value: 'list', label: 'List' },
                                    { value: 'grid', label: 'Grid (2 columns)' },
                                    { value: 'masonry', label: 'Masonry' },
                                    { value: 'carousel', label: 'Carousel' },
                                    { value: 'ticker', label: 'Ticker (Auto-scroll)' }
                                ]}
                                onChange={(v) => handleUpdate({
                                    rsvpWishesConfig: {
                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                        wishesLayout: v as any
                                    }
                                })}
                            />

                            {/* Wishes Card Style */}
                            <SelectInput
                                label="Wish Card Style"
                                value={layer.rsvpWishesConfig?.wishCardStyle || 'glass'}
                                options={[
                                    { value: 'minimal', label: 'Minimal' },
                                    { value: 'bordered', label: 'Bordered' },
                                    { value: 'shadow', label: 'Shadow' },
                                    { value: 'glass', label: 'Glassmorphism' }
                                ]}
                                onChange={(v) => handleUpdate({
                                    rsvpWishesConfig: {
                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                        wishCardStyle: v as any
                                    }
                                })}
                            />

                            {/* Max Wishes Display */}
                            <NumberInput
                                label="Max Wishes to Display"
                                value={layer.rsvpWishesConfig?.wishesMaxDisplay || 50}
                                min={5}
                                onChange={(v) => handleUpdate({
                                    rsvpWishesConfig: {
                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                        wishesMaxDisplay: v
                                    }
                                })}
                            />

                            {/* Show Options */}
                            <div className="space-y-2">
                                {[
                                    { key: 'showWishTimestamp', label: 'Show Timestamp' },
                                    { key: 'showWishAvatar', label: 'Show Avatar' },
                                    { key: 'wishesAutoScroll', label: 'Auto-scroll Wishes' },
                                    { key: 'requireMessage', label: 'Require Message' },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[10px] text-white/70 group-hover:text-white transition-colors">{label}</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={(layer.rsvpWishesConfig as any)?.[key] ?? (DEFAULT_RSVP_WISHES_CONFIG as any)[key]}
                                                onChange={(e) => handleUpdate({
                                                    rsvpWishesConfig: {
                                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                                        [key]: e.target.checked
                                                    }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-8 h-4 bg-white/10 rounded-full peer-checked:bg-premium-accent/50 transition-colors" />
                                            <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white/50 rounded-full peer-checked:translate-x-4 peer-checked:bg-premium-accent transition-all" />
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Styling */}
                            <ColorInput
                                label="Primary Color"
                                value={layer.rsvpWishesConfig?.primaryColor || '#bfa181'}
                                onChange={(v) => handleUpdate({
                                    rsvpWishesConfig: {
                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                        primaryColor: v
                                    }
                                })}
                            />

                            <ColorInput
                                label="Text Color"
                                value={layer.rsvpWishesConfig?.textColor || '#ffffff'}
                                onChange={(v) => handleUpdate({
                                    rsvpWishesConfig: {
                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                        textColor: v
                                    }
                                })}
                            />

                            <NumberInput
                                label="Border Radius"
                                value={layer.rsvpWishesConfig?.borderRadius || 12}
                                min={0}
                                onChange={(v) => handleUpdate({
                                    rsvpWishesConfig: {
                                        ...(layer.rsvpWishesConfig || DEFAULT_RSVP_WISHES_CONFIG),
                                        borderRadius: v
                                    }
                                })}
                            />
                        </div>
                    </SectionComponent>
                )}

                {/* Effects & Filters - Enterprise Suite */}
                <SectionComponent title="Effects & Filters" icon={<Sliders className="w-4 h-4 text-premium-accent" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <RangeInput
                                label="Brightness"
                                value={layer.filters?.brightness ?? 100}
                                min={0}
                                max={200}
                                onChange={(v) => handleUpdate({ filters: { ...layer.filters, brightness: v } })}
                            />
                            <RangeInput
                                label="Contrast"
                                value={layer.filters?.contrast ?? 100}
                                min={0}
                                max={200}
                                onChange={(v) => handleUpdate({ filters: { ...layer.filters, contrast: v } })}
                            />
                            <RangeInput
                                label="Saturation"
                                value={layer.filters?.saturate ?? 100}
                                min={0}
                                max={200}
                                onChange={(v) => handleUpdate({ filters: { ...layer.filters, saturate: v } })}
                            />
                            <RangeInput
                                label="Blur"
                                value={layer.filters?.blur ?? 0}
                                min={0}
                                max={20}
                                step={0.5}
                                onChange={(v) => handleUpdate({ filters: { ...layer.filters, blur: v } })}
                            />
                        </div>

                        {/* Advanced Filters Toggle */}
                        <div className="pt-2 border-t border-white/5">
                            <details className="group/adv">
                                <summary className="flex items-center justify-between cursor-pointer list-none text-[9px] text-white/30 uppercase font-bold hover:text-white/60 transition-colors">
                                    <span>Advanced Filters</span>
                                    <ChevronDown className="w-3 h-3 group-open/adv:rotate-180 transition-transform" />
                                </summary>
                                <div className="space-y-4 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <RangeInput
                                        label="Hue Rotate"
                                        value={layer.filters?.hueRotate ?? 0}
                                        min={0}
                                        max={360}
                                        onChange={(v) => handleUpdate({ filters: { ...layer.filters, hueRotate: v } })}
                                    />
                                    <RangeInput
                                        label="Greyscale"
                                        value={layer.filters?.grayscale ?? 0}
                                        min={0}
                                        max={100}
                                        onChange={(v) => handleUpdate({ filters: { ...layer.filters, grayscale: v } })}
                                    />
                                    <RangeInput
                                        label="Sepia"
                                        value={layer.filters?.sepia ?? 0}
                                        min={0}
                                        max={100}
                                        onChange={(v) => handleUpdate({ filters: { ...layer.filters, sepia: v } })}
                                    />
                                    <RangeInput
                                        label="Invert"
                                        value={layer.filters?.invert ?? 0}
                                        min={0}
                                        max={100}
                                        onChange={(v) => handleUpdate({ filters: { ...layer.filters, invert: v } })}
                                    />
                                </div>
                            </details>
                        </div>
                    </div>
                </SectionComponent>

                {/* Borders & Shadows - Premium Framing */}
                <SectionComponent title="Border & Frame" icon={<Square className="w-4 h-4 text-premium-accent" />}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                                label="Radius"
                                value={layer.borderRadius ?? 0}
                                min={0}
                                onChange={(v) => handleUpdate({ borderRadius: v })}
                            />
                            <NumberInput
                                label="Weight"
                                value={layer.borderWidth ?? 0}
                                min={0}
                                onChange={(v) => handleUpdate({ borderWidth: v })}
                            />
                        </div>
                        {(layer.borderWidth || 0) > 0 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <SelectInput
                                    label="Style"
                                    value={layer.borderStyle || 'solid'}
                                    options={[
                                        { value: 'solid', label: 'Solid' },
                                        { value: 'dashed', label: 'Dashed' },
                                        { value: 'dotted', label: 'Dotted' }
                                    ]}
                                    onChange={(v) => handleUpdate({ borderStyle: v as any })}
                                />
                                <ColorInput
                                    label="Border Color"
                                    value={layer.borderColor || '#ffffff'}
                                    onChange={(v) => handleUpdate({ borderColor: v })}
                                />
                            </div>
                        )}
                    </div>
                </SectionComponent>

                <SectionComponent title="Shadow Engine" icon={<Sparkles className="w-4 h-4 text-premium-accent" />}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-white/40 italic">Drop Shadow Controls</span>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate({
                                    shadow: layer.shadow ? undefined : {
                                        color: 'rgba(0,0,0,0.5)',
                                        blur: 10,
                                        x: 0,
                                        y: 4,
                                        spread: 0
                                    }
                                })}
                                className={`w-10 h-5 rounded-full transition-colors ${layer.shadow ? 'bg-premium-accent' : 'bg-white/10'}`}
                            >
                                <motion.div
                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    animate={{ x: layer.shadow ? 22 : 2 }}
                                />
                            </motion.button>
                        </div>

                        {layer.shadow && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                <ColorInput
                                    label="Shadow Color"
                                    value={layer.shadow.color}
                                    onChange={(v) => handleUpdate({ shadow: { ...layer.shadow!, color: v } })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <NumberInput
                                        label="Offset X"
                                        value={layer.shadow.x}
                                        onChange={(v) => handleUpdate({ shadow: { ...layer.shadow!, x: v } })}
                                    />
                                    <NumberInput
                                        label="Offset Y"
                                        value={layer.shadow.y}
                                        onChange={(v) => handleUpdate({ shadow: { ...layer.shadow!, y: v } })}
                                    />
                                </div>
                                <RangeInput
                                    label="Blur Radius"
                                    value={layer.shadow.blur}
                                    min={0}
                                    max={50}
                                    onChange={(v) => handleUpdate({ shadow: { ...layer.shadow!, blur: v } })}
                                />
                            </div>
                        )}
                    </div>
                </SectionComponent>

                {/* Animation Section */}

                <SectionComponent title="Entrance Animation" icon={<Zap className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <SelectInput
                            label="Trigger"
                            value={((layer.animation?.entrance as any)?.trigger) || layer.animation?.trigger || 'scroll'}
                            options={[
                                { value: 'scroll', label: 'On Scroll' },
                                { value: 'load', label: 'On Load' },
                                { value: 'click', label: 'On Click' },
                                { value: 'open_btn', label: 'On Open Button' }
                            ]}
                            onChange={(v) => handleUpdate({
                                animation: {
                                    ...layer.animation,
                                    entrance: {
                                        ...(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance : { type: (layer.animation?.entrance as any) || 'none' }),
                                        trigger: v as any
                                    }
                                }
                            })}
                        />
                        <SelectInput
                            label="Animation Type"
                            value={(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance.type : layer.animation?.entrance) || 'none'}
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
                                { value: 'blur-in', label: 'Blur In' },
                                { value: 'twirl-in', label: 'Twirl In (Premium ✨)' }
                            ]}
                            onChange={(v) => handleUpdate({
                                animation: {
                                    ...layer.animation,
                                    entrance: {
                                        ...(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance : {}),
                                        type: v as AnimationType
                                    }
                                }
                            })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                                label="Delay (ms)"
                                value={(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance.delay : layer.animation?.delay) || 0}
                                onChange={(v) => handleUpdate({
                                    animation: {
                                        ...layer.animation,
                                        entrance: {
                                            ...(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance : {}),
                                            delay: Math.min(v, 10000)
                                        }
                                    }
                                })}
                            />
                            <NumberInput
                                label="Duration (ms)"
                                value={(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance.duration : layer.animation?.duration) || 800}
                                onChange={(v) => handleUpdate({
                                    animation: {
                                        ...layer.animation,
                                        entrance: {
                                            ...(typeof layer.animation?.entrance === 'object' ? layer.animation.entrance : {}),
                                            duration: Math.min(v, 10000)
                                        }
                                    }
                                })}
                            />
                        </div>
                    </div>
                </SectionComponent>

                <SectionComponent title="Looping Animation" icon={<Zap className="w-4 h-4" />}>
                    <div className="space-y-4">
                        <SelectInput
                            label="Trigger"
                            value={((layer.animation?.loop as any)?.trigger) || 'load'}
                            options={[
                                { value: 'load', label: 'Continuous' },
                                { value: 'click', label: 'On Click' },
                                { value: 'scroll', label: 'While Visible' },
                                { value: 'open_btn', label: 'After Open' }
                            ]}
                            onChange={(v) => handleUpdate({
                                animation: {
                                    ...layer.animation,
                                    loop: {
                                        ...(layer.animation?.loop || { type: (layer.animation as any)?.looping || 'none' }),
                                        trigger: v as any
                                    }
                                }
                            })}
                        />
                        <SelectInput
                            label="Loop Type"
                            value={(typeof layer.animation?.loop === 'object' ? layer.animation.loop.type : (layer.animation as any)?.looping) || 'none'}
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
                                { value: 'fly-random', label: '🎲 Gerakan Acak' },
                                { value: 'twirl', label: '🌀 Twirl & Scale (Premium)' }
                            ]}
                            onChange={(v) => handleUpdate({
                                animation: {
                                    ...layer.animation,
                                    loop: {
                                        ...(layer.animation?.loop || {}),
                                        type: v as AnimationType
                                    }
                                }
                            })}
                        />

                        {(typeof layer.animation?.loop === 'object' ? layer.animation.loop.type : (layer.animation as any)?.looping) === 'spin' && (
                            <SelectInput
                                label="Direction"
                                value={layer.animation?.loop?.direction || 'cw'}
                                options={[
                                    { value: 'cw', label: 'Clockwise ↻' },
                                    { value: 'ccw', label: 'Counter-Clockwise ↺' }
                                ]}
                                onChange={(v) => handleUpdate({
                                    animation: {
                                        ...layer.animation,
                                        loop: {
                                            ...(layer.animation?.loop || {}),
                                            direction: v as any
                                        }
                                    }
                                })}
                            />
                        )}


                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput
                                label="Delay (ms)"
                                value={layer.animation?.loop?.delay || 0}
                                onChange={(v) => handleUpdate({
                                    animation: {
                                        ...layer.animation,
                                        loop: {
                                            ...(layer.animation?.loop || {}),
                                            delay: Math.min(v, 10000)
                                        }
                                    }
                                })}
                            />
                            <NumberInput
                                label="Duration (ms)"
                                value={layer.animation?.loop?.duration || 1000}
                                onChange={(v) => handleUpdate({
                                    animation: {
                                        ...layer.animation,
                                        loop: {
                                            ...(layer.animation?.loop || {}),
                                            duration: Math.min(v, 10000)
                                        }
                                    }
                                })}
                            />
                        </div>
                    </div>
                </SectionComponent>

                {/* Elegant Spin Section (Premium ✨) */}
                <SectionComponent title="Elegant Spin" icon={<Sparkles className="w-4 h-4 text-premium-accent" />}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/70 font-medium italic">Premium Pulse & Spin</span>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate({
                                    elegantSpinConfig: {
                                        ...layer.elegantSpinConfig,
                                        enabled: !layer.elegantSpinConfig?.enabled,
                                        duration: layer.elegantSpinConfig?.duration || 1000,
                                        trigger: layer.elegantSpinConfig?.trigger || 'load',
                                        direction: layer.elegantSpinConfig?.direction || 'cw',
                                        minScale: layer.elegantSpinConfig?.minScale ?? 0.8,
                                        maxScale: layer.elegantSpinConfig?.maxScale ?? 1.2
                                    }
                                })}
                                className={`w-10 h-5 rounded-full transition-colors ${layer.elegantSpinConfig?.enabled ? 'bg-premium-accent' : 'bg-white/10'}`}
                            >
                                <motion.div
                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    animate={{ x: layer.elegantSpinConfig?.enabled ? 22 : 2 }}
                                />
                            </motion.button>
                        </div>

                        {layer.elegantSpinConfig?.enabled && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <SelectInput
                                    label="Trigger"
                                    value={layer.elegantSpinConfig.trigger || 'load'}
                                    options={[
                                        { value: 'load', label: 'On Load' },
                                        { value: 'scroll', label: 'On Scroll' },
                                        { value: 'click', label: 'On Click' },
                                        { value: 'open_btn', label: 'On Open Button' }
                                    ]}
                                    onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, trigger: v as any } })}
                                />

                                <SelectInput
                                    label="Direction"
                                    value={layer.elegantSpinConfig.direction || 'cw'}
                                    options={[
                                        { value: 'cw', label: 'Clockwise ↻' },
                                        { value: 'ccw', label: 'Counter-Clockwise ↺' }
                                    ]}
                                    onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, direction: v as any } })}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <NumberInput
                                        label="Min Scale"
                                        value={layer.elegantSpinConfig.minScale ?? 0.8}
                                        step={0.01}
                                        min={0}
                                        onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, minScale: v } })}
                                    />
                                    <NumberInput
                                        label="Max Scale"
                                        value={layer.elegantSpinConfig.maxScale ?? 1.2}
                                        step={0.01}
                                        min={0}
                                        onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, maxScale: v } })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <NumberInput
                                        label="Spin Duration (ms)"
                                        value={layer.elegantSpinConfig.spinDuration || layer.elegantSpinConfig.duration || 1000}
                                        onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, spinDuration: v } })}
                                    />
                                    <NumberInput
                                        label="Growth Duration (ms)"
                                        value={layer.elegantSpinConfig.scaleDuration || layer.elegantSpinConfig.duration || 1000}
                                        onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, scaleDuration: v } })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <NumberInput
                                        label="Delay (ms)"
                                        value={layer.elegantSpinConfig.delay || 0}
                                        onChange={(v) => handleUpdate({ elegantSpinConfig: { ...layer.elegantSpinConfig!, delay: v } })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </SectionComponent>

                {/* Infinite Marquee Section (Premium 🎞️) */}
                <SectionComponent title="Infinite Marquee" icon={<MoveHorizontal className="w-4 h-4 text-premium-accent" />}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/70 font-medium italic">Continuous Movement</span>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate({
                                    infiniteMarqueeConfig: {
                                        ...layer.infiniteMarqueeConfig,
                                        enabled: !layer.infiniteMarqueeConfig?.enabled,
                                        speed: layer.infiniteMarqueeConfig?.speed || 50,
                                        angle: layer.infiniteMarqueeConfig?.angle || 0
                                    }
                                })}
                                className={`w-10 h-5 rounded-full transition-colors ${layer.infiniteMarqueeConfig?.enabled ? 'bg-premium-accent' : 'bg-white/10'}`}
                            >
                                <motion.div
                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    animate={{ x: layer.infiniteMarqueeConfig?.enabled ? 22 : 2 }}
                                />
                            </motion.button>
                        </div>

                        {layer.infiniteMarqueeConfig?.enabled && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <SelectInput
                                    label="Mode"
                                    value={layer.infiniteMarqueeConfig.mode || 'seamless'}
                                    options={[
                                        { value: 'seamless', label: '✨ Seamless (Infinite Loop)' },
                                        { value: 'scroll', label: 'Bounce (Back & Forth)' },
                                        { value: 'tile', label: 'Tile (Pattern Repeat)' }
                                    ]}
                                    onChange={(v) => handleUpdate({ infiniteMarqueeConfig: { ...layer.infiniteMarqueeConfig!, mode: v as any } })}
                                />

                                {layer.infiniteMarqueeConfig.mode === 'seamless' && (
                                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <p className="text-[9px] text-green-400/80 leading-tight">
                                            ✓ Enterprise mode: True infinite scroll tanpa putus, bekerja dengan semua ukuran gambar.
                                        </p>
                                    </div>
                                )}

                                {layer.infiniteMarqueeConfig.mode === 'tile' && (
                                    <p className="text-[9px] text-amber-400/60 italic leading-tight">
                                        ⚠️ Tile mode: Gambar akan di-repeat. Gunakan gambar pattern 100-200px.
                                    </p>
                                )}

                                <NumberInput
                                    label="Speed (px/s)"
                                    value={layer.infiniteMarqueeConfig.speed || 50}
                                    min={1}
                                    onChange={(v) => handleUpdate({ infiniteMarqueeConfig: { ...layer.infiniteMarqueeConfig!, speed: v } })}
                                />

                                {layer.infiniteMarqueeConfig.mode === 'scroll' && (
                                    <NumberInput
                                        label="Distance (px)"
                                        value={layer.infiniteMarqueeConfig.distance || 500}
                                        min={50}
                                        onChange={(v) => handleUpdate({ infiniteMarqueeConfig: { ...layer.infiniteMarqueeConfig!, distance: v } })}
                                    />
                                )}

                                {/* Direction for Seamless mode */}
                                {(layer.infiniteMarqueeConfig.mode === 'seamless' || !layer.infiniteMarqueeConfig.mode) && (
                                    <div className="space-y-2">
                                        <label className="text-[9px] text-white/30 uppercase font-bold block">Direction</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {[
                                                { label: '← Left', val: 'left' },
                                                { label: '→ Right', val: 'right' },
                                                { label: '↑ Up', val: 'up' },
                                                { label: '↓ Down', val: 'down' }
                                            ].map(preset => (
                                                <button
                                                    key={preset.val}
                                                    onClick={() => handleUpdate({ infiniteMarqueeConfig: { ...layer.infiniteMarqueeConfig!, direction: preset.val as any } })}
                                                    className={`py-1.5 text-[8px] border rounded transition-all ${(layer.infiniteMarqueeConfig?.direction || 'left') === preset.val
                                                        ? 'border-premium-accent bg-premium-accent/20 text-premium-accent'
                                                        : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Angle for Tile/Scroll mode */}
                                {layer.infiniteMarqueeConfig.mode === 'tile' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[9px] text-white/30 uppercase font-bold">Direction (Angle: {layer.infiniteMarqueeConfig.angle || 0}°)</label>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={layer.infiniteMarqueeConfig.angle || 0}
                                            onChange={(e) => handleUpdate({ infiniteMarqueeConfig: { ...layer.infiniteMarqueeConfig!, angle: parseInt(e.target.value) } })}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-premium-accent"
                                        />
                                        <div className="grid grid-cols-4 gap-1">
                                            {[
                                                { label: 'Right', val: 0 },
                                                { label: 'Down', val: 90 },
                                                { label: 'Left', val: 180 },
                                                { label: 'Up', val: 270 }
                                            ].map(preset => (
                                                <button
                                                    key={preset.val}
                                                    onClick={() => handleUpdate({ infiniteMarqueeConfig: { ...layer.infiniteMarqueeConfig!, angle: preset.val } })}
                                                    className="py-1 text-[8px] border border-white/5 bg-white/5 rounded hover:bg-white/10 text-white/60"
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </SectionComponent>

                {/* Photo Grid Settings */}
                {layer.type === 'photo_grid' && layer.photoGridConfig && (
                    <SectionComponent title="Photo Grid" icon={<Layout className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <SelectInput
                                label="Hover Effect"
                                value={layer.photoGridConfig.hoverEffect || 'zoom'}
                                options={[
                                    { value: 'none', label: 'None' },
                                    { value: 'zoom', label: '🔍 Zoom In' },
                                    { value: 'zoom-rotate', label: '🔄 Zoom + Rotate' },
                                    { value: 'brightness', label: '☀️ Brightness' },
                                    { value: 'grayscale', label: '🎨 Grayscale → Color' },
                                    { value: 'blur-reveal', label: '💨 Blur → Reveal' },
                                    { value: 'overlay', label: '✨ Gold Overlay' },
                                    { value: 'tilt', label: '📐 3D Tilt' },
                                    { value: 'glow', label: '💫 Glow Effect' }
                                ]}
                                onChange={(v) => handleUpdate({
                                    photoGridConfig: {
                                        ...layer.photoGridConfig!,
                                        hoverEffect: v as any
                                    }
                                })}
                            />

                            <NumberInput
                                label="Gap (px)"
                                value={layer.photoGridConfig.gap ?? 8}
                                min={0}
                                max={32}
                                onChange={(v) => handleUpdate({
                                    photoGridConfig: { ...layer.photoGridConfig!, gap: v }
                                })}
                            />

                            <NumberInput
                                label="Corner Radius (px)"
                                value={layer.photoGridConfig.cornerRadius ?? 12}
                                min={0}
                                max={50}
                                onChange={(v) => handleUpdate({
                                    photoGridConfig: { ...layer.photoGridConfig!, cornerRadius: v }
                                })}
                            />
                        </div>
                    </SectionComponent>
                )}

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
                                            {layer.motionPathConfig.points.map((point: any, idx: number) => (
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
                            onClick={() => handleOrder('front')}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                            title="Bring to Front"
                        >
                            <ArrowUpToLine className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOrder('up')}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                            title="Bring Forward"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOrder('down')}
                            className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-white/10 flex items-center justify-center"
                            title="Send Backward"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleOrder('back')}
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

const NumberInput: React.FC<{
    label: string;
    value: number;
    step?: number;
    min?: number;
    max?: number;
    onChange: (v: number) => void;
}> = ({ label, value, step = 1, min, max, onChange }) => (
    <div>
        <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">{label}</label>
        <input
            type="number"
            value={value}
            step={step}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
        />
    </div>
);

const SelectInput: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
    isFontPicker?: boolean;
}> = ({ label, value, options, onChange, isFontPicker }) => (
    <div>
        <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none appearance-none cursor-pointer"
        >
            {options.map(opt => {
                const fontConfig = isFontPicker ? SUPPORTED_FONTS.find(f => f.name === opt.value) : null;
                return (
                    <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-[#1a1a1a]"
                        style={isFontPicker && fontConfig ? { fontFamily: fontConfig.family } : {}}
                    >
                        {opt.label}
                    </option>
                );
            })}
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

const RangeInput: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center">
            <label className="text-[9px] text-white/30 uppercase font-bold">{label}</label>
            <span className="text-[10px] text-white/60 font-mono">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-premium-accent"
        />
    </div>
);
