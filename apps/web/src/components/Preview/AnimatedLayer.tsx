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

    const isImmediate = entranceTrigger === 'load' || entranceTrigger === 'immediate';
    const hasEntranceAnimation = entranceType && entranceType !== 'none';
    const shouldAnimate = !isEditor || isAnimationPlaying;

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

    const [animationState, setAnimationState] = React.useState<"hidden" | "visible">(
        (isEditor && !isAnimationPlaying) || !hasEntranceAnimation || (layer.id && globalAnimatedState.get(layer.id))
            ? "visible"
            : "hidden"
    );

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
        const targetX = 0;
        const targetY = 0;
        const targetScaleX = isEditor ? 1 : baseScale * flipX;
        const targetScaleY = isEditor ? 1 : baseScale * flipY;
        const targetRotate = isEditor ? 0 : baseRotate;

        const hidden: any = { opacity: 0, x: targetX, y: targetY, scaleX: targetScaleX, scaleY: targetScaleY, rotate: targetRotate };
        const visible: any = {
            opacity: layer.opacity ?? 1,
            x: targetX, y: targetY,
            scaleX: isEditor ? 1 : targetScaleX,
            scaleY: isEditor ? 1 : targetScaleY,
            rotate: isEditor ? 0 : targetRotate,
            transition: { duration: entranceDuration, delay: entranceDelay, ease: [0.22, 1, 0.36, 1] }
        };

        if (!hasEntranceAnimation) return { hidden: { ...visible, transition: { duration: 0 } }, visible };

        switch (entranceType) {
            case 'fade-in': break;
            case 'slide-up': hidden.y = targetY + 30; break;
            case 'slide-down': hidden.y = targetY - 30; break;
            case 'slide-left': hidden.x = targetX + 30; break;
            case 'slide-right': hidden.x = targetX - 30; break;
            case 'slide-in-left': hidden.x = "-100vw"; hidden.opacity = 0; break;
            case 'slide-in-right': hidden.x = "100vw"; hidden.opacity = 0; break;
            case 'zoom-in': hidden.scaleX = 0.8 * targetScaleX; hidden.scaleY = 0.8 * targetScaleY; break;
            case 'zoom-out': hidden.scaleX = 1.2 * targetScaleX; hidden.scaleY = 1.2 * targetScaleY; break;
            case 'bounce': hidden.y = targetY - 40; visible.transition = { type: "spring", bounce: 0.4, duration: entranceDuration, delay: entranceDelay }; break;
            case 'pop-in': hidden.scaleX = 0.8 * targetScaleX; hidden.scaleY = 0.8 * targetScaleY; visible.transition = { type: "spring", stiffness: 260, damping: 20, delay: entranceDelay }; break;
            case 'twirl-in': hidden.scaleX = 0; hidden.scaleY = 0; hidden.rotate = targetRotate - 180; visible.transition = { type: "spring", duration: entranceDuration, bounce: 0.2, delay: entranceDelay }; break;
            // ENTERPRISE V6: CINEMATIC DOORS
            case 'door-open-left':
                visible.originX = 0;
                hidden.originX = 0;
                hidden.rotateY = 0;
                visible.rotateY = -100; // Opens INWARDS (away from viewer to the left)
                visible.transition = { type: "spring", stiffness: 60, damping: 12, mass: 1.2, delay: entranceDelay };
                break;
            case 'door-open-right':
                visible.originX = 1;
                hidden.originX = 1;
                hidden.rotateY = 0;
                visible.rotateY = 100; // Opens INWARDS (away from viewer to the right)
                visible.transition = { type: "spring", stiffness: 60, damping: 12, mass: 1.2, delay: entranceDelay };
                break;
            // 2D DOORS (SCALE)
            case 'door-2d-open-left':
                visible.originX = 0;
                hidden.originX = 0;
                hidden.scaleX = targetScaleX;
                visible.scaleX = isEditor ? 1 : 0;
                visible.transition = { type: "spring", stiffness: 60, damping: 12, mass: 1.2, delay: entranceDelay };
                break;
            case 'door-2d-open-right':
                visible.originX = 1;
                hidden.originX = 1;
                hidden.scaleX = targetScaleX;
                visible.scaleX = isEditor ? 1 : 0;
                visible.transition = { type: "spring", stiffness: 60, damping: 12, mass: 1.2, delay: entranceDelay };
                break;
        }
        return { hidden, visible };
    }, [entranceType, hasEntranceAnimation, layer.opacity, entranceDuration, entranceDelay, baseScale, flipX, flipY, baseRotate, isEditor]);

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

    const loopingConfig = useMemo(() => {
        if (!loopingType || loopingType === 'none') return null;
        if (loopTrigger === 'click' && !forceTrigger) return null;
        if (loopTrigger === 'scroll' && !inView) return null;
        if (loopTrigger === 'open_btn' && !isOpened) return null;

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
            default: return null;
        }
    }, [loopingType, loopDuration, loopDelay, loopTrigger, loopDirection, forceTrigger, inView, isOpened, baseRotate, isEditor]);

    const elegantSpinAnimation = useMemo(() => {
        if (!isElegantSpinEnabled || !elegantSpinConfig) return null;
        const trigger = elegantSpinConfig.trigger || 'load';
        if (trigger === 'click' && !forceTrigger) return null;
        if (trigger === 'scroll' && !inView) return null;
        if (trigger === 'open_btn' && !isOpened) return null;
        const spinDuration = (elegantSpinConfig.spinDuration || elegantSpinConfig.duration || 1000) / 1000;
        const scaleDuration = (elegantSpinConfig.scaleDuration || elegantSpinConfig.duration || 1000) / 1000;
        const delay = (elegantSpinConfig.delay || 0) / 1000;
        const direction = elegantSpinConfig.direction || 'cw';
        const startRotate = isEditor ? 0 : baseRotate;
        const spinRotation = direction === 'ccw' ? startRotate - 360 : startRotate + 360;
        return { animate: { rotate: [startRotate, spinRotation], scale: [elegantSpinConfig.minScale ?? 0.8, elegantSpinConfig.maxScale ?? 1.2] }, transition: { rotate: { duration: spinDuration, repeat: Infinity, ease: "linear" }, scale: { duration: scaleDuration, ease: "easeOut" }, delay: delay } };
    }, [isElegantSpinEnabled, elegantSpinConfig, forceTrigger, inView, isOpened, baseRotate, isEditor]);

    const marqueeAnimation = useMemo(() => {
        if (!isMarqueeEnabled || !marqueeConfig) return null;
        const speed = marqueeConfig.speed || 50;
        const angleRad = (marqueeConfig.reverse ? (marqueeConfig.angle || 0) + 180 : (marqueeConfig.angle || 0)) * (Math.PI / 180);
        if (marqueeConfig.mode === 'tile') {
            const dist = 2000;
            return { animate: { backgroundPosition: ["0px 0px", `${Math.cos(angleRad) * dist}px ${Math.sin(angleRad) * dist}px`] }, transition: { duration: dist / speed, repeat: Infinity, ease: "linear" } };
        } else {
            const dist = marqueeConfig.distance || 500;
            return { animate: { x: [0, Math.cos(angleRad) * dist], y: [0, Math.sin(angleRad) * dist] }, transition: { duration: dist / speed, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" } };
        }
    }, [isMarqueeEnabled, marqueeConfig]);

    const pathAnimation = useMemo(() => {
        const config = layer.motionPathConfig;
        if (!config?.enabled || !config.points || config.points.length < 2) return null;
        const halfWidth = (layer.width || 0) / 2;
        const halfHeight = (layer.height || 0) / 2;
        const xKF = config.points.map((p: any) => p.x - layer.x - halfWidth);
        const yKF = config.points.map((p: any) => p.y - adjustedY - halfHeight);
        return { animate: { x: xKF, y: yKF, rotate: config.points.map((p: any) => p.rotation ?? 0), scale: config.points.map((p: any) => p.scale ?? 1) }, transition: { duration: (config.duration || 3000) / 1000, repeat: config.loop ? Infinity : 0, repeatType: "loop", ease: "linear", times: xKF.map((_: any, i: number) => i / (xKF.length - 1)) } };
    }, [layer.motionPathConfig, layer.x, adjustedY, layer.width, layer.height]);

    const loopingProps = useMemo(() => {
        if (isExportMode || !shouldAnimate || animationState !== "visible") return {};
        return marqueeAnimation || elegantSpinAnimation || pathAnimation || loopingConfig || {};
    }, [isExportMode, shouldAnimate, animationState, marqueeAnimation, elegantSpinAnimation, pathAnimation, loopingConfig]);

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
                left: isEditor ? 0 : 0,
                // Liquid layout shift (finalY - layer.y) is applied on top of motion Y
                top: isEditor ? relativeShift : `${(motionStyles.y + (finalY - layer.y))}px`,
                width: `${layer.width}px`,
                height: `${layer.height}px`,
                zIndex: layer.zIndex,
                willChange: 'transform, opacity',
                opacity: (playhead >= (layer.sequence?.startTime || 0) && playhead <= (layer.sequence?.startTime || 0) + (layer.sequence?.duration || 2000))
                    ? motionStyles.opacity
                    : 0, // Hide if outside sequence
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                transform: `translateX(${motionStyles.x}px) rotate(${motionStyles.rotate}deg) scale(${motionStyles.scale})`
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
    );
};

export const AnimatedLayer = React.memo(AnimatedLayerComponent);
