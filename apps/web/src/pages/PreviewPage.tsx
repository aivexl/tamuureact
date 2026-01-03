import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PreviewView } from '@/components/Preview/PreviewView';
import { useStore, Section, Layer } from '@/store/useStore';
import { templates } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { generateId } from '@/lib/utils';

export const PreviewPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const hasHydrated = useStore(state => state.hasHydrated);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        if (!slug) return;

        const loadData = async () => {
            if (slug === 'draft') {
                console.log('[PreviewPage] Mode: Draft. hasHydrated:', hasHydrated);
                if (hasHydrated) {
                    setIsLoading(false);
                }
                return;
            }

            console.log('[PreviewPage] Mode: Cloud. Slug:', slug);
            setIsLoading(true);

            try {
                let data = null;
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

                // SIMPLIFIED: Only fetch from templates table
                // This prevents data mismatch issues from stale invitations entries
                try {
                    // API handles both ID and slug lookup
                    data = await templates.get(slug);
                } catch (e) {
                    data = null;
                }


                if (data) {
                    console.log('[PreviewPage] ✅ Data Loaded from TEMPLATES table:', data.name || data.id);

                    // CTO ENTERPRISE GUARD: URL Normalization
                    // If accessed via UUID but a slug exists, update the URL for a cleaner UX
                    if (isUuid && data.slug && data.slug !== slug) {
                        console.log(`[PreviewPage] Normalizing URL: ${slug} -> ${data.slug}`);
                        window.history.replaceState(null, '', `/preview/${data.slug}`);
                    }

                    const rawSections = Array.isArray(data.sections) ? (data.sections as any[]) : [];
                    const rawLayers = Array.isArray(data.layers) ? (data.layers as Layer[]) : [];

                    const validSections = rawSections.map(s => ({
                        ...s,
                        id: s.id || generateId('section'),
                        elements: s.elements || rawLayers.filter(l => (l as any).sectionId === s.id) || []
                    }));

                    // CTO DEBUG: Log all elements with their image URLs
                    validSections.forEach((section, index) => {
                        console.log(`[PreviewPage] Section ${index} has ${section.elements?.length || 0} elements:`);
                        section.elements?.forEach((el: any) => {
                            console.log(`  - ${el.type}: ${el.name || el.id}, imageUrl: ${el.imageUrl?.split('/').pop() || 'N/A'}`);
                        });
                    });

                    useStore.setState({
                        sections: validSections,
                        layers: rawLayers,
                        zoom: data.zoom || 1,
                        pan: data.pan || { x: 0, y: 0 },
                        slug: data.slug || '',
                        projectName: data.name || '',
                        activeSectionId: validSections[0]?.id || null,
                        orbit: data.orbit || useStore.getState().orbit,
                        selectedLayerId: null
                    });
                } else {
                    console.warn('[PreviewPage] No data found for slug:', slug);
                }
            } catch (err) {
                console.error('[PreviewPage] Catch Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [slug]); // Only slug needed - hasHydrated is checked inside for Draft mode only

    if (isLoading) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-premium-accent animate-spin" />
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Loading Invitation...</p>
                </div>
            </div>
        );
    }

    const handleClose = () => {
        window.close();
    };

    return (
        <div className="w-full h-screen bg-black">
            <PreviewView
                isOpen={true}
                onClose={handleClose}
            />
        </div>
    );
};
