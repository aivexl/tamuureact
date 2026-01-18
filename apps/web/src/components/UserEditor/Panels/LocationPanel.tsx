import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { MapPin, X, Save, Navigation } from 'lucide-react';
import { invitations } from '../../../lib/api';

interface LocationPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const LocationPanel: React.FC<LocationPanelProps> = ({ invitationId, onClose }) => {
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
                    setVenueName(response.venue_name || '');
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
                google_maps_url: googleMapsUrl
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save location:', error);
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
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Lokasi Acara</h3>
                            <p className="text-xs text-slate-500">Atur lokasi & peta acara</p>
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
                            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Venue Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    Nama Venue
                                </label>
                                <input
                                    type="text"
                                    value={venueName}
                                    onChange={(e) => setVenueName(e.target.value)}
                                    placeholder="Gedung Pernikahan ABC"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Navigation className="w-4 h-4 text-red-500" />
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Google Maps URL */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    Link Google Maps
                                </label>
                                <input
                                    type="url"
                                    value={googleMapsUrl}
                                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                    placeholder="https://goo.gl/maps/..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                                />
                                <p className="text-xs text-slate-500">
                                    Buka Google Maps → Pilih lokasi → Klik Share → Copy link
                                </p>
                            </div>

                            {/* Preview */}
                            {(venueName || address) && (
                                <div className="p-4 bg-red-50 rounded-2xl space-y-2">
                                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Preview</p>
                                    {venueName && <p className="font-bold text-slate-900">{venueName}</p>}
                                    {address && <p className="text-sm text-slate-600">{address}</p>}
                                    {googleMapsUrl && (
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-semibold"
                                        >
                                            <Navigation className="w-3.5 h-3.5" />
                                            Buka di Maps
                                        </a>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
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
                            : 'bg-red-500 hover:bg-red-600 text-white'
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
