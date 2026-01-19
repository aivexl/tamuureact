import React from 'react';
import { m } from 'framer-motion';

/**
 * PremiumLoader - The Monolith Edition v3.0
 * 
 * A world-class, ultra-minimalist loading sequence designed for 
 * Fortune 500 / Unicorn Startup aesthetics.
 * 
 * Supports:
 * - Fullscreen Overlay (Page transitions)
 * - Inline (Inside buttons/cards)
 * - Custom Scale & Proportions
 */

interface PremiumLoaderProps {
    variant?: 'full' | 'inline' | 'skeleton';
    showLabel?: boolean;
    label?: string;
    className?: string;
    color?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
    variant = 'full',
    showLabel = false,
    label = 'Memuat...',
    className = '',
    color = 'white'
}) => {
    // Advanced staggered timing for the diagonal wave
    const blockVariants = {
        animate: (i: number) => ({
            opacity: [0.15, 1, 0.15],
            scale: [0.85, 1, 0.85],
            transition: {
                duration: 2,
                repeat: Infinity,
                delay: i * 0.12,
                ease: [0.45, 0, 0.55, 1] // Custom organic ease-in-out
            }
        })
    };

    const isInline = variant === 'inline';

    return (
        <div className={`
            ${variant === 'full' ? 'fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center' : 'inline-flex items-center justify-center'}
            select-none overflow-hidden ${className}
        `}>
            {variant === 'full' && (
                <m.div
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-[600px] h-[600px] bg-white/[0.03] blur-[150px] rounded-full"
                />
            )}

            <div className="flex flex-col items-center gap-6 relative">
                <div className={`grid grid-cols-4 ${isInline ? 'gap-1' : 'gap-2.5'} p-2`}>
                    {[...Array(16)].map((_, i) => {
                        const x = i % 4;
                        const y = Math.floor(i / 4);
                        return (
                            <m.div
                                key={i}
                                custom={x + y}
                                variants={blockVariants}
                                animate="animate"
                                style={{ backgroundColor: color }}
                                className={`
                                    ${isInline ? 'w-[4px] h-[4px] rounded-[1px]' : 'w-[6px] h-[6px] rounded-[1.5px]'}
                                    shadow-[0_0_12px_rgba(255,255,255,0.15)]
                                `}
                            />
                        );
                    })}
                </div>

                {showLabel && variant === 'full' && (
                    <m.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-[0.4em]"
                    >
                        {label}
                    </m.p>
                )}
            </div>
        </div>
    );
};
