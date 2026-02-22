import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Plus, Trash2, GripVertical, Save, Image, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../../ui/PremiumLoader';

export const AdminShopSettings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Simulate Initial Data based on the ShopPage defaults
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

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API Saving
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        toast.success('Carousel settings synchronized to CDN.');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Shop Governance</h1>
                    <p className="text-slate-400 font-medium">Manage the B2B2C Enterprise Directory</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <PremiumLoader className="w-5 h-5 text-slate-900" /> : <Save className="w-5 h-5" />}
                    Save Configuration
                </button>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Image className="w-5 h-5 text-teal-500" />
                            Fortune 500 Promo Carousel
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            Rule: Pure-Image only. No overlays or text cards allowed. Maintain 21:9 ratio.
                        </p>
                    </div>
                    <button
                        onClick={handleAddSlide}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Slide
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {slides.map((slide, index) => (
                        <m.div
                            key={slide.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 border border-white/10 rounded-xl group relative"
                        >
                            <div className="flex items-center justify-center px-2 cursor-grab text-slate-500 hover:text-white transition-colors">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            {/* Preview Tile */}
                            <div className="w-full md:w-48 h-24 bg-black/50 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                {slide.image ? (
                                    <img src={slide.image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-medium">No Image</div>
                                )}
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">High-Fidelity Image URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <Image className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={slide.image}
                                            onChange={(e) => handleChange(slide.id, 'image', e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Click Hotspot Destination Route</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={slide.link}
                                            onChange={(e) => handleChange(slide.id, 'link', e.target.value)}
                                            placeholder="/shop?category=MUA"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delete Action */}
                            <div className="flex items-center justify-center pl-4 border-l border-white/5">
                                <button
                                    onClick={() => handleRemoveSlide(slide.id)}
                                    className="p-3 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
