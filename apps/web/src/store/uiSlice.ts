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
    imageCropModal: ImageCropModalState;
    pickingAnchorForId: string | null;
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
    imageCropModal: {
        isOpen: false,
        imageSrc: null,
        targetLayerId: null,
        targetSlotIndex: null,
        aspectRatio: 1
    },
    pickingAnchorForId: null,
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
