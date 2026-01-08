import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PreviewView } from '@/components/Preview/PreviewView';
import { useStore, Layer } from '@/store/useStore';
import { templates, invitations } from '@/lib/api';
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
                let data: any = null;
                let source = '';
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

                // Try templates first, then invitations as fallback
                try {
                    data = await templates.get(slug);
                    source = 'templates';
                } catch (e) {
                    // Template not found, try invitations
                    try {
                        data = await invitations.get(slug);
                        source = 'invitations';
                        // Normalize orbit_layers to orbit for consistency
                        if (data && data.orbit_layers && !data.orbit) {
                            data.orbit = data.orbit_layers;
                        }
                    } catch (e2) {
                        data = null;
                    }
                }

                if (data) {
                    console.log(`[PreviewPage] ✅ Data Loaded from ${source.toUpperCase()}:`, data.name || data.id);

                    // URL Normalization: If accessed via UUID but a slug exists, update the URL
                    if (isUuid && data.slug && data.slug !== slug) {
                        console.log(`[PreviewPage] Normalizing URL: ${slug} -> ${data.slug}`);
                        window.history.replaceState(null, '', `/preview/${data.slug}`);
                    }

                    const rawSections = Array.isArray(data.sections) ? (data.sections as any[]) : [];
                    const rawLayers = Array.isArray(data.layers) ? (data.layers as Layer[]) : [];

                    const validSections = rawSections.map(s => ({
                        ...s,
                        id: s.id || generateId('section'),
                        elements: s.elements || rawLayers.filter((l: any) => l.sectionId === s.id) || []
                    }));

                    // Debug log elements
                    validSections.forEach((section, index) => {
                        console.log(`[PreviewPage] Section ${index} (${section.title || section.key}) has ${section.elements?.length || 0} elements`);
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
                        music: data.music || undefined,
                        id: data.id,
                        selectedLayerId: null,
                        hasHydrated: true
                    });
                } else {
                    console.warn('[PreviewPage] No data found for slug:', slug);
                }
            } catch (err) {
                console.error('[PreviewPage] Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [slug]);

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
