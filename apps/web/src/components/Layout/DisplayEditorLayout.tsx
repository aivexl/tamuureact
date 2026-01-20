import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { DisplayCanvas } from '../Canvas/DisplayCanvas';
import { VisualEffectsCanvas } from '../Canvas/VisualEffectsCanvas';
import { LayersSidebar } from '../Panels/LayersSidebar';
import { SectionsSidebar } from '../Panels/SectionsSidebar';
import { ElementToolbar } from './ElementToolbar';
import { PropertyPanel } from '../Panels/PropertyPanel';
import { PreviewView } from '../Preview/PreviewView';
import { PanelLeftClose, PanelRightClose, Monitor, Save, Eye, ArrowLeft } from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';
import { templates as templatesApi } from '@/lib/api';
import { generateId, sanitizeValue } from '@/lib/utils';
import { Layers, List, Settings } from 'lucide-react';
import { SettingsSidebar } from '../Panels/SettingsSidebar';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// ============================================
// DISPLAY EDITOR LAYOUT
// Specialized layout for TV/Tablet Display editing (1920x1080)
// ============================================

interface DisplayEditorLayoutProps {
    templateId?: string;
}

export const DisplayEditorLayout: React.FC<DisplayEditorLayoutProps> = ({ templateId }) => {
    const navigate = useNavigate();
    const { projectName, slug } = useStore();

    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState<'sections' | 'layers' | 'settings'>('sections');

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    // ============================================
    // SAVE HANDLER
    // ============================================
    const handleSave = useCallback(async () => {
        if (!templateId) return;
        if (isSyncing || !hasLoaded) {
            console.warn('[DisplayEditor] Save blocked while loading');
            return;
        }

        setIsSyncing(true);
        const state = useStore.getState();

        console.log('[DisplayEditor] Saving...');

        const payload = {
            name: state.projectName || 'Untitled Display',
            slug: state.slug || null,
            sections: state.sections,
            layers: state.layers,
            zoom: state.zoom,
            pan: state.pan,
            orbit: state.orbit
        };

        try {
            await templatesApi.update(templateId, payload);
            console.log('[DisplayEditor] ✅ Save successful');
        } catch (error: any) {
            console.error('[DisplayEditor] ❌ Save failed:', error.message);
        } finally {
            setIsSyncing(false);
        }
    }, [templateId, isSyncing, hasLoaded]);

    // ============================================
    // LOAD DATA ON MOUNT
    // ============================================
    useEffect(() => {
        if (!templateId) {
            setIsSyncing(false);
            setHasLoaded(true);
            return;
        }

        const loadData = async () => {
            setIsSyncing(true);

            try {
                const data = await templatesApi.get(templateId);

                if (data) {
                    console.log(`[DisplayEditor] Loaded: ${data.name}`);
                    console.log(`[DisplayEditor] Type: ${data.type}`);

                    const sanitizedData = sanitizeValue(data);
                    const validSections = Array.isArray(sanitizedData.sections) ? sanitizedData.sections : [];

                    // Process sections to ensure elements arrays exist
                    const processedSections = validSections
                        .filter((s: any) => s && typeof s === 'object')
                        .map((s: any) => ({
                            ...s,
                            id: s.id || generateId('section'),
                            elements: Array.isArray(s.elements) ? s.elements : []
                        }));

                    // Create default section if none exist
                    const finalSections = processedSections.length > 0 ? processedSections : [{
                        id: generateId('section'),
                        key: 'main',
                        title: 'Main Display',
                        order: 0,
                        isVisible: true,
                        backgroundColor: '#0a0a0a',
                        overlayOpacity: 0,
                        animation: 'fade-in' as const,
                        elements: []
                    }];

                    useStore.setState({
                        sections: finalSections,
                        layers: sanitizedData.layers || [],
                        zoom: sanitizedData.zoom || 1,
                        pan: sanitizedData.pan || { x: 0, y: 0 },
                        slug: sanitizedData.slug || '',
                        thumbnailUrl: sanitizedData.thumbnail_url || null,
                        id: sanitizedData.id,
                        projectName: sanitizedData.name || 'Untitled Display',
                        activeSectionId: finalSections[0]?.id || null,
                        orbit: sanitizedData.orbit || useStore.getState().orbit,
                        selectedLayerId: null,
                        templateType: 'display', // Force display type
                        isTemplate: true
                    });

                    console.log('[DisplayEditor] State hydrated successfully');
                }
            } catch (err) {
                console.error('[DisplayEditor] Load error:', err);
            } finally {
                setIsSyncing(false);
                setHasLoaded(true);
            }
        };

        loadData();
    }, [templateId]);

    // ============================================
    // LOADING STATE
    // ============================================
    if (isSyncing && !hasLoaded) {
        return (
            <div className="w-full h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Monitor className="w-16 h-16 text-purple-400 animate-pulse" />
                        <div className="absolute -bottom-2 -right-2">
                            <PremiumLoader variant="inline" color="white" />
                        </div>
                    </div>
                    <p className="text-white/60 font-medium">Loading Display Editor...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="w-full h-screen bg-[#050505] text-white overflow-hidden font-outfit relative">
            {/* Header */}
            <header className="h-14 bg-black/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/templates')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-purple-400" />
                        <span className="font-bold text-white/90">{projectName || 'Display Editor'}</span>
                        <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                            1920×1080
                        </span>
                    </div>
                </div>

                {/* Center */}
                <div className="flex items-center gap-2">
                    {isSyncing && (
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <PremiumLoader variant="inline" color="rgba(255, 255, 255, 0.4)" />
                            Syncing...
                        </div>
                    )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (slug) {
                                window.open(`/admin/display/${slug}`, '_blank');
                            } else {
                                setIsPreviewOpen(true);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Preview</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-bold">Save</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
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

                {/* Center - Display Canvas */}
                <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                    <DisplayCanvas />
                </div>

                {/* Toggle Right Panel */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    style={{ right: rightPanelOpen ? 308 : 8 }}
                >
                    <PanelRightClose className={`w-4 h-4 transition-transform ${rightPanelOpen ? '' : 'rotate-180'}`} />
                </motion.button>

                {/* Right Sidebar */}
                <motion.div
                    initial={false}
                    animate={{ width: rightPanelOpen ? 300 : 0, opacity: rightPanelOpen ? 1 : 0 }}
                    className="glass-panel border-l border-white/10 overflow-hidden flex-shrink-0 flex flex-col"
                    style={{ height: 'calc(100vh - 56px)' }}
                >
                    {/* Property Panel */}
                    <div className="flex-1 overflow-hidden">
                        <PropertyPanel />
                    </div>
                </motion.div>
            </div>

            {/* Preview Modal */}
            <PreviewView isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />

            {/* Global Visual Effects Overlay for Test Simulator */}
            <VisualEffectsCanvas mode="global" />
        </div>
    );
};

export default DisplayEditorLayout;
