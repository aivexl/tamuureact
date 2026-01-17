/**
 * TemplateStorePanel - Template Selection Panel
 * Allows users to change their invitation template at any time
 * Enterprise-grade template switching preserving user customizations
 */

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { LayoutTemplate, Check, Loader2, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { useTemplates } from '@/hooks/queries/useTemplates';
import { useStore } from '@/store/useStore';
import { invitations as invitationsApi, templates as templatesApi } from '@/lib/api';
import { ConfirmationModal } from '@/components/Modals/ConfirmationModal';

interface TemplateStorePanelProps {
    invitationId?: string;
    onTemplateChanged?: () => void;
}

export const TemplateStorePanel: React.FC<TemplateStorePanelProps> = ({
    invitationId,
    onTemplateChanged
}) => {
    const { data: templates = [], isLoading } = useTemplates();
    const { id: storeId, setSections, setOrbitLayers, setThumbnailUrl } = useStore();
    const currentInvitationId = invitationId || storeId;

    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSelectTemplate = (template: any) => {
        setSelectedTemplate(template);
        setShowConfirmModal(true);
    };

    const handleApplyTemplate = async () => {
        if (!selectedTemplate || !currentInvitationId) return;

        setIsApplying(true);
        try {
            // 1. Fetch the full template data with sections
            const templateData = await templatesApi.get(selectedTemplate.id);

            if (!templateData) {
                throw new Error('Template not found');
            }

            // 2. Update the invitation with new template
            await invitationsApi.update(currentInvitationId, {
                template_id: selectedTemplate.id,
                sections: templateData.sections || [],
                orbit_layers: templateData.orbit_layers || [],
                thumbnail: selectedTemplate.thumbnail_url || templateData.thumbnail
            });

            // 3. Update Zustand store for immediate UI update
            setSections(templateData.sections || []);
            setOrbitLayers(templateData.orbit_layers || []);
            if (selectedTemplate.thumbnail_url) {
                setThumbnailUrl(selectedTemplate.thumbnail_url);
            }

            showToast(`Template "${selectedTemplate.name}" berhasil diterapkan!`, 'success');
            setShowConfirmModal(false);
            setSelectedTemplate(null);

            // 4. Callback for parent to refresh
            if (onTemplateChanged) {
                onTemplateChanged();
            }
        } catch (error) {
            console.error('[TemplateStore] Failed to apply template:', error);
            showToast('Gagal menerapkan template. Silakan coba lagi.', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat Template...</p>
            </div>
        );
    }

    // Filter only published templates (excluding the current one to encourage change)
    const availableTemplates = templates.filter((t: any) => t.is_published !== false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <LayoutTemplate className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Koleksi Template</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <RefreshCw className="w-3 h-3" />
                    Ganti Kapanpun
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-700 font-medium">
                    <Sparkles className="w-4 h-4 inline-block mr-1 text-blue-500" />
                    Anda dapat mengganti template undangan kapan saja tanpa batas. Pilih template baru dan terapkan!
                </p>
            </div>

            {/* Template Grid */}
            {availableTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <LayoutTemplate className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium">Belum ada template tersedia</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {availableTemplates.map((template: any, index: number) => (
                        <m.button
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => handleSelectTemplate(template)}
                            className="group relative h-56 bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:border-blue-300 transition-all hover:shadow-2xl hover:shadow-blue-500/10 text-left"
                        >
                            {/* Thumbnail */}
                            {template.thumbnail_url || template.thumbnail ? (
                                <img
                                    src={template.thumbnail_url || template.thumbnail}
                                    alt={template.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Template Info */}
                            <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                                <div className="space-y-1">
                                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-[8px] font-black text-white uppercase tracking-widest rounded-full inline-block">
                                        {template.category || 'Template'}
                                    </span>
                                    <h4 className="font-black text-white tracking-tight text-sm drop-shadow-lg">
                                        {template.name}
                                    </h4>
                                </div>

                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:scale-110 transition-all">
                                    <Check className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Preview Button */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Open preview in new tab if slug exists
                                        if (template.slug) {
                                            window.open(`/preview/${template.slug}`, '_blank');
                                        }
                                    }}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all"
                                >
                                    <Eye className="w-4 h-4 text-slate-700" />
                                </button>
                            </div>
                        </m.button>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedTemplate(null);
                }}
                onConfirm={handleApplyTemplate}
                title="Ganti Template Undangan?"
                message={`Anda akan mengganti template undangan dengan "${selectedTemplate?.name}". Desain lama akan diganti dengan template baru. Data tamu dan pengaturan lainnya tetap tersimpan.`}
                confirmText="Ganti Template"
                cancelText="Batal"
                type="warning"
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

export default TemplateStorePanel;
