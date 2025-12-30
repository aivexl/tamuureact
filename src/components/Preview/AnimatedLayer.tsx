import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { ElementRenderer } from '../Canvas/ElementRenderer';
import { useStore } from '@/store/useStore';

/**
 * GLOBAL PERSISTENT STATE
 * Used to track animation status for ALL elements by their ID.
 * This ensures that when the component is remounted, the animation state is preserved.
 * Matches legacy tamuu Vue implementation pattern.
 */
const globalAnimatedState = new Map<string, boolean>();

/**
 * Clear the global animation cache.
 * Called when opening/resetting the preview to ensure animations re-trigger.
 */
export const clearAnimationCache = () => {
    console.log('[AnimatedLayer] Clearing animation cache');
    globalAnimatedState.clear();
};

interface AnimatedLayerProps {
    layer: Layer;
    adjustedY: number;
    isOpened: boolean;
    onOpenInvitation?: () => void;
    scrollContainerRef?: React.RefObject<any>;
    isEditor?: boolean;
    /** Force trigger animation (from parent section) - matches legacy forceTrigger */
    forceTrigger?: boolean;
    /** Whether parent section is active - matches legacy isSectionActive */
    isSectionActive?: boolean;
    /** Callback when image dimensions are detected for auto-sizing */
    onDimensionsDetected?: (width: number, height: number) => void;
}

/**
 * AnimatedLayer Component
 * 
 * Enterprise-grade animation system - MIGRATED FROM LEGACY tamuu-legacy/AnimatedElement.vue
 * 
 * Key patterns from legacy:
 * 1. Global persistent state Map for tracking animation status by element ID
 * 2. "immediate" mode for load trigger (animate on mount)
 * 3. Watch pattern for forceTrigger changes (edge detection)
 * 4. isSectionActive check before triggering scroll animations
 * 5. Directional reset logic (only reset if element below viewport)
 */
