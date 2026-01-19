/**
 * GalleryPanel - Photo Gallery Management
 * Allows users to upload, crop, edit, and delete gallery photos
 */

import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    Image,
    Plus,
    X,
    Crop,
    Trash2,
    Save,
    Loader2,
    Check,
    AlertCircle,
    Camera
} from 'lucide-react';
import { invitations as invitationsApi, assets as assetsApi } from '@/lib/api';
import { ImageCropModal } from '@/components/Modals/ImageCropModal';
import { dataURLtoBlob } from '@/lib/utils';

interface GalleryPanelProps {
    invitationId: string;
    onClose: () => void;
}

interface GalleryPhoto {
    id: string;
    url: string;
}

const MAX_PHOTOS = 6;

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ invitationId, onClose }) => {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Crop modal state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing gallery photos
    useEffect(() => {
        const loadGallery = async () => {
            try {
                setLoading(true);
                const data = await invitationsApi.get(invitationId);
                if (data?.gallery_photos) {
                    const parsed = typeof data.gallery_photos === 'string'
                        ? JSON.parse(data.gallery_photos)
                        : data.gallery_photos;
                    // Normalize to GalleryPhoto format
                    const normalized = parsed.map((item: string | GalleryPhoto, idx: number) => {
                        if (typeof item === 'string') {
                            return { id: `photo-${idx}`, url: item };
                        }
                        return item;
                    });
                    setPhotos(normalized);
                }
            } catch (err) {
                console.error('[GalleryPanel] Load error:', err);
                setError('Gagal memuat galeri');
            } finally {
                setLoading(false);
            }
        };

        if (invitationId) {
            loadGallery();
        }
    }, [invitationId]);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (photos.length >= MAX_PHOTOS) {
            alert(`Maksimal ${MAX_PHOTOS} foto`);
            return;
        }

        // Read file as data URL for cropping
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageToCrop(reader.result as string);
            setEditingPhotoId(null); // New photo, not editing
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle crop for editing existing photo
    const handleEditPhoto = (photo: GalleryPhoto) => {
        setImageToCrop(photo.url);
        setEditingPhotoId(photo.id);
        setCropModalOpen(true);
    };

    // Handle crop complete - upload to R2 and update state
    const handleCropComplete = async (croppedImageUrl: string) => {
        setUploading(true);
        try {
            // Convert data URL to blob
            const blob = dataURLtoBlob(croppedImageUrl);

            // Upload to R2 via API
            const formData = new FormData();
            formData.append('file', blob, `gallery-${Date.now()}.png`);
            formData.append('invitationId', invitationId);
            formData.append('type', 'gallery');

            const uploadResult = await assetsApi.upload(formData);

            if (uploadResult?.url) {
                const newPhoto: GalleryPhoto = {
                    id: `photo-${Date.now()}`,
                    url: uploadResult.url
                };

                if (editingPhotoId) {
                    // Replace existing photo
                    setPhotos(prev => prev.map(p =>
                        p.id === editingPhotoId ? newPhoto : p
                    ));
                } else {
                    // Add new photo
                    setPhotos(prev => [...prev, newPhoto]);
                }
            }
        } catch (err) {
            console.error('[GalleryPanel] Upload error:', err);
            setError('Gagal upload foto');
        } finally {
            setUploading(false);
            setCropModalOpen(false);
            setImageToCrop(null);
            setEditingPhotoId(null);
        }
    };

    // Delete photo
    const handleDeletePhoto = (photoId: string) => {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    // Save gallery to database
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            // Extract just URLs for storage
            const photoUrls = photos.map(p => p.url);
            await invitationsApi.update(invitationId, {
                gallery_photos: JSON.stringify(photoUrls)
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('[GalleryPanel] Save error:', err);
            setError('Gagal menyimpan galeri');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Galeri...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
                        <Image className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Galeri Foto</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {photos.length}/{MAX_PHOTOS} Foto
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${saving
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : success
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {success && <Check className="w-4 h-4" />}
                    {saving ? 'Menyimpan...' : success ? 'Tersimpan!' : 'Simpan'}
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {photos.map((photo) => (
                        <m.div
                            key={photo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-100"
                        >
                            <img
                                src={photo.url}
                                alt="Gallery"
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleEditPhoto(photo)}
                                    className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                                    title="Crop"
                                >
                                    <Crop className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="p-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition-colors"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </m.div>
                    ))}
                </AnimatePresence>

                {/* Add Photo Button */}
                {photos.length < MAX_PHOTOS && (
                    <m.button
                        layout
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/30 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Camera className="w-6 h-6" />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {uploading ? 'Uploading...' : 'Tambah'}
                        </span>
                    </m.button>
                )}
            </div>

            {/* Empty State */}
            {photos.length === 0 && !uploading && (
                <div className="text-center py-10 space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                        <Image className="w-10 h-10 text-slate-200" />
                    </div>
                    <div>
                        <p className="text-slate-600 font-bold">Belum ada foto di galeri</p>
                        <p className="text-slate-400 text-sm">Klik tombol "Tambah" untuk upload foto pertamamu</p>
                    </div>
                </div>
            )}

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={cropModalOpen}
                imageSrc={imageToCrop}
                aspectRatio={1} // 1:1 square for gallery grid
                onClose={() => {
                    setCropModalOpen(false);
                    setImageToCrop(null);
                    setEditingPhotoId(null);
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default GalleryPanel;
