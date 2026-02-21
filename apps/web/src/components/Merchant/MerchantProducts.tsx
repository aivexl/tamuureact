import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
    useMerchantProfile,
    useMerchantProducts,
    useCreateMerchantProduct,
    useUpdateMerchantProduct,
    useDeleteMerchantProduct
} from '../../hooks/queries/useShop';
import api from '../../lib/api';

// Icons
const PlusCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const FilterIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const UploadCloudIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);


export const MerchantProducts: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData } = useMerchantProfile(user?.id);
    const merchantId = merchantData?.merchant?.id;

    const { data: products = [], isLoading } = useMerchantProducts(merchantId);

    // Mutations
    const { mutateAsync: createProduct, isPending: isCreating } = useCreateMerchantProduct();
    const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateMerchantProduct();
    const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteMerchantProduct();

    // Component State
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [namaProduk, setNamaProduk] = useState('');
    const [hargaEstimasi, setHargaEstimasi] = useState('');
    const [status, setStatus] = useState('DRAFT');
    const [deskripsi, setDeskripsi] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const [isProductUploading, setIsProductUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setEditingId(null);
        setNamaProduk('');
        setHargaEstimasi('');
        setStatus('DRAFT');
        setDeskripsi('');
        setImages([]);
    };

    const handleAddNew = () => {
        resetForm();
        setView('add');
    };

    const handleEdit = (prod: any) => {
        resetForm();
        setEditingId(prod.id);
        setNamaProduk(prod.nama_produk || '');
        setHargaEstimasi(prod.harga_estimasi || '');
        setStatus(prod.status || 'DRAFT');
        setDeskripsi(prod.deskripsi || '');
        setImages(prod.images ? prod.images.map((i: any) => i.image_url) : []);
        setView('edit');
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Archive this product forever?')) return;
        try {
            await deleteProduct(id.toString());
        } catch (e) {
            alert('Failed to delete asset');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsProductUploading(true);
            const res = await api.storage.upload(file, 'gallery');
            if (res && res.url) {
                setImages(prev => [...prev, res.url]);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Gagal mengunggah foto.');
        } finally {
            setIsProductUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async (forceStatus?: string) => {
        if (!merchantId) return;
        const finalStatus = forceStatus || status;

        const payload = {
            merchant_id: merchantId,
            nama_produk: namaProduk,
            deskripsi: deskripsi,
            harga_estimasi: hargaEstimasi,
            status: finalStatus,
            images: images
        };

        try {
            if (view === 'add') {
                await createProduct(payload);
            } else if (view === 'edit' && editingId) {
                await updateProduct({ id: editingId, data: payload });
            }
            setView('list');
            resetForm();
        } catch (error: any) {
            console.error('Save failed:', error);
            alert(error.message || 'Gagal menyimpan produk.');
        }
    };

    const isBusy = isCreating || isUpdating;

    const filteredProducts = products.filter((p: any) =>
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full relative bg-white text-slate-900">

            {/* Header Section */}
            <header className="px-6 md:px-10 py-10 border-b border-slate-100 bg-[#FBFBFB] flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-30 backdrop-blur-3xl bg-opacity-90">
                <div className="flex flex-col">
                    <m.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-black text-[#0A1128] tracking-tight">
                        Inventory <span className="text-[#FFBF00]">Ledger</span>
                    </m.h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Asset Registry Console</p>
                </div>

                {view === 'list' ? (
                    <m.button
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-3 bg-[#FFBF00] hover:bg-[#FFD700] text-[#0A1128] px-8 py-3.5 rounded-2xl transition-all shadow-2xl active:scale-95 group font-black uppercase text-[10px] tracking-widest whitespace-nowrap"
                    >
                        <PlusCircleIcon className="w-5 h-5 shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                        New Entry
                    </m.button>
                ) : (
                    <m.button
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        onClick={() => { setView('list'); resetForm(); }}
                        className="flex items-center justify-center gap-3 bg-[#0A1128] border border-white/10 text-white px-8 py-3.5 rounded-2xl transition-all shadow-2xl active:scale-95 group font-black uppercase text-[10px] tracking-widest whitespace-nowrap"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-[#FFBF00]" />
                        Registry List
                    </m.button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto w-full relative">
                <div className="p-6 md:p-10 pb-48 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'list' && (
                            <m.section
                                key="list"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                {/* Toolbars */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-black text-[#0A1128] tracking-tight">
                                            Current Assets
                                        </h3>
                                        {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#FFBF00]"></div>}
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-80">
                                            <SearchIcon className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Locate entries..."
                                                className="w-full pl-11 pr-5 py-3.5 bg-[#FBFBFB] border border-slate-200 rounded-2xl text-[11px] font-bold text-[#0A1128] placeholder:text-slate-400 focus:outline-none focus:border-[#FFBF00]/30 focus:ring-1 focus:ring-[#FFBF00]/30 transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        <button className="p-3.5 bg-[#FBFBFB] border border-slate-200 rounded-2xl text-slate-400 hover:text-[#0A1128] transition-all flex-shrink-0 active:scale-95">
                                            <FilterIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Registry Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[40px] bg-[#FBFBFB]">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">No assets registered in the vault.</p>
                                        </div>
                                    ) : filteredProducts.map((prod: any, i: number) => (
                                        <m.div
                                            key={prod.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-all relative"
                                        >
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                    style={prod.images?.length > 0 ? { backgroundImage: `url('${prod.images[0].image_url}')` } : { backgroundColor: '#FBFBFB' }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

                                                <div className="absolute top-4 right-4">
                                                    {prod.status === 'PUBLISHED' ? (
                                                        <span className="px-3 py-1 rounded-full bg-[#FFBF00] text-[#0A1128] text-[9px] font-black uppercase tracking-widest border border-[#FFBF00] shadow-[0_4px_10px_rgba(255,191,0,0.3)]">
                                                            Live
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 backdrop-blur-md">
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <button onClick={() => handleEdit(prod)} className="p-4 bg-white/10 rounded-2xl text-white hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all transform hover:scale-110">
                                                        <EditIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(prod.id)} className="p-4 bg-white/10 rounded-2xl text-white hover:bg-red-500 transition-all transform hover:scale-110">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-8 space-y-4">
                                                <h4 className="text-lg font-black tracking-tight text-white group-hover:text-[#FFBF00] transition-colors line-clamp-1 italic">{prod.nama_produk}</h4>
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black text-[#FFBF00] uppercase tracking-widest mb-1 opacity-60">Price Guide</p>
                                                        <p className="text-xl font-black text-white">{prod.harga_estimasi || '-'}</p>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ID: {prod.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>
                            </m.section>
                        )}

                        {(view === 'add' || view === 'edit') && (
                            <m.section
                                key="form"
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="max-w-5xl mx-auto"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Left Col */}
                                    <div className="lg:col-span-7 space-y-10">
                                        {/* Basic Info Card */}
                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00]/5 rounded-full blur-3xl" />
                                            <h4 className="text-lg font-black text-[#0A1128]">Asset <span className="text-[#FFBF00]">Blueprint</span></h4>

                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Asset Designation</label>
                                                    <input
                                                        type="text"
                                                        value={namaProduk}
                                                        onChange={e => setNamaProduk(e.target.value)}
                                                        placeholder="e.g. Imperial Venue Hall"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] placeholder:text-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Market Position (Pricing)</label>
                                                    <input
                                                        type="text"
                                                        value={hargaEstimasi}
                                                        onChange={e => setHargaEstimasi(e.target.value)}
                                                        placeholder="IDR 15,000,000++"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-[#0A1128] placeholder:text-slate-400 focus:ring-1 focus:ring-[#FFBF00]/40 focus:border-[#FFBF00]/40 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Card */}
                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 space-y-8 shadow-sm relative">
                                            <h4 className="text-lg font-black text-[#0A1128]">Registry <span className="text-[#FFBF00]">Brief</span></h4>
                                            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white">
                                                <textarea
                                                    value={deskripsi}
                                                    onChange={e => setDeskripsi(e.target.value)}
                                                    className="w-full bg-transparent border-none p-6 text-sm text-slate-600 font-medium focus:ring-0 placeholder:text-slate-400 resize-none min-h-[250px] focus:outline-none"
                                                    placeholder="Elaborate on the asset's specifications, history, and premium value..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Col */}
                                    <div className="lg:col-span-5 space-y-10">
                                        <div className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 shadow-sm flex flex-col min-h-[500px] relative">
                                            <div className="flex items-center justify-between mb-8">
                                                <h4 className="text-lg font-black text-[#0A1128]">Gallery <span className="text-[#FFBF00]">Curator</span></h4>
                                                <span className="text-[10px] text-[#FFBF00] font-black tracking-widest">{images.length} / 5</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                {images.map((img, idx) => (
                                                    <div key={idx} className="aspect-square bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group shadow-lg">
                                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }}></div>
                                                        <div className="absolute inset-0 bg-[#0A1128]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleRemoveImage(idx)}
                                                                className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-2xl"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {images.length < 5 && (
                                                    <div
                                                        onClick={() => !isProductUploading && fileInputRef.current?.click()}
                                                        className="aspect-square border-2 border-dashed border-white/10 hover:border-[#FFBF00]/40 rounded-2xl bg-white/[0.01] flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer group relative overflow-hidden shadow-inner"
                                                    >
                                                        <div className="absolute inset-0 bg-[#FFBF00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        {isProductUploading ? (
                                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFBF00]"></div>
                                                        ) : (
                                                            <>
                                                                <div className="h-12 w-12 rounded-2xl bg-[#0A1128] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#FFBF00]/20 border border-white/5 group-hover:border-[#FFBF00]/50 shadow-2xl">
                                                                    <UploadCloudIcon className="w-6 h-6 text-[#FFBF00] opacity-60 group-hover:opacity-100" />
                                                                </div>
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Import Media</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />

                                            <div className="mt-auto p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed text-center italic">
                                                    "A high-fidelity visual narrative drives 3x more intent. Ensure your media profile is impeccable."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </m.section>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* FIXED FOOTER ACTIONS */}
            <AnimatePresence>
                {(view === 'add' || view === 'edit') && (
                    <m.footer
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 lg:left-80 right-0 h-24 bg-[#050505]/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-6 md:px-12 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="hidden md:flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-[#FFBF00]' : 'bg-slate-700'}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                                Registry Status: <span className={status === 'PUBLISHED' ? 'text-[#FFBF00]' : 'text-slate-400'}>{status}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => { setView('list'); resetForm(); }}
                                disabled={isBusy}
                                className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl border border-white/10 bg-[#0A1128] text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Abort
                            </button>
                            {status !== 'DRAFT' && (
                                <button
                                    onClick={() => handleSave('DRAFT')}
                                    disabled={isBusy || !namaProduk}
                                    className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                >
                                    To Draft
                                </button>
                            )}
                            <button
                                onClick={() => handleSave('PUBLISHED')}
                                disabled={isBusy || !namaProduk}
                                className="flex-1 md:flex-none px-12 py-3.5 rounded-2xl bg-[#FFBF00] hover:bg-[#FFD700] text-[#0A1128] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-[#FFBF00]/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isBusy ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#0A1128]"></div> : null}
                                {isBusy ? 'Syncing...' : 'Authorize & Push'}
                            </button>
                        </div>
                    </m.footer>
                )}
            </AnimatePresence>
        </div>
    );
};
