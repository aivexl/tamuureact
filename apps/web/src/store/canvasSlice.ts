import { StateCreator } from 'zustand';

export interface CanvasState {
    zoom: number;
    pan: { x: number; y: number };
    backgroundColor: string;
    slug: string;
    id?: string; // Real UUID from database
    projectName: string;
    thumbnailUrl?: string; // Optional thumbnail URL
    category?: string; // Template category
    templateType: 'invitation' | 'display';
    isTemplate: boolean;
    artist: string;
    source_type: 'library' | 'gdrive';
};
isPublished: boolean;
setId: (id: string) => void;
setThumbnailUrl: (url: string) => void;
setProjectName: (name: string) => void;
setZoom: (zoom: number) => void;
setPan: (pan: { x: number; y: number }) => void;
setBackgroundColor: (color: string) => void;
setSlug: (slug: string) => void;
setCanvasTransform: (transform: { x: number; y: number; zoom: number }) => void;
setTemplateType: (type: 'invitation' | 'display') => void;
setIsTemplate: (isTemplate: boolean) => void;
setCategory: (category: string) => void;
setMusic: (music: CanvasState['music']) => void;
setIsPublished: (isPublished: boolean) => void;
resetStore: () => void;
}

export const createCanvasSlice: StateCreator<CanvasState> = (set) => ({
    zoom: 1,
    pan: { x: 0, y: 0 },
    backgroundColor: '#0a0a0a',
    slug: '',
    projectName: 'New Project',
    thumbnailUrl: undefined,
    id: undefined,
    templateType: 'invitation',
    isTemplate: false,
    category: undefined,
    music: undefined,
    isPublished: false,
    setZoom: (zoom) => set({ zoom }),
    setPan: (pan) => set({ pan }),
    setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
    setSlug: (slug) => set({ slug }),
    setProjectName: (projectName) => set({ projectName }),
    setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
    setId: (id) => set({ id }),
    setCanvasTransform: ({ x, y, zoom }) => set({ pan: { x, y }, zoom }),
    setTemplateType: (templateType) => set({ templateType }),
    setIsTemplate: (isTemplate) => set({ isTemplate }),
    setCategory: (category) => set({ category }),
    setMusic: (music) => set({ music }),
    setIsPublished: (isPublished) => set({ isPublished }),
    resetStore: () => set({
        zoom: 1,
        pan: { x: 0, y: 0 },
        slug: '',
        projectName: 'New Project',
        id: undefined,
        category: undefined,
        music: undefined,
        isPublished: false,
        thumbnailUrl: undefined
    })
});
