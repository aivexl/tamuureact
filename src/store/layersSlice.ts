import { StateCreator } from 'zustand';
import { generateId } from '@/lib/utils';

// ============================================
// ELEMENT TYPES (from tamuu legacy)
// ============================================
export type LayerType =
    | 'image'
    | 'gif'
    | 'text'
    | 'icon'
    | 'countdown'
    | 'button'
    | 'open_invitation_button'
    | 'video'
    | 'sticker'
    | 'shape'
    | 'maps_point'
    | 'rsvp_form'
    | 'guest_wishes'
    | 'lottie'
    | 'flying_bird';

// ============================================
// ANIMATION TYPES
// ============================================
export type AnimationType =
    | 'none'
    | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
    | 'slide-in-left' | 'slide-in-right' | 'slide-out-left' | 'slide-out-right'
    | 'zoom-in' | 'zoom-out' | 'zoom-in-down' | 'zoom-in-up'
    | 'flip-x' | 'flip-y' | 'rotate-in-down-left' | 'rotate-in-down-right'
    | 'bounce' | 'pop-in' | 'blur-in'
    | 'float' | 'pulse' | 'sway' | 'spin' | 'glow' | 'heartbeat' | 'sparkle'
    | 'flap-bob' | 'float-flap' | 'fly-left' | 'fly-right' | 'fly-up' | 'fly-down' | 'fly-random';

// ============================================
// STYLE CONFIGS
// ============================================
export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    lineHeight?: number;
    letterSpacing?: number;
}

export interface IconStyle {
    iconName: string;
    iconColor: string;
    iconSize: number;
}

export interface CountdownConfig {
    targetDate: string;
    style: 'classic' | 'minimal' | 'elegant' | 'flip' | 'card';
    showDays: boolean;
    showHours: boolean;
    showMinutes: boolean;
    showSeconds: boolean;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    labelColor: string;
    showLabels: boolean;
    labels: { days: string; hours: string; minutes: string; seconds: string };
}

export interface ButtonConfig {
    buttonText: string;
    buttonColor: string;
    textColor: string;
    buttonStyle: 'elegant' | 'modern' | 'glass' | 'neon';
    buttonShape: 'pill' | 'rounded' | 'rectangle';
    showIcon: boolean;
    iconName?: string;
}

export interface ShapeConfig {
    shapeType: 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle' | 'diamond' | 'heart' | 'star' | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    pathData?: string;
}

export interface MapsConfig {
    googleMapsUrl: string;
    displayName: string;
    pinColor: string;
    showLabel: boolean;
    showLinkButton: boolean;
    buttonText: string;
}

export interface MotionPathPoint {
    x: number;
    y: number;
    rotation?: number;      // Rotation at this point (degrees, -360 to 360)
    scale?: number;         // Scale at this point (0.1 to 3.0, default 1)
    duration?: number;      // Time to reach this point from previous (ms)
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';  // Easing function
}

export interface MotionPathConfig {
    enabled: boolean;
    points: MotionPathPoint[];
    duration: number;
    loop: boolean;
}

export interface FlyingBirdConfig {
    direction: 'left' | 'right';
    birdColor: string;
    flapSpeed: number;
}

export interface LottieConfig {
    url: string;
    loop: boolean;
    autoplay: boolean;
    speed: number;
    direction: 'left' | 'right';
}

export interface RSVPFormConfig {
    title: string;
    showNameField: boolean;
    showEmailField: boolean;
    showPhoneField: boolean;
    showMessageField: boolean;
    showAttendanceField: boolean;
    buttonColor: string;
    submitButtonText: string;
    style: 'classic' | 'modern' | 'glass';
}

export interface GuestWishesConfig {
    style: 'classic' | 'modern' | 'glass';
    layout: 'list' | 'grid' | 'masonry';
    maxDisplayCount: number;
    showTimestamp: boolean;
    cardBackgroundColor: string;
    textColor: string;
}

export interface OpenInvitationConfig {
    buttonText: string;
    subText?: string;
    buttonStyle: 'elegant' | 'modern' | 'glass' | 'minimal' | 'luxury';
    buttonShape: 'pill' | 'rounded' | 'rectangle';
    fontFamily: string;
    fontSize: number;
    buttonColor: string;
    textColor: string;
    showIcon: boolean;
    iconName?: string;
    enabled: boolean;
    position: 'bottom-center' | 'center';
}

// ============================================
// LAYER INTERFACE
// ============================================
export interface Layer {
    id: string;
    type: LayerType;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
    opacity: number;
    zIndex: number;
    isLocked: boolean;
    isVisible: boolean;

    // Permissions
    canEditPosition?: boolean;
    canEditContent?: boolean;
    isContentProtected?: boolean;
    showCopyButton?: boolean;

