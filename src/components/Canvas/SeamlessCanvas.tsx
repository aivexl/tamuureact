import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, SECTION_ICONS } from '@/store/useStore';
import { CanvasElement } from './CanvasElement';
import { Section, ZoomPoint } from '@/store/sectionsSlice';
import { ChevronUp, ChevronDown, Eye, EyeOff, Copy, Trash2, Eraser } from 'lucide-react';

const CANVAS_WIDTH = 414;
const SECTION_HEIGHT = 896; // Each section height

// ============================================
// SEAMLESS CANVAS COMPONENT
// Shows all sections in a continuous vertical scroll view
// ============================================
export const SeamlessCanvas: React.FC = () => {
    const {
        sections,
        activeSectionId,
        setActiveSection,
        updateElementInSection,
        updateSection,
        selectLayer,
        selectedLayerId,
        reorderSections,
        removeSection,
        duplicateSection,
        copySectionElementsTo,
        clearSectionContent
    } = useStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);

    // Copy Modal State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copySourceId, setCopySourceId] = useState<string | null>(null);

    const handleOpenCopyModal = (id: string) => {
        setCopySourceId(id);
        setShowCopyModal(true);
    };

    const handleCopyElements = (targetId: string) => {
        if (copySourceId && targetId) {
            copySectionElementsTo(copySourceId, targetId);
            setShowCopyModal(false);
            setCopySourceId(null);
        }
    };

    // Sort sections by order - Memoized to prevent infinite useEffect loops
    const sortedSections = React.useMemo(() =>
        [...sections].sort((a, b) => a.order - b.order),
        [sections]);

    // Track which section is in view during scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const scrollCenter = scrollTop + containerHeight / 2;

            // Find which section is at the center of the viewport
            let totalHeight = 0;
            for (const section of sortedSections) {
                const sectionTop = totalHeight;
                const sectionBottom = totalHeight + SECTION_HEIGHT + 40; // 40 for gap

                if (scrollCenter >= sectionTop && scrollCenter < sectionBottom) {
                    setVisibleSectionId(section.id);
                    break;
                }
                totalHeight = sectionBottom;
            }
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => container.removeEventListener('scroll', handleScroll);
    }, [sortedSections]);

    // Scroll to section when active section changes via sidebar
    useEffect(() => {
        if (!activeSectionId || !containerRef.current) return;

        const sectionIndex = sortedSections.findIndex(s => s.id === activeSectionId);
        if (sectionIndex === -1) return;

        const scrollTarget = sectionIndex * (SECTION_HEIGHT + 40);
        containerRef.current.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    }, [activeSectionId]);

    // Global Key Listeners (Escape to deselect)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                selectLayer(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectLayer]);

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    const handleElementDrag = (sectionId: string, elementId: string, newPosition: { x: number; y: number }) => {
        updateElementInSection(sectionId, elementId, { x: newPosition.x, y: newPosition.y });
    };

    const handleElementResize = (sectionId: string, elementId: string, updates: { scale?: number; width?: number; height?: number; x?: number; y?: number }) => {
        updateElementInSection(sectionId, elementId, updates);
    };

    // Zoom Region Update Handler
    const handleUpdateZoomRegion = useCallback((sectionId: string, pointIndex: number, updates: Partial<ZoomPoint['targetRegion']>) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section?.zoomConfig) return;

        const points = [...section.zoomConfig.points];
        points[pointIndex] = {
            ...points[pointIndex],
            targetRegion: { ...points[pointIndex].targetRegion, ...updates }
        };
        updateSection(sectionId, {
            zoomConfig: { ...section.zoomConfig, points }
        });
    }, [sections, updateSection]);

    return (
        <div className="flex-1 relative overflow-hidden bg-[#050505]">

            {/* Scrollable Canvas Container */}
            <div
                ref={containerRef}
                className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar flex justify-center py-8"
            >
                <div className="flex flex-col gap-10">
                    {sortedSections.map((section, index) => (
                        <SectionFrame
                            key={section.id}
                            section={section}
                            isActive={activeSectionId === section.id}
                            isVisible={visibleSectionId === section.id}
                            index={index}
                            onClick={() => handleSectionClick(section.id)}
                            onElementDrag={(elementId, pos) => handleElementDrag(section.id, elementId, pos)}
                            onElementResize={(elementId, updates) => handleElementResize(section.id, elementId, updates)}
                            selectedLayerId={selectedLayerId}
                            onSelectLayer={selectLayer}
                            onUpdateZoomRegion={(pointIndex, updates) => handleUpdateZoomRegion(section.id, pointIndex, updates)}


                            // Toolbar Actions
                            onMoveUp={() => reorderSections(index, index - 1)}
                            onMoveDown={() => reorderSections(index, index + 1)}
                            onToggleVisibility={() => updateSection(section.id, { isVisible: section.isVisible === false })}
                            onCopyTo={() => handleOpenCopyModal(section.id)}
                            onClear={() => {
                                if (window.confirm('Are you sure you want to clear all content and reset background? This cannot be undone.')) {
                                    clearSectionContent(section.id);
                                }
                            }}
                            onDelete={() => removeSection(section.id)}
                            isFirst={index === 0}
                            isLast={index === sortedSections.length - 1}
                        />
                    ))}



                    {/* End spacer */}
                    <div className="h-20" />
                </div>
            </div>

            {/* Copy To Section Modal */}
            {showCopyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCopyModal(false)} />
                    <div className="relative bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl w-80 max-h-[70vh] overflow-hidden z-10">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="font-semibold text-white">Copy Elements to Section</h3>
                            <p className="text-xs text-white/50 mt-1">Select target section</p>
                        </div>
                        <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {sortedSections.map((section) => (
                                <button
                                    key={section.id}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 mb-1 ${section.id === copySourceId
                                        ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/40'
                                        : 'hover:bg-premium-accent/20 hover:text-premium-accent text-white/70'
                                        }`}
                                    disabled={section.id === copySourceId}
                                    onClick={() => handleCopyElements(section.id)}
                                >
                                    <span className="text-lg">{SECTION_ICONS[section.key as keyof typeof SECTION_ICONS] || '📄'}</span>
                                    <span className="text-sm">{section.title}</span>
                                    {section.id === copySourceId && <span className="text-xs ml-auto">(source)</span>}
                                </button>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10 bg-white/5">
                            <button
                                className="w-full py-2 text-sm text-white/50 hover:text-white transition-colors"
                                onClick={() => setShowCopyModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Navigator (Mini-map) - CTO Refined Positioning to avoid toggle overlap */}
            <div className="absolute right-6 top-[65%] -translate-y-1/2 z-40 flex flex-col gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-full border border-white/5">
                {sortedSections.filter(s => s.isVisible).map((section) => (
                    <motion.button
                        key={section.id}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-3 h-3 rounded-full transition-all ${activeSectionId === section.id
                            ? 'bg-premium-accent scale-125'
                            : visibleSectionId === section.id
                                ? 'bg-white/50'
                                : 'bg-white/20 hover:bg-white/40'
                            }`}
                        title={section.title}
                    />
                ))}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3">
                <span className="text-xs font-mono text-white/60">
                    {sortedSections.filter(s => s.isVisible).length} sections
                </span>
                <span className="text-[10px] text-white/30">Scroll to navigate</span>
            </div>
        </div>
    );
};

