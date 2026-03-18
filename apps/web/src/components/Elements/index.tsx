import React, { useEffect, useRef, useState } from 'react';
import { Layer } from '@/store/layersSlice';
import { useStore } from '@/store/useStore';
import { m, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
    Type, Image as ImageIcon, Clock, MailOpen,
    Heart, Square, Film, MapPin, Video, Sparkles, X,
    MessageSquare, Users, Circle, Triangle, Diamond, Star, Zap, Wind, Layout,
    Gift, Music, QrCode, Waves, Layers, Monitor, Share2, Sun, Hash, PlaySquare,
    Component, Palette, Eye, Shield, CreditCard, ExternalLink, Instagram, Twitter,
    Play, Pause, ChevronRight, Copy, Download, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useAudioController } from '@/hooks/useAudioController';
import { AnimatedCopyIcon } from '@/components/ui/AnimatedCopyIcon';
import { patchLegacyUrl } from '@/lib/utils';
import { PremiumLoader } from '../ui/PremiumLoader';

// ============================================
// SMART PASS / QR CODE ELEMENT (FAANG STANDARD)
// ============================================
export const QRCodeElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const { triggerGlobalEffect } = useStore();
    const guestData = useStore(state => state.guestData);
    const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'success'>('idle');
    const passRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => { onContentLoad?.(); }, []);

    const config = layer.qrCodeConfig || {
        value: 'https://tamuu.id',
        foreground: '#000000',
        background: '#ffffff',
        interactiveEnabled: false,
        successEffect: 'confetti',
        theme: 'luxury'
    };
    
    const guestName = guestData?.name || 'TAMU UNDANGAN';
    const checkInCode = guestData?.check_in_code || 'T-XXXXXX';
    const isVIP = guestData?.tier === 'vip' || guestData?.tier === 'vvip';
    const isCheckedIn = !!guestData?.checked_in_at;

    const handleDownloadPass = async () => {
        if (!passRef.current || isEditor) return;
        setDownloadState('loading');
        try {
            const canvas = await html2canvas(passRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
            });
            const link = document.createElement('a');
            link.download = `Pass_${guestName.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setDownloadState('success');
            setTimeout(() => setDownloadState('idle'), 3000);
        } catch (e) {
            console.error('Pass export failed', e);
            setDownloadState('idle');
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
            {/* Boarding Pass Style Container */}
            <m.div 
                ref={passRef}
                whileHover={!isEditor ? { y: -5, scale: 1.02 } : {}}
                className={`relative w-full max-w-[320px] aspect-[3/4] flex flex-col overflow-hidden transition-all duration-700 ${isCheckedIn ? 'opacity-60 grayscale-[0.5]' : ''}`}
                style={{ 
                    borderRadius: 24,
                    background: isVIP 
                        ? 'linear-gradient(135deg, #0A1128 0%, #1C2541 100%)' 
                        : 'white',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                    border: isVIP ? '1px solid rgba(255,191,0,0.3)' : '1px solid rgba(0,0,0,0.05)'
                }}
            >
                {/* VIP Shimmer Effect */}
                {isVIP && !isCheckedIn && (
                    <m.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                    />
                )}

                {/* Top Section: Branding */}
                <div className={`p-6 flex justify-between items-start border-b border-dashed ${isVIP ? 'border-white/10' : 'border-black/5'}`}>
                    <div className="space-y-1">
                        <img 
                            src="/assets/tamuu-logo-header.png" 
                            className="h-5 w-auto object-contain opacity-90 block" 
                            alt="Tamuu" 
                        />
                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isVIP ? 'text-[#FFBF00]' : 'text-slate-400'}`}>
                            Kartu Akses Tamu
                        </p>
                    </div>
                    {isVIP && <Star className="w-4 h-4 text-[#FFBF00] fill-[#FFBF00] animate-pulse" />}
                </div>

                {/* Center Section: QR */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                    <div className="relative group/qr">
                        <div className={`p-3 rounded-2xl bg-white shadow-inner transition-all duration-500 ${isCheckedIn ? 'scale-90 opacity-50' : 'group-hover/qr:scale-105'}`}>
                            <svg viewBox="0 0 100 100" className="w-32 h-32">
                                <rect x="0" y="0" width="100" height="100" fill="white" />
                                <rect x="5" y="5" width="35" height="35" stroke="#000" strokeWidth="6" fill="none" rx="4" />
                                <rect x="13" y="13" width="19" height="19" fill="#000" rx="2" />
                                <rect x="60" y="5" width="35" height="35" stroke="#000" strokeWidth="6" fill="none" rx="4" />
                                <rect x="68" y="13" width="19" height="19" fill="#000" rx="2" />
                                <rect x="5" y="60" width="35" height="35" stroke="#000" strokeWidth="6" fill="none" rx="4" />
                                <rect x="13" y="68" width="19" height="19" fill="#000" rx="2" />
                                <path d="M50 5 v90 M5 50 h90 M50 50 h25 v15 h-25 z M75 75 h20 v20 h-20 z" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                                <rect x="65" y="65" width="15" height="15" fill="#000" opacity="0.6" rx="2" />
                            </svg>
                        </div>
                        {isCheckedIn && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <m.div 
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: -15 }}
                                    className="px-4 py-2 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl rounded-lg"
                                >
                                    Sudah Digunakan
                                </m.div>
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <h4 className={`text-xl font-black tracking-tighter ${isVIP ? 'text-white' : 'text-slate-900'}`}>
                            {guestName}
                        </h4>
                        <p className={`font-mono text-[10px] font-bold tracking-[0.3em] ${isVIP ? 'text-white/40' : 'text-slate-400'}`}>
                            {checkInCode}
                        </p>
                    </div>
                </div>

                {/* Bottom Section: Details */}
                <div className={`p-6 mt-auto grid grid-cols-2 gap-4 border-t border-dashed ${isVIP ? 'border-white/10' : 'border-black/5'} bg-black/5`}>
                    <div className="space-y-1">
                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest block">Tipe Tamu</span>
                        <span className={`text-[10px] font-bold uppercase ${isVIP ? 'text-[#FFBF00]' : 'text-slate-600'}`}>
                            {isVIP ? 'VIP / VVIP' : 'Tamu Reguler'}
                        </span>
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest block">Verifikasi</span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3 h-3" /> Terverifikasi
                        </span>
                    </div>
                </div>

                {/* Ticket Punch Holes Visual */}
                <div className={`absolute left-0 top-[25%] -translate-x-1/2 w-6 h-6 rounded-full ${isVIP ? 'bg-[#050811]' : 'bg-[#f8fafc]'}`} />
                <div className={`absolute right-0 top-[25%] translate-x-1/2 w-6 h-6 rounded-full ${isVIP ? 'bg-[#050811]' : 'bg-[#f8fafc]'}`} />
            </m.div>

            {/* Action Button */}
            {!isEditor && (
                <m.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPass}
                    disabled={downloadState === 'loading'}
                    className="mt-6 flex items-center gap-3 px-8 h-14 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all group min-w-[64px] justify-center"
                >
                    {downloadState === 'loading' ? (
                        <PremiumLoader variant="inline" size="sm" color="#FFBF00" />
                    ) : downloadState === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in duration-300" />
                    ) : (
                        <Download className="w-5 h-5 text-[#FFBF00] group-hover:scale-110 transition-transform" />
                    )}
                </m.button>
            )}
        </div>
    );
};

