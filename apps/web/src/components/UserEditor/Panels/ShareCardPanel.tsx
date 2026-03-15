import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { 
    Image as ImageIcon, 
    Save, 
    Check, 
    QrCode, 
    Type, 
    Calendar, 
    MapPin, 
    User,
    Sparkles,
    Copy,
    ExternalLink
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface ShareCardPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const ShareCardPanel: React.FC<ShareCardPanelProps> = ({ invitationId, onClose }) => {
    const { showModal } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [eventName, setEventName] = useState('The Wedding of');
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [location, setLocation] = useState('');
    const [guestName, setGuestName] = useState('Bapak/Ibu/Saudara/i');
    const [slug, setSlug] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitations.get(invitationId);
                if (data) {
                    setSlug(data.slug || '');
                    
                    // Parse existing settings if available, otherwise use defaults
                    if (data.og_settings) {
                        try {
                            const settings = JSON.parse(data.og_settings);
                            setEventName(settings.event || 'The Wedding of');
                            setName1(settings.n1 || '');
                            setName2(settings.n2 || '');
                            setDateTime(settings.time || data.event_date || '');
                            setLocation(settings.loc || data.venue_name || '');
                        } catch (e) {
                            console.error('Failed to parse og_settings', e);
                        }
                    } else {
                        // Intelligent defaults from main data
                        const names = data.name?.split('&').map((n: string) => n.trim()) || [];
                        setName1(names[0] || '');
                        setName2(names[1] || '');
                        setDateTime(data.event_date || '');
                        setLocation(data.venue_name || '');
                    }
                }
            } catch (error) {
                console.error('Failed to load invitation data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [invitationId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const ogSettings = {
                event: eventName,
                n1: name1,
                n2: name2,
                time: dateTime,
                loc: location
            };
            
            await invitations.update(invitationId, {
                og_settings: JSON.stringify(ogSettings)
            });
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (error: any) {
            console.error('Failed to save OG settings:', error);
            showModal({
                title: 'Gagal Menyimpan',
                message: error.message || 'Terjadi kesalahan saat menyimpan pengaturan Kartu Share.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const getPreviewUrl = () => {
        const baseUrl = 'https://api.tamuu.id/api/og';
        const params = new URLSearchParams({
            event: eventName,
            n1: name1,
            n2: name2,
            time: dateTime,
            loc: location,
            to: guestName,
            qr: `https://tamuu.id/${slug}`
        });
        return `${baseUrl}?${params.toString()}`;
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(getPreviewUrl());
        showModal({
            title: 'URL Disalin',
            message: 'Link gambar share telah disalin ke clipboard.',
            type: 'success'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Menyiapkan Generator Kartu..." />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Side */}
                <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Konfigurasi Kartu</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Name</label>
                                <div className="relative">
                                    <input
                                        value={eventName}
                                        onChange={e => setEventName(e.target.value)}
                                        placeholder="The Wedding of"
                                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                    />
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mempelai 1</label>
                                    <div className="relative">
                                        <input
                                            value={name1}
                                            onChange={e => setName1(e.target.value)}
                                            placeholder="Nama Pria"
                                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mempelai 2</label>
                                    <div className="relative">
                                        <input
                                            value={name2}
                                            onChange={e => setName2(e.target.value)}
                                            placeholder="Nama Wanita"
                                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Waktu Acara</label>
                                <div className="relative">
                                    <input
                                        value={dateTime}
                                        onChange={e => setDateTime(e.target.value)}
                                        placeholder="Minggu, 12 Desember 2026"
                                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Lokasi Acara</label>
                                <div className="relative">
                                    <input
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="Gedung Serbaguna, Jakarta"
                                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                    />
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-4">Test Nama Tamu (Hanya Preview)</label>
                                    <div className="relative">
                                        <input
                                            value={guestName}
                                            onChange={e => setGuestName(e.target.value)}
                                            placeholder="Contoh: Bpk. John Doe"
                                            className="w-full pl-12 pr-6 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-indigo-900"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-emerald-500" />
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Live Preview (1:1)</h4>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={copyUrl} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="Salin URL Gambar">
                                <Copy className="w-4 h-4" />
                            </button>
                            <a href={getPreviewUrl()} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="Buka di Tab Baru">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="bg-slate-100 rounded-[2.5rem] p-4 sm:p-8 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        </div>

                        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden aspect-square w-full max-w-[350px] border border-slate-200 group">
                            <img 
                                src={getPreviewUrl()} 
                                alt="Share Card Preview" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                key={getPreviewUrl()} // Force reload on change
                            />
                            
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-[.loading]:opacity-100 transition-opacity">
                                <PremiumLoader variant="inline" size="sm" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <QrCode className="w-3 h-3" /> QR Code Otomatis
                        </p>
                        <p className="text-[10px] text-amber-600 leading-relaxed">
                            QR Code akan otomatis diarahkan ke link undangan Anda: <span className="font-black">tamuu.id/{slug}</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95 ${success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-900/20'}`}
                >
                    {saving ? (
                        <PremiumLoader variant="inline" size="sm" color="white" />
                    ) : success ? (
                        <>
                            <Check className="w-6 h-6" />
                            Pengaturan Disimpan
                        </>
                    ) : (
                        <>
                            <Save className="w-6 h-6" />
                            Simpan Pengaturan Kartu
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
