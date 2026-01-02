/**
 * COUNTDOWN ELEMENT COMPONENT
 * Enterprise-grade countdown timer with 20 premium variants
 * 
 * Features:
 * - 20 premium design variants
 * - Flip clock animation (CSS 3D transforms)
 * - Circle progress rings (SVG)
 * - Glassmorphism effects
 * - Neon glow effects
 * - Smooth digit transitions
 * - Full customization support
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layer, CountdownConfig, CountdownVariant, DEFAULT_COUNTDOWN_CONFIG } from '@/store/layersSlice';
import { getVariantPreset, mergeWithPreset } from './countdown-variants';

// ============================================
// TYPES
// ============================================

interface CountdownElementProps {
    layer: Layer;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
}

interface TimeUnit {
    label: string;
    value: number;
    max: number;
    key: 'days' | 'hours' | 'minutes' | 'seconds';
}

// ============================================
// UTILITY HOOKS
// ============================================

const useCountdown = (targetDate: string): TimeLeft => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

    useEffect(() => {
        if (!targetDate) return;

        const update = () => {
            const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
            const totalSeconds = Math.floor(diff / 1000);
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
                totalSeconds,
            });
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};

// ============================================
// MAIN COMPONENT
// ============================================

export const CountdownElement: React.FC<CountdownElementProps> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const rawConfig = layer.countdownConfig;

    // Merge with defaults and variant preset
    const config = useMemo((): CountdownConfig => {
        const base = { ...DEFAULT_COUNTDOWN_CONFIG, ...rawConfig };
        const variant = rawConfig?.variant || rawConfig?.style || 'elegant';
        const presetOverrides = mergeWithPreset(variant as CountdownVariant, {});
        return { ...base, ...presetOverrides, ...rawConfig, variant: variant as CountdownVariant };
    }, [rawConfig]);

    const timeLeft = useCountdown(config.targetDate);

    // Build units array based on visibility settings
    const units = useMemo((): TimeUnit[] => {
        const result: TimeUnit[] = [];
        if (config.showDays !== false) result.push({ label: config.labels?.days || 'Days', value: timeLeft.days, max: 365, key: 'days' });
        if (config.showHours !== false) result.push({ label: config.labels?.hours || 'Hours', value: timeLeft.hours, max: 24, key: 'hours' });
        if (config.showMinutes !== false) result.push({ label: config.labels?.minutes || 'Min', value: timeLeft.minutes, max: 60, key: 'minutes' });
        if (config.showSeconds !== false) result.push({ label: config.labels?.seconds || 'Sec', value: timeLeft.seconds, max: 60, key: 'seconds' });
        return result;
    }, [config, timeLeft]);

    // Render based on variant
    const variant = config.variant;

    // Route to appropriate renderer
    if (variant.startsWith('flip')) {
        return <FlipVariantRenderer config={config} units={units} variant={variant} />;
    }
    if (variant.startsWith('circle') || variant === 'ring') {
        return <CircleVariantRenderer config={config} units={units} variant={variant} timeLeft={timeLeft} />;
    }
    if (variant.startsWith('boxed') || variant.startsWith('card')) {
        return <BoxVariantRenderer config={config} units={units} variant={variant} />;
    }
    if (variant === 'neon-glow' || variant === 'cyber') {
        return <NeonVariantRenderer config={config} units={units} variant={variant} />;
    }
    if (variant.startsWith('luxury') || variant === 'wedding-script') {
        return <LuxuryVariantRenderer config={config} units={units} variant={variant} />;
    }
    if (variant === 'typewriter') {
        return <TypewriterVariantRenderer config={config} units={units} />;
    }

    // Default: Classic variants (elegant, classic, minimal, modern-split)
    return <ClassicVariantRenderer config={config} units={units} variant={variant} />;
};

// ============================================
// CLASSIC VARIANT RENDERER
// ============================================

const ClassicVariantRenderer: React.FC<{ config: CountdownConfig; units: TimeUnit[]; variant: CountdownVariant }> = ({
    config,
    units,
    variant,
}) => {
    const getSeparator = () => {
        if (config.showSeparators === false) return null;
        switch (config.separatorStyle) {
            case 'colon': return <span style={{ color: config.accentColor, opacity: 0.6 }}>:</span>;
            case 'dot': return <span style={{ color: config.accentColor, opacity: 0.6 }}>•</span>;
            case 'line': return <span style={{ color: config.accentColor, opacity: 0.3, margin: '0 8px' }}>|</span>;
            case 'slash': return <span style={{ color: config.accentColor, opacity: 0.4, margin: '0 4px' }}>/</span>;
            default: return null;
        }
    };

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                backgroundColor: config.backgroundColor || 'transparent',
                fontFamily: config.fontFamily,
                gap: Math.min(config.boxGap || 16, 12),
                padding: Math.min(config.boxPadding || 8, 8),
                borderRadius: config.borderRadius || 0,
            }}
        >
            {units.map((unit, i) => (
                <React.Fragment key={unit.key}>
                    <div className="flex flex-col items-center flex-shrink min-w-0">
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={unit.value}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                                className="font-mono"
                                style={{
                                    fontSize: config.fontSize || 32,
                                    fontWeight: config.fontWeight || 'bold',
                                    color: config.textColor || '#ffffff',
                                    fontFamily: config.numberFontFamily || config.fontFamily,
                                    letterSpacing: config.letterSpacing || 0,
                                }}
                            >
                                {String(unit.value).padStart(2, '0')}
                            </motion.span>
                        </AnimatePresence>
                        {config.showLabels !== false && (
                            <span
                                className="uppercase tracking-wider"
                                style={{
                                    fontSize: config.labelFontSize || 10,
                                    color: config.labelColor || '#888888',
                                    fontWeight: config.labelFontWeight || 'normal',
                                    marginTop: 4,
                                }}
                            >
                                {unit.label}
                            </span>
                        )}
                    </div>
                    {i < units.length - 1 && getSeparator()}
                </React.Fragment>
            ))}
        </div>
    );
};

// ============================================
// FLIP VARIANT RENDERER
// ============================================

const FlipVariantRenderer: React.FC<{ config: CountdownConfig; units: TimeUnit[]; variant: CountdownVariant }> = ({
    config,
    units,
    variant,
}) => {
    const isNeon = variant === 'flip-neon';
    const isDark = variant === 'flip-dark';

    const getGlowStyle = (): React.CSSProperties => {
        if (!config.glowColor || !config.glowIntensity) return {};
        const intensity = config.glowIntensity / 100;
        return {
            textShadow: `0 0 ${10 * intensity}px ${config.glowColor}, 0 0 ${20 * intensity}px ${config.glowColor}, 0 0 ${30 * intensity}px ${config.glowColor}`,
            boxShadow: `0 0 ${15 * intensity}px ${config.glowColor}`,
        };
    };

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                gap: Math.min(config.boxGap || 12, 8),
                fontFamily: config.fontFamily,
                padding: '4px',
            }}
        >
            {units.map((unit, i) => (
                <React.Fragment key={unit.key}>
                    <div
                        className="relative flex flex-col items-center flex-shrink min-w-0"
                        style={{
                            perspective: '400px',
                            flex: '1 1 0',
                            maxWidth: `${100 / units.length - 2}%`,
                        }}
                    >
                        {/* Flip Card Container */}
                        <div
                            className="relative overflow-hidden"
                            style={{
                                backgroundColor: config.backgroundColor || '#1a1a1a',
                                borderRadius: config.borderRadius || 8,
                                padding: `${config.boxPadding || 16}px ${(config.boxPadding || 16) * 1.2}px`,
                                boxShadow: config.boxShadow === 'medium'
                                    ? '0 4px 20px rgba(0,0,0,0.3)'
                                    : config.boxShadow === 'neon'
                                        ? `0 0 20px ${config.glowColor || '#ff00ff'}`
                                        : '0 2px 10px rgba(0,0,0,0.2)',
                                ...getGlowStyle(),
                            }}
                        >
                            {/* Top Half */}
                            <div className="relative">
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        key={unit.value}
                                        initial={{ rotateX: -90, opacity: 0 }}
                                        animate={{ rotateX: 0, opacity: 1 }}
                                        exit={{ rotateX: 90, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        style={{
                                            fontSize: config.fontSize || 40,
                                            fontWeight: config.fontWeight || 'bold',
                                            color: config.textColor || '#ffffff',
                                            fontFamily: config.numberFontFamily || config.fontFamily,
                                            transformStyle: 'preserve-3d',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {String(unit.value).padStart(2, '0')}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Center Line */}
                            <div
                                className="absolute left-0 right-0 h-px"
                                style={{
                                    top: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                }}
                            />

                            {/* Reflection */}
                            {config.showReflection && (
                                <div
                                    className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05))',
                                    }}
                                />
                            )}
                        </div>

                        {/* Label */}
                        {config.showLabels !== false && (
                            <span
                                className="uppercase tracking-wider mt-2"
                                style={{
                                    fontSize: config.labelFontSize || 10,
                                    color: config.labelColor || '#888888',
                                }}
                            >
                                {unit.label}
                            </span>
                        )}
                    </div>

                    {/* Separator */}
                    {i < units.length - 1 && config.showSeparators !== false && (
                        <span
                            className="self-center"
                            style={{
                                fontSize: (config.fontSize || 40) * 0.8,
                                color: config.accentColor || '#ffffff',
                                opacity: 0.5,
                            }}
                        >
                            :
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ============================================
// BOX VARIANT RENDERER
// ============================================

const BoxVariantRenderer: React.FC<{ config: CountdownConfig; units: TimeUnit[]; variant: CountdownVariant }> = ({
    config,
    units,
    variant,
}) => {
    const isGradient = variant === 'boxed-gradient';
    const isGlass = variant === 'card-glass';
    const isSolid = variant === 'card-solid';

    const getBoxStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            borderRadius: config.borderRadius || 12,
            padding: config.boxPadding || 20,
        };

        if (isGradient && config.gradientFrom && config.gradientTo) {
            return {
                ...base,
                background: `linear-gradient(${config.gradientAngle || 135}deg, ${config.gradientFrom}, ${config.gradientTo})`,
                boxShadow: config.boxShadow === 'medium' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
            };
        }

        if (isGlass) {
            return {
                ...base,
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: `${config.borderWidth || 1}px solid rgba(255,255,255,0.2)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            };
        }

        if (isSolid) {
            return {
                ...base,
                backgroundColor: config.backgroundColor || '#ffffff',
                boxShadow: config.boxShadow === 'heavy' ? '0 10px 40px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.1)',
            };
        }

        // Default boxed
        return {
            ...base,
            backgroundColor: config.backgroundColor || 'rgba(255,255,255,0.1)',
            border: config.borderStyle !== 'none' ? `${config.borderWidth || 1}px solid ${config.borderColor || 'rgba(255,255,255,0.1)'}` : undefined,
            boxShadow: config.boxShadow === 'soft' ? '0 4px 16px rgba(0,0,0,0.1)' : undefined,
        };
    };

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                gap: Math.min(config.boxGap || 12, 8),
                fontFamily: config.fontFamily,
                padding: '4px',
            }}
        >
            {units.map((unit) => (
                <div
                    key={unit.key}
                    className="flex flex-col items-center justify-center flex-shrink min-w-0"
                    style={{
                        ...getBoxStyle(),
                        flex: '1 1 0',
                        maxWidth: `${100 / units.length - 2}%`,
                        padding: Math.min(config.boxPadding || 20, 12),
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={unit.value}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                fontSize: config.fontSize || 32,
                                fontWeight: config.fontWeight || 'bold',
                                color: config.textColor || '#ffffff',
                                fontFamily: config.numberFontFamily || config.fontFamily,
                                lineHeight: 1.2,
                            }}
                        >
                            {String(unit.value).padStart(2, '0')}
                        </motion.span>
                    </AnimatePresence>
                    {config.showLabels !== false && (
                        <span
                            className="uppercase tracking-wider"
                            style={{
                                fontSize: config.labelFontSize || 9,
                                color: config.labelColor || (isSolid ? '#666666' : '#888888'),
                                marginTop: 6,
                            }}
                        >
                            {unit.label}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

// ============================================
// CIRCLE VARIANT RENDERER
// ============================================

const CircleVariantRenderer: React.FC<{
    config: CountdownConfig;
    units: TimeUnit[];
    variant: CountdownVariant;
    timeLeft: TimeLeft;
}> = ({ config, units, variant, timeLeft }) => {
    const isProgress = variant === 'circle-progress';
    const isRing = variant === 'ring';
    const size = Math.min(config.fontSize ? config.fontSize * 2.5 : 80, 120);
    const strokeWidth = config.progressWidth || 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const getProgress = (unit: TimeUnit): number => {
        return unit.value / unit.max;
    };

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                gap: Math.min(config.boxGap || 20, 12),
                fontFamily: config.fontFamily,
                padding: '4px',
            }}
        >
            {units.map((unit) => {
                const progress = getProgress(unit);
                const offset = circumference - progress * circumference;
                // Calculate responsive size based on container
                const responsiveSize = Math.min(size, 60);

                return (
                    <div
                        key={unit.key}
                        className="relative flex flex-col items-center justify-center flex-shrink min-w-0"
                        style={{ width: responsiveSize, height: responsiveSize }}
                    >
                        {/* SVG Ring/Progress */}
                        {(isProgress || isRing) && (
                            <svg
                                className="absolute inset-0"
                                width={responsiveSize}
                                height={responsiveSize}
                                viewBox={`0 0 ${size} ${size}`}
                                style={{ transform: 'rotate(-90deg)' }}
                            >
                                {/* Background Ring */}
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={config.progressBgColor || 'rgba(255,255,255,0.1)'}
                                    strokeWidth={strokeWidth}
                                />
                                {/* Progress Ring */}
                                {isProgress && (
                                    <motion.circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={config.progressColor || config.accentColor || '#bfa181'}
                                        strokeWidth={strokeWidth}
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        animate={{ strokeDashoffset: offset }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                )}
                            </svg>
                        )}

                        {/* Circle Background (non-progress) */}
                        {!isProgress && !isRing && (
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    backgroundColor: config.backgroundColor || 'rgba(255,255,255,0.05)',
                                    border: config.borderStyle !== 'none'
                                        ? `${config.borderWidth || 1}px solid ${config.borderColor || 'rgba(255,255,255,0.15)'}`
                                        : undefined,
                                }}
                            />
                        )}

                        {/* Number */}
                        <div className="relative z-10 flex flex-col items-center">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={unit.value}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.1, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        fontSize: config.fontSize || 24,
                                        fontWeight: config.fontWeight || 'bold',
                                        color: config.textColor || '#ffffff',
                                        fontFamily: config.numberFontFamily || config.fontFamily,
                                    }}
                                >
                                    {String(unit.value).padStart(2, '0')}
                                </motion.span>
                            </AnimatePresence>
                            {config.showLabels !== false && (
                                <span
                                    className="uppercase"
                                    style={{
                                        fontSize: config.labelFontSize || 8,
                                        color: config.labelColor || '#888888',
                                        marginTop: 2,
                                    }}
                                >
                                    {unit.label}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ============================================
// NEON VARIANT RENDERER
// ============================================

const NeonVariantRenderer: React.FC<{ config: CountdownConfig; units: TimeUnit[]; variant: CountdownVariant }> = ({
    config,
    units,
    variant,
}) => {
    const isCyber = variant === 'cyber';
    const glowColor = config.glowColor || config.accentColor || '#00ffff';
    const intensity = (config.glowIntensity || 100) / 100;

    const getGlowStyle = (): React.CSSProperties => ({
        textShadow: `
            0 0 ${5 * intensity}px ${glowColor},
            0 0 ${10 * intensity}px ${glowColor},
            0 0 ${20 * intensity}px ${glowColor},
            0 0 ${40 * intensity}px ${glowColor}
        `,
    });

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                gap: Math.min(config.boxGap || 16, 10),
                fontFamily: config.fontFamily,
                backgroundColor: config.backgroundColor || 'transparent',
                padding: Math.min(config.boxPadding || 12, 8),
                borderRadius: config.borderRadius || 0,
                border: config.borderStyle !== 'none'
                    ? `${config.borderWidth || 1}px solid ${config.borderColor || `${glowColor}40`}`
                    : undefined,
            }}
        >
            {isCyber && (
                <span style={{ color: glowColor, opacity: 0.5, ...getGlowStyle() }}>//</span>
            )}
            {units.map((unit, i) => (
                <React.Fragment key={unit.key}>
                    <div className="flex flex-col items-center">
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={unit.value}
                                initial={{ opacity: 0, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(4px)' }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    fontSize: config.fontSize || 36,
                                    fontWeight: config.fontWeight || 'bold',
                                    color: config.textColor || glowColor,
                                    fontFamily: config.numberFontFamily || config.fontFamily,
                                    ...getGlowStyle(),
                                }}
                            >
                                {String(unit.value).padStart(2, '0')}
                            </motion.span>
                        </AnimatePresence>
                        {config.showLabels !== false && (
                            <span
                                className="uppercase tracking-wider"
                                style={{
                                    fontSize: config.labelFontSize || 9,
                                    color: config.labelColor || `${glowColor}80`,
                                    marginTop: 4,
                                }}
                            >
                                {unit.label}
                            </span>
                        )}
                    </div>
                    {i < units.length - 1 && config.showSeparators !== false && (
                        <span
                            style={{
                                color: glowColor,
                                opacity: 0.6,
                                ...getGlowStyle(),
                            }}
                        >
                            {isCyber ? '.' : ':'}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ============================================
// LUXURY VARIANT RENDERER
// ============================================

const LuxuryVariantRenderer: React.FC<{ config: CountdownConfig; units: TimeUnit[]; variant: CountdownVariant }> = ({
    config,
    units,
    variant,
}) => {
    const isWedding = variant === 'wedding-script';
    const isRose = variant === 'luxury-rose';

    const getTextGradient = (): React.CSSProperties => {
        if (config.gradientFrom && config.gradientTo) {
            return {
                background: `linear-gradient(${config.gradientAngle || 135}deg, ${config.gradientFrom}, ${config.gradientTo})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            };
        }
        return { color: config.textColor || '#bfa181' };
    };

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                gap: Math.min(config.boxGap || 20, 12),
                fontFamily: config.fontFamily,
                padding: '4px',
            }}
        >
            {/* Decorative Element Left */}
            <span
                className="opacity-50"
                style={{ color: config.accentColor, fontSize: config.fontSize ? config.fontSize * 0.5 : 16 }}
            >
                {isWedding ? '❧' : '✦'}
            </span>

            {units.map((unit, i) => (
                <React.Fragment key={unit.key}>
                    <div className="flex flex-col items-center">
                        <motion.span
                            key={unit.value}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                fontSize: config.fontSize || 36,
                                fontWeight: config.fontWeight || 'semibold',
                                fontFamily: config.numberFontFamily || config.fontFamily,
                                letterSpacing: config.letterSpacing || 2,
                                ...getTextGradient(),
                            }}
                        >
                            {String(unit.value).padStart(2, '0')}
                        </motion.span>
                        {config.showLabels !== false && (
                            <span
                                className="uppercase tracking-widest"
                                style={{
                                    fontSize: config.labelFontSize || 10,
                                    color: config.labelColor || '#999999',
                                    marginTop: 6,
                                    fontFamily: isWedding ? config.fontFamily : 'Inter',
                                }}
                            >
                                {unit.label}
                            </span>
                        )}
                    </div>
                    {i < units.length - 1 && config.showSeparators !== false && (
                        <span
                            style={{
                                fontSize: (config.fontSize || 36) * 0.7,
                                ...getTextGradient(),
                                opacity: 0.5,
                            }}
                        >
                            :
                        </span>
                    )}
                </React.Fragment>
            ))}

            {/* Decorative Element Right */}
            <span
                className="opacity-50"
                style={{ color: config.accentColor, fontSize: config.fontSize ? config.fontSize * 0.5 : 16 }}
            >
                {isWedding ? '❧' : '✦'}
            </span>
        </div>
    );
};

