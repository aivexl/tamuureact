import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable, { OnDrag, OnDragEnd, OnScale, OnScaleEnd, OnRotate, OnRotateEnd, OnDragGroup, OnScaleGroup, OnRotateGroup, OnDragGroupEnd, OnScaleGroupEnd, OnRotateGroupEnd } from 'react-moveable';
import { useStore, SECTION_ICONS } from '@/store/useStore';
import { CanvasElement } from './CanvasElement';
import { Section, ZoomPoint } from '@/store/sectionsSlice';
import { Layer } from '@/store/layersSlice';
import {
    ChevronUp, ChevronDown, Eye, EyeOff, Copy, Trash2, Eraser, Zap, Group, Ungroup,
    MoveUp, MoveDown, Maximize, Minimize, LayoutDashboard, MousePointer2
} from 'lucide-react';

// ============================================
// HELPER COMPONENTS
// Professional Action Button for Toolbar
// ============================================
const ToolbarButton: React.FC<{
    onClick: (e: React.MouseEvent) => void;
    icon: React.ReactNode;
    title: string;
    disabled?: boolean;
    variant?: 'default' | 'danger' | 'premium';
}> = ({ onClick, icon, title, disabled, variant = 'default' }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onClick(e);
        }}
        disabled={disabled}
        className={`p-1.5 rounded-full transition-all flex items-center justify-center relative group/btn ${disabled ? 'opacity-20 cursor-not-allowed' :
            variant === 'danger'
                ? 'text-red-400 hover:bg-red-500 hover:text-white'
                : variant === 'premium'
                    ? 'text-premium-dark hover:bg-black/20'
                    : 'text-white/70 hover:bg-white/10 hover:text-premium-accent'
            }`}
        title={title}
    >
        {icon}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-[10px] text-white font-bold rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-[100]">
            {title}
        </div>
    </motion.button>
);

const CANVAS_WIDTH = 414;
const SECTION_HEIGHT = 896;

