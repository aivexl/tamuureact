import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { m, useInView } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { ElementRenderer } from '../Canvas/ElementRenderer';
import { useStore } from '@/store/useStore';
import { interpolate } from '@/lib/interpolation';

/**
 * GLOBAL PERSISTENT STATE
 * Used to track animation status for ALL elements by their ID.
 */
const globalAnimatedState = new Map<string, boolean>();

/**
 * Clear the global animation cache.
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
    forceTrigger?: boolean;
    isSectionActive?: boolean;
    onDimensionsDetected?: (width: number, height: number) => void;
    isExportMode?: boolean;
}

const AnimatedLayerComponent: React.FC<AnimatedLayerProps> = ({
    layer,
    adjustedY,
    isOpened,
    onOpenInvitation,
    scrollContainerRef,
    isEditor = false,
    forceTrigger = false,
    isSectionActive = true,
    onDimensionsDetected,
    isExportMode = false
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isAnimationPlaying = useStore(state => state.isAnimationPlaying);
    const interactionNonce = useStore(state => state.interactionNonce);
    const sections = useStore(state => state.sections);
    const orbit = useStore(state => state.orbit);
    const elementDimensions = useStore(state => state.elementDimensions);
    const updateElementDimensions = useStore(state => state.updateElementDimensions);

    // MOTION ENGINE STATES
    const playhead = useStore(state => state.playhead);
    const isPlaying = useStore(state => state.isPlaying);

    const prevForceTriggerRef = useRef(forceTrigger);
    const isVisibleRef = useRef(false);

    const inView = useInView(ref, {
        once: false,
        amount: 0.1,
        root: scrollContainerRef
    });

    useEffect(() => {
        isVisibleRef.current = inView;
    }, [inView]);

    const { animation } = layer;

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

    const elegantSpinConfig = layer.elegantSpinConfig;
    const isElegantSpinEnabled = !!elegantSpinConfig?.enabled;
    const marqueeConfig = layer.infiniteMarqueeConfig;
    const isMarqueeEnabled = !!marqueeConfig?.enabled;
    const isMarqueeTileMode = isMarqueeEnabled && marqueeConfig?.mode === 'tile' && !!layer.imageUrl;

    const isImmediate = entranceTrigger === 'load' || entranceTrigger === 'immediate' || (isEditor && isPlaying);
    const shouldAnimate = isPlaying || isAnimationPlaying;
    const hasEntranceAnimation = entranceType && entranceType !== 'none';

    const flipX = layer.flipHorizontal ? -1 : 1;
    const flipY = layer.flipVertical ? -1 : 1;
    const baseScale = layer.scale || 1;
    const baseRotate = layer.rotation || 0;

    // ============================================
    // MOTION GRAPHICS INTERPOLATION
    // ============================================
    const motionStyles = useMemo(() => {
        // CTO UNICORN ENGINE: Absolute Interpolation Logic with Sequence Offset
        const startTime = layer.sequence?.startTime || 0;
        const duration = layer.sequence?.duration || 2000;

        // Effective time is the relative playhead within the layer's own sequence
        // We clamp it to [0, duration] to respect the sequence boundaries
        const effectiveTime = Math.max(0, Math.min(playhead - startTime, duration));

        return {
            x: interpolate(effectiveTime, layer.keyframes || [], layer.x, 'x'),
            y: interpolate(effectiveTime, layer.keyframes || [], layer.y, 'y'),
            scale: interpolate(effectiveTime, layer.keyframes || [], layer.scale || 1, 'scale'),
            rotate: interpolate(effectiveTime, layer.keyframes || [], layer.rotation || 0, 'rotation'),
            opacity: interpolate(effectiveTime, layer.keyframes || [], layer.opacity ?? 1, 'opacity'),
        };
    }, [playhead, layer.keyframes, layer.sequence, layer.x, layer.y, layer.scale, layer.rotation, layer.opacity]);

    // ============================================
    // LIQUID AUTO-LAYOUT (SMART POSITION)
    // ============================================
    const target = useMemo((): Layer | null => {
        const anchoring = layer.anchoring;
        if (!anchoring?.isRelative || !anchoring.targetId) return null;

        let found: Layer | null = null;
        // Search in sections
        sections.forEach(s => {
            s.elements.forEach(l => {
                if (l.id === anchoring.targetId) found = l;
            });
        });

        // Search in orbits
        if (!found && orbit) {
            if (orbit.left?.elements) {
                orbit.left.elements.forEach(l => { if (l.id === anchoring.targetId) found = l; });
            }
            if (!found && orbit.right?.elements) {
                orbit.right.elements.forEach(l => { if (l.id === anchoring.targetId) found = l; });
            }
        }
        return found;
    }, [layer.anchoring, sections, orbit]);

    const relativeShift = useMemo(() => {
        const anchoring = layer.anchoring;
        if (!target || !anchoring?.isRelative) return 0;

        // Get target's current detected height (or fallback to design height)
        const targetDim = elementDimensions[target.id] || { height: target.height || 0 };
        const targetHeight = targetDim.height;

        if (anchoring.edge === 'bottom') {
            // New Y = Target Base Y + Target Real Height + Offset
            // Shift = New Y - My Base Y
            return (target.y + targetHeight + (anchoring.offset || 0)) - layer.y;
        }

        return 0;
    }, [target, elementDimensions, layer.y, layer.anchoring]);

    const finalY = adjustedY + relativeShift;

    const needsLoadSignal = ['image', 'gif', 'sticker', 'lottie', 'flying_bird'].includes(layer.type);
    const isContentReadyRef = useRef(!needsLoadSignal || isEditor);
    const pendingTriggerRef = useRef(false);

    // CTO MASTER FIX: Unified Animation State for Editor
    // In Editor, visibility is a binary function of Playhead vs Sequence Start
    const [animationState, setAnimationState] = React.useState<"hidden" | "visible">(
        (!isPlaying && isEditor) || !hasEntranceAnimation || (layer.id && globalAnimatedState.get(layer.id))
            ? "visible"
            : "hidden"
    );

    // Sync animationState to Playhead in Editor
    useEffect(() => {
        if (!isEditor) return;
        const startTime = layer.sequence?.startTime || 0;
        const newState = playhead >= startTime ? "visible" : "hidden";
        if (newState !== animationState) setAnimationState(newState);
    }, [playhead, isEditor, layer.sequence?.startTime, animationState]);

    // Use ref to track animationState inside callbacks to avoid infinite loop
    const animationStateRef = useRef(animationState);
    animationStateRef.current = animationState;

    const tryTriggerAnimation = useCallback(() => {
        if (animationStateRef.current === "visible") return;
        if (!isContentReadyRef.current) {
            pendingTriggerRef.current = true;
            return;
        }
        setAnimationState("visible");
        if (layer.id) globalAnimatedState.set(layer.id, true);
    }, [layer.id]);

    const handleContentLoad = useCallback(() => {
        if (isContentReadyRef.current) return;
        isContentReadyRef.current = true;
        if (pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            setAnimationState("visible");
            if (layer.id) globalAnimatedState.set(layer.id, true);
        }
    }, [layer.id]);

    // RE-ANIMATION ENGINE
    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || interactionNonce === 0) return;
        if (layer.id) globalAnimatedState.delete(layer.id);
        setAnimationState("hidden");
        const timer = setTimeout(() => {
            if (isImmediate || forceTrigger || isOpened) {
                tryTriggerAnimation();
            } else if (entranceTrigger === 'scroll' && isVisibleRef.current && isSectionActive) {
                tryTriggerAnimation();
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [interactionNonce, layer.id, isEditor, hasEntranceAnimation, isImmediate, forceTrigger, isOpened, entranceTrigger, isSectionActive, tryTriggerAnimation]);

    useEffect(() => {
        if (isEditor || isContentReadyRef.current) return;
        const timer = setTimeout(() => {
            if (!isContentReadyRef.current) handleContentLoad();
        }, 3000);
        return () => clearTimeout(timer);
    }, [isEditor, handleContentLoad]);

    const variants = useMemo(() => {
        const targetScaleX = isEditor ? 1 : flipX;
        const targetScaleY = isEditor ? 1 : flipY;

        const hidden: any = { opacity: 0, x: 0, y: 0, scaleX: targetScaleX, scaleY: targetScaleY, rotate: 0 };
        const visible: any = {
            opacity: 1, x: 0, y: 0, scaleX: targetScaleX, scaleY: targetScaleY, rotate: 0,
            transition: {
                duration: isPlaying ? entranceDuration : 0,
                delay: isPlaying ? entranceDelay : 0,
                ease: [0.22, 1, 0.36, 1]
            }
        };

        if (!hasEntranceAnimation) return { hidden: { ...visible, transition: { duration: 0 } }, visible };

        switch (entranceType) {
            case 'fade-in': break;
            case 'slide-up': hidden.y = 30; break;
            case 'slide-down': hidden.y = -30; break;
            case 'slide-left': hidden.x = 30; break;
            case 'slide-right': hidden.x = -30; break;
            case 'slide-in-left': hidden.x = "-100vw"; hidden.opacity = 0; break;
            case 'slide-in-right': hidden.x = "100vw"; hidden.opacity = 0; break;
            case 'zoom-in': hidden.scaleX = 0.8 * targetScaleX; hidden.scaleY = 0.8 * targetScaleY; break;
            case 'zoom-out': hidden.scaleX = 1.2 * targetScaleX; hidden.scaleY = 1.2 * targetScaleY; break;
            case 'bounce': hidden.y = -40; visible.transition = { type: "spring", bounce: 0.4, duration: entranceDuration, delay: entranceDelay }; break;
            case 'pop-in': hidden.scaleX = 0.8 * targetScaleX; hidden.scaleY = 0.8 * targetScaleY; visible.transition = { type: "spring", stiffness: 260, damping: 20, delay: entranceDelay }; break;
            case 'twirl-in': hidden.scaleX = 0; hidden.scaleY = 0; hidden.rotate = -180; visible.transition = { type: "spring", duration: entranceDuration, bounce: 0.2, delay: entranceDelay }; break;
        }

        // INSTANT SNAP IF NOT PLAYING (SCRUBBING)
        if (!isPlaying) {
            visible.transition = { duration: 0, delay: 0 };
        }

        return { hidden, visible };
    }, [entranceType, hasEntranceAnimation, entranceDuration, entranceDelay, flipX, flipY, isEditor, isPlaying]);

    useEffect(() => {
        if (isContentReadyRef.current && pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            tryTriggerAnimation();
        }
    }, [tryTriggerAnimation]);

    useEffect(() => {
        if (animationState === "visible") return;
        if (layer.id && globalAnimatedState.get(layer.id)) {
            setAnimationState("visible");
            return;
        }
        if (isImmediate && isSectionActive) tryTriggerAnimation();
    }, [isImmediate, isSectionActive, tryTriggerAnimation, animationState, layer.id]);

    useEffect(() => {
        if (!isEditor || !hasEntranceAnimation || isImmediate) return;
        if (isPlaying) tryTriggerAnimation();
    }, [isPlaying, isEditor, hasEntranceAnimation, isImmediate, tryTriggerAnimation]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;
        // CTO FIX: In Editor, if we are playing, we treat it as if it's in view (Timeline scrubbing/playing)
        if (isPlaying && isEditor) {
            tryTriggerAnimation();
            return;
        }
        if (inView && isSectionActive) tryTriggerAnimation();
    }, [inView, isSectionActive, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger, tryTriggerAnimation, isPlaying]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;

        // CTO FIX: In Editor during playback, do NOT hide it based on scroll.
        if (isPlaying && isEditor) return;

        if (!inView && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            if (rect.top >= window.innerHeight - 100) {
                if (animationStateRef.current === "visible") {
                    setAnimationState("hidden");
                    if (layer.id) globalAnimatedState.set(layer.id, false);
                }
            }
        }
    }, [inView, layer.id, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger, isPlaying]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation) return;
        const wasForced = prevForceTriggerRef.current;
        prevForceTriggerRef.current = forceTrigger;
        if (forceTrigger && (!wasForced || animationStateRef.current !== "visible")) {
            if (!isSectionActive) return;
            if (entranceTrigger === 'click' || entranceTrigger === 'open_btn') {
                if (isVisibleRef.current || isImmediate) tryTriggerAnimation();
            } else tryTriggerAnimation();
        }
    }, [forceTrigger, entranceTrigger, isEditor, hasEntranceAnimation, isImmediate, isSectionActive, tryTriggerAnimation]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation) return;
        if (entranceTrigger === 'open_btn' && isOpened) tryTriggerAnimation();
    }, [isOpened, entranceTrigger, isEditor, hasEntranceAnimation, tryTriggerAnimation]);

    // CTO MASTER FIX: Clock-Driven Looping Props
    const loopingProps = useMemo(() => {
        if (isExportMode || !shouldAnimate || animationState !== "visible") return {};
        if (!loopingType || loopingType === 'none') return {};

        // In Editor, we calculate the exact frame based on playhead
        if (isEditor) {
            const t = playhead / 1000; // time in seconds
            const d = loopDuration || 1;
            const progress = (t % d) / d; // [0, 1] relative to loop cycle

            // Phase calculation for oscillations [0, 1, 0, -1, 0]
            const phase = Math.sin(progress * Math.PI * 2);
            const mirrorPhase = Math.sin(progress * Math.PI); // Half-wave for reverse-style loops

            const loopTransition = { duration: 0 }; // Immediate updates driven by playhead

            switch (loopingType) {
                case 'float': return { animate: { y: phase * -15 }, transition: loopTransition };
                case 'pulse': return { animate: { scale: 1 + phase * 0.05 }, transition: loopTransition };
                case 'sway': return { animate: { rotate: phase * 5 }, transition: loopTransition };
                case 'spin': return { animate: { rotate: (progress * 360 * (loopDirection === 'ccw' ? -1 : 1)) }, transition: loopTransition };
                case 'glow': return { animate: { filter: `drop-shadow(0 0 ${Math.abs(phase) * 10}px rgba(255,255,255,0.8))` }, transition: loopTransition };
                case 'heartbeat': return { animate: { scale: 1 + mirrorPhase * 0.2 }, transition: loopTransition };
                case 'sparkle': return { animate: { opacity: 0.5 + Math.abs(phase) * 0.5 }, transition: loopTransition };
                case 'flap-bob': return { animate: { y: phase * -10, scaleY: 1 - Math.abs(phase) * 0.4 }, transition: loopTransition };
                case 'float-flap': return { animate: { y: phase * -20, scaleY: 1 - Math.abs(phase) * 0.5, rotate: phase * 5 }, transition: loopTransition };
                case 'fly-left': return { animate: { x: -progress * 200 }, transition: loopTransition };
                case 'fly-right': return { animate: { x: progress * 200 }, transition: loopTransition };
                case 'fly-up': return { animate: { y: -progress * 200, opacity: 1 - progress }, transition: loopTransition };
                case 'fly-down': return { animate: { y: progress * 200, opacity: 1 - progress }, transition: loopTransition };
                case 'fly-random': {
                    const x = Math.sin(progress * Math.PI * 2) * 30 + Math.cos(progress * Math.PI * 4) * 10;
                    const y = Math.cos(progress * Math.PI * 2) * -40 + Math.sin(progress * Math.PI * 4) * 20;
                    return { animate: { x, y }, transition: loopTransition };
                }
                case 'twirl': return {
                    animate: {
                        scale: progress < 0.4 ? progress / 0.4 : (progress > 0.6 ? (1 - progress) / 0.4 : 1),
                        rotate: progress * 360,
                        opacity: progress < 0.4 ? progress / 0.4 : (progress > 0.6 ? (1 - progress) / 0.4 : 1)
                    },
                    transition: loopTransition
                };
                default: return {};
            }
        }

        // PREVIEW MODE: Use native Infinity repeats for smooth independent motion
        const loopTransition = { duration: loopDuration, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut", delay: loopDelay };
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
            case 'twirl': return { animate: { scale: [0, 1, 1, 0], rotate: [startRotateForLoop - 360, startRotateForLoop, startRotateForLoop, startRotateForLoop + 360], opacity: [0, 1, 1, 0] }, transition: { duration: loopDuration * 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.6, 1], delay: loopDelay } };
            default: return {};
        }
    }, [loopingType, loopDuration, loopDelay, loopTrigger, loopDirection, forceTrigger, inView, isOpened, baseRotate, isEditor, shouldAnimate, animationState, isExportMode, playhead]);

    if (isExportMode) {
        // PURE STATIC RENDER: No Framer Motion, No Animations, just pixel-perfect CSS
        const rotation = baseRotate || 0;
        const scaleX = baseScale * flipX;
        const scaleY = baseScale * flipY;

        return (
            <div
                className="absolute origin-center"
                style={{
                    left: `${layer.x}px`,
                    top: `${finalY}px`,
                    width: `${layer.width}px`,
                    height: `${layer.height}px`,
                    zIndex: layer.zIndex,
                    opacity: layer.opacity ?? 1,
                    transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
                }}
            >
                {isMarqueeEnabled && (marqueeConfig?.mode || 'seamless') === 'seamless' ? (
                    <div className="seamless-marquee-container">
                        <div style={{ width: layer.width, height: layer.height }}>
                            <ElementRenderer layer={layer} onOpenInvitation={onOpenInvitation} isEditor={false} />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative" style={{ ...(isMarqueeTileMode ? { backgroundImage: `url(${layer.imageUrl})`, backgroundRepeat: 'repeat', backgroundSize: 'auto', backgroundColor: 'transparent' } : {}) }}>
                        {!isMarqueeTileMode && <ElementRenderer layer={layer} onOpenInvitation={onOpenInvitation} isEditor={false} onContentLoad={handleContentLoad} onDimensionsDetected={onDimensionsDetected} />}
                    </div>
                )}
            </div>
        );
    }

    const handleDimensions = useCallback((w: number, h: number) => {
        if (onDimensionsDetected) onDimensionsDetected(w, h);
        updateElementDimensions(layer.id, w, h);
    }, [layer.id, onDimensionsDetected, updateElementDimensions]);

    return (
        <m.div
            ref={ref} initial="hidden" animate={animationState} variants={variants}
            className="absolute origin-center"
            style={{
                left: isEditor ? 0 : `${layer.x}px`,
                top: isEditor ? `${relativeShift}px` : `${finalY}px`,
                width: `${layer.width}px`,
                height: `${layer.height}px`,
                zIndex: layer.zIndex,
                perspective: '1200px',
                transformStyle: 'preserve-3d',
            }}
        >
            <m.div
                className="w-full h-full relative"
                style={{
                    x: motionStyles.x - layer.x,
                    y: motionStyles.y - layer.y,
                    rotate: isEditor
                        ? (motionStyles.rotate - (layer.rotation || 0))
                        : motionStyles.rotate,
                    scaleX: isEditor
                        ? (motionStyles.scale / (layer.scale || 1))
                        : motionStyles.scale * flipX,
                    scaleY: isEditor
                        ? (motionStyles.scale / (layer.scale || 1))
                        : motionStyles.scale * flipY,
                    opacity: (playhead >= (layer.sequence?.startTime || 0) && playhead <= (layer.sequence?.startTime || 0) + (layer.sequence?.duration || 2000))
                        ? motionStyles.opacity
                        : 1,
                }}
            >
                {isMarqueeEnabled && (marqueeConfig?.mode || 'seamless') === 'seamless' ? (
                    (() => {
                        const direction = marqueeConfig?.direction || 'left';
                        const isVertical = direction === 'up' || direction === 'down';
                        const duration = ((isVertical ? (layer.height || 100) : (layer.width || 100)) * 2) / (marqueeConfig?.speed || 50);
                        return (
                            <div className="seamless-marquee-container">
                                <div className={`seamless-marquee-track${isVertical ? '-vertical' : ''} animate-seamless-${direction}`} style={{ '--marquee-duration': `${duration}s`, ...(isVertical ? { height: 'fit-content' } : { width: 'fit-content' }) } as any}>
                                    <div className="flex-shrink-0" style={isVertical ? { height: layer.height } : { width: layer.width }}>
                                        <ElementRenderer layer={layer} onOpenInvitation={onOpenInvitation} isEditor={isEditor} onContentLoad={handleContentLoad} onDimensionsDetected={handleDimensions} />
                                    </div>
                                    <div className="flex-shrink-0" style={isVertical ? { height: layer.height } : { width: layer.width }}>
                                        <ElementRenderer layer={layer} onOpenInvitation={onOpenInvitation} isEditor={isEditor} onContentLoad={handleContentLoad} onDimensionsDetected={handleDimensions} />
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <m.div className="w-full h-full relative" {...loopingProps} style={{ ...(isMarqueeTileMode ? { backgroundImage: `url(${layer.imageUrl})`, backgroundRepeat: 'repeat', backgroundSize: 'auto', backgroundColor: 'transparent' } : {}) }}>
                        {!isMarqueeTileMode && <ElementRenderer layer={layer} onOpenInvitation={onOpenInvitation} isEditor={isEditor} onContentLoad={handleContentLoad} onDimensionsDetected={handleDimensions} />}
                    </m.div>
                )}
            </m.div>
        </m.div>
    );
};

export const AnimatedLayer = React.memo(AnimatedLayerComponent);
