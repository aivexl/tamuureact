import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    X, Search, Zap, Star, Sparkles, Image as ImageIcon, 
    ChevronRight, ChevronLeft, ShoppingBag, 
    Check, Wallet, Info, AlertCircle, TrendingUp
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useVendorProducts, useCreateAdCampaign } from '../../hooks/queries/useShop';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { shop } from '../../lib/api';

interface AdCampaignWizardProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    initialData?: any;
}

export const AD_POSITIONS = [
    { 
        id: 'PROMOTED_PRODUCT', 
        label: 'Promosi Produk', 
        description: 'Tampil di bagian paling atas daftar produk.',
        icon: Zap,
        color: '#007AFF'
    },
    { 
        id: 'SPECIAL_FOR_YOU_HOME', 
        label: 'Spesial Untuk Kamu', 
        description: 'Tampil di halaman depan (Home) aplikasi.',
        icon: Sparkles,
        color: '#5856D6'
    },
    {
        id: 'FEATURED_PRODUCT_HOME',
        label: 'Produk Featured (Home)',
        description: 'Tampil di bagian "Produk Featured" di halaman depan.',
        icon: Star,
        color: '#FFBF00'
    },
    { 
        id: 'FEATURED_PRODUCT_DETAIL', 
        label: 'Produk Unggulan', 
        description: 'Tampil di halaman detail produk lainnya.',
        icon: TrendingUp,
        color: '#FF2D55'
    },
    { 
        id: 'PRODUCT_LIST_BANNER', 
        label: 'Banner Visual', 
        description: 'Iklan gambar lebar di atas semua produk.',
        icon: ImageIcon,
        color: '#32ADE6'
    }
];


