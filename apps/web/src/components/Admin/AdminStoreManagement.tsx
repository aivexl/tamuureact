import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, ShieldAlert, Store, UserX, UserCheck, ShieldOff, Image as ImageIcon, Plus, Trash2, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { useAdminShopCarousel, useAdminAddCarousel, useAdminDeleteCarousel } from '../../hooks/queries/useShop';
import { useStore } from '../../store/useStore';

// Mock Data for Merchants
const MOCK_MERCHANTS = [
    {
        id: '1',
        name: 'Nusantara Wedding Organizer',
        owner: 'Budi Santoso',
        email: 'budi@nusantara.id',
        status: 'active',
        joinedAt: '2023-11-15',
        productsCount: 12,
        rating: 4.8
    }
];

export const AdminStoreManagement: React.FC = () => {
    const { token } = useStore();
    const [activeTab, setActiveTab] = useState<'merchants' | 'carousel'>('merchants');
    const [searchQuery, setSearchQuery] = useState('');
    const [merchants, setMerchants] = useState(MOCK_MERCHANTS);
    const [isLoading, setIsLoading] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    // Carousel State
    const { data: slides = [], isLoading: isLoadingCarousel } = useAdminShopCarousel(token || '');
    const addCarouselMutation = useAdminAddCarousel();
    const deleteCarouselMutation = useAdminDeleteCarousel();
    const [isAddingSlide, setIsAddingSlide] = useState(false);
    const [newSlide, setNewSlide] = useState({ image_url: '', link_url: '', order_index: 0 });

    const filteredMerchants = merchants.filter(merchant =>
        merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStatusChange = (id: string, newStatus: 'active' | 'suspended' | 'banned', merchantName: string) => {
        setIsLoading(true);
        setActiveActionMenu(null);

        // Simulate API update
        setTimeout(() => {
            setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
            setIsLoading(false);

            if (newStatus === 'suspended') toast.error(`${merchantName} has been Suspended.`);
            if (newStatus === 'banned') toast.error(`${merchantName} has been Banned from the platform.`);
            if (newStatus === 'active') toast.success(`${merchantName} is now Active.`);
        }, 600);
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

    const handleDeleteSlide = (id: string) => {
        if (confirm('Are you sure you want to delete this slide?')) {
            deleteCarouselMutation.mutate({ token: token || '', id });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">Active</span>;
            case 'suspended':
                return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">Suspended</span>;
            case 'banned':
                return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider border border-rose-500/20 flex items-center gap-1"><ShieldOff className="w-3 h-3" /> Banned</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Store className="w-8 h-8 text-teal-500" />
                        Tamuu Shop Admin
                    </h1>
                    <p className="text-slate-400 font-medium">Enterprise governance and shop storefront controls.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('merchants')}
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'merchants' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Merchants
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

            {activeTab === 'merchants' ? (
                <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Merchant Toolbar */}
                    <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between bg-[#1A1A1A]">
                        <div className="relative w-full md:w-[450px]">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/20">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search merchants by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:ring-0 focus:bg-white/[0.08] transition-all duration-500 placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Merchant Grid */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-slate-500 bg-black/20">
                                    <th className="px-6 py-4 font-bold">Merchant Name</th>
                                    <th className="px-6 py-4 font-bold">Owner Contact</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Listings</th>
                                    <th className="px-6 py-4 font-bold text-right">Sanctions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredMerchants.map((merchant) => (
                                    <tr key={merchant.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-sm">{merchant.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Joined {merchant.joinedAt}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-300">{merchant.owner}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{merchant.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(merchant.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-300">{merchant.productsCount} <span className="text-xs text-slate-500 font-normal">Active</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setActiveActionMenu(activeActionMenu === merchant.id ? null : merchant.id)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
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
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Image URL</label>
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
                                    <button onClick={() => setIsAddingSlide(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Cancel</button>
                                    <button onClick={handleAddSlide} className="px-10 py-4 bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20">Save Slide</button>
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
        </div>
    );
};
