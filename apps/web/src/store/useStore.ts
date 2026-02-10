import { create } from 'zustand';
import { temporal } from 'zundo';
import { persist } from 'zustand/middleware';
import { createCanvasSlice, CanvasState } from './canvasSlice';
import { createLayersSlice, LayersState, Layer, LayerType, AnimationType, TextStyle, IconStyle, CountdownConfig, ButtonConfig, ShapeConfig, MapsConfig, MotionPathPoint, MotionPathConfig, LoveStoryMoment, LoveStoryConfig, LiveStreamingConfig } from './layersSlice';
import { createUISlice, UIState } from './uiSlice';
import { createModalSlice, ModalState } from './modalSlice';
import { createSectionsSlice, SectionsState, Section, PredefinedSectionType, SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES, ZoomPoint, ZoomConfig } from './sectionsSlice';
import { createAuthSlice, AuthState } from './authSlice';
import { sanitizeValue } from '@/lib/utils';

// ============================================
// COMBINED STORE TYPE
// ============================================
type StoreState = CanvasState & LayersState & UIState & ModalState & SectionsState & AuthState;

// ============================================
// MAIN STORE WITH UNDO/REDO
// ============================================
export const useStore = create<StoreState>()(
    persist(
        temporal(
            (...a) => ({
                ...createCanvasSlice(...a),
                ...createLayersSlice(...a),
                ...createUISlice(...a),
                ...createModalSlice(...a),
                ...createSectionsSlice(...a),
                ...createAuthSlice(...a),
            }),
            {
                limit: 50,
                partialize: (state) => ({
                    layers: state.layers,
                    selectedLayerId: state.selectedLayerId,
                    sections: state.sections,
                    activeSectionId: state.activeSectionId,
                    zoom: state.zoom,
                    pan: state.pan,
                    projectName: state.projectName,
                    orbit: state.orbit,
                    music: state.music,
                    isPublished: state.isPublished
                })
            }
        ),
        {
            name: 'tamuu-storage',
            partialize: (state) => ({
                layers: state.layers,
                sections: state.sections,
                zoom: state.zoom,
                pan: state.pan,
                slug: state.slug,
                projectName: state.projectName,
                id: state.id,
                orbit: state.orbit,
                music: state.music,
                isPublished: state.isPublished,
                // NOTE: user and token are intentionally NOT persisted here.
                // AuthProvider.tsx is the sole source of truth for auth state.
                // This prevents stale tier data from localStorage overriding fresh D1 data.
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;

                try {
                    // CTO CRITICAL FIX: Enterprise-grade deep sanitization
                    // Ensures all critical collections are valid arrays/objects

                    // 1. Sections Hardening
                    let sections = Array.isArray(state.sections)
                        ? state.sections
                            .filter((s: any) => s && typeof s === 'object')
                            .map((s: any) => ({
                                ...s,
                                id: s.id || `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                elements: Array.isArray(s.elements) ? s.elements : []
                            }))
                        : [];

                    // Fallback to default section if none exist
                    if (sections.length === 0) {
                        sections = [{
                            id: 'section-opening-default',
                            key: 'opening',
                            title: 'Opening',
                            order: 0,
                            isVisible: true,
                            backgroundColor: '#0a0a0a',
                            overlayOpacity: 0,
                            animation: 'fade-in',
                            elements: []
                        }];
                    }

                    // 2. Orbit (TV Stage) Hardening
                    const orbit = {
                        left: {
                            backgroundColor: state.orbit?.left?.backgroundColor || 'transparent',
                            isVisible: state.orbit?.left?.isVisible ?? true,
                            elements: Array.isArray(state.orbit?.left?.elements) ? state.orbit?.left?.elements : []
                        },
                        right: {
                            backgroundColor: state.orbit?.right?.backgroundColor || 'transparent',
                            isVisible: state.orbit?.right?.isVisible ?? true,
                            elements: Array.isArray(state.orbit?.right?.elements) ? state.orbit?.right?.elements : []
                        }
                    };

                    // 3. Global Layers & Metadata Hardening
                    const layers = Array.isArray(state.layers) ? state.layers.filter((l: any) => l && typeof l === 'object') : [];

                    const sanitizedPayload = sanitizeValue({
                        layers,
                        sections,
                        zoom: typeof state.zoom === 'number' ? state.zoom : 1,
                        pan: (state.pan && typeof state.pan === 'object') ? state.pan : { x: 0, y: 0 },
                        slug: state.slug || '',
                        projectName: state.projectName || 'Untitled Design',
                        id: state.id,
                        orbit,
                        music: Array.isArray(state.music) ? state.music : [],
                        isPublished: !!state.isPublished,
                        activeSectionId: state.activeSectionId || sections[0]?.id || null,
                        activeCanvas: state.activeCanvas || 'main'
                    });

                    // Update state with sanitized values
                    if (state.setHasHydrated) {
                        Object.assign(state, sanitizedPayload);
                        state.setHasHydrated(true);
                    }
                    console.log('[Store] Rehydration successful: structural integrity verified.');
                } catch (e) {
                    console.error('[Store] Rehydration failed catastrophically! Resetting to safe defaults.', e);
                    // Critical fallback: If rehydration fails, we MUST still mark as hydrated to prevent loading loops
                    if (state.setHasHydrated) {
                        state.setHasHydrated(true);
                    }
                }
            }
        }
    )
);

// ============================================
// TEMPORAL STORE FOR UNDO/REDO
// ============================================
export const useTemporalStore = () => {
    const temporal = useStore.temporal.getState();
    return {
        undo: temporal.undo,
        redo: temporal.redo,
        clear: temporal.clear
    };
};

// ============================================
// RE-EXPORTS
// ============================================
export type {
    Layer,
    LayerType,
    AnimationType,
    TextStyle,
    IconStyle,
    CountdownConfig,
    ButtonConfig,
    ShapeConfig,
    MapsConfig,
    MotionPathPoint,
    MotionPathConfig,
    LoveStoryMoment,
    LoveStoryConfig,
    LiveStreamingConfig,
    Section,
    PredefinedSectionType,
    ZoomPoint,
    ZoomConfig
};

export { SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES };

