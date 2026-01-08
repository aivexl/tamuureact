import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Loader2, Search, Sparkles, Heart, Eye, Lock, Crown, Star } from 'lucide-react';
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
}


interface InvitationsGridProps {
    isLoading: boolean;
    filteredTemplates: Template[];
    onUseTemplate: (id: string) => void;
    onPreviewTemplate: (slug: string | undefined, id: string) => void;
    selectedId?: string | null;
}


export const InvitationsGrid: React.FC<InvitationsGridProps> = ({
    isLoading,
    filteredTemplates,
    onUseTemplate,
    onPreviewTemplate,
    selectedId
}) => {
    const { user } = useStore();
    const navigate = useNavigate();

    const checkAccess = (templateTier?: SubscriptionTier) => {
        if (!templateTier || templateTier === 'free') return true;
        if (user?.tier === 'vvip') return true;
        if (user?.tier === 'vip' && templateTier === 'vip') return true;
        return false;
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-[#FFBF00] animate-spin mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Galeri Digital...</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template) => (
                    <m.div
                        key={template.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${template.id === selectedId
                            ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-xl shadow-teal-500/10 scale-[1.02] z-10'
                            : 'border-slate-200/60 hover:border-[#FFBF00]/30'
                            }`}
                    >
                        {/* Thumbnail Area */}
                        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
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


                            {/* Hover Like Overlay */}
                            <div className="absolute top-4 right-4">
                                <button
                                    className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm"
                                    aria-label="Sukai desain ini"
                                >
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category Tag */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                    {template.category || 'Premium'}
                                </span>
                                {template.id === selectedId && (
                                    <m.span
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="px-3 py-1 bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" /> Pilihan Anda
                                    </m.span>
                                )}
                                {template.tier && template.tier !== 'free' && (
                                    <span className={`px-3 py-1 ${template.tier === 'vvip' ? 'bg-[#FFBF00] text-[#0A1128]' : 'bg-indigo-600 text-white'} text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1`}>
                                        {template.tier === 'vvip' ? <Star className="w-3 h-3 fill-current" /> : <Crown className="w-3 h-3 fill-current" />}
                                        {template.tier.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>


                        {/* Info & Actions */}
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#FFBF00] transition-colors">{template.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#FFBF00] rounded-full" />
                                    High-Quality Template
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => {
                                        if (checkAccess(template.tier)) {
                                            onUseTemplate(template.id);
                                        } else {
                                            navigate('/upgrade');
                                        }
                                    }}
                                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${!checkAccess(template.tier)
                                            ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            : template.id === selectedId
                                                ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-500/20'
                                                : 'bg-slate-900 text-white hover:bg-[#FFBF00] hover:text-slate-900 shadow-slate-900/10'
                                        }`}
                                >
                                    {!checkAccess(template.tier) && <Lock className="w-3 h-3" />}
                                    {template.id === selectedId
                                        ? 'Konfirmasi Desain'
                                        : !checkAccess(template.tier)
                                            ? `Unlock ${template.tier?.toUpperCase()}`
                                            : 'Gunakan Desain'}
                                </button>
                                <button
                                    onClick={() => onPreviewTemplate(template.slug, template.id)}
                                    className="w-full py-3 bg-white text-slate-500 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" /> Live Preview
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
