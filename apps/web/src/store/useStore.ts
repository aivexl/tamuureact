import { create } from 'zustand';
import { temporal } from 'zundo';
import { persist } from 'zustand/middleware';
import { createCanvasSlice, CanvasState } from './canvasSlice';
import { createLayersSlice, LayersState, Layer, LayerType, AnimationType, TextStyle, IconStyle, CountdownConfig, ButtonConfig, ShapeConfig, MapsConfig, MotionPathPoint, MotionPathConfig, LoveStoryMoment, LoveStoryConfig, LiveStreamingConfig } from './layersSlice';
import { createUISlice, UIState } from './uiSlice';
import { createModalSlice, ModalState } from './modalSlice';
import { createSectionsSlice, SectionsState, Section, PredefinedSectionType, SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES, ZoomPoint, ZoomConfig } from './sectionsSlice';
import { createAuthSlice, AuthState } from './authSlice';
import { createClockSlice, ClockState } from './clockSlice';
import { sanitizeValue } from '@/lib/utils';

// ============================================
// COMBINED STORE TYPE
// ============================================
type StoreState = CanvasState & LayersState & UIState & ModalState & SectionsState & AuthState & ClockState & {
    isDirty: boolean;
    setIsDirty: (val: boolean) => void;
    resetAll: () => void;
};

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
                ...createClockSlice(...a),
                isDirty: false,
                setIsDirty: (val) => a[0]({ isDirty: val }),
                resetAll: () => {
                    const state = a[1]() as StoreState;
                    if (state.resetCanvas) state.resetCanvas();
                    if (state.resetLayers) state.resetLayers();
                    if (state.resetSections) state.resetSections();
                }
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
                zoom: state.zoom,
                pan: state.pan,
                slug: state.slug,
                projectName: state.projectName,
                id: state.id,
                music: state.music,
                isPublished: state.isPublished,
                // CRITICAL CTO FIX: guestData MUST NEVER be persisted to localStorage.
                // Persisting identity leads to "Flash of Previous Guest" and state pollution
                // when navigating between different personal links.
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;

                try {
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
                } catch (e) {
                    console.error('[Store] Rehydration failed!', e);
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
    MotionPathPoint, MotionPathConfig, LoveStoryMoment, LoveStoryConfig, LiveStreamingConfig,
    Section,
    PredefinedSectionType,
    ZoomPoint,
    ZoomConfig
};

export { SECTION_ICONS, SECTION_LABELS, PREDEFINED_SECTION_TYPES };
