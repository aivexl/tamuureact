import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Image as ImageIcon, Crop as CropIcon, Lock, UploadCloud } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { ImageCropModal, CropConfig } from '@/components/Modals/ImageCropModal';
import { PhotoGridConfig } from '@/store/layersSlice';
import { storage } from '@/lib/api';
import { generateId } from '@/lib/utils';

export const PhotoGridCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canEdit = permissions.canEditImage;

    // CTO: Resilience Initialization
    const config: PhotoGridConfig = element.photoGridConfig || ({
        images: [],
        variant: 'mosaic',
        gap: 10,
        cornerRadius: 12,
        hoverEffect: 'zoom'
    } as any);
    
    const images = config.images || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImageSrc(reader.result as string);
                setIsCropOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob, _cropConfig: CropConfig) => {
        setIsUploading(true);
        try {
            const fileName = `photogrid_${generateId('img')}.png`;
            const file = new File([croppedBlob], fileName, { type: 'image/png' });

            // 1. Upload to Cloudflare R2 with standard optimization
            const result = await storage.upload(file, 'gallery');
            const publicUrl = result.url;

            // 2. Update the images array
            const newImages = [...images];
            if (croppingIndex !== null && croppingIndex < newImages.length) {
                newImages[croppingIndex] = publicUrl;
            } else {
                newImages.push(publicUrl);
            }

            handleUpdate({
                photoGridConfig: {
                    ...config,
                    images: newImages
                } as any
            });

            setSelectedImageSrc(null);
            setCroppingIndex(null);
            return true; // Signal success to modal
        } catch (error) {
            console.error('[PhotoGridCard] Upload failed:', error);
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        handleUpdate({
            photoGridConfig: {
                ...config,
                images: newImages
            } as any
        });
    };

    const handleAddClick = () => {
        if (!canEdit) return;
        setCroppingIndex(null);
        fileInputRef.current?.click();
    };

    const handleEditClick = (index: number) => {
        if (!canEdit) return;
        setCroppingIndex(index);
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Koleksi Foto
                    </label>
                    <span className="text-[9px] font-bold text-teal-600 uppercase">{images.length} / 10 Foto</span>
                </div>
                
                {canEdit && images.length > 0 && (
                    <button
                        onClick={handleAddClick}
                        disabled={isUploading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                            isUploading 
                            ? 'bg-slate-50 text-slate-400 border-slate-100' 
                            : 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100'
                        }`}
                    >
                        {isUploading ? (
                            <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-3.5 h-3.5" />
                        )}
                        {isUploading ? 'Processing...' : 'Tambah'}
                    </button>
                )}
            </div>

            {/* Main Upload / Grid Area */}
            <div className="space-y-4">
                {canEdit && (images.length === 0) ? (
                    <button
                        onClick={handleAddClick}
                        disabled={isUploading}
                        className={`w-full py-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all group ${
                            isUploading 
                            ? 'bg-slate-50 border-slate-100 text-slate-300' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-teal-300 hover:bg-teal-50/30 hover:text-teal-600'
                        }`}
                    >
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            {isUploading ? (
                                <div className="w-7 h-7 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                            ) : (
                                <UploadCloud className="w-7 h-7 text-teal-500" />
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-black uppercase tracking-widest">
                                {isUploading ? 'Optimizing Media...' : 'Unggah Foto'}
                            </span>
                            <span className="text-[9px] font-medium opacity-60">Format JPG, PNG (Max 5MB)</span>
                        </div>
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <AnimatePresence mode="popLayout">
                            {images.map((url, index) => (
                                <m.div
                                    key={`${url}-${index}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                                >
                                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                    
                                    {canEdit ? (
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(index)}
                                                disabled={isUploading}
                                                className="p-2 bg-white text-slate-700 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                                title="Ganti Foto"
                                            >
                                                {isUploading && croppingIndex === index ? (
                                                    <div className="w-4 h-4 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                                                ) : (
                                                    <UploadCloud className="w-4 h-4 text-teal-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveImage(index)}
                                                disabled={isUploading}
                                                className="p-2 bg-white text-red-500 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="absolute top-2 right-2 p-1.5 bg-black/20 backdrop-blur-md rounded-lg text-white/80">
                                            <Lock className="w-3 h-3" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest">
                                        #{index + 1}
                                    </div>
                                </m.div>
                            ))}

                            {canEdit && images.length > 0 && images.length < 10 && (
                                <button
                                    onClick={handleAddClick}
                                    disabled={isUploading}
                                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-300 hover:bg-teal-50/30 hover:text-teal-600 transition-all group disabled:opacity-50"
                                >
                                    {isUploading && croppingIndex === null ? (
                                        <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                    )}
                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                        {isUploading && croppingIndex === null ? 'Adding...' : 'Tambah'}
                                    </span>
                                </button>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Modals */}
            <ImageCropModal
                isOpen={isCropOpen}
                imageSrc={selectedImageSrc}
                aspectRatio={1} 
                onClose={() => {
                    setIsCropOpen(false);
                    setSelectedImageSrc(null);
                    setCroppingIndex(null);
                }}
                onCropComplete={handleCropComplete}
            />

            {/* Footer Info */}
            <div className="flex items-start gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                <ImageIcon className="w-4 h-4 text-teal-500 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Auto-Optimization</span>
                    <span className="text-[10px] text-teal-600/80 leading-relaxed font-medium">
                        Foto otomatis di-crop menjadi kotak (1:1) agar tampilan grid tetap estetik dan rapi secara profesional.
                    </span>
                </div>
            </div>
        </div>
    );
};
