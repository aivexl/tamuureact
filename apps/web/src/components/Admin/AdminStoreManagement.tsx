import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Search, Store, UserCheck, ShieldOff, Image as ImageIcon, 
    Plus, Trash2, Link as LinkIcon, UploadCloud, CheckCircle2, 
    AlertTriangle, ShieldAlert, Ban, Power, Trash, Coins, 
    Wallet, PlusCircle, MinusCircle, DollarSign, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { 
    useAdminShopCarousel, useAdminAddCarousel, useAdminDeleteCarousel, 
    useAdminVendors, useAdminUpdateVendor, useAdminUpdateVendorBalance 
} from '../../hooks/queries/useShop';
import { useStore } from '../../store/useStore';
import { storage, admin } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { ConfirmationModal } from '../Modals/ConfirmationModal';
import { Modal } from '../ui/Modal';

export const AdminStoreManagement: React.FC = () => {
    const { token } = useStore();
    const [activeTab, setActiveTab] = useState<'vendors' | 'carousel'>('vendors');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Balance Adjustment State
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [selectedVendorForBalance, setSelectedVendorForBalance] = useState<any>(null);
    const [balanceAmount, setBalanceAmount] = useState<string>('');
    const [balanceAction, setBalanceAction] = useState<'add' | 'subtract' | 'set'>('add');

    // Delete Vendor State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<any>(null);
    const [isDeletingVendor, setIsDeletingVendor] = useState(false);

    // Real Data Hooks
    const { data: vendors = [], isLoading: isLoadingVendors, refetch: refetchVendors } = useAdminVendors();
    const updateVendorMutation = useAdminUpdateVendor();
    const updateBalanceMutation = useAdminUpdateVendorBalance();

    // Carousel State
    const { data: slides = [], isLoading: isLoadingCarousel } = useAdminShopCarousel(token || '');
    const addCarouselMutation = useAdminAddCarousel();
    const deleteCarouselMutation = useAdminDeleteCarousel();
    const [isAddingSlide, setIsAddingSlide] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newSlide, setNewSlide] = useState({ image_url: '', link_url: '', order_index: 0 });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await storage.upload(file, 'gallery');
            if (result.url) {
                setNewSlide(prev => ({ ...prev, image_url: result.url }));
                toast.success('Image uploaded successfully');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const filteredVendors = Array.isArray(vendors) ? vendors.filter(vendor =>
        (vendor.nama_toko || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const handleVerifyVendor = (id: string, name: string, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        updateVendorMutation.mutate({ 
            id, 
            data: { is_verified: newStatus } 
        }, {
            onSuccess: () => {
                toast.success(`${name} ${newStatus === 1 ? 'Verified' : 'Unverified'} successfully`);
                refetchVendors();
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to update verification status');
            }
        });
    };

    const handlePromoteVendor = (id: string, name: string, field: string, currentValue: number) => {
        const newValue = currentValue === 1 ? 0 : 1;
        updateVendorMutation.mutate({ 
            id, 
            data: { [field]: newValue } 
        }, {
            onSuccess: () => {
                toast.success(`${name} status updated successfully`);
                refetchVendors();
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to update status');
            }
        });
    };

    const handleDeleteVendor = (id: string, name: string) => {
        setVendorToDelete({ id, name });
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteVendor = async () => {
        if (!vendorToDelete) return;
        setIsDeletingVendor(true);
        try {
            const res = await admin.deleteVendor(vendorToDelete.id, token || undefined);
            if (res.success) {
                toast.success(`Vendor "${vendorToDelete.name}" deleted successfully.`);
                setIsDeleteDialogOpen(false);
                setVendorToDelete(null);
                refetchVendors();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete vendor');
        } finally {
            setIsDeletingVendor(false);
        }
    };

    const handleAddSlide = async () => {
        if (!newSlide.image_url) return toast.error('Image URL is required');
        
        addCarouselMutation.mutate({ 
            token: token || '', 
            payload: newSlide 
        }, {
            onSuccess: () => {
                toast.success('Slide added successfully');
                setIsAddingSlide(false);
                setNewSlide({ image_url: '', link_url: '', order_index: 0 });
            }
        });
    };

    const handleUpdateBalance = () => {
        // Strip dots before parsing
        const amount = parseInt(balanceAmount.replace(/\./g, ''));
        if (isNaN(amount) || amount < 0) {
            return toast.error('Nominal tidak valid');
        }

        if (!selectedVendorForBalance) return;

        updateBalanceMutation.mutate({
            id: selectedVendorForBalance.id,
            payload: { amount, action: balanceAction }
        }, {
            onSuccess: () => {
                setIsBalanceModalOpen(false);
                setBalanceAmount('');
                setSelectedVendorForBalance(null);
            }
        });
    };

    const handleBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Only digits
        if (!val) {
            setBalanceAmount('');
            return;
        }
        // Format with dots
        const formatted = Number(val).toLocaleString('id-ID');
        setBalanceAmount(formatted);
    };

    const handleDeleteSlide = (id: string) => {
        if (confirm('Are you sure you want to delete this slide?')) {
            deleteCarouselMutation.mutate({ token: token || '', id });
        }
    };

    const getStatusBadge = (vendor: any) => {
        if (vendor.is_verified === 1) {
            return <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[9px] font-black uppercase tracking-widest border border-teal-500/20 flex items-center gap-1.5 w-fit"><CheckCircle2 className="w-2.5 h-2.5" /> Verified</span>;
        }
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1.5 w-fit"><AlertTriangle className="w-2.5 h-2.5" /> Unverified</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
                        <Store className="w-8 h-8 text-teal-500" />
                        Tamuu Shop Admin
                    </h1>
                    <p className="text-slate-400 font-medium">Enterprise governance and shop storefront controls.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'vendors' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Vendors
                    </button>
                    <button
                        onClick={() => setActiveTab('carousel')}
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'carousel' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Carousel
                    </button>
                </div>
            </div>

            {activeTab === 'vendors' ? (
                <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Vendor Toolbar */}
                    <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between bg-[#1A1A1A]">
                        <div className="relative w-full md:w-[450px]">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/20">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search vendors by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:ring-0 focus:bg-white/[0.08] transition-all duration-500 placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Vendor Table */}
                    <div className="overflow-x-auto">
                        {isLoadingVendors ? (
                            <div className="py-32 flex flex-col items-center justify-center gap-4">
                                <PremiumLoader variant="inline" color="#14B8A6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500/50">Synchronizing Ledger...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-black/40">
                                        <th className="px-8 py-6">Vendor Profile</th>
                                        <th className="px-8 py-6">Identity</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6">Ad Balance</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredVendors.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic font-medium">No vendors found matching your criteria.</td>
                                        </tr>
                                    ) : filteredVendors.map((vendor) => (
                                        <tr key={vendor.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                        {vendor.logo_url ? (
                                                            <img src={vendor.logo_url} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <Store className="w-5 h-5 text-slate-700" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white text-base tracking-tight italic">{vendor.nama_toko}</div>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Slug: {vendor.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-black text-slate-300 tracking-tight">{vendor.email || 'N/A'}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 italic">ID: {vendor.id.substring(0, 8)}...</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    {getStatusBadge(vendor)}
                                                    <div className="flex gap-1.5">
                                                        {vendor.is_sponsored === 1 && (
                                                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">Sponsored</span>
                                                        )}
                                                        {vendor.is_landing_featured === 1 && (
                                                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">Featured</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-teal-400 font-black">
                                                        <Coins className="w-3.5 h-3.5" />
                                                        <span>{formatCurrency(vendor.ad_balance || 0)}</span>
                                                    </div>
                                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Available Credits</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* BALANCE ADJUSTMENT */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVendorForBalance(vendor);
                                                            setIsBalanceModalOpen(true);
                                                            setBalanceAction('add');
                                                        }}
                                                        className="p-2.5 rounded-xl bg-white/5 text-teal-500 border border-white/5 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all"
                                                        title="Adjust Ad Balance"
                                                    >
                                                        <Wallet className="w-4 h-4" />
                                                    </button>

                                                    {/* VERIFY / UNVERIFY */}
                                                    <button
                                                        onClick={() => handleVerifyVendor(vendor.id, vendor.nama_toko, vendor.is_verified)}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                            vendor.is_verified === 1 
                                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' 
                                                            : 'bg-teal-500 text-white border-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20'
                                                        }`}
                                                        title={vendor.is_verified === 1 ? 'Suspend / Unverify Vendor' : 'Verify Vendor'}
                                                    >
                                                        {vendor.is_verified === 1 ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                                        {vendor.is_verified === 1 ? 'Suspend' : 'Verify'}
                                                    </button>

                                                    {/* SPONSOR TOGGLE */}
                                                    <button
                                                        onClick={() => handlePromoteVendor(vendor.id, vendor.nama_toko, 'is_sponsored', vendor.is_sponsored)}
                                                        className={`p-2.5 rounded-xl border transition-all ${
                                                            vendor.is_sponsored === 1
                                                            ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                                            : 'bg-white/5 text-slate-500 border-white/5 hover:border-purple-500/50 hover:text-purple-400'
                                                        }`}
                                                        title="Toggle Sponsored Status"
                                                    >
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </button>

                                                    {/* FEATURE TOGGLE */}
                                                    <button
                                                        onClick={() => handlePromoteVendor(vendor.id, vendor.nama_toko, 'is_landing_featured', vendor.is_landing_featured)}
                                                        className={`p-2.5 rounded-xl border transition-all ${
                                                            vendor.is_landing_featured === 1
                                                            ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                                            : 'bg-white/5 text-slate-500 border-white/5 hover:border-blue-500/50 hover:text-blue-400'
                                                        }`}
                                                        title="Toggle Landing Featured"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>

                                                    {/* DELETE BUTTON */}
                                                    <button
                                                        onClick={() => handleDeleteVendor(vendor.id, vendor.nama_toko)}
                                                        className="p-2.5 rounded-xl bg-white/5 text-slate-500 border border-white/5 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all group/del"
                                                        title="Delete Vendor Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Carousel Content remains same */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 italic">
                            <ImageIcon className="w-5 h-5 text-teal-500" />
                            Shop Carousel Slides
                        </h2>
                        <button 
                            onClick={() => setIsAddingSlide(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Slide
                        </button>
                    </div>

                    <AnimatePresence>
                        {isAddingSlide && (
                            <m.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-[#1A1A1A] border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Image URL</label>
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="text-[9px] font-black text-teal-500 hover:text-teal-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                            >
                                                {isUploading ? (
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-2 h-2 border border-teal-500 border-t-transparent rounded-full animate-spin" />
                                                        Uploading...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <UploadCloud className="w-3 h-3" />
                                                        Upload Manual
                                                    </span>
                                                )}
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mb-1 ml-1">Ideal: 1400x600px (21:9) | Max: 2MB</p>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input 
                                                type="text"
                                                placeholder="https://..."
                                                value={newSlide.image_url}
                                                onChange={(e) => setNewSlide({...newSlide, image_url: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Link URL (Optional)</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input 
                                                type="text"
                                                placeholder="https://..."
                                                value={newSlide.link_url}
                                                onChange={(e) => setNewSlide({...newSlide, link_url: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button onClick={() => setIsAddingSlide(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white" disabled={isUploading}>Cancel</button>
                                    <button 
                                        onClick={handleAddSlide} 
                                        disabled={isUploading}
                                        className="px-10 py-4 bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? 'Uploading Image...' : 'Save Slide'}
                                    </button>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoadingCarousel ? (
                            <div className="col-span-full py-20 text-center"><PremiumLoader variant="inline" color="#14B8A6" /></div>
                        ) : slides.length > 0 ? (
                            slides.map((slide: any) => (
                                <m.div 
                                    key={slide.id}
                                    layout
                                    className="group relative bg-[#141414] border border-white/5 rounded-[2rem] overflow-hidden hover:border-teal-500/30 transition-all"
                                >
                                    <div className="aspect-[21/9] bg-black">
                                        <img src={slide.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Slide" />
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex-1 truncate mr-4">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Link</p>
                                            <p className="text-xs text-white truncate italic">{slide.link_url || 'No link set'}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteSlide(slide.id)}
                                            className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </m.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-500 font-medium">No carousel slides active.</div>
                        )}
                    </div>
                </div>
            )}

            {/* BALANCE ADJUSTMENT MODAL */}
            <Modal
                isOpen={isBalanceModalOpen}
                onClose={() => {
                    if (!updateBalanceMutation.isPending) {
                        setIsBalanceModalOpen(false);
                        setSelectedVendorForBalance(null);
                        setBalanceAmount('');
                    }
                }}
                title={`Sesuaikan Saldo Ads: ${selectedVendorForBalance?.nama_toko}`}
            >
                <div className="space-y-8 bg-[#141414] -m-8 p-8">
                    <div className="p-6 bg-teal-500/5 border border-teal-500/10 rounded-3xl flex items-center justify-between shadow-inner">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Saldo Saat Ini</p>
                            <p className="text-3xl font-black text-teal-400 italic tracking-tight">{formatCurrency(selectedVendorForBalance?.ad_balance || 0)}</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-teal-500" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setBalanceAction('add')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    balanceAction === 'add' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <PlusCircle className="w-4 h-4" />
                                Tambah
                            </button>
                            <button
                                onClick={() => setBalanceAction('subtract')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    balanceAction === 'subtract' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <MinusCircle className="w-4 h-4" />
                                Kurangi
                            </button>
                            <button
                                onClick={() => setBalanceAction('set')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    balanceAction === 'set' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Atur Total
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nominal Saldo (IDR)</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-teal-500/50 tracking-tighter italic text-lg">Rp</div>
                                <input 
                                    type="text"
                                    placeholder="0"
                                    value={balanceAmount}
                                    onChange={handleBalanceInputChange}
                                    className="w-full bg-black/40 border border-white/5 group-hover:border-white/10 focus:border-teal-500/50 rounded-2xl pl-14 pr-6 py-5 text-xl font-black text-white focus:ring-0 placeholder:text-white/5 transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-start gap-2 ml-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-teal-500/40 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                    {balanceAction === 'add' && "Saldo akan ditambahkan ke jumlah yang sudah ada. Gunakan nominal positif."}
                                    {balanceAction === 'subtract' && "Saldo akan dikurangi dari jumlah yang sudah ada. Sistem akan memastikan saldo tidak kurang dari Rp 0."}
                                    {balanceAction === 'set' && "Saldo vendor akan diganti sepenuhnya dengan nilai ini secara permanen."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => setIsBalanceModalOpen(false)}
                            className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                            disabled={updateBalanceMutation.isPending}
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleUpdateBalance}
                            disabled={updateBalanceMutation.isPending || !balanceAmount}
                            className="flex-[2] flex items-center justify-center gap-3 px-10 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {updateBalanceMutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* DELETE VENDOR MODAL */}
            <ConfirmationModal
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    if (!isDeletingVendor) {
                        setIsDeleteDialogOpen(false);
                        setVendorToDelete(null);
                    }
                }}
                onConfirm={confirmDeleteVendor}
                title="Hapus Vendor Permanen?"
                message={`Apakah Anda yakin ingin menghapus vendor "${vendorToDelete?.name}" secara permanen? Seluruh produk dan data terkait akan ikut terhapus.`}
                confirmText="Ya, Hapus Permanen"
                cancelText="Batal"
                type="danger"
                isLoading={isDeletingVendor}
            />
        </div>
    );
};
