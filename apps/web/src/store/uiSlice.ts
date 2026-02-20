import { StateCreator } from 'zustand';

export interface ImageCropModalState {
    isOpen: boolean;
    imageSrc: string | null;
    targetLayerId: string | null;
    targetSlotIndex: number | null;
    aspectRatio: number;
}

export interface UIState {
    activeTab: 'layers' | 'settings';
    isSidebarOpen: boolean;
    isToolbarExpanded: boolean;
    pathEditingId: string | null;
    isAnimationPlaying: boolean;
    hasHydrated: boolean;

    // NLE TIMELINE STATES
    timelineZoom: number;
    isSnappingEnabled: boolean;
    activeTimelineTool: 'pointer' | 'razor';
    snapLine: number | null; // For the neon vertical guide

    imageCropModal: ImageCropModalState;
    pickingAnchorForId: string | null;

    setTimelineZoom: (zoom: number) => void;
    setSnappingEnabled: (enabled: boolean) => void;
    setActiveTimelineTool: (tool: 'pointer' | 'razor') => void;
    setSnapLine: (posLine: number | null) => void;

    setPickingAnchorForId: (id: string | null) => void;
    setActiveTab: (tab: 'layers' | 'settings') => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setToolbarExpanded: (isExpanded: boolean) => void;
    setPathEditingId: (id: string | null) => void;
    setAnimationPlaying: (isPlaying: boolean) => void;
    setHasHydrated: (h: boolean) => void;
    openImageCropModal: (imageSrc: string, layerId: string, slotIndex: number, aspectRatio?: number) => void;
    closeImageCropModal: () => void;
}

export const createUISlice: StateCreator<UIState> = (set) => ({
    activeTab: 'layers',
    isSidebarOpen: true,
    isToolbarExpanded: false,
    pathEditingId: null,
    isAnimationPlaying: false,
    hasHydrated: false,

    // Default Timeline states
    timelineZoom: 0.1,
    isSnappingEnabled: true,
    activeTimelineTool: 'pointer',
    snapLine: null,

    imageCropModal: {
        isOpen: false,
        imageSrc: null,
        targetLayerId: null,
        targetSlotIndex: null,
        aspectRatio: 1
    },
    pickingAnchorForId: null,

    setTimelineZoom: (timelineZoom) => set({ timelineZoom }),
    setSnappingEnabled: (isSnappingEnabled) => set({ isSnappingEnabled }),
    setActiveTimelineTool: (activeTimelineTool) => set({ activeTimelineTool }),
    setSnapLine: (snapLine) => set({ snapLine }),

    setPickingAnchorForId: (id) => set({ pickingAnchorForId: id }),
    setActiveTab: (activeTab) => set({ activeTab }),
    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    setToolbarExpanded: (isToolbarExpanded) => set({ isToolbarExpanded }),
    setPathEditingId: (pathEditingId) => set({ pathEditingId }),
    setAnimationPlaying: (isAnimationPlaying) => set({ isAnimationPlaying }),
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    openImageCropModal: (imageSrc, targetLayerId, targetSlotIndex, aspectRatio = 1) =>
        set({
            imageCropModal: {
                isOpen: true,
                imageSrc,
                targetLayerId,
                targetSlotIndex,
                aspectRatio
            }
        }),
    closeImageCropModal: () =>
        set({
            imageCropModal: {
                isOpen: false,
                imageSrc: null,
                targetLayerId: null,
                targetSlotIndex: null,
                aspectRatio: 1
            }
        }),
});
