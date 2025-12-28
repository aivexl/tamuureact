import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
    Layers, Eye, EyeOff, GripVertical, Trash2, Lock, Unlock,
    Type, Image, Clock, MailOpen, Heart, Square, MapPin, Film, Video,
    Settings, Palette, Zap, Wind, Upload, Loader2, Link as LinkIcon
} from 'lucide-react';
import { LayerType } from '@/store/layersSlice';
import { supabase } from '@/lib/supabase';
import { ThumbnailSelectionModal } from '../Modals/ThumbnailSelectionModal';

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
    open_invitation_button: <MailOpen className="w-4 h-4" />,
    lottie: <Zap className="w-4 h-4" />,
    flying_bird: <Wind className="w-4 h-4" />
};

type TabType = 'layers' | 'settings';

export const LayersSidebar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('layers');

    return (
        <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10 shrink-0">
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'layers'
                        ? 'text-premium-accent bg-premium-accent/5 border-b-2 border-premium-accent'
                        : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    Layers
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'settings'
                        ? 'text-premium-accent bg-premium-accent/5 border-b-2 border-premium-accent'
                        : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>

            {/* Content */}
            {activeTab === 'layers' ? <LayersTab /> : <SettingsTab />}
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
        reorderLayers,
        // Section Store Actions
        activeSectionId,
        sections,
        updateElementInSection,
        removeElementFromSection
        // reorderElementsInSection // TODO: Add if available in store, otherwise manual array update
    } = useStore();

    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Determine which layers to show: Active Section or Global
    const activeSection = sections.find(s => s.id === activeSectionId);

    // If we have an active section, use its elements. Otherwise fallback to global layers.
    // Ensure we handle the case where activeSection might be undefined even if Id exists.
    const displayLayers = activeSection ? activeSection.elements : layers;
    const isSectionMode = !!activeSection;

    const sortedLayers = [...displayLayers].sort((a, b) => {
        if ((b.zIndex || 0) !== (a.zIndex || 0)) {
            return (b.zIndex || 0) - (a.zIndex || 0);
        }
        // If zIndex is same, fallback to array index (reverse of canvas render)
        const idxA = displayLayers.indexOf(a);
        const idxB = displayLayers.indexOf(b);
        return idxB - idxA;
    });

    const handleReorder = (reorderedLayers: typeof sortedLayers) => {
        // CTO ENTERPRISE SYNC:
        // Top of the list MUST be highest zIndex to be on top of canvas.
        // We assign zIndex from reorderedLayers.length down to 1.

        reorderedLayers.forEach((layer, index) => {
            const newZIndex = reorderedLayers.length - index;
            // Immediate store update
            if (isSectionMode && activeSectionId) {
                updateElementInSection(activeSectionId, layer.id, { zIndex: newZIndex });
            } else {
                updateLayer(layer.id, { zIndex: newZIndex });
            }
        });
    };

    const startRename = (layerId: string, currentName: string) => {
        setEditingLayerId(layerId);
        setEditName(currentName);
    };

    const finishRename = (layerId: string) => {
        if (editName.trim()) {
            if (isSectionMode && activeSectionId) {
                updateElementInSection(activeSectionId, layerId, { name: editName.trim() });
            } else {
                updateLayer(layerId, { name: editName.trim() });
            }
        }
        setEditingLayerId(null);
        setEditName('');
    };

    // Toggle Visibility Helper
    const toggleVisibility = (layerId: string, current: boolean) => {
        if (isSectionMode && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, { isVisible: !current });
        } else {
            updateLayer(layerId, { isVisible: !current });
        }
    };

    // Toggle Lock Helper
    const toggleLock = (layerId: string, current: boolean) => {
        if (isSectionMode && activeSectionId) {
            updateElementInSection(activeSectionId, layerId, { isLocked: !current });
        } else {
            updateLayer(layerId, { isLocked: !current });
        }
    };

    // Remove Helper
    const removeItem = (layerId: string) => {
        if (confirm('Delete this layer?')) {
            if (isSectionMode && activeSectionId) {
                removeElementFromSection(activeSectionId, layerId);
            } else {
                removeLayer(layerId);
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto premium-scroll p-2">
            {/* Context Indicator */}
            {isSectionMode && (
                <div className="px-2 py-1 mb-2 text-[10px] items-center text-premium-accent bg-premium-accent/5 rounded border border-premium-accent/10 flex justify-between">
                    <span className="font-bold uppercase tracking-widest truncate max-w-[150px]">
                        SECTION: {activeSection.title || 'Untitled'}
                    </span>
                    <span className="opacity-50">{displayLayers.length} items</span>
                </div>
            )}

            <Reorder.Group
                axis="y"
                values={sortedLayers}
                onReorder={handleReorder}
                className="space-y-1"
            >
                {sortedLayers.map((layer) => (
                    <Reorder.Item
                        key={layer.id}
                        value={layer}
                        className="list-none"
                        whileDrag={{
                            scale: 1.02,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            zIndex: 50
                        }}
                    >
                        <motion.div
                            layout
                            onClick={() => selectLayer(layer.id)}
                            onDoubleClick={() => startRename(layer.id, layer.name)}
                            className={`group p-2 rounded-lg flex items-center gap-2 transition-all cursor-grab active:cursor-grabbing ${selectedLayerId === layer.id
                                ? 'bg-premium-accent/10 ring-1 ring-premium-accent/30 text-premium-accent'
                                : 'bg-white/[0.02] text-white/60 hover:bg-white/5'
                                }`}
                        >
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50">
                                <GripVertical className="w-3 h-3" />
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
                                        toggleVisibility(layer.id, layer.isVisible);
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
                                        toggleLock(layer.id, layer.isLocked);
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
                        </motion.div>
                    </Reorder.Item>
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
// SETTINGS TAB
// ============================================
function SettingsTab() {
    const {
        sections,
        activeSectionId,
        updateSection,
        slug,
        projectName,
        setSlug,
        setProjectName
    } = useStore();

    // Get active section's background color
    const activeSection = sections.find(s => s.id === activeSectionId);
    const backgroundColor = activeSection?.backgroundColor || '#0a0a0a';

    const setBackgroundColor = (color: string) => {
        if (activeSectionId) {
            updateSection(activeSectionId, { backgroundColor: color });
        }
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeSectionId) return;

        setUploading(true);
        try {
            const userId = 'anon';
            const timestamp = Date.now();
            const fileName = `${timestamp}_bg_${file.name.replace(/\s+/g, '_')}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('invitation-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('invitation-assets')
                .getPublicUrl(filePath);

            updateSection(activeSectionId, { backgroundUrl: publicUrl });
        } catch (error) {
            console.error('BG Upload failed:', error);
            alert('Background upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const setBackgroundUrl = (url: string) => {
        if (activeSectionId) {
            updateSection(activeSectionId, { backgroundUrl: url });
        }
    };

    const presetColors = [
        { color: '#0a0a0a', label: 'Dark' },
        { color: '#1a1a1a', label: 'Charcoal' },
        { color: '#0f172a', label: 'Navy' },
        { color: '#1e1b4b', label: 'Indigo' },
        { color: '#422006', label: 'Brown' },
        { color: '#ffffff', label: 'White' },
        { color: '#fef3c7', label: 'Cream' },
        { color: '#fce7f3', label: 'Pink' },
        { color: '#d1fae5', label: 'Mint' },
        { color: '#e0e7ff', label: 'Lavender' },
        { color: '#fed7aa', label: 'Peach' },
        { color: '#f5f5f4', label: 'Stone' }
    ];

    return (
        <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-6">
            {/* Project Settings */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60">
                    <LinkIcon className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Project Settings</h4>
                </div>
                <div className="pt-2">
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Project Name</label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-premium-accent/50 focus:outline-none"
                        placeholder="My Premium Template"
                    />
                </div>

                {/* Thumbnail Selection */}
                <div className="pt-2">
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Thumbnail</label>
                    <ThumbnailControl />
                </div>

                <div className="pt-2">
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Custom Slug (URL)</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 focus-within:border-premium-accent/50 transition-colors">
                            <span className="text-white/20 text-xs font-mono">/preview/</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                                className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 font-mono text-premium-accent"
                                placeholder="my-awesome-link"
                            />
                        </div>
                    </div>
                    <p className="text-[8px] text-white/20 mt-2 italic">Only letters, numbers, and hyphens allowed.</p>
                </div>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60">
                    <Palette className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Canvas Background</h4>
                </div>

                {/* Preset Colors */}
                <div className="grid grid-cols-4 gap-2">
                    {presetColors.map((preset) => (
                        <motion.button
                            key={preset.color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setBackgroundColor(preset.color)}
                            className={`aspect-square rounded-lg border-2 transition-all ${backgroundColor === preset.color
                                ? 'border-premium-accent ring-2 ring-premium-accent/30'
                                : 'border-white/10 hover:border-white/20'
                                }`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.label}
                        />
                    ))}
                </div>

                {/* Custom Color Picker */}
                <div className="pt-3 border-t border-white/10">
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
                            placeholder="#0a0a0a"
                        />
                    </div>
                </div>
            </div>

            {/* Background Image Controls */}
            <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60">
                    <Image className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Background Image</h4>
                </div>

                {/* URL Input */}
                <div>
                    <label className="text-[8px] text-white/20 mb-1 block">Image URL</label>
                    <input
                        type="text"
                        value={activeSection?.backgroundUrl || ''}
                        onChange={(e) => setBackgroundUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs focus:border-premium-accent/50 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                {/* Manual Upload */}
                <div>
                    <label className="text-[8px] text-white/20 mb-1 block">Upload Image</label>
                    <label className={`flex items-center justify-center w-full px-3 py-3 border border-dashed rounded-lg transition-colors ${uploading ? 'bg-premium-accent/5 border-premium-accent/30' : 'border-white/10 cursor-pointer hover:bg-white/5 hover:border-premium-accent/30'}`}>
                        <div className="flex flex-col items-center gap-1 text-center">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 text-premium-accent animate-spin" />
                                    <span className="text-[10px] text-premium-accent">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Image className="w-4 h-4 text-white/40" />
                                    <span className="text-[10px] text-white/40">Click to upload image</span>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Preview / Clear */}
                {activeSection?.backgroundUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                        <img
                            src={activeSection.backgroundUrl}
                            alt="Background preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => setBackgroundUrl('')}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white hover:bg-red-500/80 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Background"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Canvas Size Info */}
            <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60">
                    <Settings className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Canvas Info</h4>
                </div>
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40">Width</span>
                        <span className="font-mono text-white/60">414px</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40">Height</span>
                        <span className="font-mono text-white/60">896px</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40">Aspect Ratio</span>
                        <span className="font-mono text-white/60">9:19.5 (Mobile)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// THUMBNAIL CONTROL
// ============================================
// ============================================
// THUMBNAIL CONTROL
// ============================================
function ThumbnailControl() {
    const { thumbnailUrl, setThumbnailUrl, projectName } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSaveThumbnail = async (blob: Blob) => {
        try {
            setUploading(true);
            const timestamp = Date.now();
            const safeName = (projectName || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-');
            const fileName = `thumb_${safeName}_${timestamp}.jpg`;
            const filePath = `thumbnails/${fileName}`;

            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('invitation-assets')
                .upload(filePath, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('invitation-assets')
                .getPublicUrl(filePath);

            // Update Store
            setThumbnailUrl(publicUrl);
            console.log('[Thumbnail] Uploaded:', publicUrl);

        } catch (error) {
            console.error('Thumbnail upload failed:', error);
            alert('Failed to upload thumbnail. Check console.');
        } finally {
            setUploading(false);
        }
    };

    const [manualImageSrc, setManualImageSrc] = useState<string | null>(null);

    const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Read file as Data URL
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setManualImageSrc(event.target.result as string);
                setIsModalOpen(true);
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    return (
        <>
            <div className="flex gap-4 items-start">
                <button
                    onClick={() => {
                        setManualImageSrc(null);
                        setIsModalOpen(true);
                    }}
                    className="flex-1 aspect-[3/5] bg-white/5 rounded-lg border border-dashed border-white/10 hover:border-premium-accent/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 group overflow-hidden relative"
                >
                    {thumbnailUrl ? (
                        <>
                            <img src={thumbnailUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[10px] font-bold text-white">Change</span>
                            </div>
                        </>
                    ) : (
                        <>
                            {uploading ? (
                                <Loader2 className="w-5 h-5 text-premium-accent animate-spin" />
                            ) : (
                                <Image className="w-5 h-5 text-white/20 group-hover:text-premium-accent" />
                            )}
                            <span className="text-[10px] text-white/30 group-hover:text-white">
                                {uploading ? 'Uploading...' : 'Set Thumbnail'}
                            </span>
                        </>
                    )}
                </button>
                <div className="flex-1 py-1 space-y-3">
                    <div>
                        <p className="text-[10px] text-white/40 leading-tight mb-2">
                            Set a preview image for your template.
                        </p>
                        <button
                            onClick={() => {
                                setManualImageSrc(null);
                                setIsModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-premium-accent hover:text-premium-dark rounded text-[10px] font-bold transition-colors w-full border border-white/10 hover:border-transparent flex items-center justify-center gap-1.5"
                        >
                            <Zap className="w-3 h-3" />
                            Generate
                        </button>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <label className="text-[8px] text-white/20 mb-1 block uppercase tracking-wider">Manual Upload</label>
                        <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-medium transition-colors w-full border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Select Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleManualUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <label className="text-[8px] text-white/20 mb-1 block uppercase tracking-wider">Image URL</label>
                        <input
                            type="text"
                            value={thumbnailUrl || ''}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-premium-accent/50 font-mono text-premium-accent"
                        />
                    </div>
                </div>
            </div>

            <ThumbnailSelectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setManualImageSrc(null); // Reset
                }}
                onSave={handleSaveThumbnail}
                initialImageSrc={manualImageSrc}
            />
        </>
    );
}