const AnimatedLayerComponent: React.FC<AnimatedLayerProps> = ({
    layer,
    adjustedY,
    isOpened,
    onOpenInvitation,
    scrollContainerRef,
    isEditor = false,
    forceTrigger = false,
    isSectionActive = true,
    onDimensionsDetected
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isAnimationPlaying = useStore(state => state.isAnimationPlaying);

    // Track previous forceTrigger value for edge detection
    const prevForceTriggerRef = useRef(forceTrigger);

    // Track if element is visible
    const isVisibleRef = useRef(false);

    // InView hook for scroll detection
    const inView = useInView(ref, {
        once: false, // Allow re-triggering for directional reset
        amount: 0.1,
        root: scrollContainerRef
    });

    // Update visibility ref
    useEffect(() => {
        isVisibleRef.current = inView;
    }, [inView]);

    const { animation } = layer;

    // Split Animation Properties (Enterprise Standard)
    // Map new schema or fallback to legacy top-level properties
    const entranceType = (typeof animation?.entrance === 'object' ? animation.entrance.type : animation?.entrance) || animation?.entranceType;
    const entranceTrigger = (typeof animation?.entrance === 'object' ? animation.entrance.trigger : animation?.trigger) || 'scroll';
    const entranceDelay = Math.min(((typeof animation?.entrance === 'object' ? animation.entrance.delay : animation?.delay) || 0) / 1000, 10);
    const entranceDuration = Math.min(((typeof animation?.entrance === 'object' ? animation.entrance.duration : animation?.duration) || 800) / 1000, 10);

    const loopingType = (typeof animation?.loop === 'object' ? animation.loop.type : (animation as any)?.looping) || (layer as any).animationLoop || (animation as any)?.loopingType;
    const loopTrigger = (typeof animation?.loop === 'object' ? animation.loop.trigger : 'load') || 'load';
    const loopDelay = Math.min(((typeof animation?.loop === 'object' ? animation.loop.delay : 0) || 0) / 1000, 10);
    const loopDuration = Math.min(((typeof animation?.loop === 'object' ? animation.loop.duration : ((animation as any)?.duration || 1000)) || 1000) / 1000, 10);
    const loopDirection = (typeof animation?.loop === 'object' ? animation.loop.direction : 'cw') || 'cw';
    const minScale = (typeof animation?.loop === 'object' ? animation.loop.minScale : 0.8) ?? 0.8;
    const maxScale = (typeof animation?.loop === 'object' ? animation.loop.maxScale : 1.2) ?? 1.2;

    // Dedicated Elegant Spin (Enterprise Standard)
    const elegantSpinConfig = layer.elegantSpinConfig;
    const isElegantSpinEnabled = !!elegantSpinConfig?.enabled;

    // Dedicated Infinite Marquee (Pattern Walk / Continuous Scroll)
    const marqueeConfig = layer.infiniteMarqueeConfig;
    // Marquee is enabled if the config is enabled (no imageUrl requirement for scroll mode)
    const isMarqueeEnabled = !!marqueeConfig?.enabled;
    // Tile mode ONLY when explicitly set to 'tile' AND has imageUrl
    const isMarqueeTileMode = isMarqueeEnabled && marqueeConfig?.mode === 'tile' && !!layer.imageUrl;

    // Check if this is an "immediate" trigger (load = animate immediately)
    const isImmediate = entranceTrigger === 'load' || entranceTrigger === 'immediate';

    // Check for animation presence
    const hasEntranceAnimation = entranceType && entranceType !== 'none';
    const hasLoopingAnimation = loopingType && loopingType !== 'none';
    const shouldAnimate = !isEditor || isAnimationPlaying;

    // Static transforms
    const flipX = layer.flipHorizontal ? -1 : 1;
    const flipY = layer.flipVertical ? -1 : 1;
    const baseScale = layer.scale || 1;
    const baseRotate = layer.rotation || 0;

    // Content Loading Logic
    // CTO Optimization: Include more types that might need wait time or standard signaling
    const needsLoadSignal = ['image', 'gif', 'sticker', 'lottie', 'flying_bird'].includes(layer.type);
    const isContentReadyRef = useRef(!needsLoadSignal || isEditor);
    const pendingTriggerRef = useRef(false);

    // ============================================
    // REACTIVE ANIMATION STATE (PRO STANDARD)
    // Matches legacy tamuu patterns: Use state instead of manual controls
    // for robust synchronization across remounts.
    // ============================================
    const [animationState, setAnimationState] = React.useState<"hidden" | "visible">(
        (isEditor && !isAnimationPlaying) || !hasEntranceAnimation || (layer.id && globalAnimatedState.get(layer.id))
            ? "visible"
            : "hidden"
    );

    const handleContentLoad = useCallback(() => {
        if (isContentReadyRef.current) return;
        isContentReadyRef.current = true;

        if (pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            setAnimationState("visible");
            if (layer.id) globalAnimatedState.set(layer.id, true);
        }
    }, [layer.id, setAnimationState]);

    // MEDIA SAFETY FALLBACK: If content takes too long (3s), assume it's "ready enough"
    // to show whatever it has (or an error state) so it doesn't stay invisible.
    useEffect(() => {
        if (isEditor || isContentReadyRef.current) return;
        const timer = setTimeout(() => {
            if (!isContentReadyRef.current) {
                console.warn(`[AnimatedLayer] Content load safety timeout for ${layer.id}`);
                handleContentLoad();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [isEditor, handleContentLoad, layer.id]);

    const tryTriggerAnimation = useCallback(() => {
        if (animationState === "visible") return;

        // Validation: Gate on content readiness
        if (!isContentReadyRef.current) {
            pendingTriggerRef.current = true;
            return;
        }

        setAnimationState("visible");
        if (layer.id) globalAnimatedState.set(layer.id, true);
    }, [animationState, layer.id, setAnimationState]);

    // Entrance Variants
    const variants = useMemo(() => {
        // Calculate static transforms FIRST
        // Relative transforms (translateX/Y) should normally be 0 as destination
        // because we use absolute top/left in the parent container style.
        const targetX = 0;
        const targetY = 0;
        const targetScaleX = isEditor ? 1 : baseScale * flipX;
        const targetScaleY = isEditor ? 1 : baseScale * flipY;
        const targetRotate = isEditor ? 0 : baseRotate;

        // Initialize hidden with these static transforms so they DON'T animate
        // unless overridden by a specific animation type below.
        const hidden: any = {
            opacity: 0,
            x: targetX,
            y: targetY,
            scaleX: targetScaleX,
            scaleY: targetScaleY,
            rotate: targetRotate,
            // Removed default blur to prevent "gejolak" (jitters) on lower-end devices
        };

        const visible: any = {
            opacity: layer.opacity ?? 1,
            x: targetX,
            y: targetY,
            scaleX: targetScaleX,
            scaleY: targetScaleY,
            rotate: targetRotate,
            transition: {
                duration: entranceDuration,
                delay: entranceDelay,
                // PROFESSIONAL EASE: Smooth, clean motion
                ease: [0.22, 1, 0.36, 1]
            }
        };

        if (!hasEntranceAnimation) {
            return {
                hidden: { ...visible, transition: { duration: 0 } },
                visible
            };
        }

        switch (entranceType) {
            case 'fade-in':
                break;
            case 'slide-up': hidden.y = targetY + 30; break;
            case 'slide-down': hidden.y = targetY - 30; break;
            case 'slide-left': hidden.x = targetX + 30; break;
            case 'slide-right': hidden.x = targetX - 30; break;
            case 'slide-in-left': hidden.x = "-100vw"; hidden.opacity = 0; break;
            case 'slide-in-right': hidden.x = "100vw"; hidden.opacity = 0; break;
            case 'zoom-in':
                hidden.scaleX = 0.8 * targetScaleX;
                hidden.scaleY = 0.8 * targetScaleY;
                break;
            case 'zoom-out':
                hidden.scaleX = 1.2 * targetScaleX;
                hidden.scaleY = 1.2 * targetScaleY;
                break;
            case 'bounce':
                hidden.y = targetY - 40;
                visible.transition = { type: "spring", bounce: 0.4, duration: entranceDuration, delay: entranceDelay };
                break;
            case 'pop-in':
                hidden.scaleX = 0.8 * targetScaleX;
                hidden.scaleY = 0.8 * targetScaleY;
                visible.transition = { type: "spring", stiffness: 260, damping: 20, delay: entranceDelay };
                break;
            case 'twirl-in':
                hidden.scaleX = 0;
                hidden.scaleY = 0;
                hidden.rotate = targetRotate - 180;
                visible.transition = {
                    type: "spring",
                    duration: entranceDuration,
                    bounce: 0.2,
                    delay: entranceDelay
                };
                break;
        }

        return { hidden, visible };
    }, [
        entranceType,
        hasEntranceAnimation,
        layer.opacity,
        entranceDuration,
        entranceDelay,
        baseScale,
        flipX,
        flipY,
        baseRotate,
        layer.x,
        adjustedY,
        isEditor
    ]);

    useEffect(() => {
        if (isContentReadyRef.current && pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            tryTriggerAnimation();
        }
    }, [isContentReadyRef.current, tryTriggerAnimation]);

    useEffect(() => {
        if (animationState === "visible") return;

        // If it was already animated in cache, force it to visible immediately
        if (layer.id && globalAnimatedState.get(layer.id)) {
            setAnimationState("visible");
            return;
        }

        // Preview immediate trigger (like trigger='load')
        if (isImmediate) {
            tryTriggerAnimation();
        }

        // Section 0 Fix: We REMOVED the conflicting scroll check here.
        // Scroll-triggered elements will now be handled ONLY by the InView useEffect.
        // This breaks the infinite flicker loop.
    }, [isImmediate, tryTriggerAnimation, animationState, layer.id, setAnimationState]);

    // SCROLL TRIGGER (Entrance)
    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;

        // console.log(`[AnimatedLayer] Scroll Watch: ${layer.name} | inView: ${inView} | active: ${isSectionActive}`);
        if (inView && isSectionActive) {
            tryTriggerAnimation();
        }
    }, [inView, isSectionActive, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger, tryTriggerAnimation, layer.name]);

    // SCROLL RESET (Re-triggering)
    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;

        // When it goes out of view, check if it went off the BOTTOM
        if (!inView && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const viewportH = window.innerHeight;

            // Log for debugging
            // console.log(`[AnimatedLayer] OutOfView: ${layer.name} | top: ${rect.top} | viewport: ${viewportH}`);

            // If the element's top is below the viewport bottom, it's eligible for reset
            // We use a more liberal threshold or just check if it's "mostly" below
            if (rect.top >= viewportH - 100) {
                if (animationState === "visible") {
                    setAnimationState("hidden");
                    if (layer.id) globalAnimatedState.set(layer.id, false);
                }
            }
        }
    }, [inView, animationState, layer.id, layer.name, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger]);

    // FORCE TRIGGER & OPEN BUTTON
    useEffect(() => {
        if (isEditor || !hasEntranceAnimation) return;

        const wasForced = prevForceTriggerRef.current;
        prevForceTriggerRef.current = forceTrigger;

        // CTO ROBUST TRIGGER: 
        // 1. Initial trigger (if starts as forced=true)
        // 2. Positive edge (false -> true)
        if (forceTrigger && (!wasForced || animationState !== "visible")) {
            // Check section is active
            if (!isSectionActive) {
                return;
            }

            // For click/open_btn modes
            if (entranceTrigger === 'click' || entranceTrigger === 'open_btn') {
                if (isVisibleRef.current || isImmediate) {
                    tryTriggerAnimation();
                }
            } else {
                // For scroll mode: only trigger if visible
                if (isVisibleRef.current) {
                    tryTriggerAnimation();
                }
            }
        }
    }, [forceTrigger, entranceTrigger, isEditor, hasEntranceAnimation, isImmediate, isSectionActive, tryTriggerAnimation, animationState]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation) return;

        if (entranceTrigger === 'open_btn' && isOpened) {
            tryTriggerAnimation();
        }
    }, [isOpened, entranceTrigger, isEditor, hasEntranceAnimation, tryTriggerAnimation]);

    // Looping animations
    const loopingConfig = useMemo(() => {
        if (!loopingType || loopingType === 'none') return null;

        // Loop Trigger Logic
        if (loopTrigger === 'click' && !forceTrigger) return null;
        if (loopTrigger === 'scroll' && !inView) return null;
        if (loopTrigger === 'open_btn' && !isOpened) return null;

        const loopTransition = {
            duration: loopDuration,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut",
            delay: loopDelay
        };

        const startRotateForLoop = isEditor ? 0 : baseRotate;
        const spinRotation = loopDirection === 'ccw' ? startRotateForLoop - 360 : startRotateForLoop + 360;

        switch (loopingType) {
            case 'float': return { animate: { y: [0, -15, 0] }, transition: loopTransition };
            case 'pulse': return { animate: { scale: [1, 1.05, 1] }, transition: loopTransition };
            case 'sway': return { animate: { rotate: [startRotateForLoop, startRotateForLoop + 5, startRotateForLoop, startRotateForLoop - 5, startRotateForLoop] }, transition: { ...loopTransition, duration: 4 } };
            case 'spin': return { animate: { rotate: [startRotateForLoop, spinRotation] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "linear", repeatType: "loop" } };
            case 'glow': return { animate: { filter: ['drop-shadow(0 0 0px rgba(255,255,255,0))', 'drop-shadow(0 0 10px rgba(255,255,255,0.8))', 'drop-shadow(0 0 0px rgba(255,255,255,0))'] }, transition: loopTransition };
            case 'heartbeat': return { animate: { scale: [1, 1.2, 1] }, transition: { duration: loopDuration * 0.8, repeat: Infinity, repeatType: "mirror" } };
            case 'sparkle': return { animate: { opacity: [1, 0.5, 1] }, transition: { duration: loopDuration, repeat: Infinity, ease: "easeInOut" } };
            case 'flap-bob': return { animate: { y: [0, -10, 0], scaleY: [1, 0.6, 1] }, transition: { duration: loopDuration * 0.3, repeat: Infinity, ease: "easeInOut" } };
            case 'float-flap': return { animate: { y: [0, -20, 0], scaleY: [1, 0.5, 1], rotate: [baseRotate, baseRotate + 5, baseRotate, baseRotate - 5, baseRotate] }, transition: { duration: loopDuration, repeat: Infinity, ease: "easeInOut" } };
            case 'fly-left': return { animate: { x: [0, -200] }, transition: { duration: loopDuration * 3, repeat: Infinity, ease: "linear" } };
            case 'fly-right': return { animate: { x: [0, 200] }, transition: { duration: loopDuration * 3, repeat: Infinity, ease: "linear" } };
            case 'fly-up': return { animate: { y: [0, -200], opacity: [1, 0] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "easeIn" } };
            case 'fly-down': return { animate: { y: [0, 200], opacity: [1, 0] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "easeIn" } };
            case 'fly-random': return { animate: { x: [0, 30, -20, 40, 0], y: [0, -40, 20, -10, 0] }, transition: { duration: loopDuration * 8, repeat: Infinity, ease: "easeInOut" } };
            case 'twirl': return {
                animate: {
                    scale: [0, 1, 1, 0],
                    rotate: [startRotateForLoop - 360, startRotateForLoop, startRotateForLoop, startRotateForLoop + 360],
                    opacity: [0, 1, 1, 0]
                },
                transition: {
                    duration: loopDuration * 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.4, 0.6, 1],
                    delay: loopDelay
                }
            };
            default: return null;
        }
    }, [loopingType, loopDuration, loopDelay, loopTrigger, loopDirection, forceTrigger, inView, isOpened, baseRotate, minScale, maxScale, isEditor]);

    // ============================================
    // ELEGANT SPIN ENGINE (DEDICATED)
    // ============================================
    const elegantSpinAnimation = useMemo(() => {
        if (!isElegantSpinEnabled || !elegantSpinConfig) return null;

        const trigger = elegantSpinConfig.trigger || 'load';

        // Trigger Logic
        if (trigger === 'click' && !forceTrigger) return null;
        if (trigger === 'scroll' && !inView) return null;
        if (trigger === 'open_btn' && !isOpened) return null;

        const spinDuration = (elegantSpinConfig.spinDuration || elegantSpinConfig.duration || 1000) / 1000;
        const scaleDuration = (elegantSpinConfig.scaleDuration || elegantSpinConfig.duration || 1000) / 1000;
        const delay = (elegantSpinConfig.delay || 0) / 1000;
        const direction = elegantSpinConfig.direction || 'cw';
        const minS = elegantSpinConfig.minScale ?? 0.8;
        const maxS = elegantSpinConfig.maxScale ?? 1.2;

        const startRotate = isEditor ? 0 : baseRotate;
        const spinRotation = direction === 'ccw' ? startRotate - 360 : startRotate + 360;

        return {
            animate: {
                rotate: [startRotate, spinRotation],
                scale: [minS, maxS]
            },
            transition: {
                rotate: { duration: spinDuration, repeat: Infinity, ease: "linear" },
                scale: { duration: scaleDuration, ease: "easeOut" },
                delay: delay
            }
        };
    }, [isElegantSpinEnabled, elegantSpinConfig, forceTrigger, inView, isOpened, baseRotate]);

    // ============================================
    // INFINITE MARQUEE ENGINE (Pattern Walk / Continuous Scroll)
    // ============================================
    const marqueeMode = marqueeConfig?.mode || 'seamless'; // Default to seamless (true infinite)

    const marqueeAnimation = useMemo(() => {
        if (!isMarqueeEnabled || !marqueeConfig) return null;

        const speed = marqueeConfig.speed || 50; // px/s
        const angle = marqueeConfig.angle || 0; // degrees
        const isReverse = marqueeConfig.reverse;
        const mode = marqueeConfig.mode || 'scroll';

        const angleRad = (isReverse ? (angle + 180) : angle) * (Math.PI / 180);

        if (mode === 'tile') {
            // Tile mode: animate background-position for seamless tiling
            const dist = 2000;
            const duration = dist / speed;
            const targetX = Math.cos(angleRad) * dist;
            const targetY = Math.sin(angleRad) * dist;

            return {
                animate: {
                    backgroundPosition: ["0px 0px", `${targetX}px ${targetY}px`]
                },
                transition: {
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear"
                }
            };
        } else {
            // Scroll mode: animate element position (x/y transform)
            // Uses "mirror" repeatType for seamless back-and-forth without jumping
            const dist = marqueeConfig.distance || 500; // Default 500px travel
            const duration = dist / speed;
            const targetX = Math.cos(angleRad) * dist;
            const targetY = Math.sin(angleRad) * dist;

            return {
                animate: {
                    x: [0, targetX],
                    y: [0, targetY]
                },
                transition: {
                    duration: duration,
                    repeat: Infinity,
                    repeatType: "mirror" as const, // Seamless back-and-forth
                    ease: "easeInOut"
                }
            };
        }
    }, [isMarqueeEnabled, marqueeConfig]);

    // ============================================
    // MOTION PATH ENGINE (CTO Enterprise Implementation)
    // Calculates keyframes for point-to-point movement with auto-rotation
    // ============================================
    const pathAnimation = useMemo(() => {
        const config = layer.motionPathConfig;
        if (!config?.enabled || !config.points || config.points.length < 2) {
            return null;
        }

        const points = config.points;
        const xKeyframes: number[] = [];
        const yKeyframes: number[] = [];
        const rotateKeyframes: number[] = [];
        const scaleKeyframes: number[] = [];

        // Convert absolute canvas points to relative offsets from layer visual position
        // CRITICAL FIX: Center the element on the points for accurate targeting
        const halfWidth = (layer.width || 0) / 2;
        const halfHeight = (layer.height || 0) / 2;

        points.forEach((p: any) => {
            xKeyframes.push(p.x - layer.x - halfWidth);
            yKeyframes.push(p.y - adjustedY - halfHeight);
            rotateKeyframes.push(p.rotation ?? 0);
            scaleKeyframes.push(p.scale ?? 1);
        });

        return {
            animate: {
                x: xKeyframes,
                y: yKeyframes,
                rotate: rotateKeyframes,
                scale: scaleKeyframes
            },
            transition: {
                duration: (config.duration || 3000) / 1000,
                repeat: config.loop ? Infinity : 0,
                repeatType: "loop",
                ease: "linear",
                times: xKeyframes.map((_, i) => i / (xKeyframes.length - 1))
            }
        };
    }, [layer.motionPathConfig, layer.x, adjustedY, layer.width, layer.height]);

    // LOOPING ANIMATION PROPS
    const loopingProps = useMemo(() => {
        if (!shouldAnimate || animationState !== "visible") return {};
        if (marqueeAnimation) return marqueeAnimation;
        if (elegantSpinAnimation) return elegantSpinAnimation;
        if (pathAnimation) return pathAnimation;
        if (loopingConfig) return loopingConfig;
        return {};
    }, [shouldAnimate, animationState, marqueeAnimation, elegantSpinAnimation, pathAnimation, loopingConfig]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={animationState}
            variants={variants}
            className={isEditor ? "w-full h-full" : "absolute origin-center"}
            style={isEditor ? {
                opacity: layer.opacity ?? 1
            } : {
                left: `${layer.x}px`,
                top: `${adjustedY}px`,
                width: `${layer.width}px`,
                height: `${layer.height}px`,
                zIndex: layer.zIndex,
                willChange: 'transform, opacity',
            }}
        >
            {/* SEAMLESS MODE: Clone-based CSS animation for true infinite scroll */}
            {isMarqueeEnabled && marqueeMode === 'seamless' ? (
                (() => {
                    const direction = marqueeConfig?.direction || 'left';
                    const speed = marqueeConfig?.speed || 50;
                    const isVertical = direction === 'up' || direction === 'down';
                    const dimension = isVertical ? (layer.height || 100) : (layer.width || 100);
                    // Calculate duration based on speed (px/s) and element size
                    // Duration = distance / speed. Distance = 2x element size for clone technique
                    const duration = (dimension * 2) / speed;

                    const animationClass = {
                        'left': 'animate-seamless-left',
                        'right': 'animate-seamless-right',
                        'up': 'animate-seamless-up',
                        'down': 'animate-seamless-down'
                    }[direction];

                    const trackClass = isVertical
                        ? 'seamless-marquee-track-vertical'
                        : 'seamless-marquee-track';

                    return (
                        <div className="seamless-marquee-container">
                            <div
                                className={`${trackClass} ${animationClass}`}
                                style={{
                                    '--marquee-duration': `${duration}s`,
                                    ...(isVertical ? { height: 'fit-content' } : { width: 'fit-content' })
                                } as any}
                            >
                                {/* Original Element */}
                                <div className="flex-shrink-0" style={isVertical ? { height: layer.height } : { width: layer.width }}>
                                    <ElementRenderer
                                        layer={layer}
                                        onOpenInvitation={onOpenInvitation}
                                        isEditor={isEditor}
                                        onContentLoad={handleContentLoad}
                                        onDimensionsDetected={onDimensionsDetected}
                                    />
                                </div>
                                {/* Clone for seamless loop */}
                                <div className="flex-shrink-0" style={isVertical ? { height: layer.height } : { width: layer.width }}>
                                    <ElementRenderer
                                        layer={layer}
                                        onOpenInvitation={onOpenInvitation}
                                        isEditor={isEditor}
                                        onContentLoad={handleContentLoad}
                                        onDimensionsDetected={onDimensionsDetected}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })()
            ) : (
                /* TILE MODE or SCROLL MODE or NO MARQUEE */
                <motion.div
                    className="w-full h-full"
                    {...loopingProps}
                    style={{
                        ...(isMarqueeTileMode ? {
                            backgroundImage: `url(${layer.imageUrl})`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: 'auto',
                            backgroundColor: 'transparent'
                        } : {})
                    }}
                >
                    {!isMarqueeTileMode && (
                        <ElementRenderer
                            layer={layer}
                            onOpenInvitation={onOpenInvitation}
                            isEditor={isEditor}
                            onContentLoad={handleContentLoad}
                            onDimensionsDetected={onDimensionsDetected}
                        />
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export const AnimatedLayer = React.memo(AnimatedLayerComponent);
