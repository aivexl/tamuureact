import React, { useRef, useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Store, MapPin, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopDirectory, useRandomProducts } from '../../hooks/queries/useShop';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

const ShopSection: React.FC = () => {
    const navigate = useNavigate();
    const { data: merchants = [] } = useShopDirectory();
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

    // Take curated merchants for the landing page
    const curatedMerchants = merchants?.filter((m: any) => m.is_landing_featured === 1) || [];
    const displayedMerchants = curatedMerchants.length > 0 ? curatedMerchants.slice(0, 6) : (merchants?.slice(0, 6) || []);
    
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
                        {displayedMerchants.map((merchant: any) => (
                            <div key={merchant.id} className="snap-start flex-shrink-0">
                                <MerchantCard merchant={merchant} navigate={navigate} />
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
        </section>
    );
};

// RESTORED PRODUCT CARD FROM b3edcb0
const ProductCard: React.FC<{ product: any, navigate: any }> = ({ product, navigate }) => (
    <div 
        onClick={() => {
            const mSlug = product.merchant_slug === 'admin' ? 'umum' : (product.merchant_slug || (product.is_admin_listing ? 'umum' : 'unknown'));
            const pSlug = product.slug || product.id;
            navigate(`/shop/s/${mSlug}/${pSlug}`);
        }}
        className="group bg-white border border-slate-50 rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all w-full md:w-[195px] flex flex-col"
    >
        <div className="aspect-square bg-slate-100 overflow-hidden">
            <img 
                src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt={product.nama_produk} 
            />
        </div>
        <div className="p-4 flex flex-col flex-1">
            <h4 className="text-[10px] font-black text-[#0A1128] uppercase line-clamp-2 mb-2 leading-tight flex-1">{product.nama_produk}</h4>
            <p className="text-[11px] font-black text-[#FFBF00]">{formatCurrency(product.harga_estimasi)}</p>
        </div>
    </div>
);

// RESTORED MERCHANT CARD FROM b3edcb0
const MerchantCard: React.FC<{ merchant: any, navigate: any }> = ({ merchant, navigate }) => (
    <div 
        onClick={() => navigate(`/shop/s/${merchant.slug}`)}
        className="bg-white border border-slate-50 rounded-[2rem] p-6 hover:shadow-xl transition-all cursor-pointer min-w-[240px]"
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-100">
                <img src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`} className="w-full h-full object-cover" alt={merchant.nama_toko} />
            </div>
            <div className="min-w-0">
                <h4 className="text-sm font-black text-[#0A1128] uppercase tracking-tight truncate">{merchant.nama_toko}</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{merchant.nama_kategori || 'Vendor'}</p>
            </div>
        </div>
    </div>
);

export default ShopSection;
