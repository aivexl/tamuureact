import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * [ENTERPRISE STANDARD] SEO-Optimized Breadcrumb Component
 * Features: JSON-LD Schema Integration, Semantic HTML, Mobile-First Scrollable UI
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tamuu.id';

  // 1. Construct Schema.org JSON-LD Data (CRITICAL FOR SEO RICH SNIPPETS)
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: `${BASE_URL}${item.href}`,
      })),
    ],
  };

  return (
    <>
      {/* 2. Inject JSON-LD quietly into the DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* 3. Semantic HTML5 & Mobile-First UI (Horizontal Scroll on Mobile) */}
      <nav aria-label="breadcrumb" className="w-full overflow-x-auto no-scrollbar py-2 mb-4">
        <ol className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
          <li>
            <Link
              href="/"
              className="flex items-center hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              aria-label="Beranda Tamuu"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.href} className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1 text-slate-400 flex-shrink-0" />
                {isLast ? (
                  <span className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-indigo-600 transition-colors truncate max-w-[150px] sm:max-w-xs">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}