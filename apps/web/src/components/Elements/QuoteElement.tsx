import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Layer } from '@/store/layersSlice';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export const QuoteElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const arabicRef = useRef<HTMLDivElement>(null);
    const [arabicScale, setArabicScale] = useState(1);
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
                // Also trigger arabic scale re-calc on container resize
                calculateArabicScale();
            }
        });

        resizeObserver.observe(containerRef.current);
        onContentLoad?.();

        return () => resizeObserver.disconnect();
    }, [layer.id, layer.height, updateElementDimensions, onContentLoad]);

    const calculateArabicScale = () => {
        if (!arabicRef.current || !containerRef.current) return;

        // Reset scale for measurement
        arabicRef.current.style.transform = 'scale(1)';

        const containerWidth = containerRef.current.clientWidth - 48; // Account for padding
        const contentWidth = arabicRef.current.scrollWidth;

        if (contentWidth > containerWidth) {
            const scale = containerWidth / contentWidth;
            setArabicScale(Math.max(0.3, scale)); // Don't go below 0.3 for legibility
        } else {
            setArabicScale(1);
        }
    };

    useLayoutEffect(() => {
        calculateArabicScale();
        // Add a small delay for font loading if necessary
        const timer = setTimeout(calculateArabicScale, 500);
        return () => clearTimeout(timer);
    }, [layer.quoteConfig?.textArabic, layer.width]);

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

    // PROPORTIONAL SCALING ENGINE
    const getProportionalStyles = () => {
        const fullText = (config.textArabic || '') + (config.text || '');
        const arabicText = config.textArabic || '';
        const charCount = fullText.length;
        const arabicCharCount = arabicText.length;

        // USER REQUEST: Default font size 12
        let fontSize = config.fontSize || 12;
        let arabicFontSize = (config.fontSize || 24) * 1.5;
        let padding = 'p-6 sm:p-10';

        // Base scaling based on total content
        if (charCount > 300) {
            fontSize = Math.min(fontSize, 10); // Even smaller for very long translations
            arabicFontSize = Math.min(arabicFontSize, 20);
            padding = 'p-4 sm:p-6';
        } else if (charCount > 150) {
            fontSize = Math.min(fontSize, 11);
            arabicFontSize = Math.min(arabicFontSize, 24);
            padding = 'p-5 sm:p-8';
        } else {
            fontSize = Math.max(fontSize, 12);
            arabicFontSize = Math.max(arabicFontSize, 32);
        }

        // AGGRESSIVE ARABIC SCALING: Enforce single-line horizontal space (NO EXCEPTIONS)
        // We scale down based on character count more drastically now
        if (arabicCharCount > 100) {
            arabicFontSize = Math.min(arabicFontSize, 12);
        } else if (arabicCharCount > 80) {
            arabicFontSize = Math.min(arabicFontSize, 14);
        } else if (arabicCharCount > 60) {
            arabicFontSize = Math.min(arabicFontSize, 16);
        } else if (arabicCharCount > 40) {
            arabicFontSize = Math.min(arabicFontSize, 20);
        }

        return { fontSize, arabicFontSize, padding };
    };

    const { fontSize, arabicFontSize, padding } = getProportionalStyles();
    const isQuran = config.category === 'quran';

    return (
        <div
            ref={containerRef}
            className={`w-full min-h-full flex flex-col items-center justify-center ${padding} py-4 relative transition-all duration-500`}
            style={{
                ...getStyles(),
                borderRadius: layer.borderRadius || 24
            }}
        >
            {/* Cinematic Glow Accents */}
            {config.variant === 'cinematic' && (
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
            )}

            <div className="relative z-10 w-full text-center flex flex-col items-center gap-2 flex-grow justify-center">
                {/* Large Decorative Quote Marks (Only for non-Quran OR if it's the start) */}
                {config.variant !== 'transparent' && !isQuran && (
                    <div
                        className="text-6xl leading-none select-none opacity-30 italic"
                        style={{
                            fontFamily: config.fontFamily === 'serif' ? 'Playfair Display, serif' : 'Inter, sans-serif',
                            color: config.quoteColor
                        }}
                    >
                        “
                    </div>
                )}

                {/* Arabic Text Block */}
                {config.textArabic && (
                    <div
                        className="w-full flex justify-center items-center overflow-visible mb-1"
                        style={{ height: `${arabicFontSize * 1.4 * arabicScale}px` }}
                    >
                        <div
                            ref={arabicRef}
                            className="whitespace-nowrap inline-block origin-center transition-transform duration-300"
                            style={{
                                fontFamily: 'Amiri, New Amsterdam, serif',
                                fontSize: `${arabicFontSize}px`,
                                color: config.quoteColor || '#ffffff',
                                lineHeight: 1.4,
                                direction: 'rtl',
                                transform: `scale(${arabicScale})`,
                            }}
                        >
                            {config.textArabic}
                        </div>
                    </div>
                )}

                {/* Translation / Main Text Block */}
                <blockquote
                    className="italic leading-relaxed drop-shadow-sm w-full whitespace-pre-wrap"
                    style={{
                        fontFamily: config.fontFamily === 'serif' ? 'Playfair Display, serif' : 'inherit',
                        fontSize: `${fontSize}px`,
                        color: config.quoteColor || '#ffffff'
                    }}
                >
                    {isQuran ? `“${config.text}”` : config.text}
                </blockquote>

                {/* The Author Section */}
                {config.author && (
                    <div className="flex flex-col items-center w-full mt-4">
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
