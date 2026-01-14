/**
 * NAME BOARD ELEMENT COMPONENT
 * Display boards for guest names on welcome displays
 * 
 * Features:
 * - 27 premium design variants
 * - Customizable fonts, colors, borders
 * - Glass morphism effects
 * - Gradient backgrounds
 * - Shadow effects
 */

import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Layer } from '@/store/layersSlice';
import { useStore } from '@/store/useStore';

// ============================================
// TYPES
// ============================================
interface NameBoardElementProps {
    layer: Layer;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

export interface NameBoardConfig {
    variant: number;
    displayText: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    shadowEnabled: boolean;
    gradientEnabled: boolean;
    gradientStart: string;
    gradientEnd: string;
}

// ============================================
// VARIANT PRESETS
// ============================================
export const NAME_BOARD_VARIANTS = [
    // CLASSIC (1-5)
    { id: 1, name: 'Classic Elegant', category: 'classic', bgColor: '#1a1a2e', textColor: '#f8f9fa', borderColor: '#4a4a6a' },
    { id: 2, name: 'Classic Light', category: 'classic', bgColor: '#ffffff', textColor: '#2d3436', borderColor: '#dfe6e9' },
    { id: 3, name: 'Classic Gold', category: 'classic', bgColor: '#0a0a0a', textColor: '#d4af37', borderColor: '#d4af37' },
    { id: 4, name: 'Classic Rose', category: 'classic', bgColor: '#fff5f5', textColor: '#c53030', borderColor: '#feb2b2' },
    { id: 5, name: 'Classic Navy', category: 'classic', bgColor: '#1a365d', textColor: '#ffffff', borderColor: '#2c5282' },

    // GLASS (6-10)
    { id: 6, name: 'Frosted Glass', category: 'glass', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' },
    { id: 7, name: 'Dark Glass', category: 'glass', bgColor: 'rgba(0,0,0,0.3)', textColor: '#ffffff', borderColor: 'rgba(255,255,255,0.1)' },
    { id: 8, name: 'Blue Glass', category: 'glass', bgColor: 'rgba(59,130,246,0.2)', textColor: '#ffffff', borderColor: 'rgba(59,130,246,0.4)' },
    { id: 9, name: 'Purple Glass', category: 'glass', bgColor: 'rgba(139,92,246,0.2)', textColor: '#ffffff', borderColor: 'rgba(139,92,246,0.4)' },
    { id: 10, name: 'Rose Glass', category: 'glass', bgColor: 'rgba(244,63,94,0.15)', textColor: '#ffffff', borderColor: 'rgba(244,63,94,0.3)' },

    // NEON (11-15)
    { id: 11, name: 'Neon Cyan', category: 'neon', bgColor: '#0a0a0a', textColor: '#00ffff', borderColor: '#00ffff' },
    { id: 12, name: 'Neon Pink', category: 'neon', bgColor: '#0a0a0a', textColor: '#ff00ff', borderColor: '#ff00ff' },
    { id: 13, name: 'Neon Green', category: 'neon', bgColor: '#0a0a0a', textColor: '#00ff00', borderColor: '#00ff00' },
    { id: 14, name: 'Neon Orange', category: 'neon', bgColor: '#0a0a0a', textColor: '#ff6600', borderColor: '#ff6600' },
    { id: 15, name: 'Neon Blue', category: 'neon', bgColor: '#0a0a0a', textColor: '#0066ff', borderColor: '#0066ff' },

    // BADGE (16-20)
    { id: 16, name: 'VIP Badge', category: 'badge', bgColor: 'linear-gradient(135deg, #d4af37, #f4e4a6)', textColor: '#1a1a1a', borderColor: '#d4af37' },
    { id: 17, name: 'Premium Badge', category: 'badge', bgColor: 'linear-gradient(135deg, #667eea, #764ba2)', textColor: '#ffffff', borderColor: '#764ba2' },
    { id: 18, name: 'Royal Badge', category: 'badge', bgColor: 'linear-gradient(135deg, #1a1a2e, #4a4a6a)', textColor: '#d4af37', borderColor: '#d4af37' },
    { id: 19, name: 'Coral Badge', category: 'badge', bgColor: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)', textColor: '#ffffff', borderColor: '#ffffff' },
    { id: 20, name: 'Ocean Badge', category: 'badge', bgColor: 'linear-gradient(135deg, #4facfe, #00f2fe)', textColor: '#ffffff', borderColor: '#ffffff' },

    // LUXURY (21-24)
    { id: 21, name: 'Black Tie', category: 'luxury', bgColor: '#000000', textColor: '#d4af37', borderColor: '#d4af37' },
    { id: 22, name: 'Champagne', category: 'luxury', bgColor: '#f5f5dc', textColor: '#8b7355', borderColor: '#d4af37' },
    { id: 23, name: 'Velvet Red', category: 'luxury', bgColor: '#800020', textColor: '#ffd700', borderColor: '#ffd700' },
    { id: 24, name: 'Midnight Sparkle', category: 'luxury', bgColor: '#0c0c1e', textColor: '#e8e8e8', borderColor: '#4a4a6a' },

    // MINIMAL (25-27)
    { id: 25, name: 'Pure White', category: 'minimal', bgColor: '#ffffff', textColor: '#000000', borderColor: 'transparent' },
    { id: 26, name: 'Pure Black', category: 'minimal', bgColor: '#000000', textColor: '#ffffff', borderColor: 'transparent' },
    { id: 27, name: 'Soft Gray', category: 'minimal', bgColor: '#f0f0f0', textColor: '#333333', borderColor: 'transparent' },
];

export const getDefaultConfig = (): NameBoardConfig => ({
    variant: 1,
    displayText: 'Guest Name',
    fontFamily: 'Playfair Display',
    fontSize: 48,
    textColor: '#f8f9fa',
    backgroundColor: '#1a1a2e',
    borderColor: '#4a4a6a',
    borderWidth: 2,
    borderRadius: 16,
    shadowEnabled: true,
    gradientEnabled: false,
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
});

// ============================================
// MAIN COMPONENT
// ============================================
export const NameBoardElement: React.FC<NameBoardElementProps> = ({ layer, isEditor, onContentLoad }) => {
    const config: NameBoardConfig = {
        ...getDefaultConfig(),
        ...layer.nameBoardConfig
    };

    // Get greetingName from store for dynamic display
    const greetingName = useStore(state => state.greetingName);

    useEffect(() => {
        onContentLoad?.();
    }, []);

    // Determine displayed name: 
    // - In editor: always show config.displayText
    // - In preview/runtime: show greetingName IF triggered, otherwise show nothing or generic "Welcome"
    // IMPROVEMENT: Logic to avoid showing "Guest Name" placeholder in the actual event
    const displayedName = isEditor ? config.displayText : greetingName;
    const hasName = !!displayedName;

    const variant = NAME_BOARD_VARIANTS.find(v => v.id === config.variant) || NAME_BOARD_VARIANTS[0];

    // Determine background style
    const getBackgroundStyle = (): React.CSSProperties => {
        if (config.gradientEnabled) {
            return {
                background: `linear-gradient(135deg, ${config.gradientStart}, ${config.gradientEnd})`,
            };
        }

        const bgColor = config.backgroundColor || variant.bgColor;
        if (bgColor.startsWith('linear-gradient')) {
            return { background: bgColor };
        }
        return { backgroundColor: bgColor };
    };

    // Shadow styles based on variant category
    const getShadowStyle = (): React.CSSProperties => {
        if (!config.shadowEnabled) return {};

        switch (variant.category) {
            case 'neon':
                return {
                    boxShadow: `0 0 20px ${config.textColor || variant.textColor}, 0 0 40px ${config.textColor || variant.textColor}40, inset 0 0 20px ${config.textColor || variant.textColor}20`,
                };
            case 'glass':
                return {
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                };
            case 'luxury':
                return {
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                };
            case 'badge':
                return {
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                };
            default:
                return {
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                };
        }
    };

    // Glass effect for glass variants
    const getGlassEffect = (): React.CSSProperties => {
        if (variant.category !== 'glass') return {};
        return {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        };
    };

    // Text glow for neon variants
    const getTextStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
            color: config.textColor || variant.textColor,
            fontWeight: 700,
            letterSpacing: variant.category === 'luxury' ? '0.15em' : '0.05em',
            textTransform: variant.category === 'luxury' ? 'uppercase' : 'none',
        };

        if (variant.category === 'neon') {
            baseStyle.textShadow = `0 0 10px ${config.textColor || variant.textColor}, 0 0 20px ${config.textColor || variant.textColor}, 0 0 40px ${config.textColor || variant.textColor}`;
        }

        if (variant.category === 'luxury') {
            baseStyle.background = `linear-gradient(135deg, ${config.textColor || variant.textColor}, ${config.borderColor || variant.borderColor})`;
            baseStyle.WebkitBackgroundClip = 'text';
            baseStyle.WebkitTextFillColor = 'transparent';
            baseStyle.backgroundClip = 'text';
        }

        return baseStyle;
    };

    return (
        <m.div
            initial={isEditor ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full h-full flex items-center justify-center p-4 transition-all duration-300"
            style={{
                ...getBackgroundStyle(),
                ...getShadowStyle(),
                ...getGlassEffect(),
                borderWidth: config.borderWidth,
                borderStyle: config.borderWidth > 0 ? 'solid' : 'none',
                borderColor: config.borderColor || variant.borderColor,
                borderRadius: config.borderRadius,
            }}
        >
            <AnimatePresence mode="wait">
                <m.div
                    key={displayedName || 'empty'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-center leading-tight"
                    style={getTextStyle()}
                >
                    {displayedName}
                </m.div>
            </AnimatePresence>

            {/* Editor indicator */}
            {isEditor && (
                <div className="absolute bottom-2 right-2 text-[8px] font-bold text-white/30 uppercase tracking-wider">
                    Name Board
                </div>
            )}
        </m.div>
    );
};

export default NameBoardElement;
