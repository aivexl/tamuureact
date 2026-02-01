import React, { useEffect, useRef } from 'react';
import { Layer } from '@/store/layersSlice';
import { useStore } from '@/store/useStore';
import { m } from 'framer-motion';
import { Music, MessageSquare, Share2, Sun, Image as ImageIcon, Heart, Clock, MapPin, Star, Play, Pause } from 'lucide-react';
import { useAudioController } from '@/hooks/useAudioController';

// ============================================
// PARTICLES ELEMENT (Confetti, Fireworks, etc.)
// ============================================
export const ParticlesElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        onContentLoad?.();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const particles: any[] = [];
        const type = layer.type;

        const resize = () => {
            canvas.width = layer.width;
            canvas.height = layer.height;
        };
        resize();

        const createParticle = () => {
            const width = canvas.width;
            const height = canvas.height;

            if (type === 'confetti') {
                return {
                    x: Math.random() * width,
                    y: -20,
                    size: Math.random() * 8 + 4,
                    color: ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00'][Math.floor(Math.random() * 4)],
                    speedY: Math.random() * 3 + 2,
                    speedX: Math.random() * 2 - 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 10 - 5
                };
            } else if (type === 'fireworks') {
                const burstX = Math.random() * width;
                const burstY = Math.random() * height;
                return {
                    x: burstX,
                    y: burstY,
                    size: Math.random() * 3 + 1,
                    color: ['#FFD700', '#FF4500', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 4)],
                    speedY: (Math.random() - 0.5) * 8,
                    speedX: (Math.random() - 0.5) * 8,
                    life: 1,
                    decay: Math.random() * 0.02 + 0.01,
                    isBurst: true
                };
            } else if (type === 'bubbles') {
                return {
                    x: Math.random() * width,
                    y: height + 20,
                    size: Math.random() * 10 + 2,
                    color: 'rgba(255, 255, 255, 0.3)',
                    speedY: -(Math.random() * 1 + 0.5),
                    speedX: Math.sin(Math.random() * Math.PI) * 0.5,
                    rotation: 0,
                    rotationSpeed: 0
                };
            }
            // Snow
            return {
                x: Math.random() * width,
                y: -20,
                size: Math.random() * 4 + 1,
                color: '#ffffff',
                speedY: Math.random() * 1 + 0.5,
                speedX: Math.random() * 0.5 - 0.25,
                rotation: 0,
                rotationSpeed: 0
            };
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (particles.length < (type === 'fireworks' ? 100 : 50)) {
                particles.push(createParticle());
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                if (p.isBurst) {
                    p.x += p.speedX;
                    p.y += p.speedY;
                    p.life -= p.decay;
                    if (p.life <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                } else {
                    p.x += p.speedX || 0;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed || 0;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                if (p.rotation) ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.life || 1;
                ctx.fillStyle = p.color;

                if (type === 'confetti') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
                } else if (type === 'bubbles') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                if (!p.isBurst && (p.y > canvas.height + 20 || p.y < -30)) {
                    particles[i] = createParticle();
                }
            }
            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [layer.type, layer.width, layer.height]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full pointer-events-none"
            style={{ position: 'absolute', top: 0, left: 0 }}
        />
    );
};

// ============================================
// DIGITAL GIFT ELEMENT (Angpao)
// ============================================
import { BankCard } from './BankCard';

export const DigitalGiftElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const config = layer.digitalGiftConfig || {
        title: 'Kado Digital',
        description: 'Doa restu Anda adalah kado terindah, namun jika ingin memberi lebih...',
        bankName: 'Bank Central Asia',
        accountNumber: '1234567890',
        accountHolder: 'John Doe',
        buttonText: 'Salin Rekening',
        theme: 'gold'
    };

    const handleCopy = () => {
        if (isEditor) return;
        navigator.clipboard.writeText(config.accountNumber);
        // We could add a toast notification here if available
    };

    return (
        <div
            className={`w-full h-full flex flex-col items-center justify-center ${isEditor ? 'p-0' : 'p-2 sm:p-4'}`}
        >
            <div className={`w-full flex flex-col items-center ${isEditor ? 'max-w-none gap-1' : 'max-w-[400px] gap-4 sm:gap-6'}`}>
                {(config.title || config.description) && (
                    <div className={`text-center space-y-1 sm:space-y-2 ${isEditor ? 'mb-1' : 'mb-2 sm:mb-4'}`}>
                        {config.title && (
                            <h3 className="text-sm sm:text-lg font-black tracking-tight text-white uppercase drop-shadow-md">
                                {config.title}
                            </h3>
                        )}
                        {config.description && (
                            <p className="text-[9px] sm:text-[11px] text-white/60 leading-relaxed font-medium">
                                {config.description}
                            </p>
                        )}
                    </div>
                )}

                <BankCard
                    bankName={config.bankName}
                    accountNumber={config.accountNumber}
                    accountHolder={config.accountHolder}
                    customColor={config.customColor}
                    isPreview={isEditor}
                />

                {!isEditor && (
                    <m.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="mt-2 text-[10px] sm:text-[12px] bg-white text-black font-black py-2.5 sm:py-3 px-8 sm:px-12 rounded-full uppercase tracking-[0.2em] shadow-xl hover:bg-opacity-90 transition-all border border-black/5"
                    >
                        {config.buttonText}
                    </m.button>
                )}
            </div>
        </div>
    );
};

