import React, { useState, useEffect, useRef } from 'react';
import { m, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
import {
    GripVertical,
    Eye,
    EyeOff,
    ChevronDown,
    Plus,
    Sparkles,
    Settings2,
    Check,
    Save,
    Layout,
    AlertCircle,
    Power
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { PremiumLoader } from '../ui/PremiumLoader';
import { UserKonvaPreview } from './UserKonvaPreview';
import { UserElementEditor } from './UserElementEditor';
import { useStore } from '@/store/useStore';
import { useParams } from 'react-router-dom';
import { getPublicDomain } from '@/lib/utils';
import { invitations as invitationsApi } from '@/lib/api';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ============================================
// SUB-COMPONENTS
// ============================================

interface SectionItemProps {
    section: any;
    expandedSection: string | null;
    toggleExpand: (id: string) => void;
    toggleVisibility: (e: React.MouseEvent, id: string) => void;
    handleSave: () => Promise<void>;
    saveStatus: SaveStatus;
}

const SectionItem: React.FC<SectionItemProps> = ({
    section,
    expandedSection,
    toggleExpand,
    toggleVisibility,
    handleSave,
    saveStatus
}) => {
    const controls = useDragControls();
    // Use REF for instant state checking in same event loop
    const wasDraggingRef = useRef(false);

    // Citadel Toggle: Explicitly block expansion if we just dragged
    const handleExpandToggle = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (wasDraggingRef.current) return;
        toggleExpand(id);
    };

    return (
        <Reorder.Item
            value={section}
            dragListener={false}
            dragControls={controls}
            onDragStart={() => {
                wasDraggingRef.current = true;
            }}
            onDragEnd={() => {
                // Keep true long enough to consume the trailing click event
                setTimeout(() => {
                    wasDraggingRef.current = false;
                }, 10);
            }}
            className="relative group h-full list-none"
            whileDrag={{
                scale: 1.02,
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
                zIndex: 100
            }}
        >
            <div
                className={`bg-white rounded-[3rem] border transition-all duration-700 overflow-hidden flex ${expandedSection === section.id
                    ? 'border-indigo-100 shadow-xl'
                    : 'border-slate-100 shadow-sm hover:shadow-md'
                    }`}
            >
                {/* 1. THE FORTRESS DRAG STRIP - PHYSICALLY DISTINCT COLUMN */}
                <div
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        controls.start(e);
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="w-16 md:w-20 bg-slate-50 border-r border-slate-100 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-indigo-600 transition-all touch-none relative z-[80] pointer-events-auto select-none hover:bg-slate-100"
                >
                    <GripVertical className="w-6 h-6" />
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col pointer-events-none relative">
                    {/* Header Area */}
                    <div className="p-8 flex items-center gap-6">
                        {/* THE CITADEL: TRIGGER REDUCTION */}
                        {/* Thumbnail Icon Area - PRIMARY TRIGGER */}
                        <div
                            onClick={(e) => handleExpandToggle(e, section.id)}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-inner cursor-pointer pointer-events-auto z-20 hover:scale-110 active:scale-95 ${section.isVisible ? 'bg-slate-50 text-slate-600' : 'bg-slate-100 text-slate-400 grayscale'
                                }`}
                        >
                            <Layout className="w-7 h-7" />
                        </div>

                        {/* Title Info - NO TRIGGER (Display Only) */}
                        <div className="flex-1">
                            <h4 className={`text-xl font-black tracking-tight font-outfit transition-all duration-500 ${section.isVisible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                {section.title}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                {section.elements?.length || 0} Dynamic Layers
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Visibility Toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVisibility(e, section.id);
                                }}
                                className={`p-3.5 rounded-2xl border transition-all duration-500 pointer-events-auto z-20 ${section.isVisible
                                    ? 'bg-white text-slate-400 border-slate-100 hover:text-indigo-500 hover:border-indigo-100'
                                    : 'bg-slate-50 text-slate-300 border-transparent hover:text-slate-400'
                                    }`}
                            >
                                {section.isVisible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                            </button>

                            {/* Chevron Toggle - SECONDARY TRIGGER */}
                            <button
                                onClick={(e) => handleExpandToggle(e, section.id)}
                                className={`p-3.5 rounded-2xl border border-transparent transition-all duration-700 pointer-events-auto z-20 hover:bg-slate-50 active:scale-95 ${expandedSection === section.id ? 'rotate-180 bg-indigo-50 text-indigo-500' : 'text-slate-300'}`}
                            >
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Section Body */}
                    <AnimatePresence>
                        {expandedSection === section.id && (
                            <m.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="border-t border-slate-50/50 overflow-hidden pointer-events-auto"
                            >
                                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white">
                                    {/* Left: Preview */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Render</span>
                                        </div>
                                        <div className="relative group/preview flex items-center justify-center p-0 bg-slate-50/50 rounded-[3rem] border border-slate-100 overflow-hidden min-h-[500px]">
                                            {/* LEFT ORBIT PREVIEW (MUTED) */}
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[18%] h-[60%] opacity-20 group-hover/preview:opacity-100 transition-all duration-1000 rounded-r-[2rem] overflow-hidden border border-slate-200/50 shadow-2xl scale-90 group-hover/preview:scale-100 blur-[2px] group-hover/preview:blur-0">
                                                <UserKonvaPreview canvasType="orbit-left" />
                                            </div>

                                            {/* CLEAN VIEWPORT - No frame, no bezel, pure design parity */}
                                            <div className="relative w-full max-w-[414px] mx-auto z-10 flex items-center justify-center">
                                                <div className="relative aspect-[9/20.5] w-full bg-[#0a0a0a] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-200/20 overflow-hidden">
                                                    <UserKonvaPreview sectionId={section.id} />
                                                </div>
                                            </div>

                                            {/* RIGHT ORBIT PREVIEW (MUTED) */}
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[18%] h-[60%] opacity-20 group-hover/preview:opacity-100 transition-all duration-1000 rounded-l-[2rem] overflow-hidden border border-slate-200/50 shadow-2xl scale-90 group-hover/preview:scale-100 blur-[2px] group-hover/preview:blur-0">
                                                <UserKonvaPreview canvasType="orbit-right" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Content Editors */}
                                    <div className="space-y-6 flex flex-col h-full">
                                        <div className="px-2 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Layer Configuration</span>
                                            <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:gap-2">
                                                <Settings2 className="w-4 h-4" />
                                                Pro Designer
                                            </button>
                                        </div>
                                        <div className="space-y-5 flex-1">
                                            {(() => {
                                                const editableElements = (section.elements || []).filter((el: any) => {
                                                    if (el.canEditContent === true) return true;
                                                    const p = el.permissions;
                                                    // If no permissions object, default to false (Locked by Default)
                                                    if (!p) return false;
                                                    // Check for visibility OR any of the edit permissions
                                                    return p.isVisibleInUserEditor || p.canEditText || p.canEditImage || p.canEditStyle || p.canEditContent || p.canEditPosition;
                                                });

                                                if (editableElements.length > 0) {
                                                    return editableElements.map((element: any) => (
                                                        <UserElementEditor
                                                            key={element.id}
                                                            element={element}
                                                            sectionId={section.id}
                                                        />
                                                    ));
                                                }
                                                return (
                                                    <div className="p-16 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                            <Settings2 className="w-8 h-8 text-slate-200" />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                                                            Locked by Admin System <br />
                                                            <span className="text-[8px] opacity-70 font-bold">Safe-mode active for this section</span>
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Section Save Button - Proportional Right Alignment */}
                                        <div className="pt-8 mt-auto flex justify-end">
                                            <m.button
                                                onClick={handleSave}
                                                disabled={saveStatus === 'saving'}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`min-w-[160px] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 ${saveStatus === 'saving'
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : saveStatus === 'saved'
                                                        ? 'bg-emerald-500 text-white'
                                                        : saveStatus === 'error'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-slate-950 text-white hover:bg-slate-900 border border-white/10'
                                                    }`}
                                            >
                                                {saveStatus === 'saving' && <PremiumLoader variant="inline" color="white" />}
                                                {saveStatus === 'saved' && <Check className="w-4 h-4" />}
                                                {saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                                                {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan!' : saveStatus === 'error' ? 'Gagal' : 'Simpan'}
                                            </m.button>
                                        </div>
                                    </div>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Reorder.Item>
    );
};

export const TemplateEditArea: React.FC = () => {
    const { id: invitationId } = useParams<{ id: string }>();
    const {
        sections,
        updateSectionsBatch,
        updateSection,
        orbit,
        updateOrbitCanvas,
        slug,
        isPublished,
        setIsPublished,
        showModal
    } = useStore();

    const queryClient = useQueryClient();

    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'invitation' | 'orbit'>('invitation');
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [isReordering, setIsReordering] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // CITADEL: Strict Init Protection
    const hasInitializedRef = useRef(false);

    // FORTRESS: Local State Buffering
    const [localSections, setLocalSections] = useState(sections);
    const isInternalUpdate = useRef(false);

    // Sync store -> local
    useEffect(() => {
        if (!isInternalUpdate.current) {
            console.log('[Editor] Syncing store sections to local state:', sections.length);
            const sorted = [...sections].sort((a, b) => a.order - b.order);
            setLocalSections(sorted);

            // Auto-expand first section if nothing is expanded and we have data
            if (sorted.length > 0 && !expandedSection) {
                setExpandedSection(sorted[0].id);
            }
        }
    }, [sections]);

    // Set first section as expanded ONLY ON INITIAL MOUNT
    useEffect(() => {
        if (localSections.length > 0 && !hasInitializedRef.current) {
            setExpandedSection(localSections[0].id);
            hasInitializedRef.current = true;
        }
    }, [localSections]);

    // Manual save function
    const handleSave = async () => {
        if (!invitationId) return;

        setSaveStatus('saving');
        try {
            console.log('[Save] Saving invitation changes...');
            await invitationsApi.update(invitationId, {
                sections,
                orbit_layers: orbit,
                music: useStore.getState().music
            });
            setSaveStatus('saved');
            console.log('[Save] Changes saved successfully');

            // Invalidate queries to sync dashboard
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });

            // Reset to idle after 3 seconds
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('[Save] Failed to save:', error);
            setSaveStatus('error');
        }
    };


    const toggleExpand = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const toggleOrbitVisibility = (side: 'left' | 'right') => {
        updateOrbitCanvas(side, { isVisible: !orbit[side].isVisible });
    };

    const toggleVisibility = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const section = sections.find(s => s.id === id);
        if (section) {
            updateSection(id, { isVisible: !section.isVisible });
        }
    };

    const handleReorder = (reordered: typeof localSections) => {
        isInternalUpdate.current = true;
        setLocalSections(reordered);

        // Normalize orders and update store
        const normalized = reordered.map((s, idx) => ({ ...s, order: idx }));
        updateSectionsBatch(normalized);

        // Release internal update lock after store has likely settled
        setTimeout(() => {
            isInternalUpdate.current = false;
        }, 100);
    };

    const handlePreview = () => {
        // BILLIONAIRE PATHING: Fallback to UUID if slug is missing
        const previewSlug = slug || invitationId;
        if (previewSlug) {
            // UNICORN STEERING: Force use of root domain (tamuu.id) instead of app subdomain
            const publicDomain = getPublicDomain();
            const targetUrl = `${window.location.protocol}//${publicDomain}/${previewSlug}`;

            console.log('[Preview] Opening:', targetUrl);
            window.open(targetUrl, '_blank');
        } else {
            console.error('[Preview] Critical Error: Both Slug and ID are missing');
            showModal({
                title: 'Gagal Membuat Preview',
                message: 'Maaf, link preview tidak bisa dibuat karena data identitas undangan tidak lengkap. Hubungi admin.',
                type: 'error'
            });
        }
    };

    const handleTogglePublished = async (val: boolean) => {
        if (isUpdatingStatus || !invitationId) return;
        setIsUpdatingStatus(true);
        try {
            await invitationsApi.update(invitationId, { is_published: val });
            setIsPublished(val);
            // Invalidate queries to sync dashboard
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
        } catch (err: any) {
            console.error('[TemplateEditArea] Failed to update status:', err);
            showModal({
                title: 'Gagal Update Status',
                message: `Gagal memperbarui status publikasi: ${err.message || 'Error tidak diketahui'}`,
                type: 'error'
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="space-y-8 pb-32 font-outfit">
            {/* PREMIUM TAB SWITCHER */}
            <div className="flex justify-center mb-8 sm:mb-12 px-4">
                <div className="bg-white/80 backdrop-blur-xl p-1.5 sm:p-2 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-xl flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('invitation')}
                        className={`flex-1 sm:flex-none px-4 sm:px-10 py-3 sm:py-4 rounded-[1.5rem] sm:rounded-[2.5rem] text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-700 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'invitation'
                            ? 'bg-slate-900 text-white shadow-xl'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
                            }`}
                    >
                        <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Tampilan
                    </button>
                    <button
                        onClick={() => setActiveTab('orbit')}
                        className={`flex-1 sm:flex-none px-4 sm:px-10 py-3 sm:py-4 rounded-[1.5rem] sm:rounded-[2.5rem] text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-700 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'orbit'
                            ? 'bg-slate-900 text-white shadow-xl'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
                            }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Stage
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-lg group transition-transform duration-700 hover:rotate-[15deg] shrink-0">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                            {activeTab === 'invitation' ? 'Konten Undangan' : 'Stage Cinematic'}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.25em] truncate">
                            {activeTab === 'invitation' ? 'Edit bagian yang diizinkan admin' : 'Konfigurasi sayap cinematic'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Status Toggle - Mobile: Top / Desktop: Last */}
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTogglePublished(!isPublished)}
                        disabled={isUpdatingStatus}
                        className={`group relative flex items-center gap-3 p-1.5 pr-4 bg-white rounded-2xl border transition-all duration-300 w-full lg:w-auto h-[52px] sm:h-[56px] ${isPublished ? 'border-teal-100 shadow-sm' : 'border-slate-100 shadow-sm'} ${isUpdatingStatus ? 'opacity-50' : ''} order-first lg:order-last`}
                    >
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${isPublished ? 'text-teal-600 bg-teal-50' : 'text-slate-400 bg-slate-50'}`}>
                            {isUpdatingStatus ? <PremiumLoader variant="inline" color={isPublished ? '#0d9488' : '#94a3b8'} /> : <Power className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <div className="text-left min-w-[100px]">
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-tight">Status Undangan</p>
                            <div className="flex items-center gap-1">
                                <p className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${isPublished ? 'text-teal-500' : 'text-slate-400'}`}>
                                    {isPublished ? 'Online & Publik' : 'Mode Draft'}
                                </p>
                                {isPublished && <Sparkles className="w-2.5 h-2.5 text-teal-400" />}
                            </div>
                        </div>
                        <div className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full p-1 transition-all duration-500 relative ${isPublished ? 'bg-teal-500' : 'bg-slate-100'}`}>
                            <m.div
                                animate={{ x: isPublished ? (window.innerWidth < 640 ? 20 : 20) : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-md flex items-center justify-center"
                            >
                                {isPublished && <div className="w-1 h-1 rounded-full bg-teal-500" />}
                            </m.div>
                        </div>
                    </m.button>

                    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                        <m.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePreview}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-white text-slate-700 font-black text-[10px] sm:text-xs rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all uppercase tracking-widest h-[52px] sm:h-[56px]"
                        >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Preview
                        </m.button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'invitation' ? (
                    <m.div
                        key="invitation-list"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                    >
                        <Reorder.Group
                            axis="y"
                            values={localSections}
                            onReorder={handleReorder}
                            className="space-y-6"
                        >
                            {localSections.map((section) => (
                                <SectionItem
                                    key={section.id}
                                    section={section}
                                    expandedSection={expandedSection}
                                    toggleExpand={toggleExpand}
                                    toggleVisibility={toggleVisibility}
                                    handleSave={handleSave}
                                    saveStatus={saveStatus}
                                />
                            ))}
                        </Reorder.Group>
                    </m.div >
                ) : (
                    <m.div
                        key="orbit-list"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-8"
                    >
                        {/* ORBIT CARDS GRID */}
                        <div className="grid grid-cols-1 gap-8">
                            {/* ORBIT LEFT CARD */}
                            <div className="bg-white/90 backdrop-blur-3xl rounded-none border border-slate-200 shadow-2xl overflow-hidden group/orbit transition-all duration-1000">
                                <div className="p-0 grid grid-cols-1 xl:grid-cols-2 gap-0">
                                    <div className="space-y-0 relative">
                                        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-30 pointer-events-none">
                                            <div className="flex items-center gap-4 pointer-events-auto bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center transition-all duration-700 group-hover/orbit:rotate-[15deg] group-hover/orbit:scale-110 shadow-inner">
                                                    <Layout className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 tracking-tight text-lg uppercase">Stage Kiri</h4>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Cinematic Master Stage</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleOrbitVisibility('left')}
                                                className={`p-4 rounded-[2rem] border transition-all duration-700 pointer-events-auto ${orbit.left.isVisible
                                                    ? 'bg-white text-slate-400 border-slate-100 hover:text-indigo-500 shadow-xl'
                                                    : 'bg-slate-50 text-slate-300 shadow-inner'
                                                    }`}
                                            >
                                                {orbit.left.isVisible ? <Eye className="w-7 h-7" /> : <EyeOff className="w-7 h-7" />}
                                            </button>
                                        </div>
                                        <div className="aspect-[800/896] bg-slate-950 rounded-none overflow-visible shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border-r border-white/10 transition-transform duration-1000 group-hover/orbit:scale-[1.01]">
                                            <UserKonvaPreview canvasType="orbit-left" />
                                        </div>
                                    </div>
                                    <div className="space-y-8 p-12 overflow-y-auto max-h-[896px]">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Orbit Layer Matrix</span>
                                        <div className="space-y-5">
                                            {orbit.left.elements && orbit.left.elements.filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false).length > 0 ? (
                                                orbit.left.elements
                                                    .filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false)
                                                    .map(element => (
                                                        <UserElementEditor
                                                            key={`orbit-left-${element.id}`}
                                                            element={element}
                                                            sectionId="orbit-left"
                                                        />
                                                    ))
                                            ) : (
                                                <div className="p-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-indigo-100/50 shadow-inner">
                                                    <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                                                        Immutable Orbit Stage <br />
                                                        <span className="text-[8px] opacity-70 font-bold">This section uses system-locked assets</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ORBIT RIGHT CARD */}
                            <div className="bg-white/90 backdrop-blur-3xl rounded-none border border-slate-200 shadow-2xl overflow-hidden group/orbit transition-all duration-1000">
                                <div className="p-0 grid grid-cols-1 xl:grid-cols-2 gap-0">
                                    <div className="space-y-0 relative">
                                        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-30 pointer-events-none">
                                            <div className="flex items-center gap-4 pointer-events-auto bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white">
                                                <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center transition-all duration-700 group-hover/orbit:rotate-[15deg] group-hover/orbit:scale-110 shadow-inner">
                                                    <Layout className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 tracking-tight text-lg uppercase">Stage Kanan</h4>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Cinematic Master Stage</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleOrbitVisibility('right')}
                                                className={`p-4 rounded-[2rem] border transition-all duration-700 pointer-events-auto ${orbit.right.isVisible
                                                    ? 'bg-white text-slate-400 border-slate-100 hover:text-teal-500 shadow-xl'
                                                    : 'bg-slate-50 text-slate-300 shadow-inner'
                                                    }`}
                                            >
                                                {orbit.right.isVisible ? <Eye className="w-7 h-7" /> : <EyeOff className="w-7 h-7" />}
                                            </button>
                                        </div>
                                        <div className="aspect-[800/896] bg-slate-950 rounded-none overflow-visible shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border-r border-white/10 transition-transform duration-1000 group-hover/orbit:scale-[1.01]">
                                            <UserKonvaPreview canvasType="orbit-right" />
                                        </div>
                                    </div>
                                    <div className="space-y-8 p-12 overflow-y-auto max-h-[896px]">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Orbit Layer Matrix</span>
                                        <div className="space-y-5">
                                            {orbit.right.elements && orbit.right.elements.filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false).length > 0 ? (
                                                orbit.right.elements
                                                    .filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false)
                                                    .map(element => (
                                                        <UserElementEditor
                                                            key={`orbit-right-${element.id}`}
                                                            element={element}
                                                            sectionId="orbit-right"
                                                        />
                                                    ))
                                            ) : (
                                                <div className="p-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-teal-100/50 shadow-inner">
                                                    <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                                                        Immutable Orbit Stage <br />
                                                        <span className="text-[8px] opacity-70 font-bold">This section uses system-locked assets</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence >
        </div >
    );
};
