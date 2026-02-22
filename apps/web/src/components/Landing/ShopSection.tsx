import React from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Store, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShopDirectory } from '../../hooks/queries/useShop';

const ShopSection: React.FC = () => {
    const { data: merchants, isLoading } = useShopDirectory();

    // Take top 6 merchants for the landing page
    const featuredMerchants = merchants?.slice(0, 6) || [];

    return (
        <section id="shop" className="max-w-7xl mx-auto px-6 py-24 bg-[#FBFBFB] rounded-[48px] my-12 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFBF00]/10 text-[#0A1128] rounded-full text-xs font-black uppercase tracking-widest">
                        <Store className="w-3.5 h-3.5" />
                        Tamuu Shop Ecosystem
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Eksplorasi Vendor Terbaik.</h2>
                    <p className="text-slate-500 max-w-xl font-medium leading-relaxed">
                        Temukan ribuan vendor pilihan dari MUA, Fotografer, hingga Venue terbaik untuk menyempurnakan momen spesial Anda.
                    </p>
                </div>

                <Link
                    to="/shop"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-[#0A1128] text-white rounded-2xl font-bold hover:bg-[#152042] transition-all"
                >
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredMerchants.map((merchant: any, index: number) => (
                        <m.div
                            key={merchant.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <Link to={`/shop/${merchant.slug}`} className="block space-y-4">
                                {/* Merchant Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                        {merchant.logo_url ? (
                                            <img src={merchant.logo_url} alt={merchant.nama_toko} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#0A1128] font-bold text-xl uppercase">
                                                {merchant.nama_toko?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[#0A1128] truncate">{merchant.nama_toko}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{merchant.category_name || 'Vendor'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats & Badge */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1 text-[#FFBF00]">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-black text-[#0A1128]">4.9</span>
                                        <span className="text-[10px] text-slate-400 font-medium">(1.2k views)</span>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        Verified
                                    </div>
                                </div>
                            </Link>
                        </m.div>
                    ))}
                </div>
            )}

            <div className="mt-16 text-center lg:hidden">
                <Link
                    to="/shop"
                    className="w-full py-4 bg-[#0A1128] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                    Jelajahi Semua Vendor
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
    );
};

export default ShopSection;
