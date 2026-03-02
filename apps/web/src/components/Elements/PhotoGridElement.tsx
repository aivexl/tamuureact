import React from 'react';
import { Layer } from '@/store/useStore';

interface PhotoGridElementProps {
    element: Layer;
}

export const PhotoGridElement: React.FC<PhotoGridElementProps> = ({ element }) => {
    const config = element.photoGridConfig || { images: [], gap: 10, cornerRadius: 12 };
    const images = config.images || [];

    if (images.length === 0) {
        return (
            <div 
                className="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-200"
                style={{ borderRadius: `${config.cornerRadius || 12}px` }}
            >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo Grid (Kosong)</span>
            </div>
        );
    }

    return (
        <div 
            className="w-full h-full grid grid-cols-2 gap-2"
            style={{ 
                gap: `${config.gap || 10}px`,
                padding: '2px'
            }}
        >
            {images.map((url, i) => (
                <div 
                    key={i} 
                    className="relative w-full h-full overflow-hidden shadow-sm"
                    style={{ borderRadius: `${config.cornerRadius || 12}px` }}
                >
                    <img 
                        src={url} 
                        alt={`Grid ${i}`} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                </div>
            ))}
        </div>
    );
};
