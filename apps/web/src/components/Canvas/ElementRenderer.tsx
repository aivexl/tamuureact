import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { patchLegacyUrl } from '@/lib/utils';
import { Layer } from '@/store/layersSlice';
import { X, Upload, Play, MailOpen, MapPin, Clock, ExternalLink, MessageSquare, Heart, Star, Image as ImageIcon, Users, Share2, Film } from 'lucide-react';
import Lottie from 'lottie-react';
import * as LucideIcons from 'lucide-react';
import { shapePaths } from '@/lib/shape-paths';
import { RSVPWishesElement } from '@/components/RSVPWishes';
import { CountdownElement } from '@/components/Countdown';
import { NameBoardElement } from '@/components/NameBoard';
import {
    ParticlesElement,
    DigitalGiftElement,
    MusicPlayerElement,
    QRCodeElement,
    AtmosphericVectorElement,
    GlassCardElement,
    SocialMockupElement,
    WeatherElement,
    MarqueeElement,
    TiltCardElement,
    CalendarSyncElement,
    DirectionsHubElement,
    ShareContextElement,
    GiftAddressElement,
    LoveStoryElement,
    LiveStreamingElement,
    QuoteElement,
    ProfileCardElement,
    ProfilePhotoElement
} from '@/components/Elements';


// ============================================
// ELEMENT RENDERER
// ============================================

interface ElementRendererProps {
    layer: Layer;
    onOpenInvitation?: () => void;
    isEditor?: boolean;
    invitationId?: string;
    onContentLoad?: () => void;
    onDimensionsDetected?: (width: number, height: number) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ layer, onOpenInvitation, isEditor, invitationId, onContentLoad, onDimensionsDetected }) => {
    // SAFETY CHECK: If width or height is clearly corrupted (> 800px), we constrain the display container
    const isExploded = layer.width > 800 || layer.height > 800;

    const renderContent = () => {
        switch (layer.type) {
            case 'text':
                return <TextElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} onDimensionsDetected={onDimensionsDetected} />;
            case 'image':
            case 'gif':
            case 'sticker':
                return <ImageElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} onDimensionsDetected={onDimensionsDetected} />;
            case 'icon':
                return <IconElement layer={layer} onContentLoad={onContentLoad} />;
            case 'button':
            case 'open_invitation_button':
                return <ButtonElement layer={layer} onOpenInvitation={onOpenInvitation} onContentLoad={onContentLoad} />;
            case 'shape':
                return <ShapeElement layer={layer} onContentLoad={onContentLoad} />;
            case 'countdown':
                return <CountdownElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'lottie':
                return <LottieElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'maps_point':
                return <MapsElement layer={layer} onContentLoad={onContentLoad} />;
            case 'video':
                return <VideoElement layer={layer} onContentLoad={onContentLoad} />;
            case 'rsvp_form':
                return <RSVPFormElement layer={layer} onContentLoad={onContentLoad} />;
            case 'guest_wishes':
                return <GuestWishesElement layer={layer} onContentLoad={onContentLoad} />;
            case 'rsvp_wishes':
                return <RSVPWishesElement layer={layer} isEditor={isEditor} invitationId={invitationId} onContentLoad={onContentLoad} onDimensionsDetected={onDimensionsDetected} />;
            case 'flying_bird':
                return <FlyingBirdElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'photo_grid':
                return <PhotoGridElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'photo_frame':
                return <PhotoFrameElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;

            // ENTERPRISE V3 ELEMENTS
            case 'confetti':
            case 'fireworks':
            case 'bubbles':
            case 'snow':
                return <ParticlesElement layer={layer} onContentLoad={onContentLoad} />;
            case 'digital_gift':
                return <DigitalGiftElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'gift_address':
                return <GiftAddressElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'love_story':
                return <LoveStoryElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'live_streaming':
                return <LiveStreamingElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'music_player':
                return <MusicPlayerElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'qr_code':
                return <QRCodeElement layer={layer} onContentLoad={onContentLoad} />;
            case 'svg_wave':
            case 'generative_blob':
                return <AtmosphericVectorElement layer={layer} onContentLoad={onContentLoad} />;
            case 'glass_card':
                return <GlassCardElement layer={layer} onContentLoad={onContentLoad} />;
            case 'social_mockup':
                return <SocialMockupElement layer={layer} onContentLoad={onContentLoad} />;
            case 'weather_widget':
                return <WeatherElement layer={layer} onContentLoad={onContentLoad} />;
            case 'infinite_marquee':
                return <MarqueeElement layer={layer} onContentLoad={onContentLoad} />;
            case 'tilt_card':
                return <TiltCardElement layer={layer} onContentLoad={onContentLoad} />;
            case 'calendar_sync':
                return <CalendarSyncElement layer={layer} onContentLoad={onContentLoad} />;
            case 'directions_hub':
                return <DirectionsHubElement layer={layer} onContentLoad={onContentLoad} />;
            case 'share_context':
                return <ShareContextElement layer={layer} onContentLoad={onContentLoad} />;
            case 'interaction':
                return <InteractionElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'name_board':
                return <NameBoardElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'quote':
                return <QuoteElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'profile_card':
                return <ProfileCardElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
            case 'profile_photo':
                return <ProfilePhotoElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;

            default:
                return <PlaceholderElement layer={layer} onContentLoad={onContentLoad} />;
        }
    };

    const getFilters = () => {
        const f = layer.filters;
        if (!f) return 'none';
        const parts = [];
        if (f.brightness !== undefined) parts.push(`brightness(${f.brightness}%)`);
        if (f.contrast !== undefined) parts.push(`contrast(${f.contrast}%)`);
        if (f.blur !== undefined) parts.push(`blur(${f.blur}px)`);
        if (f.sepia !== undefined) parts.push(`sepia(${f.sepia}%)`);
        if (f.grayscale !== undefined) parts.push(`grayscale(${f.grayscale}%)`);
        if (f.hueRotate !== undefined) parts.push(`hue-rotate(${f.hueRotate}deg)`);
        if (f.saturate !== undefined) parts.push(`saturate(${f.saturate}%)`);
        if (f.invert !== undefined) parts.push(`invert(${f.invert}%)`);
        return parts.length > 0 ? parts.join(' ') : 'none';
    };

    const getStyling = (): React.CSSProperties => {
        const s: React.CSSProperties = {};
        if (layer.borderRadius !== undefined) s.borderRadius = `${layer.borderRadius}px`;
        if (layer.borderWidth !== undefined) {
            s.borderWidth = `${layer.borderWidth}px`;
            s.borderStyle = layer.borderStyle || 'solid';
            s.borderColor = layer.borderColor || '#ffffff';
        }
        if (layer.shadow) {
            const sh = layer.shadow;
            s.filter = `${s.filter || ''} drop-shadow(${sh.x}px ${sh.y}px ${sh.blur}px ${sh.color})`.trim();
        }
        return s;
    };

    return (
        <div
            className="w-full h-full relative"
            style={{
                filter: getFilters(),
                ...getStyling(),
                ...(isExploded ? {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                } : {})
            }}
        >
            {renderContent()}
        </div>
    );
};


