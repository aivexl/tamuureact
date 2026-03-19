import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path: string;
}

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    
    // SEO & UX: Jangan tampilkan breadcrumbs di homepage
    if (location.pathname === '/') return null;

    const pathnames = location.pathname.split('/').filter((x) => x);

    // Initialize with Home as the root
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', path: '/' }
    ];

    let currentPath = '';

    pathnames.forEach((value) => {
        // Skip technical prefixes that shouldn't be labels
        if (['c', 'location', 'shop'].includes(value)) {
            currentPath += `/${value}`;
            return;
        }

        currentPath += `/${value}`;
        
        // Format label: dash to space & capitalize
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
            "item": `https://tamuu.id${crumb.path === '/' ? '' : crumb.path}`
        }))
    };

    return (
        <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 overflow-x-auto no-scrollbar py-2">
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
            
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                    {index > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-200 shrink-0" />}
                    <Link
                        to={crumb.path}
                        className={`whitespace-nowrap transition-colors flex items-center gap-1 ${
                            index === breadcrumbs.length - 1 
                            ? 'text-[#FFBF00]' 
                            : 'hover:text-[#0A1128]'
                        }`}
                    >
                        {index === 0 ? (
                            <Home className="w-3 h-3" />
                        ) : (
                            crumb.label
                        )}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
};
