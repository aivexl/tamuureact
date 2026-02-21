import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Share2,
    Heart,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    ShieldCheck,
    Truck,
    Clock,
    ShoppingCart
} from 'lucide-react';
import {
    useProductDetails,
    useTrackInteraction,
    useToggleWishlist,
    useWishlist
} from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
    const { slug, productId } = useParams<{ slug: string, productId: string }>();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user } = useStore();

    const { data: product, isLoading } = useProductDetails(productId || '');
    const { data: wishlist = [] } = useWishlist(user?.id);
    const toggleWishlistMutation = useToggleWishlist();
    const track = useTrackInteraction();

    const isWishlisted = wishlist.some((item: any) => item.id === productId);

    useSEO({
        title: product ? `${product.nama_produk} | Tamuu Nexus` : 'Product Details - Tamuu Nexus',
        description: product?.deskripsi || 'Detail produk terbaik di Tamuu Nexus.'
    });

    useEffect(() => {
        if (product?.id) {
            track.mutate({ merchantId: product.merchant_id, actionType: 'VIEW_PRODUCT', productId: product.id });
        }
    }, [product?.id]);

    if (isLoading) return <div className="min-h-screen bg-[#0A1128] flex items-center justify-center"><PremiumLoader color="#FFBF00" /></div>;
    if (!product) return <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-black mb-4">Produk Tidak Ditemukan</h2>
        <button onClick={() => navigate(`/shop/${slug}`)} className="text-[#FFBF00] font-bold">Kembali ke Toko</button>
    </div>;

    const images = product.images || [];

    const handleWhatsApp = () => {
        const text = `Halo, saya tertarik dengan produk ${product.nama_produk} di Tamuu Nexus. Apakah masih tersedia?`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const toggleWishlist = () => {
        if (!user) {
            toast.error('Silakan login untuk menambahkan ke wishlist');
            navigate('/login');
            return;
        }

        toggleWishlistMutation.mutate({ userId: user.id, productId: productId || '' });
        toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist', {
            icon: <Heart className={`w-4 h-4 ${!isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />,
        });
    };

    return (
        <div className="min-h-screen bg-[#0A1128] text-white font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            {/* Action Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
                <m.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(`/shop/${slug}`)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0A1128]/40 backdrop-blur-xl border border-white/10 pointer-events-auto hover:bg-[#0A1128]/60 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </m.button>
                <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 pointer-events-auto"
                >
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0A1128]/40 backdrop-blur-xl border border-white/10 hover:bg-[#0A1128]/60 transition-all">
                        <Share2 className="w-5 h-5 text-[#FFBF00]" />
                    </button>
                </m.div>
            </div>

            <main className="pb-40">
                {/* Image Carousel */}
                <div className="relative h-[60vh] md:h-[70vh] w-full group">
                    <AnimatePresence mode="wait">
                        <m.img
                            key={currentImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            src={images[currentImageIndex]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'}
                            alt={product.nama_produk}
                            className="w-full h-full object-cover"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent opacity-60" />

                    {/* Carousel Controls */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Pagination Dots */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-8 bg-[#FFBF00]' : 'w-1.5 bg-white/30'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="px-6 -mt-8 relative z-10">
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0A1128] rounded-t-[3rem] pt-12 pb-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#FFBF00]/10 border border-[#FFBF00]/20 rounded-full w-fit">
                                    <Sparkles className="w-3 h-3 text-[#FFBF00]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00]">Best Seller</span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight leading-tight">{product.nama_produk}</h2>
                            </div>
                            <div className="text-right">
                                {product.is_discount && (
                                    <span className="text-sm text-white/30 line-through block mb-1">
                                        {formatCurrency(product.base_price)}
                                    </span>
                                )}
                                <span className="text-3xl font-black text-[#FFBF00] tracking-tighter italic">
                                    {formatCurrency(product.is_discount ? product.discount_price : product.base_price)}
                                </span>
                            </div>
                        </div>

                        {/* Merchant Link Card */}
                        <Link
                            to={`/shop/${slug}`}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-3xl mb-10 hover:border-[#FFBF00]/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white">
                                    <img src={product.logo_url} alt="Merchant" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-0.5">Dijual Oleh</p>
                                    <p className="font-bold text-white group-hover:text-[#FFBF00] transition-colors">{product.nama_toko}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-[#FFBF00] transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </Link>

                        {/* Description */}
                        <div className="space-y-6 mb-12">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-1 bg-[#FFBF00] rounded-full" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Deskripsi Produk</h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] text-white/60 text-sm leading-relaxed font-medium">
                                {product.deskripsi}
                            </div>
                        </div>

                        {/* Specs / Features Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-16">
                            <div className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-black">Quality</p>
                                    <p className="text-xs font-bold">Terjamin</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-black">Delivery</p>
                                    <p className="text-xs font-bold">Cepat</p>
                                </div>
                            </div>
                        </div>
                    </m.div>
                </div>
            </main>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-10 pt-6 bg-gradient-to-t from-[#0A1128] via-[#0A1128]/95 to-transparent">
                <div className="max-w-2xl mx-auto flex gap-4">
                    <button
                        onClick={toggleWishlist}
                        className={`w-16 h-16 rounded-3xl border flex items-center justify-center transition-all ${isWishlisted
                            ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                            : 'bg-white/5 border-white/10 text-white/30 hover:text-rose-500 hover:border-rose-500/30'
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        className="flex-1 h-16 bg-[#FFBF00] text-[#0A1128] rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#FFBF00]/30 hover:shadow-[#FFBF00]/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Pesan Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
