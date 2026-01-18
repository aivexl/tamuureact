import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Calendar, X, Save, Clock } from 'lucide-react';
import { invitations } from '../../../lib/api';

interface EventDatePanelProps {
    invitationId: string;
    onClose: () => void;
}

export const EventDatePanel: React.FC<EventDatePanelProps> = ({ invitationId, onClose }) => {
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Load existing event date
    useEffect(() => {
        const loadEventDate = async () => {
            try {
                setLoading(true);
                const response = await invitations.get(invitationId);
                if (response?.event_date) {
                    // Parse date and time from ISO string
                    const date = new Date(response.event_date);
                    setEventDate(date.toISOString().split('T')[0]);
                    setEventTime(date.toTimeString().slice(0, 5));
                }
            } catch (error) {
                console.error('Failed to load event date:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEventDate();
    }, [invitationId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccess(false);

            // Combine date and time to ISO string
            const eventDateTime = eventDate && eventTime
                ? new Date(`${eventDate}T${eventTime}`).toISOString()
                : eventDate
                    ? new Date(eventDate).toISOString()
                    : null;

            await invitations.update(invitationId, {
                event_date: eventDateTime
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save event date:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <m.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Tanggal Acara</h3>
                            <p className="text-xs text-slate-500">Atur tanggal & waktu acara</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Date Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Time Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    Waktu
                                </label>
                                <input
                                    type="time"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Preview */}
                            {eventDate && (
                                <div className="p-4 bg-amber-50 rounded-2xl">
                                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Preview</p>
                                    <p className="font-bold text-slate-900">
                                        {new Date(`${eventDate}T${eventTime || '00:00'}`).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {eventTime && ` • ${eventTime}`}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-semibold"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${success
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Menyimpan...' : success ? 'Tersimpan!' : 'Simpan'}
                    </button>
                </div>
            </m.div>
        </m.div>
    );
};
