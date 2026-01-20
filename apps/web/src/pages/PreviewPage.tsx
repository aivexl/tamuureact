import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PreviewView } from '@/components/Preview/PreviewView';
import { useStore, type Layer } from '@/store/useStore';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { generateId } from '@/lib/utils';
import { usePreviewData } from '@/hooks/queries';
import { useSEO } from '@/hooks/useSEO';

export const PreviewPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { data: previewResponse, isLoading: isQueryLoading, isError, error } = usePreviewData(slug);

    useEffect(() => {
        // GHOST V4.0: UNICORN REDIRECT GUARD
        // If query definitively failed, provide a grace period then bounce
        if (isError) {
            console.error('[PreviewPage] Failed to resolve slug:', slug, {
                error,
                timestamp: new Date().toISOString()
            });

            // Only redirect if not in development to allow debugging
            if (import.meta.env.PROD) {
                const timer = setTimeout(() => {
                    navigate('/', { replace: true });
                }, 3000); // 3 second grace period
                return () => clearTimeout(timer);
            }
            return; // Added return here to prevent further execution if there's an error
        }

        if (slug === 'draft' || !previewResponse) return;

        const { data, source } = previewResponse;

        // Safety check to ensure we have actual invitation/template data
        if (!data) return;

        console.log(`[PreviewPage] [VERSION 5.0 - MOBILE ORBIT FIX] Hydrating from ${source}:`, data.id);

        useStore.setState({ templateType: 'invitation' });

        const rawSections = Array.isArray(data.sections) ? (data.sections as any[]) : [];
        const rawLayers = Array.isArray(data.layers) ? (data.layers as Layer[]) : [];

        const validSections = rawSections.map(s => ({
            ...s,
            id: s.id || generateId('section'),
            elements: s.elements || rawLayers.filter((l: any) => l.sectionId === s.id) || []
        }));

        // CTO ROBUST HYDRATION: Check both orbit and orbit_layers for actual elements
        const currentOrbit = useStore.getState().orbit;
        const hasOrbit = data.orbit?.left?.elements?.length > 0 || data.orbit?.right?.elements?.length > 0;
        const hasOrbitLayers = data.orbit_layers?.left?.elements?.length > 0 || data.orbit_layers?.right?.elements?.length > 0;

        const apiOrbit = hasOrbit ? data.orbit : (hasOrbitLayers ? data.orbit_layers : (data.orbit || data.orbit_layers));

        const robustOrbit = {
            left: {
                backgroundColor: apiOrbit?.left?.backgroundColor || currentOrbit.left.backgroundColor || 'transparent',
                backgroundUrl: apiOrbit?.left?.backgroundUrl || currentOrbit.left.backgroundUrl,
                isVisible: apiOrbit?.left?.isVisible ?? currentOrbit.left.isVisible,
                elements: Array.isArray(apiOrbit?.left?.elements) ? apiOrbit.left.elements : []
            },
            right: {
                backgroundColor: apiOrbit?.right?.backgroundColor || currentOrbit.right.backgroundColor || 'transparent',
                backgroundUrl: apiOrbit?.right?.backgroundUrl || currentOrbit.right.backgroundUrl,
                isVisible: apiOrbit?.right?.isVisible ?? currentOrbit.right.isVisible,
                elements: Array.isArray(apiOrbit?.right?.elements) ? apiOrbit.right.elements : []
            }
        };

        useStore.setState({
            sections: validSections,
            layers: rawLayers,
            zoom: data.zoom || 1,
            pan: data.pan || { x: 0, y: 0 },
            slug: data.slug || '',
            projectName: data.name || '',
            activeSectionId: validSections[0]?.id || null,
            orbit: robustOrbit,
            music: data.music || null,
            id: data.id,
            selectedLayerId: null,
            hasHydrated: true,
            isTemplate: source === 'templates',
            templateType: data.type === 'display' ? 'display' : 'invitation'
        });
    }, [slug, previewResponse, isError, navigate]);

    // SEO & Bot Blocking Logic
    // Only allow indexing for templates (Public Library), block all user invitations
    const isTemplate = previewResponse?.source === 'templates';
    const invitationData = previewResponse?.data;

    // Respect user-defined Sosmed Preview title/description
    const seoTitle = (invitationData?.seo_title || invitationData?.name || slug || 'Invitation').toUpperCase();
    const seoDescription = invitationData?.seo_description || (isTemplate
        ? 'Premium Wedding Invitation Templates by Tamuu'
        : 'Exclusive Digital Invitation - Private Access');

    useSEO({
        title: seoTitle,
        description: seoDescription,
        image: invitationData?.og_image || invitationData?.thumbnail_url,
        noindex: !isTemplate // Block if not a template
    });

    const isLoading = slug !== 'draft' && isQueryLoading;

    if (isLoading) {
        return <PremiumLoader />;
    }

    if (!previewResponse && slug !== 'draft') {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-widest text-xs">Resolving Invitation...</div>;
    }

    return (
        <div className="w-full h-screen bg-black">
            <PreviewView
                isOpen={true}
                onClose={() => (window.opener ? window.close() : navigate('/'))}
                id={slug === 'draft' ? useStore.getState().id : previewResponse?.data?.id}
                isTemplate={isTemplate}
            />
        </div>
    );
};
