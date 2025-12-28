import { StateCreator } from 'zustand';

export interface UIState {
    activeTab: 'layers' | 'settings';
    isSidebarOpen: boolean;
    isToolbarExpanded: boolean;
    pathEditingId: string | null;
    isAnimationPlaying: boolean;
    hasHydrated: boolean;
    setActiveTab: (tab: 'layers' | 'settings') => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setToolbarExpanded: (isExpanded: boolean) => void;
    setPathEditingId: (id: string | null) => void;
    setAnimationPlaying: (isPlaying: boolean) => void;
    setHasHydrated: (h: boolean) => void;
}

export const createUISlice: StateCreator<UIState> = (set) => ({
    activeTab: 'layers',
    isSidebarOpen: true,
    isToolbarExpanded: false,
    pathEditingId: null,
    isAnimationPlaying: false,
    hasHydrated: false,
    setActiveTab: (activeTab) => set({ activeTab }),
    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    setToolbarExpanded: (isToolbarExpanded) => set({ isToolbarExpanded }),
    setPathEditingId: (pathEditingId) => set({ pathEditingId }),
    setAnimationPlaying: (isAnimationPlaying) => set({ isAnimationPlaying }),
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
});
