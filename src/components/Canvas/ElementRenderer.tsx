import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Layer } from '@/store/layersSlice';
import { X, Upload, Play, MailOpen, MapPin, Clock, ExternalLink, MessageSquare, Heart, Star } from 'lucide-react';
import Lottie from 'lottie-react';
import * as LucideIcons from 'lucide-react';
import { shapePaths } from '@/lib/shape-paths';

// ============================================
// ELEMENT RENDERER
// ============================================
interface ElementRendererProps {
    layer: Layer;
    onOpenInvitation?: () => void;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ layer, onOpenInvitation, isEditor, onContentLoad }) => {
    switch (layer.type) {
        case 'text':
            return <TextElement layer={layer} onContentLoad={onContentLoad} />;
        case 'image':
        case 'gif':
        case 'sticker':
            return <ImageElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
        case 'icon':
            return <IconElement layer={layer} onContentLoad={onContentLoad} />;
        case 'button':
        case 'open_invitation_button':
            return <ButtonElement layer={layer} onOpenInvitation={onOpenInvitation} onContentLoad={onContentLoad} />;
        case 'shape':
            return <ShapeElement layer={layer} onContentLoad={onContentLoad} />;
        case 'countdown':
            return <CountdownElement layer={layer} onContentLoad={onContentLoad} />;
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
        case 'flying_bird':
            return <FlyingBirdElement layer={layer} isEditor={isEditor} onContentLoad={onContentLoad} />;
        default:
            return <PlaceholderElement layer={layer} onContentLoad={onContentLoad} />;
    }
};

// ============================================
// TEXT ELEMENT
// ============================================
const TextElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []); // Non-resource element, reveal immediately

    const style = layer.textStyle;
    const fontSize = style?.fontSize || 24;

    return (
        <div
            className="w-full h-full flex items-center justify-center overflow-visible select-none"
            style={{
                fontFamily: style?.fontFamily || 'Outfit',
                fontSize: `${fontSize}px`,
                fontWeight: style?.fontWeight || 'normal',
                fontStyle: style?.fontStyle || 'normal',
                textAlign: style?.textAlign || 'center',
                color: style?.color || '#ffffff',
                lineHeight: style?.lineHeight || 1.2,
                letterSpacing: style?.letterSpacing || 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: '4px'
            }}
        >
            {layer.content || 'Text'}
        </div>
    );
};

// ============================================
// IMAGE ELEMENT
// ============================================
const ImageElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
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
    }, [layer.imageUrl, isEditor]); // Removed onContentLoad from dependency to avoid loop

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

    return (
        <div className="w-full h-full relative">
            <img
                src={layer.imageUrl}
                alt={layer.name}
                onLoad={() => {
                    setLoaded(true);
                    onContentLoad?.();
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
    }, []); // Non-resource element, reveal immediately

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
    }, []); // Non-resource element, reveal immediately

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
        <motion.button
            onClick={onOpenInvitation}
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
        </motion.button>
    );
};

// ============================================
// SHAPE ELEMENT
// ============================================
const ShapeElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []); // Non-resource element, reveal immediately

    const config = layer.shapeConfig;
    if (!config) return null;
    const shapeType = config.shapeType || 'rectangle';

    return (
        <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox={shapeType.includes('rectangle') ? `0 0 ${layer.width} ${layer.height}` : '0 0 100 100'} preserveAspectRatio={shapeType.includes('rectangle') ? 'none' : 'xMidYMid meet'} className="overflow-visible">
                {shapeType === 'rectangle' && <rect x="0" y="0" width="100%" height="100%" fill={config.fill || '#bfa181'} stroke={config.stroke || undefined} strokeWidth={config.strokeWidth} />}
                {shapeType === 'rounded-rectangle' && <rect x="0" y="0" width="100%" height="100%" rx={config.cornerRadius || 20} fill={config.fill || '#bfa181'} stroke={config.stroke || undefined} strokeWidth={config.strokeWidth} />}
                {shapeType === 'circle' && <circle cx="50" cy="50" r="48" fill={config.fill || '#bfa181'} stroke={config.stroke || undefined} strokeWidth={config.strokeWidth} />}
                {!['rectangle', 'rounded-rectangle', 'circle'].includes(shapeType) && (
                    <path d={shapePaths[shapeType] || config.pathData || ''} fill={config.fill || '#bfa181'} stroke={config.stroke || undefined} strokeWidth={config.strokeWidth} vectorEffect="non-scaling-stroke" />
                )}
            </svg>
        </div>
    );
};