// ============================================
// TEXT ELEMENT V2 (PERFECT-FIT ALGORITHM)
// ============================================
const TextElement: React.FC<{ 
    layer: Layer, 
    isEditor?: boolean,
    onContentLoad?: () => void, 
    onDimensionsDetected?: (w: number, h: number) => void 
}> = ({ layer, isEditor, onContentLoad, onDimensionsDetected }) => {
    const textRef = useRef<HTMLDivElement>(null);
    const lastSyncRef = useRef<{ w: number, h: number }>({ w: 0, h: 0 });
    const updateLayer = useStore(state => state.updateLayer);
    const { content, textStyle, curvedTextConfig, id, width, height } = layer;

    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    // PERFECT-FIT ALGORITHM: Imperatively sync Konva box to real DOM text dimensions.
    useLayoutEffect(() => {
        if (!isEditor || !textRef.current) return;

        // 1. Measure the physical footprint of the text.
        const rect = textRef.current.getBoundingClientRect();
        const measuredW = Math.ceil(rect.width);
        const measuredH = Math.ceil(rect.height);

        // 2. STABILITY GUARD: Prevent Infinite Loops (Error #185)
        // Check against store and local lock. Only update if change is significant (> 1px).
        const diffW = Math.abs(measuredW - width);
        const diffH = Math.abs(measuredH - height);
        const hasChangedLocally = measuredW !== lastSyncRef.current.w || measuredH !== lastSyncRef.current.h;

        if (hasChangedLocally && (diffW > 1 || diffH > 1)) {
            // Update local lock immediately
            lastSyncRef.current = { w: measuredW, h: measuredH };
            
            // Notify layout engine
            onDimensionsDetected?.(measuredW, measuredH);
            
            // Sync to store
            updateLayer(id, { width: measuredW, height: measuredH });
        }

    }, [content, textStyle, isEditor, id, onDimensionsDetected, updateLayer]); // REMOVED width/height from dependencies to stop the loop

    if (curvedTextConfig?.enabled) {
        const radius = curvedTextConfig.radius || 100;
        const curvedWidth = width || 200;
        const curvedHeight = height || 200;
        const centerX = curvedWidth / 2;
        const centerY = curvedHeight / 2;

        return (
            <svg
                ref={textRef as any} // SVG ref for layout effect measurement
                viewBox={`0 0 ${curvedWidth} ${curvedHeight}`}
                className="w-full h-full overflow-visible"
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
            >
                <defs>
                    <path
                        id={`curved-path-${id}`}
                        d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 1 ${curvedTextConfig.reverse ? 0 : 1} ${centerX + radius},${centerY}`}
                    />
                </defs>
                <text
                    fill={textStyle?.color || '#ffffff'}
                    style={{
                        fontFamily: textStyle?.fontFamily || 'Outfit',
                        fontSize: `${textStyle?.fontSize || 24}px`,
                        fontWeight: textStyle?.fontWeight || 'normal',
                        fontStyle: textStyle?.fontStyle || 'normal',
                        letterSpacing: `${curvedTextConfig.spacing || 0}px`
                    }}
                >
                    <textPath xlinkHref={`#curved-path-${id}`} startOffset="50%" textAnchor="middle">
                        {content || 'Text'}
                    </textPath>
                </text>
            </svg>
        );
    }

    const hasNewlines = content?.includes('\n') || false;

    return (
        <div
            ref={textRef}
            className="flex items-center justify-center select-none"
            style={{
                // Use layer dimensions for layout, let content overflow for measurement.
                width: isEditor ? 'fit-content' : '100%',
                height: isEditor ? 'fit-content' : '100%',
                minWidth: isEditor ? '1px' : 'auto', // Prevents collapse when empty
                fontFamily: textStyle?.fontFamily || 'Outfit',
                fontSize: `${textStyle?.fontSize || 24}px`,
                fontWeight: textStyle?.fontWeight || 'normal',
                fontStyle: textStyle?.fontStyle || 'normal',
                textAlign: textStyle?.textAlign || 'center',
                color: textStyle?.color || '#ffffff',
                textDecoration: textStyle?.textDecoration || 'none',
                lineHeight: textStyle?.lineHeight || 1.2,
                letterSpacing: `${textStyle?.letterSpacing || 0}px`,
                whiteSpace: hasNewlines ? 'pre-wrap' : 'nowrap', // Allow wrapping for multiline
                overflow: 'visible', // CRITICAL: Let content size be measurable
                padding: 0, // CRITICAL: Ensure zero padding for precise measurement
                boxSizing: 'content-box' // CRITICAL: Measurements based on content only
            }}
        >
            {content || (isEditor ? '' : 'Text')} 
        </div>
    );
};

