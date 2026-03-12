import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Heart, Eye, Lock, Crown, Star } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { SubscriptionTier } from '@/store/authSlice';

interface Template {
    id: string;
    name: string;
    slug?: string;
    thumbnail_url?: string;
    thumbnail?: string; // API returns 'thumbnail', grid uses 'thumbnail_url'
    category?: string;
    tier?: SubscriptionTier;
    price?: number;
    type?: 'invitation' | 'display';
}


interface InvitationsGridProps {
    isLoading: boolean;
    filteredTemplates: Template[];
    onUseTemplate: (id: string) => void;
    onPreviewTemplate: (slug: string | undefined, id: string) => void;
    selectedId?: string | null;
    wishlist?: string[];
    onToggleWishlist?: (templateId: string, isWishlisted: boolean) => void;
}


export const InvitationsGrid: React.FC<InvitationsGridProps> = ({
    isLoading,
    filteredTemplates,
    onUseTemplate,
    onPreviewTemplate,
    selectedId,
    wishlist = [],
    onToggleWishlist
}) => {
    const { user } = useStore();
    const navigate = useNavigate();

    const checkAccess = (templateTier?: SubscriptionTier) => {
        if (!templateTier || templateTier === 'free') return true;
        if (user?.tier === 'vvip') return true;
        if (user?.tier === 'platinum' && (templateTier === 'platinum' || templateTier === 'vip')) return true;
        if (user?.tier === 'vip' && templateTier === 'vip') return true;
        return false;
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <PremiumLoader variant="inline" showLabel label="Menyiapkan Galeri Digital..." color="#FFBF00" />
            </div>
        );
    }

    if (filteredTemplates.length === 0) {
        return (
            <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-slate-100">
                <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Desain Tidak Ditemukan</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Kami tidak dapat menemukan desain yang sesuai dengan kata kunci Anda.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template) => (
                    <m.div
                        key={template.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group bg-white border rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 relative w-full h-[320px] md:h-[400px] ${template.id === selectedId
                            ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-xl shadow-teal-500/10 scale-[1.02] z-10'
                            : 'border-slate-200/60 hover:border-[#FFBF00]/30'
                            }`}
                    >
                        {/* Thumbnail Area */}
                        <div className="h-[140px] md:h-[180px] relative overflow-hidden flex-shrink-0 bg-slate-100">
                            {(template.thumbnail_url || template.thumbnail) ? (
                                <img
                                    src={template.thumbnail_url || template.thumbnail}
                                    alt={template.name}
                                    width={400}
                                    height={500}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                                    <Sparkles className="w-12 h-12" />
                                </div>
                            )}


                            {/* Like Button */}
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const isWishlisted = wishlist.includes(template.id);
                                        onToggleWishlist?.(template.id, isWishlisted);
                                    }}
                                    className={`w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm ${wishlist.includes(template.id) ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-400 hover:text-rose-500'}`}
                                    aria-label="Sukai desain ini"
                                >
                                    <Heart className={`w-4 h-4 ${wishlist.includes(template.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Category Tag */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                                <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-widest rounded-md w-fit">
                                    {template.category || 'Premium'}
                                </span>
                                {template.tier && template.tier !== 'free' && (
                                    <span className={`px-2 py-0.5 ${template.tier === 'vvip' ? 'bg-[#FFBF00] text-[#0A1128]' : template.tier === 'platinum' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'} text-[7px] font-black uppercase tracking-widest rounded-md shadow-lg flex items-center gap-1 w-fit`}>
                                        {template.tier === 'vvip' ? 'ELITE' : template.tier === 'platinum' ? 'ULTIMATE' : 'PRO'}
                                    </span>
                                )}
                            </div>
                        </div>


                        {/* Info & Actions */}
                        <div className="p-3 md:p-4 flex flex-col flex-1 min-w-0">
                            <div className="mb-2">
                                <h3 className="text-[10px] md:text-xs font-black text-[#0A1128] mb-1 group-hover:text-[#FFBF00] transition-colors uppercase line-clamp-2 leading-tight min-h-[2.2rem]">
                                    {template.name}
                                </h3>
                                <span className="text-[7px] md:text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-[#FFBF00] rounded-full" />
                                    Premium Template
                                </span>
                            </div>

                            <div className="mt-auto space-y-2">
                                <button
                                    onClick={() => {
                                        if (checkAccess(template.tier)) {
                                            onUseTemplate(template.id);
                                        } else {
                                            navigate('/upgrade');
                                        }
                                    }}
                                    className={`w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 ${!checkAccess(template.tier)
                                        ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        : template.id === selectedId
                                            ? 'bg-teal-500 text-white hover:bg-teal-600'
                                            : 'bg-slate-900 text-white hover:bg-[#FFBF00] hover:text-slate-900'
                                        }`}
                                >
                                    {!checkAccess(template.tier) && <Lock className="w-2.5 h-2.5" />}
                                    {template.id === selectedId
                                        ? 'Konfirmasi'
                                        : !checkAccess(template.tier)
                                            ? `Unlock ${template.tier === 'vip' ? 'PRO' : template.tier?.toUpperCase()}`
                                            : 'Gunakan'}
                                </button>
                                <button
                                    onClick={() => onPreviewTemplate(template.slug, template.id)}
                                    className="w-full py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-3.5 h-3.5" /> Preview
                                </button>
                            </div>
                        </div>
                    </m.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default InvitationsGrid;
