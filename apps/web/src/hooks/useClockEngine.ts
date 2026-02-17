import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

/**
 * useClockEngine
 * 
 * The main "heartbeat" of the Tamuu Motion Graphics Engine.
 * Uses requestAnimationFrame for deterministic 60fps ticking.
 * Bypasses intensive React re-renders by using shallow state updates.
 */
export const useClockEngine = () => {
    const isPlaying = useStore((state) => state.isPlaying);
    const playhead = useStore((state) => state.playhead);
    const duration = useStore((state) => state.duration);
    const playbackRate = useStore((state) => state.playbackRate);

    const setPlayhead = useStore((state) => state.setPlayhead);
    const setIsPlaying = useStore((state) => state.setIsPlaying);

    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | undefined>(undefined);

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - (previousTimeRef.current as number);
            // Get latest values from store actions if needed, but for now we'll stick to hook snapshots
            // to keep it simple, or use a ref for playhead if it's lagging.
            const nextPlayhead = useStore.getState().playhead + (deltaTime * playbackRate);

            if (nextPlayhead >= duration) {
                setPlayhead(duration);
                setIsPlaying(false);
            } else {
                setPlayhead(nextPlayhead);
            }
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isPlaying) {
            previousTimeRef.current = undefined;
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        }
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isPlaying, duration, playbackRate]); // Removed playhead from deps to prevent re-renders every frame

    return { playhead, isPlaying };
};
