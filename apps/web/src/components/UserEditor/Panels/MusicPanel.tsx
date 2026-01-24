import React, { useState } from 'react';
import { m } from 'framer-motion';
import {
    Music, Play, Pause, Search, Plus, Radio, Crown,
    Disc, Settings, ExternalLink, Music2,
    ChevronRight, Volume2
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { MusicDrawer } from '../../Modals/MusicDrawer';
import { useAudioController } from '@/hooks/useAudioController';
import { patchLegacyUrl } from '@/lib/utils';
import { useProfileStore } from '@/store/useProfileStore';
import { music as musicApi } from '@/lib/api';
import { musicCompressor } from '@/lib/audio-compressor';
import { Upload, AlertCircle, HardDrive } from 'lucide-react';

export const MusicPanel: React.FC = () => {
    const { music, setMusic } = useStore();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { play, pause, stop, currentUrl, isPlaying } = useAudioController();
    const { profile } = useProfileStore();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    const isELITE = profile?.tier === 'vvip';

    const handleSelectSong = (song: any) => {
        const patchedUrl = patchLegacyUrl(song.url);

        setMusic({
            id: song.id,
            url: patchedUrl,
            title: song.title,
            artist: song.artist,
            source_type: song.source_type || 'library'
        });

        // Auto-play the selection
        play(patchedUrl);
    };

    const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        try {
            setIsUploading(true);
            setUploadStatus('Compressing...');

            // 1. Transcode to AAC @ 96kbps
            const compressedBlob = await musicCompressor.compress(file);

            setUploadStatus('Getting Upload URL...');
            // 2. Get Presigned URL (using our secured proxy flow)
            const { uploadUrl, publicUrl, key } = await musicApi.getPresignedUrl(profile.id, file.name);

            setUploadStatus('Uploading...');
            // 3. Upload to R2
            await musicApi.uploadToR2(uploadUrl, compressedBlob);

            setUploadStatus('Finalizing...');
            // 4. Update Store
            setMusic({
                id: `user-${Date.now()}`,
                url: publicUrl,
                title: file.name.split('.')[0],
                artist: 'Custom Upload',
                source_type: 'user'
            });

            play(publicUrl);
            setUploadStatus(null);
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadStatus('Error!');
            setTimeout(() => setUploadStatus(null), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOptimizeLibrary = async () => {
        // IDs of the Popular 3
        const coreTracks = [
            { id: 'pop-1', title: 'Beautiful in White (Piano)', artist: 'Wedding Piano', url: 'https://api.tamuu.id/assets/music/pop-biw.mp3' },
            { id: 'pop-2', title: 'A Thousand Years (Violin)', artist: 'Classic Strings', url: 'https://api.tamuu.id/assets/music/pop-aty.mp3' },
            { id: 'pop-3', title: 'Perfect (Cello)', artist: 'Modern Cello', url: 'https://api.tamuu.id/assets/music/pop-perfect.mp3' }
        ];

        try {
            setIsUploading(true);
            for (const track of coreTracks) {
                setUploadStatus(`Optimizing ${track.title}...`);

                // Fetch original MP3
                const response = await fetch(track.url);
                const blob = await response.blob();
                const file = new File([blob], `${track.id}.mp3`, { type: 'audio/mpeg' });

                // Transcode
                const compressedBlob = await musicCompressor.compress(file);

                // Upload as .m4a to the same path handled by the SQL migration
                const key = `music/${track.id}.m4a`;
                const uploadUrl = `https://api.tamuu.id/api/music/upload?key=${encodeURIComponent(key)}`;

                await musicApi.uploadToR2(uploadUrl, compressedBlob);
            }
            setUploadStatus('Library Optimized!');
            setTimeout(() => setUploadStatus(null), 3000);
        } catch (err) {
            console.error('Optimization failed:', err);
            setUploadStatus('Opt. Error!');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Current Selection */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Music2 className="w-24 h-24 rotate-12" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                            <Disc className={`w-6 h-6 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-sm uppercase tracking-widest">Background Music</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Symphony</p>
                        </div>
                    </div>

                    {music ? (
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 mb-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => isPlaying ? pause() : play(music.url)}
                                    className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 hover:scale-110 transition-transform"
                                >
                                    {isPlaying && currentUrl === music.url ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-white text-sm truncate">{music.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{music.artist}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 border-dashed mb-6 flex flex-col items-center justify-center text-center">
                            <Music className="w-8 h-8 text-slate-500 mb-3" />
                            <p className="text-xs text-slate-400 font-medium italic">Belum ada musik dipilih</p>
                        </div>
                    )}

                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="w-full py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {music ? 'Ganti Musik' : 'Pilih Musik Library'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Premium: Custom Music Upload (ELITE Only) */}
            {isELITE ? (
                <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-100 rounded-[2.5rem] border border-pink-200 group relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm group-hover:scale-110 transition-transform">
                            {isUploading ? (
                                <PremiumLoader variant="inline" size="sm" color="#ec4899" />
                            ) : (
                                <Upload className="w-6 h-6" />
                            )}
                        </div>
                        <div className="px-3 py-1 bg-pink-500 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg shadow-pink-500/20">
                            ELITE EXCLUSIVE
                        </div>
                    </div>

                    <h4 className="font-black text-rose-900 text-sm tracking-tight mb-1">
                        {uploadStatus || 'Upload Musik Sendiri'}
                    </h4>
                    <p className="text-[10px] text-rose-600/70 font-bold uppercase tracking-widest mb-4">
                        Lean-Audio Optimized (AAC)
                    </p>

                    <label className="block cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            accept="audio/*"
                            onChange={handleCustomUpload}
                            disabled={isUploading}
                        />
                        <div className="w-full py-4 bg-white text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                            {isUploading ? 'Processing...' : 'Pilih File Audio'}
                            <Music className="w-4 h-4" />
                        </div>
                    </label>
                </div>
            ) : (
                <div
                    onClick={() => navigate('/upgrade')}
                    className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 border-dashed group cursor-pointer hover:bg-slate-100 transition-colors"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Custom Upload</h4>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Upgrade ke ELITE untuk upload musik sendiri.</p>
                </div>
            )}

            {/* Google Drive Fast Access */}
            <div
                onClick={() => setIsDrawerOpen(true)}
                className="p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors group"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div className="px-3 py-1 bg-white rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 shadow-sm">
                        Popular Option
                    </div>
                </div>
                <h4 className="font-black text-indigo-900 text-sm tracking-tight mb-1">Pakai Link Google Drive</h4>
                <p className="text-[10px] text-indigo-600/70 font-bold uppercase tracking-widest">Zero Storage Integration</p>
            </div>

            {/* Admin/CTO: Library Optimizer (Visible only if dev/admin) */}
            {(profile?.role === 'admin' || profile?.email?.includes('shafania')) && (
                <div className="p-4 bg-slate-900 rounded-3xl border border-slate-700">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">System Maintenance</h5>
                    <button
                        onClick={handleOptimizeLibrary}
                        disabled={isUploading}
                        className="w-full py-2 bg-slate-800 text-slate-400 font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Settings className="w-3 h-3" />
                        {isUploading ? 'Optimizing...' : 'Optimize Core Library (.m4a)'}
                    </button>
                </div>
            )}

            {/* Autoplay & Policy Info */}
            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                        <Radio className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Smart Autoplay</h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enhanced Guest Experience</p>
                    </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tamuu menggunakan sistem <strong>Force Autoplay</strong>. Musik akan terputar otomatis segera setelah tamu berinteraksi dengan undangan.
                </p>
            </div>

            {/* Music Drawer */}
            <MusicDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSelect={handleSelectSong}
                selectedSongId={music?.id}
            />
        </div>
    );
};

// Mock Globe icon since it's used in the code but not imported in original snippet (assuming lucide-react has it)
const Globe = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
