import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Landmark, Smartphone, MapPin, Save, Check, AlertCircle, Plus, X } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { users } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { SUPPORTED_BANKS } from '@/lib/banks';
import { BankCard } from '@/components/Elements/BankCard';

interface GiftPanelProps {
    onClose: () => void;
}

export const GiftPanel: React.FC<GiftPanelProps> = ({ onClose }) => {
    const { user, showModal } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Bank 1
    const [bank1Name, setBank1Name] = useState('');
    const [bank1Number, setBank1Number] = useState('');
    const [bank1Holder, setBank1Holder] = useState('');

    // Bank 2
    const [bank2Name, setBank2Name] = useState('');
    const [bank2Number, setBank2Number] = useState('');
    const [bank2Holder, setBank2Holder] = useState('');
    const [showBank2, setShowBank2] = useState(false);

    // E-Money
    const [emoneyType, setEmoneyType] = useState('');
    const [emoneyNumber, setEmoneyNumber] = useState('');

    // Address
    const [giftAddress, setGiftAddress] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.email) return;
            try {
                setLoading(true);
                const data = await users.getMe(user.email);
                if (data) {
                    setBank1Name(data.bank1Name || '');
                    setBank1Number(data.bank1Number || '');
                    setBank1Holder(data.bank1Holder || '');

                    if (data.bank2Name || data.bank2Number) {
                        setBank2Name(data.bank2Name || '');
                        setBank2Number(data.bank2Number || '');
                        setBank2Holder(data.bank2Holder || '');
                        setShowBank2(true);
                    }

                    setEmoneyType(data.emoneyType || '');
                    setEmoneyNumber(data.emoneyNumber || '');
                    setGiftAddress(data.giftAddress || '');
                }
            } catch (error) {
                console.error('Failed to load profile for gift info:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user?.email]);

    const handleSave = async () => {
        if (!user?.id) return;

        try {
            setSaving(true);
            await users.updateProfile({
                id: user.id,
                bank1Name,
                bank1Number,
                bank1Holder,
                bank2Name: showBank2 ? bank2Name : '',
                bank2Number: showBank2 ? bank2Number : '',
                bank2Holder: showBank2 ? bank2Holder : '',
                emoneyType,
                emoneyNumber,
                giftAddress
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Failed to update gift info:', error);
            showModal({
                title: 'Gagal Menyimpan',
                message: error.message || 'Terjadi kesalahan saat menyimpan data kado. Silakan coba lagi.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Memuat Data Kado..." color="#10b981" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            {/* Real-time Preview */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-2 self-start">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Preview Kartu Digital</h4>
                </div>
                <div className="w-full max-w-[360px] transform hover:scale-[1.02] transition-transform duration-500">
                    <BankCard
                        bankName={bank1Name}
                        accountNumber={bank1Number}
                        accountHolder={bank1Holder}
                        isPreview={true}
                    />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    Tampilan kartu akan menyesuaikan dengan brand bank yang dipilih
                </p>
            </div>

            <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6">
                {/* Bank 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Landmark className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Rekening Utama</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Bank</label>
                            <div className="relative">
                                <select
                                    value={bank1Name}
                                    onChange={e => setBank1Name(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Pilih Bank...</option>
                                    {SUPPORTED_BANKS.filter(b => b.id !== 'custom').map(bank => (
                                        <option key={bank.id} value={bank.name}>{bank.name}</option>
                                    ))}
                                    <option value="Custom">Lainnya (Custom)</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                    <Plus className="w-4 h-4 rotate-45" />
                                </div>
                            </div>
                            {bank1Name === 'Custom' && (
                                <input
                                    type="text"
                                    placeholder="Masukkan nama bank manual"
                                    className="w-full px-6 py-3 mt-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl outline-none font-bold text-slate-700 text-sm"
                                    onChange={e => setBank1Name(e.target.value)}
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nomor Rekening</label>
                            <input value={bank1Number} onChange={e => setBank1Number(e.target.value)} type="text" placeholder="Masukkan nomor" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Atas Nama</label>
                            <input value={bank1Holder} onChange={e => setBank1Holder(e.target.value)} type="text" placeholder="Nama pemilik rekening" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* Bank 2 Toggle */}
                {!showBank2 ? (
                    <button onClick={() => setShowBank2(true)} className="w-full py-4 border-2 border-dashed border-emerald-100 rounded-2xl text-emerald-600 font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Rekening Kedua
                    </button>
                ) : (
                    <div className="space-y-4 pt-4 border-t border-slate-200/50 relative">
                        <button onClick={() => setShowBank2(false)} className="absolute top-4 right-0 text-slate-300 hover:text-rose-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 px-2">
                            <Landmark className="w-5 h-5 text-teal-600" />
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Rekening Kedua</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nama Bank</label>
                                <div className="relative">
                                    <select
                                        value={bank2Name}
                                        onChange={e => setBank2Name(e.target.value)}
                                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">Pilih Bank...</option>
                                        {SUPPORTED_BANKS.filter(b => b.id !== 'custom').map(bank => (
                                            <option key={bank.id} value={bank.name}>{bank.name}</option>
                                        ))}
                                        <option value="Custom">Lainnya (Custom)</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </div>
                                </div>
                                {bank2Name === 'Custom' && (
                                    <input
                                        type="text"
                                        placeholder="Masukkan nama bank manual"
                                        className="w-full px-6 py-3 mt-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl outline-none font-bold text-slate-700 text-sm"
                                        onChange={e => setBank2Name(e.target.value)}
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nomor Rekening</label>
                                <input value={bank2Number} onChange={e => setBank2Number(e.target.value)} type="text" placeholder="Masukkan nomor" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Atas Nama</label>
                                <input value={bank2Holder} onChange={e => setBank2Holder(e.target.value)} type="text" placeholder="Nama pemilik rekening" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* E-Money & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">E-Wallet</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Penyedia E-Wallet</label>
                            <div className="relative">
                                <select
                                    value={emoneyType}
                                    onChange={e => setEmoneyType(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Pilih E-Wallet...</option>
                                    {SUPPORTED_BANKS.filter(b => ['dana', 'ovo', 'gopay', 'shopeepay', 'linkaja'].includes(b.id)).map(bank => (
                                        <option key={bank.id} value={bank.name}>{bank.name}</option>
                                    ))}
                                    <option value="Custom">Lainnya</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                    <Plus className="w-4 h-4 rotate-45" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nomor HP</label>
                            <input value={emoneyNumber} onChange={e => setEmoneyNumber(e.target.value)} type="text" placeholder="08xxxxxxxxxx" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-rose-600" />
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Alamat Kado Fisik</h4>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Alamat Lengkap</label>
                        <textarea value={giftAddress} onChange={e => setGiftAddress(e.target.value)} rows={4} placeholder="Masukkan alamat untuk pengiriman kado..." className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-slate-700 resize-none" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/20'}`}
                >
                    {saving ? (
                        <PremiumLoader variant="inline" size="sm" color="white" />
                    ) : success ? (
                        <>
                            <Check className="w-5 h-5" />
                            Tersimpan
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
