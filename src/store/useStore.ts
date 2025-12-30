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
                    projectName: state.projectName
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
                id: state.id
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // CTO MIGRATION: Sanitize entire state recursively
                    // This removes stale blob:/data: URLs from persisted state
                    const sanitizedPayload = sanitizeValue({
                        layers: state.layers,
                        sections: state.sections,
                        zoom: state.zoom,
                        pan: state.pan,
                        slug: state.slug,
                        projectName: state.projectName,
                        id: state.id
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

