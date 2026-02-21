import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import {
    ArrowLeft,
    Share2,
    Verified,
    Lock,
    MapPin,
    MessageCircle,
    Instagram,
    Mail,
    ChevronRight,
    ShoppingBag
} from 'lucide-react';
import { useStorefront, useTrackInteraction } from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useStore } from '../../store/useStore';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency } from '../../lib/utils';

export const StorefrontPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, token } = useStore();

    const { data, isLoading } = useStorefront(slug || '', token || undefined);
    const track = useTrackInteraction();

    const merchant = data?.merchant;
    const products = data?.products || [];
    const contacts = data?.contacts || {};

    useSEO({
        title: merchant ? `${merchant.nama_toko} | Tamuu Nexus` : 'Storefront - Tamuu Nexus',
        description: merchant?.deskripsi || 'Kunjungi toko vendor terbaik di Tamuu Nexus.'
    });

    useEffect(() => {
        if (merchant?.id) {
            track.mutate({ merchantId: merchant.id, actionType: 'VIEW_PROFILE' });
        }
    }, [merchant?.id]);

    if (isLoading) return <div className="min-h-screen bg-[#0A1128] flex items-center justify-center"><PremiumLoader color="#FFBF00" /></div>;
    if (!merchant) return <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-black mb-4">Toko Tidak Ditemukan</h2>
        <button onClick={() => navigate('/shop')} className="text-[#FFBF00] font-bold">Kembali ke Direktori</button>
    </div>;

    const handleProductClick = (productId: string) => {
        track.mutate({ merchantId: merchant.id, actionType: 'CLICK_PRODUCT', productId });
        navigate(`/shop/${slug}/${productId}`);
    };

    return (
        <div className="min-h-screen bg-[#0A1128] text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0A1128]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6">
                <button
                    onClick={() => navigate('/shop')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xs font-black tracking-[0.2em] uppercase text-white/50">Brand Storefront</h1>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10">
                    <Share2 className="w-5 h-5 text-[#FFBF00]" />
                </button>
            </div>

            <main className="pb-32">
                {/* Hero Banner */}
                <div className="relative h-64 w-full overflow-hidden">
                    <img
                        src={merchant.banner_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent" />
                </div>

                {/* Profile Section */}
                <div className="px-6 -mt-16 relative z-10">
                    <div className="flex flex-col items-start gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl border-8 border-[#0A1128] overflow-hidden shadow-2xl bg-white">
                                <img
                                    src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#FFBF00] text-[#0A1128] rounded-2xl p-2 border-4 border-[#0A1128] shadow-lg shadow-[#FFBF00]/20">
                                <Verified className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black tracking-tight">{merchant.nama_toko}</h2>
                                <span className="text-[10px] font-black tracking-widest bg-[#FFBF00]/10 text-[#FFBF00] px-3 py-1.5 rounded-full border border-[#FFBF00]/20 uppercase">
                                    Premium
                                </span>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed max-w-lg font-medium">
                                {merchant.deskripsi}
                            </p>
                        </div>

                        {/* Curiosity Gap: Contact Card */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mt-4 flex items-center justify-between shadow-2xl group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-[#FFBF00]/10 flex items-center justify-center">
                                    <Lock className={`w-6 h-6 ${contacts.isLocked ? 'text-[#FFBF00]' : 'text-emerald-400'}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Official Contact</p>
                                    <p className="text-white font-mono text-lg tracking-tight">
                                        {contacts.whatsapp}
                                    </p>
                                </div>
                            </div>

                            {contacts.isLocked ? (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-[#FFBF00] hover:bg-amber-400 text-[#0A1128] text-[10px] font-black uppercase tracking-widest py-4 px-8 rounded-2xl transition-all active:scale-95 shadow-xl shadow-[#FFBF00]/20"
                                >
                                    Login to reveal
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button className="p-3 bg-white/5 rounded-xl text-white/50 hover:text-emerald-400 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-white/5 rounded-xl text-white/50 hover:text-pink-400 transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </m.div>
                    </div>
                </div>

                {/* Product Section */}
                <div className="mt-16 px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                            Katalog Produk
                            <span className="text-sm font-medium text-white/30 bg-white/5 px-3 py-1 rounded-full">{products.length}</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product: any) => (
                            <m.div
                                key={product.id}
                                whileHover={{ y: -6 }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden flex flex-col group transition-all duration-300 hover:border-[#FFBF00]/30"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'}
                                        alt={product.nama_produk}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[#0A1128]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-[#FFBF00] transition-colors">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="p-5 space-y-4 flex flex-1 flex-col">
                                    <div>
                                        <h4 className="text-sm font-black text-white line-clamp-2 leading-tight group-hover:text-[#FFBF00] transition-colors">
                                            {product.nama_produk}
                                        </h4>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div>
                                            {product.is_discount && (
                                                <span className="text-[10px] text-white/30 line-through block mb-1">
                                                    {formatCurrency(product.base_price)}
                                                </span>
                                            )}
                                            <span className="text-[#FFBF00] font-black text-lg tracking-tight italic">
                                                {formatCurrency(product.is_discount ? product.discount_price : product.base_price)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleProductClick(product.id)}
                                            className="w-full border border-[#FFBF00]/30 hover:bg-[#FFBF00] text-[#FFBF00] hover:text-[#0A1128] transition-all py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-[#FFBF00]"
                                        >
                                            Lihat Produk
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                            <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30 font-medium">Belum ada produk yang dipublikasikan.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StorefrontPage;
