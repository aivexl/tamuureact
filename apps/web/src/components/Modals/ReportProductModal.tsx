import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useSubmitReport } from '../../hooks/queries/useShop';
import { useStore } from '../../store/useStore';

interface ReportProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
}

const REPORT_CATEGORIES = [
    'Penipuan',
    'Barang/Jasa Ilegal',
    'Konten Tidak Pantas',
    'Pelanggaran Hak Cipta',
    'Lainnya'
];

export const ReportProductModal: React.FC<ReportProductModalProps> = ({ isOpen, onClose, productId, productName }) => {
    const user = useStore(s => s.user);
    const [category, setCategory] = useState('');
    const [reason, setReason] = useState('');
    const reportMutation = useSubmitReport();

    const handleSubmit = async () => {
        if (!category) return;
        
        await reportMutation.mutateAsync({
            product_id: productId,
            reporter_id: user?.id,
            category,
            reason
        });
        
        onClose();
        setCategory('');
        setReason('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative"
                    >
                        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#0A1128] uppercase tracking-tight">Laporkan Produk</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">{productName}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Laporan</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {REPORT_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`w-full px-6 py-4 rounded-xl text-left text-sm font-bold transition-all flex items-center justify-between ${category === cat ? 'bg-[#FFBF00] text-[#0A1128]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {cat}
                                            {category === cat && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detail Tambahan (Opsional)</label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Berikan alasan spesifik laporan Anda..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-[#FFBF00]/20 focus:bg-white outline-none transition-all resize-none h-32"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!category || reportMutation.isPending}
                                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                                >
                                    {reportMutation.isPending ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </div>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
