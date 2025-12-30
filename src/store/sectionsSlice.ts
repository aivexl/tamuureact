import { StateCreator } from 'zustand';
import { Layer, AnimationType, sanitizeLayer } from './layersSlice';
import { generateId } from '@/lib/utils';

// ============================================
// SECTION TYPES
// ============================================
export type PredefinedSectionType =
    | 'opening'
    | 'quotes'
    | 'couple'
    | 'event'
    | 'maps'
    | 'rsvp'
    | 'thanks';

export const PREDEFINED_SECTION_TYPES: PredefinedSectionType[] = [
    'opening', 'quotes', 'couple', 'event', 'maps', 'rsvp', 'thanks'
];

export const SECTION_ICONS: Record<PredefinedSectionType | 'custom', string> = {
    opening: '🏠',
    quotes: '💬',
    couple: '💑',
    event: '📅',
    maps: '📍',
    rsvp: '✉️',
    thanks: '🙏',
    custom: '📄'
};

export const SECTION_LABELS: Record<PredefinedSectionType, string> = {
    opening: 'Opening',
    quotes: 'Quotes',
    couple: 'Couple',
    event: 'Event',
    maps: 'Maps',
    rsvp: 'RSVP',
    thanks: 'Thanks'
};

export interface ZoomPoint {
    id: string;
    label: string;
    duration: number; // Stay duration in ms
    transitionDuration?: number; // Movement duration in ms
    color?: string;  // Optional custom color for the zoom box
    targetRegion: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface ZoomConfig {
    enabled: boolean;
    direction: 'in' | 'out';
    trigger: 'scroll' | 'click' | 'open_btn' | 'load';
    behavior: 'stay' | 'reset';
    zoomMode?: 'fit' | 'fill'; // fit = contain, fill = cover
    scale: number;
    duration: number;
    transitionDuration: number;
    loop: boolean;
    points: ZoomPoint[];
    selectedPointIndex?: number;
}

export interface OrbitCanvas {
    backgroundColor: string;
    backgroundUrl?: string;
    isVisible: boolean;
    elements: Layer[];
}

export interface OrbitState {
    left: OrbitCanvas;
    right: OrbitCanvas;
}

export type CanvasContext = 'main' | 'left' | 'right';

// ============================================
// SECTION INTERFACE
// ============================================
export interface PageTransition {
    enabled: boolean;
    effect: 'none' | 'slide-up' | 'slide-down' | 'fade' | 'zoom-reveal' | 'stack-reveal' | 'parallax-reveal' | 'door-reveal' | 'carry-up';
    duration: number;
    trigger: 'open_btn' | 'scroll' | 'auto';
}

export interface Section {
    id: string;
    key: string;              // 'opening', 'couple', 'event', or custom key
    title: string;
    order: number;
    isVisible: boolean;
    backgroundColor: string;
    backgroundUrl?: string;
    overlayOpacity: number;
    animation: AnimationType;
    zoomConfig?: ZoomConfig;
    pageTransition?: PageTransition;
    kenBurnsEnabled?: boolean;
    particleType?: 'none' | 'snow' | 'flowers' | 'bubbles' | 'leaves';
    elements: Layer[];
}

// ============================================
// SECTIONS STATE
// ============================================
export interface SectionsState {
    sections: Section[];
    activeSectionId: string | null;
    musicConfig?: {
        url: string;
        autoplay: boolean;
        loop: boolean;
        volume: number;
    };

    // Project Orbit v2 (Cinematic Stage)
    orbit: OrbitState;
    activeCanvas: CanvasContext;
    setActiveCanvas: (context: CanvasContext) => void;
    updateOrbitCanvas: (canvas: 'left' | 'right', updates: Partial<OrbitCanvas>) => void;
    addOrbitElement: (canvas: 'left' | 'right', element: Layer) => void;
    removeOrbitElement: (canvas: 'left' | 'right', elementId: string) => void;
    updateOrbitElement: (canvas: 'left' | 'right', elementId: string, updates: Partial<Layer>) => void;

    // Actions
    addSection: (section: Partial<Section>) => void;
    removeSection: (id: string) => void;
    updateSection: (id: string, updates: Partial<Section>) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;
    setActiveSection: (id: string | null) => void;
    duplicateSection: (id: string) => void;
    copySectionElementsTo: (sourceSectionId: string, targetSectionId: string) => void;
    clearSectionContent: (sectionId: string) => void;

