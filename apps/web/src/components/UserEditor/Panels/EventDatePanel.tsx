import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Calendar, Save, Check } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations } from '../../../lib/api';
import { useStore } from '@/store/useStore';

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

    const { sections, updateSectionsBatch } = useStore();

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

            // UNICORN SYNC: Update all countdown elements in the canvas
            if (eventDateTime) {
                const updatedSections = sections.map(section => ({
                    ...section,
                    elements: section.elements.map(el => {
                        const isCountdown = el.type === 'countdown' || el.name?.toLowerCase().includes('countdown');
                        if (isCountdown && el.countdownConfig) {
                            return {
                                ...el,
                                countdownConfig: {
                                    ...el.countdownConfig,
                                    targetDate: eventDateTime
                                }
                            };
                        }
                        return el;
                    })
                }));
                updateSectionsBatch(updatedSections);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to save event date:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <PremiumLoader variant="inline" showLabel label="Memuat Data Tanggal..." color="#d97706" />
                </div>
            ) : (
                <>
                    <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-600" />
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Waktu & Tanggal</h4>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Date Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Tanggal (DD/MM/YYYY)</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            {/* Time Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Waktu (24 JAM - ABSOLUTE)</label>
                                <div className="flex items-center gap-3 px-2">
                                    <div className="flex-1 relative group">
                                        <select 
                                            value={eventTime.split(':')[0] || '00'}
                                            onChange={(e) => setEventTime(`${e.target.value}:${eventTime.split(':')[1] || '00'}`)}
                                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-slate-700 appearance-none transition-all"
                                        >
                                            {Array.from({ length: 24 }).map((_, i) => {
                                                const h = String(i).padStart(2, '0');
                                                return <option key={h} value={h}>{h}</option>;
                                            })}
                                        </select>
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-hover:text-amber-500 pointer-events-none uppercase">Jam</span>
                                    </div>
                                    <span className="font-black text-slate-200">:</span>
                                    <div className="flex-1 relative group">
                                        <select 
                                            value={eventTime.split(':')[1] || '00'}
                                            onChange={(e) => setEventTime(`${eventTime.split(':')[0] || '00'}:${e.target.value}`)}
                                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-slate-700 appearance-none transition-all"
                                        >
                                            {Array.from({ length: 60 }).map((_, i) => {
                                                const m = String(i).padStart(2, '0');
                                                return <option key={m} value={m}>{m}</option>;
                                            })}
                                        </select>
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-hover:text-amber-500 pointer-events-none uppercase">Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        {eventDate && (
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Terbaca sebagai:</p>
                                <p className="font-bold text-slate-900 text-lg">
                                    {new Date(`${eventDate}T${eventTime || '00:00'}`).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                    {eventTime && <span className="text-amber-600 block text-sm mt-1">Pukul {eventTime} WIB</span>}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95 ${success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-amber-600 shadow-slate-900/20'}`}
                        >
                            {saving ? (
                                <PremiumLoader variant="inline" size="sm" color="white" />
                            ) : success ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    Tanggal Tersimpan
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
