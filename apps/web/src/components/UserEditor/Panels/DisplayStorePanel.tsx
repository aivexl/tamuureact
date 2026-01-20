/**
 * DisplayStorePanel - Welcome Guest Display Selection
 * Allows users to select and change their welcome guest display anytime
 * Fetches from templates API with type='display' filter
 */

import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Monitor, Check, RefreshCw, Sparkles, Tv } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { templates as templatesApi, invitations as invitationsApi, userDisplayDesigns } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { ConfirmationModal } from '@/components/Modals/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

interface DisplayTemplate {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    thumbnail?: string;
    category?: string;
    type?: string;
    sections?: any[];
    orbit_layers?: any[];
}

interface DisplayStorePanelProps {
    invitationId?: string;
    onDisplayChanged?: () => void;
}

export const DisplayStorePanel: React.FC<DisplayStorePanelProps> = ({
    invitationId,
    onDisplayChanged
}) => {
    const navigate = useNavigate();
    const { id: storeId, user } = useStore();
    const currentInvitationId = invitationId || storeId;

    const [displays, setDisplays] = useState<DisplayTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDisplay, setSelectedDisplay] = useState<DisplayTemplate | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [currentDisplayDesignId, setCurrentDisplayDesignId] = useState<string | null>(null);
    const [sourceTemplateId, setSourceTemplateId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Fetch display templates and current invitation status
    useEffect(() => {
        const initializePanel = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch all templates, then filter by type='display'
                const allTemplates = await templatesApi.list();
                const displayTemplates = (allTemplates || []).filter(
                    (t: DisplayTemplate) => t.type === 'display'
                );
                setDisplays(displayTemplates);

                // 2. Fetch current invitation to check active display
                if (currentInvitationId) {
                    const invData = await invitationsApi.get(currentInvitationId);
                    if (invData.display_design_id) {
                        setCurrentDisplayDesignId(invData.display_design_id);
                        // Fetch the design to see its source template
                        const designData = await userDisplayDesigns.get(invData.display_design_id);
                        setSourceTemplateId(designData.source_template_id || null);
                    }
                }

                console.log('[DisplayStore] Initialization complete');
            } catch (error) {
                console.error('[DisplayStore] Failed to initialize:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializePanel();
    }, [currentInvitationId]);

    const handleSelectDisplay = (display: DisplayTemplate) => {
        setSelectedDisplay(display);
        setShowConfirmModal(true);
    };

    const handleApplyDisplay = async () => {
        if (!selectedDisplay || !currentInvitationId || !user) {
            showToast('Sesi tidak valid. Silakan login kembali.', 'error');
            return;
        }

        setIsApplying(true);
        try {
            // 1. Get the full template data
            const templateData = await templatesApi.get(selectedDisplay.id);

            if (!templateData) {
                throw new Error('Display template not found');
            }

            // 2. Create a new user-owned display design
            // This ensures editing this design doesn't affect the system template
            const designPayload = {
                user_id: user.id,
                invitation_id: currentInvitationId,
                name: `Display - ${selectedDisplay.name}`,
                thumbnail_url: selectedDisplay.thumbnail_url || selectedDisplay.thumbnail,
                source_template_id: selectedDisplay.id,
                content: {
                    sections: templateData.sections || [],
                    orbit_layers: templateData.orbit_layers || templateData.orbit || [],
                    music: templateData.music || null
                }
            };

            const newDesign = await userDisplayDesigns.create(designPayload);

            // 3. Link this new design to the invitation
            await invitationsApi.update(currentInvitationId, {
                display_design_id: newDesign.id
            });

            setCurrentDisplayDesignId(newDesign.id);
            setSourceTemplateId(selectedDisplay.id);
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
            <div className="flex flex-col items-center justify-center py-16">
                <PremiumLoader variant="inline" showLabel label="Memuat Display Template..." color="#06b6d4" />
            </div>
        );
    }

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
            {displays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Monitor className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium mb-2">Belum ada display template tersedia</p>
                    <p className="text-xs text-slate-300">Silakan hubungi admin untuk menambahkan display template.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {displays.map((display, index) => (
                        <m.button
                            key={display.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => handleSelectDisplay(display)}
                            className={`group relative h-48 bg-white border rounded-[2rem] overflow-hidden transition-all hover:shadow-2xl hover:shadow-cyan-500/10 text-left ${currentDisplayDesignId === display.id
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

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentDisplayDesignId === display.id
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/20 backdrop-blur-sm text-white group-hover:bg-cyan-500 group-hover:scale-110'
                                    }`}>
                                    <Check className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Current Display Badge */}
                            {sourceTemplateId === display.id && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-cyan-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                                    <Sparkles className="w-3 h-3" />
                                    Aktif
                                </div>
                            )}
                        </m.button>
                    ))}
                </div>
            )}

            {/* Create Custom Display CTA */}
            {currentDisplayDesignId ? (
                <div className="mt-4 p-6 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-[2rem] relative overflow-hidden group shadow-xl shadow-cyan-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                            <Monitor className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h5 className="text-white font-black text-lg tracking-tight mb-1">
                                Edit Desain Aktif
                            </h5>
                            <p className="text-white/70 text-xs">
                                Kustomisasi layar sambutan Anda lebih lanjut di Editor Display.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/user/display-editor/${currentDisplayDesignId}`)}
                            className="px-6 py-3 bg-white text-cyan-700 font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl active:scale-95"
                        >
                            Edit Desain
                        </button>
                    </div>
                </div>
            ) : (
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
            )}

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
