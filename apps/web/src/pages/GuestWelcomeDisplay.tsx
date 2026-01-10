import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { userDisplayDesigns } from '@/lib/api';
import { AnimatedLayer } from '@/components/Preview/AnimatedLayer';
import { Loader2, AlertCircle, Play, Square, Maximize2 } from 'lucide-react';
import { useAudioController } from '@/hooks/useAudioController';
import { useStore } from '@/store/useStore';
import { Layer } from '@/store/layersSlice';
import { Section } from '@/store/sectionsSlice';
import { VisualEffectsCanvas } from '@/components/Canvas/VisualEffectsCanvas';
import { GuestGreetingOverlay } from '@/components/Canvas/GuestGreetingOverlay';
import { DisplaySimulationHUD } from '@/components/Canvas/DisplaySimulationHUD';

export const GuestWelcomeDisplay: React.FC = () => {
    const { slug } = useParams<{ slug: string }>(); // This is actually the ID
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [design, setDesign] = useState<any>(null);
    const [scale, setScale] = useState(1);

    const { isAnimationPlaying, setAnimationPlaying, triggerBatchInteractions, resetInteractions } = useStore();
    const { play, pause, isPlaying: isGlobalPlaying } = useAudioController();

    useEffect(() => {
        // Force animation playing for runtime
        setAnimationPlaying(true);

        // Reset interactions on mount
        resetInteractions();

        const loadDesign = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await userDisplayDesigns.get(slug);
                setDesign(data);

                // Auto-play music if config exists
                const music = data.music || data.content?.music;
                if (music?.url) {
                    play(music.url);
                }
            } catch (err) {
                console.error('Failed to load display design:', err);
                setError('Design not found');
            } finally {
                setLoading(false);
            }
        };
        loadDesign();

        return () => {
            pause();
        };
    }, [slug, setAnimationPlaying, play, pause]);

    // Enhanced Auto-Scaling Logic
    useEffect(() => {
        const handleResize = () => {
            const targetW = 1920;
            const targetH = 1080;
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const sx = winW / targetW;
            const sy = winH / targetH;
            setScale(Math.min(sx, sy));
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize timestamp ref to ignore past events on refresh
    const lastSyncTimestamp = useRef(Date.now());

    // Remote Control Poller (Dev Sync)
    useEffect(() => {
        const handleSync = (e: StorageEvent) => {
            if (e.key === 'tamuu_interaction_event' && e.newValue) {
                try {
                    const event = JSON.parse(e.newValue);
                    const now = Date.now();
                    // If event is fresh (last 5s) AND after the page loaded
                    if (now - event.timestamp < 5000 && event.timestamp > lastSyncTimestamp.current) {
                        console.log('[GuestDisplay] Remote trigger detected:', event);
                        lastSyncTimestamp.current = event.timestamp;

                        if (event.interactions && event.interactions.length > 0) {
                            triggerBatchInteractions(event.name, event.interactions);
                        } else if (event.effect) {
                            // Legacy single effect support
                            triggerBatchInteractions(event.name, [{
                                effect: event.effect,
                                style: event.style,
                                origin: event.origin
                            }]);
                        }
                    }
                } catch (err) {
                    console.error('[GuestDisplay] Sync parse error:', err);
                }
            }
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, [triggerBatchInteractions]);

    const getAllBlastElementsData = () => {
        if (!design) return [];
        const sections: Section[] = design.sections || design.content?.sections || [];
        const allBlastData: { config: any, x: number, y: number }[] = [];

        for (const section of sections) {
            const blastElements = (section.elements || []).filter((el: Layer) => el.type === 'interaction');
            blastElements.forEach((blastElement: any) => {
                if (blastElement?.interactionConfig) {
                    allBlastData.push({
                        config: blastElement.interactionConfig,
                        // Element position on 1920x1080 canvas
                        x: (blastElement.x || 0) + (blastElement.width || 100) / 2,
                        y: (blastElement.y || 0) + (blastElement.height || 100) / 2
                    });
                }
            });
        }
        return allBlastData;
    };

    const handleClick = (e: React.MouseEvent) => {
        console.log('[GuestDisplay] Click interaction');
        const allBlastData = getAllBlastElementsData();

        const winW = window.innerWidth;
        const winH = window.innerHeight;

        const allSections: Section[] = design?.sections || design?.content?.sections || [];
        const hasNameBoard = allSections.some((s: any) =>
            s.elements?.some((el: any) => el.type === 'name_board')
        );

        if (allBlastData.length > 0) {
            const interactions = allBlastData.map(data => {
                const canvasW = 1920 * scale;
                const canvasH = 1080 * scale;
                const offsetX = (winW - canvasW) / 2;
                const offsetY = (winH - canvasH) / 2;

                const blastScreenX = offsetX + data.x * scale;
                const blastScreenY = offsetY + data.y * scale;

                const origin = { x: blastScreenX / winW, y: blastScreenY / winH };
                const style = hasNameBoard ? 'none' : (data.config?.greetingStyle || 'cinematic');

                return {
                    effect: data.config?.effect || 'confetti',
                    style: style as any,
                    origin,
                    resetDuration: data.config?.resetDuration
                };
            });

            const testName = allBlastData[0].config?.testName || 'Guest Name';
            console.log('[GuestDisplay] Triggering batch interactions:', interactions.length);
            triggerBatchInteractions(testName, interactions);
        } else {
            const origin = { x: e.clientX / winW, y: e.clientY / winH };
            const style = hasNameBoard ? 'none' : 'cinematic';
            triggerBatchInteractions('Guest Name', [{
                effect: 'confetti',
                style: style as any,
                origin
            }]);
        }
    };

    if (loading) return (
        <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
            <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        </div>
    );

    if (error || !design) return (
        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-xl font-bold">{error || 'Display not available'}</p>
        </div>
    );

    const sections: Section[] = design.sections || (design.content?.sections) || [];
    const orbitLayers: Layer[] = design.orbit_layers || (design.content?.orbit_layers) || [];

    return (
        <div
            className="w-screen h-screen bg-black overflow-hidden relative flex items-center justify-center cursor-none"
        >
            {/* INTERACTION OVERLAY (CTO FIX) */}
            <div
                className="absolute inset-0 z-[50000] cursor-pointer"
                onClick={handleClick}
            />

            <div
                style={{
                    width: 1920,
                    height: 1080,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                className="bg-white shadow-2xl"
            >
                {sections.map(section => (
                    <div
                        key={section.id}
                        style={{
                            width: 1920,
                            height: 1080,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: section.backgroundColor || '#ffffff',
                            backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 1
                        }}
                    >
                        {section.elements.map(layer => (
                            <AnimatedLayer
                                key={layer.id}
                                layer={layer}
                                adjustedY={layer.y}
                                isOpened={true}
                                isEditor={false}
                                isSectionActive={true}
                                onDimensionsDetected={() => { }}
                            />
                        ))}
                    </div>
                ))}

                {orbitLayers.map(layer => (
                    <div key={layer.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
                        <AnimatedLayer
                            layer={layer}
                            adjustedY={layer.y}
                            isOpened={true}
                            isEditor={false}
                            isSectionActive={true}
                        />
                    </div>
                ))}
            </div>

            {/* Visual Layers */}
            <VisualEffectsCanvas mode="global" />
            <GuestGreetingOverlay />

            {/* Interaction Layer (Future Sync) */}
            <DisplaySimulationHUD className="fixed bottom-4 left-4 scale-75 origin-bottom-left opacity-0 hover:opacity-100 transition-opacity" />

            {/* UI Controls Overlay */}
            <div className="fixed top-4 right-4 z-[60000] flex items-center gap-2">
                {(design?.music?.url || design?.content?.music?.url) && (
                    <button
                        onClick={() => isGlobalPlaying ? pause() : play(design.music?.url || design.content?.music?.url)}
                        className="p-3 bg-premium-accent/20 backdrop-blur-md rounded-2xl text-premium-accent hover:bg-premium-accent/40 transition-all border border-premium-accent/30 shadow-[0_0_20px_rgba(191,161,129,0.2)]"
                        title={isGlobalPlaying ? 'Stop Music' : 'Play Music'}
                    >
                        {!isGlobalPlaying ? <Play className="w-5 h-5 fill-current" /> : <Square className="w-5 h-5 fill-current" />}
                    </button>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                    className="p-3 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white rounded-full border border-white/20 transition-colors"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>

            <button
                onClick={() => document.documentElement.requestFullscreen()}
                className="fixed bottom-4 right-4 opacity-0 hover:opacity-50 text-white p-2"
            >
                Fullscreen
            </button>
        </div>
    );
};
