import React from 'react';
import { Video, Link as LinkIcon } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const VideoCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const config = (element as any).videoConfig || ({
        url: '',
        platform: 'youtube',
        autoplay: false,
        muted: true,
        loop: true,
        controls: false,
        showOnDesktop: true,
        showOnMobile: true
    } as any);

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    YouTube / Video URL
                </label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                        <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        disabled={!permissions.canEditText}
                        value={config.url || ''}
                        onChange={(e) => handleUpdate({
                            videoConfig: { ...config, url: e.target.value } as any
                        } as any)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:opacity-50"
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                </div>
            </div>
        </div>
    );
};
