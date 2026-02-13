/**
 * ProfilePhotoPanel - Profile Photo Management for User Editor
 * 
 * Scans canvas sections for profile_photo elements where the admin
 * has granted canEditImage permission, and lets users upload/replace
 * their profile photo. Respects admin-defined permissions.
 */

import React, { useState, useRef, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Users, Camera, Check, AlertCircle, ImagePlus } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { assets as assetsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { ImageCropModal } from '@/components/Modals/ImageCropModal';
import { dataURLtoBlob } from '@/lib/utils';

interface ProfilePhotoPanelProps {
    invitationId?: string;
    onClose: () => void;
}

export const ProfilePhotoPanel: React.FC<ProfilePhotoPanelProps> = ({ invitationId, onClose }) => {
    const sections = useStore(s => s.sections);
    const updateElementInSection = useStore(s => s.updateElementInSection);

    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crop modal state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [editTarget, setEditTarget] = useState<{ sectionId: string; elementId: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Find all profile_photo elements across all sections
    const profilePhotoElements = useMemo(() => {
        const results: Array<{ sectionId: string; element: any }> = [];
        sections.forEach(section => {
            (section.elements || []).forEach(el => {
                const isProfilePhoto =
                    el.type === 'profile_photo' ||
                    el.name?.toLowerCase().includes('profile_photo') ||
                    el.name?.toLowerCase().includes('foto_profil');

                const canEdit = el.permissions?.canEditImage !== false;

                if (isProfilePhoto && canEdit) {
                    results.push({ sectionId: section.id, element: el });
                }
            });
        });
        return results;
    }, [sections]);

    const handleFileSelect = (sectionId: string, elementId: string) => {
        setEditTarget({ sectionId, elementId });
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editTarget) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageToCrop(reader.result as string);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCropComplete = async (croppedImageUrl: string) => {
        if (!editTarget || !invitationId) return;

        setUploading(true);
        setError(null);
        try {
            const blob = dataURLtoBlob(croppedImageUrl);
            const formData = new FormData();
            formData.append('file', blob, `profile-photo-${Date.now()}.png`);
            formData.append('invitationId', invitationId);
            formData.append('type', 'profile_photo');

            const uploadResult = await assetsApi.upload(formData);

            if (uploadResult?.url) {
                // Update the element in the canvas store
                updateElementInSection(editTarget.sectionId, editTarget.elementId, {
                    src: uploadResult.url,
                    profilePhotoConfig: {
                        url: uploadResult.url,
                    }
                } as any);

                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }
        } catch (err: any) {
            console.error('[ProfilePhotoPanel] Upload error:', err);
            setError('Gagal mengupload foto. Silakan coba lagi.');
        } finally {
            setUploading(false);
            setCropModalOpen(false);
            setImageToCrop(null);
            setEditTarget(null);
        }
    };

    // No profile photo elements found in template
    if (profilePhotoElements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                    <Users className="w-10 h-10" />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 tracking-tight text-lg">Tidak Ada Foto Profil</h4>
                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mt-2">
                        Template ini tidak memiliki elemen foto profil yang bisa diedit.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Foto Profil</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {profilePhotoElements.length} Elemen Ditemukan
                    </p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Profile Photo Cards */}
            <div className="space-y-4">
                <AnimatePresence>
                    {profilePhotoElements.map(({ sectionId, element }, idx) => {
                        const currentUrl = element.src || element.profilePhotoConfig?.url;
                        return (
                            <m.div
                                key={element.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-sky-600" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {element.name || `Foto Profil ${idx + 1}`}
                                    </span>
                                </div>

                                {/* Photo Preview */}
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                                        {currentUrl ? (
                                            <img
                                                src={currentUrl}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImagePlus className="w-8 h-8 text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleFileSelect(sectionId, element.id)}
                                        disabled={uploading}
                                        className="flex-1 py-4 border-2 border-dashed border-sky-200 rounded-2xl text-sky-600 font-bold text-xs uppercase tracking-widest hover:bg-sky-50 hover:border-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {uploading && editTarget?.elementId === element.id ? (
                                            <PremiumLoader variant="inline" size="sm" color="#0284c7" />
                                        ) : success ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Tersimpan!
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4" />
                                                {currentUrl ? 'Ganti Foto' : 'Upload Foto'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </m.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={cropModalOpen}
                imageSrc={imageToCrop}
                aspectRatio={1}
                onClose={() => {
                    setCropModalOpen(false);
                    setImageToCrop(null);
                    setEditTarget(null);
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default ProfilePhotoPanel;