// ============================================
// PARTICLES ELEMENT (Confetti, Fireworks, etc.)
// ============================================
export const ParticlesElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isPlaying = useStore(state => state.isPlaying);
    const resetNonce = useStore(state => state.resetNonce);
    const particlesRef = useRef<any[]>([]);

    useEffect(() => {
        onContentLoad?.();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const type = layer.type;

        const resize = () => {
            canvas.width = layer.width;
            canvas.height = layer.height;
        };
        resize();

        particlesRef.current = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            if (!isPlaying) return; 

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;

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

        if (isPlaying) {
            animationFrame = requestAnimationFrame(render);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [layer.type, layer.width, layer.height, isPlaying, resetNonce]);

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

    const rawConfig = layer.digitalGiftConfig || (layer as any).digital_gift_config || {};
    const config = {
        title: rawConfig.title || (rawConfig as any).title || 'Kado Digital',
        description: rawConfig.description || (rawConfig as any).description || 'Doa restu Anda adalah kado terindah, namun jika ingin memberi lebih...',
        bankName: rawConfig.bankName || (rawConfig as any).bank_name || 'Bank Central Asia',
        accountNumber: rawConfig.accountNumber || (rawConfig as any).account_number || '1234567890',
        accountHolder: rawConfig.accountHolder || (rawConfig as any).account_holder || 'John Doe',
        buttonText: rawConfig.buttonText || (rawConfig as any).button_text || '',
        theme: rawConfig.theme || (rawConfig as any).theme || 'gold',
        customColor: rawConfig.customColor || (rawConfig as any).custom_color || undefined
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
            </div>
        </div>
    );
};

// ============================================
// GIFT ADDRESS ELEMENT
// ============================================
import { GiftAddressCard } from './GiftAddressCard';

export const GiftAddressElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const rawConfig = layer.giftAddressConfig || (layer as any).gift_address_config || {};
    const config = {
        recipientName: rawConfig.recipientName || (rawConfig as any).recipient_name || 'Nama Penerima',
        phoneNumber: rawConfig.phoneNumber || (rawConfig as any).phone_number || (rawConfig as any).phone || '08XXXXXXXXXX',
        address: rawConfig.address || (rawConfig as any).address_detail || 'Alamat lengkap pengiriman kado/gift...',
        customColor: rawConfig.customColor || (rawConfig as any).custom_color || '#f8fafc'
    };

    return (
        <div
            className={`w-full h-full flex flex-col items-center justify-center ${isEditor ? 'p-0' : 'p-2 sm:p-4'}`}
        >
            <div className={`w-full flex flex-col items-center ${isEditor ? 'max-w-none' : 'max-w-[400px]'}`}>
                <GiftAddressCard
                    recipientName={config.recipientName}
                    phoneNumber={config.phoneNumber}
                    address={config.address}
                    customColor={config.customColor}
                    isPreview={isEditor}
                />
            </div>
        </div>
    );
};

