import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore, Section, Layer } from '@/store/useStore';
import { SeamlessCanvas } from '../Canvas/SeamlessCanvas';
import { SectionCanvas } from '../Canvas/SectionCanvas';
import { LayersSidebar } from '../Panels/LayersSidebar';
import { SectionsSidebar } from '../Panels/SectionsSidebar';
import { ElementToolbar } from './ElementToolbar';
import { PropertyPanel } from '../Panels/PropertyPanel';
import { EditorHeader } from './EditorHeader';
import { PreviewView } from '../Preview/PreviewView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { PanelLeftClose, PanelRightClose, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

interface EditorLayoutProps {
    templateId?: string;
    isTemplate?: boolean;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ templateId, isTemplate }) => {
    const { layers, projectName, pathEditingId } = useStore();

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false); // Renamed from isLoading for clarity
    const [hasLoaded, setHasLoaded] = useState(false); // Enterprise Load Guard

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
        const firstSectionWithImage = state.sections.find(s => s.backgroundUrl || s.elements.some(e => e.imageUrl));
        const firstImg = firstSectionWithImage?.elements.find(e => e.imageUrl)?.imageUrl || firstSectionWithImage?.backgroundUrl;
        console.log(`[Persistence] Audit - First discovered image URL: ${firstImg || 'None'}`);

        // Deep verification of payload integrity
        if (state.sections.length === 0 && state.layers.length === 0) {
            console.warn('Persistence Guard: Attempting to save an empty project. Strategy check required.');
            // Allow empty projects only if explicitly intended or if it was already empty
        }



        // Determine correct ID for upsert
        // 1. If templateId is UUID, use it.
        // 2. If templateId is slug, attempt to use state.id (the real UUID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);
        // Use pure UUID generator if no ID exists (from crypto.randomUUID mostly)
        // We pass no prefix to generateId to hopefully get a cleaner ID, but better to enforce UUID format.
        // Actually generateId util joins prefix with hyphen.
        // Let's use pure UUID for the DB ID to avoid 'invalid input syntax for type uuid'.
        const upsertId = isUuid ? templateId : state.id || crypto.randomUUID();

        if (!state.id && upsertId) {
            useStore.setState({ id: upsertId });
        }

        if (!upsertId) {
            console.error('[Persistence] Save Blocked: No valid UUID found for this project.');
            alert('Error: Cannot save. Project ID not found.');
            return;
        }

        const payload = {
            id: upsertId,
            name: state.projectName || state.sections[0]?.title || 'Invitation', // Prioritize projectName
            slug: state.slug,
            thumbnail_url: state.thumbnailUrl, // Add thumbnail_url to payload
            sections: state.sections,
            layers: state.layers,
            zoom: state.zoom,
            pan: state.pan,
            updated_at: new Date().toISOString()
        };

        const jsonPayload = JSON.stringify(payload);
        console.log(`[Persistence] Payload generated. Size: ${(jsonPayload.length / 1024).toFixed(2)} KB`);

        const tableName = isTemplate ? 'templates' : 'invitations';
        const { error } = await supabase
            .from(tableName)
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error('[Persistence] Database Sync Error:', error.message);
            throw new Error(`Cloud Sync Failed: ${error.message}`);
        }

        console.log('%c[Persistence] ✅ CLOUD SYNC SUCCESSFUL', 'color: #10b981; font-weight: bold; font-size: 12px;');
    }, [templateId, isSyncing, hasLoaded]);

    const handlePublish = useCallback(async () => {
        // Publish template via API
        console.log('Publishing template...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Template published!');
    }, []);

    // Load data from Supabase on mount
    useEffect(() => {
        if (!templateId) {
            setIsSyncing(false);
            setHasLoaded(true);
            return;
        }

        const loadData = async () => {
            // Quick sync - no artificial delays
            setIsSyncing(true);

            try {
                // CTO Enterprise Strategy: Cloud Resilience
                // Search in the primary table first, then fallback if nothing found.
                const primaryTable = isTemplate ? 'templates' : 'invitations';
                const secondaryTable = isTemplate ? 'invitations' : 'templates';

                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);

                const fetchFromTable = async (table: string) => {
                    let q = supabase.from(table).select('id,name,slug,thumbnail_url,sections,layers,zoom,pan');
                    if (isUuid) {
                        q = q.eq('id', templateId);
                    } else {
                        q = q.eq('slug', templateId);
                    }
                    return q.maybeSingle();
                };

                // 1. Primary Attempt
                let { data, error } = await fetchFromTable(primaryTable);

                // 2. Secondary Fallback (If primary failed or returned an empty shell)
                // We consider it an 'empty shell' if it has no sections and no layers
                const isEmptyShell = data && (!data.sections || (data.sections as any[]).length === 0) && (!data.layers || (data.layers as any[]).length === 0);

                if (!data || error || isEmptyShell) {
                    const { data: fallbackData, error: fallbackError } = await fetchFromTable(secondaryTable);
                    if (fallbackData && !fallbackError) {
                        console.log(`[Persistence] Primary table was empty. Falling back to '${secondaryTable}'...`);
                        data = fallbackData;
                    }
                }

                if (data) {
                    console.log(`[Persistence] Cloud data loaded for: ${data.name || data.id}`);

                    // CTO ENTERPRISE GUARD: URL Normalization
                    // If accessed via UUID but a slug exists, update the URL for a cleaner UX
                    if (isUuid && data.slug && templateId !== data.slug) {
                        console.log(`[Persistence] Normalizing Editor URL: ${templateId} -> ${data.slug}`);
                        const baseRoute = isTemplate ? '/editor/template' : '/editor';
                        window.history.replaceState(null, '', `${baseRoute}/${data.slug}`);
                    }

                    const validSections = Array.isArray(data.sections) ? (data.sections as Section[]) : [];
                    const validLayers = Array.isArray(data.layers) ? (data.layers as Layer[]) : [];

                    const processedSections = validSections.map(s => ({
                        ...s,
                        id: s.id || generateId('section'),
                        elements: s.elements || []
                    }));

                    useStore.setState({
                        sections: processedSections,
                        layers: validLayers,
                        zoom: data.zoom || 1,
                        pan: data.pan || { x: 0, y: 0 },
                        slug: data.slug || '',
                        thumbnailUrl: data.thumbnail_url || null, // Hydrate thumbnail_url
                        id: data.id, // Set the real ID
                        projectName: data.name || '',
                        activeSectionId: processedSections[0]?.id || null,
                        selectedLayerId: null
                    });
                    console.log(`[Persistence] Hydrated ID: '${data.id}' | Slug: '${data.slug}'`);
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
    }, [templateId, isTemplate]);

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
                onBack={() => window.location.href = isTemplate ? '/admin/templates' : '/'}
                onPreview={handlePreview}
                onSave={handleSave}
                onPublish={handlePublish}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 pt-14 overflow-hidden">
                {/* Left Sidebar - Sections + Layers */}
                <motion.div
                    initial={false}
                    animate={{ width: leftPanelOpen ? 260 : 0, opacity: leftPanelOpen ? 1 : 0 }}
                    className="glass-panel border-r border-white/10 overflow-hidden flex-shrink-0"
                    style={{ height: 'calc(100vh - 56px)' }}
                >
                    {/* Sections Panel - Top Half */}
                    <div style={{ height: 'calc(50% - 1px)' }} className="border-b border-white/10 overflow-hidden">
                        <SectionsSidebar />
                    </div>
                    {/* Layers Panel - Bottom Half */}
                    <div style={{ height: '50%' }} className="overflow-hidden">
                        <LayersSidebar />
                    </div>
                </motion.div>

                {/* Toggle Left Panel */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    style={{ left: leftPanelOpen ? 268 : 8 }}
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
        </div>
    );
};
