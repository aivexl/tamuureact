import React from 'react';
import { m } from 'framer-motion';
import { Type, Image as ImageIcon, MapPin, Copy, Shield, Clock, Lock } from 'lucide-react';
import { useStore, Layer } from '@/store/useStore';

interface UserElementEditorProps {
    element: Layer;
    sectionId: string;
}

export const UserElementEditor: React.FC<UserElementEditorProps> = ({ element, sectionId }) => {
    const { updateElementInSection } = useStore();
    const permissions = element.permissions || {
        canEditText: true,
        canEditImage: true,
        canEditStyle: true,
        canEditPosition: true,
        canDelete: true,
        isVisibleInUserEditor: true,
        isContentProtected: false
    };

    const isProtected = permissions.isContentProtected === true;

    // Handle updates: forward changes to Zustand store
    const handleUpdate = (updates: Partial<Layer>) => {
        if (!sectionId) return;
        updateElementInSection(sectionId, element.id, updates);
    };

    // Helper to get icon based on element type
    const getIcon = () => {
        switch (element.type) {
            case 'text': return <Type className="w-4 h-4" />;
            case 'image': return <ImageIcon className="w-4 h-4" />;
            case 'gif': return <ImageIcon className="w-4 h-4" />;
            case 'maps_point': return <MapPin className="w-4 h-4" />;
            case 'countdown': return <Clock className="w-4 h-4" />;
            default: return <Type className="w-4 h-4" />;
        }
    };

    if (permissions.isVisibleInUserEditor === false) return null;

    return (
        <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                        {getIcon()}
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-800 tracking-tight uppercase tracking-widest">
                            {element.name || 'Element'}
                        </span>
                        {(isProtected || !permissions.canEditText || !permissions.canEditImage || !permissions.canEditStyle) && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                                <Shield className="w-2.5 h-2.5" />
                                {isProtected ? 'Protected' : 'Locked by Admin'}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => navigator.clipboard.writeText(element.content || '')}
                    className="p-2 text-slate-300 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-all"
                    title="Copy content"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            {/* Text Field */}
            {element.type === 'text' && (
                <div className="space-y-2">
                    {permissions.canEditText ? (
                        element.content && element.content.length > 50 ? (
                            <textarea
                                value={element.content || ''}
                                onChange={(e) => handleUpdate({ content: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none"
                                rows={3}
                                placeholder="Mulai mengetik..."
                            />
                        ) : (
                            <input
                                type="text"
                                value={element.content || ''}
                                onChange={(e) => handleUpdate({ content: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                                placeholder="Mulai mengetik..."
                            />
                        )
                    ) : (
                        <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-medium text-slate-400 italic">
                            {element.content || 'Konten dikunci oleh admin'}
                        </div>
                    )}
                </div>
            )}

            {/* Countdown Date Field */}
            {element.type === 'countdown' && element.countdownConfig && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tanggal Target
                    </label>
                    <input
                        type="datetime-local"
                        disabled={!permissions.canEditText}
                        value={element.countdownConfig.targetDate?.slice(0, 16) || ''}
                        onChange={(e) => handleUpdate({
                            countdownConfig: {
                                ...element.countdownConfig!,
                                targetDate: new Date(e.target.value).toISOString()
                            } as typeof element.countdownConfig
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none ${!permissions.canEditText ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
            )}

            {/* Image Field */}
            {(element.type === 'image' || element.type === 'gif') && (
                <div className="space-y-3">
                    {permissions.canEditImage ? (
                        <div className="relative group/upload h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                            {element.imageUrl ? (
                                <img src={element.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-[calc(1rem-2px)] opacity-50 group-hover/upload:opacity-30 transition-opacity" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                                    <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                                    Pilih Foto
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                            {element.imageUrl ? (
                                <img src={element.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl opacity-40 grayscale" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-200" />
                            )}
                            <div className="absolute flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                <Lock className="w-3 h-3" /> Foto Dikunci
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Maps Field */}
            {element.type === 'maps_point' && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Maps URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={element.mapsConfig?.googleMapsUrl || ''}
                                onChange={(e) => handleUpdate({
                                    mapsConfig: { ...element.mapsConfig!, googleMapsUrl: e.target.value } as typeof element.mapsConfig
                                })}

                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                                placeholder="https://maps.app.goo.gl/..."
                            />
                            <a
                                href={element.mapsConfig?.googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-teal-500 hover:shadow-md transition-all"
                            >
                                <MapPin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </m.div>
    );
};