export const AdCampaignWizard: React.FC<AdCampaignWizardProps> = ({ isOpen, onClose, vendorId, initialData }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        target_type: 'PRODUCT',
        target_id: '',
        position: '',
        bid_amount: 500,
        daily_budget: 0,
        title: '',
        image_url: '',
        link_url: ''
    });

    React.useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                target_type: initialData.target_type || 'PRODUCT',
                target_id: initialData.target_id || '',
                position: initialData.position || '',
                bid_amount: initialData.bid_amount || 500,
                daily_budget: initialData.daily_budget || 0,
                title: initialData.title || '',
                image_url: initialData.image_url || '',
                link_url: initialData.link_url || ''
            });
            setStep(initialData.target_id ? 2 : 1);
        } else if (isOpen) {
            setFormData({
                target_type: 'PRODUCT',
                target_id: '',
                position: '',
                bid_amount: 500,
                daily_budget: 0,
                title: '',
                image_url: '',
                link_url: ''
            });
            setStep(1);
        }
    }, [initialData, isOpen]);

    const { data: productsRes, isLoading: isLoadingProducts } = useVendorProducts(vendorId);
    
    // API returns array directly now
    const products = useMemo(() => {
        if (!productsRes) return [];
        const all = Array.isArray(productsRes) ? productsRes : [];
        console.log(`[Wizard] Total products: ${all.length}, VendorID: ${vendorId}`);
        const published = all.filter((p: any) => p.status === 'PUBLISHED');
        console.log(`[Wizard] Published products: ${published.length}`);
        return published;
    }, [productsRes, vendorId]);

    const filteredProducts = products.filter((p: any) => 
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const createCampaign = useCreateAdCampaign();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (isDraft: boolean = false) => {
        setLoading(true);
        try {
            if (initialData?.id) {
                await shop.updateAdCampaign(initialData.id, {
                    ...formData,
                    status: isDraft ? 'DRAFT' : 'PENDING',
                    is_active: 0 
                });
                toast.success(isDraft ? 'Draft iklan berhasil diperbarui' : 'Iklan berhasil diperbarui dan dikirim untuk ditinjau');
            } else {
                await createCampaign.mutateAsync({
                    vendor_id: vendorId,
                    ...formData,
                    status: isDraft ? 'DRAFT' : 'PENDING'
                });
                toast.success(isDraft ? 'Draft iklan berhasil disimpan' : 'Iklan berhasil dikirim untuk ditinjau');
            }
            queryClient.invalidateQueries({ queryKey: ['ad_campaigns', vendorId] });
            onClose();
            setStep(1);
        } catch (err: any) {
            toast.error(err.message || 'Gagal memproses iklan');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <m.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-white/80 backdrop-blur-xl"
            />
            
            <m.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                className="relative w-full max-w-xl bg-white border border-slate-200 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            {step === 1 ? 'Pilih Produk' : step === 2 ? 'Pilih Posisi' : step === 3 ? 'Atur Biaya' : 'Konfirmasi'}
                        </h2>
                        <div className="flex gap-1 mt-1.5">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-4 bg-slate-900' : 'w-1 bg-slate-100'}`} />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <m.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        placeholder="Cari produk Anda..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {isLoadingProducts ? (
                                        <div className="py-12 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-slate-900 mx-auto mb-3"></div>
                                            <p className="text-xs text-slate-400">Memuat produk Anda...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {filteredProducts.map((p: any) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => { setFormData({ ...formData, target_id: p.id, title: p.nama_produk }); handleNext(); }}
                                                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${formData.target_id === p.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                        {p.images?.[0] ? <img src={p.images[0].image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag className="w-5 h-5" /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm font-bold truncate ${formData.target_id === p.id ? 'text-white' : 'text-slate-900'}`}>{p.nama_produk}</div>
                                                        <div className={`text-[10px] font-medium uppercase tracking-widest ${formData.target_id === p.id ? 'text-white/60' : 'text-slate-400'}`}>{p.kategori_produk || 'Umum'}</div>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${formData.target_id === p.id ? 'text-white/40' : 'text-slate-300'}`} />
                                                </button>
                                            ))}
                                            {products.length > 0 && filteredProducts.length === 0 && (
                                                <div className="py-12 text-center">
                                                    <p className="text-sm font-medium text-slate-500">Produk tidak ditemukan.</p>
                                                </div>
                                            )}
                                            {products.length === 0 && (
                                                <div className="py-12 text-center">
                                                    <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-sm font-medium text-slate-500">Anda belum memiliki produk yang terbit.</p>
                                                    <p className="text-xs text-slate-400 mt-1">Hanya produk berstatus "Published" yang bisa diiklankan.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </m.div>
                        )}

                        {step === 2 && (
                            <m.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                {AD_POSITIONS.map((pl) => (
                                    <button
                                        key={pl.id}
                                        onClick={() => { setFormData({ ...formData, position: pl.id }); handleNext(); }}
                                        className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center gap-5 group ${formData.position === pl.id ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.position === pl.id ? 'bg-white/10' : 'bg-slate-50'}`} style={{ color: formData.position === pl.id ? 'white' : pl.color }}>
                                            <pl.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold tracking-tight">{pl.label}</div>
                                            <p className={`text-xs mt-0.5 leading-relaxed ${formData.position === pl.id ? 'text-white/60' : 'text-slate-500'}`}>{pl.description}</p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${formData.position === pl.id ? 'text-white/40' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                            </m.div>
                        )}

                        {step === 3 && (
                            <m.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 text-center space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Bid per Klik</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-bold text-slate-400">Rp</span>
                                        <input 
                                            type="number" 
                                            value={formData.bid_amount}
                                            onChange={(e) => setFormData({ ...formData, bid_amount: parseInt(e.target.value) || 0 })}
                                            className="w-40 bg-transparent text-5xl font-bold tracking-tighter focus:outline-none text-slate-900 text-center"
                                            placeholder="500"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                                        Minimal bid Rp 100. Bid lebih tinggi meningkatkan peluang iklan tampil.
                                    </p>
                                </div>

                                {formData.position === 'PRODUCT_LIST_BANNER' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500">URL Gambar Iklan (Banner)</label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text" 
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none"
                                                placeholder="https://..."
                                            />
                                            <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </m.div>
                        )}

                        {step === 4 && (
                            <m.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-slate-400 font-medium">Produk</span>
                                        <span className="text-sm font-bold text-slate-900">{formData.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-slate-400 font-medium">Posisi Iklan</span>
                                        <span className="text-sm font-bold text-slate-900">{AD_POSITIONS.find(p => p.id === formData.position)?.label}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-xs text-slate-400 font-medium">Nilai Bid</span>
                                        <span className="text-sm font-bold text-slate-900">{formatCurrency(formData.bid_amount)} / klik</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-start gap-3">
                                    <Info className="w-4 h-4 text-white/60 mt-0.5" />
                                    <p className="text-[11px] leading-relaxed text-white/80">
                                        Setelah dikirim, admin akan meninjau iklan Anda. Anda perlu menambah saldo iklan setelah disetujui untuk mulai menayangkan iklan.
                                    </p>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 border-t border-slate-50 flex items-center justify-between bg-white">
                    {step > 1 ? (
                        <button 
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Kembali
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-3">
                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && !formData.target_id || step === 2 && !formData.position}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-30"
                            >
                                Lanjut
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                                >
                                    Simpan Draft
                                </button>
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {loading ? 'Memproses...' : 'Pasang Iklan'}
                                    {!loading && <Check className="w-4 h-4" />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </m.div>
        </div>
    );
};