// ============================================
// SEAMLESS CANVAS COMPONENT
// ============================================
export const SeamlessCanvas: React.FC = () => {
    const {
        sections, activeSectionId, setActiveSection,
        updateElementInSection, updateSection,
        selectLayer, selectLayers, selectedLayerId, selectedLayerIds, clearSelection,
        reorderSections, removeSection, duplicateSection, copySectionElementsTo, clearSectionContent,
        // New section-aware element actions
        duplicateElementInSection, bringElementToFront, sendToBack, sendElementToBack,
        moveElementUp, moveElementDown, alignElements, distributeElements, matchSize,
        removeElementFromSection
    } = useStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1); // Feature 10: Zoom State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null); // Feature 4: Context Menu

    // Modal State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copySourceId, setCopySourceId] = useState<string | null>(null);

    const handleOpenCopyModal = (id: string) => { setCopySourceId(id); setShowCopyModal(true); };
    const handleCopyElements = (targetId: string) => {
        if (copySourceId && targetId) { copySectionElementsTo(copySourceId, targetId); setShowCopyModal(false); }
    };

    const sortedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);

    // Keyboard Shortcuts (CTO Level - Figma/Canva standard)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent shortcuts if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;
            const hasSelection = selectedLayerIds.length > 0;
            const activeSection = sections.find(s => s.id === activeSectionId);

            // Nudge (Arrows)
            if (hasSelection && activeSection && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                selectedLayerIds.forEach(id => {
                    const el = activeSection.elements.find(layer => layer.id === id);
                    if (el) {
                        const updates: any = {};
                        if (e.key === 'ArrowLeft') updates.x = el.x - step;
                        if (e.key === 'ArrowRight') updates.x = el.x + step;
                        if (e.key === 'ArrowUp') updates.y = el.y - step;
                        if (e.key === 'ArrowDown') updates.y = el.y + step;
                        updateElementInSection(activeSection.id, id, updates);
                    }
                });
            }

            // Group/Ungroup
            if (isMod && e.key === 'g') {
                e.preventDefault();
                if (e.shiftKey) handleUngroupSelected();
                else handleGroupSelected();
            }

            // Duplicate
            if (isMod && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                if (hasSelection && activeSectionId) {
                    selectedLayerIds.forEach(id => duplicateElementInSection(activeSectionId, id));
                }
            }

            // Delete
            if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection && activeSectionId) {
                e.preventDefault();
                selectedLayerIds.forEach(id => removeElementFromSection(activeSectionId, id));
                clearSelection();
            }

            // Layer Order
            if (isMod && hasSelection && activeSectionId) {
                if (e.key === ']') {
                    e.preventDefault();
                    if (e.shiftKey) selectedLayerIds.forEach(id => bringElementToFront(activeSectionId, id));
                    else selectedLayerIds.forEach(id => moveElementUp(activeSectionId, id));
                }
                if (e.key === '[') {
                    e.preventDefault();
                    if (e.shiftKey) selectedLayerIds.forEach(id => sendElementToBack(activeSectionId, id));
                    else selectedLayerIds.forEach(id => moveElementDown(activeSectionId, id));
                }
            }

            // Select All
            if (isMod && e.key === 'a') {
                e.preventDefault();
                if (activeSection) {
                    selectLayers(activeSection.elements.map(el => el.id));
                }
            }

            if (e.key === 'Escape') clearSelection();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerIds, activeSectionId, sections]);

    // Marquee Selection State
    const [marquee, setMarquee] = useState<{ x1: number, y1: number, x2: number, y2: number, active: boolean, sectionId: string | null } | null>(null);

    const handleMarqueeStart = (sectionId: string, x: number, y: number) => {
        setMarquee({ x1: x, y1: y, x2: x, y2: y, active: true, sectionId });
        clearSelection();
    };

    const handleMarqueeMove = (x: number, y: number) => {
        if (!marquee || !marquee.active) return;
        setMarquee(prev => prev ? { ...prev, x2: x, y2: y } : null);
    };

    const handleMarqueeEnd = () => {
        if (!marquee || !marquee.active) return;

        const section = sections.find(s => s.id === marquee.sectionId);
        if (section) {
            const xMin = Math.min(marquee.x1, marquee.x2);
            const xMax = Math.max(marquee.x1, marquee.x2);
            const yMin = Math.min(marquee.y1, marquee.y2);
            const yMax = Math.max(marquee.y1, marquee.y2);

            const hits = section.elements.filter(el => {
                const elXMid = el.x + el.width / 2;
                const elYMid = el.y + el.height / 2;
                return elXMid >= xMin && elXMid <= xMax && elYMid >= yMin && elYMid <= yMax;
            }).map(el => el.id);

            if (hits.length > 0) selectLayers(hits);
        }
        setMarquee(null);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const scrollCenter = scrollTop + containerHeight / 2;
            let currentVisibleId = null;
            for (let i = 0; i < sortedSections.length; i++) {
                const sectionTop = i * (SECTION_HEIGHT + 64);
                const sectionBottom = sectionTop + SECTION_HEIGHT;
                if (scrollCenter >= sectionTop && scrollCenter <= sectionBottom) {
                    currentVisibleId = sortedSections[i].id;
                    break;
                }
            }
            if (currentVisibleId && currentVisibleId !== visibleSectionId) setVisibleSectionId(currentVisibleId);
        };
        container.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => container.removeEventListener('scroll', handleScroll);
    }, [sortedSections, visibleSectionId]);

    // Grouping Logics (CTO Implementation)
    const handleGroupSelected = () => {
        if (selectedLayerIds.length < 2) return;
        const groupId = `group-${Date.now()}`;
        selectedLayerIds.forEach(id => {
            if (activeSectionId) updateElementInSection(activeSectionId, id, { groupId });
        });
    };

    const handleUngroupSelected = () => {
        selectedLayerIds.forEach(id => {
            if (activeSectionId) updateElementInSection(activeSectionId, id, { groupId: undefined });
        });
    };

    // Feature 10: Zoom Actions
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    // Feature 4: Context Menu Actions
    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, id });
    };

    const handleAction = (type: 'front' | 'back' | 'up' | 'down' | 'duplicate' | 'delete') => {
        if (!contextMenu || !activeSectionId) return;
        const { id } = contextMenu;

        if (type === 'duplicate') duplicateElementInSection(activeSectionId, id);
        if (type === 'delete') {
            removeElementFromSection(activeSectionId, id);
            clearSelection();
        }
        if (type === 'front') bringElementToFront(activeSectionId, id);
        if (type === 'back') sendElementToBack(activeSectionId, id);
        if (type === 'up') moveElementUp(activeSectionId, id);
        if (type === 'down') moveElementDown(activeSectionId, id);

        setContextMenu(null);
    };

    return (
        <div className="w-full h-full bg-[#111111] overflow-hidden flex flex-col relative select-none">
            <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar flex justify-center py-12">
                <div className="flex flex-col gap-16">
                    {sortedSections.map((section, index) => (
                        <SectionFrame
                            key={section.id}
                            section={section}
                            isActive={activeSectionId === section.id}
                            index={index}
                            onClick={() => setActiveSection(section.id)}
                            onSelectLayer={(id, isMulti) => selectLayer(id, isMulti)}
                            selectedLayerIds={selectedLayerIds}
                            zoom={zoom}
                            onElementDrag={(id, pos) => updateElementInSection(section.id, id, pos)}
                            onElementResize={(id, updates) => updateElementInSection(section.id, id, updates)}
                            onContextMenu={handleContextMenu}
                            onDimensionsDetected={(id: string, w: number, h: number) => {
                                // CTO SMART-SNAP V2: Only resize placeholders & maintain center
                                const sectionId = section.id;
                                const layer = section.elements.find((el: Layer) => el.id === id);
                                if (!layer) return;

                                // 1. Strict Placeholder Check: Only auto-snap if it's the specific initial dimensions
                                // This prevents re-snapping elements the user has already adjusted.
                                const isInitialPlaceholder = (layer.width === 100 && layer.height === 100) ||
                                    (layer.width === 200 && layer.height === 200);

                                if (isInitialPlaceholder) {
                                    const ratio = w / h;

                                    // Calculate target width (bounded for ornaments, but respects natural ratio)
                                    let targetW = 200;
                                    let targetH = 200 / ratio;

                                    // If too tall, bound by height
                                    if (targetH > 350) {
                                        targetH = 300;
                                        targetW = 300 * ratio;
                                    }

                                    const finalW = Math.round(targetW);
                                    const finalH = Math.round(targetH);

                                    if (layer.width !== finalW || layer.height !== finalH) {
                                        // CRITICAL: Preserve the Center Point
                                        // newX = currentCenterX - (newWidth / 2)
                                        const currentCenterX = layer.x + (layer.width / 2);
                                        const currentCenterY = layer.y + (layer.height / 2);

                                        const newX = Math.round(currentCenterX - (finalW / 2));
                                        const newY = Math.round(currentCenterY - (finalH / 2));

                                        updateElementInSection(sectionId, id, {
                                            width: finalW,
                                            height: finalH,
                                            x: newX,
                                            y: newY
                                        });
                                    }
                                }
                            }}
                            onMoveUp={() => reorderSections(index, index - 1)}
                            onMoveDown={() => reorderSections(index, index + 1)}
                            onToggleVisibility={() => updateSection(section.id, { isVisible: section.isVisible !== false ? false : true })}
                            onCopyTo={() => handleOpenCopyModal(section.id)}
                            onClear={() => clearSectionContent(section.id)}
                            onDelete={() => removeSection(section.id)}
                            isFirst={index === 0}
                            isLast={index === sections.length - 1}
                            marquee={marquee?.sectionId === section.id ? marquee : null}
                            onMarqueeStart={handleMarqueeStart}
                            onMarqueeMove={handleMarqueeMove}
                            onMarqueeEnd={handleMarqueeEnd}
                        />
                    ))}
                </div>
            </div>

            {/* Enterprise Floating Toolbar (Figma/Canva inspired) */}
            <AnimatePresence>
                {selectedLayerIds.length > 0 && activeSectionId && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 flex items-center gap-2 bg-[#1A1A1A]/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-3xl z-[1000] scale-90 md:scale-100"
                    >
                        {/* Selection Count */}
                        <div className="flex items-center gap-2 px-3 border-r border-white/10 mr-1">
                            <div className="w-5 h-5 rounded-full bg-premium-accent flex items-center justify-center">
                                <span className="text-premium-dark text-[10px] font-bold">{selectedLayerIds.length}</span>
                            </div>
                        </div>

                        {/* Alignment Section (Only for multi-select) */}
                        {selectedLayerIds.length > 1 && (
                            <div className="flex items-center gap-1 pr-2 border-r border-white/10 mr-1">
                                <ToolbarButton
                                    onClick={() => alignElements(activeSectionId, selectedLayerIds, 'left')}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="2" height="16" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" /><rect x="7" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Left"
                                />
                                <ToolbarButton
                                    onClick={() => alignElements(activeSectionId, selectedLayerIds, 'center')}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="11" y="4" width="2" height="16" rx="0.5" fill="currentColor" /><rect x="5" y="7" width="14" height="4" rx="1" fill="currentColor" opacity="0.5" /><rect x="7" y="13" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Horizontal Center"
                                />
                                <ToolbarButton
                                    onClick={() => alignElements(activeSectionId, selectedLayerIds, 'right')}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="19" y="4" width="2" height="16" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" /><rect x="11" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Right"
                                />
                                <div className="w-px h-4 bg-white/5 mx-0.5" />
                                <ToolbarButton
                                    onClick={() => alignElements(activeSectionId, selectedLayerIds, 'top')}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="2" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" /><rect x="13" y="7" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Top"
                                />
                                <ToolbarButton
                                    onClick={() => alignElements(activeSectionId, selectedLayerIds, 'middle')}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="2" rx="0.5" fill="currentColor" /><rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" /><rect x="13" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Vertical Center"
                                />
                                <ToolbarButton
                                    onClick={() => alignElements(activeSectionId, selectedLayerIds, 'bottom')}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="19" width="16" height="2" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" /><rect x="13" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Bottom"
                                />
                                <div className="w-px h-4 bg-white/5 mx-0.5" />
                                <ToolbarButton onClick={() => distributeElements(activeSectionId, selectedLayerIds, 'horizontal')} icon={<Maximize className="w-4 h-4 rotate-90" />} title="Distribute Horizontally" />
                                <ToolbarButton onClick={() => distributeElements(activeSectionId, selectedLayerIds, 'vertical')} icon={<Maximize className="w-4 h-4" />} title="Distribute Vertically" />
                            </div>
                        )}

                        {/* Order & Grouping */}
                        <div className="flex items-center gap-1 pr-2 border-r border-white/10 mr-1">
                            <ToolbarButton onClick={() => selectedLayerIds.forEach(id => bringElementToFront(activeSectionId, id))} icon={<ChevronUp className="w-4 h-4" />} title="Bring to Front" />
                            <ToolbarButton onClick={() => selectedLayerIds.forEach(id => sendElementToBack(activeSectionId, id))} icon={<ChevronDown className="w-4 h-4" />} title="Send to Back" />
                            <div className="w-px h-4 bg-white/5 mx-0.5" />
                            <ToolbarButton onClick={handleGroupSelected} icon={<Group className="w-4 h-4" />} title="Group (Ctrl+G)" disabled={selectedLayerIds.length < 2} />
                            <ToolbarButton onClick={handleUngroupSelected} icon={<Ungroup className="w-4 h-4" />} title="Ungroup" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <ToolbarButton onClick={() => selectedLayerIds.forEach(id => duplicateElementInSection(activeSectionId, id))} icon={<Copy className="w-4 h-4" />} title="Duplicate (Ctrl+D)" />
                            <ToolbarButton onClick={() => {
                                selectedLayerIds.forEach(id => removeElementFromSection(activeSectionId, id));
                                clearSelection();
                            }} icon={<Trash2 className="w-4 h-4" />} title="Delete (Del)" variant="danger" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feature 4: Enterprise Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                        className="fixed bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-xl py-2 shadow-4xl z-[9999] min-w-[200px] overflow-hidden"
                        onMouseLeave={() => setContextMenu(null)}
                    >
                        <div className="px-3 py-1 mb-1 border-b border-white/5">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Arrange</span>
                        </div>
                        <ContextItem icon={<Zap className="w-3.5 h-3.5" />} label="Bring to Front" shortcut="Ctrl+Shift+]" onClick={() => handleAction('front')} />
                        <ContextItem icon={<MoveUp className="w-3.5 h-3.5" />} label="Move Up" shortcut="Ctrl+]" onClick={() => handleAction('up')} />
                        <ContextItem icon={<MoveDown className="w-3.5 h-3.5" />} label="Move Down" shortcut="Ctrl+[" onClick={() => handleAction('down')} />
                        <ContextItem icon={<ChevronDown className="w-3.5 h-3.5" />} label="Send to Back" shortcut="Ctrl+Shift+[" onClick={() => handleAction('back')} />

                        <div className="h-px bg-white/5 my-1" />
                        <div className="px-3 py-1 mb-1 border-b border-white/5">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Modify</span>
                        </div>
                        <ContextItem icon={<Copy className="w-3.5 h-3.5" />} label="Duplicate" shortcut="Ctrl+D" onClick={() => handleAction('duplicate')} />
                        <ContextItem icon={<Group className="w-3.5 h-3.5" />} label="Group" shortcut="Ctrl+G" onClick={handleGroupSelected} />

                        <div className="h-px bg-white/5 my-1" />
                        <ContextItem icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />} label="Delete" shortcut="Del" variant="danger" onClick={() => handleAction('delete')} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feature 10: Zoom Controls */}
            <div className="absolute top-10 right-10 flex flex-col gap-2 z-[1001]">
                <ToolbarButton onClick={handleZoomIn} icon={<span className="font-bold">+</span>} title="Zoom In" />
                <div className="bg-black/50 backdrop-blur rounded-lg px-2 py-1 text-[10px] text-white/50 text-center font-mono">
                    {Math.round(zoom * 100)}%
                </div>
                <ToolbarButton onClick={handleZoomOut} icon={<span className="font-bold">-</span>} title="Zoom Out" />
            </div>
        </div >
    );
};

