"use client";

import React from 'react';

/**
 * PremiumLoader - Terminal Edition v4.0
 * 
 * Snake pattern loader - same as terminal loading indicator.
 * CSS-only version for Cloudflare Workers compatibility.
 */

interface PremiumLoaderProps {
    variant?: 'full' | 'inline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    color?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
    variant = 'full',
    size = 'md',
    className = '',
    color = 'white'
}) => {
    // S-Pattern / Snake sequence for 4x4 grid (16 dots)
    // Snake path: 0→1→2→3→7→11→15→14→13→12→8→4→5→6→10→9
    const snakeIndices = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 5, 6, 10, 9];

    // Map index to its position in the snake sequence (0-15)
    const sequenceMap = new Array(16).fill(0);
    snakeIndices.forEach((gridIndex, seqIndex) => {
        sequenceMap[gridIndex] = seqIndex;
    });

    const isInline = variant === 'inline';
    const isSm = size === 'sm';

    // Generate CSS keyframes for snake animation
    const generateKeyframes = () => {
        let css = `
            @keyframes loader-snake {
                0%, 100% { opacity: 0.1; }
                50% { opacity: 1; }
            }
        `;
        
        // Generate animation classes for each snake position (0-15)
        for (let i = 0; i <= 15; i++) {
            const delay = i * 0.08;
            css += `
                .loader-snake-${i} {
                    animation: loader-snake 1.5s infinite ${delay}s linear;
                }
            `;
        }
        
        return css;
    };

    return (
        <>
            <style>{generateKeyframes()}</style>
            <div className={`
                ${variant === 'full' ? 'fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center' : 'inline-flex items-center justify-center'}
                select-none overflow-hidden ${className}
            `}>
                <div className={`flex flex-col items-center ${isInline ? (isSm ? 'gap-1.5' : 'gap-3') : 'gap-6'} relative`}>
                    <div className={`grid grid-cols-4 ${isSm ? 'gap-[1.5px]' : (isInline ? 'gap-1' : 'gap-1.5')} ${isSm ? 'p-0.5' : 'p-1'}`}>
                        {[...Array(16)].map((_, i) => {
                            const seqIndex = sequenceMap[i];
                            return (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: color,
                                    }}
                                    className={`
                                        ${isSm ? 'w-[2px] h-[2px]' : (isInline ? 'w-[3px] h-[3px]' : 'w-[4px] h-[4px]')}
                                        rounded-none
                                        loader-snake-${seqIndex}
                                    `}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};
