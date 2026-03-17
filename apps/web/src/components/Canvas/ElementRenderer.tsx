import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Layer } from '../../store/layersSlice';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPWishesElement } from '../RSVPWishes/RSVPWishesElement';
import { NameBoardElement } from '../NameBoard/NameBoardElement';
import { patchLegacyUrl } from '../../lib/utils';
import html2canvas from 'html2canvas';

// ============================================
// PLACEHOLDER COMPONENTS FOR MISSING FILES
// ============================================
const RiveElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, [onContentLoad]);
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center">
            <LucideIcons.Zap className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rive Animation</p>
            <p className="text-[8px] text-indigo-400/60 uppercase mt-1">Coming Soon</p>
        </div>
    );
};

const MapElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, [onContentLoad]);
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
            <LucideIcons.MapPin className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Google Maps</p>
            <p className="text-[8px] text-emerald-400/60 uppercase mt-1">Interactive Map</p>
        </div>
    );
};

// ============================================
// IMAGE ELEMENT
// ============================================
const ImageElement: React.FC<{ 
    layer: Layer, 
    isEditor?: boolean, 
    onContentLoad?: () => void,
    onDimensionsDetected?: (width: number, height: number) => void
}> = ({ layer, isEditor, onContentLoad, onDimensionsDetected }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const getMaskStyle = (): React.CSSProperties => {
        if (!layer.maskType || layer.maskType === 'none') return {};
        
        switch (layer.maskType) {
            case 'circle': return { clipPath: 'circle(50% at 50% 50%)' };
            case 'arch': return { clipPath: 'path("M 0 1 L 0 0.4 A 0.5 0.4 0 0 1 1 0.4 L 1 1 Z")' }; // Simplified SVG path as placeholder for standard arch
            case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
            case 'diamond': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
            case 'blob': return { clipPath: 'url(#blob-mask)' }; // Complex blobs need SVG defs
            default: return {};
        }
    };

    return (
        <div className={`w-full h-full relative ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`} style={getMaskStyle()}>
            <img
                src={patchLegacyUrl(layer.imageUrl)}
                crossOrigin="anonymous"
                alt={layer.name}
                onLoad={(e) => {
                    const img = e.currentTarget;
                    setLoaded(true);
                    onContentLoad?.();
                    // AUTO-RESIZE: Pass dimensions back up for selection box snapping
                    if (isEditor && onDimensionsDetected && img.naturalWidth && img.naturalHeight) {
                        onDimensionsDetected(img.naturalWidth, img.naturalHeight);
                    }
                }}
                onError={() => {
                    setError(true);
                    onContentLoad?.();
                }}
                loading="eager"
                decoding="async"
                className={`w-full h-full object-contain ${isEditor ? (loaded ? 'opacity-100' : 'opacity-0 transition-opacity duration-300') : ''}`}
                draggable={false}
            />
            {isEditor && !loaded && !error && (
                <div className="absolute inset-0 bg-white/5 animate-pulse rounded-lg" />
            )}
        </div>
    );
};

// ============================================
// ICON ELEMENT
// ============================================
const IconElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const style = layer.iconStyle;
    const iconName = style?.iconName || 'heart';
    const pascalCase = iconName.split('-').map((w: string) => w.charAt(0)?.toUpperCase() + w.slice(1)).join('');
    const IconComponent = (LucideIcons as any)[pascalCase] || LucideIcons.Heart;

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <IconComponent className="w-full h-full" color={style?.iconColor || '#bfa181'} />
        </div>
    );
};

// ============================================
// BUTTON ELEMENT
// ============================================
const ButtonElement: React.FC<{ layer: Layer, onOpenInvitation?: () => void, onContentLoad?: () => void }> = ({ layer, onOpenInvitation, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    // Default config if none provided
    const defaultConfig = {
        buttonText: 'Buka Undangan',
        subText: '',
        buttonStyle: 'elegant',
        buttonShape: 'pill',
        buttonColor: '#bfa181',
        textColor: '#0a0a0a',
        showIcon: true
    };

    const config = layer.buttonConfig || layer.openInvitationConfig || defaultConfig;

    const shape = config.buttonShape === 'pill' ? 'rounded-full' : config.buttonShape === 'rounded' ? 'rounded-xl' : 'rounded-lg';

    const getButtonStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            backgroundColor: config.buttonColor || '#bfa181',
            color: config.textColor || '#0a0a0a',
            fontFamily: 'Outfit',
            fontSize: 16
        };

        switch (config.buttonStyle) {
            case 'glass':
                return {
                    ...base,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff'
                };
            case 'minimal':
                return {
                    ...base,
                    backgroundColor: 'transparent',
                    border: `1px solid ${config.buttonColor || '#bfa181'}`,
                    color: config.buttonColor || '#bfa181'
                };
            default:
                return base;
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <button
                onClick={onOpenInvitation}
                style={getButtonStyle()}
                className={`group relative overflow-hidden px-8 py-4 transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl ${shape} flex flex-col items-center justify-center min-w-[200px]`}
            >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="relative z-10 font-black uppercase tracking-[0.2em] text-sm">{config.buttonText}</span>
                {config.subText && (
                    <span className="relative z-10 text-[10px] opacity-60 uppercase tracking-widest mt-1 font-bold">{config.subText}</span>
                )}
            </button>
        </div>
    );
};

// ============================================
// ELEMENT RENDERER
// ============================================
export const ElementRenderer: React.FC<{ 
    layer: Layer, 
    isEditor?: boolean,
    onOpenInvitation?: () => void,
    onContentLoad?: () => void,
    onDimensionsDetected?: (width: number, height: number) => void
}> = ({ layer, isEditor, onOpenInvitation, onContentLoad, onDimensionsDetected }) => {
    switch (layer.type) {
        case 'text':
            return (
                <div 
                    style={{ 
                        color: layer.color,
                        fontSize: layer.fontSize,
                        fontFamily: layer.fontFamily,
                        fontWeight: layer.fontWeight,
                        textAlign: layer.textAlign,
                        lineHeight: layer.lineHeight || 1.2,
                        letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : 'normal',
                        textTransform: layer.textTransform || 'none',
                        whiteSpace: 'pre-wrap',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start'
                    }}
                >
                    {layer.text}
                </div>
            );

        case 'image':
            return <ImageElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} onDimensionsDetected={onDimensionsDetected} />;

        case 'icon':
            return <IconElement layer={layer} onContentLoad={onContentLoad} />;

        case 'button':
        case 'open-invitation':
            return <ButtonElement layer={layer} onOpenInvitation={onOpenInvitation} onContentLoad={onContentLoad} />;

        case 'rive':
            return <RiveElement layer={layer} onContentLoad={onContentLoad} />;

        case 'rsvp-wishes':
            return <RSVPWishesElement layer={layer} onContentLoad={onContentLoad} />;

        case 'name-board':
            return <NameBoardElement layer={layer} onContentLoad={onContentLoad} />;

        case 'map':
            return <MapElement layer={layer} onContentLoad={onContentLoad} />;

        default:
            return <div className="w-full h-full flex items-center justify-center bg-white/5 border border-white/10 rounded text-[10px] text-white/20 uppercase font-black">{layer.type}</div>;
    }
};
