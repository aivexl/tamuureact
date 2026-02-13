/**
 * SettingsPanel - Invitation Settings Management
 * 
 * Consolidated panel for:
 * - Rename invitation
 * - Change slug (with availability validation)
 * - Publish / Unpublish toggle
 * - Delete invitation (with confirmation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Save,
    Check,
    Trash2,
    Globe,
    GlobeLock,
    AlertTriangle,
    Link2,
    Type,
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations as invitationsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface SettingsPanelProps {
    invitationId?: string;
    invitation?: {
        id: string;
        title?: string;
        slug?: string;
        is_published?: boolean;
    };
    onClose: () => void;
    onUpdated?: (updates: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    invitationId,
    invitation,
    onClose,
    onUpdated,
}) => {
    const navigate = useNavigate();
    const { showModal } = useStore();
    const setIsPublished = useStore(s => s.setIsPublished);

    const effectiveId = invitationId || invitation?.id;

    const [name, setName] = useState(invitation?.title || '');
    const [slug, setSlug] = useState(invitation?.slug || '');
    const [isPublished, setLocalPublished] = useState(invitation?.is_published ?? false);
    const [loading, setLoading] = useState(!invitation);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [slugError, setSlugError] = useState<string | null>(null);

    // Load data if not provided via props
    useEffect(() => {
        if (invitation || !effectiveId) return;
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitationsApi.get(effectiveId);
                if (data) {
                    setName(data.name || '');
                    setSlug(data.slug || '');
                    setLocalPublished(!!data.is_published);
                }
            } catch (err) {
                console.error('[SettingsPanel] Load error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [effectiveId, invitation]);

    // Slug validation
    const validateSlug = useCallback((value: string) => {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(cleaned);
        setSlugError(null);

        if (cleaned.length < 3) {
            setSlugError('Minimal 3 karakter');
        } else if (cleaned.length > 50) {
            setSlugError('Maksimal 50 karakter');
        }
    }, []);

    const handleSave = async () => {
        if (!effectiveId || slugError) return;

        try {
            setSaving(true);
            setSuccess(false);

            await invitationsApi.update(effectiveId, {
                name,
                slug,
                is_published: isPublished,
            });

            // Sync published state to global store
            setIsPublished(isPublished);

            // Notify parent
            onUpdated?.({
                title: name,
                slug,
                is_published: isPublished,
                status: isPublished ? 'Published' : 'Draft',
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error('[SettingsPanel] Save error:', err);
            const message = err?.message || '';
            if (message.toLowerCase().includes('slug')) {
                setSlugError('Slug sudah digunakan. Pilih yang lain.');
            } else {
                showModal({
                    title: 'Gagal Menyimpan',
                    message: message || 'Terjadi kesalahan. Silakan coba lagi.',
                    type: 'error',
                });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!effectiveId) return;

        try {
            setDeleting(true);
            await invitationsApi.delete(effectiveId);
            showModal({
                title: 'Undangan Dihapus',
                message: 'Undangan berhasil dihapus secara permanen.',
                type: 'success',
            });
            navigate('/dashboard');
        } catch (err: any) {
            console.error('[SettingsPanel] Delete error:', err);
            showModal({
                title: 'Gagal Menghapus',
                message: err?.message || 'Terjadi kesalahan saat menghapus undangan.',
                type: 'error',
            });
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Memuat Pengaturan..." color="#64748b" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Pengaturan</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Kelola Undangan
                    </p>
                </div>
            </div>

            {/* Name */}
            <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 ml-1">
                            <Type className="w-4 h-4 text-slate-500" />
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Nama Undangan
                            </label>
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama undangan..."
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-700"
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 ml-1">
                            <Link2 className="w-4 h-4 text-slate-500" />
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Slug (Link Undangan)
                            </label>
                        </div>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => validateSlug(e.target.value)}
                            placeholder="nama-undangan-kamu"
                            className={`w-full px-6 py-4 bg-white border rounded-2xl focus:ring-4 outline-none font-bold text-slate-700 ${slugError
                                    ? 'border-red-200 focus:ring-red-500/10'
                                    : 'border-slate-100 focus:ring-slate-500/10'
                                }`}
                        />
                        {slugError && (
                            <p className="text-[10px] text-red-500 font-bold ml-4">{slugError}</p>
                        )}
                        <p className="text-[9px] text-slate-400 ml-4 font-medium italic">
                            tamuu.id/preview/<span className="text-slate-600 font-bold">{slug || '...'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Publish Toggle */}
            <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                <button
                    onClick={() => setLocalPublished(!isPublished)}
                    className="w-full flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        {isPublished ? (
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <Globe className="w-5 h-5 text-emerald-600" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <GlobeLock className="w-5 h-5 text-slate-400" />
                            </div>
                        )}
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-800">
                                {isPublished ? 'Undangan Aktif' : 'Undangan Draft'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {isPublished
                                    ? 'Tamu dapat mengakses undangan Anda'
                                    : 'Hanya Anda yang bisa melihat undangan'}
                            </p>
                        </div>
                    </div>
                    <div
                        className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${isPublished ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                    >
                        <m.div
                            animate={{ x: isPublished ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-5 h-5 bg-white rounded-full shadow-md"
                        />
                    </div>
                </button>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving || !!slugError}
                    className={`flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95 ${success
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : 'bg-slate-900 text-white hover:bg-slate-700 shadow-slate-900/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {saving ? (
                        <PremiumLoader variant="inline" size="sm" color="white" />
                    ) : success ? (
                        <>
                            <Check className="w-6 h-6" />
                            Tersimpan!
                        </>
                    ) : (
                        <>
                            <Save className="w-6 h-6" />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-[2rem] p-6 border border-red-100/50 space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                        Zona Berbahaya
                    </h4>
                </div>

                <AnimatePresence mode="wait">
                    {!showDeleteConfirm ? (
                        <m.button
                            key="delete-trigger"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-4 border-2 border-dashed border-red-200 rounded-2xl text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-400 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Hapus Undangan Ini
                        </m.button>
                    ) : (
                        <m.div
                            key="delete-confirm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            <p className="text-sm text-red-600 font-medium text-center">
                                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Semua data termasuk ucapan tamu akan dihapus permanen.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-3 bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <PremiumLoader variant="inline" size="sm" color="white" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Ya, Hapus!
                                        </>
                                    )}
                                </button>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SettingsPanel;
