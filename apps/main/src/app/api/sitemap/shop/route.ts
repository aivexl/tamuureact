import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id';
const BASE_URL = 'https://tamuu.id';

export async function GET() {
  try {
    // Fetch categories and products for dynamic sitemap
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${API_BASE}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/api/shop/products/discovery`, { next: { revalidate: 3600 } })
    ]);

    const categories = await categoriesRes.json();
    const productsData = await productsRes.json();
    const products = productsData.products || productsData.items || [];

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // 1. Main Shop Page
    sitemap += `
  <url>
    <loc>${BASE_URL}/shop</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // 2. Categories
    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        sitemap += `
  <url>
    <loc>${BASE_URL}/shop/${cat.slug_kategori || cat.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    // 3. Products
    if (Array.isArray(products)) {
      products.forEach((prod: any) => {
        // Use the product slug if available, otherwise fallback
        const productSlug = prod.slug || prod.id;
        const categorySlug = prod.category_slug || prod.slug_kategori || 'product';
        
        sitemap += `
  <url>
    <loc>${BASE_URL}/shop/${categorySlug}/${productSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    sitemap += '\n</urlset>';

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
      }
    });
  } catch (error) {
    console.error('[Sitemap Error] Failed to generate shop sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}