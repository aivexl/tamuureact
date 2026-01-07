import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Calendar,
    User,
    ExternalLink,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Hash
} from 'lucide-react';
import { rsvp as rsvpApi } from '@/lib/api';
import { useSEO } from '@/hooks/useSEO';

interface WishData {
    id: string;
    invitation_id: string;
    name: string;
    message: string;
    attendance: string;
    is_visible: number;
    submitted_at: string;
    invitation_name: string;
    invitation_slug: string;
}

export const GuestWishesPage: React.FC = () => {
    const [wishes, setWishes] = useState<WishData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useSEO({
        title: 'Manajemen Ucapan - Tamuu',
        description: 'Kelola ucapan dan pesan dari tamu undangan Anda.',
    });

    const loadWishes = async () => {
        setLoading(true);
        try {
            const data = await rsvpApi.listAll();
            setWishes(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load wishes:', err);
            setError('Gagal memuat ucapan tamu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWishes();
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleToggleVisibility = async (wish: WishData) => {
        const newStatus = wish.is_visible === 1 ? 0 : 1;
        try {
            await rsvpApi.updateStatus(wish.id, { is_visible: !!newStatus });
            setWishes(prev => prev.map(w => w.id === wish.id ? { ...w, is_visible: newStatus } : w));
            showNotification('success', `Ucapan ${newStatus ? 'ditampilkan' : 'disembunyikan'}`);
        } catch (err) {
            showNotification('error', 'Gagal memperbarui status ucapan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus ucapan ini selamanya?')) return;
        try {
            await rsvpApi.delete(id);
            setWishes(prev => prev.filter(w => w.id !== id));
            showNotification('success', 'Ucapan berhasil dihapus');
        } catch (err) {
            showNotification('error', 'Gagal menghapus ucapan');
        }
    };

    const filteredWishes = wishes.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.invitation_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: wishes.length,
        visible: wishes.filter(w => w.is_visible === 1).length,
        hidden: wishes.filter(w => w.is_visible === 0).length,
    };

    if (loading && wishes.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Memuat ucapan tamu...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <Link to="/dashboard" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-3 h-3 mr-1.5" /> Kembali
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ucapan Tamu</h1>
                        <p className="text-slate-500 font-medium">Kelola pesan manis dan doa restu dari para tamu undangan Anda.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                                <p className="text-sm font-black text-slate-900">{stats.total}</p>
                            </div>
                            <div className="w-px h-6 bg-slate-100" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-emerald-500 uppercase">Visible</p>
                                <p className="text-sm font-black text-slate-900">{stats.visible}</p>
                            </div>
                            <div className="w-px h-6 bg-slate-100" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-rose-400 uppercase">Hidden</p>
                                <p className="text-sm font-black text-slate-900">{stats.hidden}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, pesan, atau nama undangan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 outline-none font-medium text-slate-700"
                        />
                    </div>
                    <button
                        onClick={loadWishes}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        Refresh
                    </button>
                </div>

                {/* Main Content */}
                {error ? (
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center text-red-600 flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12" />
                        <p className="font-bold">{error}</p>
                        <button onClick={loadWishes} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Coba Lagi</button>
                    </div>
                ) : filteredWishes.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center space-y-4 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">Belum Ada Ucapan</h3>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">Ucapan dari tamu yang mengisi RSVP akan muncul di sini secara otomatis.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWishes.map((wish) => (
                            <m.div
                                key={wish.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`group relative bg-white rounded-[2.5rem] border ${wish.is_visible === 1 ? 'border-slate-100' : 'border-rose-100 bg-rose-50/30'} p-6 shadow-sm hover:shadow-xl transition-all duration-500`}
                            >
                                {wish.is_visible === 0 && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest z-10">
                                        Hidden
                                    </div>
                                )}

                                <div className="space-y-5">
                                    {/* Sender Info */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-800 truncate leading-tight">{wish.name}</h4>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(wish.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="relative">
                                        <div className="absolute -left-2 -top-2 text-slate-100 group-hover:text-teal-100 transition-colors font-serif text-6xl leading-none">“</div>
                                        <p className="relative z-10 text-sm text-slate-600 font-medium leading-relaxed italic">
                                            {wish.message}
                                        </p>
                                    </div>

                                    {/* Invitation Info */}
                                    <div className="pt-5 border-t border-slate-50 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Undangan:</span>
                                            <Link
                                                to={`/preview/${wish.invitation_slug}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest"
                                            >
                                                {wish.invitation_name}
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Kehadiran:</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${wish.attendance === 'attending' ? 'bg-emerald-50 text-emerald-600' :
                                                    wish.attendance === 'maybe' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                {wish.attendance === 'attending' ? 'Hadir' : wish.attendance === 'maybe' ? 'Mungkin' : 'Tidak Hadir'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            onClick={() => handleToggleVisibility(wish)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${wish.is_visible === 1
                                                    ? 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                                                    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
                                                }`}
                                        >
                                            {wish.is_visible === 1 ? (
                                                <><EyeOff className="w-4 h-4" /> Sembunyikan</>
                                            ) : (
                                                <><Eye className="w-4 h-4" /> Tampilkan</>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(wish.id)}
                                            className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <m.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-8 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold border ${notification.type === 'success'
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-rose-500 text-white border-rose-400'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {notification.message}
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestWishesPage;
