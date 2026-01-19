/**
 * LoveStoryPanel - Love Story Timeline Management
 * Allows users to create their love story timeline
 */

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence, Reorder } from 'framer-motion';
import {
    Heart,
    Save,
    Loader2,
    Check,
    AlertCircle,
    Plus,
    Trash2,
    GripVertical,
    Calendar
} from 'lucide-react';
import { invitations as invitationsApi } from '@/lib/api';

interface LoveStoryPanelProps {
    invitationId: string;
    onClose: () => void;
}

interface StoryEvent {
    id: string;
    date: string;
    title: string;
    description: string;
}

export const LoveStoryPanel: React.FC<LoveStoryPanelProps> = ({ invitationId, onClose }) => {
    const [events, setEvents] = useState<StoryEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load existing love story
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitationsApi.get(invitationId);
                if (data?.love_story) {
                    const parsed = typeof data.love_story === 'string'
                        ? JSON.parse(data.love_story)
                        : data.love_story;
                    setEvents(parsed);
                }
            } catch (err) {
                console.error('[LoveStoryPanel] Load error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (invitationId) {
            loadData();
        }
    }, [invitationId]);

    // Add new event
    const addEvent = () => {
        const newEvent: StoryEvent = {
            id: `event-${Date.now()}`,
            date: '',
            title: '',
            description: ''
        };
        setEvents([...events, newEvent]);
    };

    // Update event
    const updateEvent = (id: string, field: keyof StoryEvent, value: string) => {
        setEvents(events.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    // Delete event
    const deleteEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    // Save handler
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await invitationsApi.update(invitationId, {
                love_story: JSON.stringify(events)
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            console.error('[LoveStoryPanel] Save error:', err);
            setError('Gagal menyimpan kisah cinta');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Kisah Cinta...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Kisah Cinta</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {events.length} Momen
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
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-[2rem] p-6 border border-pink-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-1">Ceritakan Perjalanan Cintamu</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Bagikan momen-momen spesial dalam perjalanan cinta kalian. Mulai dari pertama bertemu hingga hari pernikahan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline Events */}
            <div className="space-y-4">
                <Reorder.Group axis="y" values={events} onReorder={setEvents} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {events.map((event, index) => (
                            <Reorder.Item
                                key={event.id}
                                value={event}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-black text-pink-600">{index + 1}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-1">
                                        Momen #{index + 1}
                                    </span>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                                            Tanggal / Tahun
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="text"
                                                value={event.date}
                                                onChange={(e) => updateEvent(event.id, 'date', e.target.value)}
                                                placeholder="2020"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-pink-500/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                                            Judul Momen
                                        </label>
                                        <input
                                            type="text"
                                            value={event.title}
                                            onChange={(e) => updateEvent(event.id, 'title', e.target.value)}
                                            placeholder="Pertama Bertemu"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-pink-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                                        Cerita Singkat
                                    </label>
                                    <textarea
                                        value={event.description}
                                        onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                                        placeholder="Ceritakan momen spesial ini..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-pink-500/20 resize-none"
                                    />
                                </div>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>
            </div>

            {/* Add Button */}
            <button
                onClick={addEvent}
                className="w-full py-4 border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl text-pink-500 hover:text-pink-600 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-pink-50/50"
            >
                <Plus className="w-5 h-5" />
                Tambah Momen
            </button>

            {/* Empty State */}
            {events.length === 0 && (
                <div className="text-center py-6 space-y-3">
                    <p className="text-slate-400 text-sm">Belum ada momen yang ditambahkan</p>
                    <p className="text-slate-300 text-xs">Klik "Tambah Momen" untuk memulai kisah cintamu</p>
                </div>
            )}
        </div>
    );
};

export default LoveStoryPanel;
