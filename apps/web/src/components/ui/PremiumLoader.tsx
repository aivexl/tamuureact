import React from 'react';
import { m } from 'framer-motion';

/**
 * PremiumLoader - Terminal Edition v4.0
 * 
 * Absolute parity with system terminal loading indicators.
 * Square dots, zero glow, mechanical snake sequence.
 */

interface PremiumLoaderProps {
    variant?: 'full' | 'inline';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    label?: string;
    className?: string;
    color?: string;
    labelColor?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
    variant = 'full',
    size = 'md',
    showLabel = false,
    label = 'Memuat...',
    className = '',
    color = 'white',
    labelColor
}) => {
    // Diagonal wave logic for 4x4 grid
    const blockVariants = {
        animate: (i: number) => ({
            opacity: [0.15, 1, 0.15],
            scale: [0.85, 1, 0.85],
            transition: {
                duration: 2,
                repeat: Infinity,
                delay: i * 0.12,
                ease: [0.45, 0, 0.55, 1]
            }
        })
    };

    const isInline = variant === 'inline';
    const isSm = size === 'sm';

    return (
        <div className={`
            ${variant === 'full' ? 'fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center' : 'inline-flex items-center justify-center'}
            select-none overflow-hidden ${className}
        `}>
            {/* Volumetric Background Light (Only for full view) */}
            {variant === 'full' && (
                <m.div
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-[600px] h-[600px] bg-white/[0.03] blur-[100px] rounded-full pointer-events-none"
                    style={{ backgroundColor: color === 'white' ? undefined : `${color}1A` }}
                />
            )}

            <div className={`flex flex-col items-center ${isInline ? (isSm ? 'gap-1.5' : 'gap-3') : 'gap-6'} relative`}>
                <div className={`grid grid-cols-4 ${isSm ? 'gap-[1.5px]' : (isInline ? 'gap-2' : 'gap-2.5')} ${isSm ? 'p-0.5' : 'p-1'}`}>
                    {[...Array(16)].map((_, i) => {
                        const x = i % 4;
                        const y = Math.floor(i / 4);
                        return (
                            <m.div
                                key={i}
                                custom={x + y}
                                variants={blockVariants}
                                animate="animate"
                                style={{
                                    backgroundColor: color,
                                    boxShadow: color === 'white' ? '0 0 12px rgba(255,255,255,0.15)' : `0 0 12px ${color}4D`
                                }}
                                className={`
                                    ${isSm ? 'w-[2px] h-[2px]' : (isInline ? 'w-[4px] h-[4px]' : 'w-[6px] h-[6px]')}
                                    rounded-[1.5px]
                                `}
                            />
                        );
                    })}
                </div>

                {showLabel && (
                    <m.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`font-mono uppercase tracking-[0.3em] ${isSm ? 'text-[7px]' : (isInline ? 'text-[8px]' : 'text-[10px] text-white/40')}`}
                        style={{ color: labelColor || (isInline ? color : undefined) }}
                    >
                        {label}
                    </m.p>
                )}
            </div>
        </div>
    );
};
