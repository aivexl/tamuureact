import React, { useState } from 'react';
import { m } from 'framer-motion';
import {
    Music, Play, Pause, Search, Plus, Radio, Crown,
    Loader2, Disc, Settings, ExternalLink, Music2,
    ChevronRight, Volume2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { MusicDrawer } from '../../Modals/MusicDrawer';
import { useAudioController } from '@/hooks/useAudioController';

export const MusicPanel: React.FC = () => {
    const { user, music, setMusic } = useStore();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { play, pause, isPlaying, currentUrl } = useAudioController();

    const handleSelectSong = (song: any) => {
        setMusic({
            id: song.id,
            url: song.url,
            title: song.title,
            artist: song.artist,
            source_type: song.source_type || 'library'
        });

        // Auto-play the selection
        play(song.url);
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
