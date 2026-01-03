import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
}

export const useSEO = ({ title, description }: SEOProps) => {
    useEffect(() => {
        // Set document title
        const fullTitle = `${title} | Tamuu`;
        if (document.title !== fullTitle) {
            document.title = fullTitle;
        }

        // Set meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

    }, [title, description]);
};
