import React, { useRef, useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Store, MapPin, ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopDirectory, useRandomProducts } from '../../hooks/queries/useShop';
import { shop } from '../../lib/api';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { ProductCard } from '../Shop/ProductCard';
import { StarRating } from '../Shop/StarRating';
import { SpecialAdsScroller } from '../Shop/SpecialAdsScroller';

const ShopSection: React.FC = () => {
    const navigate = useNavigate();
    const { data: vendors = [] } = useShopDirectory();
    const { data: randomProducts = [], isLoading: isLoadingRandom } = useRandomProducts();
    
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

    // Take curated vendors for the landing page
    const curatedVendors = vendors?.filter((m: any) => m.is_landing_featured === 1) || [];
    const displayedVendors = curatedVendors.length > 0 ? curatedVendors.slice(0, 6) : (vendors?.slice(0, 6) || []);
    
    // Determine displayed products (Curated or Random)
    const curatedProducts = randomProducts?.filter((p: any) => p.is_landing_featured === 1) || [];
    const displayedProducts = curatedProducts.length > 0 
        ? curatedProducts.slice(0, 10)
        : (randomProducts?.slice(0, 10) || []);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section id="shop" className="max-w-7xl mx-auto py-12">
            
            {/* DYNAMIC ADS SECTION: Special For You */}
            <SpecialAdsScroller />

            <div className="px-6 py-12">
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
                            {displayedVendors.map((vendor: any) => (
                                <div key={vendor.id} className="snap-start flex-shrink-0">
                                    <VendorCard vendor={vendor} navigate={navigate} />
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => scroll(vendorScrollRef, 'right')}
                            className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-6 w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// FULLY RESTORED VENDOR CARD FROM b3edcb0
const VendorCard: React.FC<{ vendor: any, navigate: any }> = ({ vendor, navigate }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
                const targetSlug = vendor.slug === 'admin' ? 'official' : vendor.slug;
                navigate(`/shop/${targetSlug}`);
            }}
            className="group bg-white border border-slate-50 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all cursor-pointer hover:border-[#0A1128]/20 relative w-full min-w-[280px]"
        >
            <div className="h-32 md:h-36 bg-slate-100 relative overflow-hidden">
                {vendor.banner_url ? (
                    <img src={vendor.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Vendor Logo */}
            <div className="absolute top-20 md:top-24 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg z-10 transition-transform duration-500 group-hover:scale-105">
                <img 
                    src={vendor.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.nama_toko}`} 
                    className="w-full h-full object-cover" 
                    alt="Logo"
                />
            </div>

            <div className="px-6 md:px-8 pt-12 md:pt-14 pb-6 md:pb-8 flex flex-col flex-1 bg-white">
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-base md:text-xl font-black text-[#0A1128] truncate flex-1 min-w-0 tracking-tight leading-none">{vendor.nama_toko}</h3>
                    {vendor.wishlist_count > 0 && (
                        <div className="flex items-center gap-1 text-[#FFBF00] flex-shrink-0 bg-[#FFBF00]/10 px-2.5 py-1 rounded-lg border border-[#FFBF00]/20">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="text-[9px] md:text-[10px] font-black">{formatAbbreviatedNumber(vendor.wishlist_count)}</span>
                        </div>
                    )}
                </div>

                <StarRating 
                    rating={vendor.avg_rating || 0} 
                    count={vendor.review_count || 0} 
                    size={12} 
                    className="mb-3"
                />

                <div className="flex flex-col gap-3">
                    <p className="text-[10px] md:text-[11px] font-bold text-[#FFBF00] uppercase tracking-[0.2em]">{vendor.nama_kategori || 'Professional Vendor'}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">
                            {vendor.kota ? vendor.kota.replace(/^(kota|kab\.)\s+/gi, '') : 'Nasional'}
                        </p>
                    </div>
                </div>
            </div>
        </m.div>
    );
};

export default ShopSection;
