import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { API_BASE, safeFetch } from '@/lib/api'; // Added API_BASE and safeFetch import
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

// Canvas dimensions - now dynamic based on template type
const INVITATION_WIDTH = 414;
const INVITATION_HEIGHT = 896;
const DISPLAY_WIDTH = 1920;
const DISPLAY_HEIGHT = 1080;

// Transition effect types (from legacy)
type TransitionEffect = 'none' | 'slide-up' | 'slide-down' | 'fade' | 'zoom-reveal' | 'stack-reveal' | 'parallax-reveal' | 'door-reveal' | 'carry-up' | 'pinch-close' | 'split-door';

// ============================================
// PREVIEW VIEW COMPONENT
// Enterprise-grade invitation preview
// Based on tamuu-legacy PreviewView.vue
// ============================================
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

    // Dynamic canvas dimensions based on template type
    const CANVAS_WIDTH = templateType === 'display' ? DISPLAY_WIDTH : INVITATION_WIDTH;
    const CANVAS_HEIGHT = templateType === 'display' ? DISPLAY_HEIGHT : INVITATION_HEIGHT;
    const isDisplay = templateType === 'display';

    // State
    const [isOpened, setIsOpened] = useState(false); // Track if "Open Invitation" clicked
    const [transitionStage, setTransitionStage] = useState<'IDLE' | 'ZOOMING' | 'REVEALING' | 'DONE'>('IDLE');
    const [shutterVisible, setShutterVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [showMusicTitle, setShowMusicTitle] = useState(false); // New Premium State
    const [isMuted, setIsMuted] = useState(true);
    const [currentZoomPointIndex, setCurrentZoomPointIndex] = useState<Record<string, number>>({});
    const [visibleSections, setVisibleSections] = useState<number[]>([0]);
    const [clickedSections, setClickedSections] = useState<number[]>([]); // Track which sections have been clicked (for click trigger)
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 }); // Default values to prevent NaN

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const zoomTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Interaction Poller (Dev/Local Sync)
    useEffect(() => {
        if (!isOpen) return;

        // CTO: Synchronously clear interactions and initialize timestamp reference
        resetInteractions();

        const stored = localStorage.getItem('tamuu_interaction_event');
        if (stored) {
            try {
                const event = JSON.parse(stored);
                lastTriggerRef.current = { effect: event.effect, timestamp: event.timestamp };
                console.log('[PreviewView] Initialized interaction ref from storage:', event.timestamp);
            } catch (e) { }
        }

        const checkInteraction = () => {
            try {
                const stored = localStorage.getItem('tamuu_interaction_event');
                if (stored) {
                    const event = JSON.parse(stored);
                    const lastTimestamp = lastTriggerRef.current?.timestamp || 0;

                    // If new event (within last 5 seconds)
                    if (event.timestamp > lastTimestamp && Date.now() - event.timestamp < 5000) {
                        lastTriggerRef.current = { effect: event.effect, timestamp: event.timestamp };
                        useStore.getState().triggerInteraction(event.name, event.effect, event.style);
                    }
                }
            } catch (e) {
                console.error('Interaction poll error:', e);
            }
        };

        const interval = setInterval(checkInteraction, 200);
        return () => clearInterval(interval);
    }, []);

    // Sort sections by order
    const sortedSections = useMemo(() => {
        try {
            const filtered = [...sections]
                .filter(s => s && s.isVisible)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(s => ({ ...s, elements: s.elements || [] }));

            return filtered;
        } catch (err) {
            console.error('[PreviewAudit] Error in sortedSections memo:', err);
            return [];
        }
    }, [sections]);

    // Calculate scale factor for responsive design (with safety checks)
    // Calculate scale factor for responsive design (with safety checks)
    // CTO: Robust breakpoint at 1024px OR portrait orientation
    const isPortrait = templateType === 'display' ? false : (windowSize.height >= windowSize.width || windowSize.width < 1024);
    const scaleFactor = useMemo(() => {
        if (windowSize.width === 0 || windowSize.height === 0) return 1;

        const widthScale = windowSize.width / CANVAS_WIDTH;
        const heightScale = windowSize.height / CANVAS_HEIGHT;

        if (isPortrait) {
            // "FILL WIDTH" strategy as requested: Always fill the width
            // This makes it "Full Screen" left-to-right, while height becomes scrollable
            return widthScale;
        } else {
            // Desktop behavior remains: Fit to height
            // For display templates, we always want to fit
            return Math.min(widthScale, heightScale);
        }
    }, [windowSize, isPortrait, CANVAS_WIDTH, CANVAS_HEIGHT]);

    // Calculate cover height (fills viewport exactly at current scale)
    const coverHeight = useMemo(() => {
        if (!scaleFactor || scaleFactor === 0) return CANVAS_HEIGHT;
        // Revert to pure viewport height computation for Section 0
        return windowSize.height / scaleFactor;
    }, [windowSize.height, scaleFactor]);

    // Calculate total height for scroll container
    const totalHeight = useMemo(() => {
        if (sortedSections.length === 0) return CANVAS_HEIGHT;
        // In portrait, every section fits the screen height
        if (isPortrait) return sortedSections.length * coverHeight;
        // Desktop: First is coverHeight, others are CANVAS_HEIGHT
        return coverHeight + (sortedSections.length - 1) * CANVAS_HEIGHT;
    }, [sortedSections, coverHeight, isPortrait]);

    // Get transition config from first section
    const transitionConfig = useMemo(() => {
        const section0 = sortedSections[0];
        return section0?.pageTransition || { enabled: false, effect: 'slide-up' as TransitionEffect, duration: 1500 };
    }, [sortedSections]);

    const transitionEffect = transitionConfig.enabled ? transitionConfig.effect as TransitionEffect : 'slide-up';
    const transitionDuration = (transitionConfig.duration || 1500) / 1000;

    // Viewport background (Adaptive)
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

    // Keyboard handler for Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Window resize handler
    useEffect(() => {
        const updateSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        // Initialize immediately
        if (typeof window !== 'undefined') {
            updateSize();
        }
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Live Trigger Polling (Remote Control)
    useEffect(() => {
        if (!isOpen || !propId || propIsTemplate) return;

        const pollTriggers = async () => {
            try {
                const baseUrl = API_BASE;
                const endpoint = templateType === 'display'
                    ? `/api/user-display-designs/${propId}`
                    : `/api/invitations/${propId}`;

                const response = await safeFetch(`${baseUrl}${endpoint}`);
                if (!response.ok) return;

                const data = await response.json();

                // Triggers can be in content.activeTrigger or sections[0].activeTrigger
                const trigger = data.content?.activeTrigger || data.sections?.[0]?.activeTrigger;

                if (trigger && trigger.timestamp !== lastTriggerRef.current?.timestamp) {
                    // Only trigger if it's the first time or a new timestamp
                    if (lastTriggerRef.current !== null) {
                        triggerGlobalEffect(trigger.effect);
                    }
                    lastTriggerRef.current = trigger;
                }
            } catch (err) {
                // Silently handle polling errors
                console.error('[LiveTrigger] Polling failed:', err);
            }
        };

        const interval = setInterval(pollTriggers, 2000);
        pollTriggers(); // Initial check

        return () => clearInterval(interval);
    }, [isOpen, propId, propIsTemplate, templateType, triggerGlobalEffect]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            // Update window size immediately when opening
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });

            if (templateType === 'display') {
                setIsOpened(true);
                setTransitionStage('DONE');
                setVisibleSections(sortedSections.map((_, i) => i));
            } else {
                setIsOpened(false);
                setTransitionStage('IDLE');
                setVisibleSections([0]);
            }

            setCurrentZoomPointIndex({});
            clearAnimationCache();

            // Start zoom animation for section 0 if scroll trigger
            setTimeout(() => {
                const section0 = sortedSections[0];
                if (section0?.zoomConfig?.enabled && section0.zoomConfig.trigger === 'scroll') {
                    startZoomAnimation(0, section0);
                }
            }, 100);
        }
        return () => {
            // Cleanup timers
            Object.values(zoomTimers.current).forEach(timer => clearTimeout(timer));
            zoomTimers.current = {};
        };
    }, [isOpen, sortedSections, templateType]);

    // Fullscreen handlers
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // Audio Handling
    const { play, pause, isPlaying: isGlobalPlaying, currentUrl } = useAudioController();
    const music = useStore(state => state.music);
    const autoplayTriedRef = useRef(false);

    // Robust Autoplay: Attempt immediately and on first interaction
    useEffect(() => {
        if (!isOpen) return;

        if (isOpen && music?.url) {
            // Immediately attempt to play
            play(music.url);

            // Brief delay before showing title for cinematic entrance
            const timer = setTimeout(() => setShowMusicTitle(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, music?.url, play, pause]);

    // Extra cleanup on actual component unmount
    useEffect(() => {
        return () => {
            pause();
        };
    }, []);

    // Lenis Smooth Scroll Initialization
    useEffect(() => {
        if (!isOpen || !scrollContainerRef.current) return;

        const lenis = new Lenis({
            wrapper: scrollContainerRef.current,
            content: scrollContainerRef.current.firstElementChild as HTMLElement,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
        });

        // Loop Lenis
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        const rafId = requestAnimationFrame(raf);

        // Control Lenis based on transition stage
        if (transitionStage !== 'DONE') {
            lenis.stop();
        } else {
            lenis.start();
        }

        return () => {
            lenis.destroy();
            cancelAnimationFrame(rafId);
        };
    }, [isOpen, transitionStage]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // ============================================
    // CLICK INTERACTION LOGIC (Blast)
    // ============================================
    const getAllBlastElementsData = useCallback(() => {
        if (!sections) return [];
        const allBlastData: { config: any, x: number, y: number }[] = [];

        for (const section of sections) {
            const blastElements = (section.elements || []).filter((el: any) => el.type === 'interaction');
            blastElements.forEach((blastElement: any) => {
                if (blastElement?.interactionConfig) {
                    allBlastData.push({
                        config: blastElement.interactionConfig,
                        x: blastElement.x + (blastElement.width || 100) / 2,
                        y: blastElement.y + (blastElement.height || 100) / 2
                    });
                }
            });
        }
        return allBlastData;
    }, [sections]);

    const handleClick = (e: React.MouseEvent) => {
        if (!isDisplay) return;

        console.log('[PreviewView] Click detected');
        e.stopPropagation();

        const allBlastData = getAllBlastElementsData();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        const hasNameBoard = sections.some((s: any) =>
            s.elements?.some((el: any) => el.type === 'name_board')
        );

        if (allBlastData.length > 0) {
            const interactions = allBlastData.map(data => {
                const canvasW = DISPLAY_WIDTH * scaleFactor;
                const canvasH = DISPLAY_HEIGHT * scaleFactor;
                const offsetX = (winW - canvasW) / 2;
                const offsetY = (winH - canvasH) / 2;

                const blastScreenX = offsetX + data.x * scaleFactor;
                const blastScreenY = offsetY + data.y * scaleFactor;

                const origin = { x: blastScreenX / winW, y: blastScreenY / winH };
                const style = hasNameBoard ? 'none' : (data.config?.greetingStyle || 'cinematic');

                return {
                    effect: data.config?.effect || 'confetti',
                    style: style as any,
                    origin,
                    resetDuration: data.config?.resetDuration
                };
            });

            // Use the test name from the first blast element or fallback
            const testName = allBlastData[0].config?.testName || 'Guest Name';

            console.log('[PreviewView] Triggering batch interactions:', interactions.length);
            triggerBatchInteractions(testName, interactions);
        } else {
            // Fallback for click anywhere if no interaction elements exist
            const origin = { x: e.clientX / winW, y: e.clientY / winH };
            const style = hasNameBoard ? 'none' : 'cinematic';
            triggerBatchInteractions('Guest Name', [{
                effect: 'confetti',
                style: style as any,
                origin
            }]);
        }
    };

    // Start multi-point zoom animation for a section
    const startZoomAnimation = useCallback((sectionIndex: number, section: any) => {
        const zoomConfig = section.zoomConfig;
        if (!zoomConfig?.enabled) return Promise.resolve();

        return new Promise<void>((resolve) => {
            const points = zoomConfig.points || [];
            if (points.length === 0) {
                resolve();
                return;
            }

            // Clear existing timer
            if (zoomTimers.current[sectionIndex]) {
                clearTimeout(zoomTimers.current[sectionIndex]);
            }

            let currentIndex = 0;
            const loop = !!zoomConfig.loop;

            const runNext = () => {
                if (currentIndex >= points.length) {
                    if (loop) {
                        currentIndex = 0;
                    } else if (zoomConfig.behavior === 'reset') {
                        setCurrentZoomPointIndex(prev => ({ ...prev, [sectionIndex]: -1 }));
                        setTimeout(resolve, 500);
                        return;
                    } else {
                        resolve();
                        return;
                    }
                }

                const point = points[currentIndex];
                const stayDuration = Number(point?.duration || zoomConfig.duration || 3000);
                const transDuration = Number(point?.transitionDuration || zoomConfig.transitionDuration || 1000);

                setCurrentZoomPointIndex(prev => ({ ...prev, [sectionIndex]: currentIndex }));

                zoomTimers.current[sectionIndex] = setTimeout(() => {
                    currentIndex++;
                    runNext();
                }, stayDuration + transDuration);
            };

            // Start from initial state
            setCurrentZoomPointIndex(prev => ({ ...prev, [sectionIndex]: -1 }));
            setTimeout(() => {
                setCurrentZoomPointIndex(prev => ({ ...prev, [sectionIndex]: 0 }));
                runNext();
            }, 100);
        });
    }, []); // Removed sortedSections from dependencies as it's not directly used in this useCallback

    // Handle "Open Invitation" button click
    const handleOpenInvitation = useCallback(async () => {
        if (isOpened) return;
        setIsOpened(true);
        setTransitionStage('ZOOMING');

        // Start zoom animation for section 0 if open_btn or load trigger
        const section0 = sortedSections[0];
        if (section0?.zoomConfig?.enabled && (section0.zoomConfig.trigger === 'open_btn' || section0.zoomConfig.trigger === 'load')) {
            await startZoomAnimation(0, section0);
        }

        // Luxury Shutter Effect (if enabled or for specific effects)
        if (transitionEffect === 'split-door') {
            setShutterVisible(true);
            // Wait for shutters to appear before starting reveal
            await new Promise(r => setTimeout(r, 100));
        }

        // Start revealing
        setTransitionStage('REVEALING');

        // Make section 1 visible and start its zoom
        setVisibleSections(prev => [...prev, 1]);
        const section1 = sortedSections[1];
        if (section1?.zoomConfig?.enabled) {
            // Section 1 often uses 'load' or 'scroll', we trigger it during reveal
            startZoomAnimation(1, section1);
        }

        // Complete transition after animation
        setTimeout(() => {
            setTransitionStage('DONE');
            setShutterVisible(false);
            // Make all sections visible
            setVisibleSections(sortedSections.map((_, i) => i));
        }, transitionDuration * 1000 + 100);
    }, [isOpened, sortedSections, startZoomAnimation, transitionDuration, transitionEffect]);

    // Handle scroll to Section 1 when transition is DONE
    React.useLayoutEffect(() => {
        if (transitionStage === 'DONE' && isOpened && scaleFactor > 0) {
            // Instant scroll to match the layout shift from Atomic (top:0) to Flow (top:coverHeight)
            // This maintains visual continuity without a jump or scroll animation
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    // BUT, the previous code had `const scrollTarget = coverHeight * scaleFactor; ` commented out?
                    // No, line 223 in original code had `coverHeight * scaleFactor`.
                    // But in my previous fix I used `top: coverHeight`.
                    // The user said "Masih ada bug".
                    // Maybe `coverHeight` IS wrong?
                    // Layout:
                    // Container (overflow-auto).
                    // Child -> `transform: scale(0.5)`. `height: 5000px`.
                    // If I scroll 500px. I move 500px down the 5000px child.
                    // Visual displacement: 500px * 0.5 = 250px.
                    // Section 1 is at `top: 896px`.
                    // Visual start: 896 * 0.5 = 448px.
                    // If I want to align the top of viewport with Visual Start of Section 1.
                    // I need Visual Displacement of 448px.
                    // So I need to scroll 896px (Unscaled).
                    // SO `coverHeight` (Unscaled) is CORRECT.

                    // CORRECTION: In the previous successful "Revert" fix attempt (step 1507), I used `top: coverHeight`.
                    // The user said "Masih ada bug".
                    // Maybe `coverHeight` IS wrong?
                    // Let's use the calculated top for section 1 in flow mode.
                    // This is `coverHeight` for portrait, and `coverHeight` for desktop.
                    // So `coverHeight` is correct for the *unscaled* content.
                    // The scroll position should be relative to the *scaled* container.
                    // If the content is scaled down, the scroll position needs to be scaled up to compensate.
                    // Example: content is 1000px high, scaled to 0.5, so it appears 500px high.
                    // If we want to scroll to 100px *content* position, we need to scroll 100px * 0.5 = 50px *visual* scroll.
                    // So, if section 1's unscaled top is `coverHeight`, the visual scroll position is `coverHeight * scaleFactor`.
                    top: coverHeight * scaleFactor,
                    behavior: 'instant'
                });
            }
        }
    }, [transitionStage, isOpened, scaleFactor, coverHeight]);

    // Calculate zoom transform for a section
    const getZoomTransform = useCallback((section: any, sectionIndex: number) => {
        const zoomConfig = section.zoomConfig;
        if (!zoomConfig?.enabled) return { scale: 1, x: 0, y: 0 };

        const points = zoomConfig.points || [];
        const currentIdx = currentZoomPointIndex[sectionIndex];

        // Reset state
        if (currentIdx === -1 || currentIdx === undefined) {
            return { scale: 1, x: 0, y: 0 };
        }

        const point = points[Math.min(currentIdx, points.length - 1)];
        if (!point?.targetRegion) {
            return { scale: zoomConfig.scale || 1.3, x: 0, y: 0 };
        }

        const { x: boxX, y: boxY, width: boxWidth, height: boxHeight } = point.targetRegion;

        // Calculate scale to make the box fill the viewport
        // Standard width is 414. Standard height for viewport is coverHeight.
        const scaleX = CANVAS_WIDTH / Math.max(boxWidth, 1);
        const scaleY = coverHeight / Math.max(boxHeight, 1);

        // Use Min to ensure the whole box fits ("Contain" / "Fit")
        // Use Max to ensure the screen is covered ("Cover" / "Fill")
        const zoomMode = section.zoomConfig?.zoomMode || 'fit';
        const rawScale = zoomMode === 'fill' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

        // Remove artificial floors and allow massive precision (up to 100x zoom)
        const scale = Math.min(Math.max(1, rawScale), 100);

        // Content Offset for centering 896 design in dynamic coverHeight
        // boxY is relative to the internal 896 canvas height
        const contentOffset = isPortrait ? (coverHeight - CANVAS_HEIGHT) / 2 : 0;

        // Precise Target Center in the unscaled coordinate system (414 x coverHeight)
        const centerX = boxX + boxWidth / 2;
        const centerY = boxY + contentOffset + boxHeight / 2;

        // Final Formula for 'top left' (0,0) origin:
        // Result = Translation + Scale * LocalPosition
        // We want Result to be the exact center of the viewport:
        // Translation = ViewportCenter - (Scale * LocalPosition)
        const translateX = (CANVAS_WIDTH / 2) - (scale * centerX);
        const translateY = (coverHeight / 2) - (scale * centerY);

        return { scale, x: translateX, y: translateY };
    }, [currentZoomPointIndex, coverHeight, isPortrait]); // Removed sortedSections from dependencies as it's not directly used here

    // Get section style based on transition stage (from legacy getSectionSlotStyle)
    const getSectionStyle = useCallback((index: number): React.CSSProperties => {
        const isFirst = index === 0;
        const isSecond = index === 1;
        const isRevealing = transitionStage === 'REVEALING';
        const isDone = transitionStage === 'DONE';
        const flowMode = isDone;

        // Calculate section height (matches viewport height exactly in portrait)
        const sectionHeight = isPortrait ? coverHeight : CANVAS_HEIGHT;

        // Calculate section position
        let calculatedTop = 0;
        if (index > 0) {
            calculatedTop = isPortrait
                ? index * coverHeight
                : coverHeight + (index - 1) * CANVAS_HEIGHT;
        }

        const base: React.CSSProperties = {
            position: 'absolute',
            left: 0,
            width: CANVAS_WIDTH,
            height: sectionHeight,
            overflow: 'hidden',
        };

        if (!flowMode) {
            // ATOMIC MODE (Before/During Transition)
            if (isFirst) {
                const firstStyle: React.CSSProperties = {
                    ...base,
                    top: 0,
                    zIndex: 20,
                    transition: isRevealing ? `transform ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1), opacity ${transitionDuration}s ease-in-out, clip-path ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1)` : undefined,
                };

                if (isRevealing) {
                    // Apply transition effect
                    switch (transitionEffect) {
                        case 'slide-up':
                            firstStyle.transform = 'translateY(-100%)';
                            break;
                        case 'slide-down':
                            firstStyle.transform = 'translateY(100%)';
                            firstStyle.opacity = 0;
                            break;
                        case 'fade':
                            firstStyle.opacity = 0;
                            break;
                        case 'zoom-reveal':
                            firstStyle.transform = 'scale(1.3)';
                            firstStyle.opacity = 0;
                            break;
                        case 'stack-reveal':
                            firstStyle.transform = 'translateY(-100%) scale(0.9)';
                            firstStyle.opacity = 0;
                            break;
                        case 'parallax-reveal':
                            firstStyle.transform = 'translateY(-120%)';
                            firstStyle.opacity = 0.3;
                            break;
                        case 'door-reveal':
                            firstStyle.transform = 'perspective(1500px) rotateY(-90deg)';
                            firstStyle.opacity = 0;
                            firstStyle.transformOrigin = 'left center';
                            break;
                        case 'carry-up':
                            firstStyle.transform = 'translateY(-100%)';
                            break;
                        case 'pinch-close':
                            firstStyle.transform = 'scaleX(0)';
                            firstStyle.transformOrigin = 'center center';
                            break;
                        case 'split-door':
                            // Simulating luxury split door using clip-path in React (more performant than mask)
                            // We use a custom property for the clip-path transition if possible, or just two divs.
                            // For simplicity, let's use a dual-pane approach or just fade/slide for now 
                            // unless I add the shutter component.
                            firstStyle.opacity = 0;
                            break;
                    }
                }

                return firstStyle;
            }

            if (isSecond) {
                const secondStyle: React.CSSProperties = {
                    ...base,
                    top: 0,
                    zIndex: 10,
                    transition: isRevealing ? `transform ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1), opacity ${transitionDuration}s ease-in-out` : undefined,
                };

                if (!isRevealing) {
                    // Initial state before reveal
                    switch (transitionEffect) {
                        case 'zoom-reveal':
                            secondStyle.transform = 'scale(0.85)';
                            secondStyle.opacity = 0;
                            break;
                        case 'stack-reveal':
                            secondStyle.transform = 'translateY(100%) scale(0.9)';
                            secondStyle.opacity = 0;
                            break;
                        case 'parallax-reveal':
                            secondStyle.transform = 'translateY(60%) scale(0.95)';
                            secondStyle.opacity = 0;
                            break;
                        case 'fade':
                        case 'slide-down':
                            secondStyle.opacity = 0;
                            secondStyle.transform = 'scale(0.95)';
                            break;
                        case 'door-reveal':
                            secondStyle.transform = 'scale(0.95)';
                            secondStyle.opacity = 0;
                            break;
                        case 'carry-up':
                            secondStyle.transform = 'translateY(100%)';
                            secondStyle.opacity = 1;
                            break;
                        case 'pinch-close':
                            secondStyle.transform = 'translateY(100%)';
                            secondStyle.opacity = 1;
                            break;
                        default:
                            secondStyle.opacity = 0;
                    }
                } else {
                    // Final revealed state
                    secondStyle.transform = 'scale(1) translateY(0)';
                    secondStyle.opacity = 1;
                }

                return secondStyle;
            }

            // Sections 2+: Hidden in atomic mode
            return {
                ...base,
                top: 0,
                zIndex: 1,
                display: 'none',
            };
        } else {
            // FLOW MODE (After transition complete)
            return {
                ...base,
                top: calculatedTop,
                zIndex: 1,
                opacity: 1,
            };
        }
    }, [transitionStage, transitionEffect, transitionDuration, coverHeight, isPortrait]);

    // Intersection observer for scroll-triggered sections
    useEffect(() => {
        if (!isOpen || !scrollContainerRef.current || transitionStage !== 'DONE') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = parseInt(entry.target.getAttribute('data-index') || '-1');
                    if (index === -1) return;

                    if (entry.isIntersecting) {
                        setVisibleSections(prev => {
                            if (prev.includes(index)) return prev;
                            const next = [...prev, index];
                            const section = sortedSections[index];
                            if (section?.zoomConfig?.enabled && (section.zoomConfig.trigger === 'scroll' || section.zoomConfig.trigger === 'load')) {
                                startZoomAnimation(index, section);
                            }
                            return next;
                        });
                    } else {
                        // Remove from visible sections if it left the top or bottom
                        setVisibleSections(prev => prev.filter(i => i !== index));
                    }
                });
            },
            { threshold: 0.1, root: scrollContainerRef.current }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [isOpen, sortedSections, startZoomAnimation, transitionStage]); // Removed visibleSections from dependencies as it's updated inside the callback

    // Don't render until we have valid window dimensions
    if (!isOpen || windowSize.width === 0 || windowSize.height === 0) return null;

    return (
        <AnimatePresence>
            <m.div
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden transition-colors duration-700"
                style={viewportBackgroundStyle}
            >
                {/* 
                    INTERACTION OVERLAY (CTO FIX)
                    A transparent layer on top of everything to catch clicks reliably in preview mode.
                */}
                {isDisplay && (
                    <div
                        className="absolute inset-0 z-[50000] cursor-pointer"
                        onClick={handleClick}
                    />
                )}
                {/* 
                    CTO ENTERPRISE LAYOUT ENGINE V2 - CSS GRID
                    - Mobile: Single column, full width invitation.
                    - Desktop: 3-column grid [1fr | center | 1fr] for ZERO-GAP GUARANTEE.
                */}

                {/* Main Layout Container - CSS GRID on Desktop, FLEX on Mobile */}
                <div
                    ref={scrollContainerRef}
                    className={`w-full h-full ${transitionStage === 'DONE' ? 'overflow-y-auto' : 'overflow-hidden'} ${isPortrait ? 'premium-scroll no-scrollbar' : 'premium-scroll'}`}
                    style={{
                        display: isPortrait ? 'flex' : 'grid',
                        // GRID: 3-column layout for PERFECT ZERO-GAP alignment
                        gridTemplateColumns: isPortrait ? undefined : `1fr ${CANVAS_WIDTH * scaleFactor}px 1fr`,
                        gridTemplateRows: '1fr',
                        // FLEX fallback for mobile
                        flexDirection: isPortrait ? 'column' : undefined,
                        alignItems: isPortrait ? 'flex-start' : 'stretch',
                        justifyContent: isPortrait ? 'flex-start' : undefined,
                    }}
                >
                    {/* LEFT STAGE (Grid Column 1) - Desktop Only */}
                    {!isPortrait && (
                        <div
                            className="h-screen sticky top-0 pointer-events-none overflow-hidden"
                            style={{
                                gridColumn: 1,
                                position: 'sticky',
                                top: 0,
                            }}
                        >
                            <PreviewOrbitStage
                                type="left"
                                config={orbit.left}
                                scaleFactor={scaleFactor}
                                isOpened={isOpened}
                                transitionStage={transitionStage}
                                coverHeight={coverHeight}
                                isPortrait={isPortrait}
                                overrideStyle={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                            />
                        </div>
                    )}

                    {/* CENTER CANVAS (Grid Column 2 / Flex Main) */}
                    <div
                        className="relative overflow-hidden"
                        style={{
                            gridColumn: isPortrait ? undefined : 2,
                            // Width is scaled width (Visual)
                            width: CANVAS_WIDTH * scaleFactor,
                            // Height is layout height (Visual)
                            height: totalHeight * scaleFactor,
                            // Prevent shrinking
                            flexShrink: 0,
                            justifySelf: isPortrait ? undefined : 'center',
                        }}
                    >
                        {/* Unscaled Content Container (Transformed) */}
                        <div
                            style={{
                                width: CANVAS_WIDTH,
                                height: totalHeight,
                                transform: `scale(${scaleFactor})`,
                                transformOrigin: isPortrait ? 'top left' : 'top center',
                                position: 'absolute',
                                top: 0,
                                left: isPortrait ? 0 : '50%',
                                marginLeft: isPortrait ? 0 : -(CANVAS_WIDTH / 2),
                            }}
                        >
                            {/* Sections */}
                            {sortedSections.map((section, index) => {
                                const points = section.zoomConfig?.points || [];
                                const currentIdx = currentZoomPointIndex[index];
                                const activePoint = currentIdx !== undefined && currentIdx !== -1 ? points[currentIdx] : null;
                                const zoomTransform = getZoomTransform(section, index);
                                const zoomDuration = ((activePoint?.transitionDuration ?? section.zoomConfig?.transitionDuration) || 1000) / 1000;
                                const sectionStyle = getSectionStyle(index);

                                // Handler for section click (triggers zoom if trigger is 'click')
                                const handleSectionClick = () => {
                                    if (!clickedSections.includes(index)) {
                                        setClickedSections(prev => [...prev, index]);
                                    }

                                    // Trigger zoom if trigger is set to 'click'
                                    if (section?.zoomConfig?.enabled && section.zoomConfig.trigger === 'click') {
                                        startZoomAnimation(index, section);
                                    }
                                };

                                return (
                                    <div
                                        key={section.id}
                                        ref={el => { sectionRefs.current[index] = el; }}
                                        data-index={index}
                                        style={sectionStyle}
                                        onClick={handleSectionClick}
                                    >
                                        {/* Zoom Animation Wrapper */}
                                        <m.div
                                            className="absolute inset-0 w-full h-full"
                                            animate={{
                                                scale: zoomTransform.scale,
                                                x: zoomTransform.x,
                                                y: zoomTransform.y,
                                            }}
                                            transition={{
                                                duration: zoomDuration,
                                                // PREMIUM LIQUID EASE: More fluid and high-end feel
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            style={{
                                                transformOrigin: '0 0',
                                                overflow: 'hidden',
                                                willChange: 'transform',
                                                transformStyle: 'preserve-3d',
                                                WebkitFontSmoothing: 'antialiased'
                                            }}
                                        >
                                            {/* Design-Space Container for Background & Elements */}
                                            <div className="absolute inset-0 w-full h-full">
                                                {/* Background - Fills coverHeight for seamless look */}
                                                <div
                                                    className={`absolute inset-0 bg-cover bg-center pointer-events-none ${section.kenBurnsEnabled ? 'animate-ken-burns' : ''}`}
                                                    style={{
                                                        backgroundColor: section.backgroundColor || '#0a0a0a',
                                                        backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : undefined,
                                                    }}
                                                />

                                                {/* Overlay - Fills coverHeight */}
                                                {section.backgroundUrl && (section.overlayOpacity || 0) > 0 && (
                                                    <div
                                                        className="absolute inset-0 bg-black pointer-events-none"
                                                        style={{ opacity: section.overlayOpacity }}
                                                    />
                                                )}

                                                {/* Particle Effects - Fills coverHeight */}
                                                {section.particleType && section.particleType !== 'none' && (
                                                    <div className="absolute inset-0 pointer-events-none">
                                                        <ParticleOverlay type={section.particleType} />
                                                    </div>
                                                )}

                                                {/* Centered Elements Container (The 896 Design Space) */}
                                                <div
                                                    className="absolute left-0 overflow-visible"
                                                    style={{
                                                        top: 0,
                                                        height: index === 0 ? coverHeight : CANVAS_HEIGHT,
                                                        width: CANVAS_WIDTH,
                                                    }}
                                                >
                                                    {/* Elements */}
                                                    {(section.elements || [])
                                                        .filter((el: any) => {
                                                            if (!el || !el.isVisible) return false;
                                                            // Legacy logic: Hide "Open" buttons from Section 0 after it's been revealed
                                                            if (index === 0 && transitionStage === 'DONE' && (el.type === 'button' || el.type === 'open_invitation_button')) {
                                                                return false;
                                                            }
                                                            return true;
                                                        })
                                                        .map((element: any) => {
                                                            // LIQUID LAYOUT ENGINE (Legacy tamuu algorithm)
                                                            // We adjust individual element Y positions to "compress" or "expand" 
                                                            // the layout based on available viewport height (coverHeight).
                                                            let adjustedY = element.y;
                                                            if (isPortrait) {
                                                                const extraHeight = coverHeight - CANVAS_HEIGHT;

                                                                // Robust height detection (matches renderer logic)
                                                                const elementHeight = element.height || element.size?.height || (element.textStyle?.fontSize) || 0;
                                                                const maxTop = CANVAS_HEIGHT - elementHeight;

                                                                // Progress determines if the element is near the top (0) or bottom (1)
                                                                let progress = maxTop > 0 ? element.y / maxTop : 0;
                                                                progress = Math.max(0, Math.min(1, progress));

                                                                // Apply linear interpolation
                                                                adjustedY = element.y + (extraHeight * progress);
                                                            }

                                                            // Determine if this element should be force-triggered
                                                            const elementTrigger = element.animation?.trigger || 'scroll';
                                                            let forceTrigger = false;

                                                            switch (elementTrigger) {
                                                                case 'load':
                                                                    forceTrigger = true;
                                                                    break;
                                                                case 'scroll':
                                                                    forceTrigger = visibleSections.includes(index);
                                                                    break;
                                                                case 'open_btn':
                                                                    forceTrigger = isOpened;
                                                                    break;
                                                                case 'click':
                                                                    forceTrigger = clickedSections.includes(index);
                                                                    break;
                                                            }

                                                            return (
                                                                <AnimatedLayer
                                                                    key={`${section.id}-${element.id}`}
                                                                    layer={element}
                                                                    adjustedY={adjustedY}
                                                                    isOpened={isOpened}
                                                                    isEditor={false}
                                                                    onOpenInvitation={handleOpenInvitation}
                                                                    scrollContainerRef={scrollContainerRef}
                                                                    forceTrigger={forceTrigger}
                                                                    isSectionActive={index === 0 ? visibleSections.includes(index) : (visibleSections.includes(index) && transitionStage === 'DONE')}
                                                                />
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </m.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT STAGE (Grid Column 3) - Desktop Only */}
                    {!isPortrait && (
                        <div
                            className="h-screen sticky top-0 pointer-events-none overflow-hidden"
                            style={{
                                gridColumn: 3,
                                position: 'sticky',
                                top: 0,
                            }}
                        >
                            <PreviewOrbitStage
                                type="right"
                                config={orbit.right}
                                scaleFactor={scaleFactor}
                                isOpened={isOpened}
                                transitionStage={transitionStage}
                                coverHeight={coverHeight}
                                isPortrait={isPortrait}
                                overrideStyle={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* NOTE: Orbit elements are designed for desktop's 3-column layout (left/center/right panels).
                    On mobile (portrait), there are no side panels, so orbit elements are intentionally not rendered.
                    If mobile framing is needed, elements should be added directly to sections or as separate mobile-specific overlays. */}

                {/* Controls Overlay - Highest z-index (Level 90000) to ensure clickability above all effects */}
                <div
                    className="absolute top-4 right-4 z-[90000] flex items-center gap-2"
                    style={{
                        transform: `scale(${Math.max(1 / scaleFactor, 0.5)})`,
                        transformOrigin: 'top right'
                    }}
                >
                    {/* Premium Music Control - Enterprise-Grade Aesthetic */}
                    <m.div
                        layout
                        initial={{ width: 48 }}
                        animate={{ width: showMusicTitle ? 'auto' : 48 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center bg-black/60 backdrop-blur-xl rounded-full border border-white/20 shadow-lg overflow-hidden"
                        style={{ height: 48 }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const url = music?.url || currentUrl || `${API_BASE}/assets/music/tr-01.mp3`;
                                isGlobalPlaying ? pause() : play(url);
                            }}
                            className="relative flex items-center justify-center text-premium-accent hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
                            style={{ width: 48, height: 48 }}
                            title={isGlobalPlaying ? 'Stop Music' : 'Play Music'}
                        >
                            {/* Rotating Indicator - Grid centering for perfect symmetry */}
                            {isGlobalPlaying && (
                                <div
                                    className="absolute inset-0 grid place-items-center pointer-events-none"
                                >
                                    <m.div
                                        initial={{ opacity: 0, rotate: 0 }}
                                        animate={{ opacity: 1, rotate: 360 }}
                                        transition={{
                                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                                            opacity: { duration: 0.3 }
                                        }}
                                        className="border-2 border-dashed border-premium-accent/60 rounded-full"
                                        style={{ width: 36, height: 36 }}
                                    />
                                </div>
                            )}
                            <div className="relative z-10 transition-transform active:scale-95">
                                {!isGlobalPlaying ? <Play className="w-5 h-5 fill-current" /> : <Square className="w-5 h-5 fill-current" />}
                            </div>
                        </button>

                        <AnimatePresence mode="wait">
                            {showMusicTitle && (
                                <m.div
                                    key="music-title"
                                    initial={{ opacity: 0, x: -10, width: 0 }}
                                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                                    exit={{ opacity: 0, x: -10, width: 0 }}
                                    className="pr-5 py-2 whitespace-nowrap overflow-hidden flex-shrink-0"
                                >
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">Now Playing</span>
                                        <span className="text-xs font-bold text-premium-accent leading-none truncate max-w-[120px]">{music?.title || 'Sabilulungan'}</span>
                                    </div>
                                </m.div>
                            )}
                        </AnimatePresence>
                    </m.div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white rounded-full border border-white/20 transition-colors"
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white rounded-full border border-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* MIRROR SHUTTERS (Optional Luxury Transition) */}
                <AnimatePresence>
                    {shutterVisible && (
                        <m.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex overflow-hidden pointer-events-none"
                        >
                            <m.div
                                initial={{ x: 0 }}
                                animate={{ x: '-100%' }}
                                transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
                                className="w-1/2 h-full bg-white/20 backdrop-blur-md border-r border-white/30"
                            />
                            <m.div
                                initial={{ x: 0 }}
                                animate={{ x: '100%' }}
                                transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
                                className="w-1/2 h-full bg-white/20 backdrop-blur-md border-l border-white/30"
                            />
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Branding Footer - High z-index but below interactive controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-base z-[89999] pointer-events-none tracking-[0.4em] uppercase" style={{ fontFamily: "'Poiret One', cursive", fontWeight: 400 }}>
                    TAMUU.ID
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-sans font-bold tracking-normal scale-75 whitespace-nowrap opacity-80">VERIFIED v5.4</span>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
@keyframes ken - burns {
    0 % { transform: scale(1); }
    100 % { transform: scale(1.15); }
}
                    .animate - ken - burns {
    animation: ken - burns 20s ease -in -out infinite alternate;
}
`}} />

                {/* GLOBAL VISUAL ENGINE (Background/Foreground) - INSIDE FULLSCREEN CONTAINER */}
                <VisualEffectsCanvas mode="global" className="z-[70000]" />
                {!isDisplay && <GuestGreetingOverlay />}

                {/* Premium Guest QR System */}
                {!isDisplay && (
                    <>
                        <GuestQRTrigger
                            isVisible={true}
                            onClick={() => setIsQRModalOpen(true)}
                        />
                        <GuestQRModal
                            isOpen={isQRModalOpen}
                            onClose={() => setIsQRModalOpen(false)}
                            guestName={useStore.getState().isTemplate ? "John Doe & Partner" : (useStore.getState().greetingName || "Guest Name")}
                            guestId={useStore.getState().isTemplate ? "TMU-2026-X99" : (useStore.getState().id || "UNKNOWN")}
                        />
                    </>
                )}

                {/* Admin HUD (Debug Mode Only) */}
                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true' && (
                    <div className="absolute top-20 right-4 z-[60001]">
                        <DisplaySimulationHUD />
                    </div>
                )}
            </m.div>


        </AnimatePresence>
    );
};
const DESIGN_ORBIT_WIDTH = 800;
const DESIGN_ORBIT_HEIGHT = 896;

const PreviewOrbitStage: React.FC<{
    type: 'left' | 'right',
    config: any,
    scaleFactor: number,
    isOpened: boolean,
    transitionStage: string,
    overrideStyle?: React.CSSProperties,
    coverHeight: number,
    isPortrait: boolean
}> = ({ type, config, scaleFactor, isOpened, transitionStage, overrideStyle, coverHeight, isPortrait }) => {
    if (!config || !config.isVisible) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-100"
            style={{
                [type]: 0,
                backgroundColor: 'transparent',
                backgroundImage: 'none',
                zIndex: 100, // CTO: Framing elements must always be above the background
                overflow: 'visible', // CTO: Allow ornaments to overlap slightly
                ...overrideStyle
            }}
        >
            {/* Elements Container - Standardized coordinate system matching editor (800px width) */}
            <div
                className="absolute"
                style={{
                    top: 0,
                    width: DESIGN_ORBIT_WIDTH,
                    height: isPortrait ? coverHeight : DESIGN_ORBIT_HEIGHT,
                    backgroundColor: isPortrait ? 'transparent' : (config.backgroundColor || '#050505'),
                    backgroundImage: isPortrait ? 'none' : (config.backgroundUrl ? `url(${config.backgroundUrl})` : 'none'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    [type]: 0,
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: type === 'left' ? 'left top' : 'right top'
                }}
            >
                {(config.elements || []).map((element: any) => {
                    let adjustedY = element.y;
                    if (isPortrait) {
                        const extraHeight = Math.max(0, coverHeight - 896);
                        const elementHeight = element.height || 0;
                        const maxTop = Math.max(1, 896 - elementHeight);
                        const progress = Math.max(0, Math.min(1, element.y / maxTop));
                        adjustedY = element.y + (extraHeight * progress);
                    }

                    return (
                        <AnimatedLayer
                            key={element.id}
                            layer={element}
                            adjustedY={adjustedY}
                            isOpened={isOpened}
                            isEditor={false}
                            forceTrigger={true} // CTO: Always trigger entrance for orbit ornaments
                            isSectionActive={true} // CTO: Orbit is always active once loaded
                        />
                    );
                })}
            </div>
        </div>
    );
};
