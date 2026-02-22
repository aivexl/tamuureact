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

    if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><PremiumLoader color="#0A1128" /></div>;
    if (!product) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0A1128]">
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
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            {/* Action Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
                <m.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(`/shop/${slug}`)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-xl border border-slate-200 pointer-events-auto hover:bg-white/60 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-[#0A1128]" />
                </m.button>
                <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 pointer-events-auto"
                >
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-xl border border-slate-200 hover:bg-white/60 transition-all shadow-sm">
                        <Share2 className="w-5 h-5 text-[#FFBF00]" />
                    </button>
                </m.div>
            </div>

            <main className="pb-40">
                {/* Image Carousel */}
                <div className="relative h-[60vh] md:h-[70vh] w-full group overflow-hidden">
                    <AnimatePresence mode="wait">
                        <m.img
                            key={currentImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            src={images[currentImageIndex]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'}
                            alt={product.nama_produk}
                            className="w-full h-full object-cover grayscale-[10%]"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />

                    {/* Carousel Controls */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            >
                                <ChevronLeft className="w-6 h-6 text-[#0A1128]" />
                            </button>
                            <button
                                onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            >
                                <ChevronRight className="w-6 h-6 text-[#0A1128]" />
                            </button>

                            {/* Pagination Dots */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-8 bg-[#FFBF00]' : 'w-1.5 bg-slate-200'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-t-[3rem] pt-12 pb-8"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full w-fit">
                                    <Sparkles className="w-3 h-3 text-[#FFBF00]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Premium Choice</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-[#0A1128]">{product.nama_produk}</h2>
                            </div>
                            <div className="text-left md:text-right">
                                {product.is_discount && (
                                    <span className="text-sm text-slate-300 line-through block mb-1 font-bold">
                                        {formatCurrency(product.base_price)}
                                    </span>
                                )}
                                <span className="text-3xl md:text-4xl font-black text-[#0A1128] tracking-tighter">
                                    {formatCurrency(product.is_discount ? product.discount_price : product.base_price)}
                                </span>
                            </div>
                        </div>

                        {/* Merchant Link Card */}
                        <Link
                            to={`/shop/${slug}`}
                            className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl mb-12 hover:border-[#FFBF00]/30 transition-all group shadow-sm"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
                                    <img src={product.logo_url} alt="Merchant" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Official Merchant</p>
                                    <p className="font-bold text-[#0A1128] group-hover:text-[#FFBF00] transition-colors">{product.nama_toko}</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#FFBF00] group-hover:border-[#FFBF00]/30 transition-all shadow-sm">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </Link>

                        {/* Description */}
                        <div className="space-y-6 mb-16">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-1 bg-[#FFBF00] rounded-full" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#0A1128]">Spesifikasi & Deskripsi</h3>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] text-slate-600 text-sm leading-relaxed font-medium">
                                {product.deskripsi}
                            </div>
                        </div>

                        {/* Specs / Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Quality Assurance</p>
                                    <p className="text-xs font-bold text-[#0A1128]">Terjamin & Terverifikasi</p>
                                </div>
                            </div>
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Global Delivery</p>
                                    <p className="text-xs font-bold text-[#0A1128]">Layanan Cepat & Aman</p>
                                </div>
                            </div>
                        </div>
                    </m.div>
                </div>
            </main>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-10 pt-8 bg-gradient-to-t from-white via-white/95 to-transparent">
                <div className="max-w-3xl mx-auto flex gap-4">
                    <button
                        onClick={toggleWishlist}
                        className={`w-16 h-16 rounded-[2rem] border flex items-center justify-center transition-all shadow-sm ${isWishlisted
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : 'bg-white border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-200'
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        className="flex-1 h-16 bg-[#0A1128] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Hubungi Vendor Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
