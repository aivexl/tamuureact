/**
 * LiveStreamPanel - Live Streaming Link Management
 * Allows users to add YouTube/Zoom/etc live streaming links
 */

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import {
    Video,
    Check,
    AlertCircle,
    ExternalLink,
    Youtube,
    Instagram,
    Link2,
    Monitor,
    Camera,
    Cast,
    Info
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations as invitationsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface LiveStreamPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const LiveStreamPanel: React.FC<LiveStreamPanelProps> = ({ invitationId, onClose }) => {
    const { sections, updateElementInSection } = useStore();
    const [streamUrl, setStreamUrl] = useState('');
    const [platform, setPlatform] = useState<string | null>(null);
    const [isManualPlatform, setIsManualPlatform] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load existing livestream URL
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitationsApi.get(invitationId);
                if (data?.livestream_url) {
                    setStreamUrl(data.livestream_url);
                    // Try to find the platform from the canvas elements first
                    const liveLayer = sections
                        .flatMap(s => s.elements)
                        .find(el => el.type === 'live_streaming');

                    if (liveLayer?.liveStreamingConfig?.platform) {
                        setPlatform(liveLayer.liveStreamingConfig.platform);
                        setIsManualPlatform(true);
                    }
                }
            } catch (err) {
                console.error('[LiveStreamPanel] Load error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (invitationId) {
            loadData();
        }
    }, [invitationId]);

    // Detect platform from URL (if not manually overridden)
    const detectedPlatform = (url: string) => {
        if (!url) return null;
        const lowUrl = url.toLowerCase();
        if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'youtube';
        if (lowUrl.includes('zoom.us')) return 'zoom';
        if (lowUrl.includes('meet.google.com')) return 'meet';
        if (lowUrl.includes('teams.microsoft.com')) return 'teams';
        if (lowUrl.includes('twitch.tv')) return 'twitch';
        if (lowUrl.includes('tiktok.com')) return 'tiktok';
        if (lowUrl.includes('instagram.com')) return 'instagram';
        return 'other';
    };

    // Auto-detect if not manually selected
    useEffect(() => {
        if (!isManualPlatform) {
            const detected = detectedPlatform(streamUrl);
            setPlatform(detected);
        }
    }, [streamUrl, isManualPlatform]);

    // REAL-TIME SYNC: Update Store when local state changes
    useEffect(() => {
        if (!loading) {
            // Find any live_streaming layer across all sections
            sections.forEach(section => {
                section.elements.forEach(el => {
                    if (el.type === 'live_streaming') {
                        updateElementInSection(section.id, el.id, {
                            liveStreamingConfig: {
                                ...el.liveStreamingConfig,
                                url: streamUrl,
                                platform: (platform as any) || 'other',
                                title: el.liveStreamingConfig?.title || 'Live Streaming',
                                themeColor: el.liveStreamingConfig?.themeColor || '#e11d48',
                                isLive: el.liveStreamingConfig?.isLive || false
                            }
                        });
                    }
                });
            });
        }
    }, [streamUrl, platform, loading]);

    const PLATFORMS = [
        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'zoom', label: 'Zoom', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'meet', label: 'Meet', icon: Monitor, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'tiktok', label: 'TikTok', icon: Camera, color: 'text-slate-900', bg: 'bg-slate-100' },
        { id: 'twitch', label: 'Twitch', icon: Cast, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'other', label: 'Other', icon: ExternalLink, color: 'text-slate-500', bg: 'bg-slate-50' }
    ];

    // Save handler
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await invitationsApi.update(invitationId, {
                livestream_url: streamUrl
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            console.error('[LiveStreamPanel] Save error:', err);
            setError('Gagal menyimpan link streaming');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Memuat Data..." color="#e11d48" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Live Streaming</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            YouTube, Zoom, Google Meet, dll
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${saving
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : success
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                >
                    {saving && <PremiumLoader variant="inline" size="sm" color="white" />}
                    {success && <Check className="w-4 h-4" />}
                    {saving ? 'Menyimpan...' : success ? 'Tersimpan!' : 'Simpan'}
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2rem] p-6 border border-rose-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Youtube className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-1">Siarkan Momen Spesialmu</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Bagikan link live streaming agar tamu yang tidak bisa hadir tetap bisa menyaksikan acara secara online.
                        </p>
                    </div>
                </div>
            </div>

            {/* URL Input */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                    Link Live Streaming
                </label>
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                        <Link2 className="w-5 h-5 text-slate-300" />
                    </div>
                    <input
                        type="url"
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        placeholder="https://youtube.com/live/xxxxx atau https://zoom.us/j/xxxxx"
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 outline-none text-base font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                    />
                </div>

                {/* Platform Selection Buttons */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between ml-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Pilih Provider
                        </label>
                        {isManualPlatform && (
                            <button
                                onClick={() => setIsManualPlatform(false)}
                                className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                            >
                                Reset Auto-Detect
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {PLATFORMS.map((p) => {
                            const Icon = p.icon;
                            const isActive = platform === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setPlatform(p.id);
                                        setIsManualPlatform(true);
                                    }}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 ${isActive
                                        ? 'border-rose-500 bg-rose-50 ring-4 ring-rose-500/10'
                                        : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                                        <Icon className={`w-5 h-5 ${isActive ? p.color : 'text-slate-400'}`} />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-rose-600' : 'text-slate-400'}`}>
                                        {p.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Test Link Card */}
                {streamUrl && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${PLATFORMS.find(p => p.id === platform)?.bg || 'bg-slate-200'
                            }`}>
                            {(() => {
                                const activeP = PLATFORMS.find(p => p.id === platform);
                                const Icon = activeP?.icon || ExternalLink;
                                return <Icon className={`w-6 h-6 ${activeP?.color || 'text-slate-500'}`} />;
                            })()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-ellipsis overflow-hidden">
                                {streamUrl}
                            </p>
                            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                {PLATFORMS.find(p => p.id === platform)?.label || 'Link Streaming'}
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </h5>
                        </div>
                        <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-rose-600 hover:text-rose-700 hover:shadow-sm transition-all shrink-0"
                            title="Buka Link di Tab Baru"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    </m.div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Tips</h5>
                <ul className="space-y-2 text-sm text-slate-500">
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        Pastikan link streaming Anda sudah benar dan bisa diakses publik
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        Untuk YouTube, gunakan link "Live" atau "Premiere"
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        Untuk Zoom, pastikan meeting tidak memerlukan password atau sertakan passwordnya
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default LiveStreamPanel;
