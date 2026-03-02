import React, { useState, useRef } from 'react';
import { ImageIcon, Plus, Trash2, Crop as CropIcon, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { ImageCropModal, CropConfig } from '@/components/Modals/ImageCropModal';

export const ImageCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canEdit = permissions.canEditImage;

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
        handleUpdate({
            content: croppedImageUrl,
            cropConfig: cropConfig as any
        });
        setIsCropOpen(false);
        setSelectedImageSrc(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pratinjau Gambar</label>
                {canEdit && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-teal-600 hover:text-teal-700 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Ganti Gambar
                    </button>
                )}
            </div>

            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
                {element.content ? (
                    <img 
                        src={element.content} 
                        alt={element.name} 
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Belum ada gambar</span>
                    </div>
                )}

                {canEdit ? (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-white text-slate-700 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-lg text-white/80">
                        <Lock className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>

            {canEdit && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            )}

            <ImageCropModal
                isOpen={isCropOpen}
                imageSrc={selectedImageSrc}
                aspectRatio={element.width / element.height}
                onClose={() => {
                    setIsCropOpen(false);
                    setSelectedImageSrc(null);
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};
