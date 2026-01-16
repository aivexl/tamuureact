import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { Music, Upload, Trash2, Play, Pause, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { music as musicApi } from '../lib/api';

interface MusicTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
    category: string;
    duration: string;
    created_at: string;
}

const CATEGORIES = ['Traditional', 'Instrumental', 'Mixed'];

export const AdminMusicPage: React.FC = () => {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

    // Upload form state
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadArtist, setUploadArtist] = useState('');
    const [uploadCategory, setUploadCategory] = useState('Traditional');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // Fetch music list
    const fetchTracks = useCallback(async () => {
        try {
            const data = await musicApi.list();
            setTracks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch music:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.includes('audio/')) {
                setUploadError('Please select an audio file (MP3)');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                return;
            }
            setUploadFile(file);
            setUploadError('');
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!uploadTitle || !uploadArtist || !uploadFile) {
            setUploadError('Please fill all fields and select a file');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('title', uploadTitle);
            formData.append('artist', uploadArtist);
            formData.append('category', uploadCategory);
            formData.append('file', uploadFile);

            await musicApi.upload(formData);

            setUploadSuccess(`"${uploadTitle}" uploaded successfully!`);
            setUploadTitle('');
            setUploadArtist('');
            setUploadFile(null);
            fetchTracks();

            setTimeout(() => setUploadSuccess(''), 3000);
        } catch (err: any) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

        try {
            await musicApi.delete(id);
            setTracks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // Handle play/pause
    const togglePlay = (track: MusicTrack) => {
        if (playingId === track.id) {
            audioRef?.pause();
            setPlayingId(null);
        } else {
            if (audioRef) audioRef.pause();
            const audio = new Audio(track.url);
            audio.play();
            audio.onended = () => setPlayingId(null);
            setAudioRef(audio);
            setPlayingId(track.id);
        }
    };

    // Filter tracks
    const filteredTracks = tracks.filter(track => {
        const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Category counts
    const categoryCounts = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = tracks.filter(t => t.category === cat).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Music className="w-8 h-8 text-teal-400" />
                        Music Library
                    </h1>
                    <p className="text-slate-400">
                        Manage your curated music collection. Upload, preview, and organize tracks.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-teal-400">{tracks.length}</div>
                    <div className="text-sm text-slate-500">Total Tracks</div>
                </div>
            </div>

            {/* Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-teal-900/20 to-emerald-900/20 border border-teal-500/20 rounded-3xl p-8 mb-10"
            >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-teal-400" />
                    Upload New Track
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Song Title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Artist Name"
                        value={uploadArtist}
                        onChange={(e) => setUploadArtist(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                    />
                    <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <label className="bg-black/30 border border-dashed border-white/20 rounded-xl px-4 py-3 text-slate-400 cursor-pointer hover:border-teal-500 hover:text-teal-400 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadFile ? uploadFile.name.substring(0, 20) + '...' : 'Choose MP3'}
                        <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {uploadError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 flex items-center gap-2 text-rose-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {uploadError}
                        </motion.div>
                    )}
                    {uploadSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 flex items-center gap-2 text-emerald-400 text-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {uploadSuccess}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleUpload}
                    disabled={isUploading || !uploadFile}
                    className="mt-6 px-8 py-3 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Upload Track
                        </>
                    )}
                </button>
            </motion.div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${selectedCategory === 'all'
                            ? 'bg-teal-500 text-slate-900'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                    >
                        All ({tracks.length})
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${selectedCategory === cat
                                ? 'bg-teal-500 text-slate-900'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                        >
                            {cat} ({categoryCounts[cat] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Tracks Table */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    </div>
                ) : filteredTracks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Music className="w-12 h-12 mb-4 opacity-50" />
                        <p>No tracks found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Track</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTracks.map((track, i) => (
                                <motion.tr
                                    key={track.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => togglePlay(track)}
                                                className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center hover:bg-teal-500 hover:text-slate-900 transition-colors"
                                            >
                                                {playingId === track.id ? (
                                                    <Pause className="w-4 h-4 fill-current" />
                                                ) : (
                                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                                )}
                                            </button>
                                            <div>
                                                <p className="font-bold text-white">{track.title}</p>
                                                <p className="text-sm text-slate-500">{track.artist}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${track.category === 'Traditional' ? 'bg-amber-500/10 text-amber-400' :
                                            track.category === 'Instrumental' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {track.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">{track.duration || '--:--'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(track.id, track.title)}
                                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
};
