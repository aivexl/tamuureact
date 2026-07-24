import React from 'react';
import { Metadata } from 'next';
import api from '@/lib/api';
import { MapPin, Star, Shield } from 'lucide-react';
import Link from 'next/link';
import { SEOListingFooter } from '@/components/Shop/SEOListingFooter';
import { ProductGrid } from '@/components/Shop/ProductGrid';
import { Container } from '@/components/ui/Container';

/**
 * TAMUU MATRIX SEO ENGINE v1.2
 * High-Performance Local Service Pages with Smart Global Fallback
 * Implementation: 30 Initial + 10 Increment Logic
 */

interface Props {
  params: Promise<{
    category: string;
    city: string;
  }>;
  searchParams: Promise<{
    intent?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category, city } = await params;
  const { intent = 'BEST' } = await searchParams;
  
  const seo = await api.cities.getNexusMetadata(category, city, intent);
  const cityName = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const categoryLabel = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: seo?.title || `${categoryLabel} Terbaik di ${cityName} | Tamuu`,
    description: seo?.meta_desc || `Cari dan temukan ${categoryLabel} profesional di ${cityName}. Daftar lengkap dengan harga, portofolio, dan ulasan asli dari pengantin.`,
    alternates: {
        canonical: `https://tamuu.id/katalog/${category}/${city}`
    }
  };
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { category, city } = await params;
  const { intent = 'BEST' } = await searchParams;

  // 1. Parallel Fetching for Speed (D1 Nexus)
  const [seo, allProductsRes] = await Promise.all([
    api.cities.getNexusMetadata(category, city, intent),
    fetch(`${api.API_BASE}/api/shop/products/discovery?limit=100`, { next: { revalidate: 1800 } }).then(r => r.json())
  ]);

  const categoryLabel = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const cityName = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const allProducts = allProductsRes?.products || [];

  // 2. Smart Filtering Logic
  // First, find products strictly in this category and city
  const localProducts = allProducts.filter((p: any) => {
    const matchesCat = p.kategori_produk?.toLowerCase().includes(category.replace(/-/g, ' '));
    const matchesCity = p.kota?.toLowerCase().includes(cityName.toLowerCase());
    return matchesCat && matchesCity;
  });

  // Fallback Logic: If no local products, use products from same category nationally
  const categoryProducts = localProducts.length > 0 ? localProducts : allProducts.filter((p: any) => 
    p.kategori_produk?.toLowerCase().includes(category.replace(/-/g, ' '))
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic SEO Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[#0A1128]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <nav className="flex items-center gap-2 text-indigo-300 text-[10px] mb-8 uppercase tracking-widest font-black">
              <Link href="/katalog" className="hover:text-white transition-colors">Katalog</Link>
              <span className="opacity-30">/</span>
              <span className="text-white">{categoryLabel}</span>
              <span className="opacity-30">/</span>
              <span className="text-white">{cityName}</span>
            </nav>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 uppercase italic tracking-tighter">
              {seo?.h1 || `${categoryLabel} Profesional di ${cityName}`}
            </h1>
            
            <p className="text-lg md:text-xl text-indigo-100/60 leading-relaxed mb-10 max-w-2xl font-medium">
              {seo?.intro_body || `Temukan daftar vendor ${categoryLabel} terbaik yang melayani wilayah ${cityName}. Bandingkan harga, lihat portofolio terbaru, dan hubungi langsung via WhatsApp.`}
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <Star className="w-3.5 h-3.5 text-[#FFBF00] fill-[#FFBF00]" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Rating 4.8+</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{cityName}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Listing Section with Smart Fallback (30+10 Logic) */}
      <section className="py-24 bg-white">
        <Container>
          <ProductGrid 
            products={localProducts}
            fallbackProducts={categoryProducts.length > 0 ? categoryProducts : allProducts}
            title={localProducts.length > 0 ? `Vendor di ${cityName}` : `Rekomendasi ${categoryLabel} Terpopuler`}
          />
        </Container>
      </section>

      {/* Trust & Conversion Section */}
      <section className="py-32 border-t border-slate-50 bg-slate-50/50">
        <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#0A1128] leading-tight mb-10 uppercase italic tracking-tighter">
                        Kenapa Mencari {categoryLabel} di Tamuu?
                    </h2>
                    <div className="space-y-10">
                        <div className="flex gap-8">
                            <div className="w-14 h-14 rounded-[1.25rem] bg-white shadow-xl shadow-indigo-500/5 border border-slate-100 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-[#0A1128] mb-2 text-lg uppercase tracking-tight">Vendor Terverifikasi</h4>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">Setiap vendor yang terdaftar di Tamuu melalui proses verifikasi identitas dan portofolio untuk menjamin keamanan transaksi Anda.</p>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <div className="w-14 h-14 rounded-[1.25rem] bg-white shadow-xl shadow-orange-500/5 border border-slate-100 flex items-center justify-center shrink-0">
                                <Star className="w-6 h-6 text-[#FFBF00]" />
                            </div>
                            <div>
                                <h4 className="font-black text-[#0A1128] mb-2 text-lg uppercase tracking-tight">Ulasan Jujur & Transparan</h4>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">Ulasan diberikan langsung oleh pelanggan yang telah menggunakan jasa vendor tersebut, memberikan Anda gambaran kualitas yang akurat.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0A1128] rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div className="relative z-10">
                        <div className="w-12 h-1 bg-[#FFBF00] mb-8 rounded-full" />
                        <h3 className="text-3xl md:text-4xl font-black mb-8 italic leading-tight tracking-tight">"Platform andalan untuk urusan pernikahan modern."</h3>
                        <p className="text-indigo-100/60 mb-10 leading-relaxed font-medium">Tamuu memudahkan saya menemukan MUA dan Fotografer yang sesuai budget tanpa harus ribet cari satu-satu di media sosial. Sangat membantu!</p>
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white/10"></div>
                            <div>
                                <p className="font-black uppercase tracking-widest text-xs">Andini Putri</p>
                                <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black mt-1">Happy Bride • Jakarta</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Decorative Elements */}
                    <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute top-10 right-10 w-20 h-20 border border-white/5 rounded-full"></div>
                </div>
            </div>
        </Container>
      </section>

      <SEOListingFooter />
    </div>
  );
}
