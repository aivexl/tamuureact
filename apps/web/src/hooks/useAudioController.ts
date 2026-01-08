import { create } from 'zustand';
import { useEffect } from 'react';

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

export const useAudioController = () => {
    const { isPlaying, currentUrl, volume, setPlaying, setUrl, setVolume } = useAudioStore();

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
            globalAudio.volume = 0; // Start for fade-in
        }

        if (isPlaying) {
            const playPromise = globalAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn('Autoplay blocked, waiting for interaction:', error);
                    setPlaying(false);

                    // Force Autoplay on first interaction
                    const unlock = () => {
                        if (globalAudio && isPlaying) {
                            globalAudio.play();
                            setPlaying(true);
                        }
                        window.removeEventListener('click', unlock);
                        window.removeEventListener('touchstart', unlock);
                        window.removeEventListener('scroll', unlock);
                    };
                    window.addEventListener('click', unlock);
                    window.addEventListener('touchstart', unlock);
                    window.addEventListener('scroll', unlock);
                });
            }

            // Fade-in logic
            let vol = 0;
            const fadeIn = setInterval(() => {
                if (vol < volume) {
                    vol = Math.min(volume, vol + 0.05);
                    if (globalAudio) globalAudio.volume = vol;
                } else {
                    clearInterval(fadeIn);
                }
            }, 100);
        } else {
            globalAudio.pause();
        }

    }, [currentUrl, isPlaying]);

    useEffect(() => {
        if (globalAudio) globalAudio.volume = volume;
    }, [volume]);

    // Helper to extract Direct Link from Google Drive
    const getGDriveStreamUrl = (url: string) => {
        if (!url.includes('drive.google.com')) return url;
        const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
        return url;
    };

    return {
        isPlaying,
        currentUrl,
        volume,
        play: (url?: string) => {
            if (url) setUrl(getGDriveStreamUrl(url));
            setPlaying(true);
        },
        pause: () => setPlaying(false),
        stop: () => {
            setPlaying(false);
            setUrl(null);
        },
        setVolume,
        getGDriveStreamUrl
    };
};
