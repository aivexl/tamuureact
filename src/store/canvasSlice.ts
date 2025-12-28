import { StateCreator } from 'zustand';

export interface CanvasState {
    zoom: number;
    pan: { x: number; y: number };
    backgroundColor: string;
    slug: string;
    id?: string; // Real UUID from database
    projectName: string;
    thumbnailUrl?: string; // Optional thumbnail URL
    setId: (id: string) => void;
    setThumbnailUrl: (url: string) => void;
    setProjectName: (name: string) => void;
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;
    setBackgroundColor: (color: string) => void;
    setSlug: (slug: string) => void;
    setCanvasTransform: (transform: { x: number; y: number; zoom: number }) => void;
}

export const createCanvasSlice: StateCreator<CanvasState> = (set) => ({
    zoom: 1,
    pan: { x: 0, y: 0 },
    backgroundColor: '#0a0a0a',
    slug: '',
    projectName: 'New Project',
    thumbnailUrl: undefined,
    id: undefined,
    setZoom: (zoom) => set({ zoom }),
    setPan: (pan) => set({ pan }),
    setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
    setSlug: (slug) => set({ slug }),
    setProjectName: (projectName) => set({ projectName }),
    setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
    setId: (id) => set({ id }),
    setCanvasTransform: ({ x, y, zoom }) => set({ pan: { x, y }, zoom }),
});
