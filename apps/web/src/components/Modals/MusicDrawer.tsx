import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    X, Music, Search, Play, Pause, ExternalLink,
    Disc, Volume2, SearchIcon, Radio, Globe,
    Check, ArrowRight, Music2
} from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';
import { useMusicLibrary, Song } from '@/hooks/queries';
import { useAudioController } from '@/hooks/useAudioController';
import { useStore } from '@/store/useStore';

interface MusicDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (song: any) => void;
    selectedSongId?: string;
}

const CATEGORIES = ['Semua', 'Instrumental', 'Piano', 'Classical'];

export const MusicDrawer: React.FC<MusicDrawerProps> = ({ isOpen, onClose, onSelect, selectedSongId }) => {
    const { showModal } = useStore();
    const { data: songs = [], isLoading } = useMusicLibrary();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('library'); // 'library' or 'gdrive'
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [gdriveUrl, setGdriveUrl] = useState('');

    const { play, pause, isPlaying, currentUrl, stop } = useAudioController();

    const filteredSongs = (songs as Song[]).filter((song: Song) => {
        const matchesCategory = activeCategory === 'Semua' || song.category === activeCategory;
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleGdriveSubmit = () => {
        if (!gdriveUrl.includes('drive.google.com')) {
            showModal({
                title: 'Link Tidak Valid',
                message: 'Silakan masukkan link Google Drive yang valid agar musik dapat diputar.',
                type: 'warning'
            });
            return;
        }

        const customSong = {
            id: `gdrive-${Date.now()}`,
            title: 'Custom Drive Audio',
            artist: 'Your Personal Music',
            url: gdriveUrl,
            category: 'Custom',
            source_type: 'gdrive'
        };

        onSelect(customSong);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Content */}
                    <m.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white/80 backdrop-blur-3xl shadow-2xl z-[101] flex flex-col border-l border-white/20"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    <Music2 className="w-6 h-6 text-pink-500" />
                                    Music Library
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pilih nada terbaik untuk undanganmu</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-4 border-b border-slate-100 gap-2">
                            <button
                                onClick={() => setActiveTab('library')}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'library'
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                <Disc className="w-4 h-4" />
                                Tamuu Library
                            </button>
                            <button
                                onClick={() => setActiveTab('gdrive')}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'gdrive'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                Google Drive
                            </button>
                        </div>

                        {/* Search & Categories (Library mode) */}
                        {activeTab === 'library' && (
                            <div className="p-4 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari lagu by judul atau artis..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1 -mx-1">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeCategory === cat
                                                ? 'bg-pink-100 text-pink-600 border-pink-200'
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                            {activeTab === 'library' ? (
                                <div className="space-y-3">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                            <PremiumLoader variant="inline" showLabel label="Symphony Loading..." color="#ec4899" />
                                        </div>
                                    ) : filteredSongs.length === 0 ? (
                                        <div className="text-center py-20">
                                            <Music2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-sm text-slate-400 font-medium">Lagu tidak ditemukan</p>
                                        </div>
                                    ) : (
                                        filteredSongs.map(song => (
                                            <m.div
                                                key={song.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => {
                                                    onSelect(song);
                                                    onClose();
                                                }}
                                                className={`group flex items-center gap-4 p-4 rounded-3xl border cursor-pointer transition-all ${selectedSongId === song.id
                                                    ? 'bg-pink-50 border-pink-200 ring-4 ring-pink-500/5'
                                                    : 'bg-white/50 border-slate-100 hover:border-pink-200 hover:bg-white hover:shadow-xl hover:shadow-pink-500/5'
                                                    }`}
                                            >
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (currentUrl === song.url && isPlaying) {
                                                            pause();
                                                        } else {
                                                            play(song.url);
                                                        }
                                                    }}
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${currentUrl === song.url && isPlaying
                                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                                                        : 'bg-pink-50 text-pink-500 group-hover:scale-110'
                                                        }`}
                                                >
                                                    {currentUrl === song.url && isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-800 text-sm truncate">{song.title}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{song.artist}</p>
                                                </div>
                                                {selectedSongId === song.id && (
                                                    <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
                                                        <Check className="w-4 h-4 stroke-[3]" />
                                                    </div>
                                                )}
                                            </m.div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm mb-4">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black text-indigo-900 text-lg tracking-tight mb-2">Gunakan Lagu Sendiri</h3>
                                        <p className="text-xs text-indigo-600/70 font-medium leading-relaxed mb-6">
                                            Masukkan link sharing Google Drive (Pastikan pengaturan file: "Siapa saja yang memiliki link") agar musik bisa terputar otomatis.
                                        </p>

                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Paste link Google Drive di sini..."
                                                value={gdriveUrl}
                                                onChange={(e) => setGdriveUrl(e.target.value)}
                                                className="w-full px-5 py-4 bg-white border border-indigo-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-indigo-200"
                                            />
                                            <button
                                                onClick={handleGdriveSubmit}
                                                className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                            >
                                                Terapkan Musik
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cara Mendapatkan Link</h4>
                                        <ol className="space-y-3 text-xs text-slate-500 font-medium list-decimal pl-4">
                                            <li>Upload lagu MP3 ke Google Drive Anda.</li>
                                            <li>Klik kanan file {'>'} Share {'>'} Get link.</li>
                                            <li>Ubah akses menjadi <strong>"Anyone with the link"</strong>.</li>
                                            <li>Copy link dan paste di kotak atas.</li>
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Player Sticky Footer */}
                        {currentUrl && (
                            <m.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-4 bg-white border-t border-slate-100 shadow-[-10px_-10px_30px_rgba(0,0,0,0.02)]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-pink-500 relative overflow-hidden">
                                        <Disc className={`w-6 h-6 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                                        {isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                                                {[...Array(4)].map((_, i) => (
                                                    <m.div
                                                        key={i}
                                                        animate={{ height: [4, 12, 4] }}
                                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                                        className="w-1 bg-pink-500/30 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-0.5">Previewing Track</p>
                                        <p className="text-xs font-bold text-slate-800 truncate">
                                            {currentUrl.includes('gdrive') ? 'Google Drive Audio' : (songs.find(s => s.url === currentUrl)?.title || 'Playing...')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => isPlaying ? pause() : play()}
                                            className="p-3 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-100 transition-colors"
                                        >
                                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                        </button>
                                        <button
                                            onClick={stop}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </m.div>
                        )}
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
};