// ============================================
// MUSIC PLAYER ELEMENT
// ============================================
export const MusicPlayerElement: React.FC<{ layer: Layer, isEditor?: boolean, onContentLoad?: () => void }> = ({ layer, isEditor, onContentLoad }) => {
    const playhead = useStore(state => state.playhead);
    useEffect(() => { onContentLoad?.(); }, []);
    const { play, pause, isPlaying: isAudioPlaying, currentUrl } = useAudioController();
    const config = layer.musicPlayerConfig || {
        audioUrl: '',
        title: 'Wedding March',
        artist: 'Classical',
        autoplay: false,
        loop: false,
        visualizerEnabled: false,
        visualizerColor: '#ffffff'
    };

    const handleToggle = () => {
        if (!config.audioUrl) return;
        if (currentUrl === config.audioUrl && isAudioPlaying) {
            pause();
        } else {
            play(config.audioUrl);
        }
    };

    const isThisPlaying = currentUrl === config.audioUrl && isAudioPlaying;
    const t = playhead / 1000;

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
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-premium-accent/40 rounded-full"
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-white truncate">{config.title || 'Untitled Track'}</div>
                <div className="text-[8px] text-white/40 truncate">{config.artist || 'Unknown Artist'}</div>
            </div>
            <div className="flex gap-1.5 items-center">
                {[0.4, 0.7, 0.3, 0.9, 0.5].map((h, i) => {
                    const barPhase = isThisPlaying ? Math.sin((t + i * 0.1) * Math.PI * 2) * 0.5 + 0.5 : 0.2;
                    return (
                        <div
                            key={i}
                            style={{ height: `${Math.max(4, barPhase * 20)}px` }}
                            className="w-0.5 bg-premium-accent/60 rounded-full"
                        />
                    );
                })}
            </div>
        </m.div>
    );
};