// ============================================
// COUNTDOWN ELEMENT
// ============================================
const CountdownElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []); // Non-resource element, reveal immediately

    const config = layer.countdownConfig;
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        if (!config?.targetDate) return;
        const update = () => {
            const diff = Math.max(0, new Date(config.targetDate).getTime() - Date.now());
            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                m: Math.floor((diff / (1000 * 60)) % 60),
                s: Math.floor((diff / 1000) % 60),
            });
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [config?.targetDate]);

    if (!config) return null;
    const units = [
        { label: config.labels?.days || 'Days', value: timeLeft.d, show: config.showDays },
        { label: config.labels?.hours || 'Hours', value: timeLeft.h, show: config.showHours },
        { label: config.labels?.minutes || 'Min', value: timeLeft.m, show: config.showMinutes },
        { label: config.labels?.seconds || 'Sec', value: timeLeft.s, show: config.showSeconds },
    ].filter(u => u.show !== false);

    return (
        <div className="w-full h-full flex justify-center items-center gap-4 px-2" style={{ backgroundColor: config.backgroundColor || 'transparent' }}>
            {units.map((u, i) => (
                <div key={i} className="flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono" style={{ color: config.textColor || '#fff' }}>{String(u.value).padStart(2, '0')}</span>
                    {config.showLabels !== false && <span className="text-[10px] uppercase opacity-50" style={{ color: config.labelColor || '#fff' }}>{(u.label as any) || ''}</span>}
                </div>
            ))}
        </div>
    );
};

// ============================================
// LOTTIE ELEMENT
// ============================================
const LottieElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const isAnimationPlaying = useStore(state => state.isAnimationPlaying);
    const shouldAnimate = !isEditor || isAnimationPlaying;
    const config = layer.lottieConfig;
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!config?.url) {
            onContentLoad?.(); // Reveal placeholders
            return;
        }
        fetch(config.url)
            .then(res => res.json())
            .then(json => {
                setData(json);
                onContentLoad?.();
            })
            .catch(err => {
                console.error('Lottie Load Failed:', err);
                onContentLoad?.(); // Still reveal on error
            });
    }, [config?.url]);

    if (!config?.url) return <div className="w-full h-full bg-indigo-500/10 rounded flex items-center justify-center text-indigo-400 text-[10px] font-bold">LOTTIE</div>;

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {data ? <Lottie animationData={data} loop={shouldAnimate && config.loop !== false} autoplay={shouldAnimate && config.autoplay !== false} /> : <div className="w-full h-full bg-white/5 animate-pulse" />}
        </div>
    );
};

// ============================================
// MAPS ELEMENT
// ============================================
const MapsElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

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
    }, []);

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
    }, []);

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
    }, []);

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
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const isAnimationPlaying = useStore(state => state.isAnimationPlaying);
    const shouldAnimate = !isEditor || isAnimationPlaying;
    const config = layer.flyingBirdConfig;
    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ transform: config?.direction === 'right' ? 'scaleX(-1)' : 'none' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" style={{ fill: config?.birdColor || '#1a1a1a' }}>
                <motion.path
                    d="M20,50 Q40,30 60,50 Q40,70 20,50"
                    animate={shouldAnimate ? { d: ["M20,50 Q40,10 60,50 Q40,90 20,50", "M20,50 Q40,40 60,50 Q40,60 20,50"] } : undefined}
                    transition={{ duration: config?.flapSpeed || 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
            </svg>
        </div>
    );
};

// ============================================
// PLACEHOLDER ELEMENT
// ============================================
const PlaceholderElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    return (
        <div className="w-full h-full bg-white/5 rounded border-2 border-dashed border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-[10px] font-bold uppercase">{layer.type.replace('_', ' ')}</span>
        </div>
    );
};
