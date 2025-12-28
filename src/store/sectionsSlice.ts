import { StateCreator } from 'zustand';
import { Layer, AnimationType } from './layersSlice';
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
    duration: number;
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
    trigger: 'scroll' | 'click' | 'open_btn';
    behavior: 'stay' | 'reset';
    scale: number;
    duration: number;
    transitionDuration: number;
    loop: boolean;
    points: ZoomPoint[];
    selectedPointIndex?: number;
}

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
                    style: 'classic',
                    showDays: true,
                    showHours: true,
                    showMinutes: true,
                    showSeconds: true,
                    backgroundColor: 'transparent',
                    textColor: '#ffffff',
                    accentColor: '#BFA181',
                    labelColor: '#999999',
                    showLabels: true,
                    labels: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }
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

// ============================================
// SLICE IMPLEMENTATION
// ============================================
export const createSectionsSlice: StateCreator<SectionsState> = (set, get) => ({
    sections: createDefaultSections(),
    activeSectionId: 'section-opening',

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
        const result = Array.from(state.sections);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return {
            sections: result.map((s, i) => ({ ...s, order: i }))
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

            const elementWithZ = {
                ...element,
                zIndex: element.zIndex || (maxZ + 1)
            };

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

    updateElementInSection: (sectionId, elementId, updates) => set((state) => ({
        sections: state.sections.map((s) =>
            s.id === sectionId
                ? {
                    ...s,
                    elements: s.elements.map((el) =>
                        el.id === elementId ? { ...el, ...updates } : el
                    )
                }
                : s
        )
    }))
});
