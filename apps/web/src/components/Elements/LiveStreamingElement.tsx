import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Youtube,
    Instagram,
    Video,
    Monitor,
    Calendar,
    ExternalLink,
    Clock,
    Camera,
    Cast
} from 'lucide-react';
import { Layer } from '@/store/layersSlice';

interface LiveStreamingElementProps {
    layer: Layer;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

const PLATFORM_CONFIG = {
    youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube Live' },
    instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram Live' },
    zoom: { icon: Video, color: '#2D8CFF', label: 'Zoom Meeting' },
    meet: { icon: Monitor, color: '#00AC47', label: 'Google Meet' },
    tiktok: { icon: Camera, color: '#000000', label: 'TikTok Live' },
    twitch: { icon: Cast, color: '#9146FF', label: 'Twitch' },
    other: { icon: ExternalLink, color: '#64748b', label: 'Live Stream' }
};

export const LiveStreamingElement: React.FC<LiveStreamingElementProps> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const config = layer.liveStreamingConfig;
    const {
        url = '',
        title = 'Streaming Bareng Kami',
        startTime,
        platform: manualPlatform,
        customLabel,
        themeColor = '#14b8a6', // Default Tamuu Teal
        isLive = true, // Default to true for visual impact
        variant = 'transparent' // Default changed to transparent for better look in stream
    } = config || {};

    // Smart platform detection
    const platform = useMemo(() => {
        if (manualPlatform) return manualPlatform;
        const lowUrl = url.toLowerCase();
        if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'youtube';
        if (lowUrl.includes('instagram.com')) return 'instagram';
        if (lowUrl.includes('zoom.us')) return 'zoom';
        if (lowUrl.includes('meet.google.com')) return 'meet';
        if (lowUrl.includes('tiktok.com')) return 'tiktok';
        if (lowUrl.includes('twitch.tv')) return 'twitch';
        return 'other';
    }, [url, manualPlatform]);

    const info = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other;
    const Icon = info.icon;

    const handleJoin = () => {
        if (url) window.open(url, '_blank');
    };

    const handleAddToCalendar = () => {
        // Simple Google Calendar link generator
        const eventTitle = encodeURIComponent(`Live Streaming: ${title}`);
        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}`;
        window.open(googleUrl, '_blank');
    };

    const cardStyles = variant === 'solid'
        ? {
            backgroundColor: themeColor,
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
        }
        : {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
        };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto relative group"
        >
            {/* Main Glass Card */}
            <div
                className={`relative overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/10`}
                style={cardStyles}
            >
                {/* Background Glow */}
                <div
                    className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-colors duration-500"
                    style={{ backgroundColor: themeColor }}
                />

                {/* Header: Title & Live Indicator */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 pr-4">
                        <h3 className="text-white font-bold text-lg leading-tight mb-1">
                            {title}
                        </h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            {customLabel || info.label}
                        </p>
                    </div>

                    {isLive && (
                        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                            />
                            <span className="text-rose-500 text-[9px] font-black tracking-widest uppercase">Live</span>
                        </div>
                    )}
                </div>

                {/* Content: Platform Icon & Time */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Icon
                            className="w-7 h-7"
                            style={{ color: platform === 'other' ? themeColor : info.color }}
                        />
                    </div>

                    {startTime && (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Waktu Mulai</span>
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {startTime}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleJoin}
                        className="w-full py-3.5 rounded-2xl bg-white text-[#0f0f0f] font-black text-xs uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Nonton Sekarang
                        <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleAddToCalendar}
                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-white/50 font-bold text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        Ingatkan Saya
                    </button>
                </div>

                {/* Subtle Decorative Element */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        </motion.div>
    );
};
