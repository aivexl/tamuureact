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
export const AnimatedLayer: React.FC<AnimatedLayerProps> = ({
    layer,
    adjustedY,
    isOpened,
    onOpenInvitation,
    scrollContainerRef,
    isEditor = false,
    forceTrigger = false,
    isSectionActive = true
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
    const trigger = animation?.trigger || 'scroll';
    const delay = (animation?.delay || 0) / 1000;
    // Legacy default duration: 800ms (0.8s)
    const duration = (animation?.duration || 800) / 1000;

    // Check if this is an "immediate" trigger (load = animate immediately)
    const isImmediate = trigger === 'load';

    // Check for entrance animation
    const entranceType = animation?.entrance;
    const loopingType = animation?.looping || (layer as any).animationLoop;
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

        console.log(`[AnimatedLayer] Content READY for ${layer.type}:${layer.id} (Name: ${layer.name})`);
        isContentReadyRef.current = true;

        if (pendingTriggerRef.current) {
            console.log(`[AnimatedLayer] Executing PENDING trigger for ${layer.id}`);
            pendingTriggerRef.current = false;
            setAnimationState("visible");
            if (layer.id) globalAnimatedState.set(layer.id, true);
        }
    }, [layer.id, layer.type, layer.name, setAnimationState]);

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
            console.log(`[AnimatedLayer] Deferring trigger until content ready: ${layer.id} (${layer.type})`);
            pendingTriggerRef.current = true;
            return;
        }

        console.log(`[AnimatedLayer] Triggering animation REACTIVELY: ${layer.id} at (${layer.x}, ${adjustedY})`);
        setAnimationState("visible");
        if (layer.id) globalAnimatedState.set(layer.id, true);
    }, [animationState, layer.id, layer.type, layer.x, adjustedY, setAnimationState]);

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
            filter: 'blur(10px)',
        };

        const visible: any = {
            opacity: layer.opacity ?? 1,
            filter: 'blur(0px)',
            x: targetX,
            y: targetY,
            scaleX: targetScaleX,
            scaleY: targetScaleY,
            rotate: targetRotate,
            transition: {
                duration: duration,
                delay: delay,
                ease: "easeOut"
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
                hidden.filter = 'blur(0px)';
                break;
            case 'slide-up': hidden.y = targetY + 50; break;
            case 'slide-down': hidden.y = targetY - 50; break;
            case 'slide-left': hidden.x = targetX + 50; break;
            case 'slide-right': hidden.x = targetX - 50; break;
            case 'slide-in-left': hidden.x = "-100vw"; hidden.opacity = 0; break;
            case 'slide-in-right': hidden.x = "100vw"; hidden.opacity = 0; break;
            case 'zoom-in':
                hidden.scaleX = 0.5 * targetScaleX;
                hidden.scaleY = 0.5 * targetScaleY;
                break;
            case 'zoom-out':
                hidden.scaleX = 1.5 * targetScaleX;
                hidden.scaleY = 1.5 * targetScaleY;
                break;
            case 'bounce':
                hidden.y = targetY - 50;
                visible.transition = { type: "spring", bounce: 0.6, duration: duration, delay: delay };
                break;
            case 'pop-in':
                hidden.scaleX = 0.5 * targetScaleX;
                hidden.scaleY = 0.5 * targetScaleY;
                visible.transition = { type: "spring", stiffness: 300, damping: 15, delay: delay };
                break;
        }

        return { hidden, visible };
    }, [
        entranceType,
        hasEntranceAnimation,
        layer.opacity,
        duration,
        delay,
        baseScale,
        flipX,
        flipY,
        baseRotate,
        layer.x,
        adjustedY,
        isEditor
    ]);

    // Content Loading Watcher
    useEffect(() => {
        if (isContentReadyRef.current && pendingTriggerRef.current) {
            console.log(`[AnimatedLayer] Content ready, executing pending trigger for ${layer.id}`);
            pendingTriggerRef.current = false;
            tryTriggerAnimation();
        }
    }, [isContentReadyRef.current, tryTriggerAnimation, layer.id]);

    // INITIAL TRIGGER / REMOUNT SYNC
    useEffect(() => {
        if (animationState === "visible") return;

        // If it was already animated in cache, force it to visible immediately
        if (layer.id && globalAnimatedState.get(layer.id)) {
            setAnimationState("visible");
            return;
        }

        // Preview immediate trigger
        if (isImmediate) {
            tryTriggerAnimation();
        }

        // Section 0 Fix: If we are in scroll mode and section is active on mount, try trigger
        if (!isEditor && trigger === 'scroll' && isSectionActive) {
            tryTriggerAnimation();
        }
    }, [isImmediate, trigger, isSectionActive, tryTriggerAnimation, animationState, layer.id, isEditor, setAnimationState]);

    // SCROLL TRIGGER
    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || trigger !== 'scroll') return;

        if (inView) {
            if (isSectionActive) {
                tryTriggerAnimation();
            }
        } else if (ref.current) {
            // DIRECTIONAL RESET: Only reset if element is far below viewport
            const rect = ref.current.getBoundingClientRect();
            if (rect.top > window.innerHeight * 1.5) {
                setAnimationState("hidden");
                if (layer.id) globalAnimatedState.set(layer.id, false);
            }
        }
    }, [inView, trigger, isEditor, hasEntranceAnimation, isImmediate, isSectionActive, tryTriggerAnimation, layer.id, setAnimationState]);

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
            if (trigger === 'click' || trigger === 'open_btn') {
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
    }, [forceTrigger, trigger, isEditor, hasEntranceAnimation, isImmediate, isSectionActive, tryTriggerAnimation, animationState]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation) return;

        if (trigger === 'open_btn' && isOpened) {
            tryTriggerAnimation();
        }
    }, [isOpened, trigger, isEditor, hasEntranceAnimation, tryTriggerAnimation]);

    // Looping animations
    const loopingConfig = useMemo(() => {
        if (!loopingType || loopingType === 'none') return null;
        const loopTransition = {
            duration: duration,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut"
        };

        switch (loopingType) {
            case 'float': return { animate: { y: [0, -15, 0] }, transition: loopTransition };
            case 'pulse': return { animate: { scale: [1, 1.05, 1] }, transition: loopTransition };
            case 'sway': return { animate: { rotate: [0, 5, 0, -5, 0] }, transition: { ...loopTransition, duration: 4 } };
            case 'spin': return { animate: { rotate: 360 }, transition: { duration: duration * 5, repeat: Infinity, ease: "linear" } };
            case 'glow': return { animate: { filter: ['drop-shadow(0 0 0px rgba(255,255,255,0))', 'drop-shadow(0 0 10px rgba(255,255,255,0.8))', 'drop-shadow(0 0 0px rgba(255,255,255,0))'] }, transition: loopTransition };
            case 'heartbeat': return { animate: { scale: [1, 1.2, 1] }, transition: { duration: duration * 0.8, repeat: Infinity, repeatType: "mirror" } };
            case 'sparkle': return { animate: { opacity: [1, 0.5, 1] }, transition: { duration: duration, repeat: Infinity, ease: "easeInOut" } };
            case 'flap-bob': return { animate: { y: [0, -10, 0], scaleY: [1, 0.6, 1] }, transition: { duration: duration * 0.3, repeat: Infinity, ease: "easeInOut" } };
            case 'float-flap': return { animate: { y: [0, -20, 0], scaleY: [1, 0.5, 1], rotate: [0, 5, 0, -5, 0] }, transition: { duration: duration, repeat: Infinity, ease: "easeInOut" } };
            case 'fly-left': return { animate: { x: [0, -200] }, transition: { duration: duration * 3, repeat: Infinity, ease: "linear" } };
            case 'fly-right': return { animate: { x: [0, 200] }, transition: { duration: duration * 3, repeat: Infinity, ease: "linear" } };
            case 'fly-up': return { animate: { y: [0, -200], opacity: [1, 0] }, transition: { duration: duration * 4, repeat: Infinity, ease: "easeIn" } };
            case 'fly-down': return { animate: { y: [0, 200], opacity: [1, 0] }, transition: { duration: duration * 4, repeat: Infinity, ease: "easeIn" } };
            case 'fly-random': return { animate: { x: [0, 30, -20, 40, 0], y: [0, -40, 20, -10, 0] }, transition: { duration: duration * 8, repeat: Infinity, ease: "easeInOut" } };
            default: return null;
        }
    }, [loopingType, duration]);

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

        points.forEach((p) => {
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
        if (pathAnimation) return pathAnimation;
        if (loopingConfig) return loopingConfig;
        return {};
    }, [shouldAnimate, animationState, pathAnimation, loopingConfig]);

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
                zIndex: layer.zIndex
            }}
        >
            <motion.div
                className="w-full h-full"
                {...loopingProps}
            >
                <ElementRenderer
                    layer={layer}
                    onOpenInvitation={onOpenInvitation}
                    isEditor={isEditor}
                    onContentLoad={handleContentLoad}
                />
            </motion.div>
        </motion.div>
    );
};