// ============================================
// PLACEHOLDERS FOR OTHERS
// ============================================
// ============================================
// MUSIC PLAYER ELEMENT
// ============================================
export const MusicPlayerElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    const { play, pause, isPlaying, currentUrl } = useAudioController();
    const config = layer.musicPlayerConfig || {
        audioUrl: '',
        title: 'Wedding March',
        artist: 'Classical',
        autoplay: false,
        loop: false,
        visualizerEnabled: false,
        visualizerColor: '#ffffff'
    };

    // Auto-play when added or loaded if url exists (and not in editor to avoid chaos, or optionally in editor)
    // For now, let's make it clickable to play/pause
    const handleToggle = () => {
        if (!config.audioUrl) return;
        if (currentUrl === config.audioUrl && isPlaying) {
            pause();
        } else {
            play(config.audioUrl);
        }
    };

    const isThisPlaying = currentUrl === config.audioUrl && isPlaying;

    return (
        <m.div
            className="w-full h-full glass-panel flex items-center p-3 gap-3 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
            style={{ borderRadius: 16 }}
            onClick={handleToggle}
        >
            <div className="w-10 h-10 rounded-full bg-premium-accent/20 flex items-center justify-center relative overflow-hidden">
                {isThisPlaying ? (
                    <Pause className="w-5 h-5 text-premium-accent fill-current" />
                ) : (
                    <Music className="w-5 h-5 text-premium-accent" />
                )}
                {isThisPlaying && (
                    <m.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-premium-accent/40 rounded-full"
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-white truncate">{config.title || 'Untitled Track'}</div>
                <div className="text-[8px] text-white/40 truncate">{config.artist || 'Unknown Artist'}</div>
            </div>
            <div className="flex gap-1.5 items-center">
                {[0.4, 0.7, 0.3, 0.9, 0.5].map((h, i) => (
                    <m.div
                        key={i}
                        animate={isThisPlaying ? { height: [h * 20, (1 - h) * 20, h * 20] } : { height: 4 }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        className="w-0.5 bg-premium-accent/60 rounded-full"
                    />
                ))}
            </div>
        </m.div>
    );
};

// ============================================
// QR CODE ELEMENT
// ============================================
export const QRCodeElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const { triggerGlobalEffect } = useStore();
    useEffect(() => { onContentLoad?.(); }, []);

    const config = layer.qrCodeConfig || {
        value: 'https://tamuu.id',
        foreground: '#000000',
        background: '#ffffff',
        interactiveEnabled: false,
        successEffect: 'confetti'
    };
    const fg = config.foreground || '#000000';

    const handleTrigger = () => {
        if ('interactiveEnabled' in config && config.interactiveEnabled) {
            triggerGlobalEffect(config.successEffect || 'confetti');
        }
    };

    return (
        <m.div
            className="w-full h-full relative"
            whileTap={config.interactiveEnabled && !isEditor ? { scale: 0.95 } : {}}
            onClick={handleTrigger}
        >
            <div
                className="w-full h-full p-3 bg-white flex items-center justify-center overflow-hidden shadow-xl"
                style={{ borderRadius: 12 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="0" y="0" width="100" height="100" fill="transparent" />
                    <rect x="5" y="5" width="35" height="35" stroke={fg} strokeWidth="6" fill="none" rx="4" />
                    <rect x="13" y="13" width="19" height="19" fill={fg} rx="2" />
                    <rect x="60" y="5" width="35" height="35" stroke={fg} strokeWidth="6" fill="none" rx="4" />
                    <rect x="68" y="13" width="19" height="19" fill={fg} rx="2" />
                    <rect x="5" y="60" width="35" height="35" stroke={fg} strokeWidth="6" fill="none" rx="4" />
                    <rect x="13" y="68" width="19" height="19" fill={fg} rx="2" />
                    <path d="M50 5 v90 M5 50 h90 M50 50 h25 v15 h-25 z M75 75 h20 v20 h-20 z" stroke={fg} strokeWidth="3" fill="none" strokeLinecap="round" />
                    <rect x="65" y="65" width="15" height="15" fill={fg} opacity="0.6" rx="2" />
                    <rect x="50" y="85" width="10" height="10" fill={fg} rx="1" />
                </svg>

                {/* Interaction Label (Preview only if enabled) */}
                {config.interactiveEnabled && !isEditor && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-premium-accent/80 px-3 py-1 rounded-full text-black">
                            Scan Success Simulation
                        </span>
                    </div>
                )}
            </div>

            {/* Editor Simulation Button */}
            {isEditor && config.interactiveEnabled && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleTrigger(); }}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-[8px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20"
                    >
                        SIMULATE SUCCESS
                    </button>
                </div>
            )}
        </m.div>
    );
};

