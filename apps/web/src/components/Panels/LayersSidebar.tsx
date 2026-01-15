import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
    Layers, Eye, EyeOff, GripVertical, Trash2, Lock, Unlock,
    Type, Image, Clock, MailOpen, Heart, Square, MapPin, Film, Video,
    Settings, Palette, Zap, Wind, Upload, Loader2, Link as LinkIcon, Grid, MessageSquare,
    Sparkles, Circle, Gift, Music, Waves, Component, Hash, QrCode, Monitor, Sun, Share2, Users
} from 'lucide-react';
import { LayerType, Layer } from '@/store/layersSlice';

const layerIcons: Record<LayerType, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    image: <Image className="w-4 h-4" />,
    gif: <Film className="w-4 h-4" />,
    sticker: <Image className="w-4 h-4" />,
    icon: <Heart className="w-4 h-4" />,
    countdown: <Clock className="w-4 h-4" />,
    button: <MailOpen className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    shape: <Square className="w-4 h-4" />,
    maps_point: <MapPin className="w-4 h-4" />,
    rsvp_form: <Layers className="w-4 h-4" />,
    guest_wishes: <Layers className="w-4 h-4" />,
    rsvp_wishes: <MessageSquare className="w-4 h-4" />,
    open_invitation_button: <MailOpen className="w-4 h-4" />,
    lottie: <Zap className="w-4 h-4" />,
    flying_bird: <Wind className="w-4 h-4" />,
    photo_grid: <Grid className="w-4 h-4" />,
    // ENTERPRISE V2 ICONS
    confetti: <Sparkles className="w-4 h-4" />,
    fireworks: <Zap className="w-4 h-4" />,
    bubbles: <Circle className="w-4 h-4" />,
    snow: <Wind className="w-4 h-4" />,
    digital_gift: <Gift className="w-4 h-4" />,
    guestbook_ticker: <MessageSquare className="w-4 h-4" />,
    music_player: <Music className="w-4 h-4" />,
    calendar_sync: <Clock className="w-4 h-4" />,
    svg_wave: <Waves className="w-4 h-4" />,
    generative_blob: <Component className="w-4 h-4" />,
    glass_card: <Palette className="w-4 h-4" />,
    infinite_marquee: <Hash className="w-4 h-4" />,
    tilt_card: <Layers className="w-4 h-4" />,
    parallax_layer: <Layers className="w-4 h-4" />,
    hologram_overlay: <Sparkles className="w-4 h-4" />,
    gradient_mesh: <Palette className="w-4 h-4" />,
    interaction: <Zap className="w-4 h-4" />,
    qr_code: <QrCode className="w-4 h-4" />,
    info_ticker: <Hash className="w-4 h-4" />,
    social_mockup: <Monitor className="w-4 h-4" />,
    weather_widget: <Sun className="w-4 h-4" />,
    directions_hub: <MapPin className="w-4 h-4" />,
    share_context: <Share2 className="w-4 h-4" />,
    name_board: <Users className="w-4 h-4" />
};

// Placeholder for missing Palette import usage in layerIcons
// Wait, I removed Settings, Palette, Upload, Loader2, LinkIcon but Palette is used in layerIcons.
// I must Re-add Palette to imports.

export const LayersSidebar: React.FC = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-2">
                <LayersTab />
            </div>
        </div>
    );
};

