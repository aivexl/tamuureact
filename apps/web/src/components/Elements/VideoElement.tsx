import React from 'react';
import { Layer } from '@/store/layersSlice';

export const VideoElement: React.FC<{ layer: Layer }> = ({ layer }) => {
    const config = (layer as any).videoConfig || { url: '' };
    
    if (!config.url) {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center rounded-2xl overflow-hidden border border-white/10">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center px-4">
                    Video Placeholder<br/>(Link Belum Diatur)
                </span>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <iframe 
                src={config.url.replace('watch?v=', 'embed/')} 
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media" 
                allowFullScreen
            />
        </div>
    );
};