    // Element actions within section
    addElementToSection: (sectionId: string, element: Layer) => void;
    removeElementFromSection: (sectionId: string, elementId: string) => void;
    updateElementInSection: (sectionId: string, elementId: string, updates: Partial<Layer>) => void;
    duplicateElementInSection: (sectionId: string, elementId: string) => void;
    bringElementToFront: (sectionId: string, elementId: string) => void;
    sendElementToBack: (sectionId: string, elementId: string) => void;
    moveElementUp: (sectionId: string, elementId: string) => void;
    moveElementDown: (sectionId: string, elementId: string) => void;

    // Figma-like Alignment Tools
    alignElements: (sectionId: string, elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
    distributeElements: (sectionId: string, elementIds: string[], direction: 'horizontal' | 'vertical') => void;
    matchSize: (sectionId: string, elementIds: string[], dimension: 'width' | 'height' | 'both') => void;

    sanitizeAllSectionElements: () => void;
}

// ============================================
// DEFAULT SECTIONS
// ============================================
const createDefaultSections = (): Section[] => [
    {
        id: 'section-opening',
        key: 'opening',
        title: 'Opening',
        order: 0,
        isVisible: true,
        backgroundColor: '#0a0a0a',
        overlayOpacity: 0,
        animation: 'fade-in',
        elements: [
            {
                id: 'demo-text-1',
                type: 'text',
                name: 'Welcome Text',
                x: 57,
                y: 200,
                width: 300,
                height: 60,
                rotation: 0,
                scale: 1,
                opacity: 1,
                zIndex: 10,
                isLocked: false,
                isVisible: true,
                content: 'Welcome to Our Day',
                animation: { entrance: 'fade-in', looping: 'float' },
                textStyle: {
                    fontFamily: 'Outfit',
                    fontSize: 28,
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textAlign: 'center',
                    color: '#ffffff'
                }
            },
            {
                id: 'demo-countdown-1',
                type: 'countdown',
                name: 'Countdown Timer',
                x: 57,
                y: 280,
                width: 300,
                height: 80,
                rotation: 0,
                scale: 1,
                opacity: 1,
                zIndex: 11,
                isLocked: false,
                isVisible: true,
                animation: { entrance: 'slide-up' },
                countdownConfig: {
                    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    variant: 'classic',
                    showDays: true,
                    showHours: true,
                    showMinutes: true,
                    showSeconds: true,
                    showLabels: true,
                    showSeparators: true,
                    labels: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' },
                    separatorStyle: 'colon',
                    backgroundColor: 'transparent',
                    textColor: '#ffffff',
                    accentColor: '#BFA181',
                    labelColor: '#999999',
                    fontFamily: 'DM Serif Display',
                    fontSize: 32,
                    fontWeight: 'bold',
                    borderRadius: 8,
                    boxPadding: 12,
                    boxGap: 12,
                    boxShadow: 'none',
                    borderStyle: 'none',
                    animateOnChange: true,
                    animationType: 'fade',
                }
            },
            {
                id: 'demo-button-1',
                type: 'button',
                name: 'Open Invitation',
                x: 107,
                y: 500,
                width: 200,
                height: 50,
                rotation: 0,
                scale: 1,
                opacity: 1,
                zIndex: 12,
                isLocked: false,
                isVisible: true,
                animation: { entrance: 'pop-in', looping: 'pulse' },
                buttonConfig: {
                    buttonText: 'Buka Undangan',
                    buttonColor: '#BFA181',
                    textColor: '#1a1a1a',
                    buttonStyle: 'elegant',
                    buttonShape: 'pill',
                    showIcon: true,
                    iconName: 'MailOpen'
                }
            }
        ]
    },
    {
        id: 'section-couple',
        key: 'couple',
        title: 'Couple',
        order: 1,
        isVisible: true,
        backgroundColor: '#0a0a0a',
        overlayOpacity: 0,
        animation: 'slide-up',
        elements: []
    },
    {
        id: 'section-event',
        key: 'event',
        title: 'Event',
        order: 2,
        isVisible: true,
        backgroundColor: '#0a0a0a',
        overlayOpacity: 0,
        animation: 'slide-up',
        elements: []
    }
];

const createDefaultOrbit = (): OrbitState => ({
    left: {
        backgroundColor: 'transparent',
        isVisible: true,
        elements: []
    },
    right: {
        backgroundColor: 'transparent',
        isVisible: true,
        elements: []
    }
});

// ============================================
// SLICE IMPLEMENTATION
// ============================================
export const createSectionsSlice: StateCreator<SectionsState> = (set, get) => ({
    sections: createDefaultSections(),
    activeSectionId: 'section-opening',
    orbit: createDefaultOrbit(),
    activeCanvas: 'main',

    setActiveCanvas: (context) => set({ activeCanvas: context }),

    updateOrbitCanvas: (canvas, updates) => set((state) => ({
        orbit: {
            ...state.orbit,
            [canvas]: { ...state.orbit[canvas], ...updates }
        }
    })),

    addOrbitElement: (canvas, element) => set((state) => ({
        orbit: {
            ...state.orbit,
            [canvas]: {
                ...state.orbit[canvas],
                elements: [...state.orbit[canvas].elements, sanitizeLayer(element)]
            }
        }
    })),

    removeOrbitElement: (canvas, elementId) => set((state) => ({
        orbit: {
            ...state.orbit,
            [canvas]: {
                ...state.orbit[canvas],
                elements: state.orbit[canvas].elements.filter(el => el.id !== elementId)
            }
        }
    })),

    updateOrbitElement: (canvas, elementId, updates) => set((state) => ({
        orbit: {
            ...state.orbit,
            [canvas]: {
                ...state.orbit[canvas],
                elements: state.orbit[canvas].elements.map(el =>
                    el.id === elementId ? sanitizeLayer({ ...el, ...updates }) : el
                )
            }
        }
    })),

    addSection: (sectionData) => set((state) => {
        const newId = generateId('section');
        const newSection: Section = {
            id: newId,
            key: sectionData.key || 'custom',
            title: sectionData.title || 'New Section',
            order: state.sections.length,
            isVisible: true,
            backgroundColor: sectionData.backgroundColor || '#0a0a0a',
            overlayOpacity: 0,
            animation: 'fade-in',
            elements: [],
            ...sectionData
        };
        return {
            sections: [...state.sections, newSection],
            activeSectionId: newId
        };
    }),

    removeSection: (id) => set((state) => {
        if (state.sections.length <= 1) return state; // Keep at least one section
        const filteredSections = state.sections.filter((s) => s.id !== id);
        return {
            sections: filteredSections.map((s, i) => ({ ...s, order: i })),
            activeSectionId: state.activeSectionId === id
                ? filteredSections[0]?.id || null
                : state.activeSectionId
        };
    }),

    updateSection: (id, updates) => set((state) => ({
        sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
        )
    })),

    reorderSections: (startIndex, endIndex) => set((state) => {
        // CTO FIX: Reordering must operate on the CURRENT SORTED sequence
        const sorted = [...state.sections].sort((a, b) => a.order - b.order);
        const result = Array.from(sorted);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        // Map back to global state with normalized orders
        const updatedSections = state.sections.map(s => {
            const newIndex = result.findIndex(res => res.id === s.id);
            return { ...s, order: newIndex };
        });

        return {
            sections: updatedSections
        };
    }),

    setActiveSection: (id) => set({ activeSectionId: id }),

    duplicateSection: (id) => set((state) => {
        const section = state.sections.find((s) => s.id === id);
        if (!section) return state;

        const newId = generateId('section');
        const newSection: Section = {
            ...section,
            id: newId,
            title: `${section.title} (Copy)`,
            order: state.sections.length,
            elements: section.elements.map((el) => ({
                ...el,
                id: generateId('layer')
            }))
        };
        return {
            sections: [...state.sections, newSection],
            activeSectionId: newId
        };
    }),

    copySectionElementsTo: (sourceId, targetId) => set((state) => {
        const sourceSection = state.sections.find(s => s.id === sourceId);
        const targetSection = state.sections.find(s => s.id === targetId);

        if (!sourceSection || !targetSection) return state;

        const newElements = sourceSection.elements.map(el => ({
            ...el,
            id: generateId(),
            name: `${el.name} (Copy)`
        }));

        return {
            sections: state.sections.map(s =>
                s.id === targetId
                    ? {
                        ...s,
                        elements: [...s.elements, ...newElements],
                        backgroundColor: sourceSection.backgroundColor,
                        backgroundUrl: sourceSection.backgroundUrl,
                        overlayOpacity: sourceSection.overlayOpacity,
                        kenBurnsEnabled: sourceSection.kenBurnsEnabled,
                        particleType: sourceSection.particleType
                    }
                    : s
            )
        };
    }),

    clearSectionContent: (id) => set((state) => ({
        sections: state.sections.map((s) =>
            s.id === id
                ? {
                    ...s,
                    elements: [],
                    backgroundUrl: undefined,
                    backgroundColor: '#0a0a0a',
                    overlayOpacity: 0,
                    kenBurnsEnabled: false,
                    particleType: 'none',
                    zoomConfig: s.zoomConfig ? { ...s.zoomConfig, enabled: false } : undefined
                }
                : s
        )
    })),

    // Element actions within section
    addElementToSection: (sectionId, element) => set((state) => ({
        sections: state.sections.map((s) => {
            if (s.id !== sectionId) return s;

            // CTO AUTO-ORDER: Calculate next highest zIndex
            const maxZ = s.elements.length > 0
                ? Math.max(...s.elements.map(el => el.zIndex || 0))
                : 10;

            const elementWithZ = sanitizeLayer({
                ...element,
                zIndex: element.zIndex || (maxZ + 1)
            });

            return { ...s, elements: [...s.elements, elementWithZ] };
        })
    })),

    removeElementFromSection: (sectionId, elementId) => set((state) => ({
        sections: state.sections.map((s) =>
            s.id === sectionId
                ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) }
                : s
        )
    })),

