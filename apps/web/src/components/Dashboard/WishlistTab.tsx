import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Mail, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useWishlist as useInvitationWishlist, useTemplates, useToggleWishlist as useToggleInvitationWishlist } from '@/hooks/queries/useTemplates';
import { useWishlist as useProductWishlist, useToggleWishlist as useToggleProductWishlist } from '@/hooks/queries/useShop';
import { ProductCard } from '@/components/Shop/ProductCard';
import { InvitationsGrid } from '@/components/Store/InvitationsGrid';
import { useNavigate } from 'react-router-dom';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

type SubTabId = 'products' | 'invitations';

export const WishlistTab: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const [activeSubTab, setActiveSubTab] = useState<SubTabId>('products');

    // Invitation Wishlist Data
    const { data: invitationWishlistIds = [], isLoading: isLoadingInvWishlist } = useInvitationWishlist(user?.id, user?.email);
    const { data: allTemplates = [], isLoading: isLoadingTemplates } = useTemplates();
    const toggleInvitationWishlist = useToggleInvitationWishlist();

    // Product Wishlist Data
    const { data: productWishlist = [], isLoading: isLoadingProdWishlist } = useProductWishlist(user?.id);
    const toggleProductWishlist = useToggleProductWishlist();

    // CTO POLICY: Defensive mapping to prevent platform crash during API transitions
    const safeInvIds = Array.isArray(invitationWishlistIds) ? invitationWishlistIds : [];
    const safeTemplates = Array.isArray(allTemplates) ? allTemplates : [];
    const safeProductWishlist = Array.isArray(productWishlist) ? productWishlist : [];

    const wishlistedTemplates = safeTemplates.filter((t: any) => 
        safeInvIds.includes(t.id)
    );

    const handleToggleInvitation = (templateId: string, isWishlisted: boolean) => {
        if (!user?.id) return;
        toggleInvitationWishlist.mutate({
            userId: user.id,
            templateId,
            isWishlisted,
            email: user.email
        });
    };

    const isLoading = activeSubTab === 'products' ? isLoadingProdWishlist : (isLoadingInvWishlist || isLoadingTemplates);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Wishlist Saya</h2>
                    <p className="text-slate-500 text-sm">Produk dan desain undangan yang Anda sukai.</p>
                </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveSubTab('products')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeSubTab === 'products' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    Produk & Jasa
                </button>
                <button
                    onClick={() => setActiveSubTab('invitations')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeSubTab === 'invitations' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Mail className="w-4 h-4" />
                    Undangan
                </button>
            </div>

            <AnimatePresence mode="wait">
                <m.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {isLoading ? (
                        <div className="py-20 flex justify-center">
                            <PremiumLoader variant="inline" color="#FFBF00" showLabel label="Memuat Wishlist..." />
                        </div>
                    ) : (
                        <>
                            {activeSubTab === 'products' ? (
                                safeProductWishlist.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                        {safeProductWishlist.map((product: any) => (
                                            <ProductCard 
                                                key={product.id} 
                                                product={product} 
                                                navigate={navigate}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState 
                                        icon={ShoppingBag} 
                                        title="Belum ada produk favorit" 
                                        description="Jelajahi Tamuu Shop dan temukan produk atau jasa terbaik untuk acara Anda."
                                        actionText="Buka Tamuu Shop"
                                        onAction={() => navigate('/')}
                                    />
                                )
                            ) : (
                                wishlistedTemplates.length > 0 ? (
                                    <InvitationsGrid 
                                        isLoading={false}
                                        filteredTemplates={wishlistedTemplates}
                                        onUseTemplate={(id) => navigate(`/onboarding?templateId=${id}`)}
                                        onPreviewTemplate={(slug, id) => window.open(`/preview/${slug || id}`, '_blank')}
                                        wishlist={safeInvIds}
                                        onToggleWishlist={handleToggleInvitation}
                                    />
                                ) : (
                                    <EmptyState 
                                        icon={Mail} 
                                        title="Belum ada desain favorit" 
                                        description="Temukan berbagai desain undangan premium yang sesuai dengan tema acara Anda."
                                        actionText="Jelajahi Template"
                                        onAction={() => navigate('/invitations')}
                                    />
                                )
                            )}
                        </>
                    )}
                </m.div>
            </AnimatePresence>
        </div>
    );
};

interface EmptyStateProps {
    icon: React.FC<any>;
    title: string;
    description: string;
    actionText: string;
    onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionText, onAction }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[2rem] border border-slate-100 text-center">
        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-6">
            <Icon className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 max-w-sm mb-8">{description}</p>
        <button
            onClick={onAction}
            className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FFBF00] hover:text-slate-900 transition-all shadow-xl shadow-slate-900/10 active:scale-95 text-sm uppercase tracking-widest"
        >
            {actionText}
        </button>
    </div>
);
