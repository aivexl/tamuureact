/**
 * LiveStreamPanel - Live Streaming Link Management
 * Allows users to add YouTube/Zoom/etc live streaming links
 */

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import {
    Video,
    Save,
    Loader2,
    Check,
    AlertCircle,
    ExternalLink,
    Youtube,
    Link2
} from 'lucide-react';
import { invitations as invitationsApi } from '@/lib/api';

interface LiveStreamPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const LiveStreamPanel: React.FC<LiveStreamPanelProps> = ({ invitationId, onClose }) => {
    const [streamUrl, setStreamUrl] = useState('');
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

    // Detect platform from URL
    const detectPlatform = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('zoom.us')) return 'zoom';
        if (url.includes('meet.google.com')) return 'google-meet';
        if (url.includes('teams.microsoft.com')) return 'teams';
        if (url.includes('twitch.tv')) return 'twitch';
        return 'other';
    };

    const platform = detectPlatform(streamUrl);

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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Data...</p>
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
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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

                {/* Platform Detection */}
                {platform && streamUrl && (
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 ml-4"
                    >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${platform === 'youtube' ? 'bg-red-100 text-red-600' :
                                platform === 'zoom' ? 'bg-blue-100 text-blue-600' :
                                    platform === 'google-meet' ? 'bg-green-100 text-green-600' :
                                        platform === 'teams' ? 'bg-purple-100 text-purple-600' :
                                            'bg-slate-100 text-slate-600'
                            }`}>
                            <Video className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 capitalize">
                            {platform === 'youtube' ? 'YouTube Live' :
                                platform === 'zoom' ? 'Zoom Meeting' :
                                    platform === 'google-meet' ? 'Google Meet' :
                                        platform === 'teams' ? 'Microsoft Teams' :
                                            'Live Streaming'}
                        </span>
                        <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Test Link
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