// ============================================
// LAYERS TAB
// ============================================
function LayersTab() {
    const {
        layers,
        selectedLayerId,
        selectLayer,
        updateLayer,
        removeLayer,
        // Orbit Context
        orbit,
        activeCanvas,
        updateOrbitElement,
        removeOrbitElement,
        // Section Store Actions
        activeSectionId,
        sections,
        updateElementInSection,
        removeElementFromSection,
        updateLayersBatch,
        updateSectionElementsBatch,
        updateOrbitElementsBatch
    } = useStore();

    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Context-Aware Layer Discovery Engine
    const getDisplayContext = () => {
        if (activeCanvas === 'main') {
            const activeSection = sections.find(s => s.id === activeSectionId);
            return {
                layers: activeSection ? activeSection.elements : layers,
                label: `SECTION: ${activeSection?.title || 'Untitled'}`,
                isSection: true
            };
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            return {
                layers: orbit[activeCanvas].elements,
                label: `STAGE: ${activeCanvas.toUpperCase()}`,
                isSection: false
            };
        }
        return { layers: [], label: 'Unknown Context', isSection: false };
    };

    const context = getDisplayContext();
    const displayLayers = context.layers;

    const sortedLayers = [...displayLayers].sort((a, b) => {
        if ((b.zIndex || 0) !== (a.zIndex || 0)) {
            return (b.zIndex || 0) - (a.zIndex || 0);
        }
        const idxA = displayLayers.indexOf(a);
        const idxB = displayLayers.indexOf(b);
        return idxB - idxA;
    });

    const handleReorder = (reorderedLayers: typeof sortedLayers) => {
        // Normalize Z-Indices based on new order
        const updated = reorderedLayers.map((layer, index) => {
            const newZIndex = reorderedLayers.length - index;
            return { ...layer, zIndex: newZIndex };
        });

        if (activeCanvas === 'main' && activeSectionId) {
            updateSectionElementsBatch(activeSectionId, updated);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElementsBatch(activeCanvas, updated);
        } else {
            updateLayersBatch(updated);
        }
    };

    const startRename = (layerId: string, currentName: string) => {
        setEditingLayerId(layerId);
        setEditName(currentName);
    };

    const finishRename = (layerId: string) => {
        if (editName.trim()) {
            if (activeCanvas === 'main' && activeSectionId) {
                updateElementInSection(activeSectionId, layerId, { name: editName.trim() });
            } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                updateOrbitElement(activeCanvas, layerId, { name: editName.trim() });
            } else {
                updateLayer(layerId, { name: editName.trim() });
            }
        }
        setEditingLayerId(null);
        setEditName('');
    };

    // Toggle Visibility Helper
    const toggleVisibility = (layerId: string, current: boolean) => {
        if (activeCanvas === 'main' && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, { isVisible: !current });
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElement(activeCanvas, layerId, { isVisible: !current });
        } else {
            updateLayer(layerId, { isVisible: !current });
        }
    };

    // Toggle Lock Helper
    const toggleLock = (layerId: string, current: boolean) => {
        if (activeCanvas === 'main' && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, { isLocked: !current });
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElement(activeCanvas, layerId, { isLocked: !current });
        } else {
            updateLayer(layerId, { isLocked: !current });
        }
    };

    // Remove Helper
    const removeItem = (layerId: string) => {
        if (confirm('Delete this layer?')) {
            if (activeCanvas === 'main' && activeSectionId) {
                removeElementFromSection(activeSectionId, layerId);
            } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                removeOrbitElement(activeCanvas, layerId);
            } else {
                removeLayer(layerId);
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto premium-scroll p-2">
            {/* Context Indicator */}
            <div className={`px-2 py-1 mb-2 text-[10px] items-center rounded border flex justify-between ${activeCanvas === 'main'
                ? 'text-premium-accent bg-premium-accent/5 border-premium-accent/10'
                : 'text-purple-400 bg-purple-400/5 border-purple-400/10'
                }`}>
                <span className="font-bold uppercase tracking-widest truncate max-w-[150px]">
                    {context.label}
                </span>
                <span className="opacity-50">{displayLayers.length} items</span>
            </div>

            <Reorder.Group
                axis="y"
                values={sortedLayers}
                onReorder={handleReorder}
                className="space-y-1"
            >
                {sortedLayers.map((layer) => (
                    <LayerItem key={layer.id} layer={layer} />
                ))}
            </Reorder.Group>

            {displayLayers.length === 0 && (
                <div className="text-center text-white/20 py-8">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No layers yet</p>
                    <p className="text-[10px] opacity-50 mt-1">Add elements from toolbar</p>
                </div>
            )}
        </div>
    );
};