// ============================================
// ATMOSPHERIC VECTOR (Waves, Blobs)
// ============================================
export const AtmosphericVectorElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    const playhead = useStore(state => state.playhead);
    useEffect(() => { onContentLoad?.(); }, []);

    const config = layer.waveConfig || { amplitude: 30, frequency: 0.02, speed: 1, color: 'rgba(191, 161, 129, 0.4)' };
    const type = layer.type;
    const t = playhead / 1000;

    if (type === 'generative_blob') {
        const phase = Math.sin(t * (Math.PI * 2 / 5)); 
        const d = `M${150 + phase * 5},100c0,${27.6 + phase * 2.8}-22.4,${50 + phase * 5}-50,${50 + phase * 5}s-50-22.4-50-50s22.4-50,50-50S${150 + phase * 5},${72.4 - phase * 2.8},${150 + phase * 5},100z`;

        return (
            <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <path d={d} fill={config.color || 'rgba(191, 161, 129, 0.3)'} />
                </svg>
            </div>
        );
    }

    const wavePhase = Math.sin(t * (Math.PI * 2 / 4)); 
    const amp = config.amplitude || 30;
    const currentAmp = wavePhase * amp;

    const waveD = `M 0 ${layer.height / 2} Q ${layer.width / 4} ${layer.height / 2 - currentAmp} ${layer.width / 2} ${layer.height / 2} T ${layer.width} ${layer.height / 2} L ${layer.width} ${layer.height} L 0 ${layer.height} Z`;

    return (
        <div className="w-full h-full relative overflow-hidden">
            <svg viewBox={`0 0 ${layer.width} ${layer.height}`} preserveAspectRatio="none" className="w-full h-full">
                <path d={waveD} fill={config.color || 'rgba(191, 161, 129, 0.2)'} />
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
const XLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
    </svg>
);

const InstagramLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.44-.645-1.44-1.44s.645-1.44 1.44-1.44z" />
    </svg>
);

const TikTokLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.99 0-1.49.18-3.4 2.36-6.38 5.53-7.16.07-.02.14-.03.21-.04v4.28c-.57.08-1.14.24-1.64.52-.99.55-1.62 1.58-1.75 2.71-.02.19-.02.39 0 .58.02 1.13.51 2.24 1.43 2.94.39.3.85.52 1.32.63.45.11.92.17 1.39.13 1.17-.02 2.26-.67 2.84-1.63.46-.75.67-1.63.68-2.51.01-4.02-.01-8.04.01-12.06z" />
    </svg>
);

const WhatsAppLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.072 1.758-.713 2.008-1.403.25-.69.25-1.282.175-1.403-.075-.121-.272-.195-.57-.343zm-4.933 8.235c-2.392 0-4.726-.62-6.786-1.791L0 24l1.411-5.189c-1.285-2.228-1.965-4.768-1.965-7.363 0-6.612 5.388-12 12-12s12 5.388 12 12-5.388 12-12 12zm0-22c-5.514 0-10 4.486-10 10 0 2.225 1.238 4.377 3.213 5.61l.272.17-.85 3.12 3.2-.84.26.15c1.17.7 2.52 1.07 3.91 1.07 5.514 0 10-4.486 10-10s-4.486-10-10-10z" />
    </svg>
);

