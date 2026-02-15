import React, { useRef, useEffect, useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Moveable from 'react-moveable';
import { useStore } from '@/store/useStore';
import { CanvasElement } from './CanvasElement';
import { VisualEffectsCanvas } from './VisualEffectsCanvas';
import { GuestGreetingOverlay } from './GuestGreetingOverlay';
import { Layer } from '@/store/layersSlice';
import {
    ChevronLeft, ChevronRight, Copy, Trash2,
    ZoomIn, ZoomOut, Maximize, Monitor
} from 'lucide-react';

// ============================================
// DISPLAY CANVAS COMPONENT
// Optimized for TV/Tablet Welcome Displays (1920x1080)
// ============================================

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// Toolbar Button Component
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
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) onClick(e);
        }}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all flex items-center justify-center ${disabled ? 'opacity-20 cursor-not-allowed' :
            variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                : variant === 'premium'
                    ? 'text-premium-accent hover:bg-premium-accent/20'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
        title={title}
    >
        {icon}
    </m.button>
);

export const DisplayCanvas: React.FC = () => {
    const {
        sections, activeSectionId, setActiveSection,
        updateElementInSection, updateSection,
        selectLayer, selectedLayerId, selectedLayerIds, clearSelection,
        removeSection, duplicateSection,
        duplicateElementInSection, bringElementToFront, sendElementToBack,
        removeElementFromSection
    } = useStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.5); // Default zoom to fit in viewport
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);
    const [shiftPressed, setShiftPressed] = useState(false);

    // Get active section
    const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

    // Calculate fit-to-screen zoom
    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth - 100; // padding
            const containerHeight = containerRef.current.offsetHeight - 100;
            const scaleX = containerWidth / CANVAS_WIDTH;
            const scaleY = containerHeight / CANVAS_HEIGHT;
            const fitZoom = Math.min(scaleX, scaleY, 1);
            setZoom(Math.max(0.2, fitZoom));
        }
    }, []);

    // Moveable targets
    const targetMap = useRef<Map<string, HTMLDivElement>>(new Map());
    const [targets, setTargets] = useState<HTMLDivElement[]>([]);

    useEffect(() => {
        const activeTargets = selectedLayerIds
            .map((id: string) => targetMap.current.get(id))
            .filter(Boolean) as HTMLDivElement[];
        setTargets(activeTargets);
    }, [selectedLayerIds, activeSection?.elements]);

    const registerTarget = (id: string, el: HTMLDivElement | null) => {
        if (el) targetMap.current.set(id, el);
        else targetMap.current.delete(id);
    };

    // Context menu handler
    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, id });
    };

    // Keyboard Shortcuts & Shift Tracking
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey) setShiftPressed(true);

            // Prevent shortcuts if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;
            const hasSelection = selectedLayerIds.length > 0;

            // Delete
            if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
                e.preventDefault();
                selectedLayerIds.forEach(id => {
                    if (activeSectionId) removeElementFromSection(activeSectionId, id);
                });
                clearSelection();
            }

            // Duplicate
            if (isMod && (e.key === 'd' || e.key === 'D') && hasSelection) {
                e.preventDefault();
                selectedLayerIds.forEach(id => {
                    if (activeSectionId) duplicateElementInSection(activeSectionId, id);
                });
            }

            // Nudge
            if (hasSelection && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                selectedLayerIds.forEach(id => {
                    const el = activeSection?.elements.find(l => l.id === id);
                    if (el && activeSectionId) {
                        updateElementInSection(activeSectionId, id, {
                            x: el.x + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0),
                            y: el.y + (e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0)
                        });
                    }
                });
            }

            // Select All
            if (isMod && e.key === 'a') {
                e.preventDefault();
                if (activeSection) selectLayer(activeSection.elements.map(el => el.id) as any, true);
            }

            // Escape
            if (e.key === 'Escape') clearSelection();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.shiftKey) setShiftPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedLayerIds, activeSectionId, activeSection, shiftPressed]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
    const handleFitToScreen = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth - 100;
            const containerHeight = containerRef.current.offsetHeight - 100;
            const scaleX = containerWidth / CANVAS_WIDTH;
            const scaleY = containerHeight / CANVAS_HEIGHT;
            setZoom(Math.min(scaleX, scaleY, 1));
        }
    };

    if (!activeSection) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-white/40 text-center">
                    <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Section Available</p>
                    <p className="text-sm text-white/30">Create a section to start editing</p>
                </div>
            </div>
        );
    }

    // Calculate scaled dimensions for proper layout
    const scaledWidth = CANVAS_WIDTH * zoom;
    const scaledHeight = CANVAS_HEIGHT * zoom;

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0">
            {/* Top Toolbar */}
            <div className="h-12 bg-black/50 border-b border-white/10 flex items-center justify-between px-4">
                {/* Left: Section Info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-white/80">Display Canvas</span>
                    </div>
                    <div className="text-xs text-white/40">
                        {CANVAS_WIDTH} × {CANVAS_HEIGHT}px
                    </div>
                </div>

                {/* Center: Zoom Controls */}
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                    <ToolbarButton onClick={handleZoomOut} icon={<ZoomOut className="w-4 h-4" />} title="Zoom Out" />
                    <span className="text-xs text-white/60 font-mono w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <ToolbarButton onClick={handleZoomIn} icon={<ZoomIn className="w-4 h-4" />} title="Zoom In" />
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <ToolbarButton onClick={handleFitToScreen} icon={<Maximize className="w-4 h-4" />} title="Fit to Screen" />
                </div>

                {/* Right: Section Navigation */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">
                        Section {sections.findIndex(s => s.id === activeSectionId) + 1} of {sections.length}
                    </span>
                    <div className="flex gap-1">
                        <ToolbarButton
                            onClick={() => {
                                const idx = sections.findIndex(s => s.id === activeSectionId);
                                if (idx > 0) setActiveSection(sections[idx - 1].id);
                            }}
                            icon={<ChevronLeft className="w-4 h-4" />}
                            title="Previous Section"
                            disabled={sections.findIndex(s => s.id === activeSectionId) === 0}
                        />
                        <ToolbarButton
                            onClick={() => {
                                const idx = sections.findIndex(s => s.id === activeSectionId);
                                if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                            }}
                            icon={<ChevronRight className="w-4 h-4" />}
                            title="Next Section"
                            disabled={sections.findIndex(s => s.id === activeSectionId) === sections.length - 1}
                        />
                    </div>
                </div>
            </div>

            {/* Canvas Container - scrollable area */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto min-h-0"
                onMouseDown={(e) => {
                    // Only clear selection if clicking directly on the container or canvas background
                    // Not when clicking on an element
                    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.canvas-element') === null) {
                        clearSelection();
                    }
                }}
            >
                {/* Canvas Wrapper - sized for layout, centers content */}
                <div
                    className="flex items-center justify-center p-8"
                    style={{
                        // Explicit size for layout calculation (enables proper scrolling)
                        minWidth: scaledWidth + 64,
                        minHeight: scaledHeight + 64,
                    }}
                >
                    {/* Sizer Container - takes up the scaled space */}
                    <div
                        style={{
                            width: scaledWidth,
                            height: scaledHeight,
                            position: 'relative',
                        }}
                    >
                        {/* Canvas - uses transform:scale to maintain 1:1 coordinate system */}
                        <m.div
                            ref={canvasRef}
                            className="absolute top-0 left-0 shadow-2xl ring-1 ring-white/10 overflow-hidden"
                            style={{
                                width: CANVAS_WIDTH,
                                height: CANVAS_HEIGHT,
                                backgroundColor: activeSection.backgroundColor || '#0a0a0a',
                                backgroundImage: activeSection.backgroundUrl ? `url(${activeSection.backgroundUrl})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            {/* Elements */}
                            {(activeSection.elements || []).map((element: Layer) => (
                                <CanvasElement
                                    key={element.id}
                                    layer={element}
                                    isSelected={selectedLayerIds.includes(element.id)}
                                    onSelect={(isMulti) => selectLayer(element.id, isMulti)}
                                    onContextMenu={(e) => handleContextMenu(e, element.id)}
                                    elementRef={(el) => registerTarget(element.id, el)}
                                />
                            ))}

                            {/* Moveable for selected elements */}
                            {targets.length > 0 && (
                                <Moveable
                                    {...({} as any)}
                                    target={targets}
                                    draggable={true}
                                    resizable={true}
                                    rotatable={true}
                                    snappable={true}
                                    keepRatio={shiftPressed}
                                    snapThreshold={5}
                                    origin={false}
                                    onDrag={(e: any) => {
                                        const id = e.target.getAttribute('data-element-id');
                                        if (id && activeSectionId) {
                                            updateElementInSection(activeSectionId, id, { x: e.left, y: e.top });
                                        }
                                    }}
                                    onResize={(e: any) => {
                                        const id = e.target.getAttribute('data-element-id');
                                        if (id && activeSectionId) {
                                            updateElementInSection(activeSectionId, id, {
                                                width: e.width,
                                                height: e.height,
                                                x: e.drag.left,
                                                y: e.drag.top
                                            });
                                        }
                                    }}
                                    onRotate={(e: any) => {
                                        const id = e.target.getAttribute('data-element-id');
                                        if (id && activeSectionId) {
                                            updateElementInSection(activeSectionId, id, { rotation: e.rotate });
                                        }
                                    }}
                                    className="custom-moveable"
                                />
                            )}
                        </m.div>
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-[100] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 min-w-[160px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                if (activeSectionId) duplicateElementInSection(activeSectionId, contextMenu.id);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Duplicate
                        </button>
                        <button
                            onClick={() => {
                                if (activeSectionId) bringElementToFront(activeSectionId, contextMenu.id);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
                        >
                            <ChevronRight className="w-4 h-4" />
                            Bring to Front
                        </button>
                        <button
                            onClick={() => {
                                if (activeSectionId) sendElementToBack(activeSectionId, contextMenu.id);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Send to Back
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                            onClick={() => {
                                if (activeSectionId) removeElementFromSection(activeSectionId, contextMenu.id);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </m.div>
                )}
            </AnimatePresence>

            <VisualEffectsCanvas mode="scoped" />
            <GuestGreetingOverlay />
        </div>
    );
};

export default DisplayCanvas;


