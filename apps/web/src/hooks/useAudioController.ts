import { create } from 'zustand';
import { useEffect, useCallback, useRef } from 'react';

interface AudioState {
    isPlaying: boolean;
    currentUrl: string | null;
    volume: number;
    setPlaying: (playing: boolean) => void;
    setUrl: (url: string | null) => void;
    setVolume: (v: number) => void;
}

const useAudioStore = create<AudioState>((set) => ({
    isPlaying: false,
    currentUrl: null,
    volume: 1,
    setPlaying: (playing) => set({ isPlaying: playing }),
    setUrl: (url) => set({ currentUrl: url }),
    setVolume: (v) => set({ volume: v }),
}));

let globalAudio: HTMLAudioElement | null = null;
let fadeInterval: any = null;

export const useAudioController = () => {
    const isPlaying = useAudioStore(state => state.isPlaying);
    const currentUrl = useAudioStore(state => state.currentUrl);
    const volume = useAudioStore(state => state.volume);
    const setPlaying = useAudioStore(state => state.setPlaying);
    const setUrlStore = useAudioStore(state => state.setUrl);
    const setVolumeStore = useAudioStore(state => state.setVolume);

    // Use refs to avoid dependency loops in useEffect
    const isPlayingRef = useRef(isPlaying);
    const currentUrlRef = useRef(currentUrl);
    const volumeRef = useRef(volume);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        currentUrlRef.current = currentUrl;
        volumeRef.current = volume;
    }, [isPlaying, currentUrl, volume]);

    useEffect(() => {
        if (!currentUrl) {
            if (globalAudio) {
                globalAudio.pause();
                globalAudio = null;
            }
            return;
        }

        if (!globalAudio || globalAudio.src !== currentUrl) {
            if (globalAudio) globalAudio.pause();
            globalAudio = new Audio(currentUrl);
            globalAudio.loop = true;
            globalAudio.volume = 0;
        }

        const audio = globalAudio;

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (fadeInterval) clearInterval(fadeInterval);
                    let vol = audio.volume;
                    fadeInterval = setInterval(() => {
                        if (vol < volumeRef.current) {
                            vol = Math.min(volumeRef.current, vol + 0.05);
                            if (audio) audio.volume = vol;
                        } else {
                            clearInterval(fadeInterval);
                            fadeInterval = null;
                        }
                    }, 100);
                }).catch((error) => {
                    if (error.name === 'NotAllowedError') {
                        // Silent unlock mechanism
                        const urlToPlay = currentUrl;
                        const unlock = () => {
                            if (globalAudio && globalAudio.src === urlToPlay) {
                                globalAudio.play().then(() => {
                                    setPlaying(true);
                                }).catch(() => { });
                            }
                            ['mousedown', 'touchstart', 'scroll', 'keydown'].forEach(evt =>
                                window.removeEventListener(evt, unlock, { capture: true })
                            );
                        };
                        ['mousedown', 'touchstart', 'scroll', 'keydown'].forEach(evt =>
                            window.addEventListener(evt, unlock, { once: true, capture: true })
                        );
                    }
                });
            }
        } else {
            audio.pause();
            if (fadeInterval) {
                clearInterval(fadeInterval);
                fadeInterval = null;
            }
        }
        // Minimal dependencies to prevent loops
    }, [currentUrl, isPlaying, setPlaying]);

    useEffect(() => {
        if (globalAudio) globalAudio.volume = volume;
    }, [volume]);

    const getGDriveStreamUrl = useCallback((url: string) => {
        if (!url.includes('drive.google.com')) return url;
        const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
        return url;
    }, []);

    const play = useCallback((url?: string) => {
        if (url) {
            const streamUrl = getGDriveStreamUrl(url);
            setUrlStore(streamUrl);
        }
        setPlaying(true);
    }, [getGDriveStreamUrl, setPlaying, setUrlStore]);

    const pause = useCallback(() => {
        setPlaying(false);
    }, [setPlaying]);

    const stop = useCallback(() => {
        setPlaying(false);
        setUrlStore(null);
    }, [setPlaying, setUrlStore]);

    const setVolume = useCallback((v: number) => {
        setVolumeStore(v);
    }, [setVolumeStore]);

    return {
        isPlaying,
        currentUrl,
        volume,
        play,
        pause,
        stop,
        setVolume,
        getGDriveStreamUrl
    };
};
