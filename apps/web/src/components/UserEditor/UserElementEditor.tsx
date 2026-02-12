import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Type, Image as ImageIcon, MapPin, Copy, Shield, Clock, Lock, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Plus, Minus, Palette, ChevronDown, Settings2, Trash2, Calendar, Heart, Type as FontIcon, Monitor, Quote, Check, ExternalLink, Mail, Phone, Share2 } from 'lucide-react';
import { useStore, Layer, LoveStoryMoment, LoveStoryConfig } from '@/store/useStore';
import { SUPPORTED_FONTS } from '@/lib/fonts';
import { QUOTES_LIBRARY } from '@/constants/quotes';

interface UserElementEditorProps {
    element: Layer;
    sectionId: string;
}

export const UserElementEditor: React.FC<UserElementEditorProps> = ({ element, sectionId }) => {
    const [showStyling, setShowStyling] = useState(false);
    const { updateElementInSection, elementDimensions, sections, updateSectionsBatch } = useStore();
    const { id: invitationId } = useParams<{ id: string }>();

    const permissions = element.permissions || {
        canEditText: false,
        canEditImage: false,
        canEditStyle: false,
        canEditPosition: false,
        canDelete: false,
        isVisibleInUserEditor: false,
        isContentProtected: false
    };

    const isProtected = permissions.isContentProtected === true;

    // Handle updates: forward changes to Zustand store
    const handleUpdate = (updates: Partial<Layer>) => {
        if (!sectionId) return;
        updateElementInSection(sectionId, element.id, updates);

        // UNICORN BIDIRECTIONAL SYNC: 
        // If updating a countdown's target date, sync it to ALL other countdowns 
        // AND potentially the database (Global Event Date)
        if (updates.countdownConfig?.targetDate) {
            const newDate = updates.countdownConfig.targetDate;

            // 1. Sync other countdowns in UI
            const updatedSections = sections.map(s => ({
                ...s,
                elements: s.elements.map(el => {
                    const isCountdown = el.type === 'countdown' || el.name?.toLowerCase().includes('countdown');
                    if (isCountdown && el.countdownConfig) {
                        return {
                            ...el,
                            countdownConfig: {
                                ...el.countdownConfig,
                                targetDate: newDate
                            }
                        };
                    }
                    return el;
                })
            }));
            updateSectionsBatch(updatedSections);

            // 2. Sync to DB (if we have invitationId)
            if (invitationId) {
                import('@/lib/api').then(({ invitations }) => {
                    invitations.update(invitationId, { event_date: newDate }).catch(err => {
                        console.error('[Sync] Failed to update global event date:', err);
                    });
                });
            }
        }

        // UNICORN BIDIRECTIONAL SYNC: Love Story Moments
        if (updates.loveStoryConfig?.events && invitationId) {
            const newEvents = updates.loveStoryConfig.events;
            import('@/lib/api').then(({ invitations }) => {
                invitations.update(invitationId, { love_story: JSON.stringify(newEvents) }).catch(err => {
                    console.error('[Sync] Failed to update global love story:', err);
                });
            });
        }
    };


    // Helper to get icon based on element type
    const getIcon = () => {
        switch (element.type) {
            case 'text': return <Type className="w-4 h-4" />;
            case 'image': return <ImageIcon className="w-4 h-4" />;
            case 'gif': return <ImageIcon className="w-4 h-4" />;
            case 'maps_point': return <MapPin className="w-4 h-4" />;
            case 'countdown': return <Clock className="w-4 h-4" />;
            case 'love_story': return <Heart className="w-4 h-4 text-pink-500" />;
            case 'live_streaming': return <Monitor className="w-4 h-4" />;
            case 'quote': return <Quote className="w-4 h-4" />;
            case 'social_mockup': return <Share2 className="w-4 h-4" />;
            case 'profile_photo': return <ImageIcon className="w-4 h-4" />;
            default: return <Type className="w-4 h-4" />;

        }
    };

    // Element is visible if specifically set to visible OR has any active edit permission
    const isVisible = permissions.isVisibleInUserEditor || permissions.canEditText || permissions.canEditImage || permissions.canEditStyle || permissions.canEditPosition;
    if (!isVisible) return null;

    return (
        <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                        {getIcon()}
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-800 tracking-tight uppercase tracking-widest">
                            {element.name || 'Element'}
                        </span>
                        {(() => {
                            const isLocked = isProtected ||
                                (element.type === 'text' && !permissions.canEditText) ||
                                ((element.type === 'image' || element.type === 'gif') && !permissions.canEditImage);

                            if (!isLocked) return null;

                            return (
                                <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                                    <Shield className="w-2.5 h-2.5" />
                                    {isProtected ? 'Protected' : 'Locked by Admin'}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <button
                    onClick={() => navigator.clipboard.writeText(element.content || '')}
                    className="p-2 text-slate-300 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-all"
                    title="Copy content"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            {/* Text Field */}
            {element.type === 'text' && (
                <div className="space-y-2">
                    {permissions.canEditText ? (
                        <textarea
                            value={element.content || ''}
                            onChange={(e) => handleUpdate({ content: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none"
                            rows={Math.max(1, Math.min(6, (element.content?.split('\n').length || 1)))}
                            placeholder="Mulai mengetik... (Enter untuk baris baru)"
                            style={{ minHeight: '48px' }}
                        />
                    ) : (
                        <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-medium text-slate-400 italic whitespace-pre-wrap">
                            {element.content || 'Konten dikunci oleh admin'}
                        </div>
                    )}

                    {/* Advanced Rich Text Toolbar - Dropdown */}
                    {(permissions.canEditStyle || permissions.canEditText) && (
                        <div className="pt-2 border-t border-slate-100">
                            {/* Toggle Button */}
                            <button
                                onClick={() => setShowStyling(!showStyling)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${showStyling ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Settings2 className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Styling</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showStyling ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Content */}
                            <AnimatePresence>
                                {showStyling && (
                                    <m.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 space-y-4">
                                            {/* Typography & Alignment Group */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Basic Style */}
                                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontWeight: element.textStyle?.fontWeight === 'bold' ? 'normal' : 'bold' } as any })}
                                                        className={`p-2 rounded-lg transition-all ${element.textStyle?.fontWeight === 'bold' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Bold"
                                                    >
                                                        <Bold className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontStyle: element.textStyle?.fontStyle === 'italic' ? 'normal' : 'italic' } as any })}
                                                        className={`p-2 rounded-lg transition-all ${element.textStyle?.fontStyle === 'italic' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Italic"
                                                    >
                                                        <Italic className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textDecoration: element.textStyle?.textDecoration === 'underline' ? 'none' : 'underline' } as any })}
                                                        className={`p-2 rounded-lg transition-all ${element.textStyle?.textDecoration === 'underline' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Underline"
                                                    >
                                                        <Underline className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Alignment */}
                                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'left' } as any })}
                                                        className={`p-2 rounded-lg transition-all ${element.textStyle?.textAlign === 'left' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Align Left"
                                                    >
                                                        <AlignLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'center' } as any })}
                                                        className={`p-2 rounded-lg transition-all ${element.textStyle?.textAlign === 'center' || !element.textStyle?.textAlign ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Align Center"
                                                    >
                                                        <AlignCenter className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'right' } as any })}
                                                        className={`p-2 rounded-lg transition-all ${element.textStyle?.textAlign === 'right' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title="Align Right"
                                                    >
                                                        <AlignRight className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Canvas Positioning (Auto Align) - Always available if styling is open */}
                                                {(() => {
                                                    const SAFE_MARGIN = 64; // Professional side margin (Luxury Standard - World Class spacing)
                                                    const CANVAS_WIDTH = 414;
                                                    const detectedDim = elementDimensions[element.id];
                                                    const currentWidth = detectedDim?.width || element.width || 300;

                                                    return (
                                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                                            <button
                                                                onClick={() => handleUpdate({ x: SAFE_MARGIN })}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                                                                title="Align Canvas Left"
                                                            >
                                                                <AlignStartVertical className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdate({ x: (CANVAS_WIDTH - currentWidth) / 2 });
                                                                }}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                                                                title="Align Canvas Center"
                                                            >
                                                                <AlignCenterVertical className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdate({ x: CANVAS_WIDTH - currentWidth - SAFE_MARGIN });
                                                                }}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                                                                title="Align Canvas Right"
                                                            >
                                                                <AlignEndVertical className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Font Size & Color Row */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Font Family Selector */}
                                                <div className="relative group/font flex-1 min-w-[140px]">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <FontIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <select
                                                        value={element.textStyle?.fontFamily || 'Inter'}
                                                        onChange={(e) => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontFamily: e.target.value } as any })}
                                                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none outline-none transition-all"
                                                    >
                                                        {SUPPORTED_FONTS.map(f => (
                                                            <option key={f.name} value={f.name}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/font:text-teal-500 transition-colors">
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>

                                                {/* Font Size */}
                                                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl px-2">
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontSize: Math.max(8, (element.textStyle?.fontSize || 24) - 2) } as any })}
                                                        className="p-1.5 text-slate-400 hover:text-teal-600"
                                                        title="Smaller"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div className="flex flex-col items-center min-w-[32px]">
                                                        <span className="text-[10px] font-black text-slate-800 leading-none">
                                                            {(element.textStyle?.fontSize || 24)}
                                                        </span>
                                                        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Size</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontSize: Math.min(100, (element.textStyle?.fontSize || 24) + 2) } as any })}
                                                        className="p-1.5 text-slate-400 hover:text-teal-600"
                                                        title="Larger"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Color Picker */}
                                                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl px-2">
                                                    <div className="flex items-center gap-1">
                                                        {['#ffffff', '#000000', '#bfa181', '#ef4444'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), color } as any })}
                                                                className={`w-4 h-4 rounded-full border border-white shadow-sm transition-transform hover:scale-125 ${element.textStyle?.color === color ? 'ring-2 ring-teal-500' : ''}`}
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="w-[1px] h-4 bg-slate-200" />
                                                    <div className="relative w-6 h-6 rounded-lg flex items-center justify-center bg-white border border-slate-100 shadow-sm group/color overflow-hidden">
                                                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                                                        <input
                                                            type="color"
                                                            value={element.textStyle?.color || '#ffffff'}
                                                            onChange={(e) => handleUpdate({ textStyle: { ...(element.textStyle || {}), color: e.target.value } as any })}
                                                            className="w-full h-full opacity-0 absolute cursor-pointer inset-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Spacing Group (Line Height & Letter Spacing) */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {/* Line Height */}
                                                <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 px-3 rounded-xl border border-slate-100">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Line Height</span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), lineHeight: Math.max(0.5, parseFloat(Number((element.textStyle?.lineHeight || 1.2) - 0.1).toFixed(1))) } as any })}
                                                            className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-[10px] font-black text-slate-700 min-w-[28px] text-center">
                                                            {Number(element.textStyle?.lineHeight || 1.2).toFixed(1)}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), lineHeight: Math.min(3, parseFloat(Number((element.textStyle?.lineHeight || 1.2) + 0.1).toFixed(1))) } as any })}
                                                            className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Letter Spacing */}
                                                <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 px-3 rounded-xl border border-slate-100">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Spacing</span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), letterSpacing: Math.max(-10, (element.textStyle?.letterSpacing || 0) - 1) } as any })}
                                                            className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-[10px] font-black text-slate-700 min-w-[28px] text-center">
                                                            {element.textStyle?.letterSpacing || 0}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), letterSpacing: Math.min(100, (element.textStyle?.letterSpacing || 0) + 1) } as any })}
                                                            className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {/* Countdown Date Field */}
            {element.type === 'countdown' && element.countdownConfig && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tanggal Target
                    </label>
                    <input
                        type="datetime-local"
                        disabled={!permissions.canEditText}
                        value={element.countdownConfig.targetDate?.slice(0, 16) || ''}
                        onChange={(e) => handleUpdate({
                            countdownConfig: {
                                ...element.countdownConfig!,
                                targetDate: new Date(e.target.value).toISOString()
                            } as typeof element.countdownConfig
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none ${!permissions.canEditText ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
            )}

            {/* Image Field */}
            {(element.type === 'image' || element.type === 'gif' || element.type === 'profile_photo') && (
                <div className="space-y-3">
                    {permissions.canEditImage && !element.isLocked ? (
                        <div
                            onClick={() => {
                                // For profile_photo, we want to trigger the input in the element itself if possible, 
                                // but here we can just handle the file selection directly or use a hidden input here.
                                // Actually, let's just trigger a click on a hidden input we can add here for simplicity 
                                // if we want it to work from this panel.
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            handleUpdate({ imageUrl: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                };
                                input.click();
                            }}
                            className="relative group/upload h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-all"
                        >
                            {element.imageUrl ? (
                                <img src={element.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-[calc(1rem-2px)] opacity-50 group-hover/upload:opacity-30 transition-opacity" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                                    <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                                    {element.type === 'profile_photo' ? 'Upload Profile Photo' : 'Pilih Foto'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                            {element.imageUrl ? (
                                <img src={element.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl opacity-40 grayscale" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-200" />
                            )}
                            <div className="absolute flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                <Lock className="w-3 h-3" /> Foto Dikunci
                            </div>
                        </div>
                    )}

                    {element.type === 'profile_photo' && element.profilePhotoConfig?.showLabel && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Keterangan Foto
                            </label>
                            <input
                                type="text"
                                value={element.profilePhotoConfig.label || ''}
                                onChange={(e) => handleUpdate({
                                    profilePhotoConfig: {
                                        ...element.profilePhotoConfig!,
                                        label: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                                placeholder="Contoh: Mempelai Pria"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Maps Field */}
            {element.type === 'maps_point' && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Maps URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={element.mapsConfig?.googleMapsUrl || ''}
                                onChange={(e) => handleUpdate({
                                    mapsConfig: { ...element.mapsConfig!, googleMapsUrl: e.target.value } as typeof element.mapsConfig
                                })}
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                                placeholder="https://maps.app.goo.gl/..."
                            />
                            <a
                                href={element.mapsConfig?.googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-teal-500 hover:shadow-md transition-all"
                            >
                                <MapPin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Streaming Configuration */}
            {element.type === 'live_streaming' && element.liveStreamingConfig && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Streaming</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'youtube', label: 'YouTube' },
                                { id: 'zoom', label: 'Zoom' },
                                { id: 'meet', label: 'Meet' },
                                { id: 'instagram', label: 'Instagram' },
                                { id: 'tiktok', label: 'TikTok' },
                                { id: 'other', label: 'Lainnya' }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleUpdate({
                                        liveStreamingConfig: { ...element.liveStreamingConfig!, platform: p.id as any }
                                    })}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${element.liveStreamingConfig?.platform === p.id
                                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Live Streaming</label>
                        <input
                            type="url"
                            value={element.liveStreamingConfig.url || ''}
                            onChange={(e) => handleUpdate({
                                liveStreamingConfig: { ...element.liveStreamingConfig!, url: e.target.value }
                            })}
                            placeholder="https://youtube.com/live/..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                        />
                    </div>
                </div>
            )}

            {element.type === 'social_mockup' && element.socialMockupConfig && (
                <div className="space-y-5">
                    {/* Platform Selection */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'instagram', label: 'Instagram' },
                                { id: 'whatsapp', label: 'WhatsApp' },
                                { id: 'tiktok', label: 'TikTok' },
                                { id: 'twitter', label: 'Twitter (X)' },
                                { id: 'other', label: 'Lainnya' }
                            ].map((platform) => (
                                <button
                                    key={platform.id}
                                    onClick={() => handleUpdate({
                                        socialMockupConfig: { ...element.socialMockupConfig!, platform: platform.id as any }
                                    })}
                                    className={`px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border text-center ${element.socialMockupConfig?.platform === platform.id
                                        ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm'
                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                                        }`}
                                >
                                    {platform.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Username / ID
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm transition-colors group-focus-within:text-teal-500">@</div>
                            <input
                                type="text"
                                value={element.socialMockupConfig.username || ''}
                                onChange={(e) => handleUpdate({
                                    socialMockupConfig: {
                                        ...element.socialMockupConfig!,
                                        username: e.target.value
                                    }
                                })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    {/* Icon Visibility Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl group hover:border-teal-200 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tampilkan Icon</span>
                            <span className="text-[9px] text-slate-400">Aktifkan logo sosial media</span>
                        </div>
                        <button
                            onClick={() => handleUpdate({
                                socialMockupConfig: {
                                    ...element.socialMockupConfig!,
                                    showIcon: !(element.socialMockupConfig?.showIcon ?? true)
                                }
                            })}
                            className={`w-11 h-6 rounded-full transition-all flex items-center px-1 ${element.socialMockupConfig?.showIcon !== false ? 'bg-teal-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${element.socialMockupConfig?.showIcon !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            )}

            {element.type === 'profile_card' && element.profileCardConfig && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            disabled={!permissions.canEditText}
                            value={element.profileCardConfig.name || ''}
                            onChange={(e) => handleUpdate({
                                profileCardConfig: {
                                    ...element.profileCardConfig!,
                                    name: e.target.value
                                }
                            })}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none ${!permissions.canEditText ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="Contoh: Budi Santoso"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Ukuran Font
                            </label>
                            <input
                                type="number"
                                disabled={!permissions.canEditStyle}
                                value={element.profileCardConfig.fontSize || 24}
                                onChange={(e) => handleUpdate({
                                    profileCardConfig: {
                                        ...element.profileCardConfig!,
                                        fontSize: parseInt(e.target.value) || 16
                                    }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Perataan Teks
                            </label>
                            <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-1 gap-1">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                        key={align}
                                        disabled={!permissions.canEditStyle}
                                        onClick={() => handleUpdate({
                                            profileCardConfig: {
                                                ...element.profileCardConfig!,
                                                textAlign: align
                                            }
                                        })}
                                        className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${element.profileCardConfig?.textAlign === align
                                            ? 'bg-white text-teal-600 shadow-sm border border-slate-100'
                                            : 'text-slate-400 hover:text-slate-600'
                                            } disabled:opacity-50`}
                                    >
                                        {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                        {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                        {align === 'right' && <AlignRight className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Designer Note */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                        <Lock className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Desain Dikunci</span>
                            <span className="text-[10px] text-amber-600/80 leading-relaxed font-medium">
                                Varian background dan warna diatur oleh Admin untuk menjaga keindahan desain undangan Anda.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {element.type === 'quote' && element.quoteConfig && (
                <>
                    <div className="space-y-4">
                        {/* Tab Switcher for Quote Editor */}
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                            <button
                                onClick={() => setShowStyling(false)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!showStyling ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Kustom
                            </button>
                            <button
                                onClick={() => setShowStyling(true)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${showStyling ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Dari Library
                            </button>
                        </div>

                        {!showStyling ? (
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teks Arab (Opsional)</label>
                                    <textarea
                                        value={element.quoteConfig.textArabic || ''}
                                        onChange={(e) => handleUpdate({
                                            quoteConfig: { ...element.quoteConfig!, textArabic: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none h-20 font-arabic text-right"
                                        dir="rtl"
                                        placeholder="Tuliskan teks Arab jika ada..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terjemahan / Kutipan</label>
                                    <textarea
                                        value={element.quoteConfig.text || ''}
                                        onChange={(e) => handleUpdate({
                                            quoteConfig: { ...element.quoteConfig!, text: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none h-24"
                                        placeholder="Tuliskan kata-kata mutiara atau kutipan..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penulis / Nama</label>
                                    <input
                                        type="text"
                                        value={element.quoteConfig.author || ''}
                                        onChange={(e) => handleUpdate({
                                            quoteConfig: { ...element.quoteConfig!, author: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                                        placeholder="Contoh: Anonymous, Nama Pasangan, dsb."
                                    />
                                </div>
                            </m.div>
                        ) : (
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3 max-h-[300px] overflow-y-auto pr-1"
                            >
                                {QUOTES_LIBRARY.map((quote) => (
                                    <button
                                        key={quote.id}
                                        onClick={() => handleUpdate({
                                            quoteConfig: {
                                                ...element.quoteConfig!,
                                                text: quote.text,
                                                textArabic: quote.textArabic,
                                                category: quote.category,
                                                author: quote.author
                                            }
                                        })}
                                        className="w-full text-left p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/50 transition-all space-y-2 group"
                                    >
                                        {quote.textArabic && (
                                            <p className="text-sm text-slate-800 font-arabic text-right leading-relaxed" dir="rtl">
                                                {quote.textArabic}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-600 italic leading-relaxed line-clamp-3">
                                            {quote.text}
                                        </p>
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                                            <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">{quote.author}</span>
                                            <Check className="w-3 h-3 text-teal-500 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </button>
                                ))}
                            </m.div>
                        )}

                        {/* Color Settings for Users - Always accessible below */}
                        <div className="pt-2 border-t border-slate-100">
                            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Warna & Gaya</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <input
                                            type="color"
                                            value={element.quoteConfig.quoteColor || '#ffffff'}
                                            onChange={(e) => handleUpdate({ quoteConfig: { ...element.quoteConfig!, quoteColor: e.target.value } })}
                                            className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block text-center">Teks</span>
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="color"
                                            value={element.quoteConfig.authorColor || '#ffffff'}
                                            onChange={(e) => handleUpdate({ quoteConfig: { ...element.quoteConfig!, authorColor: e.target.value } })}
                                            className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block text-center">Penulis</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-slate-100" />
                </>
            )}

            {/* Love Story Management */}
            {element.type === 'love_story' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Momen Kisah Cinta
                        </label>
                        <button
                            onClick={() => {
                                const newMoment: LoveStoryMoment = {
                                    id: Date.now().toString(),
                                    date: new Date().getFullYear().toString(),
                                    title: 'Momen Baru',
                                    description: ''
                                };
                                const currentConfig = element.loveStoryConfig || {
                                    variant: 'zigzag',
                                    markerStyle: 'heart',
                                    themeColor: '#bfa181',
                                    lineThickness: 2,
                                    events: []
                                };
                                handleUpdate({
                                    loveStoryConfig: {
                                        ...currentConfig,
                                        events: [...currentConfig.events, newMoment]
                                    }
                                });
                            }}
                            className="flex items-center gap-1.5 text-[9px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                            Tambah
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(element.loveStoryConfig?.events || []).map((event, idx) => (
                            <div key={event.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 group/event relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{idx + 1}</span>
                                    <button
                                        onClick={() => {
                                            if (!element.loveStoryConfig) return;
                                            handleUpdate({
                                                loveStoryConfig: {
                                                    ...element.loveStoryConfig,
                                                    events: element.loveStoryConfig.events.filter(e => e.id !== event.id)
                                                }
                                            });
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun/Tanggal</label>
                                        <input
                                            type="text"
                                            value={event.date}
                                            onChange={(e) => {
                                                if (!element.loveStoryConfig) return;
                                                const updatedEvents = element.loveStoryConfig.events.map(ev => ev.id === event.id ? { ...ev, date: e.target.value } : ev);
                                                handleUpdate({ loveStoryConfig: { ...element.loveStoryConfig, events: updatedEvents } });
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Momen</label>
                                        <input
                                            type="text"
                                            value={event.title}
                                            onChange={(e) => {
                                                if (!element.loveStoryConfig) return;
                                                const updatedEvents = element.loveStoryConfig.events.map(ev => ev.id === event.id ? { ...ev, title: e.target.value } : ev);
                                                handleUpdate({ loveStoryConfig: { ...element.loveStoryConfig, events: updatedEvents } });
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Cerita Singkat</label>
                                    <textarea
                                        value={event.description}
                                        onChange={(e) => {
                                            if (!element.loveStoryConfig) return;
                                            const updatedEvents = element.loveStoryConfig.events.map(ev => ev.id === event.id ? { ...ev, description: e.target.value } : ev);
                                            handleUpdate({ loveStoryConfig: { ...element.loveStoryConfig, events: updatedEvents } });
                                        }}
                                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-600 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </m.div>
    );
};
