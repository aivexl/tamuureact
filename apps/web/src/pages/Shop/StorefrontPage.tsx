import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Share2,
    Verified,
    Lock,
    MapPin,
    MessageCircle,
    Instagram,
    Facebook,
    Globe,
    Music2,
    ChevronRight,
    ShoppingBag,
    Tag,
    Heart,
    LayoutGrid,
    Search,
    ChevronDown,
    User as UserIcon,
    LayoutDashboard,
    CreditCard,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import { useStorefront, useTrackInteraction } from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useStore } from '../../store/useStore';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { StarRating } from '../../components/Shop/StarRating';
import { ProductCard } from '../../components/Shop/ProductCard';
import { Footer } from '../../components/Layout/Footer';
import { Navbar } from '../../components/Layout/Navbar';

export const StorefrontPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user, token, isAuthenticated, logout } = useStore();

    const { data, isLoading } = useStorefront(slug || '', token || undefined);
    const track = useTrackInteraction();

    const merchant = data?.merchant;
    const products = data?.products || [];
    const contacts = data?.contacts || {};

    useSEO({
        title: merchant ? `${merchant.nama_toko} | Tamuu Shop` : 'Storefront - Tamuu Shop',
        description: merchant?.deskripsi || 'Kunjungi toko vendor terbaik di Tamuu Shop.'
    });

    useEffect(() => {
        if (merchant?.id) {
            track.mutate({ merchantId: merchant.id, actionType: 'VIEW_PROFILE' });
        }
    }, [merchant?.id]);

    if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><PremiumLoader color="#0A1128" /></div>;
    if (!merchant) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0A1128]">
        <h2 className="text-2xl font-black mb-4">Toko Tidak Ditemukan</h2>
        <button onClick={() => navigate('/shop')} className="text-[#FFBF00] font-bold">Kembali ke Direktori</button>
    </div>;

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            <Navbar />

            <main className="pt-[64px] pb-40">
                {/* COMPACT PREMIUM BANNER (Apple Inspired) */}
                <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-6">
                    <div className="relative h-48 md:h-72 w-full overflow-hidden sm:rounded-[2.5rem] bg-slate-100 border border-slate-100/50 group shadow-sm">
                        {merchant.banner_url ? (
                            <img
                                src={merchant.banner_url}
                                alt="Banner"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#0A1128]" />
                        )}
                        {/* NO GRADIENT OVERLAY as requested */}
                    </div>
                </div>

                {/* PROFILE HUB: Centered on Mobile, Aligned on Desktop */}
                <div className="max-w-7xl mx-auto px-6 -mt-16 md:-mt-20 relative z-10">
                    <div className="flex flex-col items-center sm:items-start gap-8">
                        {/* Logo Card */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-[6px] md:border-[10px] border-white overflow-hidden shadow-2xl bg-white transition-transform duration-500 group-hover:scale-[1.02]">
                                <img
                                    src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-4 text-center sm:text-left w-full">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0A1128] italic uppercase leading-none">{merchant.nama_toko}</h2>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <StarRating 
                                    rating={merchant.avg_rating || 0} 
                                    count={merchant.review_count || 0} 
                                    size={22} 
                                />
                                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                    {merchant.kota || 'Nasional'}
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <ShoppingBag className="w-4 h-4 text-[#FFBF00]" />
                                    {products.length} Katalog Produk
                                </div>
                            </div>

                            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium mx-auto sm:mx-0 pt-2 text-center sm:text-left">
                                {merchant.deskripsi}
                            </p>
                        </div>

                        {/* SEAMLESS CONTACT CARD (Apple Glass Style) */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-3xl bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    <Lock className={`w-7 h-7 ${contacts.isLocked ? 'text-[#FFBF00]' : 'text-emerald-500'}`} />
                                </div>
                                <div className="space-y-1.5 text-center sm:text-left">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Secure Merchant Contact</p>
                                    <p className="text-[#0A1128] font-mono text-xl tracking-tight font-black italic">
                                        {contacts.whatsapp}
                                    </p>
                                </div>
                            </div>

                            {contacts.isLocked ? (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto bg-[#0A1128] text-white text-[10px] font-black uppercase tracking-widest py-5 px-12 rounded-[1.5rem] transition-all active:scale-95 shadow-2xl shadow-indigo-100 hover:bg-black"
                                >
                                    Login to access
                                </button>
                            ) : (
                                <div className="flex flex-wrap justify-center sm:justify-end gap-3 w-full sm:w-auto">
                                    {contacts.whatsapp && (
                                        <a href={`https://wa.me/${contacts.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/20 transition-all flex items-center justify-center shadow-sm">
                                            <MessageCircle className="w-6 h-6" />
                                        </a>
                                    )}
                                    {contacts.instagram && (
                                        <a href={`https://instagram.com/${contacts.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-pink-500 hover:border-pink-500/20 transition-all flex items-center justify-center shadow-sm">
                                            <Instagram className="w-6 h-6" />
                                        </a>
                                    )}
                                    {contacts.website && (
                                        <a href={contacts.website.startsWith('http') ? contacts.website : `https://${contacts.website}`} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500/20 transition-all flex items-center justify-center shadow-sm">
                                            <Globe className="w-6 h-6" />
                                        </a>
                                    )}
                                    <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl text-[#FFBF00] hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all flex items-center justify-center shadow-sm">
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </m.div>
                    </div>

                    {/* PRODUCT CATALOG: Integrated Unified Component */}
                    <div className="mt-32">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div className="space-y-3 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <div className="h-6 w-1.5 bg-[#FFBF00] rounded-full" />
                                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-[#0A1128] italic uppercase">Katalog Produk</h3>
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Menampilkan {products.length} pilihan paket terbaik</p>
                            </div>
                            
                            <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit mx-auto md:mx-0">
                                <button className="px-6 py-2.5 bg-white shadow-sm rounded-xl text-[9px] font-black uppercase tracking-widest">Terbaru</button>
                                <button className="px-6 py-2.5 text-slate-400 hover:text-[#0A1128] rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Populer</button>
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-8">
                                {products.map((product: any) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={{
                                            ...product,
                                            merchant_slug: slug,
                                            nama_toko: merchant.nama_toko
                                        }} 
                                        navigate={navigate} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 space-y-6">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                                    <ShoppingBag className="w-10 h-10 text-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-[#0A1128]">Belum Ada Produk</p>
                                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto uppercase tracking-widest">Vendor belum menambahkan katalog aktif</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default StorefrontPage;