const ContextItem: React.FC<{
    icon: React.ReactNode,
    label: string,
    shortcut?: string,
    onClick: () => void,
    variant?: 'danger' | 'default'
}> = ({ icon, label, shortcut, onClick, variant = 'default' }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors hover:bg-white/5 ${variant === 'danger' ? 'text-red-400' : 'text-white/80'}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            {label}
        </div>
        {shortcut && (
            <span className="text-[10px] text-white/20 font-mono tabular-nums">{shortcut}</span>
        )}
    </button>
);

// ============================================
// SECTION FRAME COMPONENT (Centralized Interaction)
// ============================================
const SectionFrame: React.FC<{
    section: Section,
    isActive: boolean,
    index: number,
    onClick: () => void,
    onSelectLayer: (id: string | null, isMulti?: boolean) => void,
    selectedLayerIds: string[],
    zoom: number,
    onElementDrag: (id: string, pos: { x: number, y: number }) => void,
    onElementResize: (id: string, updates: Partial<Layer>) => void,
    onDimensionsDetected: (id: string, w: number, h: number) => void,
    onContextMenu: (e: React.MouseEvent, id: string) => void,
    onMoveUp: () => void,
    onMoveDown: () => void,
    onToggleVisibility: () => void,
    onCopyTo: () => void,
    onClear: () => void,
    onDelete: () => void,
    isFirst: boolean,
    isLast: boolean,
    marquee: { x1: number, y1: number, x2: number, y2: number, active: boolean, sectionId: string | null } | null,
    onMarqueeStart: (sectionId: string, x: number, y: number) => void,
    onMarqueeMove: (x: number, y: number) => void,
    onMarqueeEnd: () => void
}> = ({
    section, isActive, index, onClick, onSelectLayer, selectedLayerIds,
    onElementResize, onDimensionsDetected, onContextMenu, onMoveUp, onMoveDown, onToggleVisibility, onCopyTo, onClear, onDelete, isFirst, isLast,
    marquee, onMarqueeStart, onMarqueeMove, onMarqueeEnd, zoom
}) => {
        // Collect DOM targets for Moveable
        const targetMap = useRef<Map<string, HTMLDivElement>>(new Map());
        const [targets, setTargets] = useState<HTMLDivElement[]>([]);

        useEffect(() => {
            const activeTargets = selectedLayerIds
                .map((id: string) => targetMap.current.get(id))
                .filter(Boolean) as HTMLDivElement[];
            setTargets(activeTargets);
        }, [selectedLayerIds, section.elements]);

        const registerTarget = (id: string, el: HTMLDivElement | null) => {
            if (el) targetMap.current.set(id, el); else targetMap.current.delete(id);
        };

        return (
            <motion.div className="relative group" initial={false} animate={{ opacity: 1 }}>
                {/* Header */}
                <div className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-1 h-8 z-50 group-header`}>
                    <div className="flex items-center gap-3 text-[11px]">
                        <span className="font-bold uppercase tracking-widest text-premium-accent">{section.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ToolbarButton onClick={onMoveUp} icon={<ChevronUp className="w-3.5 h-3.5" />} title="Move Up" disabled={isFirst} />
                        <ToolbarButton onClick={onMoveDown} icon={<ChevronDown className="w-3.5 h-3.5" />} title="Move Down" disabled={isLast} />
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <ToolbarButton onClick={onToggleVisibility} icon={section.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />} title="Toggle Visibility" />
                        <ToolbarButton onClick={onCopyTo} icon={<Copy className="w-3.5 h-3.5" />} title="Copy Section" />
                        <ToolbarButton onClick={onClear} icon={<Eraser className="w-3.5 h-3.5" />} title="Clear Section" />
                        <ToolbarButton onClick={onDelete} icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />} title="Delete Section" variant="danger" />
                    </div>
                </div>

                <motion.div
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onMarqueeStart(section.id, e.clientX - rect.left, e.clientY - rect.top);
                        }
                        onClick();
                    }}
                    onMouseMove={(e) => {
                        if (marquee) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onMarqueeMove(e.clientX - rect.left, e.clientY - rect.top);
                        }
                    }}
                    onMouseUp={() => onMarqueeEnd()}
                    className={`relative shadow-2xl rounded-2xl overflow-hidden transition-all ${isActive ? 'ring-2 ring-premium-accent ring-offset-4 ring-offset-[#050505]' : 'ring-1 ring-white/10'}`}
                    style={{
                        width: CANVAS_WIDTH,
                        height: SECTION_HEIGHT,
                        backgroundColor: section.backgroundColor || '#0a0a0a',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center'
                    }}>

                    {section.elements.map((element: Layer) => (
                        <CanvasElement
                            key={element.id}
                            layer={element}
                            isSelected={selectedLayerIds.includes(element.id)}
                            onSelect={(isMulti) => {
                                onSelectLayer(element.id, isMulti);
                                onClick();
                            }}
                            onContextMenu={(e) => onContextMenu(e, element.id)}
                            onDimensionsDetected={(w, h) => onDimensionsDetected(element.id, w, h)}
                            elementRef={(el: HTMLDivElement | null) => registerTarget(element.id, el)}
                            updateLayer={(id, updates) => onElementResize(id, updates)}
                        />
                    ))}

                    {/* Marquee Visual */}
                    {marquee && (
                        <div className="absolute border border-premium-accent bg-premium-accent/10 pointer-events-none z-[1000]"
                            style={{
                                left: Math.min(marquee.x1, marquee.x2),
                                top: Math.min(marquee.y1, marquee.y2),
                                width: Math.abs(marquee.x1 - marquee.x2),
                                height: Math.abs(marquee.y1 - marquee.y2)
                            }} />
                    )}

                    {/* CENTRALIZED MOVEABLE (Enterprise Level) */}
                    {isActive && targets.length > 0 && (
                        <Moveable
                            {...({} as any)}
                            target={targets}
                            draggable={true}
                            scalable={true}
                            rotatable={true}
                            snappable={true}
                            keepRatio={true}
                            elementGuidelines={[...targets]}
                            snapGap={5}
                            snapThreshold={5}
                            isDisplaySnapDigit={false}
                            snapElement={true}
                            snapVertical={true}
                            snapHorizontal={true}
                            snapCenter={true}

                            // Single Target Events
                            onDrag={(e: OnDrag) => {
                                const id = e.target.getAttribute('data-element-id');
                                if (id) onElementResize(id, { x: e.left, y: e.top });
                            }}
                            onScale={(e: OnScale) => {
                                const id = e.target.getAttribute('data-element-id');
                                const scale = e.drag.transform.match(/scale\(([^)]+)\)/)?.[1];
                                if (id && scale) onElementResize(id, { scale: parseFloat(scale) });
                            }}
                            onRotate={(e: OnRotate) => {
                                const id = e.target.getAttribute('data-element-id');
                                if (id) onElementResize(id, { rotation: e.rotate });
                            }}

                            // Group Events
                            onDragGroup={(e: OnDragGroup) => {
                                e.events.forEach((ev) => {
                                    const id = ev.target.getAttribute('data-element-id');
                                    if (id) onElementResize(id, { x: ev.left, y: ev.top });
                                });
                            }}
                            onScaleGroup={(e: OnScaleGroup) => {
                                e.events.forEach((ev) => {
                                    const id = ev.target.getAttribute('data-element-id');
                                    const scale = ev.drag.transform.match(/scale\(([^)]+)\)/)?.[1];
                                    if (id && scale) onElementResize(id, { scale: parseFloat(scale) });
                                });
                            }}
                            onRotateGroup={(e: OnRotateGroup) => {
                                e.events.forEach((ev) => {
                                    const id = ev.target.getAttribute('data-element-id');
                                    if (id) onElementResize(id, { rotation: ev.rotate });
                                });
                            }}

                            className="custom-moveable"
                        />
                    )}
                </motion.div>
            </motion.div>
        );
    };
