import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { templates } from '@/lib/api';
import { AnimatedLayer } from '@/components/Preview/AnimatedLayer';
import { VisualEffectsCanvas } from '@/components/Canvas/VisualEffectsCanvas';
import { Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Layer } from '@/store/layersSlice';
import { Section } from '@/store/sectionsSlice';

/**
 * ADMIN DISPLAY PREVIEW PAGE
 * 
 * Separate from user /display/:slug to avoid route collision.
 * Features:
 * - Click anywhere triggers Blast effect
 * - Effect originates FROM Blast element's position on canvas
 * - Name Board element displays the guest name (no GuestGreetingOverlay)
 */
export const AdminDisplayPreviewPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [design, setDesign] = useState<any>(null);
    const [scale, setScale] = useState(1);

    const { isAnimationPlaying, setAnimationPlaying, triggerBatchInteractions, resetInteractions } = useStore();

    // Load template design AND reset greetingName on mount
    useEffect(() => {
        console.log('[AdminDisplayPreview] Mounting, resetting greetingName');
        setAnimationPlaying(true);

        // Reset interactions on mount
        resetInteractions();

        const loadDesign = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                console.log('[AdminDisplayPreview] Loading design:', slug);
                const data = await templates.get(slug);
                console.log('[AdminDisplayPreview] Design loaded:', data);
                setDesign(data);
            } catch (err) {
                console.error('Failed to load display design:', err);
                setError('Design not found');
            } finally {
                setLoading(false);
            }
        };
        loadDesign();
    }, [slug, setAnimationPlaying]);

    // Auto-scaling
    useEffect(() => {
        const handleResize = () => {
            const targetW = 1920;
            const targetH = 1080;
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            setScale(Math.min(winW / targetW, winH / targetH));
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Find Blast element to get config AND position
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

    // Click anywhere to trigger - effect originates from Blast element position
    const handleClick = (e: React.MouseEvent) => {
        console.log('[AdminDisplayPreview] Click detected');
        e.stopPropagation();

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
            console.log('[AdminDisplayPreview] Triggering batch interactions:', interactions.length);
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
            <Loader2 className="w-10 h-10 animate-spin text-premium-accent" />
        </div>
    );

    if (error || !design) return (
        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-xl font-bold">{error || 'Display not available'}</p>
        </div>
    );

    const sections: Section[] = design.sections || design.content?.sections || [];
    const orbitLayers: Layer[] = design.orbit_layers || design.content?.orbit_layers || [];
    const hasBlast = getAllBlastElementsData().length > 0;

    return (
        <div
            className={`w-screen h-screen bg-black overflow-hidden relative flex items-center justify-center ${hasBlast ? 'cursor-pointer' : ''}`}
        >
            {/* 
              * INTERACTION OVERLAY (CTO FIX)
              * A transparent layer on top of everything to catch clicks reliably.
              * This avoids clicks being swallowed by nested elements or transform:scale issues.
            */}
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
                        {section.elements?.map((layer: Layer) => (
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

                {orbitLayers.map((layer: Layer) => (
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

            {/* Click Hint for Admin */}
            {hasBlast && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-lg text-white/60 text-sm pointer-events-none">
                    Click anywhere to trigger effect
                </div>
            )}

            {/* Visual Effects Overlay - Highest z-index to avoid clipping */}
            <div className="fixed inset-0 z-[99999] pointer-events-none">
                <VisualEffectsCanvas mode="global" />
            </div>

            {/* Fullscreen Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    document.documentElement.requestFullscreen();
                }}
                className="fixed bottom-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors z-[100000]"
            >
                Fullscreen
            </button>
        </div>
    );
};

export default AdminDisplayPreviewPage;

