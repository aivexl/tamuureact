import React, { useState, useEffect, useRef } from 'react';
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
import { invitations, storage } from '@/lib/api';
import { useStore } from '@/store/useStore';
import html2canvas from 'html2canvas';

interface ShareCardPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const ShareCardPanel: React.FC<ShareCardPanelProps> = ({ invitationId, onClose }) => {
    const { showModal, user } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State - Empty by default per user request
    const [eventName, setEventName] = useState('');
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [location, setLocation] = useState('');
    const [guestName, setGuestName] = useState('Bapak/Ibu/Saudara/i');
    const [slug, setSlug] = useState('');
    
    // Snapshot state
    const [savedImageUrl, setSavedImageUrl] = useState('');
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitations.get(invitationId);
                if (data) {
                    setSlug(data.slug || '');
                    
                    // Parse existing settings if available
                    if (data.og_settings) {
                        try {
                            const settings = JSON.parse(data.og_settings);
                            setEventName(settings.event || '');
                            setName1(settings.n1 || '');
                            setName2(settings.n2 || '');
                            setDateTime(settings.time || '');
                            setLocation(settings.loc || '');
                            setSavedImageUrl(settings.og_image_url || '');
                        } catch (e) {
                            console.error('Failed to parse og_settings', e);
                        }
                    }
                    // CTO POLICY: Manual-only entry. No auto-population from data.name.
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
            let finalImageUrl = savedImageUrl;

            // 1. Generate Image from DOM via html2canvas
            if (cardRef.current) {
                try {
                    const canvas = await html2canvas(cardRef.current, {
                        scale: 3, // High quality render (3x resolution)
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                    });

                    // 2. Convert to Blob
                    const blob = await new Promise<Blob | null>((resolve) => {
                        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
                    });

                    if (blob) {
                        // 3. Upload to R2 Storage
                        const file = new File([blob], `og-${slug}-${Date.now()}.png`, { type: 'image/png' });
                        const uploadResult = await storage.upload(file, 'og-images', { userId: user?.id });
                        finalImageUrl = uploadResult.url;
                        setSavedImageUrl(finalImageUrl);
                    }
                } catch (imgError) {
                    console.error('Failed to generate/upload image:', imgError);
                }
            }

            const ogSettings = {
                event: eventName,
                n1: name1,
                n2: name2,
                time: dateTime,
                loc: location,
                og_image_url: finalImageUrl
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


    

    

    
    const copyUrl = () => {
        if (!savedImageUrl) {
             showModal({
                title: 'Belum Disimpan',
                message: 'Silakan Simpan Pengaturan Kartu terlebih dahulu untuk menghasilkan Link Gambar.',
                type: 'error'
            });
            return;
        }
        navigator.clipboard.writeText(savedImageUrl);
        showModal({
            title: 'URL Disalin',
            message: 'Link gambar share statis telah disalin ke clipboard.',
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
                        {/* Header removed per user request */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Name</label>
                                <div className="relative">
                                    <input
                                        value={eventName}
                                        onChange={e => setEventName(e.target.value)}
                                        placeholder="Contoh: The Wedding of"
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
                                            placeholder="Nama"
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
                                            placeholder="Nama"
                                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Waktu Acara (Gunakan koma untuk baris baru)</label>
                                <div className="relative">
                                    <input
                                        value={dateTime}
                                        onChange={e => setDateTime(e.target.value)}
                                        placeholder="Contoh: Minggu, 12 Des 2026, 10:00 WIB"
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
                                        placeholder="Lokasi"
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
                        <div className="flex items-center gap-2">
                            
                            <button onClick={copyUrl} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="Salin URL Gambar">
                                <Copy className="w-4 h-4" />
                            </button>
                            <a href={savedImageUrl || '#'} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="Buka di Tab Baru">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="bg-slate-100 rounded-[2.5rem] p-4 sm:p-8 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        </div>

                        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden aspect-square w-full max-w-[350px] border border-slate-200 group">
                        
                        <div ref={cardRef} className="w-full h-full bg-white flex flex-col p-[10%] relative leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {/* Top Section: Split Layout 65/35 */}
                            <div className="flex justify-between items-start w-full">
                                {/* Left Side: Branding & Core Names */}
                                <div className="flex flex-col items-start w-[65%]">
                                    <img src="/assets/tamuu-logo-header.png" alt="Tamuu" className="w-[22%] opacity-50 grayscale brightness-50 mb-[10%]" />

                                    <div className="text-[6px] text-slate-400 uppercase tracking-[8px] font-medium mb-[5%] opacity-80">
                                        {(eventName || 'THE WEDDING OF').toUpperCase()}
                                    </div>

                                    <div className="flex flex-col items-start w-full">
                                        <div className="text-[20px] font-bold text-slate-900 leading-[1.1] tracking-tighter uppercase">
                                            {name1 || 'MEMPELAI 1'}
                                        </div>
                                        <div className="text-[14px] text-slate-300 font-extralight my-1">&</div>
                                        <div className="text-[20px] font-bold text-slate-900 leading-[1.1] tracking-tighter uppercase">
                                            {name2 || 'MEMPELAI 2'}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Bare QR Anchor */}
                                <div className="w-[30%] aspect-square flex items-center justify-center pt-2">
                                    <QrCode className="w-full h-full text-slate-800 opacity-90" strokeWidth={1} />
                                </div>
                            </div>

                            {/* Middle Section: Logistics */}
                            <div className="flex flex-col items-start mt-[10%]">
                                <div className="flex flex-col gap-1">
                                    {dateTime.includes(',') ? dateTime.split(',').map((part, i) => (
                                        <div key={i} className={`uppercase tracking-[2px] ${i === 0 ? 'text-[8px] text-slate-600 font-bold' : 'text-[7px] text-slate-400 font-medium opacity-80'}`}>
                                            {part.trim()}
                                        </div>
                                    )) : (
                                        <div className="text-[8px] text-slate-600 font-bold uppercase tracking-[2px]">
                                            {dateTime || 'EVENT DATE'}
                                        </div>
                                    )}
                                    <div className="text-[7px] text-slate-400 font-normal mt-1 opacity-70 uppercase tracking-[1px]">
                                        {location || 'LOCATION'}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: Guest Identity */}
                            <div className="mt-auto flex flex-col items-start w-full">
                                <div className="text-[6px] text-slate-400 font-normal uppercase tracking-[3px] mb-1.5 opacity-60">Kepada Yth:</div>
                                <div className="text-[14px] font-bold text-slate-800 truncate w-full pr-10 uppercase tracking-tight">
                                    {guestName || 'TAMU UNDANGAN'}
                                </div>
                            </div>
                        </div>
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
