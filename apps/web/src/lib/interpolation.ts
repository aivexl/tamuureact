import { Keyframe } from '@/store/layersSlice';

/**
 * Interpolation Engine for Tamuu Motion Graphics
 * Supports multiple property types and easing functions.
 */

export type EasingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';

const easings: Record<string, (t: number) => number> = {
    linear: (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: (t) => {
        if (t < (1 / 2.75)) return 7.5625 * t * t;
        if (t < (2 / 2.75)) return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        if (t < (2.5 / 2.75)) return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
    },
    elastic: (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.3;
        const s = p / 4;
        return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
    }
};

/**
 * Interpolates a value between two keyframes based on current time.
 */
export const interpolate = (
    time: number,
    keyframes: Keyframe[],
    baseValue: number,
    property: string
): number => {
    const propKeyframes = keyframes
        .filter(k => k.property === property)
        .sort((a, b) => a.time - b.time);

    if (propKeyframes.length === 0) return baseValue;

    // Before first keyframe
    if (time <= propKeyframes[0].time) {
        return Number(propKeyframes[0].value);
    }

    // After last keyframe
    if (time >= propKeyframes[propKeyframes.length - 1].time) {
        return Number(propKeyframes[propKeyframes.length - 1].value);
    }

    // Find the current keyframe pair
    for (let i = 0; i < propKeyframes.length - 1; i++) {
        const k1 = propKeyframes[i];
        const k2 = propKeyframes[i + 1];

        if (time >= k1.time && time < k2.time) {
            const range = k2.time - k1.time;
            const progress = (time - k1.time) / range;
            const easingFunc = easings[k1.easing || 'linear'] || easings.linear;
            const easedProgress = easingFunc(progress);

            const v1 = Number(k1.value);
            const v2 = Number(k2.value);

            return v1 + (v2 - v1) * easedProgress;
        }
    }

    return baseValue;
};
