import React, { useRef, useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Store, MapPin, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopDirectory, useRandomProducts } from '../../hooks/queries/useShop';
import { shop } from '../../lib/api';
import { ProductCard } from '../Shop/ProductCard';

const ShopSection: React.FC = () => {
    const navigate = useNavigate();
    const { data: merchants, isLoading: isLoadingMerchants } = useShopDirectory();
    const { data: randomProducts, isLoading: isLoadingRandom } = useRandomProducts();
    
    const [featuredAds, setFeaturedAds] = useState<any[]>([]);
    const [isLoadingAds, setIsLoadingAds] = useState(true);

    const vendorScrollRef = useRef<HTMLDivElement | null>(null);
    const productScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const ads = await shop.getAds('FEATURED_PRODUCT_LANDING');
                setFeaturedAds(ads || []);
            } catch (error) {
                console.error('Failed to fetch featured landing ads', error);
            } finally {
                setIsLoadingAds(false);
            }
        };
        fetchAds();
    }, []);

    // Take top 6 merchants for the landing page
    const displayedMerchants = merchants?.slice(0, 6) || [];
    
    // Determine displayed products (Ads or Random)
    const displayedProducts = featuredAds.length > 0 
        ? featuredAds.slice(0, 10).map(ad => ({
            id: ad.id,
            nama_produk: ad.title,
            images: [{ image_url: ad.image_url }],
            harga_estimasi: 'Sponsor',
            nama_toko: 'Promoted',
            merchant_slug: 'admin',
            slug: '',
            url: ad.link_url || '#',
            isAd: true,
            is_admin_listing: true,
            kategori_produk: 'Iklan',
            kota: 'Nasional'
        }))
        : (randomProducts?.slice(0, 10) || []);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section id="shop" className="max-w-7xl mx-auto px-6 py-24 my-12">
            
            {/* FEATURED PRODUCTS SECTION */}
            <div className="mb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Tamuu Shop.</h2>
                        <p className="text-slate-500 max-w-xl font-medium leading-relaxed">
                            Pilihan produk terbaik dan eksklusif untuk melengkapi kebutuhan acara Anda.
                        </p>
                    </div>

                    <Link
                        to="/shop"
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-[#0A1128] text-white rounded-2xl font-bold hover:bg-[#152042] transition-all flex-shrink-0 z-20"
                    >
                        Lihat Semua
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="relative group">
                    <button 
                        onClick={() => scroll(productScrollRef, 'left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[#0A1128] hover:bg-[#0A1128] hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div 
                        ref={productScrollRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {isLoadingAds || (featuredAds.length === 0 && isLoadingRandom) ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="min-w-[195px] h-[380px] bg-slate-100 animate-pulse rounded-3xl flex-shrink-0 snap-start" />
                            ))
                        ) : (
                            displayedProducts.map((product: any, index: number) => (
                                <div key={product.id || index} className="snap-start flex-shrink-0 flex items-stretch">
                                    <ProductCard product={product} navigate={navigate} />
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={() => scroll(productScrollRef, 'right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[#0A1128] hover:bg-[#0A1128] hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>


            {/* VENDOR SECTION */}
            <div className="bg-[#FBFBFB] rounded-[48px] p-8 md:p-12 border border-slate-100 shadow-sm relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Tamuu Vendor.</h2>
                        <p className="text-slate-500 max-w-xl font-medium leading-relaxed">
                            Temukan ribuan vendor pilihan dari MUA, Fotografer, hingga Venue terbaik untuk menyempurnakan momen spesial Anda.
                        </p>
                    </div>

                    <Link
                        to="/shop"
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-[#0A1128] text-white rounded-2xl font-bold hover:bg-[#152042] transition-all flex-shrink-0 z-20"
                    >
                        Lihat Semua
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="relative group">
                    <button 
                        onClick={() => scroll(vendorScrollRef, 'left')}
                        className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-6 w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div 
                        ref={vendorScrollRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 pt-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {isLoadingMerchants ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="min-w-[320px] h-72 bg-slate-100 animate-pulse rounded-3xl flex-shrink-0 snap-center" />
                            ))
                        ) : (
                            displayedMerchants.map((merchant: any, index: number) => (
                                <m.div
                                    key={merchant.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    onClick={() => navigate(`/shop/${merchant.slug}`)}
                                    className="min-w-[320px] md:min-w-[380px] group bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl hover:border-[#FFBF00]/30 transition-all duration-500 cursor-pointer flex-shrink-0 snap-center relative"
                                >
                                    {/* Landscape Banner */}
                                    <div className="h-28 md:h-32 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                        {merchant.banner_url ? (
                                            <img src={merchant.banner_url} alt={merchant.nama_toko} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                    
                                    {/* Merchant Logo */}
                                    <div className="absolute top-20 md:top-24 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg z-10 transition-transform duration-500 group-hover:scale-105">
                                        <img 
                                            src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`} 
                                            className="w-full h-full object-cover" 
                                            alt="Logo"
                                        />
                                    </div>

                                    <div className="px-6 md:px-8 pt-12 md:pt-14 pb-6 md:pb-8 flex flex-col flex-1 bg-white">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-base md:text-xl font-black text-[#0A1128] truncate flex-1 min-w-0 tracking-tight leading-none group-hover:text-[#FFBF00] transition-colors">{merchant.nama_toko}</h3>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[10px] md:text-[11px] font-bold text-[#FFBF00] uppercase tracking-[0.2em]">{merchant.nama_kategori || merchant.category_name || 'Professional Vendor'}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                                                </div>
                                                <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">
                                                    {merchant.kota ? merchant.kota.replace(/^(kota|kab\.)\s+/gi, '') : 'Nasional'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </m.div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={() => scroll(vendorScrollRef, 'right')}
                        className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-6 w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-8 text-center lg:hidden">
                    <Link
                        to="/shop"
                        className="w-full py-4 bg-[#0A1128] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                        Jelajahi Semua Vendor
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ShopSection;
