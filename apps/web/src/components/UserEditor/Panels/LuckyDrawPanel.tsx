/**
 * LuckyDrawPanel - Lucky Draw / Undian Berhadiah
 * Roulette-style random selection with configurable participants and prizes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    Dice6,
    Check,
    AlertCircle,
    Plus,
    Trash2,
    Users,
    Gift,
    RotateCcw,
    Trophy,
    Sparkles,
    UserPlus,
    X
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations as invitationsApi, guests as guestsApi } from '@/lib/api';
import SpinWheel from '@/components/ui/SpinWheel';
import { useStore } from '@/store/useStore';

interface LuckyDrawPanelProps {
    invitationId: string;
    onClose: () => void;
}

interface Participant {
    id: string;
    name: string;
    source: 'guest' | 'custom';
}

interface Prize {
    id: string;
    name: string;
    quantity: number;
}

interface Winner {
    id: string;
    participantId: string;
    participantName: string;
    prizeName: string;
    drawnAt: string;
}

interface LuckyDrawSettings {
    participants: Participant[];
    prizes: Prize[];
    winners: Winner[];
    isEnabled: boolean;
}

// Preset prize options
const PRESET_PRIZES = [
    'Grand Prize',
    'Hadiah Utama',
    'Hadiah Ke-2',
    'Hadiah Ke-3',
    'Door Prize',
    'Voucher Belanja',
    'Smartphone',
    'Tablet',
    'Smart TV',
    'Emas 1 Gram',
    'Uang Tunai',
    'Paket Liburan'
];

// Participant source options
const PARTICIPANT_SOURCES = [
    { id: 'all', label: 'Semua Tamu', desc: 'Dari daftar tamu undangan' },
    { id: 'attending', label: 'Tamu Hadir', desc: 'Yang sudah RSVP hadir' },
    { id: 'checkedin', label: 'Sudah Check-in', desc: 'Yang sudah check-in' },
    { id: 'custom', label: 'Custom', desc: 'Tambahkan sendiri' }
];

export const LuckyDrawPanel: React.FC<LuckyDrawPanelProps> = ({ invitationId, onClose }) => {
    const { showModal } = useStore();
    const [settings, setSettings] = useState<LuckyDrawSettings>({
        participants: [],
        prizes: [],
        winners: [],
        isEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Spin state
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
    const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
    const [showWinnerModal, setShowWinnerModal] = useState(false);

    // Add participant modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const [guestList, setGuestList] = useState<any[]>([]);
    const [participantSource, setParticipantSource] = useState<string>('custom');

    const [customPrize, setCustomPrize] = useState('');

    // Load existing settings
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitationsApi.get(invitationId);
                if (data?.lucky_draw_settings) {
                    const parsed = typeof data.lucky_draw_settings === 'string'
                        ? JSON.parse(data.lucky_draw_settings)
                        : data.lucky_draw_settings;
                    setSettings({
                        participants: parsed.participants || [],
                        prizes: parsed.prizes || [],
                        winners: parsed.winners || [],
                        isEnabled: parsed.isEnabled ?? true
                    });
                }

                // Load guest list
                try {
                    const guests = await guestsApi.list(invitationId);
                    setGuestList(guests || []);
                } catch (e) {
                    console.log('[LuckyDraw] No guests found');
                }
            } catch (err) {
                console.error('[LuckyDrawPanel] Load error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (invitationId) {
            loadData();
        }
    }, [invitationId]);

    // Add prize
    const addPrize = (name: string) => {
        const newPrize: Prize = {
            id: `prize-${Date.now()}`,
            name,
            quantity: 1
        };
        setSettings(prev => ({
            ...prev,
            prizes: [...prev.prizes, newPrize]
        }));
    };

    // Remove prize
    const removePrize = (id: string) => {
        setSettings(prev => ({
            ...prev,
            prizes: prev.prizes.filter(p => p.id !== id)
        }));
    };

    // Add participant
    const addParticipant = (name: string, source: 'guest' | 'custom' = 'custom') => {
        const newParticipant: Participant = {
            id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            source
        };
        setSettings(prev => ({
            ...prev,
            participants: [...prev.participants, newParticipant]
        }));
    };

    // Add from guest list
    const addFromGuestList = (source: string) => {
        let filtered = guestList;

        if (source === 'attending') {
            filtered = guestList.filter(g => g.attendance === 'attending');
        } else if (source === 'checkedin') {
            filtered = guestList.filter(g => g.checked_in_at);
        }

        const newParticipants = filtered.map(g => ({
            id: `participant-${g.id}`,
            name: g.name,
            source: 'guest' as const
        }));

        setSettings(prev => ({
            ...prev,
            participants: [...prev.participants, ...newParticipants]
        }));
        setShowAddModal(false);
    };

    // Remove participant
    const removeParticipant = (id: string) => {
        setSettings(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== id)
        }));
    };

    // Get eligible participants (not yet won)
    const getEligible = useCallback(() => {
        const winnerIds = settings.winners.map(w => w.participantId);
        return settings.participants.filter(p => !winnerIds.includes(p.id));
    }, [settings.participants, settings.winners]);

    // Reset winners
    const resetWinners = () => {
        showModal({
            title: 'Reset Pemenang?',
            message: 'Apakah Anda yakin ingin menghapus semua daftar pemenang? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            confirmText: 'Ya, Reset',
            cancelText: 'Batal',
            onConfirm: () => {
                setSettings(prev => ({
                    ...prev,
                    winners: []
                }));
            }
        });
    };

    // Save handler
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await invitationsApi.update(invitationId, {
                lucky_draw_settings: JSON.stringify(settings)
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            console.error('[LuckyDrawPanel] Save error:', err);
            setError('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    const eligible = getEligible();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Memuat Lucky Draw..." color="#9333ea" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                        <Dice6 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Lucky Draw</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {settings.participants.length} Peserta • {settings.winners.length} Pemenang
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
                    {saving && <PremiumLoader variant="inline" color="white" />}
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

            {/* Roulette Wheel */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2rem] p-6 border border-purple-100">
                <div className="flex flex-col items-center gap-6">
                    {/* Spin Wheel */}
                    <SpinWheel
                        segments={eligible.map(p => p.name)}
                        onFinished={(winner) => {
                            const winnerParticipant = eligible.find(p => p.name === winner);
                            if (winnerParticipant && selectedPrize) {
                                setCurrentWinner(winnerParticipant);
                                const newWinner: Winner = {
                                    id: `winner-${Date.now()}`,
                                    participantId: winnerParticipant.id,
                                    participantName: winnerParticipant.name,
                                    prizeName: selectedPrize.name,
                                    drawnAt: new Date().toISOString()
                                };
                                setSettings(prev => ({
                                    ...prev,
                                    winners: [...prev.winners, newWinner]
                                }));
                                setShowWinnerModal(true);
                            }
                        }}
                        isSpinning={isSpinning}
                        onSpinStart={() => {
                            if (!selectedPrize) {
                                setError('Pilih hadiah terlebih dahulu!');
                                return;
                            }
                            if (eligible.length === 0) {
                                setError('Tidak ada peserta!');
                                return;
                            }
                            setIsSpinning(true);
                            setError(null);
                        }}
                        onSpinEnd={() => setIsSpinning(false)}
                        size={280}
                    />

                    {/* Prize Selection */}
                    <div className="w-full">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">
                            Pilih Hadiah untuk Diundi
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {settings.prizes.map(prize => (
                                <button
                                    key={prize.id}
                                    onClick={() => setSelectedPrize(prize)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedPrize?.id === prize.id
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white text-slate-600 hover:bg-purple-50'
                                        }`}
                                >
                                    <Gift className="w-4 h-4 inline mr-1" />
                                    {prize.name}
                                </button>
                            ))}
                            {settings.prizes.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Tambahkan hadiah terlebih dahulu</p>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">
                        {eligible.length} peserta tersisa • Klik tombol SPIN di tengah wheel
                    </p>
                </div>
            </div>

            {/* Prizes Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                        Daftar Hadiah
                    </label>
                </div>

                {/* Custom Prize Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customPrize}
                        onChange={(e) => setCustomPrize(e.target.value)}
                        placeholder="Nama hadiah custom..."
                        className="flex-1 px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customPrize.trim()) {
                                addPrize(customPrize.trim());
                                setCustomPrize('');
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            if (customPrize.trim()) {
                                addPrize(customPrize.trim());
                                setCustomPrize('');
                            }
                        }}
                        disabled={!customPrize.trim()}
                        className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-200 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {PRESET_PRIZES.map(preset => (
                        <button
                            key={preset}
                            onClick={() => addPrize(preset)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-600 rounded-lg text-xs font-bold transition-all"
                        >
                            + {preset}
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    {settings.prizes.map(prize => (
                        <div key={prize.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                            <Gift className="w-5 h-5 text-purple-500" />
                            <span className="flex-1 font-bold text-slate-700">{prize.name}</span>
                            <button
                                onClick={() => removePrize(prize.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Participants Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                        Peserta ({settings.participants.length})
                    </label>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                    {settings.participants.map(p => (
                        <div key={p.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="flex-1 text-sm font-medium text-slate-700">{p.name}</span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase">{p.source}</span>
                            <button
                                onClick={() => removeParticipant(p.id)}
                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {settings.participants.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-4">Belum ada peserta</p>
                    )}
                </div>
            </div>

            {/* Winners Section */}
            {settings.winners.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                            Pemenang ({settings.winners.length})
                        </label>
                        <button
                            onClick={resetWinners}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>

                    <div className="space-y-2">
                        {settings.winners.map((w, i) => (
                            <div key={w.id} className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-100">
                                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800">{w.participantName}</p>
                                    <p className="text-xs text-amber-600">{w.prizeName}</p>
                                </div>
                                <span className="text-xs text-slate-400">#{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Participant Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <h4 className="text-lg font-black text-slate-800">Tambah Peserta</h4>

                            {/* Source Options */}
                            <div className="space-y-2">
                                {PARTICIPANT_SOURCES.map(src => (
                                    <button
                                        key={src.id}
                                        onClick={() => {
                                            if (src.id === 'custom') {
                                                setParticipantSource('custom');
                                            } else {
                                                addFromGuestList(src.id);
                                            }
                                        }}
                                        disabled={src.id !== 'custom' && guestList.length === 0}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${src.id !== 'custom' && guestList.length === 0
                                            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                            : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                                            }`}
                                    >
                                        <Users className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="font-bold text-slate-700">{src.label}</p>
                                            <p className="text-xs text-slate-400">{src.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Name Input */}
                            {participantSource === 'custom' && (
                                <div className="space-y-3 pt-2">
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="Nama peserta..."
                                        className="w-full px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none placeholder:text-slate-400"
                                    />
                                    <button
                                        onClick={() => {
                                            if (customName.trim()) {
                                                addParticipant(customName.trim(), 'custom');
                                                setCustomName('');
                                            }
                                        }}
                                        disabled={!customName.trim()}
                                        className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
                                    >
                                        <UserPlus className="w-4 h-4 inline mr-2" />
                                        Tambahkan
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
                            >
                                Tutup
                            </button>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Winner Modal */}
            <AnimatePresence>
                {showWinnerModal && currentWinner && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowWinnerModal(false)}
                    >
                        <m.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl p-8 w-full max-w-sm text-center space-y-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <m.div
                                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Trophy className="w-20 h-20 text-white mx-auto" />
                            </m.div>
                            <div>
                                <p className="text-white/80 text-sm font-bold uppercase tracking-widest">Selamat!</p>
                                <h3 className="text-3xl font-black text-white mt-2">{currentWinner.name}</h3>
                                <p className="text-white/90 text-lg font-bold mt-2">
                                    {selectedPrize?.name}
                                </p>
                            </div>
                            <m.div
                                className="flex justify-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {[...Array(5)].map((_, i) => (
                                    <m.div
                                        key={i}
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 0.5, delay: 0.1 * i, repeat: Infinity }}
                                    >
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </m.div>
                                ))}
                            </m.div>
                            <button
                                onClick={() => setShowWinnerModal(false)}
                                className="px-8 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-colors"
                            >
                                Tutup
                            </button>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LuckyDrawPanel;
