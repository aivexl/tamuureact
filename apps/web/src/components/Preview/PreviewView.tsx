import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { API_BASE, safeFetch } from '@/lib/api';
import { X, Maximize2, Minimize2, Play, Square } from 'lucide-react';
import { ElementRenderer } from '../Canvas/ElementRenderer';
import { AnimatedLayer, clearAnimationCache } from './AnimatedLayer';
import { ParticleOverlay } from './ParticleOverlay';
import Lenis from 'lenis';
import { VisualEffectsCanvas } from '../Canvas/VisualEffectsCanvas';
import { GuestGreetingOverlay } from '../Canvas/GuestGreetingOverlay';
import { DisplaySimulationHUD } from '../Canvas/DisplaySimulationHUD';
import { useAudioController } from '@/hooks/useAudioController';
import { useSEO } from '@/hooks/useSEO';
import { GuestQRTrigger } from './GuestQRTrigger';
import { GuestQRModal } from './GuestQRModal';
import { SmartFontInjector } from '../ui/SmartFontInjector';

// Canvas dimensions
const INVITATION_WIDTH = 414;
const INVITATION_HEIGHT = 896;
const DISPLAY_WIDTH = 1920;
const DISPLAY_HEIGHT = 1080;

type TransitionEffect = 'none' | 'slide-up' | 'slide-down' | 'fade' | 'zoom-reveal' | 'stack-reveal' | 'parallax-reveal' | 'door-reveal' | 'carry-up' | 'pinch-close' | 'split-door';

