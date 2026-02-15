import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
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
    <m.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
            e.preventDefault();
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
    </m.button>
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
        removeElementFromSection,

        // Orbit Context (Phase 3)
        orbit,
        activeCanvas,
        setActiveCanvas,
        updateOrbitElement,
        updateOrbitCanvas,
        duplicateOrbitElement,
        bringOrbitElementToFront,
        sendOrbitElementToBack,
        moveOrbitElementUp,
        moveOrbitElementDown,
        removeOrbitElement,
        alignOrbitElements,
        distributeOrbitElements,
        matchOrbitSize,
        templateType,
        showModal
    } = useStore();

    const isDisplay = templateType === 'display';
    const dynamicCanvasWidth = isDisplay ? 1920 : 414;
    const dynamicSectionHeight = isDisplay ? 1080 : 896;

    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1); // Feature 10: Zoom State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null); // Feature 4: Context Menu
    const [shiftPressed, setShiftPressed] = useState(false);

    // Modal State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copySourceId, setCopySourceId] = useState<string | null>(null);

    // Orbit Copy Modal State
    const [showOrbitCopyModal, setShowOrbitCopyModal] = useState(false);
    const [orbitCopySource, setOrbitCopySource] = useState<'left' | 'right' | null>(null);

    const handleOpenCopyModal = (id: string) => { setCopySourceId(id); setShowCopyModal(true); };
    const handleCopyElements = (targetId: string) => {
        if (copySourceId && targetId) { copySectionElementsTo(copySourceId, targetId); setShowCopyModal(false); }
    };

    const handleOpenOrbitCopyModal = (source: 'left' | 'right') => {
        setOrbitCopySource(source);
        setShowOrbitCopyModal(true);
    };
    const handleCopyOrbitElements = () => {
        if (!orbitCopySource) return;

        // CRITICAL: Capture all data FIRST before any state changes
        const sourceCanvas = orbitCopySource;
        const targetCanvas = sourceCanvas === 'left' ? 'right' : 'left';
        const sourceOrbit = orbit?.[sourceCanvas];
        const elementsToClone = [...(sourceOrbit?.elements || [])];
        const bgColor = sourceOrbit?.backgroundColor || 'transparent';
        const bgUrl = sourceOrbit?.backgroundUrl;

        // Orbit canvas width for mirroring calculation
        const ORBIT_WIDTH = 800;

        // Close modal FIRST to prevent blur lock
        setShowOrbitCopyModal(false);
        setOrbitCopySource(null);

        // Then perform copy operation with captured data
        try {
            // Copy background settings from source to target
            useStore.getState().updateOrbitCanvas(targetCanvas, {
                backgroundColor: bgColor,
                backgroundUrl: bgUrl
            });

            // Copy all elements from source to target with mirrored x position
            elementsToClone.forEach((element: Layer) => {
                // Mirror x position: newX = ORBIT_WIDTH - (oldX + width)
                const mirroredX = ORBIT_WIDTH - (element.x + (element.width || 0));

                const newElement = {
                    ...element,
                    id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: `${element.name} (Copy)`,
                    x: mirroredX // Use mirrored x position
                };
                useStore.getState().addOrbitElement(targetCanvas, newElement);
            });

            console.log(`Copied ${elementsToClone.length} elements (mirrored) and background from ${sourceCanvas} to ${targetCanvas}`);
        } catch (error) {
            console.error('Error copying orbit elements:', error);
        }
    };

    const handleClearWithConfirm = (id: string) => {
        showModal({
            title: 'Hapus Semua Elemen?',
            message: 'Apakah Anda yakin ingin menghapus semua elemen dari section ini?',
            type: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            onConfirm: () => clearSectionContent(id)
        });
    };

    const handleDeleteWithConfirm = (id: string) => {
        if (sections.length <= 1) {
            showModal({
                title: 'Tidak Bisa Menghapus',
                message: 'Minimal Anda harus memiliki satu section.',
                type: 'warning'
            });
            return;
        }
        showModal({
            title: 'Hapus Section?',
            message: 'Apakah Anda yakin ingin menghapus section ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            onConfirm: () => removeSection(id)
        });
    };

    const sortedSections = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);

    // Keyboard Shortcuts (CTO Level - Figma/Canva standard)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey) setShiftPressed(true);

            // Prevent shortcuts if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;
            const hasSelection = selectedLayerIds.length > 0;
            const activeSection = sections.find(s => s.id === activeSectionId);

            // Nudge (Arrows)
            if (hasSelection && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;

                selectedLayerIds.forEach(id => {
                    let el: Layer | undefined;
                    if (activeCanvas === 'main' && activeSection) {
                        el = activeSection.elements.find(layer => layer.id === id);
                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                        el = orbit?.[activeCanvas]?.elements?.find((layer: Layer) => layer.id === id);
                    }

                    if (el) {
                        const updates: any = {
                            x: el.x + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0),
                            y: el.y + (e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0)
                        };
                        if (activeCanvas === 'main' && activeSectionId) {
                            updateElementInSection(activeSectionId, id, updates);
                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                            updateOrbitElement(activeCanvas, id, updates);
                        }
                    }
                });
            }

            // Duplicate
            if (isMod && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                if (hasSelection) {
                    selectedLayerIds.forEach(id => {
                        if (activeCanvas === 'main' && activeSectionId) {
                            duplicateElementInSection(activeSectionId, id);
                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                            duplicateOrbitElement(activeCanvas, id);
                        }
                    });
                }
            }

            // Delete
            if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
                e.preventDefault();
                selectedLayerIds.forEach(id => {
                    if (activeCanvas === 'main' && activeSectionId) {
                        removeElementFromSection(activeSectionId, id);
                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                        removeOrbitElement(activeCanvas, id);
                    }
                });
                clearSelection();
            }

            // Layer Order
            if (isMod && hasSelection) {
                if (e.key === ']') {
                    e.preventDefault();
                    if (activeCanvas === 'main' && activeSectionId) {
                        if (e.shiftKey) selectedLayerIds.forEach(id => bringElementToFront(activeSectionId, id));
                        else selectedLayerIds.forEach(id => moveElementUp(activeSectionId, id));
                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                        if (e.shiftKey) selectedLayerIds.forEach(id => bringOrbitElementToFront(activeCanvas, id));
                        else selectedLayerIds.forEach(id => moveOrbitElementUp(activeCanvas, id));
                    }
                }
                if (e.key === '[') {
                    e.preventDefault();
                    if (activeCanvas === 'main' && activeSectionId) {
                        if (e.shiftKey) selectedLayerIds.forEach(id => sendElementToBack(activeSectionId, id));
                        else selectedLayerIds.forEach(id => moveElementDown(activeSectionId, id));
                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                        if (e.shiftKey) selectedLayerIds.forEach(id => sendOrbitElementToBack(activeCanvas, id));
                        else selectedLayerIds.forEach(id => moveOrbitElementDown(activeCanvas, id));
                    }
                }
            }

            // Select All
            if (isMod && e.key === 'a') {
                e.preventDefault();
                if (activeCanvas === 'main' && activeSection) {
                    selectLayers(activeSection.elements.map(el => el.id));
                } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                    selectLayers(orbit[activeCanvas].elements.map((el: Layer) => el.id));
                }
            }

            // Copy (Ctrl+C) - Copy selected element to clipboard
            if (isMod && (e.key === 'c' || e.key === 'C') && hasSelection) {
                e.preventDefault();
                const id = selectedLayerIds[0];
                let elementToCopy: Layer | null = null;

                if (activeCanvas === 'main' && activeSection) {
                    elementToCopy = activeSection.elements.find(el => el.id === id) || null;
                } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                    elementToCopy = orbit[activeCanvas].elements.find((el: Layer) => el.id === id) || null;
                }

                if (elementToCopy) {
                    useStore.getState().copyLayer(elementToCopy);
                }
            }

            // Paste (Ctrl+V) - Paste from clipboard
            if (isMod && (e.key === 'v' || e.key === 'V')) {
                e.preventDefault();
                const clipboard = useStore.getState().clipboard;
                if (clipboard) {
                    const newElement = {
                        ...clipboard,
                        id: `${clipboard.type}-${Date.now()}`,
                        name: `${clipboard.name} (Copy)`,
                        x: clipboard.x + 20,
                        y: clipboard.y + 20
                    };

                    if (activeCanvas === 'main' && activeSectionId) {
                        useStore.getState().addElementToSection(activeSectionId, newElement);
                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                        useStore.getState().addOrbitElement(activeCanvas, newElement);
                    }

                    selectLayer(newElement.id);
                }
            }

            if (e.key === 'Escape') clearSelection();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShiftPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedLayerIds, activeSectionId, sections, activeCanvas, orbit, shiftPressed]);

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

        let elements: Layer[] = [];
        if (marquee.sectionId === 'left' || marquee.sectionId === 'right') {
            elements = orbit[marquee.sectionId]?.elements || [];
        } else {
            const section = sections.find(s => s.id === marquee.sectionId);
            if (section) elements = section.elements || [];
        }

        if (elements.length > 0) {
            const xMin = Math.min(marquee.x1, marquee.x2);
            const xMax = Math.max(marquee.x1, marquee.x2);
            const yMin = Math.min(marquee.y1, marquee.y2);
            const yMax = Math.max(marquee.y1, marquee.y2);

            const hits = elements.filter(el => {
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
                const sectionTop = i * (dynamicSectionHeight + 64);
                const sectionBottom = sectionTop + dynamicSectionHeight;
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
    }, [sortedSections, visibleSectionId, dynamicSectionHeight]);

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
        if (!contextMenu) return;
        const { id } = contextMenu;

        if (activeCanvas === 'main' && activeSectionId) {
            if (type === 'duplicate') duplicateElementInSection(activeSectionId, id);
            if (type === 'delete') { removeElementFromSection(activeSectionId, id); clearSelection(); }
            if (type === 'front') bringElementToFront(activeSectionId, id);
            if (type === 'back') sendElementToBack(activeSectionId, id);
            if (type === 'up') moveElementUp(activeSectionId, id);
            if (type === 'down') moveElementDown(activeSectionId, id);
        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
            if (type === 'duplicate') duplicateOrbitElement(activeCanvas, id);
            if (type === 'delete') { removeOrbitElement(activeCanvas, id); clearSelection(); }
            if (type === 'front') bringOrbitElementToFront(activeCanvas, id);
            if (type === 'back') sendOrbitElementToBack(activeCanvas, id);
            if (type === 'up') moveOrbitElementUp(activeCanvas, id);
            if (type === 'down') moveOrbitElementDown(activeCanvas, id);
        }

        setContextMenu(null);
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] overflow-hidden flex relative select-none">
            {/* Triple-Canvas Engine (Phase 3) */}
            <div className="flex-1 h-full flex items-stretch overflow-hidden">

                {/* LEFT STAGE */}
                <div className="flex-1 relative overflow-hidden bg-[#050505]/50 border-r border-white/5">
                    <SideCanvas
                        type="left"
                        isActive={activeCanvas === 'left'}
                        orbit={orbit.left}
                        onSelect={() => setActiveCanvas('left')}
                        onUpdateElement={(id, updates) => updateOrbitElement('left', id, updates)}
                        onSelectLayer={(id, isMulti) => selectLayer(id, isMulti)}
                        selectedLayerIds={selectedLayerIds}
                        shiftPressed={shiftPressed}
                        marquee={marquee?.sectionId === 'left' ? marquee : null}
                        onMarqueeStart={handleMarqueeStart}
                        onMarqueeMove={handleMarqueeMove}
                        onMarqueeEnd={handleMarqueeEnd}
                        onContextMenu={handleContextMenu}
                        onClear={() => {
                            showModal({
                                title: 'Hapus Semua Elemen?',
                                message: 'Apakah Anda yakin ingin menghapus semua elemen dari LEFT orbit canvas?',
                                type: 'warning',
                                confirmText: 'Ya, Hapus',
                                cancelText: 'Batal',
                                onConfirm: () => useStore.getState().clearOrbitCanvas('left')
                            });
                        }}
                        onCopy={() => handleOpenOrbitCopyModal('left')}
                    />
                </div>

                {/* MAIN INVITATION (Center Scroll) */}
                <div
                    ref={containerRef}
                    className={`shrink-0 w-[414px] h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#111111] transition-all relative z-10 ${activeCanvas === 'main' ? 'ring-1 ring-premium-accent/20 shadow-2xl' : 'opacity-60 grayscale-[0.2]'}`}
                    onMouseDown={() => setActiveCanvas('main')}
                >
                    <div className="flex flex-col gap-16 items-center pt-14">
                        {sortedSections.map((section, index) => (
                            <SectionFrame
                                key={section.id}
                                section={section}
                                isActive={activeSectionId === section.id && activeCanvas === 'main'}
                                index={index}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    setActiveCanvas('main');
                                }}
                                onSelectLayer={(id, isMulti) => selectLayer(id, isMulti)}
                                selectedLayerIds={activeCanvas === 'main' ? selectedLayerIds : []}
                                zoom={zoom}
                                shiftPressed={shiftPressed}
                                onElementDrag={(id, pos) => updateElementInSection(section.id, id, pos)}
                                onElementResize={(id, updates) => updateElementInSection(section.id, id, updates)}
                                onContextMenu={handleContextMenu}
                                onDimensionsDetected={(id, w, h) => {
                                    const layer = (section.elements || []).find(el => el.id === id);
                                    if (layer && ((layer.width === 100 && layer.height === 100) || (layer.width === 200 && layer.height === 200))) {
                                        const ratio = w / h;
                                        let finalW = 200;
                                        let finalH = 200 / ratio;
                                        if (finalH > 400) { finalH = 400; finalW = 400 * ratio; }
                                        updateElementInSection(section.id, id, { width: finalW, height: finalH });
                                    }
                                }}
                                onMoveUp={() => reorderSections(index, index - 1)}
                                onMoveDown={() => reorderSections(index, index + 1)}
                                onToggleVisibility={() => updateSection(section.id, { isVisible: section.isVisible !== false ? false : true })}
                                onCopyTo={() => handleOpenCopyModal(section.id)}
                                onClear={() => handleClearWithConfirm(section.id)}
                                onDelete={() => handleDeleteWithConfirm(section.id)}
                                isFirst={index === 0}
                                isLast={index === sections.length - 1}
                                marquee={marquee?.sectionId === section.id ? marquee : null}
                                onMarqueeStart={handleMarqueeStart}
                                onMarqueeMove={handleMarqueeMove}
                                onMarqueeEnd={handleMarqueeEnd}
                                canvasWidth={dynamicCanvasWidth}
                                sectionHeight={dynamicSectionHeight}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT STAGE */}
                <div className="flex-1 relative overflow-hidden bg-[#050505]/50 border-l border-white/5">
                    <SideCanvas
                        type="right"
                        isActive={activeCanvas === 'right'}
                        orbit={orbit.right}
                        onSelect={() => setActiveCanvas('right')}
                        onUpdateElement={(id, updates) => updateOrbitElement('right', id, updates)}
                        onSelectLayer={(id, isMulti) => selectLayer(id, isMulti)}
                        selectedLayerIds={selectedLayerIds}
                        shiftPressed={shiftPressed}
                        marquee={marquee?.sectionId === 'right' ? marquee : null}
                        onMarqueeStart={handleMarqueeStart}
                        onMarqueeMove={handleMarqueeMove}
                        onMarqueeEnd={handleMarqueeEnd}
                        onContextMenu={handleContextMenu}
                        onClear={() => {
                            showModal({
                                title: 'Hapus Semua Elemen?',
                                message: 'Apakah Anda yakin ingin menghapus semua elemen dari RIGHT orbit canvas?',
                                type: 'warning',
                                confirmText: 'Ya, Hapus',
                                cancelText: 'Batal',
                                onConfirm: () => useStore.getState().clearOrbitCanvas('right')
                            });
                        }}
                        onCopy={() => handleOpenOrbitCopyModal('right')}
                    />
                </div>
            </div>

            {/* Enterprise Floating Toolbar (Figma/Canva inspired) */}
            <AnimatePresence>
                {selectedLayerIds.length > 0 && (activeCanvas === 'main' ? !!activeSectionId : true) && (
                    <m.div
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
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            alignElements(activeSectionId, selectedLayerIds, 'left');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            alignOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'left');
                                        }
                                    }}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="2" height="16" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" /><rect x="7" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Left"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            alignElements(activeSectionId, selectedLayerIds, 'center');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            alignOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'center');
                                        }
                                    }}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="11" y="4" width="2" height="16" rx="0.5" fill="currentColor" /><rect x="5" y="7" width="14" height="4" rx="1" fill="currentColor" opacity="0.5" /><rect x="7" y="13" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Horizontal Center"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            alignElements(activeSectionId, selectedLayerIds, 'right');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            alignOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'right');
                                        }
                                    }}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="19" y="4" width="2" height="16" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" /><rect x="11" y="13" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Right"
                                />
                                <div className="w-px h-4 bg-white/5 mx-0.5" />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            alignElements(activeSectionId, selectedLayerIds, 'top');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            alignOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'top');
                                        }
                                    }}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="2" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" /><rect x="13" y="7" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Top"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            alignElements(activeSectionId, selectedLayerIds, 'middle');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            alignOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'middle');
                                        }
                                    }}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="2" rx="0.5" fill="currentColor" /><rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" /><rect x="13" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Vertical Center"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            alignElements(activeSectionId, selectedLayerIds, 'bottom');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            alignOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'bottom');
                                        }
                                    }}
                                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="4" y="19" width="16" height="2" rx="0.5" fill="currentColor" /><rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.5" /><rect x="13" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.5" /></svg>}
                                    title="Align Bottom"
                                />
                                <div className="w-px h-4 bg-white/5 mx-0.5" />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            distributeElements(activeSectionId, selectedLayerIds, 'horizontal');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            distributeOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'horizontal');
                                        }
                                    }}
                                    icon={<Maximize className="w-4 h-4 rotate-90" />}
                                    title="Distribute Horizontally"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        if (activeCanvas === 'main' && activeSectionId) {
                                            distributeElements(activeSectionId, selectedLayerIds, 'vertical');
                                        } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                            distributeOrbitElements(activeCanvas as 'left' | 'right', selectedLayerIds, 'vertical');
                                        }
                                    }}
                                    icon={<Maximize className="w-4 h-4" />}
                                    title="Distribute Vertically"
                                />
                            </div>
                        )}

                        {/* Order & Grouping */}
                        <div className="flex items-center gap-1 pr-2 border-r border-white/10 mr-1">
                            <ToolbarButton
                                onClick={() => {
                                    if (activeCanvas === 'main' && activeSectionId) {
                                        selectedLayerIds.forEach(id => bringElementToFront(activeSectionId, id));
                                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                        selectedLayerIds.forEach(id => bringOrbitElementToFront(activeCanvas, id));
                                    }
                                }}
                                icon={<ChevronUp className="w-4 h-4" />}
                                title="Bring to Front"
                            />
                            <ToolbarButton
                                onClick={() => {
                                    if (activeCanvas === 'main' && activeSectionId) {
                                        selectedLayerIds.forEach(id => sendElementToBack(activeSectionId, id));
                                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                        selectedLayerIds.forEach(id => sendOrbitElementToBack(activeCanvas, id));
                                    }
                                }}
                                icon={<ChevronDown className="w-4 h-4" />}
                                title="Send to Back"
                            />
                            <div className="w-px h-4 bg-white/5 mx-0.5" />
                            <ToolbarButton onClick={handleGroupSelected} icon={<Group className="w-4 h-4" />} title="Group (Ctrl+G)" disabled={selectedLayerIds.length < 2 || activeCanvas !== 'main'} />
                            <ToolbarButton onClick={handleUngroupSelected} icon={<Ungroup className="w-4 h-4" />} title="Ungroup" disabled={activeCanvas !== 'main'} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <ToolbarButton
                                onClick={() => {
                                    if (activeCanvas === 'main' && activeSectionId) {
                                        selectedLayerIds.forEach(id => duplicateElementInSection(activeSectionId, id));
                                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                        selectedLayerIds.forEach(id => duplicateOrbitElement(activeCanvas, id));
                                    }
                                }}
                                icon={<Copy className="w-4 h-4" />}
                                title="Duplicate (Ctrl+D)"
                            />
                            <ToolbarButton
                                onClick={() => {
                                    if (activeCanvas === 'main' && activeSectionId) {
                                        selectedLayerIds.forEach(id => removeElementFromSection(activeSectionId, id));
                                    } else if (activeCanvas === 'left' || activeCanvas === 'right') {
                                        selectedLayerIds.forEach(id => removeOrbitElement(activeCanvas, id));
                                    }
                                    clearSelection();
                                }}
                                icon={<Trash2 className="w-4 h-4" />}
                                title="Delete (Del)"
                                variant="danger"
                            />
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Feature 4: Enterprise Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <m.div
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
                    </m.div>
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

            {/* SECTION COPY MODAL (Enterprise UX) */}
            <AnimatePresence>
                {showCopyModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-3xl shadow-4xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-lg font-bold text-premium-accent">Copy Content To...</h3>
                                <p className="text-xs text-white/40 mt-1">Select the target section to paste elements and background settings.</p>
                            </div>

                            <div className="p-4 max-h-[400px] overflow-y-auto premium-scroll space-y-2">
                                {sections
                                    .filter(s => s.id !== copySourceId)
                                    .map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleCopyElements(s.id)}
                                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-premium-accent/10 border border-white/5 hover:border-premium-accent/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl">{SECTION_ICONS[s.key as keyof typeof SECTION_ICONS] || '📄'}</span>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white/80 group-hover:text-premium-accent transition-colors">{s.title}</div>
                                                    <div className="text-[10px] text-white/20 uppercase tracking-widest">{(s.elements || []).length} Elements</div>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <Copy className="w-4 h-4 text-premium-accent" />
                                            </div>
                                        </button>
                                    ))}
                            </div>

                            <div className="p-4 bg-black/20 flex justify-end">
                                <button
                                    onClick={() => setShowCopyModal(false)}
                                    className="px-6 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ORBIT COPY MODAL */}
            <AnimatePresence>
                {showOrbitCopyModal && orbitCopySource && (
                    <div
                        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => { setShowOrbitCopyModal(false); setOrbitCopySource(null); }}
                    >
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-3xl shadow-4xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-lg font-bold text-premium-accent">Copy Orbit Content</h3>
                                <p className="text-xs text-white/40 mt-1">
                                    Copy all elements from <span className="text-premium-accent font-bold uppercase">{orbitCopySource}</span> orbit to <span className="text-premium-accent font-bold uppercase">{orbitCopySource === 'left' ? 'right' : 'left'}</span> orbit.
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">From</div>
                                        <div className="text-lg font-bold text-white uppercase">{orbitCopySource}</div>
                                        <div className="text-[10px] text-white/30">{orbit[orbitCopySource].elements.length} elements</div>
                                    </div>
                                    <div className="text-premium-accent">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 p-4 rounded-xl bg-premium-accent/10 border border-premium-accent/30 text-center">
                                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">To</div>
                                        <div className="text-lg font-bold text-premium-accent uppercase">{orbitCopySource === 'left' ? 'right' : 'left'}</div>
                                        <div className="text-[10px] text-white/30">{orbit[orbitCopySource === 'left' ? 'right' : 'left'].elements.length} elements</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-black/20 flex justify-end gap-2">
                                <button
                                    onClick={() => { setShowOrbitCopyModal(false); setOrbitCopySource(null); }}
                                    className="px-6 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCopyOrbitElements}
                                    className="px-6 py-2 rounded-xl text-xs font-bold bg-premium-accent text-premium-dark hover:bg-premium-accent/90 transition-colors"
                                >
                                    Copy Elements
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
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
    onMarqueeEnd: () => void,
    canvasWidth: number,
    sectionHeight: number,
    shiftPressed: boolean
}> = ({
    section, isActive, index, onClick, onSelectLayer, selectedLayerIds,
    onElementResize, onDimensionsDetected, onContextMenu, onMoveUp, onMoveDown, onToggleVisibility, onCopyTo, onClear, onDelete, isFirst, isLast,
    marquee, onMarqueeStart, onMarqueeMove, onMarqueeEnd, zoom, canvasWidth, sectionHeight, shiftPressed
}) => {
        // Collect DOM targets for Moveable
        const targetMap = useRef<Map<string, HTMLDivElement>>(new Map());
        const [targets, setTargets] = useState<HTMLDivElement[]>([]);

        useEffect(() => {
            const activeTargets = selectedLayerIds
                .map((id: string) => targetMap.current.get(id))
                .filter(Boolean) as HTMLDivElement[];
            setTargets(activeTargets);
        }, [selectedLayerIds, section?.elements]);

        const registerTarget = (id: string, el: HTMLDivElement | null) => {
            if (el) targetMap.current.set(id, el); else targetMap.current.delete(id);
        };

        return (
            <m.div layout className="relative group" initial={false} animate={{ opacity: 1 }}>
                {/* Header */}
                <div className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-1 h-8 z-50 group-header`}>
                    <div className="flex items-center gap-3 text-[11px]">
                        <span className="font-bold uppercase tracking-widest text-premium-accent">{section.title}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <ToolbarButton onClick={onMoveUp} icon={<ChevronUp className="w-3.5 h-3.5" />} title="Move Up" disabled={isFirst} />
                        <ToolbarButton onClick={onMoveDown} icon={<ChevronDown className="w-3.5 h-3.5" />} title="Move Down" disabled={isLast} />
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <ToolbarButton onClick={onToggleVisibility} icon={section.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />} title="Toggle Visibility" />
                        <ToolbarButton onClick={onCopyTo} icon={<Copy className="w-3.5 h-3.5" />} title="Copy Section" />
                        <ToolbarButton onClick={onClear} icon={<Eraser className="w-3.5 h-3.5" />} title="Clear Section" />
                        <ToolbarButton onClick={onDelete} icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />} title="Delete Section" variant="danger" />
                    </div>
                </div>

                <m.div
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
                        width: canvasWidth,
                        height: sectionHeight,
                        backgroundColor: section.backgroundColor || '#0a0a0a',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center'
                    }}>

                    {(section.elements || []).map((element: Layer) => (
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
                            resizable={true}
                            rotatable={true}
                            snappable={true}
                            keepRatio={shiftPressed}
                            renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
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
                                e.target.style.left = `${e.left}px`;
                                e.target.style.top = `${e.top}px`;
                            }}
                            onDragEnd={(e: any) => {
                                const id = e.target.getAttribute('data-element-id');
                                if (id) onElementResize(id, { x: e.lastEvent.left, y: e.lastEvent.top });
                            }}
                            onResize={(e: any) => {
                                e.target.style.width = `${e.width}px`;
                                e.target.style.height = `${e.height}px`;
                                e.target.style.transform = e.drag.transform;
                            }}
                            onResizeEnd={(e: any) => {
                                const id = e.target.getAttribute('data-element-id');
                                if (id) onElementResize(id, {
                                    width: e.lastEvent.width,
                                    height: e.lastEvent.height,
                                    x: e.lastEvent.drag.left,
                                    y: e.lastEvent.drag.top
                                });
                            }}
                            onRotate={(e: OnRotate) => {
                                e.target.style.transform = e.drag.transform;
                            }}
                            onRotateEnd={(e: any) => {
                                const id = e.target.getAttribute('data-element-id');
                                if (id) onElementResize(id, { rotation: e.lastEvent.rotate });
                            }}

                            // Group Events
                            onDragGroup={(e: OnDragGroup) => {
                                e.events.forEach((ev) => {
                                    ev.target.style.left = `${ev.left}px`;
                                    ev.target.style.top = `${ev.top}px`;
                                });
                            }}
                            onDragGroupEnd={(e: any) => {
                                e.events.forEach((ev: any) => {
                                    const id = ev.target.getAttribute('data-element-id');
                                    if (id) onElementResize(id, { x: ev.lastEvent.left, y: ev.lastEvent.top });
                                });
                            }}
                            onResizeGroup={(e: any) => {
                                e.events.forEach((ev: any) => {
                                    ev.target.style.width = `${ev.width}px`;
                                    ev.target.style.height = `${ev.height}px`;
                                    ev.target.style.transform = ev.drag.transform;
                                });
                            }}
                            onResizeGroupEnd={(e: any) => {
                                e.events.forEach((ev: any) => {
                                    const id = ev.target.getAttribute('data-element-id');
                                    if (id) onElementResize(id, {
                                        width: ev.lastEvent.width,
                                        height: ev.lastEvent.height,
                                        x: ev.lastEvent.drag.left,
                                        y: ev.lastEvent.drag.top
                                    });
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
                </m.div>
            </m.div>
        );
    };
const SideCanvas: React.FC<{
    type: 'left' | 'right',
    isActive: boolean,
    orbit: any,
    onSelect: () => void,
    onUpdateElement: (id: string, updates: Partial<Layer>) => void,
    onSelectLayer: (id: string, isMulti: boolean) => void,
    selectedLayerIds: string[],
    marquee: any,
    onMarqueeStart: (id: string, x: number, y: number) => void,
    onMarqueeMove: (x: number, y: number) => void,
    onMarqueeEnd: () => void,
    onContextMenu: (e: React.MouseEvent, id: string) => void,
    onClear: () => void,
    onCopy: () => void,
    shiftPressed: boolean
}> = ({ type, isActive, orbit, onSelect, onUpdateElement, onSelectLayer, selectedLayerIds, marquee, onMarqueeStart, onMarqueeMove, onMarqueeEnd, onContextMenu, onClear, onCopy, shiftPressed }) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const [editorScale, setEditorScale] = useState(0.8);

    // Collect DOM targets for Moveable
    const targetMap = useRef<Map<string, HTMLDivElement>>(new Map());
    const [targets, setTargets] = useState<HTMLDivElement[]>([]);

    useEffect(() => {
        const updateScale = () => {
            const height = window.innerHeight;

            // CTO FIX: Use EXACT same scaling as Preview for 1:1 parity
            // Preview landscape: scaleFactor = windowSize.height / CANVAS_HEIGHT (896)
            // This ensures elements appear at identical positions in both views
            const targetScale = height / 896;
            setEditorScale(targetScale);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Sync targets when selection or elements change
    useEffect(() => {
        const activeTargets = selectedLayerIds
            .map((id: string) => targetMap.current.get(id))
            .filter(Boolean) as HTMLDivElement[];
        setTargets(activeTargets);
    }, [selectedLayerIds, orbit.elements]);

    const registerTarget = (id: string, el: HTMLDivElement | null) => {
        if (el) targetMap.current.set(id, el); else targetMap.current.delete(id);
    };

    if (!orbit.isVisible) return null;

    return (
        <div
            ref={stageRef}
            className={`absolute inset-0 ${isActive ? '' : 'opacity-30 grayscale-[0.8]'} group`}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onMarqueeStart(type, (e.clientX - rect.left) / editorScale, (e.clientY - rect.top) / editorScale);
                }
                onSelect();
            }}
            onMouseMove={(e) => {
                if (marquee) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onMarqueeMove((e.clientX - rect.left) / editorScale, (e.clientY - rect.top) / editorScale);
                }
            }}
            onMouseUp={() => onMarqueeEnd()}
        >
            {/* Orbit Toolbar - Above the canvas */}
            <div className={`absolute top-2 ${type === 'left' ? 'right-2' : 'left-2'} flex items-center gap-1 z-50 bg-black/60 backdrop-blur-sm rounded-lg p-1`}>
                <ToolbarButton onClick={onCopy} icon={<Copy className="w-3.5 h-3.5" />} title="Copy All Elements" />
                <ToolbarButton onClick={onClear} icon={<Eraser className="w-3.5 h-3.5" />} title="Clear All" />
            </div>

            {/* 800px Design Container - Absolute positioned like Preview */}
            <div
                className={`absolute transition-all duration-700 overflow-hidden ${isActive ? 'ring-[3px] ring-purple-500/50 z-20' : 'z-0 hover:opacity-50'}`}
                style={{
                    // CTO FIX: Match padding with center canvas (pt-14 = 56px)
                    top: 56,
                    width: 800,
                    height: SECTION_HEIGHT,
                    // Anchor to VIEWPORT edge
                    [type]: 0,
                    backgroundColor: orbit.backgroundColor || '#050505',
                    backgroundImage: orbit.backgroundUrl ? `url(${orbit.backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    // Scale from top corner
                    transform: `scale(${editorScale})`,
                    transformOrigin: type === 'left' ? 'left top' : 'right top',
                }}
            >
                <div className={`absolute top-8 ${type === 'left' ? 'right-8 text-right' : 'left-8 text-left'} pointer-events-none mix-blend-overlay`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white block opacity-40">CINEMATIC STAGE</span>
                    <span className="text-4xl font-black text-white uppercase tracking-tighter block opacity-10">{type}</span>
                </div>

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/40" />

                {orbit.elements.map((element: Layer) => (
                    <CanvasElement
                        key={element.id}
                        layer={element}
                        isSelected={isActive && selectedLayerIds.includes(element.id)}
                        onSelect={(isMulti) => {
                            onSelect();
                            onSelectLayer(element.id, !!isMulti);
                        }}
                        onContextMenu={(e) => onContextMenu(e, element.id)}
                        onDimensionsDetected={(w, h) => {
                            if ((element.width === 100 && element.height === 100) || (element.width === 200 && element.height === 200)) {
                                onUpdateElement(element.id, { width: 300, height: 300 * (h / w) });
                            }
                        }}
                        elementRef={(el: HTMLDivElement | null) => registerTarget(element.id, el)}
                        updateLayer={(id, updates) => onUpdateElement(id, updates)}
                    />
                ))}

                {/* Marquee Visual */}
                {marquee && (
                    <div className="absolute border border-purple-500 bg-purple-500/10 pointer-events-none z-[1000]"
                        style={{
                            left: Math.min(marquee.x1, marquee.x2),
                            top: Math.min(marquee.y1, marquee.y2),
                            width: Math.abs(marquee.x1 - marquee.x2),
                            height: Math.abs(marquee.y1 - marquee.y2)
                        }} />
                )}

                {/* MOVEABLE FOR ORBIT STAGE */}
                {isActive && targets.length > 0 && (
                    <Moveable
                        {...({} as any)}
                        target={targets}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        snappable={true}
                        keepRatio={shiftPressed}
                        elementGuidelines={[...targets]}
                        snapGap={5}
                        snapThreshold={5}
                        isDisplaySnapDigit={false}
                        snapElement={true}
                        snapVertical={true}
                        snapHorizontal={true}
                        snapCenter={true}
                        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                        origin={false}

                        // Single Target Events
                        onDrag={(e: any) => {
                            e.target.style.left = `${e.left}px`;
                            e.target.style.top = `${e.top}px`;
                        }}
                        onDragEnd={(e: any) => {
                            const id = e.target.getAttribute('data-element-id');
                            if (id) onUpdateElement(id, { x: e.lastEvent.left, y: e.lastEvent.top });
                        }}
                        onResize={(e: any) => {
                            e.target.style.width = `${e.width}px`;
                            e.target.style.height = `${e.height}px`;
                            e.target.style.transform = e.drag.transform;
                        }}
                        onResizeEnd={(e: any) => {
                            const id = e.target.getAttribute('data-element-id');
                            if (id) onUpdateElement(id, {
                                width: e.lastEvent.width,
                                height: e.lastEvent.height,
                                x: e.lastEvent.drag.left,
                                y: e.lastEvent.drag.top
                            });
                        }}
                        onRotate={(e: any) => {
                            e.target.style.transform = e.drag.transform;
                        }}
                        onRotateEnd={(e: any) => {
                            const id = e.target.getAttribute('data-element-id');
                            if (id) onUpdateElement(id, { rotation: e.lastEvent.rotate });
                        }}

                        // Group Events
                        onDragGroup={(e: any) => {
                            e.events.forEach((ev: any) => {
                                ev.target.style.left = `${ev.left}px`;
                                ev.target.style.top = `${ev.top}px`;
                            });
                        }}
                        onDragGroupEnd={(e: any) => {
                            e.events.forEach((ev: any) => {
                                const id = ev.target.getAttribute('data-element-id');
                                if (id) onUpdateElement(id, { x: ev.lastEvent.left, y: ev.lastEvent.top });
                            });
                        }}
                        onResizeGroup={(e: any) => {
                            e.events.forEach((ev: any) => {
                                ev.target.style.width = `${ev.width}px`;
                                ev.target.style.height = `${ev.height}px`;
                                ev.target.style.transform = ev.drag.transform;
                            });
                        }}
                        onResizeGroupEnd={(e: any) => {
                            e.events.forEach((ev: any) => {
                                const id = ev.target.getAttribute('data-element-id');
                                if (id) onUpdateElement(id, {
                                    width: ev.lastEvent.width,
                                    height: ev.lastEvent.height,
                                    x: ev.lastEvent.drag.left,
                                    y: ev.lastEvent.drag.top
                                });
                            });
                        }}
                        onRotateGroup={(e: any) => {
                            e.events.forEach((ev: any) => {
                                ev.target.style.transform = ev.drag.transform;
                            });
                        }}
                        onRotateGroupEnd={(e: any) => {
                            e.events.forEach((ev: any) => {
                                const id = ev.target.getAttribute('data-element-id');
                                if (id) onUpdateElement(id, { rotation: ev.lastEvent.rotate });
                            });
                        }}

                        className="custom-moveable"
                    />
                )}

                {!isActive && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] pointer-events-none transition-opacity duration-700" />
                )}
            </div>
        </div>
    );
};