// ============================================
// LAYER ITEM COMPONENT
// ============================================
function LayerItem({ layer }: { layer: Layer }) {
    const {
        selectedLayerId,
        selectLayer,
        updateLayer,
        removeLayer,
        activeCanvas,
        activeSectionId,
        updateElementInSection,
        removeElementFromSection,
        updateOrbitElement,
        removeOrbitElement
    } = useStore();

    const controls = useDragControls();
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const startRename = (layerId: string, currentName: string) => {
        setEditingLayerId(layerId);
        setEditName(currentName);
    };

    const finishRename = (layerId: string) => {
        if (editName.trim()) {
            if (activeCanvas === 'main' && activeSectionId) {
                updateElementInSection(activeSectionId, layerId, { name: editName.trim() });
            } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                updateOrbitElement(activeCanvas, layerId, { name: editName.trim() });
            } else {
                updateLayer(layerId, { name: editName.trim() });
            }
        }
        setEditingLayerId(null);
        setEditName('');
    };

    const toggleVisibility = (layerId: string, current: boolean) => {
        if (activeCanvas === 'main' && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, { isVisible: !current });
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElement(activeCanvas, layerId, { isVisible: !current });
        } else {
            updateLayer(layerId, { isVisible: !current });
        }
    };

    const toggleLock = (layerId: string, current: boolean) => {
        if (activeCanvas === 'main' && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, { isLocked: !current });
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            updateOrbitElement(activeCanvas, layerId, { isLocked: !current });
        } else {
            updateLayer(layerId, { isLocked: !current });
        }
    };

    const removeItem = (layerId: string) => {
        if (confirm('Delete this layer?')) {
            if (activeCanvas === 'main' && activeSectionId) {
                removeElementFromSection(activeSectionId, layerId);
            } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                removeOrbitElement(activeCanvas, layerId);
            } else {
                removeLayer(layerId);
            }
        }
    };

    return (
        <Reorder.Item
            value={layer}
            className="list-none"
            dragListener={false}
            dragControls={controls}
            whileDrag={{
                scale: 1.02,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                zIndex: 50
            }}
        >
            <div
                onClick={() => selectLayer(layer.id)}
                onDoubleClick={() => startRename(layer.id, layer.name)}
                className={`group p-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${selectedLayerId === layer.id
                    ? 'bg-premium-accent/10 ring-1 ring-premium-accent/30 text-premium-accent'
                    : 'bg-white/[0.02] text-white/60 hover:bg-white/5'
                    }`}
            >
                {/* Drag Handle - Restricted */}
                <div
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        controls.start(e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50 p-1 -m-1 touch-none relative z-50 pointer-events-auto"
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Icon */}
                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${selectedLayerId === layer.id ? 'bg-premium-accent/20' : 'bg-white/5'
                    }`}>
                    {layerIcons[layer.type] || <Layers className="w-3 h-3" />}
                </div>

                {/* Name - Editable */}
                <div className="flex-1 min-w-0">
                    {editingLayerId === layer.id ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => finishRename(layer.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') finishRename(layer.id);
                                if (e.key === 'Escape') setEditingLayerId(null);
                            }}
                            autoFocus
                            className="w-full bg-white/10 border border-premium-accent/50 rounded px-1 py-0.5 text-xs focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <p className="text-xs font-medium truncate">{layer.name}</p>
                    )}
                </div>

                {/* Action Buttons - Always visible */}
                <div className="flex items-center gap-0.5">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(layer.id, layer.isVisible ?? true);
                        }}
                        className={`p-1 rounded ${!layer.isVisible ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
                        title={layer.isVisible ? 'Hide' : 'Show'}
                    >
                        {layer.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(layer.id, layer.isLocked ?? false);
                        }}
                        className={`p-1 rounded ${layer.isLocked ? 'text-yellow-400' : 'text-white/30 hover:text-white/60'}`}
                        title={layer.isLocked ? 'Unlock' : 'Lock'}
                    >
                        {layer.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            removeItem(layer.id);
                        }}
                        className="p-1 rounded text-white/30 hover:text-red-400"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </motion.button>
                </div>
            </div>
        </Reorder.Item>
    );
}
