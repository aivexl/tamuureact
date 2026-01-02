/**
 * COUNTDOWN VARIANTS PRESETS
 * Enterprise-grade countdown timer variant definitions
 * 20 Premium variants with full customization
 * 
 * Based on research from:
 * - @leenguyen/react-flip-clock-countdown
 * - react-countdown-circle-timer
 * - framer-motion animation patterns
 * - Dribbble/Behance wedding countdown designs
 */

import { CountdownConfig, CountdownVariant } from '@/store/layersSlice';

// ============================================
// VARIANT CATEGORY DEFINITIONS
// ============================================

export interface CountdownVariantPreset {
    id: CountdownVariant;
    name: string;
    category: 'classic' | 'flip' | 'box' | 'circle' | 'modern' | 'luxury' | 'unique';
    description: string;
    previewText: string;
    config: Partial<CountdownConfig>;
}

// ============================================
// 20 PREMIUM COUNTDOWN VARIANT PRESETS
// ============================================

export const COUNTDOWN_VARIANT_PRESETS: CountdownVariantPreset[] = [
    // ========== CLASSIC CATEGORY (3) ==========
    {
        id: 'elegant',
        name: 'Elegant',
        category: 'classic',
        description: 'Refined serif typography with gold accents',
        previewText: '00 : 00 : 00',
        config: {
            fontFamily: 'Cormorant Garamond',
            numberFontFamily: 'Cormorant Garamond',
            fontSize: 36,
            fontWeight: 'semibold',
            textColor: '#bfa181',
            accentColor: '#bfa181',
            labelColor: '#888888',
            separatorStyle: 'colon',
            boxShadow: 'none',
            borderStyle: 'none',
            letterSpacing: 4,
        }
    },
    {
        id: 'classic',
        name: 'Classic',
        category: 'classic',
        description: 'Traditional with colon separators',
        previewText: '00 : 00 : 00',
        config: {
            fontFamily: 'DM Serif Display',
            fontSize: 32,
            fontWeight: 'bold',
            textColor: '#ffffff',
            accentColor: '#ffffff',
            labelColor: '#999999',
            separatorStyle: 'colon',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            boxPadding: 12,
        }
    },
    {
        id: 'minimal',
        name: 'Minimal',
        category: 'classic',
        description: 'Clean, no decorations, mono font',
        previewText: '00  00  00',
        config: {
            fontFamily: 'JetBrains Mono',
            numberFontFamily: 'JetBrains Mono',
            fontSize: 28,
            fontWeight: 'medium',
            textColor: 'rgba(255,255,255,0.8)',
            labelColor: 'rgba(255,255,255,0.4)',
            separatorStyle: 'none',
            boxShadow: 'none',
            showSeparators: false,
        }
    },

    // ========== FLIP CATEGORY (3) ==========
    {
        id: 'flip',
        name: 'Flip Clock',
        category: 'flip',
        description: 'Animated flip clock with 3D effect',
        previewText: 'Flip Style',
        config: {
            fontFamily: 'Roboto Mono',
            fontSize: 40,
            fontWeight: 'bold',
            textColor: '#ffffff',
            backgroundColor: '#1a1a1a',
            borderRadius: 8,
            boxPadding: 16,
            boxGap: 8,
            boxShadow: 'medium',
            useFlipAnimation: true,
            use3DEffect: true,
            showReflection: true,
            animationType: 'flip',
        }
    },
    {
        id: 'flip-dark',
        name: 'Flip Dark',
        category: 'flip',
        description: 'Dark theme flip with subtle accents',
        previewText: 'Flip Style',
        config: {
            fontFamily: 'Space Mono',
            fontSize: 38,
            fontWeight: 'bold',
            textColor: '#00ff88',
            backgroundColor: '#0a0a0a',
            accentColor: '#00ff88',
            borderRadius: 6,
            boxPadding: 14,
            boxShadow: 'soft',
            useFlipAnimation: true,
            use3DEffect: true,
            animationType: 'flip',
        }
    },
    {
        id: 'flip-neon',
        name: 'Flip Neon',
        category: 'flip',
        description: 'Cyberpunk-style flip with glow',
        previewText: 'Flip Style',
        config: {
            fontFamily: 'Orbitron',
            fontSize: 36,
            fontWeight: 'black',
            textColor: '#ff00ff',
            backgroundColor: '#0a0014',
            accentColor: '#ff00ff',
            glowColor: '#ff00ff',
            glowIntensity: 80,
            borderRadius: 4,
            boxShadow: 'neon',
            useFlipAnimation: true,
            animationType: 'flip',
        }
    },

    // ========== BOX CATEGORY (4) ==========
    {
        id: 'boxed',
        name: 'Boxed',
        category: 'box',
        description: 'Individual solid boxes for each unit',
        previewText: '00  00  00  00',
        config: {
            fontFamily: 'Inter',
            fontSize: 32,
            fontWeight: 'bold',
            textColor: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 12,
            boxPadding: 20,
            boxGap: 12,
            boxShadow: 'soft',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
        }
    },
    {
        id: 'boxed-gradient',
        name: 'Boxed Gradient',
        category: 'box',
        description: 'Boxes with gradient backgrounds',
        previewText: '00  00  00  00',
        config: {
            fontFamily: 'Poppins',
            fontSize: 34,
            fontWeight: 'bold',
            textColor: '#ffffff',
            gradientFrom: '#667eea',
            gradientTo: '#764ba2',
            gradientAngle: 135,
            borderRadius: 16,
            boxPadding: 20,
            boxGap: 10,
            boxShadow: 'medium',
        }
    },
    {
        id: 'card-glass',
        name: 'Card Glass',
        category: 'box',
        description: 'Glassmorphism transparent cards',
        previewText: '00  00  00  00',
        config: {
            fontFamily: 'SF Pro Display',
            fontSize: 30,
            fontWeight: 'semibold',
            textColor: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            boxPadding: 24,
            boxGap: 16,
            boxShadow: 'soft',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
        }
    },
    {
        id: 'card-solid',
        name: 'Card Solid',
        category: 'box',
        description: 'Solid colored cards with shadows',
        previewText: '00  00  00  00',
        config: {
            fontFamily: 'Montserrat',
            fontSize: 32,
            fontWeight: 'bold',
            textColor: '#1a1a1a',
            backgroundColor: '#ffffff',
            accentColor: '#bfa181',
            borderRadius: 12,
            boxPadding: 18,
            boxGap: 12,
            boxShadow: 'heavy',
        }
    },

    // ========== CIRCLE CATEGORY (3) ==========
    {
        id: 'circle-progress',
        name: 'Circle Progress',
        category: 'circle',
        description: 'Circular progress rings showing remaining time',
        previewText: '○ ○ ○ ○',
        config: {
            fontFamily: 'Outfit',
            fontSize: 24,
            fontWeight: 'bold',
            textColor: '#ffffff',
            progressColor: '#bfa181',
            progressBgColor: 'rgba(255,255,255,0.1)',
            progressWidth: 4,
            showProgressRing: true,
            boxGap: 20,
        }
    },
    {
        id: 'circle-minimal',
        name: 'Circle Minimal',
        category: 'circle',
        description: 'Minimal circles with centered numbers',
        previewText: '○ ○ ○',
        config: {
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 'semibold',
            textColor: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 100,
            boxPadding: 20,
            boxGap: 16,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
        }
    },
    {
        id: 'ring',
        name: 'Ring',
        category: 'circle',
        description: 'Thin ring outlines with numbers',
        previewText: '◯ ◯ ◯ ◯',
        config: {
            fontFamily: 'Space Grotesk',
            fontSize: 26,
            fontWeight: 'medium',
            textColor: '#bfa181',
            accentColor: '#bfa181',
            borderRadius: 100,
            boxPadding: 16,
            boxGap: 14,
            borderStyle: 'solid',
            borderWidth: 2,
            borderColor: '#bfa181',
            boxShadow: 'none',
        }
    },

    // ========== MODERN CATEGORY (3) ==========
    {
        id: 'modern-split',
        name: 'Modern Split',
        category: 'modern',
        description: 'Split design with large numbers and small labels',
        previewText: '00|00|00',
        config: {
            fontFamily: 'Outfit',
            fontSize: 48,
            fontWeight: 'black',
            textColor: '#ffffff',
            labelFontSize: 10,
            labelColor: 'rgba(255,255,255,0.5)',
            separatorStyle: 'line',
            boxGap: 24,
        }
    },
    {
        id: 'neon-glow',
        name: 'Neon Glow',
        category: 'modern',
        description: 'Glowing neon effect',
        previewText: '00 : 00 : 00',
        config: {
            fontFamily: 'Audiowide',
            fontSize: 36,
            fontWeight: 'normal',
            textColor: '#00ffff',
            accentColor: '#00ffff',
            glowColor: '#00ffff',
            glowIntensity: 100,
            backgroundColor: 'transparent',
            boxShadow: 'glow',
        }
    },
    {
        id: 'cyber',
        name: 'Cyber',
        category: 'modern',
        description: 'Futuristic tech/cyberpunk theme',
        previewText: '// 00.00.00',
        config: {
            fontFamily: 'Orbitron',
            fontSize: 28,
            fontWeight: 'bold',
            textColor: '#00ff00',
            accentColor: '#00ff00',
            backgroundColor: 'rgba(0,255,0,0.05)',
            glowColor: '#00ff00',
            glowIntensity: 60,
            separatorStyle: 'dot',
            borderRadius: 4,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: 'rgba(0,255,0,0.3)',
        }
    },

    // ========== LUXURY CATEGORY (3) ==========
    {
        id: 'luxury-gold',
        name: 'Luxury Gold',
        category: 'luxury',
        description: 'Gold gradients with premium fonts',
        previewText: '✦ 00 : 00 : 00 ✦',
        config: {
            fontFamily: 'Playfair Display',
            fontSize: 36,
            fontWeight: 'semibold',
            textColor: '#d4af37',
            accentColor: '#d4af37',
            gradientFrom: '#d4af37',
            gradientTo: '#f5d693',
            labelColor: '#bfa181',
            letterSpacing: 2,
        }
    },
    {
        id: 'luxury-rose',
        name: 'Luxury Rose',
        category: 'luxury',
        description: 'Rose gold elegant theme',
        previewText: '❀ 00 : 00 : 00 ❀',
        config: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 34,
            fontWeight: 'medium',
            textColor: '#e8b4b8',
            accentColor: '#dda0a4',
            gradientFrom: '#e8b4b8',
            gradientTo: '#f5d0d0',
            labelColor: '#c99ea2',
            letterSpacing: 3,
        }
    },
    {
        id: 'wedding-script',
        name: 'Wedding Script',
        category: 'luxury',
        description: 'Elegant script fonts for weddings',
        previewText: '𝟬𝟬 : 𝟬𝟬 : 𝟬𝟬',
        config: {
            fontFamily: 'Great Vibes',
            numberFontFamily: 'Cormorant Garamond',
            fontSize: 40,
            fontWeight: 'normal',
            textColor: '#bfa181',
            accentColor: '#bfa181',
            labelColor: '#999999',
            labelFontSize: 11,
            letterSpacing: 1,
        }
    },

    // ========== UNIQUE CATEGORY (1) ==========
    {
        id: 'typewriter',
        name: 'Typewriter',
        category: 'unique',
        description: 'Typewriter-style monospace with animation',
        previewText: '[00:00:00]',
        config: {
            fontFamily: 'Courier Prime',
            numberFontFamily: 'Courier Prime',
            fontSize: 28,
            fontWeight: 'bold',
            textColor: '#00ff00',
            backgroundColor: '#0a0a0a',
            accentColor: '#00ff00',
            separatorStyle: 'colon',
            borderRadius: 0,
            boxPadding: 12,
            animationType: 'fade',
        }
    },
];

