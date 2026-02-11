import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Layer, ProfileCardConfig } from '@/store/layersSlice';
import * as LucideIcons from 'lucide-react';

interface ProfileCardElementProps {
    layer: Layer;
    isEditor?: boolean;
    onContentLoad?: () => void;
}

export const ProfileCardElement: React.FC<ProfileCardElementProps> = ({ layer, isEditor, onContentLoad }) => {
    useEffect(() => {
        onContentLoad?.();
    }, []);

    const config: ProfileCardConfig = layer.profileCardConfig || {
        role: 'mempelai_pria',
        name: 'Nama Mempelai',
        variant: 'luxury',
        backgroundColor: '#bfa181',
        textColor: '#ffffff',
        fontFamily: 'Playfair Display',
        fontSize: 24,
        textAlign: 'center',
        showTitle: true
    };

    const getRoleTitle = (role: string) => {
        switch (role) {
            case 'mempelai_pria': return 'Mempelai Pria';
            case 'mempelai_wanita': return 'Mempelai Wanita';
            case 'ayah_wanita': return 'Ayah Mempelai Wanita';
            case 'ibu_wanita': return 'Ibu Mempelai Wanita';
            case 'ayah_pria': return 'Ayah Mempelai Pria';
            case 'ibu_pria': return 'Ibu Mempelai Pria';
            default: return '';
        }
    };

    const getVariantStyles = (): React.CSSProperties => {
        const { variant, backgroundColor, textColor, fontFamily, fontSize, textAlign } = config;

        const base: React.CSSProperties = {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            padding: '20px',
            textAlign,
            fontFamily,
            color: textColor,
        };

        if (variant === 'luxury') {
            return {
                ...base,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            };
        }

        if (variant === 'solid') {
            return {
                ...base,
                backgroundColor,
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            };
        }

        // Transparent
        return base;
    };

    return (
        <div className="w-full h-full p-2">
            <div style={getVariantStyles()} className="transition-all duration-300">
                <AnimatePresence mode="wait">
                    <m.div
                        key={`${config.role}-${config.name}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-1 w-full"
                    >
                        {config.showTitle && (
                            <span
                                className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold mb-1"
                                style={{ color: config.variant === 'luxury' ? '#bfa181' : 'inherit' }}
                            >
                                {getRoleTitle(config.role)}
                            </span>
                        )}
                        <h2
                            className="font-bold leading-tight"
                            style={{
                                fontSize: `${config.fontSize}px`,
                                color: config.textColor
                            }}
                        >
                            {config.name}
                        </h2>
                        {(config.parentName1 || config.parentName2) && (
                            <div className="mt-2 text-[12px] opacity-70 italic">
                                {config.parentName1 && <div>{config.parentName1}</div>}
                                {config.parentName2 && <div>{config.parentName2}</div>}
                            </div>
                        )}
                    </m.div>
                </AnimatePresence>

                {isEditor && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 border border-white/10">
                        <LucideIcons.User className="w-2.5 h-2.5 text-white/40" />
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">Profile Card</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCardElement;