export const SocialMockupElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, [layer.socialMockupConfig, onContentLoad]);

    const config = (layer.socialMockupConfig || {
        platform: 'instagram',
        username: 'tamuu.id',
        variant: 'luxury',
        showIcon: true,
        fontFamily: 'Inter',
        fontSize: 18,
        textColor: '#ffffff'
    }) as any;
    
    const {
        platform = 'instagram',
        username = 'tamuu.id',
        variant = 'luxury',
        showIcon = true,
        fontFamily = 'Inter',
        fontSize,
        textColor
    } = config;

    const getPlatformInfo = () => {
        switch (platform) {
            case 'instagram': return { icon: <InstagramLogo size={20} />, color: '#E4405F', name: 'Instagram' };
            case 'twitter': 
            case 'x': return { icon: <XLogo size={18} />, color: '#000000', name: 'X' };
            case 'tiktok': return { icon: <TikTokLogo size={20} />, color: '#000000', name: 'TikTok' };
            case 'whatsapp': return { icon: <WhatsAppLogo size={20} />, color: '#25D366', name: 'WhatsApp' };
            default: return { icon: <Share2 size={20} />, color: '#6366f1', name: 'Social' };
        }
    };

    const info = getPlatformInfo();

    const getVariantStyles = () => {
        switch (variant) {
            case 'luxury':
                return {
                    container: {
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(25px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    },
                    text: 'text-white/90',
                    handle: 'text-white font-semibold tracking-tight',
                    iconColor: platform === 'instagram' ? 'text-[#E4405F]' : platform === 'whatsapp' ? 'text-[#25D366]' : 'text-white',
                    arrow: 'text-white/30'
                };
            case 'solid':
                return {
                    container: {
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    },
                    text: 'text-slate-500',
                    handle: 'text-slate-900 font-semibold tracking-tight',
                    iconColor: `text-[${info.color}]`,
                    arrow: 'text-slate-200'
                };
            case 'transparent':
            default:
                return {
                    container: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    text: 'text-white/60',
                    handle: 'text-white font-semibold tracking-tight',
                    iconColor: 'text-white',
                    arrow: 'text-white/20'
                };
        }
    };

    const styles = getVariantStyles();
    const textToCopy = platform === 'whatsapp' ? username : `@${username}`;

    return (
        <div
            className="w-full h-full px-6 flex items-center justify-between overflow-hidden transition-all duration-500 group"
            style={{
                ...styles.container,
                borderRadius: 20,
                maxHeight: layer.height > 80 ? 64 : undefined,
                margin: 'auto 0'
            }}
        >
            <div className="flex items-center gap-4 min-w-0">
                {showIcon && (
                    <div
                        className={`flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 ${styles.iconColor}`}
                        style={variant === 'solid' ? { color: info.color } : {}}
                    >
                        {info.icon}
                    </div>
                )}
                <div className="flex flex-col min-w-0 leading-none">
                    <span
                        className={`truncate ${styles.handle} text-sm md:text-base`}
                        style={{
                            fontFamily,
                            fontSize: fontSize || (layer.height > 80 ? 18 : 16),
                            color: textColor || undefined
                        }}
                    >
                        {username.startsWith('@') || platform === 'whatsapp' ? username : `@${username}`}
                    </span>
                </div>
            </div>

            <AnimatedCopyIcon
                text={textToCopy}
                size={18}
                className={`p-2 rounded-lg transition-all duration-300 active:scale-90 flex-shrink-0 ${variant === 'luxury' ? 'text-white/30 hover:text-white hover:bg-white/10' : variant === 'solid' ? 'text-slate-300 hover:text-slate-600 hover:bg-slate-100' : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}
                showToast={false}
            />
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
    const playhead = useStore(state => state.playhead);
    useEffect(() => { onContentLoad?.(); }, []);

    const text = layer.content || "ENTERPRISE LEVEL • UNICORN STANDARDS • AWARD WINNING DESIGN • ";
    const speed = 50; 
    const offset = -(playhead / 1000 * speed) % 400; 

    return (
        <div className="w-full h-full flex items-center overflow-hidden bg-premium-accent/10 border-y border-premium-accent/30 backdrop-blur-sm">
            <div
                style={{ transform: `translateX(${offset}px)` }}
                className="flex whitespace-nowrap gap-8"
            >
                {[...Array(6)].map((_, i) => (
                    <span key={i} className="text-[12px] font-black text-premium-accent tracking-[0.3em] uppercase">{text}</span>
                ))}
            </div>
        </div>
    );
};

// ============================================
// TILT CARD ELEMENT
// ============================================
export const TiltCardElement: React.FC<{ layer: Layer, onContentLoad?: () => void }> = ({ layer, onContentLoad }) => {
    const playhead = useStore(state => state.playhead);
    useEffect(() => { onContentLoad?.(); }, []);
    const t = playhead / 1000;
    const starScale = 1 + Math.sin(t * Math.PI * 2) * 0.1;

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
                        <Star className="w-5 h-5 text-premium-accent" style={{ transform: `scale(${starScale})` }} />
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

// ============================================
// LOVE STORY ELEMENT
// ============================================
export * from './LoveStoryElement';
export * from './LiveStreamingElement';
export * from './QuoteElement';
export * from './ProfileCardElement';
export * from './ProfilePhotoElement';