// ============================================
// SECTION FRAME COMPONENT
// Individual section container within seamless canvas
// ============================================
interface SectionFrameProps {
    section: Section;
    isActive: boolean;
    isVisible: boolean;
    index: number;
    onClick: () => void;
    onElementDrag: (elementId: string, pos: { x: number; y: number }) => void;
    onElementResize: (elementId: string, updates: { scale?: number; width?: number; height?: number; x?: number; y?: number }) => void;
    selectedLayerId: string | null;
    onSelectLayer: (id: string | null) => void;
    onUpdateZoomRegion: (pointIndex: number, updates: Partial<ZoomPoint['targetRegion']>) => void;

    // Toolbar Actions
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggleVisibility: () => void;
    onCopyTo: () => void;
    onClear: () => void;
    onDelete: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const SectionFrame: React.FC<SectionFrameProps> = ({
    section,
    isActive,
    isVisible,
    index,
    onClick,
    onElementDrag,
    onElementResize,
    selectedLayerId,
    onSelectLayer,
    onUpdateZoomRegion,
    onMoveUp,
    onMoveDown,
    onToggleVisibility,
    onCopyTo,
    onClear,
    onDelete,
    isFirst,
    isLast
}) => {
    // Sort elements by zIndex
    const sortedElements = [...section.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Get selected zoom point
    const selectedZoomPointIndex = section.zoomConfig?.selectedPointIndex;
    const selectedZoomPoint = selectedZoomPointIndex !== undefined
        ? section.zoomConfig?.points[selectedZoomPointIndex]
        : null;

    return (
        <motion.div
            className="relative"
            initial={false} // Prevent initial animation for speed
            animate={{ opacity: 1 }}
        >
            {/* Section Label */}
            <div className={`absolute -top-6 left-0 flex items-center gap-2 text-xs transition-colors ${isActive ? 'text-premium-accent' : 'text-white/40'}`}>
                <span>{SECTION_ICONS[section.key as keyof typeof SECTION_ICONS] || '📄'}</span>
                <span className="font-medium">{section.title}</span>
                <span className="text-white/20">({section.elements.length} elements)</span>
                {section.zoomConfig?.enabled && (
                    <span className="ml-2 px-2 py-0.5 bg-premium-accent/20 text-premium-accent rounded text-[9px] font-bold">
                        ZOOM
                    </span>
                )}
            </div>

            {/* Section Toolbar - Top Right */}
            <div className={`absolute top-2 right-2 z-50 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" title="Move Up">
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" title="Move Down">
                    <ChevronDown className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white" title="Toggle Visibility">
                    {section.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onCopyTo(); }} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white" title="Copy elements to other section">
                    <Copy className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white" title="Clear All Content">
                    <Eraser className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-200" title="Delete Section">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Section Canvas */}
            <motion.div
                onClick={(e) => {
                    // Only deselect if clicking on the canvas itself, not on elements or handles
                    if (e.target === e.currentTarget) {
                        onSelectLayer(null);
                    }
                    onClick(); // Set active section regardless
                }}
                className={`relative shadow-2xl rounded-2xl overflow-hidden cursor-pointer transition-all ${isActive
                    ? 'ring-2 ring-premium-accent ring-offset-4 ring-offset-[#050505] captured-canvas-target'
                    : isVisible
                        ? 'ring-1 ring-white/20'
                        : ''
                    }`}
                style={{
                    width: CANVAS_WIDTH,
                    height: SECTION_HEIGHT,
                    backgroundColor: section.backgroundColor || '#0a0a0a',
                    backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    willChange: 'transform, opacity',
                    opacity: section.isVisible === false ? 0.4 : 1,
                    filter: section.isVisible === false ? 'grayscale(100%)' : 'none'
                }}
                data-capture-target="true"
            >
                {/* Background Overlay */}
                {section.backgroundUrl && (
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: section.overlayOpacity || 0 }}
                    />
                )}

                {/* Elements */}
                <AnimatePresence>
                    {sortedElements.filter(el => el.isVisible).map((element) => (
                        <CanvasElement
                            key={element.id}
                            layer={element}
                            isSelected={selectedLayerId === element.id}
                            onSelect={(toggle) => {
                                onSelectLayer(toggle ? null : element.id);
                                if (!toggle) onClick(); // Ensure section becomes active when element is selected
                            }}
                            onDrag={(pos) => onElementDrag(element.id, pos)}
                            onResize={(updates) => onElementResize(element.id, updates)}
                            isPanMode={false}
                        />
                    ))}
                </AnimatePresence>

                {/* ============================================ */}
                {/* ZOOM TARGET REGION BOXES */}
                {/* Show ALL zoom points - selected is editable, others are reference */}
                {/* ============================================ */}
                {section.zoomConfig?.enabled && isActive && section.zoomConfig.points.map((point, idx) => (
                    <ZoomTargetBox
                        key={point.id}
                        zoomPoint={point}
                        pointIndex={idx}
                        isSelected={selectedZoomPointIndex === idx}
                        onUpdate={onUpdateZoomRegion}
                    />
                ))}

                {/* Section Number Badge */}
                <div className="absolute top-3 right-3 w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-[10px] font-bold text-white/60">
                    {index + 1}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============================================
// ZOOM TARGET BOX COMPONENT
// Draggable and resizable box for zoom area selection
// Uses local state during drag for smooth performance
// ============================================

// Default colors for zoom points (cycle through these)
const ZOOM_POINT_COLORS = [
    '#bfa181', // Gold (default premium-accent)
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
];

interface ZoomTargetBoxProps {
    zoomPoint: ZoomPoint;
    pointIndex: number;
    isSelected: boolean;
    onUpdate: (pointIndex: number, updates: Partial<ZoomPoint['targetRegion']>) => void;
}

const ZoomTargetBox: React.FC<ZoomTargetBoxProps> = ({ zoomPoint, pointIndex, isSelected, onUpdate }) => {
    // Local state for smooth dragging/resizing
    const [localRegion, setLocalRegion] = useState(zoomPoint.targetRegion);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // Sync local state with props when not actively manipulating
    useEffect(() => {
        if (!isDragging && !isResizing) {
            setLocalRegion(zoomPoint.targetRegion);
        }
    }, [zoomPoint.targetRegion, isDragging, isResizing]);

    // Determine box color - use custom color or cycle through default colors
    const boxColor = zoomPoint.color || ZOOM_POINT_COLORS[pointIndex % ZOOM_POINT_COLORS.length];

    const { x, y, width, height } = localRegion;

    // Non-selected box: simple static display without interaction
    if (!isSelected) {
        return (
            <div
                className="absolute z-40 pointer-events-none select-none"
                style={{
                    left: x,
                    top: y,
                    width: width,
                    height: height,
                }}
            >
                {/* Static Border - dimmed for non-selected */}
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        border: `2px dashed ${boxColor}`,
                        backgroundColor: `${boxColor}08`,
                    }}
                >
                    {/* Label */}
                    <div
                        className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[8px] font-medium whitespace-nowrap text-white/70"
                        style={{ backgroundColor: `${boxColor}99` }}
                    >
                        {zoomPoint.label}
                    </div>
                </div>
            </div>
        );
    }

    // Selected box: full interactive display
    return (
        <div
            className="absolute z-50 pointer-events-auto select-none"
            style={{
                left: x,
                top: y,
                width: width,
                height: height,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Main Box - Draggable Area */}
            <motion.div
                className="absolute inset-0 cursor-move"
                style={{
                    border: `2px dashed ${boxColor}`,
                    backgroundColor: `${boxColor}15`,
                }}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                onDragStart={() => setIsDragging(true)}
                onDrag={(e, info) => {
                    setLocalRegion(prev => ({
                        ...prev,
                        x: prev.x + info.delta.x,
                        y: prev.y + info.delta.y
                    }));
                }}
                onDragEnd={() => {
                    setIsDragging(false);
                    // Persist to store
                    onUpdate(pointIndex, { x: localRegion.x, y: localRegion.y });
                }}
            >
                {/* Label */}
                <div
                    className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap text-white"
                    style={{ backgroundColor: boxColor }}
                >
                    {zoomPoint.label}
                </div>

                {/* Corner Handles (decorative) */}
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-sm" style={{ backgroundColor: boxColor }} />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-sm" style={{ backgroundColor: boxColor }} />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-sm" style={{ backgroundColor: boxColor }} />
            </motion.div>

            {/* Resize Handle - Bottom Right */}
            <motion.div
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 cursor-nwse-resize flex items-center justify-center z-10"
                style={{ backgroundColor: boxColor }}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
                onDragStart={() => setIsResizing(true)}
                onDrag={(e, info) => {
                    setLocalRegion(prev => ({
                        ...prev,
                        width: Math.max(50, prev.width + info.delta.x),
                        height: Math.max(50, prev.height + info.delta.y)
                    }));
                }}
                onDragEnd={() => {
                    setIsResizing(false);
                    // Persist to store
                    onUpdate(pointIndex, { width: localRegion.width, height: localRegion.height });
                }}
            >
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M21 21L12 12M21 21V15M21 21H15" />
                </svg>
            </motion.div>

            {/* Size Indicator */}
            <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono text-white whitespace-nowrap"
                style={{ backgroundColor: boxColor }}
            >
                {Math.round(width)}×{Math.round(height)}
            </div>
        </div>
    );
};
