/**
 * DisplayStorePanel - Welcome Guest Display Selection
 * Allows users to select and change their welcome guest display anytime
 * Enterprise-grade display template switching
 */

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Monitor, Check, Loader2, RefreshCw, Eye, Sparkles, Tv } from 'lucide-react';
import { userDisplayDesigns as displayDesignsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { ConfirmationModal } from '@/components/Modals/ConfirmationModal';

interface DisplayDesign {
    id: string;
    name: string;
    thumbnail_url?: string;
    thumbnail?: string;
    category?: string;
    is_published?: boolean;
}

interface DisplayStorePanelProps {
    invitationId?: string;
    onDisplayChanged?: () => void;
}

export const DisplayStorePanel: React.FC<DisplayStorePanelProps> = ({
    invitationId,
    onDisplayChanged
}) => {
    const { id: storeId } = useStore();
    const currentInvitationId = invitationId || storeId;

    const [displays, setDisplays] = useState<DisplayDesign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDisplay, setSelectedDisplay] = useState<DisplayDesign | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [currentDisplayId, setCurrentDisplayId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Fetch display designs
    useEffect(() => {
        const fetchDisplays = async () => {
            setIsLoading(true);
            try {
                // List available display designs for the current invitation
                if (currentInvitationId) {
                    const data = await displayDesignsApi.list({ invitationId: currentInvitationId });
                    setDisplays(data || []);
                    // Check if there's currently an active display
                    const activeDisplay = data?.find((d: DisplayDesign) => d.is_published);
                    if (activeDisplay) {
                        setCurrentDisplayId(activeDisplay.id);
                    }
                }
            } catch (error) {
                console.error('[DisplayStore] Failed to fetch displays:', error);
                // If there's an error fetching, show placeholder displays
                setDisplays([
                    { id: 'default-1', name: 'Welcome Elegant', category: 'Premium' },
                    { id: 'default-2', name: 'Welcome Modern', category: 'Modern' },
                    { id: 'default-3', name: 'Welcome Rustic', category: 'Classic' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDisplays();
    }, [currentInvitationId]);

    const handleSelectDisplay = (display: DisplayDesign) => {
        setSelectedDisplay(display);
        setShowConfirmModal(true);
    };

    const handleApplyDisplay = async () => {
        if (!selectedDisplay || !currentInvitationId) return;

        setIsApplying(true);
        try {
            // Create or update the display design for this invitation
            await displayDesignsApi.create({
                invitation_id: currentInvitationId,
                name: selectedDisplay.name,
                // Copy design properties from selected template
            });

            setCurrentDisplayId(selectedDisplay.id);
            showToast(`Display "${selectedDisplay.name}" berhasil diterapkan!`, 'success');
            setShowConfirmModal(false);
            setSelectedDisplay(null);

            if (onDisplayChanged) {
                onDisplayChanged();
            }
        } catch (error) {
            console.error('[DisplayStore] Failed to apply display:', error);
            showToast('Gagal menerapkan display. Silakan coba lagi.', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat Display...</p>
            </div>
        );
    }

    // Default display options if none loaded
    const displayOptions = displays.length > 0 ? displays : [
        { id: 'elegant-dark', name: 'Elegant Dark', category: 'Premium', thumbnail_url: '' },
        { id: 'modern-white', name: 'Modern White', category: 'Modern', thumbnail_url: '' },
        { id: 'rustic-warm', name: 'Rustic Warm', category: 'Classic', thumbnail_url: '' },
        { id: 'minimalist', name: 'Minimalist', category: 'Simple', thumbnail_url: '' },
        { id: 'floral-garden', name: 'Floral Garden', category: 'Nature', thumbnail_url: '' },
        { id: 'royal-gold', name: 'Royal Gold', category: 'Luxury', thumbnail_url: '' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-cyan-500" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Display Welcome</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <RefreshCw className="w-3 h-3" />
                    Ganti Kapanpun
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100 rounded-2xl p-4">
                <p className="text-sm text-cyan-700 font-medium">
                    <Tv className="w-4 h-4 inline-block mr-1 text-cyan-500" />
                    Pilih tampilan layar sambutan untuk tamu yang datang ke acara Anda. Display ini akan ditampilkan di layar besar saat acara berlangsung.
                </p>
            </div>

            {/* Display Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {displayOptions.map((display, index) => (
                    <m.button
                        key={display.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectDisplay(display)}
                        className={`group relative h-48 bg-white border rounded-[2rem] overflow-hidden transition-all hover:shadow-2xl hover:shadow-cyan-500/10 text-left ${currentDisplayId === display.id
                            ? 'border-cyan-400 ring-2 ring-cyan-400/20'
                            : 'border-slate-100 hover:border-cyan-300'
                            }`}
                    >
                        {/* Thumbnail or Gradient Background */}
                        {display.thumbnail_url || display.thumbnail ? (
                            <img
                                src={display.thumbnail_url || display.thumbnail}
                                alt={display.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                                {/* Display mockup */}
                                <div className="absolute inset-4 border-2 border-white/10 rounded-xl flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                                    <div className="w-24 h-2 bg-white/30 rounded-full" />
                                    <div className="w-16 h-1 bg-white/20 rounded-full" />
                                </div>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                        {/* Display Info */}
                        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                            <div className="space-y-1">
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-[8px] font-black text-white uppercase tracking-widest rounded-full inline-block">
                                    {display.category || 'Display'}
                                </span>
                                <h4 className="font-black text-white tracking-tight text-sm drop-shadow-lg">
                                    {display.name}
                                </h4>
                            </div>

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentDisplayId === display.id
                                ? 'bg-cyan-500 text-white'
                                : 'bg-white/20 backdrop-blur-sm text-white group-hover:bg-cyan-500 group-hover:scale-110'
                                }`}>
                                <Check className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Current Display Badge */}
                        {currentDisplayId === display.id && (
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-cyan-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                                <Sparkles className="w-3 h-3" />
                                Aktif
                            </div>
                        )}
                    </m.button>
                ))}
            </div>

            {/* Create Custom Display CTA */}
            <div className="mt-4 p-6 bg-slate-900 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-7 h-7 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-white font-black text-lg tracking-tight mb-1">
                            Buat Display Custom
                        </h5>
                        <p className="text-white/40 text-xs">
                            Desain tampilan sambutan unik sesuai tema acara Anda.
                        </p>
                    </div>
                    <button className="px-5 py-3 bg-white text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl">
                        Segera Hadir
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedDisplay(null);
                }}
                onConfirm={handleApplyDisplay}
                title="Terapkan Display Welcome?"
                message={`Anda akan menerapkan display "${selectedDisplay?.name}" untuk layar sambutan tamu. Display ini akan ditampilkan saat acara berlangsung.`}
                confirmText="Terapkan Display"
                cancelText="Batal"
                type="info"
                isLoading={isApplying}
            />

            {/* Toast */}
            {toast.show && (
                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 font-medium rounded-2xl shadow-xl ${toast.type === 'success'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                >
                    {toast.message}
                </m.div>
            )}
        </div>
    );
};

export default DisplayStorePanel;
