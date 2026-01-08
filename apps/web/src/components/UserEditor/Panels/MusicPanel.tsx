import React from 'react';
import { m } from 'framer-motion';
import { Music, Play, Pause, Search, Plus, Radio, Crown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

const MOCK_SONGS = [
    { id: '1', title: 'A Thousand Years', artist: 'Christina Perri', duration: '4:45', category: 'Romantic' },
    { id: '2', title: 'Can\'t Help Falling In Love', artist: 'Elvis Presley', duration: '3:01', category: 'Classic' },
    { id: '3', title: 'Perfect', artist: 'Ed Sheeran', duration: '4:23', category: 'Pop' },
    { id: '4', title: 'Beautiful in White', artist: 'Shane Filan', duration: '3:52', category: 'Romantic' },
];

export const MusicPanel: React.FC = () => {
    const { user } = useStore();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Search and Upload */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari lagu romantis..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={() => {
                        if (user?.tier === 'vvip') {
                            // Trigger upload logic
                        } else {
                            navigate('/upgrade');
                        }
                    }}
                    className={`relative group px-4 py-3 border border-slate-100 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest whitespace-nowrap shadow-sm ${user?.tier === 'vvip' ? 'bg-white text-slate-600 hover:bg-slate-50' : 'bg-slate-50 text-slate-400'
                        }`}
                >
                    <Plus className={`w-4 h-4 ${user?.tier === 'vvip' ? 'text-pink-500' : 'text-slate-300'}`} />
                    Upload MP3
                    {user?.tier !== 'vvip' && (
                        <div className="absolute inset-x-0 -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
                            <div className="bg-[#0A1128] text-[#FFBF00] text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl border border-white/10 flex items-center gap-1.5 w-max mx-auto">
                                <Crown className="w-3 h-3" />
                                VVIP Feature
                            </div>
                        </div>
                    )}
                </button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                {['Semua', 'Romantic', 'Classic', 'Pop', 'Instrumental', 'Religious'].map((cat) => (
                    <button key={cat} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${cat === 'Semua' ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Song List */}
            <div className="grid grid-cols-1 gap-3">
                {MOCK_SONGS.map((song) => (
                    <m.div
                        key={song.id}
                        whileHover={{ y: -2 }}
                        className="group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[2rem] hover:border-pink-200 transition-all hover:shadow-xl hover:shadow-pink-500/5"
                    >
                        <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Play className="w-5 h-5 fill-current" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-800 tracking-tight text-sm truncate">{song.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{song.artist}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{song.duration}</p>
                            <button className="px-3 py-1 bg-slate-50 text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-lg border border-slate-100 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all">
                                Pilih
                            </button>
                        </div>
                    </m.div>
                ))}
            </div>

            {/* Bottom Info */}
            <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-[2rem] border border-pink-100/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm shadow-pink-500/10">
                    <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                    <h5 className="font-black text-slate-800 tracking-tight text-xs uppercase tracking-widest">Autoplay Aktif</h5>
                    <p className="text-[10px] text-slate-500 font-medium">Lagu akan diputar otomatis saat undangan dibuka.</p>
                </div>
            </div>
        </div>
    );
};
