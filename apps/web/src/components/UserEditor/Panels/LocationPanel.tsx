import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { MapPin, Save, Navigation, Check } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations } from '../../../lib/api';
import { useStore } from '@/store/useStore';
import { syncLocationToCanvas } from '@/lib/canvasSync';

interface LocationPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const LocationPanel: React.FC<LocationPanelProps> = ({ invitationId, onClose }) => {
    const { sections, updateSectionsBatch } = useStore();
    const [venueName, setVenueName] = useState('');
    const [address, setAddress] = useState('');
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Load existing location
    useEffect(() => {
        const loadLocation = async () => {
            try {
                setLoading(true);
                const response = await invitations.get(invitationId);
                if (response) {
                    setVenueName(response.venue_name || response.event_location || '');
                    setAddress(response.address || '');
                    setGoogleMapsUrl(response.google_maps_url || '');
                }
            } catch (error) {
                console.error('Failed to load location:', error);
            } finally {
                setLoading(false);
            }
        };
        loadLocation();
    }, [invitationId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccess(false);

            await invitations.update(invitationId, {
                venue_name: venueName,
                address: address,
                google_maps_url: googleMapsUrl,
                event_location: venueName // Sync for legacy/onboarding compatibility
            });

            // CANVAS SYNC: Update maps_point elements in the canvas
            const synced = syncLocationToCanvas(sections, {
                venueName,
                address,
                googleMapsUrl,
            });
            updateSectionsBatch(synced);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to save location:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <PremiumLoader variant="inline" showLabel label="Memuat Data Lokasi..." color="#dc2626" />
                </div>
            ) : (
                <>
                    <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-600" />
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Informasi Venue</h4>
                        </div>

                        <div className="space-y-4">
                            {/* Venue Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Venue</label>
                                <input
                                    type="text"
                                    value={venueName}
                                    onChange={(e) => setVenueName(e.target.value)}
                                    placeholder="Gedung Pernikahan ABC"
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Alamat Lengkap</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                                    rows={3}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-slate-700 resize-none"
                                />
                            </div>

                            {/* Google Maps URL */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Link Google Maps</label>
                                <input
                                    type="url"
                                    value={googleMapsUrl}
                                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                    placeholder="https://goo.gl/maps/..."
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-slate-700"
                                />
                                <p className="text-[9px] text-slate-400 ml-4 font-medium italic leading-relaxed">
                                    Buka Google Maps → Pilih lokasi → Klik Share → Copy link
                                </p>
                            </div>
                        </div>

                        {/* Preview */}
                        {(venueName || address) && (
                            <div className="p-6 bg-red-50 rounded-2xl border border-red-100/50 space-y-2">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Preview Lokasi:</p>
                                {venueName && <p className="font-bold text-slate-900 text-lg leading-tight">{venueName}</p>}
                                {address && <p className="text-sm text-slate-600 leading-relaxed">{address}</p>}
                                {googleMapsUrl && (
                                    <div className="pt-2">
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-white rounded-xl border border-red-100 text-xs font-black text-red-600 uppercase tracking-widest hover:bg-red-50 transition-all inline-flex items-center gap-2"
                                        >
                                            <Navigation className="w-3.5 h-3.5" />
                                            Test Link Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95 ${success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-red-600 shadow-slate-900/20'}`}
                        >
                            {saving ? (
                                <PremiumLoader variant="inline" size="sm" color="white" />
                            ) : success ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    Lokasi Tersimpan
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
