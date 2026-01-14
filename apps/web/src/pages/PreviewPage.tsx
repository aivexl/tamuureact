import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PreviewView } from '@/components/Preview/PreviewView';
import { useStore, type Layer } from '@/store/useStore';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { generateId } from '@/lib/utils';
import { usePreviewData } from '@/hooks/queries';

export const PreviewPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: previewResponse, isLoading: isQueryLoading } = usePreviewData(slug);

    useEffect(() => {
        if (slug === 'draft' || !previewResponse) return;

        const { data, source } = previewResponse;
        useStore.setState({ templateType: 'invitation' });

        const rawSections = Array.isArray(data.sections) ? (data.sections as any[]) : [];
        const rawLayers = Array.isArray(data.layers) ? (data.layers as Layer[]) : [];

        const validSections = rawSections.map(s => ({
            ...s,
            id: s.id || generateId('section'),
            elements: s.elements || rawLayers.filter((l: any) => l.sectionId === s.id) || []
        }));

        useStore.setState({
            sections: validSections,
            layers: rawLayers,
            zoom: data.zoom || 1,
            pan: data.pan || { x: 0, y: 0 },
            slug: data.slug || '',
            projectName: data.name || '',
            activeSectionId: validSections[0]?.id || null,
            orbit: data.orbit || useStore.getState().orbit,
            music: data.music || {
                url: 'https://api.tamuu.id/assets/music/tr-01.mp3',
                title: 'Sabilulungan',
                artist: 'Traditional',
                volume: 0.5,
                isMuted: false
            },
            id: data.id,
            selectedLayerId: null,
            hasHydrated: true,
            isTemplate: source === 'templates',
            templateType: data.type === 'display' ? 'display' : 'invitation'
        });
    }, [slug, previewResponse]);

    const isLoading = slug !== 'draft' && isQueryLoading;

    if (isLoading) {
        return <PremiumLoader />;
    }

    return (
        <div className="w-full h-screen bg-black">
            <PreviewView
                isOpen={true}
                onClose={() => window.close()}
                id={slug === 'draft' ? useStore.getState().id : previewResponse?.data?.id}
                isTemplate={previewResponse?.source === 'templates'}
            />
        </div>
    );
};
