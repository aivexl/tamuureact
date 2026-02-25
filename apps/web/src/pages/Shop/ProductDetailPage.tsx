import React, { useEffect, useState, useMemo } from 'react';
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
    MapPin,
    Tag,
    ShoppingBag,
    Star
} from 'lucide-react';
import {
    useProductDetails,
    useTrackInteraction,
    useToggleWishlist,
    useWishlist,
    useMerchantProducts,
    useMerchantStats,
    useSmartRecommendations
} from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useStore } from '../../store/useStore';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
    const { slug, productId } = useParams<{ slug: string, productId: string }>();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user } = useStore();

    // Data Fetching
    const { data: product, isLoading: isLoadingProduct } = useProductDetails(productId || '');
    const { data: wishlist = [] } = useWishlist(user?.id);
    const { data: merchantProducts = [] } = useMerchantProducts(product?.merchant_id);
    const { data: merchantStats } = useMerchantStats(product?.merchant_id);
    const { data: recommendations = [] } = useSmartRecommendations(productId, product?.kategori_produk);
    
    const toggleWishlistMutation = useToggleWishlist();
    const track = useTrackInteraction();

    const isWishlisted = wishlist.some((item: any) => item.id === productId);

    // Filter other products from same merchant
    const otherProducts = useMemo(() => 
        (merchantProducts || []).filter((p: any) => p.id !== productId).slice(0, 10),
    [merchantProducts, productId]);

    useSEO({
        title: product ? `${product.nama_produk} | Tamuu Shop` : 'Product Details - Tamuu Shop',
        description: product?.deskripsi || 'Detail produk terbaik di Tamuu Shop.'
    });

    useEffect(() => {
        if (product?.id) {
            track.mutate({ merchantId: product.merchant_id, actionType: 'VIEW_PRODUCT', productId: product.id });
        }
    }, [product?.id]);

    const handleWhatsApp = () => {
        const text = `Halo, saya tertarik dengan produk ${product?.nama_produk} di Tamuu Shop. Apakah masih tersedia?`;
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

    if (isLoadingProduct) return <div className="min-h-screen bg-white flex items-center justify-center"><PremiumLoader color="#0A1128" /></div>;
    if (!product) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0A1128]">
        <h2 className="text-2xl font-black mb-4">Produk Tidak Ditemukan</h2>
        <button onClick={() => navigate(`/shop/${slug}`)} className="text-[#FFBF00] font-bold">Kembali ke Toko</button>
    </div>;

    const images = product.images || [];

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            {/* Minimal Action Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-50">
                <button
                    onClick={() => navigate(`/shop/${slug}`)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
                        <Share2 className="w-5 h-5 text-[#FFBF00]" />
                    </button>
                </div>
            </div>

            <main className="pt-24 pb-40">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT: Image Gallery - Constrained Size */}
                    <div className="space-y-6">
                        <div className="relative aspect-square max-h-[550px] w-full rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 group shadow-sm">
                            <AnimatePresence mode="wait">
                                <m.img
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={images[currentImageIndex]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'}
                                    alt={product.nama_produk}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {images.map((img: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                        idx === currentImageIndex ? 'border-[#FFBF00]' : 'border-transparent opacity-60'
                                    }`}
                                >
                                    <img src={img.image_url} className="w-full h-full object-cover" alt="Thumb" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                                    <span className="px-3 py-1 rounded-lg bg-[#FFBF00]/10 text-[#FFBF00] text-[9px] font-black uppercase tracking-widest border border-[#FFBF00]/20 truncate">
                                        {product.kategori_produk}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3 flex-shrink-0" /> {product.kota}
                                    </span>
                                </div>
                                
                                {/* Social Proof: Wishlist Count - Inset from edge */}
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg flex-shrink-0">
                                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                    <span className="text-[11px] font-black text-rose-600 uppercase tracking-tighter">
                                        {formatAbbreviatedNumber(product.wishlist_count || 0)}
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-4xl font-black text-[#0A1128] uppercase tracking-tight italic leading-none">{product.nama_produk}</h1>
                            
                            <div className="py-6 border-y border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimasi Harga</p>
                                <p className="text-4xl font-black text-[#0A1128] tracking-tighter">
                                    {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                        ? formatCurrency(product.harga_estimasi) 
                                        : (product.harga_estimasi || 'Tanyakan Harga')}
                                </p>
                            </div>

                            {/* Enhanced Merchant Card */}
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg flex-shrink-0">
                                        <img 
                                            src={product.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${product.nama_toko}`} 
                                            alt={product.nama_toko} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-[#0A1128] truncate">{product.nama_toko}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1">
                                                <ShoppingBag className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {merchantStats?.total_products || 0} Produk
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {merchantStats?.total_wishlist || 0} Love
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/shop/${slug}`} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center hover:bg-[#0A1128] hover:text-white transition-all shadow-sm">
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Horizontal Grid: Other Products from Store */}
                            {otherProducts.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0A1128]">Produk Lain Dari Toko Ini</h3>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                                        {otherProducts.map((p: any) => (
                                            <m.div
                                                key={p.id}
                                                whileHover={{ y: -4 }}
                                                onClick={() => navigate(`/shop/${slug}/${p.id}`)}
                                                className="w-40 flex-shrink-0 cursor-pointer group"
                                            >
                                                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-2 relative">
                                                    <img src={p.images?.[0]?.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.nama_produk} />
                                                </div>
                                                <p className="text-[10px] font-black text-[#0A1128] uppercase truncate leading-tight">{p.nama_produk}</p>
                                                <p className="text-[9px] font-bold text-[#FFBF00]">{p.harga_estimasi && !isNaN(Number(p.harga_estimasi)) ? formatCurrency(p.harga_estimasi) : p.harga_estimasi}</p>
                                            </m.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM CONTENT SECTION */}
                <div className="max-w-7xl mx-auto px-6 mt-20 space-y-24">
                    {/* Description Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Deskripsi Produk</h2>
                        </div>
                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 text-slate-600 text-lg leading-relaxed font-medium max-w-4xl">
                            {product.deskripsi}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kualitas</p>
                                <p className="text-sm font-bold text-[#0A1128]">Terverifikasi Tamuu</p>
                            </div>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Respon</p>
                                <p className="text-sm font-bold text-[#0A1128]">Vendor Responsif</p>
                            </div>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                <Star className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                                <p className="text-sm font-bold text-[#0A1128]">Pilihan Terpercaya</p>
                            </div>
                        </div>
                    </div>

                    {/* SMART RECOMMENDATIONS SECTION */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Saran Produk Sejenis</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {recommendations.slice(0, 4).map((p: any) => (
                                <m.div
                                    key={p.id}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/shop/${p.merchant_slug}/${p.id}`)}
                                    className="group cursor-pointer bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all relative"
                                >
                                    <div className="aspect-[4/5] overflow-hidden">
                                        <img src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.nama_produk} />
                                    </div>
                                    
                                    {/* Small Merchant Floating Initial/Logo */}
                                    <div className="absolute top-4 left-4 w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-md z-10 bg-white">
                                        <img 
                                            src={p.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.nama_toko}`} 
                                            className="w-full h-full object-cover" 
                                            alt="M" 
                                        />
                                    </div>

                                    <div className="p-6 space-y-2">
                                        <p className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest truncate">{p.nama_toko}</p>
                                        <h4 className="text-sm font-black text-[#0A1128] uppercase truncate group-hover:text-[#FFBF00] transition-colors">{p.nama_produk}</h4>
                                        <p className="text-lg font-black text-[#0A1128] tracking-tight">{p.harga_estimasi && !isNaN(Number(p.harga_estimasi)) ? formatCurrency(p.harga_estimasi) : p.harga_estimasi}</p>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                    </div>
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
