import React, { useState } from 'react';
import { User, Type, ChevronDown, Palette, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { ProfileCardConfig } from '@/store/layersSlice';

export const ProfileCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config: ProfileCardConfig = element.profileCardConfig || ({
        name: 'Nama',
        role: 'mempelai_pria',
        parents: 'Putra dari Bpk. X & Ibu Y',
        instagram: '',
        theme: 'custom',
        customColor: '#bfa181'
    } as any);

    // FORTRESS: Local state buffering to fix the "jumping cursor" bug
    const [localName, setLocalName] = React.useState(config.name || '');
    const [localParents, setLocalParents] = React.useState((config as any).parents || '');

    // Sync local state when external data changes
    React.useEffect(() => {
        if (config.name !== localName) setLocalName(config.name || '');
    }, [config.name]);

    React.useEffect(() => {
        const extParents = (config as any).parents || '';
        if (extParents !== localParents) setLocalParents(extParents);
    }, [(config as any).parents]);

    const roleLabel = (config as any).role === 'mempelai_pria' || (config as any).role === 'Groom' ? 'Mempelai Pria' : 
                      (config as any).role === 'mempelai_wanita' || (config as any).role === 'Bride' ? 'Mempelai Wanita' : 
                      (config as any).role;

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Nama {roleLabel}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={localName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalName(val);
                                    handleUpdate({
                                        profileCardConfig: { ...config, name: val } as any
                                    });
                                }}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="Nama Lengkap"
                            />
                        </div>
                    </div>

                    {/* Parents Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Nama Orang Tua
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <Type className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={localParents}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalParents(val);
                                    handleUpdate({
                                        profileCardConfig: { ...config, parents: val } as any
                                    });
                                }}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="Putra/Putri dari..."
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Posisi / Role
                        </label>
                        <select
                            value={config.role || ''}
                            onChange={(e) => handleUpdate({
                                profileCardConfig: { ...config, role: e.target.value } as any
                            })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                        >
                            <option value="mempelai_pria">Mempelai Pria</option>
                            <option value="mempelai_wanita">Mempelai Wanita</option>
                            <option value="ayah_wanita">Ayah Wanita</option>
                            <option value="ibu_wanita">Ibu Wanita</option>
                            <option value="ayah_pria">Ayah Pria</option>
                            <option value="ibu_pria">Ibu Pria</option>
                        </select>
                    </div>
                </>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Data Profil Dikunci</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">{config.name || 'Belum diisi'}</p>
                        <p className="text-[10px] text-slate-500">{roleLabel}</p>
                    </div>
                </div>
            )}

            {/* STYLING TOGGLE */}
            {permissions.canEditStyle && (
                <div className="pt-2 border-t border-slate-100">
                    <button
                        onClick={() => setShowStyling(!showStyling)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-teal-500 transition-colors"
                    >
                        <Palette className="w-3.5 h-3.5" />
                        STYLING
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStyling ? 'rotate-180' : ''}`} />
                    </button>

                    {showStyling && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Aksen</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={(config as any).customColor || '#bfa181'}
                                        onChange={(e) => handleUpdate({
                                            profileCardConfig: { ...config, customColor: e.target.value } as any
                                        })}
                                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <input
                                        type="text"
                                        value={(config as any).customColor || '#bfa181'}
                                        onChange={(e) => handleUpdate({
                                            profileCardConfig: { ...config, customColor: e.target.value } as any
                                        })}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
