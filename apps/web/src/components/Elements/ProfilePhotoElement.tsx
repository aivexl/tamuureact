import React, { useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import { Layer, ProfilePhotoConfig } from '@/store/layersSlice';
import { useStore } from '@/store/useStore';
import { Camera, Image as ImageIcon, Upload, User, UserRound, UsersRound } from 'lucide-react';
import { patchLegacyUrl } from '@/lib/utils';

interface ProfilePhotoElementProps {
    layer: Layer;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

export const ProfilePhotoElement: React.FC<ProfilePhotoElementProps> = ({ layer, isEditor, onContentLoad }) => {
    const openImageCropModal = useStore(state => state.openImageCropModal);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onContentLoad?.();
    }, []);

    const config: ProfilePhotoConfig = layer.profilePhotoConfig || {
        role: 'mempelai_pria',
        shape: 'luxury',
        borderWidth: 2,
        borderColor: '#bfa181',
        showLabel: true,
        label: 'Mempelai Pria'
    };

    const imageUrl = layer.imageUrl;

    const handleUploadClick = (e: React.MouseEvent) => {
        if (!isEditor) return;
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageSrc = event.target?.result as string;
                if (imageSrc) {
                    // Open crop modal: openImageCropModal(imageSrc, layerId, slotIndex, aspectRatio)
                    // For profile photo, we use 1:1 aspect ratio usually, but luxury might be different?
                    // Let's stick with 1:1 for profile photos.
                    openImageCropModal(imageSrc, layer.id, 0, 1);
                }
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getMaskStyle = () => {
        switch (config.shape) {
            case 'circle': return { clipPath: 'circle(50% at 50% 50%)' };
            case 'square': return { borderRadius: '12%' };
            case 'heart': return { clipPath: 'path("M 50 15 C 35 -5 0 5 0 35 C 0 65 50 95 50 95 C 50 95 100 65 100 35 C 100 5 65 -5 50 15 Z")' }; // Approximate heart
            case 'luxury': return { clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)' }; // Premium shield shape
            case 'arch': return { clipPath: 'inset(0% 0% 0% 0% round 50% 50% 0% 0%)' };
            case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
            default: return {};
        }
    };

    const getRoleIcon = () => {
        switch (config.role) {
            case 'mempelai_pria': return <UserRound className="w-8 h-8 opacity-20" />;
            case 'mempelai_wanita': return <UserRound className="w-8 h-8 opacity-20" />; // Should ideally be female icon
            case 'general': return <ImageIcon className="w-8 h-8 opacity-20" />;
            default: return <UsersRound className="w-8 h-8 opacity-20" />;
        }
    };

    return (
        <div className="w-full h-full relative group">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <div
                className="w-full h-full overflow-hidden transition-all duration-500 relative"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: config.showBorder !== false
                        ? `${config.borderWidth}px solid ${config.borderColor}`
                        : 'none',
                    ...getMaskStyle()
                }}
            >
                {imageUrl ? (
                    <img
                        src={patchLegacyUrl(imageUrl)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={config.label || 'Profile Photo'}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                        {getRoleIcon()}
                    </div>
                )}

                {isEditor && (
                    <div
                        onClick={handleUploadClick}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-2"
                    >
                        <div className="w-10 h-10 rounded-full bg-premium-accent flex items-center justify-center shadow-lg">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Ganti Foto</span>
                    </div>
                )}
            </div>

            {isEditor && config.showLabel && (
                <div className="absolute -bottom-6 left-0 right-0 text-center">
                    <span
                        className="text-[8px] font-black uppercase tracking-[0.2em]"
                        style={{ color: config.labelColor || 'rgba(255,255,255,0.4)' }}
                    >
                        {config.label || config.role.replace('_', ' ')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProfilePhotoElement;
