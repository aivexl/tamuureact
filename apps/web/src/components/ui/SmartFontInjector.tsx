import React, { useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { CORE_FONTS, getGoogleFontsUrl } from '@/lib/fonts';

/**
 * SmartFontInjector
 * Analyzes the current invitation/display state and injects ONLY the required Google Fonts.
 * This prevents massive URL overhead and ensures font consistency between Editor and Preview.
 */
export const SmartFontInjector: React.FC = () => {
    const { sections, orbit } = useStore();

    // 1. Extract all font families used in the current project
    const requestedFonts = useMemo(() => {
        const fontSet = new Set<string>();

        // Always include core branding fonts
        CORE_FONTS.forEach(font => fontSet.add(font));

        // Scan sections
        sections.forEach(section => {
            (section.elements || []).forEach(element => {
                if (element.textStyle?.fontFamily) {
                    fontSet.add(element.textStyle.fontFamily);
                }
            });
        });

        // Scan orbit wings
        const scanOrbit = (elements?: any[]) => {
            (elements || []).forEach(element => {
                if (element.textStyle?.fontFamily) {
                    fontSet.add(element.textStyle.fontFamily);
                }
            });
        };

        scanOrbit(orbit.left.elements);
        scanOrbit(orbit.right.elements);

        return Array.from(fontSet);
    }, [sections, orbit]);

    // 2. Inject Google Fonts Link Tag
    useEffect(() => {
        if (requestedFonts.length === 0) return;

        const url = getGoogleFontsUrl(requestedFonts);
        console.log('[SmartFontInjector] Injecting optimized fonts:', requestedFonts.join(', '));

        // Create or Update link tag
        let link = document.getElementById('tamuu-dynamic-fonts') as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.id = 'tamuu-dynamic-fonts';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        link.href = url;

        // Cleanup (optional - typically better to keep them if they are in the editor)
        // return () => {
        //     // document.head.removeChild(link);
        // };
    }, [requestedFonts]);

    return null; // Component renders no UI
};
