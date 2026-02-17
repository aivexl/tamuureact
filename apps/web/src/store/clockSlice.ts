import { StateCreator } from 'zustand';

export interface ClockState {
    playhead: number;        // Current time in milliseconds
    duration: number;        // Total duration in milliseconds
    isPlaying: boolean;
    playbackRate: number;    // Speed multiplier (e.g., 1.0, 0.5, 2.0)

    // Actions
    setPlayhead: (time: number) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (playing: boolean) => void;
    togglePlayback: () => void;
    setPlaybackRate: (rate: number) => void;
    resetClock: () => void;
}

export const createClockSlice: StateCreator<ClockState> = (set, get) => ({
    playhead: 0,
    duration: 5000, // Default 5 seconds
    isPlaying: false,
    playbackRate: 1.0,

    setPlayhead: (time) => set((state) => ({
        playhead: Math.max(0, Math.min(time, state.duration))
    })),

    setDuration: (duration) => set({ duration }),

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setPlaybackRate: (playbackRate) => set({ playbackRate }),

    resetClock: () => set({ playhead: 0, isPlaying: false }),
});
