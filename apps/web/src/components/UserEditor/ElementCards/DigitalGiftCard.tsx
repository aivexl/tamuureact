import React, { useState } from 'react';
import { CreditCard, User, Landmark, Type, ChevronDown, Palette, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { SUPPORTED_BANKS } from '@/lib/banks';
import { DigitalGiftConfig } from '@/store/layersSlice';

export const DigitalGiftCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config: DigitalGiftConfig = element.digitalGiftConfig || ({
        title: 'Kirim Hadiah',
        description: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        buttonText: 'Salin Rekening',
        theme: 'custom',
        customColor: '#bfa181'
    } as any);

    // FORTRESS: Local state buffering to fix the "jumping cursor" bug
    const [localDescription, setLocalDescription] = React.useState(config.description || '');
    const [localAccountNumber, setLocalAccountNumber] = React.useState(config.accountNumber || '');
    const [localAccountHolder, setLocalAccountHolder] = React.useState(config.accountHolder || '');
    const [localTitle, setLocalTitle] = React.useState(config.title || '');

    // Sync local state when external data changes
    React.useEffect(() => {
        if (config.description !== localDescription) setLocalDescription(config.description || '');
    }, [config.description]);

    React.useEffect(() => {
        if (config.accountNumber !== localAccountNumber) setLocalAccountNumber(config.accountNumber || '');
    }, [config.accountNumber]);

    React.useEffect(() => {
        if (config.accountHolder !== localAccountHolder) setLocalAccountHolder(config.accountHolder || '');
    }, [config.accountHolder]);

    React.useEffect(() => {
        if (config.title !== localTitle) setLocalTitle(config.title || '');
    }, [config.title]);

    const isBankKnown = SUPPORTED_BANKS.find(b => b.name === config.bankName);
    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    {/* Title / Header */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Label Tombol / Judul
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <Type className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={localTitle}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalTitle(val);
                                    handleUpdate({
                                        digitalGiftConfig: { ...config, title: val }
                                    });
                                }}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="Contoh: Kirim Hadiah"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Deskripsi Pesan
                        </label>
                        <textarea
                            value={localDescription}
                            onChange={(e) => {
                                const val = e.target.value;
                                setLocalDescription(val);
                                handleUpdate({
                                    digitalGiftConfig: { ...config, description: val }
                                });
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                            placeholder="Contoh: Doa restu Anda adalah hadiah terindah..."
                            rows={2}
                        />
                    </div>

                    {/* Bank Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Pilih Bank / E-Wallet
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <Landmark className="w-4 h-4" />
                            </div>
                            <select
                                value={isBankKnown ? config.bankName : 'other'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'other') {
                                        handleUpdate({ digitalGiftConfig: { ...config, bankName: 'Bank Lainnya' } });
                                    } else {
                                        handleUpdate({ digitalGiftConfig: { ...config, bankName: val } });
                                    }
                                }}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all appearance-none"
                            >
                                <option value="">Pilih Bank...</option>
                                {SUPPORTED_BANKS.map(bank => (
                                    <option key={bank.id} value={bank.name}>{bank.name}</option>
                                ))}
                                <option value="other">Bank Lainnya / Kustom</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Bank Name if needed */}
                    {(!isBankKnown || config.bankName === 'Bank Lainnya') && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Nama Bank Kustom
                            </label>
                            <input
                                type="text"
                                value={config.bankName || ''}
                                onChange={(e) => handleUpdate({
                                    digitalGiftConfig: { ...config, bankName: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="Masukkan Nama Bank"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Nomor Rekening
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={localAccountNumber}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLocalAccountNumber(val);
                                        handleUpdate({
                                            digitalGiftConfig: { ...config, accountNumber: val }
                                        });
                                    }}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                    placeholder="0000000000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Atas Nama
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={localAccountHolder}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLocalAccountHolder(val);
                                        handleUpdate({
                                            digitalGiftConfig: { ...config, accountHolder: val }
                                        });
                                    }}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                    placeholder="Nama Pemilik"
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Hadiah Digital Dikunci</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">{config.bankName || 'Belum diatur'}</p>
                        <p className="text-[10px] text-slate-500">{config.accountNumber || 'Belum ada nomor rekening'}</p>
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Kustom</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.customColor || '#bfa181'}
                                        onChange={(e) => handleUpdate({
                                            digitalGiftConfig: { ...config, customColor: e.target.value }
                                        })}
                                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <input
                                        type="text"
                                        value={config.customColor || '#bfa181'}
                                        onChange={(e) => handleUpdate({
                                            digitalGiftConfig: { ...config, customColor: e.target.value }
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
