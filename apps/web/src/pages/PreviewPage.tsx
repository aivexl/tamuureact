import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PreviewView } from '@/components/Preview/PreviewView';
import { useStore, type Layer } from '@/store/useStore';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { generateId } from '@/lib/utils';
import { usePreviewData } from '@/hooks/queries';
import { useSEO } from '@/hooks/useSEO';
import api from '@/lib/api';

export const PreviewPage: React.FC = () => {
    const { slug, guestSlug: pathGuestSlug } = useParams<{ slug: string; guestSlug?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: previewResponse, isLoading: isQueryLoading, isError, error } = usePreviewData(slug);
    const [isGuestLoading, setIsGuestLoading] = useState(false);

    // GHOST V5.1: ATOMIC HYDRATION NEXUS
    useEffect(() => {
        const initializePreview = async () => {
            // CTO MANDATE: Reset all states synchronously before any new operation
            // This prevents "Flash of Previous Invitation" and state pollution.
            console.log('[PreviewPage] Initializing new context for:', slug);
            useStore.getState().resetAll();

            if (isError && slug) {
                const checkBlogPost = async () => {
                    try {
                        const blogPost = await api.blog.getPost(slug);
                        if (blogPost) {
                            navigate(`/blog/${slug}`, { replace: true });
                            return;
                        }
                    } catch { }
                    if (import.meta.env.PROD) {
                        setTimeout(() => navigate('/', { replace: true }), 3000);
                    }
                };
                checkBlogPost();
                return;
            }

            if (slug === 'draft' || !previewResponse) return;

            const { data, source } = previewResponse;
            if (data?.expired) {
                navigate(`/inactive/${slug}`, { replace: true });
                return;
            }
            if (!data) return;

            // 1. RESOLVE GUEST IDENTITY
            const searchParams = new URLSearchParams(location.search);
            const target = pathGuestSlug || searchParams.get('to');
            let resolvedGuest = undefined;

            if (target) {
                setIsGuestLoading(true);
                try {
                    console.log('[PreviewPage] Resolving Identity:', target);
                    let resGuest = null;
                    
                    if (target.length < 30) {
                        try {
                            const res = await api.guests.getBySlug(target);
                            if (res && res.id && !res.error) resGuest = res;
                        } catch (e) {}
                    }
                    
                    if (!resGuest) {
                        try {
                            const res = await api.guests.get(target);
                            if (res && res.id && !res.error) resGuest = res;
                        } catch (e) {}
                    }

                    if (resGuest) {
                        console.log('[PreviewPage] Success: Identity resolved', resGuest.name);
                        resolvedGuest = {
                            ...resGuest,
                            id: resGuest.id || resGuest.guest_id,
                            name: resGuest.name,
                            check_in_code: resGuest.check_in_code || resGuest.checkInCode || resGuest.code || '',
                            slug: resGuest.slug,
                            tier: resGuest.tier,
                            table_number: resGuest.table_number || resGuest.tableNumber || '',
                            guest_count: resGuest.guest_count || resGuest.guestCount || 1
                        };
                    } else {
                        console.warn('[PreviewPage] Notice: Identity resolution returned 404/Empty');
                    }
                } catch (e) {
                    console.error('[PreviewPage] Failure: Identity resolution crashed', e);
                } finally {
                    setIsGuestLoading(false);
                }
            }

            // 2. PREPARE CANVAS CONTEXT
            const rawSections = Array.isArray(data.sections) ? (data.sections as any[]) : [];
            const rawLayers = Array.isArray(data.layers) ? (data.layers as Layer[]) : [];

            const validSections = rawSections.map(s => ({
                ...s,
                id: s.id || generateId('section'),
                elements: s.elements || rawLayers.filter((l: any) => l.sectionId === s.id) || []
            }));

            const currentOrbit = useStore.getState().orbit;
            const apiOrbit = data.orbit || data.orbit_layers;

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

            // 3. ATOMIC STATE UPDATE
            // Standard: We inject guestData AT THE SAME TIME as the invitation data
            // to ensure UI components have access to all state during the first render pass.
            useStore.setState(state => ({
                ...state,
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
                guestData: resolvedGuest, // INJECTED ATOMICALLY
                selectedLayerId: null,
                hasHydrated: true,
                isTemplate: source === 'templates',
                templateType: data.type === 'display' ? 'display' : 'invitation'
            }));

        };

        initializePreview();
    }, [slug, previewResponse, isError, navigate, pathGuestSlug, location.search]);

    const isTemplate = previewResponse?.source === 'templates';
    const invitationData = previewResponse?.data;
    const guestData = useStore(state => state.guestData);

    // DYNAMIC SEO & OG IMAGE
    const ogSettings = invitationData?.og_settings ? (typeof invitationData.og_settings === 'string' ? JSON.parse(invitationData.og_settings) : invitationData.og_settings) : null;
    let dynamicOgImage = invitationData?.og_image || invitationData?.thumbnail_url;

    if (ogSettings) {
        const baseUrl = 'https://api.tamuu.id/api/og';
        const params = new URLSearchParams({
            event: ogSettings.event || 'The Wedding of',
            n1: ogSettings.n1 || '',
            n2: ogSettings.n2 || '',
            time: ogSettings.time || '',
            loc: ogSettings.loc || '',
            to: guestData?.name || 'Bapak/Ibu/Saudara/i',
            qr: pathGuestSlug ? `https://tamuu.id/${slug}/${pathGuestSlug}` : `https://tamuu.id/${slug}`
        });
        dynamicOgImage = `${baseUrl}?${params.toString()}`;
    }

    const baseTitle = (invitationData?.seo_title || invitationData?.name || slug || 'Invitation').toString().toUpperCase();
    const seoTitle = guestData?.name ? `${baseTitle} - KHUSUS UNTUK ${guestData.name.toUpperCase()}` : baseTitle;
    
    useSEO({
        title: seoTitle,
        description: invitationData?.seo_description || 'Exclusive Digital Invitation',
        image: dynamicOgImage,
        noindex: !isTemplate
    });

    const isLoading = (slug !== 'draft' && isQueryLoading) || isGuestLoading;

    if (isLoading) return <PremiumLoader />;

    if (!previewResponse && slug !== 'draft') {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-widest text-xs">Synchronizing...</div>;
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
