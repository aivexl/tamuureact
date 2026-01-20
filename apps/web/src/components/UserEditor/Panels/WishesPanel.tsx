/**
 * WishesPanel - Guest Messages Management
 * Displays and allows management of guest wishes/messages.
 */

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Trash2,
    Eye,
    EyeOff,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Filter
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { rsvp as rsvpApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { ConfirmationModal } from '@/components/Modals/ConfirmationModal';

interface Wish {
    id: string;
    invitation_id: string;
    name: string;
    message: string;
    attendance: 'attending' | 'not_attending' | 'maybe';
    is_visible: boolean;
    submitted_at: string;
}

export const WishesPanel: React.FC = () => {
    const { id: invitationId } = useStore();
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

    // Modal states
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (invitationId) {
            fetchWishes();
        }
    }, [invitationId]);

    const fetchWishes = async () => {
        if (!invitationId) return;
        setIsLoading(true);
        try {
            const data = await rsvpApi.list(invitationId);
            setWishes(data || []);
        } catch (error) {
            console.error('[WishesPanel] Error fetching wishes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVisibility = async (wish: Wish) => {
        try {
            const newVisibility = !wish.is_visible;
            await rsvpApi.updateStatus(wish.id, { is_visible: newVisibility });
            setWishes(prev => prev.map(w => w.id === wish.id ? { ...w, is_visible: newVisibility } : w));
        } catch (error) {
            console.error('[WishesPanel] Error toggling visibility:', error);
        }
    };

    const handleDeleteWish = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await rsvpApi.delete(deleteId);
            setWishes(prev => prev.filter(w => w.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error('[WishesPanel] Error deleting wish:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredWishes = wishes.filter(wish => {
        const matchesSearch = wish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wish.message?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'visible' && wish.is_visible) ||
            (filter === 'hidden' && !wish.is_visible);
        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader showLabel label="Memuat Ucapan..." color="#f97316" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 px-1">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau pesan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
                    {(['all', 'visible', 'hidden'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === f
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {f === 'all' ? 'Semua' : f === 'visible' ? 'Tampil' : 'Sembunyi'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredWishes.length > 0 ? (
                        filteredWishes.map((wish, index) => (
                            <m.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                key={wish.id}
                                className={`group relative bg-white border rounded-3xl p-5 transition-all duration-300 ${wish.is_visible ? 'border-slate-100' : 'border-slate-100 opacity-60 grayscale-[0.5]'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${wish.attendance === 'attending' ? 'bg-emerald-50 text-emerald-600' :
                                            wish.attendance === 'not_attending' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-800 tracking-tight">{wish.name}</h4>
                                                {wish.attendance === 'attending' ? (
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : wish.attendance === 'not_attending' ? (
                                                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                ) : (
                                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">
                                                "{wish.message || 'Tidak ada pesan'}"
                                            </p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(wish.submitted_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleToggleVisibility(wish)}
                                            className={`p-2 rounded-xl transition-all ${wish.is_visible
                                                ? 'bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600'
                                                : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                }`}
                                            title={wish.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                                        >
                                            {wish.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(wish.id)}
                                            className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </m.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                            <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Belum ada ucapan</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Info Footer */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-[2rem] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Filter className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                    Pesan yang ditandai <b>Tersembunyi</b> tidak akan muncul di halaman undangan publik. Gunakan fitur ini untuk memoderasi komentar.
                </p>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteWish}
                title="Hapus Ucapan?"
                message="Pesan ini akan dihapus secara permanen dan tidak dapat dikembalikan. Lanjutkan?"
                confirmText="Hapus Permanen"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default WishesPanel;
