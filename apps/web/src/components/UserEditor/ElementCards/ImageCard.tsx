import React, { useState, useRef } from 'react';
import { ImageIcon, Plus, Trash2, Crop as CropIcon, Lock, UploadCloud } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { ImageCropModal, CropConfig } from '@/components/Modals/ImageCropModal';
import { storage } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { generateId } from '@/lib/utils';

export const ImageCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CTO: Context Acquisition
    const { id: contextId, isTemplate } = useStore();
    const user = useStore(s => s.user);
    const userId = user?.id;

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

    const handleCropComplete = async (croppedBlob: Blob, cropConfig: CropConfig) => {
        setIsUploading(true);
        try {
            const fileName = `crop_${generateId('img')}.png`;
            const file = new File([croppedBlob], fileName, { type: 'image/png' });

            // 1. Upload to Cloudflare R2 with automatic optimization + forensic metadata
            const result = await storage.upload(file, 'gallery', { 
                userId, 
                invitationId: !isTemplate ? contextId : undefined,
                templateId: isTemplate ? contextId : undefined
            });
            const publicUrl = result.url;


            // 2. Update the element with the optimized URL
            handleUpdate({
                content: publicUrl,
                imageUrl: publicUrl,
                cropConfig: cropConfig as any
            });

            
            setSelectedImageSrc(null);
            return true; // Signal success to modal
        } catch (error) {
            console.error('[ImageCard] Upload failed:', error);
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pratinjau Gambar</label>
                {canEdit && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`${isUploading ? 'text-slate-400' : 'text-teal-600 hover:text-teal-700'} text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2`}
                    >
                        {isUploading && <div className="w-2 h-2 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />}
                        {isUploading ? 'Uploading...' : 'Ganti Gambar'}
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
                            <UploadCloud className="w-5 h-5 text-teal-500" />
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
