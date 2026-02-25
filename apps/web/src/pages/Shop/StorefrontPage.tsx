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
    Facebook,
    Globe,
    Music2,
    ChevronRight,
    ShoppingBag,
    Tag
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

    const handleProductClick = (productId: string) => {
        track.mutate({ merchantId: merchant.id, actionType: 'CLICK_PRODUCT', productId });
        navigate(`/shop/${slug}/${productId}`);
    };

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-6">
                <button
                    onClick={() => navigate('/shop')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#0A1128]" />
                </button>
                <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Brand Storefront</h1>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Share2 className="w-5 h-5 text-[#FFBF00]" />
                </button>
            </div>

            <main className="pb-32">
                {/* Hero Banner */}
                <div className="relative h-64 w-full overflow-hidden">
                    <img
                        src={merchant.banner_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                        alt="Banner"
                        className="w-full h-full object-cover grayscale-[10%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>

                {/* Profile Section */}
                <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                    <div className="flex flex-col items-start gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl border-8 border-white overflow-hidden shadow-2xl bg-white">
                                <img
                                    src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#FFBF00] text-[#0A1128] rounded-2xl p-2 border-4 border-white shadow-lg shadow-[#FFBF00]/10">
                                <Verified className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black tracking-tight text-[#0A1128]">{merchant.nama_toko}</h2>
                                <span className="text-[10px] font-black tracking-widest bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100 uppercase">
                                    Verified Vendor
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-lg font-medium">
                                {merchant.deskripsi}
                            </p>
                        </div>

                        {/* Curiosity Gap: Contact Card */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-2xl bg-slate-50 border border-slate-100 rounded-3xl p-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                                    <Lock className={`w-6 h-6 ${contacts.isLocked ? 'text-[#FFBF00]' : 'text-emerald-500'}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Official Contact</p>
                                    <p className="text-[#0A1128] font-mono text-lg tracking-tight font-bold">
                                        {contacts.whatsapp}
                                    </p>
                                </div>
                            </div>

                            {contacts.isLocked ? (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto bg-[#0A1128] text-white text-[10px] font-black uppercase tracking-widest py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-xl shadow-black/5"
                                >
                                    Login to reveal
                                </button>
                            ) : (
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    {contacts.whatsapp && (
                                        <a href={`https://wa.me/${contacts.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/20 transition-all flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5" />
                                        </a>
                                    )}
                                    {contacts.instagram && (
                                        <a href={`https://instagram.com/${contacts.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-pink-500 hover:border-pink-500/20 transition-all flex items-center justify-center">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {contacts.facebook && (
                                        <a href={contacts.facebook.startsWith('http') ? contacts.facebook : `https://${contacts.facebook}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600/20 transition-all flex items-center justify-center">
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    )}
                                    {contacts.tiktok && (
                                        <a href={`https://tiktok.com/${contacts.tiktok.startsWith('@') ? '' : '@'}${contacts.tiktok}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-black hover:border-black/20 transition-all flex items-center justify-center">
                                            <Music2 className="w-5 h-5" />
                                        </a>
                                    )}
                                    {contacts.website && (
                                        <a href={contacts.website.startsWith('http') ? contacts.website : `https://${contacts.website}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500/20 transition-all flex items-center justify-center">
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </m.div>
                    </div>

                    {/* Product Section */}
                    <div className="mt-24">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                Katalog Produk
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">{products.length}</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map((product: any) => (
                                <m.div
                                    key={product.id}
                                    whileHover={{ y: -8 }}
                                    className="bg-white border border-[#F1F5F9] rounded-[2rem] overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:border-[#FFBF00]/30"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-slate-50">
                                        <img
                                            src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80'}
                                            alt={product.nama_produk}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#FFBF00] transition-colors shadow-sm">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4 flex flex-1 flex-col font-sans">
                                        <div className="space-y-2">
                                            <h4 className="font-black text-[#0A1128] line-clamp-2 leading-tight group-hover:text-[#FFBF00] transition-colors uppercase tracking-tight">
                                                {product.nama_produk}
                                            </h4>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            {/* Price Row - Full Width to prevent truncation */}
                                            <div className="pt-2 border-t border-slate-50">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimasi Harga</p>
                                                <span className="text-[#0A1128] font-black text-xl tracking-tight block">
                                                    {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                                        ? formatCurrency(product.harga_estimasi) 
                                                        : (product.harga_estimasi || 'Tanyakan Harga')}
                                                </span>
                                            </div>

                                            {/* Meta Row - Below Price */}
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                {product.kategori_produk && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#FFBF00] bg-[#FFBF00]/5 px-2 py-1 rounded-md border border-[#FFBF00]/10">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {product.kategori_produk}
                                                    </span>
                                                )}
                                                {product.kota && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {product.kota.replace(/^(kota|kab\.)\s+/gi, '')}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleProductClick(product.id)}
                                                className="w-full border border-slate-100 group-hover:border-[#FFBF00] group-hover:bg-[#FFBF00] text-[#0A1128] transition-all py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                Lihat Detail
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </m.div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada produk yang tersedia</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StorefrontPage;