    updateElementInSection: (sectionId: string, elementId: string, updates: Partial<Layer>) => set((state) => ({
        sections: state.sections.map((s) =>
            s.id === sectionId
                ? {
                    ...s,
                    elements: s.elements.map((el) =>
                        el.id === elementId ? sanitizeLayer({ ...el, ...updates }) : el
                    )
                }
                : s
        )
    })),

    duplicateElementInSection: (sectionId, elementId) => set((state) => {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return state;
        const element = section.elements.find(el => el.id === elementId);
        if (!element) return state;

        const newElement = sanitizeLayer({
            ...element,
            id: generateId('layer'),
            name: `${element.name} (Copy)`,
            x: element.x + 20,
            y: element.y + 20,
            zIndex: Math.max(...section.elements.map(el => el.zIndex || 0)) + 1
        });

        return {
            sections: state.sections.map(s =>
                s.id === sectionId ? { ...s, elements: [...s.elements, newElement] } : s
            )
        };
    }),

    bringElementToFront: (sectionId, elementId) => set((state) => ({
        sections: state.sections.map(s => {
            if (s.id !== sectionId) return s;
            const maxZ = Math.max(...s.elements.map(el => el.zIndex || 0), 0);
            return {
                ...s,
                elements: s.elements.map(el =>
                    el.id === elementId ? { ...el, zIndex: maxZ + 1 } : el
                )
            };
        })
    })),

