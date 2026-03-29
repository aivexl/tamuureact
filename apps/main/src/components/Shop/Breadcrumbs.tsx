"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
    const pathname = usePathname();
    
    if (pathname === '/') return null;

    const pathnames = pathname.split('/').filter((x) => x);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathnames.forEach((value) => {
        if (['c', 'location', 'shop'].includes(value)) {
            currentPath += `/${value}`;
            return;
        }
        currentPath += `/${value}`;
        const label = value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        breadcrumbs.push({ label, path: currentPath });
    });

    return (
        <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 overflow-x-auto no-scrollbar py-2">
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                    {index > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-200 shrink-0" />}
                    <Link
                        href={crumb.path}
                        className={`whitespace-nowrap transition-colors flex items-center gap-1 ${
                            index === breadcrumbs.length - 1 
                            ? 'text-[#FFBF00]' 
                            : 'hover:text-[#0A1128]'
                        }`}
                    >
                        {index === 0 ? <Home className="w-3 h-3" /> : crumb.label}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
};
