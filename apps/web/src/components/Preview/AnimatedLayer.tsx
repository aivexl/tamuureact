import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { m, useInView, useAnimationFrame, useMotionValue } from 'framer-motion';
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

    const resLoopType = (typeof animation?.loop === 'object' ? animation.loop.type : (animation as any)?.looping) || (layer as any).animationLoop || (animation as any)?.loopingType;
    const loopingType = typeof resLoopType === 'string' ? resLoopType.toLowerCase() : 'none';
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
    // CTO FIX: Elements WITHOUT entrance animations must ALWAYS be visible.
    // The resetNonce useEffect resets interactionTriggered to false on mount,
    // and no re-trigger effect fires for non-entrance elements, leaving them
    // permanently stuck at opacity:0 (the "hidden" variant). This fixes motion path,
    // elegant spin, and all loop-only elements from disappearing in Preview.
    const animationState = (!hasEntranceAnimation || isTriggered) ? "visible" : "hidden";

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
        // CTO FIX: Math entrance is ONLY used in Editor mode for scrubbing/timeline playback.
        // In Preview/Production modes, the Framer Motion native variants take over.
        const isEntranceActive = isEditor && hasEntranceAnimation && (isPlaying || forceTrigger);

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
        // In Editor, we play loops whenever they are configured (to support scrubbing/previewing)
        const isDecorative = !isEditor && (loopingType === 'float' || loopingType === 'sway' || loopingType === 'pulse' || loopingType === 'spin');
        const isEditorLooping = isEditor;

        if (isTriggered || isDecorative || isEditorLooping || isElegantSpinEnabled) {
            const t = (isEditor ? playhead : performance.now()) / 1000;
            const d = loopDuration || 1;
            const progress = (t % d) / d;
            const phase = Math.sin(progress * Math.PI * 2);
            const mirrorPhase = Math.sin(progress * Math.PI);

            // Elegant Spin Math (Premium Pulse & Spin)
            if (isElegantSpinEnabled && elegantSpinConfig) {
                const sDur = (elegantSpinConfig.spinDuration || 10000) / 1000;
                const gDur = (elegantSpinConfig.growthDuration || 10000) / 1000;
                const minS = elegantSpinConfig.minScale ?? 0.8;
                const maxS = elegantSpinConfig.maxScale ?? 1.2;
                const dir = (elegantSpinConfig.direction === 'ccw' ? -1 : 1);

                // Rotational component
                loops.rotate = (t / sDur) * 360 * dir;

                // Scale component (Pulse)
                // We use a pure sine wave: A * sin(wt + phi) + C
                // This preserves the exact animation flow while starting at 1.0
                const C = (maxS + minS) / 2;
                const A = (maxS - minS) / 2;

                if (A === 0) {
                    loops.scale += (C - 1); // Constant offset if no range
                } else {
                    // Calculate phase shift so wave passes through 1.0 at t=0
                    // sin(phi) = (1.0 - C) / A
                    let ratio = (1.0 - C) / A;
                    ratio = Math.max(-1, Math.min(1, ratio)); // Handle out-of-bounds 1.0
                    const phi = Math.asin(ratio);

                    const wt = (t / gDur) * Math.PI * 2;
                    const pulseScale = A * Math.sin(wt + phi) + C;

                    loops.scale += (pulseScale - 1);
                }
            }

            switch (loopingType) {
                case 'float':
                case 'floating': loops.y = phase * -15; break;
                case 'pulse': loops.scale += (phase * 0.05); break;
                case 'sway':
                case 'swaying': loops.rotate += (phase * 5); break;
                case 'spin': loops.rotate += (t / d) * 360 * (loopDirection === 'ccw' ? -1 : 1); break;
                case 'glow': loops.filter = `drop-shadow(0 0 ${Math.abs(phase) * 10}px rgba(255,255,255,0.8))`; break;
                case 'heartbeat': loops.scale += (Math.max(0, mirrorPhase) * 0.15); break;
                case 'flap-bob':
                case 'floating-bob':
                    loops.y = phase * -10;
                    loops.scale += (phase * 1); // Fixed weight for dolls
                    break;
                case 'float-flap':
                    loops.y = phase * -20;
                    loops.rotate += (phase * 3);
                    break;
                case 'twirl':
                    loops.rotate += (phase * 15);
                    loops.scale += (phase * 0.05);
                    break;
                case 'elegant-spin':
                    // Handled above by explicit elegantSpinConfig check
                    break;
            }
        }

        // 4. FINAL MOTION COMPOSITE (Absolute Units - Global Stage)
        // These will be translated to relative offsets in the JSX to handle both Editor & Preview.
        const absX = kf.x + loops.x + entrance.x + pathPos.x;
        const absY = kf.y + loops.y + entrance.y + pathPos.y;

        // Combine rotations: path rotation + entrance rotate + loop rotate + (keyframes rotate is special)
        // Note: baseRotate and flip are handled in the IDENTITY layer (child).
        const motionRotate = (kf.rotate - baseRotate) + loops.rotate + entrance.rotate + pathPos.rotation;

        // Combine scales: entrance scale + loop scale + (keyframes scale is special)
        // Note: baseScale and flip are handled in the IDENTITY layer (child).
        const motionScale = (kf.scale / baseScale) + loops.scale + entrance.scale;

        // Visibility Logic:
        // CTO FIX: True NLE behavior. Elements MUST disappear when playhead is outside their sequence.
        let finalOpacity = kf.opacity;
        const isOutsideSequence = playhead < startTime || playhead > endTime;

        if (isEditor) {
            if (isOutsideSequence) {
                // If it's outside the clip bounds, it does not exist on the canvas.
                finalOpacity = 0;
            } else {
                if (hasEntranceAnimation && isEntranceActive) {
                    finalOpacity = Math.max(0, entrance.opacity * kf.opacity);
                } else {
                    finalOpacity = kf.opacity;
                }
            }
        } else {
            // PRODUCTION / PREVIEW MODE
            // CTO FIX: Math entrance (playhead-based) is intentionally ignored here.
            // Opacity starts at baseline (kf.opacity). The parent <m.div> handles
            // the 0 -> 1 animating sequence natively via Framer Motion variants.
            // This allows native scroll/click listener triggers to fire perfectly.

            // Only hide fully if the timeline sequence hasn't even reached this element yet,
            // EXCEPT if it's triggered by load/scroll (which happens independently of timeline in production).
            // Actually, in typical Preview, playhead is ALWAYS 0. We NEVER hide elements based on playhead here,
            // we let Framer Motion `variants` set `opacity: 0` during the `hidden` state!
            finalOpacity = kf.opacity;
        }

        return {
            x: absX,
            y: absY,
            rotate: motionRotate,
            scale: motionScale,
            opacity: finalOpacity,
            filter: loops.filter,
        };
    }, [playhead, layer.keyframes, layer.sequence, layer.x, layer.y, layer.scale, layer.rotation, layer.opacity, layer.motionPathConfig, layer.flipHorizontal, layer.flipVertical, baseScale, baseRotate, baseOpacity, isEditor, loopingType, loopDuration, loopDirection, isTriggered, entranceType, entranceDelay, entranceDuration, hasEntranceAnimation, isPlaying, isAnimationPlaying, forceTrigger, isElegantSpinEnabled, elegantSpinConfig]);

    // ============================================
    // CTO ENTERPRISE 60FPS PREVIEW ENGINE 
    // ============================================
    // React useMemo only runs on re-renders. In Editor, Redux state (playhead) updates 60fps.
    // In Preview, there is NO playhead state update, so React never re-renders, and performance.now()
    // inside useMemo never ticks!
    // Solution: Framer Motion's useAnimationFrame + useMotionValue completely bypasses React render.

    const mvX = useMotionValue(0);
    const mvY = useMotionValue(0);
    const mvRotate = useMotionValue(0);
    const mvScale = useMotionValue(1);
    const mvFilter = useMotionValue('none');

    useAnimationFrame((time) => {
        if (isEditor) return; // Editor relies on Redux playhead and motionStyles

        const t = time / 1000;
        let finalX = 0;
        let finalY = 0;
        let finalRotate = 0;
        let finalScale = 0; // Relative to base scale
        let finalFilter = 'none';

        // 1. Motion Path Engine (60fps continuous)
        const mpConfig = layer.motionPathConfig;
        if (mpConfig?.enabled && mpConfig.points && mpConfig.points.length > 0) {
            const mpDuration = mpConfig.duration || 3000;
            // Native Framer Motion time loop
            const pos = getPathPosition(time % mpDuration, {
                points: mpConfig.points,
                duration: mpDuration,
                loop: mpConfig.loop ?? true
            }, layer.x, layer.y);

            // Convert absolute canvas coords to local relative offset
            // The getPathPosition returns the offset from layer.x, layer.y
            finalX += pos.x;
            finalY += pos.y;
            finalRotate += pos.rotation;
            // Native Framer uses additive transforms
        }

        // 2. Loop & Elegant Spin Engine
        const isDecorative = loopingType === 'float' || loopingType === 'sway' || loopingType === 'pulse' || loopingType === 'spin';

        if (isTriggered || isDecorative || isElegantSpinEnabled) {
            const d = loopDuration || 1;
            const progress = (t % d) / d;
            const phase = Math.sin(progress * Math.PI * 2);
            const mirrorPhase = Math.sin(progress * Math.PI);

            if (isElegantSpinEnabled && elegantSpinConfig) {
                const sDur = (elegantSpinConfig.spinDuration || 10000) / 1000;
                const gDur = (elegantSpinConfig.growthDuration || 10000) / 1000;
                const minS = elegantSpinConfig.minScale ?? 0.8;
                const maxS = elegantSpinConfig.maxScale ?? 1.2;
                const dir = (elegantSpinConfig.direction === 'ccw' ? -1 : 1);

                finalRotate += (t / sDur) * 360 * dir;

                const C = (maxS + minS) / 2;
                const A = (maxS - minS) / 2;

                if (A === 0) {
                    finalScale += (C - 1);
                } else {
                    let ratio = (1.0 - C) / A;
                    ratio = Math.max(-1, Math.min(1, ratio));
                    const phi = Math.asin(ratio);
                    const wt = (t / gDur) * Math.PI * 2;
                    const pulseScale = A * Math.sin(wt + phi) + C;
                    finalScale += (pulseScale - 1);
                }
            }

            switch (loopingType) {
                case 'float':
                case 'floating': finalY += phase * -15; break;
                case 'pulse': finalScale += (phase * 0.05); break;
                case 'sway':
                case 'swaying': finalRotate += (phase * 5); break;
                case 'spin': finalRotate += (t / d) * 360 * (loopDirection === 'ccw' ? -1 : 1); break;
                case 'glow': finalFilter = `drop-shadow(0 0 ${Math.abs(phase) * 10}px rgba(255,255,255,0.8))`; break;
                case 'heartbeat': finalScale += (Math.max(0, mirrorPhase) * 0.15); break;
                case 'flap-bob':
                case 'floating-bob':
                    finalY += phase * -10;
                    finalScale += (phase * 1);
                    break;
                case 'float-flap':
                    finalY += phase * -20;
                    finalRotate += (phase * 3);
                    break;
                case 'twirl':
                    finalRotate += (phase * 15);
                    finalScale += (phase * 0.05);
                    break;
            }
        }

        // Apply final composites considering flips
        mvX.set(finalX * flipX);
        mvY.set(finalY * flipY);
        mvRotate.set(finalRotate);
        mvScale.set(1 + finalScale); // Default scale base is 1 here, identity layer handles real baseScale
        mvFilter.set(finalFilter);
    });

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

    // CTO FIX: Native Variants for Scroll/Click Entrances in Production Mode.
    // Mathematical tracking in `motionStyles` breaks in Preview because playhead doesn't run automatically;
    // it requires these Native Framer Motion variants to trigger transitions correctly.
    const variants = useMemo(() => {
        const hidden: any = { opacity: 0, x: 0, y: 0, scale: 1, rotate: 0 };
        const visible: any = {
            opacity: layer.opacity ?? 1, x: 0, y: 0, scale: 1, rotate: 0,
            transition: {
                duration: entranceDuration,
                delay: entranceDelay,
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
            case 'zoom-in': hidden.scale = 0.8; break;
            case 'zoom-out': hidden.scale = 1.2; break;
            case 'bounce': hidden.y = -40; visible.transition = { type: "spring", bounce: 0.4, duration: entranceDuration, delay: entranceDelay }; break;
            case 'pop-in': hidden.scale = 0.8; visible.transition = { type: "spring", stiffness: 260, damping: 20, delay: entranceDelay }; break;
            case 'twirl-in': hidden.scale = 0; hidden.rotate = -180; visible.transition = { type: "spring", duration: entranceDuration, bounce: 0.2, delay: entranceDelay }; break;
        }

        return { hidden, visible };
    }, [entranceType, hasEntranceAnimation, entranceDuration, entranceDelay, isEditor]);

    // ============================================
    // NATIVE LOOPING ENGINES (PREVIEW / PRODUCTION)
    // ============================================
    // CTO FIX: Math-based looping broke in Preview because playhead doesn't increment.
    // We delegate continuous looping to native Framer Motion GPU optimizations.

    const loopingConfig = useMemo(() => {
        if (!loopingType || loopingType === 'none' || isEditor) return null;

        const loopTransition = {
            duration: loopDuration,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut",
            delay: loopDelay
        };

        const startRotateForLoop = 0; // Handled by origin
        const spinRotation = loopDirection === 'ccw' ? -360 : 360;

        switch (loopingType) {
            case 'float': return { animate: { y: [0, -15, 0] }, transition: loopTransition };
            case 'pulse': return { animate: { scale: [1, 1.05, 1] }, transition: loopTransition };
            case 'sway': return { animate: { rotate: [0, 5, 0, -5, 0] }, transition: { ...loopTransition, duration: 4 } };
            case 'spin': return { animate: { rotate: [0, spinRotation] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "linear", repeatType: "loop" } };
            case 'glow': return { animate: { filter: ['drop-shadow(0 0 0px rgba(255,255,255,0))', 'drop-shadow(0 0 10px rgba(255,255,255,0.8))', 'drop-shadow(0 0 0px rgba(255,255,255,0))'] }, transition: loopTransition };
            case 'heartbeat': return { animate: { scale: [1, 1.2, 1] }, transition: { duration: loopDuration * 0.8, repeat: Infinity, repeatType: "mirror" } };
            case 'sparkle': return { animate: { opacity: [1, 0.5, 1] }, transition: { duration: loopDuration, repeat: Infinity, ease: "easeInOut" } };
            case 'flap-bob': return { animate: { y: [0, -10, 0], scaleY: [1, 0.6, 1] }, transition: { duration: loopDuration * 0.3, repeat: Infinity, ease: "easeInOut" } };
            case 'float-flap': return { animate: { y: [0, -20, 0], scaleY: [1, 0.5, 1], rotate: [0, 5, 0, -5, 0] }, transition: { duration: loopDuration, repeat: Infinity, ease: "easeInOut" } };
            case 'fly-left': return { animate: { x: [0, -200] }, transition: { duration: loopDuration * 3, repeat: Infinity, ease: "linear" } };
            case 'fly-right': return { animate: { x: [0, 200] }, transition: { duration: loopDuration * 3, repeat: Infinity, ease: "linear" } };
            case 'fly-up': return { animate: { y: [0, -200], opacity: [1, 0] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "easeIn" } };
            case 'fly-down': return { animate: { y: [0, 200], opacity: [1, 0] }, transition: { duration: loopDuration * 4, repeat: Infinity, ease: "easeIn" } };
            case 'fly-random': return { animate: { x: [0, 30, -20, 40, 0], y: [0, -40, 20, -10, 0] }, transition: { duration: loopDuration * 8, repeat: Infinity, ease: "easeInOut" } };
            case 'twirl': return {
                animate: {
                    scale: [0, 1, 1, 0],
                    rotate: [-360, 0, 0, 360],
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
    }, [loopingType, loopDuration, loopDelay, loopDirection, isEditor]);

    const elegantSpinAnimation = useMemo(() => {
        if (!isElegantSpinEnabled || !elegantSpinConfig || isEditor) return null;

        const spinDuration = (elegantSpinConfig.spinDuration || elegantSpinConfig.duration || 1000) / 1000;
        const scaleDuration = (elegantSpinConfig.scaleDuration || elegantSpinConfig.duration || 1000) / 1000;
        const delay = (elegantSpinConfig.delay || 0) / 1000;
        const direction = elegantSpinConfig.direction || 'cw';
        const minS = elegantSpinConfig.minScale ?? 0.8;
        const maxS = elegantSpinConfig.maxScale ?? 1.2;

        const startRotate = 0;
        const spinRotation = direction === 'ccw' ? -360 : 360;

        return {
            animate: {
                rotate: [startRotate, spinRotation],
                // CTO FIX: Elegant Spin scale should go from small (minS) to original (1.0),
                // not from minS to maxS. The element "grows" into its natural size while spinning.
                scale: [minS, 1]
            },
            transition: {
                rotate: { duration: spinDuration, repeat: Infinity, ease: "linear" },
                scale: { duration: scaleDuration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                delay: delay
            }
        };
    }, [isElegantSpinEnabled, elegantSpinConfig, isEditor]);

    const pathAnimation = useMemo(() => {
        const config = layer.motionPathConfig;
        if (!config?.enabled || !config.points || config.points.length < 2 || isEditor) return null;

        const points = config.points;
        const xKeyframes: number[] = [];
        const yKeyframes: number[] = [];
        const rotateKeyframes: number[] = [];
        const scaleKeyframes: number[] = [];

        const halfWidth = (layer.width || 0) / 2;
        const halfHeight = (layer.height || 0) / 2;

        points.forEach((p: any) => {
            // CTO FIX: Motion Path Coordinates in Preview Mode
            // The canvas points (p.x, p.y) are absolute canvas coordinates for the center of the element.
            // But this Framer Motion wrapper (<m.div> Layer 0) is already absolutely positioned at:
            // left: layer.x, top: finalY
            // Therefore, x: 0, y: 0 means the element's TOP-LEFT corner is at (layer.x, finalY).
            // To move the element so its center is at (p.x, p.y) relative to its start center:
            // The Framer Motion transform origin is center, so we only need to provide the translation
            // from its starting offset.

            xKeyframes.push(p.x - layer.x - halfWidth);
            // We use adjustedY because the parent anchor is set relative to finalY (which includes relativeShift).
            // The point coordinates p.y are recorded against the absolute canvas (equivalent to adjustedY).
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
    }, [layer.motionPathConfig, layer.x, adjustedY, layer.width, layer.height, isEditor]);

    const loopingProps = useMemo(() => {
        if (isEditor) return {};
        // In Preview Mode, loops, elegant spins, and motion paths should always run regardless of entrance state,
        // unless they are explicitly tied to a click/scroll trigger in their own configs.
        if (elegantSpinAnimation) return elegantSpinAnimation;
        if (pathAnimation) return pathAnimation;
        if (loopingConfig) return loopingConfig;
        return {};
    }, [elegantSpinAnimation, pathAnimation, loopingConfig, isEditor]);

    return (
        <m.div
            ref={ref}
            initial={isEditor ? "visible" : "hidden"}
            animate={isEditor ? "visible" : animationState}
            variants={variants}
            className="absolute origin-center"
            style={{
                // LAYER 1: ABSOLUTE ANCHOR
                // Editor: Parent handles positioning. Preview: We handle it.
                left: isEditor ? 0 : `${layer.x}px`,
                top: isEditor ? `${relativeShift}px` : `${finalY}px`,
                width: `${layer.width}px`,
                height: `${layer.height}px`,
                zIndex: layer.zIndex,
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                pointerEvents: isEditor && motionStyles.opacity === 0 ? 'none' : 'auto',
            }}
        >
            {/* LAYER 2: GLOBAL MOTION STAGE (Translation & Floating) */}
            {/* THIS LAYER IS NEVER FLIPPED. Movement is viewport-consistent. */}
            <m.div
                className="w-full h-full relative origin-center"
                style={isEditor ? {
                    // CTO FIX: Math entrance/scrub styles ONLY apply in Editor mode.
                    x: (motionStyles.x - layer.x) * flipX,
                    y: (motionStyles.y - (layer.y + relativeShift)) * flipY,
                    rotate: motionStyles.rotate,
                    scale: motionStyles.scale,
                    opacity: motionStyles.opacity,
                    filter: motionStyles.filter,
                } : {
                    // CTO ENTERPRISE PREVIEW ENGINE: Bound to 60fps MotionValues
                    x: mvX,
                    y: mvY,
                    rotate: mvRotate,
                    scale: mvScale,
                    filter: mvFilter,
                    // Note: opacity is handled by variants in Layer 1
                }}
            >
                {/* LAYER 3: IDENTITY STAGE (Flips & Base Styles) */}
                {/* Editor: Parent Handles Base Transforms. Preview: We apply them here. */}
                <div
                    className="w-full h-full relative origin-center"
                    style={{
                        transform: isEditor
                            ? 'none'
                            : `rotate(${baseRotate}deg) scale(${baseScale * flipX}, ${baseScale * flipY})`,
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
                </div>
            </m.div>
        </m.div>
    );
};

export const AnimatedLayer = React.memo(AnimatedLayerComponent);
