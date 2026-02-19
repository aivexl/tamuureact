import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { m, useInView } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { ElementRenderer } from '../Canvas/ElementRenderer';
import { useStore } from '@/store/useStore';
import { interpolate, getPathPosition } from '@/lib/interpolation';

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
    const resetNonce = useStore(state => state.resetNonce);

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
    const baseOpacity = layer.opacity ?? 1;

    // ============================================
    // DOUBLE TRIGGER & RESET ENGINE
    // ============================================
    const [interactionTriggered, setInteractionTriggered] = React.useState(
        (!isPlaying && isEditor) || !hasEntranceAnimation || (layer.id && globalAnimatedState.get(layer.id)) || false
    );

    // CTO MASTER RESET: Hard sync when clock is reset
    useEffect(() => {
        setInteractionTriggered(false);
        if (layer.id) globalAnimatedState.set(layer.id, false);
    }, [resetNonce, layer.id]);

    const playheadTriggered = isEditor && playhead >= (layer.sequence?.startTime || 0);
    const isTriggered = interactionTriggered || playheadTriggered;
    const animationState = isTriggered ? "visible" : "hidden";

    // CTO MASTER MOTION ENGINE (Unified Keyframes, Loops & Entrance)
    const motionStyles = useMemo(() => {
        const startTime = layer.sequence?.startTime || 0;
        const duration = layer.sequence?.duration || 2000;
        const endTime = startTime + duration;

        // 1. KEYFRAME INTERPOLATION (Absolute Target)
        const effectiveTime = Math.max(0, Math.min(playhead - startTime, duration));
        const kf = {
            x: interpolate(effectiveTime, layer.keyframes || [], layer.x, 'x'),
            y: interpolate(effectiveTime, layer.keyframes || [], layer.y, 'y'),
            scale: interpolate(effectiveTime, layer.keyframes || [], baseScale, 'scale'),
            rotate: interpolate(effectiveTime, layer.keyframes || [], baseRotate, 'rotation'),
            opacity: interpolate(effectiveTime, layer.keyframes || [], baseOpacity, 'opacity'),
        };

        // 2. MATH-DRIVEN ENTRANCE (Dynamic Offset)
        const entrance = { x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 };
        const eDelayMs = (entranceDelay || 0) * 1000;
        const eDurMs = (entranceDuration || 800) * 1000;
        const eTime = playhead - startTime - eDelayMs;
        const eProgress = Math.max(0, Math.min(eTime / eDurMs, 1));
        // CTO FIX: In Editor, ONLY show entrance offsets if actually playing/scrubbing (approximated by isPlaying).
        // If we are just layouting (static), show the Resting Pose (offsets = 0) to ensure alignment with resize handles.
        // We allow 'forceTrigger' for preview interactions.
        const isEntranceActive = hasEntranceAnimation && (isPlaying || isAnimationPlaying || (isEditor && isPlaying) || forceTrigger);

        if (isEntranceActive) {
            // Initial offsets (Inverse of the target)
            // When eProgress = 0, we apply full offset. When eProgress = 1, offset is 0.
            switch (entranceType) {
                case 'fade-in': entrance.opacity = eProgress; break;
                case 'slide-up': entrance.y = (1 - eProgress) * 50; entrance.opacity = eProgress; break;
                case 'slide-down': entrance.y = (1 - eProgress) * -50; entrance.opacity = eProgress; break;
                case 'slide-left': entrance.x = (1 - eProgress) * 50; entrance.opacity = eProgress; break;
                case 'slide-right': entrance.x = (1 - eProgress) * -50; entrance.opacity = eProgress; break;
                case 'zoom-in': entrance.scale = (eProgress * 0.4) - 0.4; entrance.opacity = eProgress; break;
                case 'zoom-out': entrance.scale = (1 - eProgress) * 0.4; entrance.opacity = eProgress; break;
                // Complex spring animations (Spring behavior is handled by variants in Framer, but we can math them if needed)
                // For now, we use simple progress for custom math.
            }
        }

        // 2.5 MOTION PATH ENGINE
        const pathPos = { x: 0, y: 0, rotation: 0 };
        const mpConfig = layer.motionPathConfig;
        if (mpConfig?.enabled && mpConfig.points.length > 0) {
            const mpDuration = mpConfig.duration || 3000;
            // Use performance.now() for continuous path playback even if clock is stopped (Decorative)
            const mpTimeSource = isEditor ? playhead : (performance.now() % mpDuration);
            const pos = getPathPosition(mpTimeSource, {
                points: mpConfig.points,
                duration: mpDuration,
                loop: mpConfig.loop ?? true
            }, layer.x, layer.y);
            pathPos.x = pos.x;
            pathPos.y = pos.y;
            pathPos.rotation = pos.rotation;
        }

        // 3. CLOCK-DRIVEN LOOPING (Stateless Decoration)
        const loops = { x: 0, y: 0, scale: 0, rotate: 0, opacity: 0, filter: 'none' };
        const isLoopingActive = loopingType && loopingType !== 'none' && isAnimationPlaying; // Only loop when playing
        // Actually, decorative loops (float, sway) should ALWAYS play in preview for feeling
        const isDecorative = !isEditor && (loopingType === 'float' || loopingType === 'sway' || loopingType === 'pulse' || loopingType === 'spin');

        if (isTriggered || isDecorative) {
            const t = (isEditor ? playhead : performance.now()) / 1000;
            const d = loopDuration || 1;
            const progress = (t % d) / d;
            const phase = Math.sin(progress * Math.PI * 2);
            const mirrorPhase = Math.sin(progress * Math.PI);

            switch (loopingType) {
                case 'float': loops.y = phase * -15; break;
                case 'pulse': loops.scale = phase * 0.05; break;
                case 'sway': loops.rotate = phase * 5; break;
                case 'spin': loops.rotate = (t / d) * 360 * (loopDirection === 'ccw' ? -1 : 1); break;
                case 'glow': loops.filter = `drop-shadow(0 0 ${Math.abs(phase) * 10}px rgba(255,255,255,0.8))`; break;
                case 'heartbeat': loops.scale = mirrorPhase * 0.2; break;
            }
        }

        // 4. FINAL ABSOLUTE COMPOSITE STYLE
        // CTO FIX: Elements stay visible AFTER endTime. They only appear IF playhead >= startTime.
        const isVisible = isEditor ? (playhead >= startTime) : true;

        // Combine everything into absolute coordinates
        const absX = kf.x + loops.x + entrance.x + pathPos.x;
        const absY = kf.y + loops.y + entrance.y + pathPos.y;
        const absRotate = kf.rotate + loops.rotate + entrance.rotate + pathPos.rotation;
        const absScale = kf.scale + loops.scale + entrance.scale;

        return {
            x: absX,
            y: absY,
            rotate: absRotate,
            scaleX: absScale * flipX,
            scaleY: absScale * flipY,
            opacity: isVisible ? (hasEntranceAnimation && isEntranceActive ? entrance.opacity * kf.opacity : kf.opacity) : 0,
            filter: loops.filter,
        };
    }, [playhead, layer.keyframes, layer.sequence, layer.x, layer.y, layer.scale, layer.rotation, layer.opacity, layer.motionPathConfig, layer.flipHorizontal, layer.flipVertical, baseScale, baseRotate, baseOpacity, flipX, flipY, isEditor, loopingType, loopDuration, loopDirection, isTriggered, entranceType, entranceDelay, entranceDuration, hasEntranceAnimation, isPlaying, isAnimationPlaying]);

    // LIQUID AUTO-LAYOUT (UNCHANGED)
    const target = useMemo((): Layer | null => {
        const anchoring = layer.anchoring;
        if (!anchoring?.isRelative || !anchoring.targetId) return null;
        let found: Layer | null = null;
        sections.forEach(s => s.elements.forEach(l => { if (l.id === anchoring.targetId) found = l; }));
        if (!found && orbit) {
            if (orbit.left?.elements) orbit.left.elements.forEach(l => { if (l.id === anchoring.targetId) found = l; });
            if (!found && orbit.right?.elements) orbit.right.elements.forEach(l => { if (l.id === anchoring.targetId) found = l; });
        }
        return found;
    }, [layer.anchoring, sections, orbit]);

    const relativeShift = useMemo(() => {
        const anchoring = layer.anchoring;
        if (!target || !anchoring?.isRelative) return 0;
        const targetDim = elementDimensions[target.id] || { height: target.height || 0 };
        const targetHeight = targetDim.height;
        if (anchoring.edge === 'bottom') return (target.y + targetHeight + (anchoring.offset || 0)) - layer.y;
        return 0;
    }, [target, elementDimensions, layer.y, layer.anchoring]);

    const finalY = adjustedY + relativeShift;

    const needsLoadSignal = ['image', 'gif', 'sticker', 'lottie', 'flying_bird'].includes(layer.type);
    const isContentReadyRef = useRef(!needsLoadSignal || isEditor);
    const pendingTriggerRef = useRef(false);

    const tryTriggerAnimation = useCallback(() => {
        if (interactionTriggered) return;
        if (!isContentReadyRef.current) {
            pendingTriggerRef.current = true;
            return;
        }
        setInteractionTriggered(true);
        if (layer.id) globalAnimatedState.set(layer.id, true);
    }, [layer.id, interactionTriggered]);

    const handleContentLoad = useCallback(() => {
        if (isContentReadyRef.current) return;
        isContentReadyRef.current = true;
        if (pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            setInteractionTriggered(true);
            if (layer.id) globalAnimatedState.set(layer.id, true);
        }
    }, [layer.id]);

    // PREVIEW MODE TRIGGERS
    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || interactionNonce === 0) return;
        if (layer.id) globalAnimatedState.delete(layer.id);
        setInteractionTriggered(false);
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

        if (!hasEntranceAnimation || isEditor) return { hidden: { ...visible, transition: { duration: 0 } }, visible };

        switch (entranceType) {
            case 'fade-in': break;
            case 'slide-up': hidden.y = 30; break;
            case 'slide-down': hidden.y = -30; break;
            case 'slide-left': hidden.x = 30; break;
            case 'slide-right': hidden.x = -30; break;
            case 'zoom-in': hidden.scaleX = 0.8 * targetScaleX; hidden.scaleY = 0.8 * targetScaleY; break;
            case 'zoom-out': hidden.scaleX = 1.2 * targetScaleX; hidden.scaleY = 1.2 * targetScaleY; break;
            case 'bounce': hidden.y = -40; visible.transition = { type: "spring", bounce: 0.4, duration: entranceDuration, delay: entranceDelay }; break;
            case 'pop-in': hidden.scaleX = 0.8 * targetScaleX; hidden.scaleY = 0.8 * targetScaleY; visible.transition = { type: "spring", stiffness: 260, damping: 20, delay: entranceDelay }; break;
            case 'twirl-in': hidden.scaleX = 0; hidden.scaleY = 0; hidden.rotate = -180; visible.transition = { type: "spring", duration: entranceDuration, bounce: 0.2, delay: entranceDelay }; break;
        }

        if (!isPlaying) visible.transition = { duration: 0, delay: 0 };
        return { hidden, visible };
    }, [entranceType, hasEntranceAnimation, entranceDuration, entranceDelay, flipX, flipY, isEditor, isPlaying]);

    useEffect(() => {
        if (!isEditor && isContentReadyRef.current && pendingTriggerRef.current) {
            pendingTriggerRef.current = false;
            tryTriggerAnimation();
        }
    }, [tryTriggerAnimation, isEditor]);

    useEffect(() => {
        if (isEditor || interactionTriggered) return;
        if (layer.id && globalAnimatedState.get(layer.id)) {
            setInteractionTriggered(true);
            return;
        }
        if (isImmediate && isSectionActive) tryTriggerAnimation();
    }, [isImmediate, isSectionActive, tryTriggerAnimation, interactionTriggered, layer.id, isEditor]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;
        if (inView && isSectionActive) tryTriggerAnimation();
    }, [inView, isSectionActive, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger, tryTriggerAnimation]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation || isImmediate || entranceTrigger !== 'scroll') return;
        if (!inView && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            if (rect.top >= window.innerHeight - 100) {
                if (interactionTriggered) {
                    setInteractionTriggered(false);
                    if (layer.id) globalAnimatedState.set(layer.id, false);
                }
            }
        }
    }, [inView, layer.id, isEditor, hasEntranceAnimation, isImmediate, entranceTrigger, interactionTriggered]);

    useEffect(() => {
        if (isEditor || !hasEntranceAnimation) return;
        const wasForced = prevForceTriggerRef.current;
        prevForceTriggerRef.current = forceTrigger;
        if (forceTrigger && (!wasForced || !interactionTriggered)) {
            if (!isSectionActive) return;
            if (entranceTrigger === 'click' || entranceTrigger === 'open_btn') {
                if (isVisibleRef.current || isImmediate) tryTriggerAnimation();
            } else tryTriggerAnimation();
        }
    }, [forceTrigger, entranceTrigger, isEditor, hasEntranceAnimation, isImmediate, isSectionActive, tryTriggerAnimation, interactionTriggered]);

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
                style={{
                    // In Editor, x/y/rotate are relative to the Bounding Box (CanvasElement)
                    // In Preview, they are absolute (because parent has no position)
                    x: isEditor ? (motionStyles.x - layer.x) : (motionStyles.x - layer.x),
                    y: isEditor ? (motionStyles.y - (layer.y + relativeShift)) : (motionStyles.y - layer.y),
                    rotate: isEditor ? (motionStyles.rotate - baseRotate) : motionStyles.rotate,
                    scaleX: isEditor ? (motionStyles.scaleX / (baseScale * flipX)) : motionStyles.scaleX,
                    scaleY: isEditor ? (motionStyles.scaleY / (baseScale * flipY)) : motionStyles.scaleY,
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