// ============================================
// CATEGORY METADATA
// ============================================

export const COUNTDOWN_CATEGORIES = [
    { id: 'classic', name: 'Classic', icon: '✨', count: 3 },
    { id: 'flip', name: 'Flip Clock', icon: '🔄', count: 3 },
    { id: 'box', name: 'Box & Card', icon: '⬜', count: 4 },
    { id: 'circle', name: 'Circle', icon: '⭕', count: 3 },
    { id: 'modern', name: 'Modern', icon: '💫', count: 3 },
    { id: 'luxury', name: 'Luxury', icon: '👑', count: 3 },
    { id: 'unique', name: 'Unique', icon: '🎯', count: 1 },
] as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getVariantPreset = (variant: CountdownVariant): CountdownVariantPreset | undefined => {
    return COUNTDOWN_VARIANT_PRESETS.find(p => p.id === variant);
};

export const getVariantsByCategory = (category: string): CountdownVariantPreset[] => {
    return COUNTDOWN_VARIANT_PRESETS.filter(p => p.category === category);
};

export const mergeWithPreset = (variant: CountdownVariant, overrides: Partial<CountdownConfig> = {}): Partial<CountdownConfig> => {
    const preset = getVariantPreset(variant);
    return { ...preset?.config, ...overrides };
};
