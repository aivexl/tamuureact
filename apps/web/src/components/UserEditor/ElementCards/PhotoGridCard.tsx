import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Image as ImageIcon, Crop as CropIcon, Lock, UploadCloud } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { ImageCropModal, CropConfig } from '../../Modals/ImageCropModal';
import { PhotoGridConfig } from '../../../store/layersSlice';
import { useStore } from '../../../store/useStore';
import { storage } from '../../../lib/api';
import { generateId } from '../../../lib/utils';

export const PhotoGridCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CTO: Context Acquisition
    const { id: contextId, isTemplate } = useStore();
    const user = useStore(s => s.user);
    const userId = user?.id;

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

            // 1. Upload to Cloudflare R2 with standard optimization + forensic metadata
            const result = await storage.upload(file, 'gallery', { 
                userId, 
                invitationId: !isTemplate ? contextId : undefined,
                templateId: isTemplate ? contextId : undefined
            });
            const publicUrl = result.url;

            // 2. Update the images array
            const newImages = [...images];
            if (croppingIndex !== null && croppingIndex < newImages.length) {
                newImages[croppingIndex] = publicUrl;
            }

            handleUpdate({
                photoGridConfig: {
                    ...config,
                    images: newImages
                } as any
            });

            return true; // Signal success to modal
        } catch (error) {
            console.error('[PhotoGridCard] Upload failed:', error);
            return false;
        } finally {
            setIsUploading(false);
        }
    };


    const handleEditClick = (index: number) => {
        if (!canEdit) return;
        setCroppingIndex(index);
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Manajemen Foto Grid
                    </label>
                    <span className="text-[9px] font-bold text-teal-600 uppercase tracking-tight">
                        {images.length} Slot Tersedia
                    </span>
                </div>
            </div>

            {/* Main Grid Area - FIXED SLOTS (Structural Integrity) */}
            <div className="space-y-4">
                {images.length === 0 ? (
                    <div className="w-full py-16 border-2 border-dashed rounded-[2.5rem] bg-slate-50 border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Belum ada foto</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        <AnimatePresence mode="popLayout">
                            {images.map((url, index) => (
                                <m.div
                                    key={`${url}-${index}`}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-3 group"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm transition-all group-hover:shadow-md group-hover:border-teal-100">
                                        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                                            #{index + 1}
                                        </div>
                                        
                                        {!canEdit && (
                                            <div className="absolute top-3 right-3 p-1.5 bg-black/20 backdrop-blur-md rounded-lg text-white/80">
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button - Replace Only (Permanent Display) */}
                                    <button
                                        onClick={() => handleEditClick(index)}
                                        disabled={isUploading || !canEdit}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${
                                            isUploading && croppingIndex === index
                                            ? 'bg-slate-50 text-slate-400 border-slate-100'
                                            : 'bg-white text-teal-600 border-teal-100 hover:bg-teal-50 hover:border-teal-200 active:scale-[0.98]'
                                        } ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'shadow-sm'}`}
                                    >
                                        {isUploading && croppingIndex === index ? (
                                            <div className="w-3.5 h-3.5 border-2 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                                        ) : (
                                            <UploadCloud className="w-3.5 h-3.5" />
                                        )}
                                        {isUploading && croppingIndex === index ? 'Mungunggah...' : 'Ganti Foto'}
                                    </button>
                                </m.div>
                            ))}
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
