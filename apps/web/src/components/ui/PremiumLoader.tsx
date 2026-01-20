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
    showLabel?: boolean;
    label?: string;
    className?: string;
    color?: string;
    labelColor?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
    variant = 'full',
    showLabel = false,
    label = 'Memuat...',
    className = '',
    color = 'white',
    labelColor
}) => {
    // S-Pattern / Snake sequence for a 4x4 grid (16 dots)
    // 0  1  2  3
    // 4  5  6  7
    // 8  9  10 11
    // 12 13 14 15
    const snakeIndices = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 6, 10, 9];

    // Map index to its position in the snake sequence
    const sequenceMap = new Array(16).fill(0);
    snakeIndices.forEach((gridIndex, seqIndex) => {
        sequenceMap[gridIndex] = seqIndex;
    });

    const blockVariants = {
        animate: (seqIndex: number) => ({
            opacity: [0.1, 1, 0.1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                delay: seqIndex * 0.08,
                ease: "linear"
            }
        })
    };

    const isInline = variant === 'inline';

    return (
        <div className={`
            ${variant === 'full' ? 'fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center' : 'inline-flex items-center justify-center'}
            select-none overflow-hidden ${className}
        `}>
            <div className={`flex flex-col items-center ${isInline ? 'gap-3' : 'gap-6'} relative`}>
                <div className={`grid grid-cols-4 ${isInline ? 'gap-1' : 'gap-1.5'} p-1`}>
                    {[...Array(16)].map((_, i) => (
                        <m.div
                            key={i}
                            custom={sequenceMap[i]}
                            variants={blockVariants}
                            animate="animate"
                            style={{ backgroundColor: color }}
                            className={`
                                ${isInline ? 'w-[3px] h-[3px]' : 'w-[4px] h-[4px]'}
                                rounded-none
                            `}
                        />
                    ))}
                </div>

                {showLabel && (
                    <m.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`font-mono uppercase tracking-[0.3em] ${isInline ? 'text-[8px]' : 'text-[9px] text-white/30'}`}
                        style={{ color: labelColor || (isInline ? color : undefined) }}
                    >
                        {label}
                    </m.p>
                )}
            </div>
        </div>
    );
};
