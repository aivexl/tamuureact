import { create } from 'zustand';
import { temporal } from 'zundo';
import { persist } from 'zustand/middleware';
import { createCanvasSlice, CanvasState } from './canvasSlice';
import { createLayersSlice, LayersState, Layer, LayerType, AnimationType, TextStyle, IconStyle, CountdownConfig, ButtonConfig, ShapeConfig, MapsConfig, MotionPathPoint, MotionPathConfig } from './layersSlice';
import { createUISlice, UIState } from './uiSlice';
import { createSectionsSlice, SectionsState, Section, PredefinedSectionType, SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES, ZoomPoint, ZoomConfig } from './sectionsSlice';
import { sanitizeValue } from '@/lib/utils';

// ============================================
// COMBINED STORE TYPE
// ============================================
type StoreState = CanvasState & LayersState & UIState & SectionsState;

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
                ...createSectionsSlice(...a),
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
                    slug: state.slug,
                    projectName: state.projectName,
                    orbit: state.orbit
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
                orbit: state.orbit
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // CTO CRITICAL FIX: Ensure all sections have valid .elements arrays
                    // This prevents crashes on initial render when local storage has corrupted data
                    let sections = Array.isArray(state.sections)
                        ? state.sections
                            .filter((s: any) => s && typeof s === 'object')
                            .map((s: any) => ({
                                ...s,
                                id: s.id || `section-${Date.now()}`,
                                elements: Array.isArray(s.elements) ? s.elements : []
                            }))
                        : [];

                    // If no valid sections exist, create a default one
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

                    const layers = Array.isArray(state.layers) ? state.layers.filter((l: any) => l && typeof l === 'object') : [];

                    const sanitizedPayload = sanitizeValue({
                        layers,
                        sections,
                        zoom: state.zoom,
                        pan: state.pan,
                        slug: state.slug,
                        projectName: state.projectName,
                        id: state.id,
                        orbit: state.orbit,
                        activeSectionId: sections[0]?.id || null
                    });

                    // Update state with sanitized values
                    Object.assign(state, sanitizedPayload);

                    state.setHasHydrated(true);
                    console.log('[Store] Rehydration complete with recursive sanitization.');
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
    Section,
    PredefinedSectionType,
    ZoomPoint,
    ZoomConfig
};

export { SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES };

