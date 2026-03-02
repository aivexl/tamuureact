import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Image as ImageIcon, Crop as CropIcon } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { ImageCropModal, CropConfig } from '@/components/Modals/ImageCropModal';
import { PhotoGridConfig } from '@/store/layersSlice';

export const PhotoGridCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CTO: Resilience Initialization with any cast to bypass strict interface requirements in fallback
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

    const handleCropComplete = (croppedImageUrl: string, cropConfig: CropConfig) => {
        const newImages = [...images];
        if (croppingIndex !== null && croppingIndex < newImages.length) {
            newImages[croppingIndex] = croppedImageUrl;
        } else {
            newImages.push(croppedImageUrl);
        }

        handleUpdate({
            photoGridConfig: {
                ...config,
                images: newImages
            } as any
        });

        setIsCropOpen(false);
        setSelectedImageSrc(null);
        setCroppingIndex(null);
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
        setCroppingIndex(null);
        fileInputRef.current?.click();
    };

    const handleEditClick = (index: number) => {
        setCroppingIndex(index);
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Koleksi Foto ({images.length})
                </label>
                {permissions.canEditImage && (
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                            
                            {permissions.canEditImage && (
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleEditClick(index)}
                                        className="p-2 bg-white text-slate-700 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        title="Ganti Foto"
                                    >
                                        <CropIcon className="w-4 h-4 text-teal-500" />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="p-2 bg-white text-red-500 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </m.div>
                    ))}

                    {permissions.canEditImage && images.length === 0 && (
                        <button
                            onClick={handleAddClick}
                            className="col-span-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-300 hover:bg-teal-50/30 hover:text-teal-600 transition-all"
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Unggah Foto Pertama</span>
                        </button>
                    )}
                </AnimatePresence>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

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

            <div className="flex items-start gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                <ImageIcon className="w-4 h-4 text-teal-500 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Optimasi Foto</span>
                    <span className="text-[10px] text-teal-600/80 leading-relaxed font-medium">
                        Foto akan otomatis di-crop menjadi kotak agar tata letak grid tetap rapi dan estetik.
                    </span>
                </div>
            </div>
        </div>
    );
};
