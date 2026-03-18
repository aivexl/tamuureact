import { StateCreator } from 'zustand';

export interface GuestData {
    id: string;
    name: string;
    check_in_code: string;
    slug: string;
    tier: string;
    table_number?: string;
    guest_count: number;
}

export interface CanvasState {
    zoom: number;
    pan: { x: number; y: number };
    backgroundColor: string;
    slug: string;
    id?: string; // Real UUID from database
    projectName: string;
    thumbnailUrl?: string; // Optional thumbnail URL
    category?: string; // Template category
    templateId?: string; // Source template ID for invitations
    templateType: 'invitation' | 'display';
    isTemplate: boolean;
    isSimulationMode: boolean;
    exportFormat?: 'mobile' | 'desktop' | 'print' | null;
    music?: {
        id: string;
        url: string;
        title: string;
        artist: string;
        source_type: 'library' | 'gdrive' | 'user';
    };
    isPublished: boolean;
    guestData?: GuestData;
    greetingName?: string;
    greetingTier?: string;
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
    setIsSimulationMode: (isSimulationMode: boolean) => void;
    setCategory: (category: string) => void;
    setMusic: (music: CanvasState['music']) => void;
    setIsPublished: (isPublished: boolean) => void;
    setExportFormat: (format: 'mobile' | 'desktop' | 'print' | null) => void;
    setGuestData: (data: GuestData | undefined) => void;
    setGreetingName: (name: string | undefined) => void;
    setGreetingTier: (tier: string | undefined) => void;
    hydrateProject: (data: any) => void;
    resetCanvas: () => void;
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
    isSimulationMode: false,
    category: undefined,
    music: undefined,
    isPublished: false,
    exportFormat: null,
    guestData: undefined,
    greetingName: undefined,
    greetingTier: undefined,
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
    setIsSimulationMode: (isSimulationMode) => set({ isSimulationMode }),
    setCategory: (category) => set({ category }),
    setMusic: (music) => set({ music }),
    setIsPublished: (isPublished) => set({ isPublished }),
    setExportFormat: (exportFormat) => set({ exportFormat }),
    setGuestData: (guestData) => set({ guestData }),
    setGreetingName: (greetingName) => set({ greetingName }),
    setGreetingTier: (greetingTier) => set({ greetingTier }),
    hydrateProject: (data) => set({
        id: data.id,
        slug: data.slug || '',
        projectName: data.name || 'Untitled Design',
        category: data.category || 'Wedding',
        templateId: data.template_id,
        thumbnailUrl: data.thumbnail_url,
        music: data.music,
        isPublished: !!data.is_published,
        isTemplate: false
    }),
    resetCanvas: () => set({
        zoom: 1,
        pan: { x: 0, y: 0 },
        slug: '',
        projectName: 'New Project',
        id: undefined,
        category: undefined,
        music: undefined,
        isPublished: false,
        isSimulationMode: false,
        thumbnailUrl: undefined,
        guestData: undefined
    })
});
