import React, { useEffect, useRef } from 'react';
import { Layer } from '@/store/layersSlice';
import { m } from 'framer-motion';
import { useStore } from '@/store/useStore';

export const QuoteElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { updateElementDimensions } = useStore();

    const rawConfig = layer.quoteConfig || {
        text: 'Grow old along with me! The best is yet to be.',
        author: 'Robert Browning',
        variant: 'cinematic',
        backgroundColor: 'rgba(34, 29, 16, 0.4)',
        quoteColor: '#ffffff',
        authorColor: '#eebd2b',
        decorativeColor: '#bfa181',
        fontFamily: 'serif',
        authorFontFamily: 'sans-serif',
        glassBlur: 24,
        showWatermark: true,
        tiltEnabled: true
    };

    // Normalize: prefer quoteColor, fallback to legacy textColor
    const config = {
        ...rawConfig,
        quoteColor: rawConfig.quoteColor || (rawConfig as any).textColor || '#ffffff',
    };

    // CTO: Liquid Layout Engine height reporting
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { height } = entry.contentRect;
                if (height > 0 && Math.abs(layer.height - height) > 1) {
                    updateElementDimensions(layer.id, layer.width, height);
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        onContentLoad?.();

        return () => resizeObserver.disconnect();
    }, [layer.id, layer.height, updateElementDimensions, onContentLoad]);

    const getStyles = () => {
        switch (config.variant) {
            case 'cinematic':
                return {
                    background: config.backgroundColor || 'rgba(34, 29, 16, 0.4)',
                    backdropFilter: `blur(${config.glassBlur || 24}px)`,
                    WebkitBackdropFilter: `blur(${config.glassBlur || 24}px)`,
                    border: '1px solid rgba(238, 189, 43, 0.15)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                };
            case 'solid':
                return {
                    background: config.backgroundColor || '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                };
            case 'transparent':
                return {
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none'
                };
            default:
                return {};
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden transition-all duration-500"
            style={{
                ...getStyles(),
                borderRadius: layer.borderRadius || 24
            }}
        >
            {/* Cinematic Glow Accents */}
            {config.variant === 'cinematic' && (
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
            )}

            <div className="relative z-10 w-full text-center flex flex-col items-center">
                {/* Large Decorative Quote Marks */}
                {config.variant !== 'transparent' && (
                    <div
                        className="text-6xl leading-none mb-4 select-none opacity-30 italic"
                        style={{ fontFamily: config.fontFamily === 'serif' ? 'Playfair Display, serif' : 'Inter, sans-serif', color: config.quoteColor }}
                    >
                        “
                    </div>
                )}

                {/* The Quote Text */}
                <blockquote
                    className="italic leading-relaxed drop-shadow-sm mb-6 px-2 w-full"
                    style={{
                        fontFamily: config.fontFamily === 'serif' ? 'Playfair Display, serif' : 'inherit',
                        fontSize: config.fontSize || (isEditor ? 18 : 24),
                        color: config.quoteColor || '#ffffff'
                    }}
                >
                    {config.text}
                </blockquote>

                {/* The Author Section */}
                {config.author && (
                    <div className="flex flex-col items-center w-full">
                        <div
                            className="h-[1px] w-8 mb-4 opacity-60"
                            style={{ backgroundColor: config.authorColor || '#eebd2b' }}
                        />
                        <cite
                            className="not-italic font-semibold uppercase tracking-[0.3em] w-full"
                            style={{
                                fontFamily: config.authorFontFamily === 'serif' ? 'Playfair Display, serif' : 'Manrope, Outfit, sans-serif',
                                fontSize: config.authorFontSize || 10,
                                color: config.authorColor || '#eebd2b'
                            }}
                        >
                            {config.author}
                        </cite>
                    </div>
                )}
            </div>

            {/* Heart Watermark */}
            {config.showWatermark && (
                <div className="mt-8 opacity-20 pointer-events-none">
                    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={config.authorColor || '#eebd2b'}></path>
                    </svg>
                </div>
            )}

            {/* Subtle Border Highlight for Editor */}
            {isEditor && (
                <div className="absolute inset-0 border border-white/5 rounded-[inherit] pointer-events-none" />
            )}
        </div>
    );
};
