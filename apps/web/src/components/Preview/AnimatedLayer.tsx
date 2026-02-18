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
    // CTO MASTER MOTION ENGINE (Unified Keyframes & Loops)
    // ============================================
    const motionStyles = useMemo(() => {
        const startTime = layer.sequence?.startTime || 0;
        const duration = layer.sequence?.duration || 2000;
        const endTime = startTime + duration;

        // 1. KEYFRAME INTERPOLATION
        const effectiveTime = Math.max(0, Math.min(playhead - startTime, duration));
        const kf = {
            x: interpolate(effectiveTime, layer.keyframes || [], layer.x, 'x'),
            y: interpolate(effectiveTime, layer.keyframes || [], layer.y, 'y'),
            scale: interpolate(effectiveTime, layer.keyframes || [], layer.scale || 1, 'scale'),
            rotate: interpolate(effectiveTime, layer.keyframes || [], layer.rotation || 0, 'rotation'),
            opacity: interpolate(effectiveTime, layer.keyframes || [], layer.opacity ?? 1, 'opacity'),
        };

        // 2. CLOCK-DRIVEN LOOPING (Editor Mode Only)
        // This ensures Loops and Keyframes are perfectly cumulative and stop together.
        const loops = { x: 0, y: 0, scale: 0, rotate: 0, opacity: 0, filter: 'none' };

        if (isEditor && shouldAnimate && playhead >= startTime && playhead <= endTime) {
            const t = playhead / 1000;
            const d = loopDuration || 1;
            const progress = (t % d) / d;
            const phase = Math.sin(progress * Math.PI * 2);
            const mirrorPhase = Math.sin(progress * Math.PI);

            switch (loopingType) {
                case 'float': loops.y = phase * -15; break;
                case 'pulse': loops.scale = phase * 0.05; break;
                case 'sway': loops.rotate = phase * 5; break;
                case 'spin': loops.rotate = progress * 360 * (loopDirection === 'ccw' ? -1 : 1); break;
                case 'glow': loops.filter = `drop-shadow(0 0 ${Math.abs(phase) * 10}px rgba(255,255,255,0.8))`; break;
                case 'heartbeat': loops.scale = mirrorPhase * 0.2; break;
                case 'sparkle': loops.opacity = (0.5 + Math.abs(phase) * 0.5) - 1; break; // Relative to base 1
                case 'fly-left': loops.x = -progress * 200; break;
                case 'fly-right': loops.x = progress * 200; break;
            }
        }

        // 3. FINAL COMPOSITE STYLE (Strict Bound Enforcement)
        const isVisible = playhead >= startTime && playhead <= endTime;

        return {
            x: kf.x - layer.x + loops.x,
            y: kf.y - layer.y + loops.y,
            rotate: isEditor ? (kf.rotate - (layer.rotation || 0) + loops.rotate) : kf.rotate,
            scaleX: isEditor ? (kf.scale / (layer.scale || 1) + loops.scale) : kf.scale * flipX,
            scaleY: isEditor ? (kf.scale / (layer.scale || 1) + loops.scale) : kf.scale * flipY,
            opacity: isVisible ? kf.opacity : 0, // HARD CUT OUTSIDE SEQUENCE
            filter: loops.filter,
        };
    }, [playhead, layer.keyframes, layer.sequence, layer.x, layer.y, layer.scale, layer.rotation, layer.opacity, isEditor, shouldAnimate, loopingType, loopDuration, loopDirection, flipX, flipY]);

    // PREVIEW MODE LOOPS (Uses native Framer oscillator for maximum smoothness)
    const previewLoopProps = useMemo(() => {
        if (isEditor || isExportMode || !shouldAnimate || animationState !== "visible" || !loopingType || loopingType === 'none') return {};

        const loopTransition = { duration: loopDuration, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut", delay: loopDelay };
        const startRotateForLoop = baseRotate;
        const spinRotation = loopDirection === 'ccw' ? startRotateForLoop - 360 : startRotateForLoop + 360;

        switch (loopingType) {
            case 'float': return { animate: { y: [0, -15, 0] }, transition: loopTransition };
            case 'pulse': return { animate: { scale: [1, 1.05, 1] }, transition: loopTransition };
            case 'sway': return { animate: { rotate: [startRotateForLoop, startRotateForLoop + 5, startRotateForLoop, startRotateForLoop - 5, startRotateForLoop] }, transition: { ...loopTransition, duration: 4 } };
            case 'spin': return { animate: { rotate: [startRotateForLoop, spinRotation] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "linear", repeatType: "loop" } };
            default: return {};
        }
    }, [isEditor, isExportMode, shouldAnimate, animationState, loopingType, loopDuration, loopDelay, baseRotate, loopDirection]);

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

    // PREVIEW MODE TRIGGERS (Untouched for fidelity)
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
        if (!isEditor && isContentReadyRef.current && pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            tryTriggerAnimation();
        }
    }, [tryTriggerAnimation, isEditor]);

    useEffect(() => {
        if (isEditor || animationState === "visible") return;
        if (layer.id && globalAnimatedState.get(layer.id)) {
            setAnimationState("visible");
            return;
        }
        if (isImmediate && isSectionActive) tryTriggerAnimation();
    }, [isImmediate, isSectionActive, tryTriggerAnimation, animationState, layer.id, isEditor]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;
        if (inView && isSectionActive) tryTriggerAnimation();
    }, [inView, isSectionActive, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger, tryTriggerAnimation]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;
        if (!inView && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            if (rect.top >= window.innerHeight - 100) {
                if (animationStateRef.current === "visible") {
                    setAnimationState("hidden");
                    if (layer.id) globalAnimatedState.set(layer.id, false);
                }
            }
        }
    }, [inView, layer.id, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger]);

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
                {...(isEditor ? {} : previewLoopProps)}
                style={{
                    x: motionStyles.x,
                    y: motionStyles.y,
                    rotate: motionStyles.rotate,
                    scaleX: motionStyles.scaleX,
                    scaleY: motionStyles.scaleY,
                    opacity: motionStyles.opacity,
                    filter: motionStyles.filter,
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
                    <div className="w-full h-full relative" style={{ ...(isMarqueeTileMode ? { backgroundImage: `url(${layer.imageUrl})`, backgroundRepeat: 'repeat', backgroundSize: 'auto', backgroundColor: 'transparent' } : {}) }}>
                        {!isMarqueeTileMode && <ElementRenderer layer={layer} onOpenInvitation={onOpenInvitation} isEditor={isEditor} onContentLoad={handleContentLoad} onDimensionsDetected={handleDimensions} />}
                    </div>
                )}
            </m.div>
        </m.div>
    );
};


export const AnimatedLayer = React.memo(AnimatedLayerComponent);
