import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { ElementRenderer } from '../Canvas/ElementRenderer';
import { AnimatedLayer } from './AnimatedLayer';
import { ParticleOverlay } from './ParticleOverlay';
import Lenis from 'lenis';

// Canvas dimensions matching the editor
const CANVAS_WIDTH = 414;
const CANVAS_HEIGHT = 896;

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
}

export const PreviewView: React.FC<PreviewViewProps> = ({ isOpen, onClose }) => {
    const { sections, musicConfig } = useStore();

    // State
    const [isOpened, setIsOpened] = useState(false); // Track if "Open Invitation" clicked
    const [transitionStage, setTransitionStage] = useState<'IDLE' | 'ZOOMING' | 'REVEALING' | 'DONE'>('IDLE');
    const [shutterVisible, setShutterVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
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
    const isPortrait = windowSize.height >= windowSize.width;
    const scaleFactor = useMemo(() => {
        if (windowSize.width === 0 || windowSize.height === 0) return 1;
        return isPortrait
            ? windowSize.width / CANVAS_WIDTH
            : windowSize.height / CANVAS_HEIGHT;
    }, [windowSize, isPortrait]);

    // Calculate cover height (fills viewport in portrait)
    const coverHeight = useMemo(() => {
        if (scaleFactor === 0) return CANVAS_HEIGHT;
        return isPortrait ? windowSize.height / scaleFactor : CANVAS_HEIGHT;
    }, [windowSize.height, scaleFactor, isPortrait]);

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

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            // Update window size immediately when opening
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            setIsOpened(false);
            setTransitionStage('IDLE');
            setVisibleSections([0]);
            setCurrentZoomPointIndex({});

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
    }, [isOpen]);

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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        if (!musicConfig?.url || !isOpen) return;

        if (!audioRef.current) {
            audioRef.current = new Audio(musicConfig.url);
            audioRef.current.loop = musicConfig.loop !== false;
            audioRef.current.volume = (musicConfig.volume || 100) / 100;
        }

        const audio = audioRef.current;

        if (isOpened && !isMuted) {
            audio.play().catch(e => console.log('Audio Autoplay blocked:', e));
        } else {
            audio.pause();
        }

        return () => {
            if (audio) {
                audio.pause();
                // We don't nullify here as we might re-open, 
                // but for true React safety we should nullify on "PreviewView" unmount 
            }
        };
    }, [isOpened, isMuted, musicConfig, isOpen]);

    // Extra cleanup on actual component unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
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
                const transDuration = Number(zoomConfig.transitionDuration || 1000);

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
    }, []);

    // Handle "Open Invitation" button click
    const handleOpenInvitation = useCallback(async () => {
        if (isOpened) return;
        setIsOpened(true);
        setTransitionStage('ZOOMING');

        // Start zoom animation for section 0 if open_btn trigger
        const section0 = sortedSections[0];
        if (section0?.zoomConfig?.enabled && section0.zoomConfig.trigger === 'open_btn') {
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
            startZoomAnimation(1, section1);
        }

        // Complete transition after animation
        setTimeout(() => {
            setTransitionStage('DONE');
            setShutterVisible(false);
            // Make all sections visible
            setVisibleSections(sortedSections.map((_, i) => i));
        }, transitionDuration * 1000 + 100);
    }, [isOpened, sortedSections, startZoomAnimation, transitionDuration]);

    // Handle scroll to Section 1 when transition is DONE
    React.useLayoutEffect(() => {
        if (transitionStage === 'DONE' && isOpened && scaleFactor > 0) {
            // Instant scroll to match the layout shift from Atomic (top:0) to Flow (top:coverHeight)
            // This maintains visual continuity without a jump or scroll animation
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    // BUT, the previous code had `const scrollTarget = coverHeight * scaleFactor;` commented out?
                    // No, line 223 in original code had `coverHeight * scaleFactor`.
                    // But in my previous fix I used `top: coverHeight`.
                    // Let's stick to `coverHeight` if the container's *content* is scaled but scroll metrics reflect unscaled.
                    // Actually, if the container has `transform: scale`, the `scrollHeight` reported by the parent usually ignores the scale?
                    // Let's use `coverHeight` first as it matches the CSS top position logic. 

                    // CORRECTION: In the previous successful "Revert" fix attempt (step 1507), I used `top: coverHeight`.
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
        const scaleX = CANVAS_WIDTH / Math.max(boxWidth, 1);
        const scaleY = CANVAS_HEIGHT / Math.max(boxHeight, 1);
        const scale = Math.min(Math.max(1.1, Math.min(scaleX, scaleY)), 5);

        // Calculate translation to center the box
        const centerX = boxX + boxWidth / 2;
        const centerY = boxY + boxHeight / 2;
        const translateX = (CANVAS_WIDTH / 2 - centerX);
        const translateY = (CANVAS_HEIGHT / 2 - centerY);

        return { scale, x: translateX, y: translateY };
    }, [currentZoomPointIndex]);

    // Get section style based on transition stage (from legacy getSectionSlotStyle)
    const getSectionStyle = useCallback((index: number): React.CSSProperties => {
        const isFirst = index === 0;
        const isSecond = index === 1;
        const isRevealing = transitionStage === 'REVEALING';
        const isDone = transitionStage === 'DONE';
        const flowMode = isDone;

        // Calculate section position
        // Calculate section height (matches viewport height exactly in portrait)
        const sectionHeight = coverHeight;

        // Calculate section position
        let sectionTop = index * sectionHeight; // Simplifies since all sections now use same logic

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
                top: sectionTop,
                zIndex: 1,
                opacity: 1,
            };
        }
    }, [transitionStage, transitionEffect, transitionDuration, coverHeight]);

    // Intersection observer for scroll-triggered sections
    useEffect(() => {
        if (!isOpen || !scrollContainerRef.current || transitionStage !== 'DONE') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = parseInt(entry.target.getAttribute('data-index') || '-1');
                    if (entry.isIntersecting && index !== -1 && !visibleSections.includes(index)) {
                        setVisibleSections(prev => [...prev, index]);
                        const section = sortedSections[index];
                        if (section?.zoomConfig?.enabled && section.zoomConfig.trigger === 'scroll') {
                            startZoomAnimation(index, section);
                        }
                    }
                });
            },
            { threshold: 0.1, root: scrollContainerRef.current }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [isOpen, sortedSections, visibleSections, startZoomAnimation, transitionStage]);

    // Don't render until we have valid window dimensions
    if (!isOpen || windowSize.width === 0 || windowSize.height === 0) return null;

    // Calculate total height for scroll container
    // Calculate total height for scroll container
    const effectiveSectionHeight = coverHeight;
    const totalHeight = sortedSections.length * effectiveSectionHeight;

    return (
        <AnimatePresence>
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden transition-colors duration-700"
                style={viewportBackgroundStyle}
            >
                {/* Controls Overlay */}
                <div
                    className="absolute top-4 right-4 z-[1000] flex items-center gap-2"
                    style={{
                        transform: `scale(${Math.max(1 / scaleFactor, 0.5)})`,
                        transformOrigin: 'top right'
                    }}
                >
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white rounded-full border border-white/20 transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
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

                {/* Main Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className={`w-full h-full flex ${isPortrait ? 'justify-start' : 'justify-center'} ${transitionStage === 'DONE' ? 'overflow-y-auto' : 'overflow-hidden'}`}
                    style={{ alignItems: 'flex-start' }}
                >
                    {/* Visual Layout Wrapper (Matches Visual Size) - overflow-hidden */}
                    <div
                        className="relative overflow-hidden"
                        style={{
                            // Width is scaled width (Visual)
                            width: CANVAS_WIDTH * scaleFactor,
                            // Height is layout height (Visual)
                            height: (transitionStage === 'DONE' ? totalHeight : coverHeight) * scaleFactor,
                            // Margins for desktop centering
                            marginLeft: isPortrait ? 0 : 'auto',
                            marginRight: isPortrait ? 0 : 'auto',
                            // Prevent shrinking in flex container
                            flexShrink: 0,
                        }}
                    >
                        {/* Unscaled Content Container (Transformed) */}
                        <div
                            style={{
                                width: CANVAS_WIDTH,
                                height: transitionStage === 'DONE' ? totalHeight : coverHeight,
                                transform: `scale(${scaleFactor})`,
                                transformOrigin: 'top left',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        >
                            {/* Sections */}
                            {sortedSections.map((section, index) => {
                                const zoomTransform = getZoomTransform(section, index);
                                const zoomDuration = (section.zoomConfig?.transitionDuration || 1000) / 1000;
                                const sectionStyle = getSectionStyle(index);

                                // Handler for section click (triggers all elements with click trigger)
                                const handleSectionClick = () => {
                                    if (!clickedSections.includes(index)) {
                                        setClickedSections(prev => [...prev, index]);
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
                                        <motion.div
                                            className="absolute inset-0 w-full h-full"
                                            animate={{
                                                scale: zoomTransform.scale,
                                                x: zoomTransform.x,
                                                y: zoomTransform.y,
                                            }}
                                            transition={{
                                                duration: zoomDuration,
                                                ease: [0.4, 0, 0.2, 1],
                                            }}
                                            style={{ transformOrigin: 'center center', overflow: 'hidden' }}
                                        >
                                            {/* Background */}
                                            <div
                                                className={`absolute inset-0 bg-cover bg-center ${section.kenBurnsEnabled ? 'animate-ken-burns' : ''}`}
                                                style={{
                                                    backgroundColor: section.backgroundColor || '#0a0a0a',
                                                    backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : undefined,
                                                }}
                                            />

                                            {/* Overlay */}
                                            {section.backgroundUrl && (section.overlayOpacity || 0) > 0 && (
                                                <div
                                                    className="absolute inset-0 bg-black pointer-events-none"
                                                    style={{ opacity: section.overlayOpacity }}
                                                />
                                            )}

                                            {/* Particle Effects */}
                                            {section.particleType && section.particleType !== 'none' && (
                                                <ParticleOverlay type={section.particleType} />
                                            )}

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
                                                    // Adjust Y position for cover section stretch
                                                    let adjustedY = element.y;
                                                    if (index === 0 && !isPortrait) {
                                                        adjustedY = element.y + (coverHeight - CANVAS_HEIGHT) / 2;
                                                    }

                                                    // Determine if this element should be force-triggered
                                                    // For click trigger: forceTrigger when section is clicked
                                                    // For open_btn trigger: forceTrigger when isOpened
                                                    // For scroll trigger: forceTrigger when section is visible
                                                    // For load trigger: always forceTrigger
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
                                                            isSectionActive={visibleSections.includes(index)}
                                                        />
                                                    );
                                                })}
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* MIRROR SHUTTERS (Optional Luxury Transition) */}
                <AnimatePresence>
                    {shutterVisible && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex overflow-hidden pointer-events-none"
                        >
                            <motion.div
                                initial={{ x: 0 }}
                                animate={{ x: '-100%' }}
                                transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
                                className="w-1/2 h-full bg-white/20 backdrop-blur-md border-r border-white/30"
                            />
                            <motion.div
                                initial={{ x: 0 }}
                                animate={{ x: '100%' }}
                                transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
                                className="w-1/2 h-full bg-white/20 backdrop-blur-md border-l border-white/30"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ESC hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs">
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">ESC</kbd> to close
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes ken-burns {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.15); }
                    }
                    .animate-ken-burns {
                        animation: ken-burns 20s ease-in-out infinite alternate;
                    }
                `}} />
            </motion.div>
        </AnimatePresence>
    );
};
