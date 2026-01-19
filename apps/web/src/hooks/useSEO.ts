import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    noindex?: boolean;
}

export const useSEO = ({ title, description, image, noindex = false }: SEOProps) => {
    useEffect(() => {
        // Set document title
        const fullTitle = `${title} | Tamuu`;
        if (document.title !== fullTitle) {
            document.title = fullTitle;
        }

        // Helper to sync meta tags
        const syncMeta = (property: string, content: string, isProperty = false) => {
            const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                if (isProperty) element.setAttribute('property', property);
                else element.setAttribute('name', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Standard Meta
        syncMeta('description', description);

        // OpenGraph (Social Media)
        syncMeta('og:title', fullTitle, true);
        syncMeta('og:description', description, true);
        if (image) syncMeta('og:image', image, true);

        // Twitter
        syncMeta('twitter:card', 'summary_large_image');
        syncMeta('twitter:title', fullTitle);
        syncMeta('twitter:description', description);
        if (image) syncMeta('twitter:image', image);

        // Crawler Blocking (SEO & AI)
        if (noindex) {
            // Standard Search Engines
            syncMeta('robots', 'noindex, nofollow, noarchive');

            // AI Crawlers (GPTBot, CCBot, Google-Extended, etc.)
            syncMeta('ai-robots', 'noindex, nofollow');
        } else {
            // Remove if exists
            document.querySelector('meta[name="robots"]')?.remove();
            document.querySelector('meta[name="ai-robots"]')?.remove();
        }

    }, [title, description, image, noindex]);
};
