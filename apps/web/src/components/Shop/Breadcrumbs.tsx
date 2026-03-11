import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path: string;
}

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Shop', path: '/' }
    ];

    let currentPath = '';

    pathnames.forEach((value, index) => {
        // Skip prefixes that shouldn't be labels
        if (value === 'c') {
            currentPath += '/c';
            return;
        }
        if (value === 'location') {
            currentPath += '/location';
            return;
        }
        if (value === 'shop') {
            currentPath += '/shop';
            return;
        }

        currentPath += `/${value}`;
        
        // Format label: ganti dash dengan spasi & capitalize
        const label = value
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

        breadcrumbs.push({ label, path: currentPath });
    });

    // Generate JSON-LD Schema
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.label,
            "item": `https://tamuu.id${crumb.path}`
        }))
    };

    return (
        <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 overflow-x-auto no-scrollbar py-2">
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
            
            <Link to="/" className="hover:text-[#0A1128] transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
            </Link>

            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                    <ChevronRight className="w-2.5 h-2.5 text-slate-200 shrink-0" />
                    <Link
                        to={crumb.path}
                        className={`whitespace-nowrap transition-colors ${
                            index === breadcrumbs.length - 1 
                            ? 'text-[#FFBF00]' 
                            : 'hover:text-[#0A1128]'
                        }`}
                    >
                        {crumb.label}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
};