// ============================================
// TYPEWRITER VARIANT RENDERER
// ============================================

const TypewriterVariantRenderer: React.FC<{ config: CountdownConfig; units: TimeUnit[] }> = ({
    config,
    units,
}) => {
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => setCursorVisible(v => !v), 530);
        return () => clearInterval(interval);
    }, []);

    const timeString = units.map(u => String(u.value).padStart(2, '0')).join(':');

    return (
        <div
            className="w-full h-full flex justify-center items-center overflow-hidden"
            style={{
                backgroundColor: config.backgroundColor || '#0a0a0a',
                fontFamily: config.fontFamily || 'Courier Prime',
                padding: Math.min(config.boxPadding || 16, 8),
                borderRadius: config.borderRadius || 0,
            }}
        >
            <div className="flex items-center">
                <span style={{ color: config.accentColor, opacity: 0.5 }}>[</span>
                <motion.span
                    style={{
                        fontSize: config.fontSize || 28,
                        fontWeight: config.fontWeight || 'bold',
                        color: config.textColor || '#00ff00',
                        fontFamily: config.numberFontFamily || config.fontFamily,
                        letterSpacing: 2,
                    }}
                >
                    {timeString}
                </motion.span>
                <span
                    style={{
                        color: config.textColor || '#00ff00',
                        opacity: cursorVisible ? 1 : 0,
                        marginLeft: 2,
                    }}
                >
                    _
                </span>
                <span style={{ color: config.accentColor, opacity: 0.5 }}>]</span>
            </div>
        </div>
    );
};

export default CountdownElement;