    sendElementToBack: (sectionId, elementId) => set((state) => ({
        sections: state.sections.map(s => {
            if (s.id !== sectionId) return s;
            const minZ = Math.min(...s.elements.map(el => el.zIndex || 0), 0);
            return {
                ...s,
                elements: s.elements.map(el =>
                    el.id === elementId ? { ...el, zIndex: minZ - 1 } : el
                )
            };
        })
    })),

    moveElementUp: (sectionId, elementId) => set((state) => {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return state;

        const sorted = [...section.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        const idx = sorted.findIndex(el => el.id === elementId);
        if (idx === -1 || idx === sorted.length - 1) return state;

        const current = sorted[idx];
        const next = sorted[idx + 1];
        const tempZ = current.zIndex;
        current.zIndex = next.zIndex;
        next.zIndex = tempZ || 0;

        return {
            sections: state.sections.map(s => s.id === sectionId ? { ...s, elements: [...sorted] } : s)
        };
    }),

    moveElementDown: (sectionId, elementId) => set((state) => {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section) return state;

        const sorted = [...section.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        const idx = sorted.findIndex(el => el.id === elementId);
        if (idx <= 0) return state;

        const current = sorted[idx];
        const prev = sorted[idx - 1];
        const tempZ = current.zIndex;
        current.zIndex = prev.zIndex;
        prev.zIndex = tempZ || 0;

        return {
            sections: state.sections.map(s => s.id === sectionId ? { ...s, elements: [...sorted] } : s)
        };
    }),

    alignElements: (sectionId, elementIds, alignment) => set((state) => {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section || elementIds.length < 1) return state;

        const elementsToAlign = section.elements.filter(el => elementIds.includes(el.id));
        if (elementsToAlign.length === 0) return state;

        // Calculate bounds
        const minX = Math.min(...elementsToAlign.map(el => el.x));
        const maxX = Math.max(...elementsToAlign.map(el => el.x + (el.width || 0)));
        const minY = Math.min(...elementsToAlign.map(el => el.y));
        const maxY = Math.max(...elementsToAlign.map(el => el.y + (el.height || 0)));
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return {
            sections: state.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    elements: s.elements.map(el => {
                        if (!elementIds.includes(el.id)) return el;
                        switch (alignment) {
                            case 'left': return { ...el, x: minX };
                            case 'center': return { ...el, x: centerX - (el.width || 0) / 2 };
                            case 'right': return { ...el, x: maxX - (el.width || 0) };
                            case 'top': return { ...el, y: minY };
                            case 'middle': return { ...el, y: centerY - (el.height || 0) / 2 };
                            case 'bottom': return { ...el, y: maxY - (el.height || 0) };
                            default: return el;
                        }
                    })
                };
            })
        };
    }),

    distributeElements: (sectionId, elementIds, direction) => set((state) => {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section || elementIds.length < 3) return state;

        const elementsToDist = section.elements.filter(el => elementIds.includes(el.id));
        if (elementsToDist.length < 3) return state;

        if (direction === 'horizontal') {
            const sorted = [...elementsToDist].sort((a, b) => a.x - b.x);
            const startX = sorted[0].x;
            const endX = sorted[sorted.length - 1].x;
            const totalWidths = sorted.reduce((sum, el) => sum + (el.width || 0), 0);
            const totalGap = (endX + (sorted[sorted.length - 1].width || 0)) - startX - totalWidths;
            const gap = totalGap / (sorted.length - 1);

            let currentX = startX;
            return {
                sections: state.sections.map(s => {
                    if (s.id !== sectionId) return s;
                    return {
                        ...s,
                        elements: s.elements.map(el => {
                            const sortedIdx = sorted.findIndex(sEl => sEl.id === el.id);
                            if (sortedIdx === -1) return el;
                            if (sortedIdx === 0) return el; // Keep first
                            if (sortedIdx === sorted.length - 1) return el; // Keep last

                            // Calculate proper distribution
                            const prevElementsWidth = sorted.slice(0, sortedIdx).reduce((sum, e) => sum + (e.width || 0), 0);
                            return { ...el, x: startX + prevElementsWidth + (gap * sortedIdx) };
                        })
                    };
                })
            };
        } else {
            const sorted = [...elementsToDist].sort((a, b) => a.y - b.y);
            const startY = sorted[0].y;
            const endY = sorted[sorted.length - 1].y;
            const totalHeights = sorted.reduce((sum, el) => sum + (el.height || 0), 0);
            const totalGap = (endY + (sorted[sorted.length - 1].height || 0)) - startY - totalHeights;
            const gap = totalGap / (sorted.length - 1);

            return {
                sections: state.sections.map(s => {
                    if (s.id !== sectionId) return s;
                    return {
                        ...s,
                        elements: s.elements.map(el => {
                            const sortedIdx = sorted.findIndex(sEl => sEl.id === el.id);
                            if (sortedIdx === -1) return el;
                            if (sortedIdx === 0) return el;
                            if (sortedIdx === sorted.length - 1) return el;

                            const prevElementsHeight = sorted.slice(0, sortedIdx).reduce((sum, e) => sum + (e.height || 0), 0);
                            return { ...el, y: startY + prevElementsHeight + (gap * sortedIdx) };
                        })
                    };
                })
            };
        }
    }),

    matchSize: (sectionId, elementIds, dimension) => set((state) => {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section || elementIds.length < 2) return state;

        const elements = section.elements.filter(el => elementIds.includes(el.id));
        const maxWidth = Math.max(...elements.map(el => el.width || 0));
        const maxHeight = Math.max(...elements.map(el => el.height || 0));

        return {
            sections: state.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    elements: s.elements.map(el => {
                        if (!elementIds.includes(el.id)) return el;
                        return {
                            ...el,
                            width: dimension === 'height' ? el.width : maxWidth,
                            height: dimension === 'width' ? el.height : maxHeight
                        };
                    })
                };
            })
        };
    }),

    sanitizeAllSectionElements: () => set((state) => ({
        sections: state.sections.map((s) => ({
            ...s,
            elements: s.elements.map(sanitizeLayer)
        }))
    }))
});
