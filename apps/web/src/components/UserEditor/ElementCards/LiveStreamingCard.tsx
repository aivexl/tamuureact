import React from 'react';
import { Monitor, Link as LinkIcon, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const LiveStreamingCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const config = element.liveStreamingConfig || ({
        url: '',
        platform: 'youtube',
        title: 'Live Streaming',
        showOnDesktop: true,
        showOnMobile: true
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Platform Streaming
                        </label>
                        <select
                            value={config.platform || 'youtube'}
                            onChange={(e) => handleUpdate({
                                liveStreamingConfig: { ...config, platform: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
                        >
                            <option value="youtube">YouTube Live</option>
                            <option value="zoom">Zoom Meeting</option>
                            <option value="instagram">Instagram Live</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Link Streaming / Meeting ID
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <LinkIcon className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={config.url || ''}
                                onChange={(e) => handleUpdate({
                                    liveStreamingConfig: { ...config, url: e.target.value }
                                })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="https://youtube.com/live/..."
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Streaming Dikunci</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{config.url || 'Link belum diatur'}</p>
                </div>
            )}
        </div>
    );
};
