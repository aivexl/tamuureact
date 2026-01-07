import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, Section, Layer } from '@/store/useStore';
import { SeamlessCanvas } from '../Canvas/SeamlessCanvas';
import { SectionCanvas } from '../Canvas/SectionCanvas';
import { LayersSidebar } from '../Panels/LayersSidebar';
import { SectionsSidebar } from '../Panels/SectionsSidebar';
import { ElementToolbar } from './ElementToolbar';
import { PropertyPanel } from '../Panels/PropertyPanel';
import { EditorHeader } from './EditorHeader';
import { PreviewView } from '../Preview/PreviewView';
import { ImageCropModal } from '../Modals/ImageCropModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { PanelLeftClose, PanelRightClose, Loader2 } from 'lucide-react';
import { templates as templatesApi, invitations as invitationsApi, userDisplayDesigns, storage } from '@/lib/api';
import { generateId, dataURLtoBlob, sanitizeValue } from '@/lib/utils';
import { Layers, List, Zap, Settings } from 'lucide-react';
import { InteractionsSidebar } from '../Panels/InteractionsSidebar';
import { SettingsSidebar } from '../Panels/SettingsSidebar';


interface EditorLayoutProps {
    templateId?: string;
    isTemplate?: boolean;
    isDisplayDesign?: boolean;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ templateId, isTemplate, isDisplayDesign }) => {
    const {
        layers,
        projectName,
        pathEditingId,
        sections,
        updateElementInSection,
        imageCropModal,
        closeImageCropModal
    } = useStore();


    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false); // Renamed from isLoading for clarity
    const [hasLoaded, setHasLoaded] = useState(false); // Enterprise Load Guard
    const [activeSidebarTab, setActiveSidebarTab] = useState<'sections' | 'layers' | 'interactions' | 'settings'>('sections');

    // ============================================
    // HEADER HANDLERS
    // ============================================

    const handleBack = useCallback(() => {
        // Navigate back to dashboard
        // For now, just log - will integrate with router later
        console.log('Navigate back to dashboard');
    }, []);

    const handlePreview = useCallback(() => {
        const targetId = templateId || 'draft';
        window.open(`/preview/${targetId}`, '_blank');
    }, [templateId]);

    const handleSave = useCallback(async () => {
        if (!templateId) return;

        // CTO Critical Check: Do not save if we haven't successfully loaded from Cloud yet
        // This prevents overwriting existing data with an empty local state
        if (isSyncing || !hasLoaded) {
            console.warn('Persistence Guard: Save blocked while loading cloud data');
            return;
        }

        const state = useStore.getState();

        // CTO Verification: Log First Image Element for Debugging
        const firstSectionWithImage = state.sections.find(s => s?.backgroundUrl || (s?.elements || []).some(e => e.imageUrl));
        const firstImg = (firstSectionWithImage?.elements || []).find(e => e.imageUrl)?.imageUrl || firstSectionWithImage?.backgroundUrl;
        console.log(`[Persistence] Audit - First discovered image URL: ${firstImg || 'None'}`);

        // Deep verification of payload integrity
        if (state.sections.length === 0 && state.layers.length === 0) {
            console.warn('Persistence Guard: Attempting to save an empty project. Strategy check required.');
            // Allow empty projects only if explicitly intended or if it was already empty
        }



        // Determine correct ID for upsert
        // CTO Enterprise Strategy: Strict ID Management
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);

        // Priority: 1. State ID (Real DB ID) 2. URL if it's a UUID 3. Fresh UUID (New project)
        let upsertId = state.id || (isUuid ? templateId : null);

        // CTO Enterprise Safety: If we have a slug but no ID, wait for sync to provide the ID
        // This prevents creating a duplicate template with the same slug but different ID
        if (!upsertId && !isUuid && templateId) {
            console.warn('[Persistence] Save Blocked: Slug exists in URL but no ID hydrated yet. Waiting for Cloud Sync...');
            return;
        }

        if (!upsertId) {
            console.log('[Persistence] Generating new UUID for fresh project...');
            upsertId = crypto.randomUUID();
            useStore.setState({ id: upsertId });
        }

        console.log(`[Persistence] Syncing - Mode: ${isTemplate ? 'Template' : (isDisplayDesign ? 'DisplayDesign' : 'Invitation')} | ID: ${upsertId} | Slug: ${state.slug}`);

        const payload = {
            id: upsertId,
            name: state.projectName || state.sections[0]?.title || 'Invitation',
            slug: state.slug,
            thumbnail_url: state.thumbnailUrl,
            sections: state.sections,
            layers: state.layers,
            orbit: state.orbit,
            zoom: state.zoom,
            pan: state.pan,
            updated_at: new Date().toISOString()
        };

        const jsonPayload = JSON.stringify(payload);
        console.log(`[Persistence] Payload generated. Size: ${(jsonPayload.length / 1024).toFixed(2)} KB`);

        const tableName = isTemplate ? 'templates' : (isDisplayDesign ? 'user_display_designs' : 'invitations');
        const api = isTemplate ? templatesApi : (isDisplayDesign ? userDisplayDesigns : invitationsApi);

        try {
            await api.update(upsertId, payload);
            console.log('%c[Persistence] ✅ CLOUD SYNC SUCCESSFUL', 'color: #10b981; font-weight: bold; font-size: 12px;');
        } catch (error: any) {
            console.error('[Persistence] ❌ Database Sync Error:', error.message);
            if (error.message.includes('unique_template_slug')) {
                console.warn('[Persistence] Slug conflict detected. Real-time verification required.');
            }
            throw new Error(`Cloud Sync Failed: ${error.message}`);
        }
    }, [templateId, isSyncing, hasLoaded]);

    const handlePublish = useCallback(async () => {
        // Publish template via API
        console.log('Publishing template...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Template published!');
    }, []);

    // Load data from Cloudflare D1 on mount
    useEffect(() => {
        if (!templateId) {
            setIsSyncing(false);
            setHasLoaded(true);
            return;
        }

        const loadData = async () => {
            setIsSyncing(true);

            try {
                const api = isTemplate ? templatesApi : (isDisplayDesign ? userDisplayDesigns : invitationsApi);
                const fallbackApi = isTemplate ? invitationsApi : templatesApi;
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);

                let data = null;
                try {
                    data = await api.get(templateId);
                } catch {
                    // Try fallback
                    try {
                        data = await fallbackApi.get(templateId);
                        console.log(`[Persistence] Primary table was empty. Fell back to secondary table...`);
                    } catch {
                        data = null;
                    }
                }


                if (data) {
                    console.log(`[Persistence] Cloud data loaded for: ${data.name || data.id}`);
                    console.log(`[Persistence] Template Type from API: '${data.type}' (will use: '${data.type || 'invitation'}')`);

                    // CTO ENTERPRISE GUARD: URL Normalization
                    // If accessed via UUID but a slug exists, update the URL for a cleaner UX
                    if (isUuid && data.slug && templateId !== data.slug) {
                        console.log(`[Persistence] Normalizing Editor URL: ${templateId} -> ${data.slug}`);
                        const baseRoute = isTemplate ? '/editor/template' : '/editor';
                        window.history.replaceState(null, '', `${baseRoute}/${data.slug}`);
                    }

                    // CTO ENTERPRISE GUARD: URL Sanitization
                    // Ensure that any stale blob:/data: URLs in the database (from previous failed sanitizations)
                    // are stripped before entering the application state.
                    const sanitizedData = sanitizeValue(data);

                    const validSections = Array.isArray(sanitizedData.sections) ? (sanitizedData.sections as Section[]) : [];
                    const validLayers = Array.isArray(sanitizedData.layers) ? (sanitizedData.layers as Layer[]) : [];

                    const processedSections = validSections
                        .filter(s => s && typeof s === 'object') // Guard against null/undefined/primitive sections
                        .map(s => ({
                            ...s,
                            id: s.id || generateId('section'),
                            elements: Array.isArray(s.elements) ? s.elements : [] // Guard against undefined elements
                        }));

                    // CTO FIX: If no sections exist (new template), create a default one
                    const finalSections = processedSections.length > 0 ? processedSections : [{
                        id: generateId('section'),
                        key: 'opening',
                        title: 'Opening',
                        order: 0,
                        isVisible: true,
                        backgroundColor: '#0a0a0a',
                        overlayOpacity: 0,
                        animation: 'fade-in' as const,
                        elements: []
                    }];

                    useStore.setState({
                        sections: finalSections,
                        layers: validLayers,
                        zoom: sanitizedData.zoom || 1,
                        pan: sanitizedData.pan || { x: 0, y: 0 },
                        slug: sanitizedData.slug || '',
                        thumbnailUrl: sanitizedData.thumbnail_url || null, // Hydrate thumbnail_url
                        id: sanitizedData.id, // Set the real ID
                        projectName: sanitizedData.name || '',
                        activeSectionId: finalSections[0]?.id || null,
                        orbit: sanitizedData.orbit || useStore.getState().orbit,
                        selectedLayerId: null,
                        templateType: sanitizedData.type || 'invitation',
                        isTemplate: !!isTemplate
                    });
                    console.log(`[Persistence] Hydrated ID: '${sanitizedData.id}' | Slug: '${sanitizedData.slug}' with sanitization.`);
                } else {
                    // New template with no data yet - that's OK
                    console.log('[Persistence] New project - no cloud data yet.');

                    // If we visited via UUID (new), set the ID
                    if (isUuid) {
                        useStore.setState({ id: templateId });
                    }
                }
            } catch (err) {
                console.error('[Persistence] Cloud Sync Error:', err);
            } finally {
                setIsSyncing(false);
                setHasLoaded(true);
            }
        };



        loadData();
    }, [templateId, isTemplate, isDisplayDesign]);

    // Force sync state to storage on mount to ensure Preview tab has data
    useEffect(() => {
        const state = useStore.getState();
        state.setZoom(state.zoom);
    }, []);

    // ============================================
    // RENDER HELPERS
    // ============================================
    // Remove the full-page blocker to allow background sync
    // The UI will rehydrate from local storage instantly via Zustand persist
    // ============================================

    return (
        <div className="w-full h-full flex flex-col bg-[#050505]">
            <EditorHeader
                templateId={templateId}
                templateName={projectName || 'Untitled Template'}
                isSyncing={isSyncing}
                onBack={() => window.location.href = isTemplate ? '/admin/templates' : (isDisplayDesign ? '/user/displays' : '/')}
                onPreview={handlePreview}
                onSave={handleSave}
                onPublish={handlePublish}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 pt-14 overflow-hidden">
                {/* Left Sidebar - Tabbed Architecture */}
                <motion.div
                    initial={false}
                    animate={{ width: leftPanelOpen ? 300 : 0, opacity: leftPanelOpen ? 1 : 0 }}
                    className="glass-panel border-r border-white/10 overflow-hidden flex-shrink-0 flex flex-col"
                    style={{ height: 'calc(100vh - 56px)' }}
                >
                    {/* Sidebar Tab Bar */}
                    <div className="flex border-b border-white/10 bg-black/20">
                        <button
                            onClick={() => setActiveSidebarTab('sections')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeSidebarTab === 'sections' ? 'text-premium-accent border-b-2 border-premium-accent bg-premium-accent/5' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                        >
                            <List className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Sections</span>
                        </button>
                        <button
                            onClick={() => setActiveSidebarTab('layers')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeSidebarTab === 'layers' ? 'text-premium-accent border-b-2 border-premium-accent bg-premium-accent/5' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                        >
                            <Layers className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Layers</span>
                        </button>
                        <button
                            onClick={() => setActiveSidebarTab('interactions')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeSidebarTab === 'interactions' ? 'text-premium-accent border-b-2 border-premium-accent bg-premium-accent/5' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                        >
                            <Zap className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Interactions</span>
                        </button>
                        <button
                            onClick={() => setActiveSidebarTab('settings')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeSidebarTab === 'settings' ? 'text-premium-accent border-b-2 border-premium-accent bg-premium-accent/5' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                        </button>
                    </div>

                    {/* Active Sidebar Content */}
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {activeSidebarTab === 'sections' && (
                                <motion.div
                                    key="sections"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute inset-0"
                                >
                                    <SectionsSidebar />
                                </motion.div>
                            )}
                            {activeSidebarTab === 'layers' && (
                                <motion.div
                                    key="layers"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute inset-0"
                                >
                                    <LayersSidebar />
                                </motion.div>
                            )}
                            {activeSidebarTab === 'interactions' && (
                                <motion.div
                                    key="interactions"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute inset-0"
                                >
                                    <InteractionsSidebar />
                                </motion.div>
                            )}
                            {activeSidebarTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute inset-0"
                                >
                                    <SettingsSidebar />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Toggle Left Panel */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    style={{ left: leftPanelOpen ? 308 : 8 }}
                >
                    <PanelLeftClose className={`w-4 h-4 transition-transform ${leftPanelOpen ? '' : 'rotate-180'}`} />
                </motion.button>

                {/* Center - Canvas Area */}
                <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                    {/* Syncing Status Indicator is also in the Header for non-blocking feedback */}
                    {/* Canvas */}
                    {pathEditingId ? <SectionCanvas /> : <SeamlessCanvas />}
                </div>

                {/* Toggle Right Panel */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    style={{ right: rightPanelOpen ? 328 : 8 }}
                >
                    <PanelRightClose className={`w-4 h-4 transition-transform ${rightPanelOpen ? '' : 'rotate-180'}`} />
                </motion.button>

                {/* Right Sidebar - Properties */}
                <motion.div
                    initial={false}
                    animate={{ width: rightPanelOpen ? 320 : 0, opacity: rightPanelOpen ? 1 : 0 }}
                    className="h-full glass-panel border-l border-white/10 overflow-hidden flex-shrink-0"
                >
                    <PropertyPanel />
                </motion.div>
            </div>

            {/* Removed Preview Modal - handled via new tab */}

            {/* Image Crop Modal for Photo Grid */}
            <ImageCropModal
                isOpen={imageCropModal.isOpen}
                imageSrc={imageCropModal.imageSrc}
                aspectRatio={imageCropModal.aspectRatio}
                onClose={closeImageCropModal}
                onCropComplete={async (croppedImageUrl: string) => {
                    // CTO Refinement: Instead of persisting huge base64 data URLs,
                    // we upload the crop to Supabase and use the public URL.
                    // This prevents local storage overflow and broken images on reload.
                    if (imageCropModal.targetLayerId && imageCropModal.targetSlotIndex !== null) {
                        try {
                            const blob = dataURLtoBlob(croppedImageUrl);
                            const fileName = `crop_${generateId('img')}.png`;
                            const file = new File([blob], fileName, { type: 'image/png' });

                            // 1. Upload to Cloudflare R2
                            const result = await storage.upload(file);
                            const publicUrl = result.url;

                            console.log('[DEBUG] Crop Upload Success. Public URL:', publicUrl);

                            // 2. Update the photo grid image at the target slot
                            const targetSection = sections.find((s: Section) =>
                                (s?.elements || []).some((e: Layer) => e.id === imageCropModal.targetLayerId)
                            );

                            if (targetSection) {
                                const targetLayer = targetSection.elements.find((e: Layer) => e.id === imageCropModal.targetLayerId);
                                if (targetLayer?.photoGridConfig) {
                                    const newImages = [...(targetLayer.photoGridConfig.images || [])];
                                    newImages[imageCropModal.targetSlotIndex] = publicUrl;
                                    updateElementInSection(targetSection.id, imageCropModal.targetLayerId, {
                                        photoGridConfig: {
                                            ...targetLayer.photoGridConfig,
                                            images: newImages
                                        }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('[EditorLayout] Crop upload failed:', error);
                            alert('Failed to upload cropped image. Please try again.');
                        }
                    }
                }}
            />

        </div>
    );
};