// ============================================
// IMAGE ELEMENT
// ============================================
const ImageElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void, onDimensionsDetected?: (width: number, height: number) => void }> = ({ layer, isEditor, onContentLoad, onDimensionsDetected }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoaded(false);
        setError(false);
        if (!isEditor) {
            // Safety timeout
            const timer = setTimeout(() => {
                setLoaded(true);
                onContentLoad?.();
            }, 3000); // Increased timeout to give it a chance
            return () => clearTimeout(timer);
        } else {
            // In editor, load immediately (or simulated)
            const timer = setTimeout(() => setLoaded(true), 500);
            return () => clearTimeout(timer);
        }
    }, [layer.imageUrl, isEditor, onContentLoad]);

    if (!layer.imageUrl) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-white/10 gap-2">
                <Upload className="w-6 h-6 text-white/20" />
                <span className="text-white/30 text-xs">Click to upload</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full bg-red-500/10 rounded-lg flex flex-col items-center justify-center border border-red-500/20 gap-2">
                <X className="w-6 h-6 text-red-400/50" />
                <span className="text-red-400/50 text-xs">Failed to load</span>
            </div>
        );
    }

    // Feature 3: Masking logic
    const mask = layer.maskConfig;
    const getMaskStyle = () => {
        if (!mask?.enabled) return {};
        switch (mask.type) {
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
    const pascalCase = iconName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
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
                    border: `2px solid ${config.buttonColor || '#bfa181'}`,
                    color: config.buttonColor || '#bfa181'
                };
            case 'luxury':
                return {
                    ...base,
                    background: `linear-gradient(135deg, ${config.buttonColor || '#bfa181'}, #d4af37)`,
                    boxShadow: '0 4px 20px rgba(191, 161, 129, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)'
                };
            case 'modern':
                return {
                    ...base,
                    backgroundColor: config.buttonColor || '#0a0a0a',
                    color: config.textColor || '#ffffff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                };
            default:
                return base;
        }
    };

    return (
        <m.button
            onClick={(e) => {
                e.stopPropagation();
                onOpenInvitation?.();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full h-full flex flex-col items-center justify-center gap-1 font-bold transition-all ${shape}`}
            style={getButtonStyle()}
        >
            <div className="flex items-center gap-2">
                {config.showIcon !== false && <MailOpen className="w-5 h-5" />}
                <span>{config.buttonText || 'Buka Undangan'}</span>
            </div>
            {config.subText && (
                <span className="text-xs opacity-70 font-normal">{config.subText}</span>
            )}
        </m.button>
    );
};

// ============================================
// SHAPE ELEMENT
// ============================================
const ShapeElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.shapeConfig;
    if (!config) return null;
    const shapeType = config.shapeType || 'rectangle';

    // CTO Logic: Generate Style based on Enterprise Requirements
    const getShapeStyle = (): React.CSSProperties => {
        const style: React.CSSProperties = {
            width: '100%',
            height: '100%',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        };

        // 1. Handling Organic Blobs (Squircle / Custom Border Radius)
        if (shapeType === 'blob' && config.blobConfig?.borderRadius) {
            style.borderRadius = config.blobConfig.borderRadius;
        }

        // 2. Handling Glassmorphism
        if (config.styleType === 'glass') {
            style.backdropFilter = `blur(${config.glassBlur || 20}px)`;
            style.backgroundColor = `rgba(255, 255, 255, ${config.glassOpacity || 0.1})`;
            style.border = `${config.strokeWidth || 1}px solid ${config.stroke || 'rgba(255, 255, 255, 0.2)'}`;
            if (shapeType === 'circle') style.borderRadius = '50%';
        }

        // 3. Handling Mesh Gradients
        else if (config.styleType === 'mesh' && config.meshColors && config.meshColors.length > 0) {
            const colors = config.meshColors;
            const gradients = [
                `radial-gradient(at 0% 0%, ${colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 50% 0%, ${colors[1] || colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 100% 0%, ${colors[2] || colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 0% 50%, ${colors[3] || colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 100% 50%, ${colors[4] || colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 0% 100%, ${colors[5] || colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 50% 100%, ${colors[6] || colors[0]} 0, transparent 50%)`,
                `radial-gradient(at 100% 100%, ${colors[7] || colors[0]} 0, transparent 50%)`
            ];
            style.backgroundImage = gradients.join(', ');
            style.backgroundColor = colors[0]; // Fallback
        }

        return style;
    };

    // If it's a "Path" based shape or SVG based, we use the SVG renderer
    const useSvg = !['blob', 'glass'].includes(shapeType) && config.styleType !== 'mesh' && config.styleType !== 'glass';

    if (!useSvg) {
        return (
            <div
                className="w-full h-full overflow-hidden"
                style={getShapeStyle()}
            />
        );
    }

    return (
        <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox={shapeType.includes('rectangle') ? `0 0 ${layer.width} ${layer.height}` : '0 0 100 100'} preserveAspectRatio="none" className="overflow-visible">
                {shapeType === 'rectangle' && (
                    <rect x="0" y="0" width="100%" height="100%"
                        fill={config.fill || '#bfa181'}
                        stroke={config.stroke || undefined}
                        strokeWidth={config.strokeWidth}
                    />
                )}
                {shapeType === 'rounded-rectangle' && (
                    <rect x="0" y="0" width="100%" height="100%"
                        rx={config.cornerRadius || 20}
                        fill={config.fill || '#bfa181'}
                        stroke={config.stroke || undefined}
                        strokeWidth={config.strokeWidth}
                    />
                )}
                {shapeType === 'circle' && (
                    <circle cx="50" cy="50" r="48"
                        fill={config.fill || '#bfa181'}
                        stroke={config.stroke || undefined}
                        strokeWidth={config.strokeWidth}
                    />
                )}
                {!['rectangle', 'rounded-rectangle', 'circle'].includes(shapeType) && (
                    <path
                        d={shapePaths[shapeType] || config.pathData || ''}
                        fill={config.fill || '#bfa181'}
                        stroke={config.stroke || undefined}
                        strokeWidth={config.strokeWidth}
                        vectorEffect="non-scaling-stroke"
                    />
                )}
            </svg>
        </div>
    );
};

// CountdownElement is now imported from @/components/Countdown

// ============================================
// LOTTIE ELEMENT
// ============================================
const LottieElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const playhead = useStore(state => state.playhead);
    const isPlaying = useStore(state => state.isPlaying);
    const resetNonce = useStore(state => state.resetNonce);

    const config = layer.lottieConfig;
    const [data, setData] = useState<any>(null);
    const lottieRef = useRef<any>(null);

    useEffect(() => {
        if (!config?.url) {
            onContentLoad?.();
            return;
        }
        import('@/lib/utils').then(({ patchLegacyUrl }) => {
            const patchedUrl = patchLegacyUrl(config.url!);
            fetch(patchedUrl)
                .then(res => res.json())
                .then(json => {
                    setData(json);
                    onContentLoad?.();
                })
                .catch(err => {
                    console.error('Lottie Load Failed:', err);
                    onContentLoad?.();
                });
        });
    }, [config?.url, onContentLoad]);

    // CTO MASTER SYNC: Hard reset or frame-jump for Lottie
    useEffect(() => {
        if (!lottieRef.current) return;
        if (playhead === 0 || resetNonce > 0) {
            lottieRef.current.goToAndStop(0, true);
        }
    }, [playhead, resetNonce]);

    if (!config?.url) return <div className="w-full h-full bg-indigo-500/10 rounded flex items-center justify-center text-indigo-400 text-[10px] font-bold">LOTTIE</div>;

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {data ? (
                <Lottie
                    lottieRef={lottieRef}
                    animationData={data}
                    loop={isPlaying && config.loop !== false}
                    autoplay={isPlaying && config.autoplay !== false}
                />
            ) : (
                <div className="w-full h-full bg-white/5 animate-pulse" />
            )}
        </div>
    );
};

// ============================================
// MAPS ELEMENT
// ============================================
const MapsElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.mapsConfig;
    return (
        <div className="w-full h-full bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center p-4 gap-2">
            <MapPin className="w-6 h-6 text-red-500" />
            <span className="text-xs text-white/80 font-medium">{config?.displayName || 'Location'}</span>
        </div>
    );
};

// ============================================
// VIDEO ELEMENT
// ============================================
const VideoElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    return (
        <div className="w-full h-full bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
            <Play className="w-8 h-8 text-white opacity-50" />
        </div>
    );
};

// ============================================
// RSVP FORM ELEMENT
// ============================================
const RSVPFormElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.rsvpFormConfig;
    return (
        <div className="w-full h-full p-4 flex flex-col gap-3 rounded-2xl bg-white/10 border border-white/10 overflow-hidden">
            <h3 className="text-sm font-bold text-white/90 text-center">{config?.title || 'RSVP Form'}</h3>
            <div className="flex-1 space-y-2 opacity-50">
                <div className="h-8 bg-white/5 rounded w-full" />
                <div className="h-8 bg-white/5 rounded w-full" />
                <div className="h-9 w-full bg-white/10 rounded" />
            </div>
        </div>
    );
};

// ============================================
// GUEST WISHES ELEMENT
// ============================================
const GuestWishesElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    return (
        <div className="w-full h-full bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white/80 text-center">Guest Wishes</h3>
            <div className="flex-1 space-y-2 opacity-50">
                <div className="h-10 bg-white/5 rounded w-full" />
                <div className="h-10 bg-white/5 rounded w-full" />
            </div>
        </div>
    );
};

// ============================================
// FLYING BIRD ELEMENT (SVG ANIMATED)
// ============================================
const FlyingBirdElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const playhead = useStore(state => state.playhead);
    const isPlaying = useStore(state => state.isPlaying);

    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.flyingBirdConfig;
    const flapSpeed = config?.flapSpeed || 0.3;
    const t = playhead / 1000;

    // Deterministic flap cycle
    const flapProgress = (t % flapSpeed) / flapSpeed;
    const flapPhase = Math.sin(flapProgress * Math.PI);

    // Smoothly interpolate the "d" path based on phase
    const yControl = 30 + (flapPhase * 40); // Between 30 and 70
    const d = `M20,50 Q40,${50 - (flapPhase * 40)} 60,50 Q40,${50 + (flapPhase * 40)} 20,50`;

    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ transform: config?.direction === 'right' ? 'scaleX(-1)' : 'none' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" style={{ fill: config?.birdColor || '#1a1a1a' }}>
                <path d={d} />
            </svg>
        </div>
    );
};

// ============================================
// PHOTO GRID ELEMENT
// ============================================
const PhotoGridElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const openImageCropModal = useStore(state => state.openImageCropModal);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [pendingSlotIndex, setPendingSlotIndex] = React.useState<number | null>(null);

    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.photoGridConfig;
    if (!config) return null;

    const images = config.images || [];
    const gap = config.gap ?? 8;
    const cornerRadius = config.cornerRadius ?? 12;
    const hoverEffect = config.hoverEffect || 'zoom';

    // Map hover effect to CSS class
    const hoverClasses: Record<string, string> = {
        'none': '',
        'zoom': 'hover-effect-container hover-zoom',
        'zoom-rotate': 'hover-effect-container hover-zoom-rotate',
        'brightness': 'hover-effect-container hover-brightness',
        'grayscale': 'hover-effect-container hover-grayscale',
        'blur-reveal': 'hover-effect-container hover-blur-reveal',
        'overlay': 'hover-effect-container hover-overlay',
        'tilt': 'hover-effect-container hover-tilt',
        'glow': 'hover-effect-container hover-glow'
    };

    const hoverClass = hoverClasses[hoverEffect] || hoverClasses['zoom'];

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && pendingSlotIndex !== null) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageSrc = event.target?.result as string;
                if (imageSrc) {
                    // Open crop modal with the selected image
                    openImageCropModal(imageSrc, layer.id, pendingSlotIndex, 1);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setPendingSlotIndex(null);
    };

    // Handle slot click
    const handleSlotClick = (index: number) => {
        if (!isEditor) return;
        setPendingSlotIndex(index);
        fileInputRef.current?.click();
    };

    const renderSlot = (index: number, className: string = "") => {
        const url = images[index];
        return (
            <div
                className={`group relative bg-white/5 border border-white/5 ${hoverClass} ${className} ${isEditor ? 'cursor-pointer' : ''}`}
                style={{ borderRadius: cornerRadius }}
                onClick={() => handleSlotClick(index)}
            >
                {url ? (
                    <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=400&auto=format&fit=crop')}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                )}
                {isEditor && (
                    <div className="absolute inset-0 bg-premium-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>
        );
    };

    // Render the grid based on variant
    const renderGrid = () => {
        switch (config.variant) {
            case 'single':
                return <div className="w-full h-full">{renderSlot(0)}</div>;
            case 'split-h':
                return <div className="grid grid-cols-2 h-full w-full" style={{ gap }}>{renderSlot(0)} {renderSlot(1)}</div>;
            case 'split-v':
                return <div className="grid grid-rows-2 h-full w-full" style={{ gap }}>{renderSlot(0)} {renderSlot(1)}</div>;
            case 'quad':
                return <div className="grid grid-cols-2 grid-rows-2 h-full w-full" style={{ gap }}>{renderSlot(0)} {renderSlot(1)} {renderSlot(2)} {renderSlot(3)}</div>;
            case 'triple-h':
                return <div className="grid grid-cols-3 h-full w-full" style={{ gap }}>{renderSlot(0)} {renderSlot(1)} {renderSlot(2)}</div>;
            case 'hero-left':
                return (
                    <div className="grid grid-cols-3 grid-rows-2 h-full w-full" style={{ gap }}>
                        <div className="col-span-2 row-span-2">{renderSlot(0)}</div>
                        <div>{renderSlot(1)}</div>
                        <div>{renderSlot(2)}</div>
                    </div>
                );
            case 'hero-right':
                return (
                    <div className="grid grid-cols-3 grid-rows-2 h-full w-full" style={{ gap }}>
                        <div>{renderSlot(1)}</div>
                        <div className="col-span-2 row-span-2">{renderSlot(0)}</div>
                        <div>{renderSlot(2)}</div>
                    </div>
                );
            case 'mosaic':
                return (
                    <div className="grid grid-cols-4 grid-rows-2 h-full w-full" style={{ gap }}>
                        <div className="col-span-2 row-span-2">{renderSlot(0)}</div>
                        <div className="col-span-2">{renderSlot(1)}</div>
                        <div style={{ position: 'relative' }}>{renderSlot(2)}</div>
                        <div style={{ position: 'relative' }}>{renderSlot(3)}</div>
                    </div>
                );
            case 'featured':
                return (
                    <div className="grid grid-cols-2 grid-rows-4 h-full w-full" style={{ gap }}>
                        <div className="col-span-2 row-span-2">{renderSlot(0)}</div>
                        <div className="row-span-2">{renderSlot(1)}</div>
                        <div className="row-span-2">{renderSlot(2)}</div>
                    </div>
                );
            case 'cluster':
                return (
                    <div className="relative w-full h-full group">
                        <div className="absolute top-0 left-0 w-2/3 h-2/3 z-10 -rotate-3 transition-transform group-hover:rotate-0">{renderSlot(0)}</div>
                        <div className="absolute bottom-4 right-0 w-3/5 h-3/5 z-20 rotate-6 transition-transform group-hover:rotate-0 shadow-xl">{renderSlot(1)}</div>
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1/2 h-1/2 z-0 rotate-12 opacity-50">{renderSlot(2)}</div>
                    </div>
                );
            default:
                return <div className="w-full h-full grid grid-cols-2" style={{ gap }}>{renderSlot(0)} {renderSlot(1)}</div>;
        }
    };

    return (
        <>
            {/* Hidden file input for photo uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {renderGrid()}
        </>
    );
};

// ============================================
// PHOTO FRAME ELEMENT (Polaroid & Instagram)
// ============================================
const PhotoFrameElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.frameConfig;
    if (!config) return null;

    const variant = config.variant || 'polaroid';
    const isDark = config.theme === 'dark';

    // COMMON PLACEHOLDER CONTENT
    const Placeholder = ({ icon: Icon, text }: { icon: any, text: string }) => (
        <div className={`flex-1 flex flex-col items-center justify-center relative overflow-hidden`}>
            <Icon className={`w-8 h-8 opacity-20`} />
            <span className="text-[9px] uppercase tracking-widest font-black mt-2 opacity-30">{text}</span>
        </div>
    );

    const renderFrame = () => {
        switch (variant) {
            case 'polaroid':
                return (
                    <div 
                        className="w-full h-full flex flex-col shadow-2xl overflow-hidden" 
                        style={{ 
                            backgroundColor: config.backgroundColor || '#ffffff',
                            padding: config.padding || 16,
                            paddingBottom: config.bottomPadding || 48,
                            borderRadius: config.borderRadius || 2
                        }}
                    >
                        <div className="flex-1 bg-neutral-100 flex flex-col items-center justify-center border border-neutral-200/50 rounded-sm">
                            <ImageIcon className="w-8 h-8 text-neutral-300" />
                            <span className="text-[10px] text-neutral-400 mt-2 font-medium uppercase tracking-tighter">Upload Photo</span>
                        </div>
                        <div className="h-8 mt-2 flex items-center justify-center">
                            <div className="w-24 h-1 bg-neutral-100 rounded-full" />
                        </div>
                    </div>
                );

            case 'gallery':
                return (
                    <div 
                        className="w-full h-full flex flex-col shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-2 border-neutral-800" 
                        style={{ 
                            backgroundColor: config.backgroundColor || '#ffffff',
                            padding: config.padding || 24
                        }}
                    >
                        <div className="flex-1 bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                            <Placeholder icon={ImageIcon} text="Fine Art Print" />
                        </div>
                    </div>
                );

            case 'film-strip':
                const holeCount = 5;
                const holes = Array.from({ length: holeCount }).map((_, i) => (
                    <div key={i} className="w-2 h-3 bg-neutral-900 rounded-sm" />
                ));
                return (
                    <div className="w-full h-full bg-neutral-950 flex flex-col p-2 gap-2 shadow-xl">
                        {/* Top Holes */}
                        <div className="flex justify-around items-center h-4 px-2 opacity-40">
                            {holes}
                        </div>
                        {/* Film Content */}
                        <div className="flex-1 bg-neutral-900 border-y-2 border-neutral-800 flex items-center justify-center">
                            <Placeholder icon={Film} text="Frame 01" />
                        </div>
                        {/* Bottom Holes */}
                        <div className="flex justify-around items-center h-4 px-2 opacity-40">
                            {holes}
                        </div>
                    </div>
                );

            case 'washi-tape':
                return (
                    <div className="w-full h-full relative pt-4">
                        {/* Tape Graphic */}
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-premium-accent/40 backdrop-blur-[1px] rotate-[-2deg] z-10 shadow-sm border-x border-premium-accent/20"
                            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
                        />
                        <div 
                            className="w-full h-full bg-white shadow-lg flex flex-col p-3 border border-neutral-100"
                            style={{ borderRadius: config.borderRadius || 2 }}
                        >
                            <div className="flex-1 bg-neutral-50 flex items-center justify-center rounded-sm">
                                <Placeholder icon={ImageIcon} text="Memories" />
                            </div>
                        </div>
                    </div>
                );

            case 'arch':
                return (
                    <div 
                        className="w-full h-full bg-white shadow-xl flex flex-col p-3 overflow-hidden"
                        style={{ borderTopLeftRadius: '50% 100%', borderTopRightRadius: '50% 100%' }}
                    >
                        <div 
                            className="flex-1 bg-neutral-50 flex items-center justify-center border border-neutral-100"
                            style={{ borderTopLeftRadius: '50% 100%', borderTopRightRadius: '50% 100%' }}
                        >
                            <Placeholder icon={ImageIcon} text="Elegance" />
                        </div>
                    </div>
                );

            case 'instagram':
                return (
                    <div 
                        className={`w-full h-full flex flex-col rounded-xl overflow-hidden border ${isDark ? 'bg-black border-white/10 text-white' : 'bg-white border-neutral-100 text-black'} shadow-xl`}
                    >
                        {/* Header */}
                        <div className="h-12 flex items-center px-3 gap-3 border-b border-neutral-100/10">
                            <div className={`w-8 h-8 rounded-full border ${isDark ? 'bg-white/10 border-white/5' : 'bg-neutral-100 border-neutral-200'} flex items-center justify-center overflow-hidden`}>
                                <Users className={`w-4 h-4 ${isDark ? 'text-white/20' : 'text-neutral-300'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold leading-none">{config.username || 'Username'}</span>
                                <span className={`text-[9px] leading-none mt-1 opacity-50`}>{config.location || 'Original Audio'}</span>
                            </div>
                            <div className="ml-auto flex gap-0.5">
                                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/40' : 'bg-neutral-300'}`} />
                                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/40' : 'bg-neutral-300'}`} />
                                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/40' : 'bg-neutral-300'}`} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className={`flex-1 ${isDark ? 'bg-white/5' : 'bg-neutral-50'} flex items-center justify-center`}>
                            <Placeholder icon={ImageIcon} text="Post Image" />
                        </div>

                        {/* Footer */}
                        <div className="p-3">
                            <div className="flex items-center gap-4 mb-2">
                                <Heart className="w-5 h-5 opacity-70" />
                                <MessageSquare className="w-5 h-5 opacity-70" />
                                <Share2 className="w-5 h-5 opacity-70" />
                                <div className="ml-auto">
                                    <Star className="w-5 h-5 opacity-20" />
                                </div>
                            </div>
                            {config.showLikeCount !== false && (
                                <div className="text-[11px] font-bold mb-1">
                                    {config.likeCount?.toLocaleString() || '1,234'} likes
                                </div>
                            )}
                            <div className="text-[11px] leading-tight">
                                <span className="font-bold mr-2">{config.username || 'Username'}</span>
                                <span className="opacity-80 truncate">Captured moments...</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <PlaceholderElement layer={layer} onContentLoad={onContentLoad} />;
        }
    };

    return (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500">
            {renderFrame()}
        </div>
    );
};


// ============================================
// INTERACTION TRIGGER ELEMENT (EDITOR ONLY VISUAL)
// ============================================
const InteractionElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const triggerInteraction = useStore(state => state.triggerInteraction);

    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    const config = layer.interactionConfig;
    const effect = config?.effect || 'confetti';
    const testName = config?.testName || 'Guest Name';

    // Find icon for effect
    const effectIcons: Record<string, string> = {
        'confetti': '🎉',
        'gold_rain': '💰',
        'rose_petals': '🌹',
        'snow': '❄️',
        'matrix': '📟',
        'stars': '⭐',
        'hearts': '❤️',
        'fireworks': '🚀'
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        triggerInteraction(
            testName,
            config?.effect || 'confetti',
            (config?.greetingStyle || 'cinematic') as any,
            {
                x: centerX / window.innerWidth,
                y: centerY / window.innerHeight
            }
        );
    };

    // In preview mode, the element is invisible - it only serves as an origin point for effects
    // Click anywhere triggers are handled by AdminDisplayPreviewPage, not by clicking this element
    if (!isEditor) {
        return null;
    }

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center p-2 rounded-2xl transition-all overflow-hidden cursor-pointer bg-premium-accent/10 border-2 border-dashed border-premium-accent/30 group hover:bg-premium-accent/20 hover:scale-105"
            onClick={handleClick}
        >
            <div className="relative">
                <LucideIcons.Zap className="w-8 h-8 text-premium-accent animate-pulse" />
                <div className="absolute -top-1 -right-1 text-lg">{effectIcons[effect] || '⚡'}</div>
            </div>
            <div className="mt-2 text-[10px] font-black text-premium-accent uppercase tracking-tighter opacity-80 text-center">
                {effect.replace('_', ' ')} trigger
            </div>
            <div className="text-[8px] text-white/40 font-medium uppercase tracking-[0.2em] mt-1">Effect Origin Point</div>
        </div>
    );
};


// ============================================
// PLACEHOLDER ELEMENT
// ============================================
const PlaceholderElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [onContentLoad]);

    return (
        <div className="w-full h-full bg-white/5 rounded border-2 border-dashed border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-[10px] font-bold uppercase">{layer.type.replace('_', ' ')}</span>
        </div>
    );
};
