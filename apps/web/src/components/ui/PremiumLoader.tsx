import React from 'react';
import { m } from 'framer-motion';

/**
 * PremiumLoader - The Monolith Edition
 * 
 * A world-class, ultra-minimalist loading sequence designed for 
 * Fortune 500 / Unicorn Startup aesthetics. Zero noise, absolute precision.
 * 
 * @version 2.0.0
 * @author Tamuu Architecture Team
 */
export const PremiumLoader: React.FC = () => {
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

    return (
        <div className="fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center select-none overflow-hidden">
            {/* 
                Subtle Volumetric Background Light
                Designed to provide depth without distracting from the core element.
            */}
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

            {/* 
                The Core Grid Matrix
                Reduced scale by 50% for high-density elegance.
                Using a 4x4 grid with optimized proportions.
            */}
            <div className="relative">
                <div className="grid grid-cols-4 gap-2.5 p-2">
                    {[...Array(16)].map((_, i) => {
                        const x = i % 4;
                        const y = Math.floor(i / 4);
                        return (
                            <m.div
                                key={i}
                                custom={x + y}
                                variants={blockVariants}
                                animate="animate"
                                className="w-[6px] h-[6px] rounded-[1.5px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