// ============================================
// ATMOSPHERIC VECTOR (Waves, Blobs)
// ============================================
export const AtmosphericVectorElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    const config = layer.waveConfig || { amplitude: 30, frequency: 0.02, speed: 1, color: 'rgba(191, 161, 129, 0.4)' };
    const type = layer.type;

    if (type === 'generative_blob') {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <m.path
                        animate={{
                            d: [
                                "M150,100c0,27.6-22.4,50-50,50s-50-22.4-50-50s22.4-50,50-50S150,72.4,150,100z",
                                "M155,100c0,30.4-24.6,55-55,55s-55-24.6-55-55s24.6-55,55-55S155,69.6,155,100z",
                                "M150,100c0,27.6-22.4,50-50,50s-50-22.4-50-50s22.4-50,50-50S150,72.4,150,100z"
                            ]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        fill={config.color || 'rgba(191, 161, 129, 0.3)'}
                    />
                </svg>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative overflow-hidden">
            <svg viewBox={`0 0 ${layer.width} ${layer.height}`} preserveAspectRatio="none" className="w-full h-full">
                <m.path
                    d={`M 0 ${layer.height / 2} Q ${layer.width / 4} ${layer.height / 2 - config.amplitude} ${layer.width / 2} ${layer.height / 2} T ${layer.width} ${layer.height / 2} L ${layer.width} ${layer.height} L 0 ${layer.height} Z`}
                    fill={config.color || 'rgba(191, 161, 129, 0.2)'}
                    animate={{
                        d: [
                            `M 0 ${layer.height / 2} Q ${layer.width / 4} ${layer.height / 2 - config.amplitude} ${layer.width / 2} ${layer.height / 2} T ${layer.width} ${layer.height / 2} L ${layer.width} ${layer.height} L 0 ${layer.height} Z`,
                            `M 0 ${layer.height / 2} Q ${layer.width / 4} ${layer.height / 2 + config.amplitude} ${layer.width / 2} ${layer.height / 2} T ${layer.width} ${layer.height / 2} L ${layer.width} ${layer.height} L 0 ${layer.height} Z`,
                            `M 0 ${layer.height / 2} Q ${layer.width / 4} ${layer.height / 2 - config.amplitude} ${layer.width / 2} ${layer.height / 2} T ${layer.width} ${layer.height / 2} L ${layer.width} ${layer.height} L 0 ${layer.height} Z`
                        ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
        </div>
    );
};

export const GlassCardElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    return (
        <div className="w-full h-full relative group">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl border border-white/30 rounded-[inherit] transition-all group-hover:bg-white/20"
                style={{ borderRadius: layer.borderRadius || 20 }} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 rounded-[inherit] pointer-events-none" />
            <div className="w-full h-full relative z-10 p-4 flex items-center justify-center">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
        </div>
    );
};

// ============================================
// SOCIAL MOCKUP ELEMENT
// ============================================
export const SocialMockupElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    const config = layer.socialMockupConfig || { platform: 'instagram', username: 'tamuu_id' };

    return (
        <div className="w-full h-full glass-panel border border-white/10 p-4 flex flex-col gap-2 overflow-hidden" style={{ borderRadius: 16 }}>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-premium-dark border border-white/20" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white leading-none">{config.username || 'user'}</span>
                    <span className="text-[8px] text-white/40">{config.platform || 'Social'}</span>
                </div>
                <div className="ml-auto flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-white/40" />
                    <div className="w-1 h-1 rounded-full bg-white/40" />
                    <div className="w-1 h-1 rounded-full bg-white/40" />
                </div>
            </div>
            <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                <ImageIcon className="w-8 h-8 text-white/10" />
            </div>
            <div className="flex items-center gap-2 mt-1">
                <Heart className="w-3.5 h-3.5 text-white/60" />
                <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                <Share2 className="w-3.5 h-3.5 text-white/60" />
            </div>
        </div>
    );
};

// ============================================
// WEATHER / CLOCK ELEMENT
// ============================================
export const WeatherElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    const config = layer.weatherConfig || { city: 'Jakarta', temp: '28' };

    return (
        <div className="w-full h-full bg-black/20 backdrop-blur-md border border-white/20 p-4 flex items-center justify-between" style={{ borderRadius: 20 }}>
            <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-white">{config.temp || '28'}°</span>
                <span className="text-[10px] text-white/80 uppercase tracking-widest font-black">{config.city || 'Jakarta'}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
                <Sun className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                <span className="text-[9px] font-bold text-white/50">MOSTLY SUNNY</span>
            </div>
        </div>
    );
};

// ============================================
// MARQUEE (SCROLLING TICKER)
// ============================================
export const MarqueeElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    const text = layer.content || "ENTERPRISE LEVEL • UNICORN STANDARDS • AWARD WINNING DESIGN • ";

    return (
        <div className="w-full h-full flex items-center overflow-hidden bg-premium-accent/10 border-y border-premium-accent/30 backdrop-blur-sm">
            <m.div
                animate={{ x: [0, -400] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap gap-8"
            >
                {[...Array(6)].map((_, i) => (
                    <span key={i} className="text-[12px] font-black text-premium-accent tracking-[0.3em] uppercase">{text}</span>
                ))}
            </m.div>
        </div>
    );
};

// ============================================
// TILT CARD ELEMENT
// ============================================
export const TiltCardElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);

    return (
        <m.div
            className="w-full h-full relative"
            style={{ perspective: 1000 }}
            whileHover={{ rotateY: 20, rotateX: -15 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className="w-full h-full bg-gradient-to-br from-premium-accent/40 via-premium-dark to-black border-2 border-premium-accent/50 rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="w-12 h-1.5 bg-premium-accent rounded-full mb-3 shadow-[0_0_10px_rgba(191,161,129,0.5)]" />
                    <div className="text-[12px] font-black text-white tracking-[0.2em] uppercase mb-1">PREMIUM ACCESS</div>
                    <div className="text-[10px] text-premium-accent/80 font-bold uppercase tracking-widest">Enterprise Edition</div>
                </div>

                <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 rounded-full border border-premium-accent/30 flex items-center justify-center backdrop-blur-md">
                        <Star className="w-5 h-5 text-premium-accent animate-pulse" />
                    </div>
                </div>
            </div>
        </m.div>
    );
};
// ============================================
// CALENDAR SYNC ELEMENT
// ============================================
export const CalendarSyncElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    return (
        <m.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full h-full bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 flex items-center justify-center gap-3 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10"
            style={{ borderRadius: 16 }}
        >
            <Clock className="w-5 h-5 text-blue-400" />
            SAVE THE DATE
        </m.button>
    );
};

// ============================================
// DIRECTIONS HUB ELEMENT
// ============================================
export const DirectionsHubElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    return (
        <div className="w-full h-full bg-premium-dark/80 backdrop-blur-2xl border-2 border-white/10 p-5 flex flex-col gap-4 shadow-2xl" style={{ borderRadius: 24 }}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-black text-white uppercase tracking-widest">Venue Location</span>
                    <span className="text-[9px] text-white/40 font-bold">Open with your favorite app</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <m.div whileHover={{ y: -2 }} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-[10px] font-black text-white/80 text-center border border-white/10 transition-colors uppercase cursor-pointer tracking-widest">Google Maps</m.div>
                <m.div whileHover={{ y: -2 }} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-[10px] font-black text-white/80 text-center border border-white/10 transition-colors uppercase cursor-pointer tracking-widest">Waze Hub</m.div>
            </div>
        </div>
    );
};

// ============================================
// SHARE CONTEXT ELEMENT
// ============================================
export const ShareContextElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => { onContentLoad?.(); }, []);
    return (
        <m.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full h-full bg-emerald-600/20 backdrop-blur-xl border border-emerald-400/30 flex items-center justify-center gap-3 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10"
            style={{ borderRadius: 16 }}
        >
            <Share2 className="w-5 h-5 text-emerald-400" />
            SPREAD THE JOY
        </m.button>
    );
};