    flipHorizontal?: boolean;
    flipVertical?: boolean;
    parallaxFactor?: number;
    animationLoop?: AnimationType | string;

    // Content
    content?: string;
    imageUrl?: string;
    videoUrl?: string;

    // Animations
    animation?: {
        entrance?: AnimationType;
        looping?: AnimationType;
        delay?: number;
        duration?: number;
        trigger?: 'scroll' | 'click' | 'open_btn' | 'load';
    };

    // Filters
    filters?: {
        brightness?: number;
        contrast?: number;
        blur?: number;
        sepia?: number;
    };

    // Type-specific configs
    textStyle?: TextStyle;
    iconStyle?: IconStyle;
    countdownConfig?: CountdownConfig;
    buttonConfig?: ButtonConfig;
    openInvitationConfig?: OpenInvitationConfig;
    shapeConfig?: ShapeConfig;
    mapsConfig?: MapsConfig;
    motionPathConfig?: MotionPathConfig;
    lottieConfig?: LottieConfig;
    flyingBirdConfig?: FlyingBirdConfig;
    rsvpFormConfig?: RSVPFormConfig;
    guestWishesConfig?: GuestWishesConfig;
}

// ============================================
// LAYERS STATE
// ============================================
export interface LayersState {
    layers: Layer[];
    selectedLayerId: string | null;
    addLayer: (layer: Layer) => void;
    removeLayer: (id: string) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    selectLayer: (id: string | null) => void;
    duplicateLayer: (id: string) => void;
    reorderLayers: (startIndex: number, endIndex: number) => void;
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;

    // Clipboard
    clipboard: Layer | null;
    copyLayer: (layer: Layer) => void;
}

// ============================================
// DEFAULT DEMO LAYERS
// ============================================
const createDefaultLayers = (): Layer[] => [
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
        x: 37,
        y: 350,
        width: 340,
        height: 100,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 10,
        isLocked: false,
        isVisible: true,
        animation: { entrance: 'zoom-in' },
        countdownConfig: {
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            style: 'elegant',
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            backgroundColor: 'transparent',
            textColor: '#ffffff',
            accentColor: '#bfa181',
            labelColor: '#888888',
            showLabels: true,
            labels: { days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }
        }
    },
    {
        id: 'demo-button-1',
        type: 'button',
        name: 'Open Button',
        x: 67,
        y: 520,
        width: 280,
        height: 60,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 20,
        isLocked: false,
        isVisible: true,
        animation: { entrance: 'slide-up', looping: 'glow' },
        buttonConfig: {
            buttonText: 'Buka Undangan',
            buttonColor: '#bfa181',
            textColor: '#0a0a0a',
            buttonStyle: 'elegant',
            buttonShape: 'pill',
            showIcon: true,
            iconName: 'mail-open'
        }
    }
];

// ============================================
// SLICE IMPLEMENTATION
// ============================================
export const createLayersSlice: StateCreator<LayersState> = (set, get) => ({
    layers: createDefaultLayers(),
    selectedLayerId: null,
    clipboard: null,

    addLayer: (layer) => set((state) => ({
        layers: [...state.layers, layer],
        selectedLayerId: layer.id
    })),

    removeLayer: (id) => set((state) => ({
        layers: state.layers.filter((l) => l.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
    })),

    updateLayer: (id, updates) => set((state) => ({
        layers: state.layers.map((l) => l.id === id ? { ...l, ...updates } : l)
    })),

    selectLayer: (selectedLayerId) => set({ selectedLayerId }),

    duplicateLayer: (id) => {
        const state = get();
        const layer = state.layers.find(l => l.id === id);
        if (!layer) return;

        const newLayer: Layer = {
            ...layer,
            id: generateId('layer'),
            name: `${layer.name} (Copy)`,
            x: layer.x + 20,
            y: layer.y + 20
        };

        set((state) => ({
            layers: [...state.layers, newLayer],
            selectedLayerId: newLayer.id
        }));
    },

    reorderLayers: (startIndex, endIndex) => set((state) => {
        const newLayers = Array.from(state.layers);
        const [removed] = newLayers.splice(startIndex, 1);
        newLayers.splice(endIndex, 0, removed);
        return { layers: newLayers };
    }),

    bringToFront: (id) => set((state) => {
        const maxZ = Math.max(...state.layers.map(l => l.zIndex));
        return {
            layers: state.layers.map(l => l.id === id ? { ...l, zIndex: maxZ + 1 } : l)
        };
    }),

    sendToBack: (id) => set((state) => {
        const minZ = Math.min(...state.layers.map(l => l.zIndex));
        return {
            layers: state.layers.map(l => l.id === id ? { ...l, zIndex: minZ - 1 } : l)
        };
    }),

    copyLayer: (layer) => set({ clipboard: layer })
});
