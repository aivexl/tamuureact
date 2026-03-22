import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    ShoppingBag,
    Map as MapIcon,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { useStorefront, useTrackInteraction } from '../../hooks/queries/useShop';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useStore } from '../../store/useStore';
import { useSEO } from '../../hooks/useSEO';
import { StarRating } from '../../components/Shop/StarRating';
import { ProductCard } from '../../components/Shop/ProductCard';
import { Footer } from '../../components/Layout/Footer';
import { Navbar } from '../../components/Layout/Navbar';
import { ShareModal } from '../../components/Modals/ShareModal';
import { VendorContactCard } from '../../components/Shop/VendorContactCard';
import { AnimatedCopyIcon } from '../../components/ui/AnimatedCopyIcon';

export const StorefrontPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
    const { user, token, isAuthenticated, logout } = useStore();

    const { data, isLoading } = useStorefront(slug || '', token || undefined);
    const track = useTrackInteraction();

    const vendor = data?.vendor;
    const products = data?.products || [];
    const contacts = data?.contacts || {};

    useSEO({
        title: vendor ? `${vendor.nama_toko} | Tamuu Shop` : 'Storefront - Tamuu Shop',
        description: vendor?.deskripsi || 'Kunjungi toko vendor terbaik di Tamuu Shop.'
    });

    useEffect(() => {
        if (vendor?.id) {
            track.mutate({ vendorId: vendor.id, actionType: 'VIEW_PROFILE' });
        }
    }, [vendor?.id]);

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            if (sortBy === 'popular') {
                const aPop = (a.wishlist_count || 0) + (a.review_count || 0);
                const bPop = (b.wishlist_count || 0) + (b.review_count || 0);
                return bPop - aPop;
            }
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }, [products, sortBy]);

    if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><PremiumLoader color="#0A1128" /></div>;
    if (!vendor) return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0A1128]">
        <h2 className="text-2xl font-black mb-4">Toko Tidak Ditemukan</h2>
        <button onClick={() => navigate('/shop')} className="text-[#FFBF00] font-bold">Kembali ke Direktori</button>
    </div>;

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            <Navbar />

            <main className="pt-[140px] md:pt-40 pb-40">
                {/* COMPACT PREMIUM BANNER */}
                <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-6">
                    <div className="relative h-48 md:h-72 w-full overflow-hidden sm:rounded-[2.5rem] bg-slate-100 border border-slate-100/50 group shadow-sm">
                        {vendor.banner_url ? (
                            <img
                                src={vendor.banner_url}
                                alt="Banner"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#0A1128]" />
                        )}
                    </div>
                </div>

                {/* PROFILE HUB */}
                <div className="max-w-7xl mx-auto px-6 -mt-16 md:-mt-20 relative z-10">
                    <div className="flex flex-col items-center sm:items-start gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-[6px] md:border-[10px] border-white overflow-hidden shadow-2xl bg-white transition-transform duration-500 group-hover:scale-[1.02]">
                                <img
                                    src={vendor.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.nama_toko}`}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 text-center sm:text-left w-full">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0A1128] italic uppercase leading-none">{vendor.nama_toko}</h2>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <StarRating 
                                    rating={vendor.avg_rating || 0} 
                                    count={vendor.review_count || 0} 
                                    size={22} 
                                />
                                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                    {vendor.kota || 'Nasional'}
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <ShoppingBag className="w-4 h-4 text-[#FFBF00]" />
                                    {products.length} Katalog Produk
                                </div>
                            </div>

                            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium mx-auto sm:mx-0 pt-2 text-center sm:text-left">
                                {vendor.deskripsi}
                            </p>
                        </div>

                        {/* BOTTOM GRID: Contact + Maps (Identical to Product Detail) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mt-8">
                            <div className="lg:col-span-7">
                                <VendorContactCard 
                                    vendor={vendor}
                                    contacts={contacts}
                                    isAuthenticated={isAuthenticated}
                                    navigate={navigate}
                                    track={track}
                                />
                            </div>
                            <div className="lg:col-span-5 flex flex-col">
                                <m.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-1.5 bg-[#FFBF00] rounded-full" />
                                            <h2 className="text-xl font-black uppercase tracking-tighter text-[#0A1128]">Alamat Lengkap</h2>
                                        </div>
                                        {contacts.alamat && (
                                            <div className="p-1 bg-slate-50 hover:bg-[#FFBF00]/10 rounded-2xl transition-all">
                                                <AnimatedCopyIcon text={contacts.alamat} size={20} className="text-slate-400 hover:text-[#0A1128]" successMessage="Alamat disalin!" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        {contacts.alamat ? (
                                            <div className="space-y-4">
                                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <p className="text-slate-600 text-[11px] font-normal leading-relaxed uppercase tracking-tight">
                                                        {contacts.alamat}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                                    {vendor.kota || "Lokasi Terverifikasi"}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 space-y-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                                    <MapPin className="w-6 h-6 text-slate-200" />
                                                </div>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Alamat belum tersedia</p>
                                            </div>
                                        )}
                                    </div>

                                    {contacts.google_maps_url && (
                                        <a 
                                            href={contacts.google_maps_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full h-14 bg-[#0A1128] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                                        >
                                            <MapIcon className="w-4 h-4 text-[#FFBF00]" />
                                            Buka Di Google Maps
                                        </a>
                                    )}
                                </m.div>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCT CATALOG */}
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
                                <button 
                                    onClick={() => setSortBy('latest')}
                                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'latest' ? 'bg-white shadow-sm text-[#0A1128]' : 'text-slate-400 hover:text-[#0A1128]'}`}
                                >
                                    Terbaru
                                </button>
                                <button 
                                    onClick={() => setSortBy('popular')}
                                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'popular' ? 'bg-white shadow-sm text-[#0A1128]' : 'text-slate-400 hover:text-[#0A1128]'}`}
                                >
                                    Populer
                                </button>
                            </div>
                        </div>

                        {sortedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-8">
                                {sortedProducts.map((product: any) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={{
                                            ...product,
                                            vendor_slug: slug,
                                            nama_toko: vendor.nama_toko
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

            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={vendor.nama_toko}
                url={window.location.href}
                type="store"
            />
        </div>
    );
};

export default StorefrontPage;
