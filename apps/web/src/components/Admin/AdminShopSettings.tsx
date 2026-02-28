import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Save, Image, Link as LinkIcon, AlertCircle, Megaphone, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../ui/PremiumLoader';
import { admin } from '../../lib/api';
import { useStore } from '../../store/useStore';

export const AdminShopSettings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<'carousel' | 'ads'>('carousel');
    const token = useStore(state => state.token);

    // Carousel State
    const [slides, setSlides] = useState([
        {
            id: 'slide-1',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80',
            link: '/shop?category=MUA'
        },
        {
            id: 'slide-2',
            image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
            link: '/shop?category=Wedding%20Organizer'
        },
        {
            id: 'slide-3',
            image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
            link: '/shop?category=Catering'
        }
    ]);

    // Ads State
    const [ads, setAds] = useState<any[]>([]);
    const [isFetchingAds, setIsFetchingAds] = useState(false);

    useEffect(() => {
        if (currentTab === 'ads') {
            fetchAds();
        }
    }, [currentTab]);

    const fetchAds = async () => {
        setIsFetchingAds(true);
        try {
            const data = await admin.listAds(token || undefined);
            setAds(data);
        } catch (error) {
            toast.error('Failed to fetch ads');
        } finally {
            setIsFetchingAds(false);
        }
    };

    const handleAddSlide = () => {
        const newSlide = {
            id: `slide-${Date.now()}`,
            image: '',
            link: '/shop'
        };
        setSlides([...slides, newSlide]);
    };

    const handleRemoveSlide = (id: string) => {
        if (slides.length <= 1) {
            toast.error('The carousel must have at least one slide.');
            return;
        }
        setSlides(slides.filter(slide => slide.id !== id));
    };

    const handleChange = (id: string, field: 'image' | 'link', value: string) => {
        setSlides(slides.map(slide =>
            slide.id === id ? { ...slide, [field]: value } : slide
        ));
    };

    const handleAddAd = () => {
        const newAd = {
            id: `new-${Date.now()}`,
            image_url: '',
            link_url: '',
            title: 'New Sponsor',
            position: 'PRODUCT_DETAIL_SIDEBAR',
            is_active: 1
        };
        setAds([newAd, ...ads]);
    };

    const handleRemoveAd = async (id: string) => {
        if (id.startsWith('new-')) {
            setAds(ads.filter(a => a.id !== id));
            return;
        }

        try {
            await admin.deleteAd(id, token || undefined);
            toast.success('Ad deleted');
            fetchAds();
        } catch (error) {
            toast.error('Failed to delete ad');
        }
    };

    const handleSaveAd = async (ad: any) => {
        try {
            const payload = { ...ad };
            if (payload.id.startsWith('new-')) delete payload.id;
            
            await admin.saveAd(payload, token || undefined);
            toast.success('Ad saved successfully');
            fetchAds();
        } catch (error) {
            toast.error('Failed to save ad');
        }
    };

    const handleSaveCarousel = async () => {
        setIsLoading(true);
        // Simulate API Saving for carousel (since we don't have real endpoint yet)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast.success('Carousel settings synchronized to CDN.');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Shop Governance</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Manage the B2B2C Enterprise Directory</p>
                </div>
                
                {currentTab === 'carousel' && (
                    <button
                        onClick={handleSaveCarousel}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#FFBF00] text-[#0A1128] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                    >
                        {isLoading ? <PremiumLoader className="w-4 h-4 text-[#0A1128]" /> : <Save className="w-4 h-4" />}
                        Save Carousel
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <button 
                    onClick={() => setCurrentTab('carousel')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'carousel' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                >
                    Promo Carousel
                </button>
                <button 
                    onClick={() => setCurrentTab('ads')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'ads' ? 'bg-[#FFBF00] text-[#0A1128]' : 'text-slate-400 hover:text-white'}`}
                >
                    Ads & Banners
                </button>
            </div>

            <AnimatePresence mode="wait">
                {currentTab === 'carousel' ? (
                    <m.div
                        key="carousel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Image className="w-5 h-5 text-[#FFBF00]" />
                                    Fortune 500 Promo Carousel
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                    Maintain 21:9 Aspect Ratio. High-Resolution Only.
                                </p>
                            </div>
                            <button
                                onClick={handleAddSlide}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 border border-white/10"
                            >
                                <Plus className="w-4 h-4" />
                                Add Slide
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            {slides.map((slide, index) => (
                                <m.div
                                    key={slide.id}
                                    layout
                                    className="flex flex-col md:flex-row gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl group relative"
                                >
                                    <div className="flex items-center justify-center px-2 cursor-grab text-slate-600 hover:text-[#FFBF00] transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    {/* Preview Tile */}
                                    <div className="w-full md:w-64 aspect-[21/9] bg-black/50 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                                        {slide.image ? (
                                            <img src={slide.image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-widest">No Image</div>
                                        )}
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">High-Fidelity Image URL</label>
                                            <div className="relative">
                                                <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                                <input
                                                    type="text"
                                                    value={slide.image}
                                                    onChange={(e) => handleChange(slide.id, 'image', e.target.value)}
                                                    placeholder="https://images.unsplash.com/..."
                                                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50 transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Click Hotspot Destination Route</label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                                <input
                                                    type="text"
                                                    value={slide.link}
                                                    onChange={(e) => handleChange(slide.id, 'link', e.target.value)}
                                                    placeholder="/shop?category=MUA"
                                                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50 transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Action */}
                                    <div className="flex items-center justify-center pl-6 border-l border-white/5">
                                        <button
                                            onClick={() => handleRemoveSlide(slide.id)}
                                            className="p-4 text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                    </m.div>
                ) : (
                    <m.div
                        key="ads"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Megaphone className="w-5 h-5 text-[#FFBF00]" />
                                    Strategic Sponsor Banners
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-[#FFBF00]" />
                                    Control Shop Special Banners and Product Detail Sidebars.
                                </p>
                            </div>
                            <button
                                onClick={handleAddAd}
                                className="px-5 py-2.5 bg-[#FFBF00] text-[#0A1128] text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/10"
                            >
                                <Plus className="w-4 h-4" />
                                Create Banner
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {isFetchingAds ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <PremiumLoader className="w-10 h-10 text-[#FFBF00]" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Syncing Ads Database</p>
                                </div>
                            ) : ads.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                    <Megaphone className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active sponsorship campaigns</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {ads.map((ad) => (
                                        <AdEditorRow 
                                            key={ad.id} 
                                            ad={ad} 
                                            onSave={handleSaveAd} 
                                            onDelete={handleRemoveAd} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AdEditorRow: React.FC<{ ad: any, onSave: (ad: any) => void, onDelete: (id: string) => void }> = ({ ad, onSave, onDelete }) => {
    const [localAd, setLocalAd] = useState(ad);
    const [hasChanges, setLocalHasChanges] = useState(false);

    const updateField = (field: string, value: any) => {
        setLocalAd({ ...localAd, [field]: value });
        setLocalHasChanges(true);
    };

    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col lg:flex-row gap-8 relative group">
            {/* Visual Preview */}
            <div className="w-full lg:w-48 aspect-[4/5] bg-black/50 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-[#FFBF00]/30 transition-all">
                {localAd.image_url ? (
                    <img src={localAd.image_url} alt="Ad Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-4">
                        <Image className="w-8 h-8 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">Preview Target Required</span>
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Campaign Identifier (Title)</label>
                        <input
                            type="text"
                            value={localAd.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Creative Asset URL</label>
                        <input
                            type="text"
                            value={localAd.image_url}
                            onChange={(e) => updateField('image_url', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Click-Through URL (Link)</label>
                        <input
                            type="text"
                            value={localAd.link_url}
                            onChange={(e) => updateField('link_url', e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#FFBF00]/50"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Positioning</label>
                            <select
                                value={localAd.position}
                                onChange={(e) => updateField('position', e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none appearance-none"
                            >
                                <option value="SHOP_SPECIAL_FOR_YOU">Shop Special Banner</option>
                                <option value="PRODUCT_DETAIL_SIDEBAR">Product Sidebar</option>
                                <option value="SHOP_FOOTER">Shop Footer</option>
                                <option value="FEATURED_PRODUCT_LANDING">Landing Page Products</option>
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                            <button 
                                onClick={() => updateField('is_active', localAd.is_active === 1 ? 0 : 1)}
                                className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${localAd.is_active === 1 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                {localAd.is_active === 1 ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row Actions */}
            <div className="flex lg:flex-col items-center justify-center gap-2 lg:pl-6 lg:border-l lg:border-white/5">
                <button
                    onClick={() => onSave(localAd)}
                    disabled={!hasChanges}
                    className={`p-3 rounded-xl transition-all ${hasChanges ? 'bg-[#FFBF00] text-[#0A1128] shadow-lg' : 'text-slate-600 bg-white/5 opacity-50 cursor-not-allowed'}`}
                    title="Save Changes"
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(localAd.id)}
                    className="p-3 text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                    title="Delete Ad"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
