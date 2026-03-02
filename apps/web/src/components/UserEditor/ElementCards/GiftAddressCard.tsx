import React, { useState } from 'react';
import { Home, User, Phone, MapPin, ChevronDown, Palette } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { GiftAddressConfig } from '@/store/layersSlice';

export const GiftAddressCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config: GiftAddressConfig = element.giftAddressConfig || ({
        receiverName: '',
        phoneNumber: '',
        fullAddress: '',
        buttonText: 'Salin Alamat',
        theme: 'custom',
        customColor: '#bfa181'
    } as any);

    return (
        <div className="space-y-5">
            {/* Receiver Name */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Penerima</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                        <User className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        disabled={!permissions.canEditText}
                        value={(config as any).receiverName || ''}
                        onChange={(e) => handleUpdate({
                            giftAddressConfig: { ...config, receiverName: e.target.value } as any
                        })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:opacity-50"
                        placeholder="Nama Lengkap"
                    />
                </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                        <Phone className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        disabled={!permissions.canEditText}
                        value={config.phoneNumber || ''}
                        onChange={(e) => handleUpdate({
                            giftAddressConfig: { ...config, phoneNumber: e.target.value } as any
                        })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:opacity-50"
                        placeholder="0812xxxx"
                    />
                </div>
            </div>

            {/* Full Address */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                <div className="relative group">
                    <div className="absolute left-4 top-3 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                        disabled={!permissions.canEditText}
                        value={(config as any).fullAddress || ''}
                        onChange={(e) => handleUpdate({
                            giftAddressConfig: { ...config, fullAddress: e.target.value } as any
                        })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:opacity-50 min-h-[80px] resize-none"
                        placeholder="Jalan, RT/RW, Kec, Kota, Kode Pos"
                    />
                </div>
            </div>

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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Kustom</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={(config as any).customColor || '#bfa181'}
                                        onChange={(e) => handleUpdate({
                                            giftAddressConfig: { ...config, customColor: e.target.value } as any
                                        })}
                                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <input
                                        type="text"
                                        value={(config as any).customColor || '#bfa181'}
                                        onChange={(e) => handleUpdate({
                                            giftAddressConfig: { ...config, customColor: e.target.value } as any
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