interface PreviewViewProps {
    isOpen: boolean;
    onClose: () => void;
    id?: string;
    isTemplate?: boolean;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ isOpen, onClose, id: propId, isTemplate: propIsTemplate }) => {
    const { sections, orbit, templateType, triggerGlobalEffect, triggerBatchInteractions,
        resetInteractions
    } = useStore();
    const lastTriggerRef = useRef<{ effect: string, timestamp: number } | null>(null);

    const CANVAS_WIDTH = templateType === 'display' ? DISPLAY_WIDTH : INVITATION_WIDTH;
    const CANVAS_HEIGHT = templateType === 'display' ? DISPLAY_HEIGHT : INVITATION_HEIGHT;
    const isDisplay = templateType === 'display';

    // State
    const [isOpened, setIsOpened] = useState(false);
    const [transitionStage, setTransitionStage] = useState<'IDLE' | 'ZOOMING' | 'REVEALING' | 'DONE'>('IDLE');
    const [shutterVisible, setShutterVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [showMusicTitle, setShowMusicTitle] = useState(false);
    const [currentZoomPointIndex, setCurrentZoomPointIndex] = useState<Record<string, number>>({});
    const [visibleSections, setVisibleSections] = useState<number[]>([0]);
    const [clickedSections, setClickedSections] = useState<number[]>([]);
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

    // Store State
    const elementDimensions = useStore(state => state.elementDimensions);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const zoomTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Window resize handler
    useEffect(() => {
        const updateSize = () => { setWindowSize({ width: window.innerWidth, height: window.innerHeight }); };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const sortedSections = useMemo(() => {
        return [...sections]
            .filter(s => s && s.isVisible)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(s => ({ ...s, elements: s.elements || [] }));
    }, [sections]);

    const isPortrait = templateType === 'display' ? false : (windowSize.height >= windowSize.width || windowSize.width < 1024);
    
    const scaleFactor = useMemo(() => {
        if (windowSize.width === 0 || windowSize.height === 0) return 1;
        const widthScale = windowSize.width / CANVAS_WIDTH;
        const heightScale = windowSize.height / CANVAS_HEIGHT;
        return isPortrait ? widthScale : Math.min(widthScale, heightScale);
    }, [windowSize, isPortrait, CANVAS_WIDTH, CANVAS_HEIGHT]);

    const coverHeight = useMemo(() => {
        if (!scaleFactor) return CANVAS_HEIGHT;
        return windowSize.height / scaleFactor;
    }, [windowSize.height, scaleFactor]);

    // ============================================
    // CTO UNIFIED LAYOUT ENGINE V3.1 (PRO UX)
    // One engine to rule positioning and heights
    // ============================================
    const layoutData = useMemo(() => {
        return sortedSections.map((section, sectionIndex) => {
            const isFirst = sectionIndex === 0;
            
            // 1. Sort elements by original Y to process stacking correctly
            const elements = [...section.elements]
                .filter((el: any) => el && el.isVisible)
                .sort((a, b) => a.y - b.y);

            let cumulativeShift = 0;
            const elementPlacements: Array<{ id: string, adjustedY: number }> = [];

            elements.forEach((el: any) => {
                // Ignore "Open" buttons in Flow mode for Section 0
                if (isFirst && transitionStage === 'DONE' && (el.type === 'button' || el.type === 'open_invitation_button')) {
                    return;
                }

                const detectedDim = elementDimensions?.[el.id];
                const designHeight = el.height || 50;
                const measuredHeight = detectedDim?.height || designHeight;
                const growth = Math.max(0, measuredHeight - designHeight);

                // Current element is pushed by cumulative growth of elements above it
                const stackShift = cumulativeShift;
                
                // Add this element's growth to the pile for the NEXT elements
                if (growth > 2) {
                    cumulativeShift += growth;
                }

                let finalAdjustedY = el.y + stackShift;

                // Section 0 Piecewise Mapping (Adaptive Viewport Fitting)
                if (isPortrait && isFirst) {
                    if (coverHeight < INVITATION_HEIGHT) {
                        const y = el.y; 
                        const T = 200; // Top anchor threshold
                        const B = 696; // Bottom anchor threshold
                        const viewportShift = (coverHeight - INVITATION_HEIGHT) / 2;
                        
                        if (y <= T) {
                            // Elements in top zone compress minimally
                            finalAdjustedY = (y + stackShift) * ((T + viewportShift) / T);
                        } else if (y <= B) {
                            // Elements in center zone follow viewport center shift
                            finalAdjustedY = (y + stackShift) + viewportShift;
                        } else {
                            // Elements in bottom zone (Buttons etc) stick to the bottom properly
                            const baseB = B + viewportShift;
                            // PRO UX: Reduced stackShift for bottom zone to prevent buttons from being pushed out of screen
                            finalAdjustedY = (baseB + (stackShift * 0.15)) + (y - B) * ((coverHeight - (baseB + (stackShift * 0.15))) / (INVITATION_HEIGHT - B));
                        }
                    } else {
                        // Large screen expansion
                        const maxTop = INVITATION_HEIGHT - designHeight;
                        const progress = maxTop > 0 ? Math.max(0, Math.min(1, el.y / maxTop)) : 0;
                        finalAdjustedY = (el.y + stackShift) + (coverHeight - INVITATION_HEIGHT) * progress;
                    }
                }

                elementPlacements.push({ id: el.id, adjustedY: finalAdjustedY });
            });

            // Calculate final section height based on shifted elements
            let sectionHeight = CANVAS_HEIGHT;
            if (isPortrait) {
                if (isFirst) {
                    sectionHeight = coverHeight;
                } else {
                    let maxBottom = 0;
                    elementPlacements.forEach(p => {
                        const el: any = section.elements.find(e => e.id === p.id);
                        const h = elementDimensions?.[p.id]?.height || el.height || 100;
                        const bottom = p.adjustedY + h;
                        if (bottom > maxBottom) maxBottom = bottom;
                    });
                    // Section height is tight to content. Added extra padding for breathability.
                    sectionHeight = Math.max(100, maxBottom + 60); 
                }
            }

            return {
                id: section.id,
                height: sectionHeight,
                elements: elementPlacements
            };
        });
    }, [sortedSections, isPortrait, coverHeight, elementDimensions, transitionStage]);

    const totalHeight = useMemo(() => {
        return layoutData.reduce((acc, s) => acc + s.height, 0);
    }, [layoutData]);

    const getSectionTop = useCallback((index: number) => {
        let top = 0;
        for (let i = 0; i < index; i++) top += layoutData[i].height;
        return top;
    }, [layoutData]);

    // Transition Duration
    const transitionConfig = useMemo(() => {
        const section0 = sortedSections[0];
        return section0?.pageTransition || { enabled: false, effect: 'slide-up' as TransitionEffect, duration: 1500 };
    }, [sortedSections]);

    const transitionEffect = transitionConfig.enabled ? transitionConfig.effect as TransitionEffect : 'slide-up';
    const transitionDuration = (transitionConfig.duration || 1500) / 1000;

    // Viewport background
    const viewportBackgroundStyle = useMemo(() => {
        if (!isPortrait) return { backgroundColor: '#1a1a1a' };
        const section0 = sortedSections[0];
        if (!section0) return { backgroundColor: '#0a0a0a' };
        return {
            backgroundColor: section0.backgroundColor || '#0a0a0a',
            backgroundImage: section0.backgroundUrl ? `url(${section0.backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    }, [isPortrait, sortedSections]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Audio Handling
    const { play, pause, isPlaying: isGlobalPlaying, currentUrl } = useAudioController();
    const music = useStore(state => state.music);

    useEffect(() => {
        if (isOpen && music?.url) {
            play(music.url);
            const timer = setTimeout(() => setShowMusicTitle(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, music?.url, play]);

    // Interaction Poller
    useEffect(() => {
        if (!isOpen) return;
        resetInteractions();
        const handleSync = (e: StorageEvent) => {
            if (e.key === 'tamuu_interaction_event' && e.newValue) {
                try {
                    const event = JSON.parse(e.newValue);
                    const lastTimestamp = lastTriggerRef.current?.timestamp || 0;
                    if (Date.now() - event.timestamp < 5000 && event.timestamp > lastTimestamp) {
                        lastTriggerRef.current = { effect: event.effect, timestamp: event.timestamp };
                        if (event.interactions?.length > 0) triggerBatchInteractions(event.name, event.interactions);
                        else if (event.effect) triggerBatchInteractions(event.name, [{ effect: event.effect, style: event.style, origin: event.origin }]);
                    }
                } catch (err) {}
            }
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, [isOpen, resetInteractions, triggerBatchInteractions]);

    const startZoomAnimation = useCallback((sectionIndex: number, section: any) => {
        const zoomConfig = section.zoomConfig;
        if (!zoomConfig?.enabled) return Promise.resolve();
        return new Promise<void>((resolve) => {
            const points = zoomConfig.points || [];
            if (points.length === 0) return resolve();
            if (zoomTimers.current[sectionIndex]) clearTimeout(zoomTimers.current[sectionIndex]);
            let currentIndex = 0;
            const runNext = () => {
                if (currentIndex >= points.length) {
                    if (zoomConfig.loop) currentIndex = 0;
                    else if (zoomConfig.behavior === 'reset') { setCurrentZoomPointIndex(p => ({ ...p, [sectionIndex]: -1 })); setTimeout(resolve, 500); return; }
                    else return resolve();
                }
                const point = points[currentIndex];
                setCurrentZoomPointIndex(p => ({ ...p, [sectionIndex]: currentIndex }));
                zoomTimers.current[sectionIndex] = setTimeout(() => { currentIndex++; runNext(); }, Number(point?.duration || 3000) + Number(point?.transitionDuration || 1000));
            };
            setCurrentZoomPointIndex(p => ({ ...p, [sectionIndex]: -1 }));
            setTimeout(() => { setCurrentZoomPointIndex(p => ({ ...p, [sectionIndex]: 0 })); runNext(); }, 100);
        });
    }, []);

    const handleOpenInvitation = useCallback(async () => {
        if (isOpened) return;
        setIsOpened(true); setTransitionStage('ZOOMING');
        const s0 = sortedSections[0];
        if (s0?.zoomConfig?.enabled && (s0.zoomConfig.trigger === 'open_btn' || s0.zoomConfig.trigger === 'load')) await startZoomAnimation(0, s0);
        if (transitionEffect === 'split-door') setShutterVisible(true);
        setTransitionStage('REVEALING');
        setVisibleSections(prev => [...prev, 1]);
        const s1 = sortedSections[1];
        if (s1?.zoomConfig?.enabled) startZoomAnimation(1, s1);
        setTimeout(() => { setTransitionStage('DONE'); setShutterVisible(false); setVisibleSections(sortedSections.map((_, i) => i)); }, transitionDuration * 1000 + 100);
    }, [isOpened, sortedSections, startZoomAnimation, transitionDuration, transitionEffect]);

    const getZoomTransform = useCallback((section: any, sectionIndex: number) => {
        const zoomConfig = section.zoomConfig;
        if (!zoomConfig?.enabled) return { scale: 1, x: 0, y: 0 };
        const currentIdx = currentZoomPointIndex[sectionIndex];
        if (currentIdx === -1 || currentIdx === undefined) return { scale: 1, x: 0, y: 0 };
        const point = zoomConfig.points?.[Math.min(currentIdx, zoomConfig.points.length - 1)];
        if (!point?.targetRegion) return { scale: zoomConfig.scale || 1.3, x: 0, y: 0 };
        const { x: boxX, y: boxY, width: boxWidth, height: boxHeight } = point.targetRegion;
        const scale = Math.min(Math.max(1, Math.min(CANVAS_WIDTH / boxWidth, coverHeight / boxHeight)), 100);
        const contentOffset = isPortrait ? (coverHeight - CANVAS_HEIGHT) / 2 : 0;
        const centerX = boxX + boxWidth / 2;
        const centerY = boxY + contentOffset + boxHeight / 2;
        return { scale, x: (CANVAS_WIDTH / 2) - (scale * centerX), y: (coverHeight / 2) - (scale * centerY) };
    }, [currentZoomPointIndex, coverHeight, isPortrait, CANVAS_WIDTH, CANVAS_HEIGHT]);

    const getSectionStyle = useCallback((index: number): React.CSSProperties => {
        const isRevealing = transitionStage === 'REVEALING';
        const isDone = transitionStage === 'DONE';
        const flowMode = isDone;

        const sectionHeight = layoutData[index].height;
        const calculatedTop = getSectionTop(index);

        const base: React.CSSProperties = { 
            position: 'absolute', 
            left: 0, 
            width: CANVAS_WIDTH, 
            height: sectionHeight, 
            overflow: isPortrait ? 'visible' : 'hidden' 
        };

        if (!flowMode) {
            if (index === 0) {
                const style: React.CSSProperties = { ...base, top: 0, zIndex: 20, transition: isRevealing ? `transform ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1), opacity ${transitionDuration}s ease-in-out` : undefined };
                if (isRevealing) {
                    if (transitionEffect === 'slide-up') style.transform = 'translateY(-100%)';
                    else if (transitionEffect === 'fade') style.opacity = 0;
                }
                return style;
            }
            if (index === 1) {
                const style: React.CSSProperties = { ...base, top: 0, zIndex: 10, transition: isRevealing ? `transform ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1), opacity ${transitionDuration}s ease-in-out` : undefined };
                if (!isRevealing) style.opacity = 0; else { style.transform = 'scale(1) translateY(0)'; style.opacity = 1; }
                return style;
            }
            return { ...base, top: 0, zIndex: 1, display: 'none' };
        }
        return { ...base, top: calculatedTop, zIndex: 1, opacity: 1 };
    }, [transitionStage, transitionEffect, transitionDuration, layoutData, getSectionTop, CANVAS_WIDTH, isPortrait]);

    // Initial setup
    useEffect(() => {
        if (isOpen) {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            if (templateType === 'display') {
                setIsOpened(true); setTransitionStage('DONE'); setVisibleSections(sortedSections.map((_, i) => i));
            } else {
                setIsOpened(false); setTransitionStage('IDLE'); setVisibleSections([0]);
            }
            setCurrentZoomPointIndex({}); clearAnimationCache();
            setTimeout(() => {
                const s0 = sortedSections[0];
                if (s0?.zoomConfig?.enabled && s0.zoomConfig.trigger === 'scroll') startZoomAnimation(0, s0);
            }, 100);
        }
    }, [isOpen, sortedSections, templateType]);

    // Fullscreen and Close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Lenis Smooth Scroll
    useEffect(() => {
        if (!isOpen || !scrollContainerRef.current) return;
        const lenis = new Lenis({ wrapper: scrollContainerRef.current, content: scrollContainerRef.current.firstElementChild as HTMLElement, duration: 1.2 });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        const rafId = requestAnimationFrame(raf);
        if (transitionStage !== 'DONE') lenis.stop(); else lenis.start();
        return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
    }, [isOpen, transitionStage]);

    // Instant scroll to match Section 1
    React.useLayoutEffect(() => {
        if (transitionStage === 'DONE' && isOpened && scaleFactor > 0 && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: layoutData[0].height * scaleFactor, behavior: 'instant' });
        }
    }, [transitionStage, isOpened, scaleFactor, layoutData]);

    if (!isOpen || windowSize.width === 0 || windowSize.height === 0) return null;

    return (
        <AnimatePresence>
            <m.div ref={containerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden transition-colors duration-700" style={viewportBackgroundStyle}>
                <SmartFontInjector />
                <div ref={scrollContainerRef} className={`w-full h-full ${transitionStage === 'DONE' ? 'overflow-y-auto' : 'overflow-hidden'} premium-scroll no-scrollbar`} style={{ display: isPortrait ? 'flex' : 'grid', gridTemplateColumns: isPortrait ? undefined : `1fr ${CANVAS_WIDTH * scaleFactor}px 1fr`, flexDirection: isPortrait ? 'column' : undefined }}>
                    {!isPortrait && <div className="h-screen sticky top-0 pointer-events-none overflow-hidden" style={{ gridColumn: 1 }}><PreviewOrbitStage type="left" config={orbit.left} scaleFactor={scaleFactor} isOpened={isOpened} transitionStage={transitionStage} coverHeight={coverHeight} isPortrait={isPortrait} /></div>}
                    <div className="relative overflow-hidden" style={{ gridColumn: isPortrait ? undefined : 2, width: CANVAS_WIDTH * scaleFactor, height: totalHeight * scaleFactor, flexShrink: 0 }}>
                        <div style={{ width: CANVAS_WIDTH, height: totalHeight, transform: `scale(${scaleFactor})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                            {sortedSections.map((section, index) => {
                                const zoomTransform = getZoomTransform(section, index);
                                const sectionStyle = getSectionStyle(index);
                                const sectionLayout = layoutData[index];
                                return (
                                    <div key={section.id} ref={el => { sectionRefs.current[index] = el; }} data-index={index} style={sectionStyle}>
                                        <m.div 
                                            className="absolute inset-0 w-full h-full" 
                                            animate={{ scale: zoomTransform.scale, x: zoomTransform.x, y: zoomTransform.y }} 
                                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} 
                                            style={{ 
                                                transformOrigin: '0 0', 
                                                overflow: isPortrait ? 'visible' : 'hidden' 
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundColor: section.backgroundColor || '#0a0a0a', backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : undefined }} />
                                            {section.backgroundUrl && (section.overlayOpacity || 0) > 0 && <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: section.overlayOpacity }} />}
                                            {section.particleType && section.particleType !== 'none' && <div className="absolute inset-0 pointer-events-none"><ParticleOverlay type={section.particleType} /></div>}
                                            <div className="absolute left-0 overflow-visible" style={{ top: 0, height: sectionLayout.height, width: CANVAS_WIDTH }}>
                                                {sectionLayout.elements.map((placement) => {
                                                    const element: any = section.elements.find(e => e.id === placement.id);
                                                    const trigger = element.animation?.trigger || 'scroll';
                                                    let force = false;
                                                    if (trigger === 'load') force = true;
                                                    else if (trigger === 'scroll') force = visibleSections.includes(index);
                                                    else if (trigger === 'open_btn') force = isOpened;
                                                    else if (trigger === 'click') force = clickedSections.includes(index);
                                                    return <AnimatedLayer key={`${section.id}-${element.id}`} layer={element} adjustedY={placement.adjustedY} isOpened={isOpened} isEditor={false} invitationId={propId} onOpenInvitation={handleOpenInvitation} scrollContainerRef={scrollContainerRef} forceTrigger={force} isSectionActive={index === 0 ? visibleSections.includes(index) : (visibleSections.includes(index) && transitionStage === 'DONE')} />;
                                                })}
                                            </div>
                                        </m.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {!isPortrait && <div className="h-screen sticky top-0 pointer-events-none overflow-hidden" style={{ gridColumn: 3 }}><PreviewOrbitStage type="right" config={orbit.right} scaleFactor={scaleFactor} isOpened={isOpened} transitionStage={transitionStage} coverHeight={coverHeight} isPortrait={isPortrait} /></div>}
                </div>
                <div className="absolute top-4 right-4 z-[90000] flex items-center gap-2" style={{ transform: `scale(${Math.max(1 / scaleFactor, 0.5)})`, transformOrigin: 'top right' }}>
                    <m.div layout initial={{ width: 48 }} animate={{ width: showMusicTitle ? 'auto' : 48 }} className="flex items-center bg-black/60 backdrop-blur-xl rounded-full border border-white/20 overflow-hidden" style={{ height: 48 }}>
                        <button onClick={(e) => { e.stopPropagation(); const url = music?.url || currentUrl || undefined; isGlobalPlaying ? pause() : (url && play(url)); }} className="relative flex items-center justify-center text-premium-accent hover:bg-white/10 transition-all cursor-pointer flex-shrink-0" style={{ width: 48, height: 48 }}>
                            {isGlobalPlaying && <div className="absolute inset-0 grid place-items-center pointer-events-none"><m.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="border-2 border-dashed border-premium-accent/60 rounded-full" style={{ width: 36, height: 36 }} /></div>}
                            <div className="relative z-10 transition-transform active:scale-95">{!isGlobalPlaying ? <Play className="w-5 h-5 fill-current" /> : <Square className="w-5 h-5 fill-current" />}</div>
                        </button>
                        <AnimatePresence>{showMusicTitle && <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="pr-5 py-2 flex flex-col justify-center"><span className="text-[10px] font-black uppercase text-white/40 leading-none mb-1">Now Playing</span><span className="text-xs font-bold text-premium-accent leading-none truncate max-w-[120px]">{music?.title || 'TAMUU'}</span></m.div>}</AnimatePresence>
                    </m.div>
                    <button onClick={toggleFullscreen} className="p-3 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white rounded-full border border-white/20 transition-colors">{isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
                    <button onClick={onClose} className="p-3 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white rounded-full border border-white/20 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-base z-[89999] pointer-events-none tracking-[0.4em] uppercase" style={{ fontFamily: "'Poiret One', cursive", fontWeight: 400 }}>TAMUU.ID</div>
                <VisualEffectsCanvas mode="global" className="z-[70000]" />
                {!isDisplay && <GuestGreetingOverlay />}
                {!isDisplay && <><GuestQRTrigger isVisible={true} onClick={() => setIsQRModalOpen(true)} /><GuestQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} guestName={useStore.getState().isTemplate ? "John Doe" : (useStore.getState().guestData?.name || "Guest")} checkInCode={useStore.getState().isTemplate ? "X9K2PJ" : (useStore.getState().guestData?.check_in_code || "UNKNOWN")} /></>}
            </m.div>
        </AnimatePresence>
    );
};

const DESIGN_ORBIT_WIDTH = 800;
const DESIGN_ORBIT_HEIGHT = 896;

const PreviewOrbitStage: React.FC<{ type: 'left' | 'right', config: any, scaleFactor: number, isOpened: boolean, transitionStage: string, coverHeight: number, isPortrait: boolean }> = ({ type, config, scaleFactor, isOpened, transitionStage, coverHeight, isPortrait }) => {
    if (!config || !config.isVisible) return null;
    return (
        <div className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-100" style={{ [type]: 0, zIndex: 100, overflow: 'visible' }}>
            <div className="absolute" style={{ top: 0, width: DESIGN_ORBIT_WIDTH, height: isPortrait ? coverHeight : DESIGN_ORBIT_HEIGHT, backgroundColor: isPortrait ? 'transparent' : (config.backgroundColor || '#050505'), backgroundImage: isPortrait ? 'none' : (config.backgroundUrl ? `url(${config.backgroundUrl})` : 'none'), backgroundSize: 'cover', [type]: 0, transform: `scale(${scaleFactor})`, transformOrigin: type === 'left' ? 'left top' : 'right top' }}>
                {(config.elements || []).map((element: any) => {
                    let adjustedY = element.y;
                    if (isPortrait && coverHeight < 896) {
                        const y = element.y; const T = 200; const B = 696; const shift = (coverHeight - 896) / 2;
                        if (y <= T) adjustedY = y * ((T + shift) / T);
                        else if (y <= B) adjustedY = y + shift;
                        else adjustedY = (B + shift) + (y - B) * ((coverHeight - (B + shift)) / (896 - B));
                    }
                    return <AnimatedLayer key={element.id} layer={element} adjustedY={adjustedY} isOpened={isOpened} isEditor={false} forceTrigger={true} isSectionActive={true} />;
                })}
            </div>
        </div>
    );
};
