"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Container } from '@/components/ui/Container';
import { Breadcrumb } from '../Breadcrumb';
import { ProductCard } from '@/components/Shop/ProductCard';
import { API_BASE } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    const { data: searchData, error: searchError } = useSWR(
        query ? `${API_BASE}/api/search?q=${encodeURIComponent(query)}` : null,
        fetcher
    );

    const { data: featuredData, error: featuredError } = useSWR(
        !searchData && query ? `${API_BASE}/api/shop/products/featured` : null,
        fetcher
    );

    const isLoading = !searchData && !searchError && query;
    const isFeaturedLoading = !featuredData && !featuredError && !searchData && query;

    const results = searchData?.results;
    const featuredProducts = featuredData?.results;

    const breadcrumbItems = [
        { name: 'Home', href: '/' },
        { name: 'Search', href: '/search' },
        { name: query || 'All', href: `/search?q=${query}` }
    ];

    return (
        <main className="flex-1 bg-gray-50">
            <Container className="py-8">
                <Breadcrumb items={breadcrumbItems} />
                <div className="mt-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {query ? `Search results for "${query}"` : 'Search'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {results && results.length > 0
                            ? `Found ${results.length} results for your search.`
                            : `No results found for "${query}". Showing featured products instead.`}
                    </p>
                </div>

                <div className="mt-8">
                    {isLoading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                                    <div className="w-full h-40 bg-gray-200 rounded-md"></div>
                                    <div className="mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {results && results.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {results && results.length === 0 && featuredProducts && (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                     {(searchError || (results && results.length === 0 && featuredError)) && (
                        <div className="text-center py-10">
                            <p className="text-red-500">Could not fetch products. Please try again later.</p>
                        </div>
                    )}
                </div>
            </Container>
        </main>
    );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
