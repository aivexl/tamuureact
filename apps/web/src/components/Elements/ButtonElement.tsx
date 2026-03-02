import React from 'react';
import { Layer } from '@/store/layersSlice';

export const ButtonElement: React.FC<{ layer: Layer }> = ({ layer }) => {
    const config = (layer as any).buttonConfig || {
        text: layer.content || 'Klik di Sini',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        borderRadius: 12
    };

    return (
        <div 
            className="w-full h-full flex items-center justify-center font-black text-[12px] uppercase tracking-[0.2em] shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ 
                backgroundColor: (config as any).backgroundColor || '#000000',
                color: (config as any).textColor || '#ffffff',
                borderRadius: `${(config as any).borderRadius || 12}px`
            }}
        >
            {(config as any).text || layer.content}
        </div>
    );
};
