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
    Power,
    FileText,
    Send
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { PremiumLoader } from '../ui/PremiumLoader';
import { UserKonvaPreview } from './UserKonvaPreview';
import { UserElementEditor } from './UserElementEditor';
import { useStore } from '@/store/useStore';
import { useParams, useNavigate } from 'react-router-dom';
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
    const wasDraggingRef = useRef(false);
    const { user, templateId } = useStore();
    const navigate = useNavigate();

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
            onDragStart={() => { wasDraggingRef.current = true; }}
            onDragEnd={() => { setTimeout(() => { wasDraggingRef.current = false; }, 10); }}
            className="relative group h-full list-none"
            whileDrag={{ scale: 1.01, zIndex: 100 }}
        >
            <div className={`bg-white rounded-[2rem] sm:rounded-[3rem] border transition-all duration-700 overflow-hidden flex ${expandedSection === section.id ? 'border-indigo-100 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                
                {/* 1. COMPACT DRAG STRIP - MOBILE FIRST */}
                <div
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); controls.start(e); }}
                    className="w-10 md:w-20 bg-slate-50/50 border-r border-slate-100 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-indigo-600 transition-all pointer-events-auto select-none"
                >
                    <GripVertical className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-4 sm:p-8 flex items-center gap-3 sm:gap-6">
                        <div
                            id="tutorial-section-expand"
                            onClick={(e) => handleExpandToggle(e, section.id)}
                            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-inner cursor-pointer hover:scale-105 active:scale-95 ${section.isVisible ? 'bg-slate-50 text-slate-600' : 'bg-slate-100 text-slate-400 grayscale'}`}
                        >
                            <Layout className="w-5 h-5 sm:w-7 h-7" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm sm:text-xl font-black tracking-tight font-outfit truncate ${section.isVisible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                {section.title}
                            </h4>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {section.elements?.length || 0} Layers
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                            <button
                                id="tutorial-section-visible"
                                onClick={(e) => toggleVisibility(e, section.id)}
                                className={`p-2 sm:p-3.5 rounded-lg sm:rounded-2xl border transition-all ${section.isVisible ? 'bg-white text-slate-400 border-slate-100' : 'bg-slate-50 text-slate-300 border-transparent'}`}
                            >
                                {section.isVisible ? <Eye className="w-4 h-4 sm:w-6 h-6" /> : <EyeOff className="w-4 h-4 sm:w-6 h-6" />}
                            </button>

                            <button
                                onClick={(e) => handleExpandToggle(e, section.id)}
                                className={`p-2 sm:p-3.5 rounded-lg sm:rounded-2xl border border-transparent transition-all ${expandedSection === section.id ? 'rotate-180 bg-indigo-50 text-indigo-500' : 'text-slate-300'}`}
                            >
                                <ChevronDown className="w-4 h-4 sm:w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedSection === section.id && (
                            <m.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="border-t border-slate-50 overflow-hidden"
                            >
                                <div className="p-4 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 bg-white">
                                    {/* Left: Preview */}
                                    <div className="space-y-4">
                                        <div className="relative group/preview flex items-center justify-center bg-slate-50/50 rounded-2xl sm:rounded-[3rem] border border-slate-100 overflow-hidden min-h-[300px] sm:min-h-[500px]">
                                            <div className="relative w-full max-w-[280px] sm:max-w-[414px] mx-auto z-10">
                                                <div className="relative aspect-[9/20.5] w-full bg-[#0a0a0a] shadow-2xl overflow-hidden rounded-lg">
                                                    <UserKonvaPreview sectionId={section.id} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Content Editors */}
                                    <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
                                        <div className="space-y-4 flex-1">
                                            {(() => {
                                                const allElements = [...(section.elements || []), ...(section.layers || [])];
                                                const editableElements = allElements.filter((el: any) => {
                                                    const p = el.permissions;
                                                    const type = el.type || '';
                                                    const nameStr = (el.name || '').toLowerCase();
                                                    const isCriticalType = 
                                                        type === 'profile_card' || nameStr.includes('profil') ||
                                                        type === 'gift_address' || nameStr.includes('kado') || nameStr.includes('gift') || nameStr.includes('rekening') ||
                                                        type === 'digital_gift' ||
                                                        type === 'rsvp_wishes' || nameStr.includes('rsvp') || nameStr.includes('ucapan') ||
                                                        type === 'countdown' || nameStr.includes('countdown') ||
                                                        type === 'maps_point' || nameStr.includes('lokasi') || nameStr.includes('map');

                                                    if (isCriticalType) return true;
                                                    if (!p) return el.canEditContent === true || el.isVisibleInUserEditor === true;
                                                    return p.isVisibleInUserEditor || p.canEditText || p.canEditImage || p.canEditStyle || p.canEditContent;
                                                });

                                                if (editableElements.length > 0) {
                                                    return editableElements.map((element: any) => (
                                                        <UserElementEditor key={element.id} element={element} sectionId={section.id} />
                                                    ));
                                                }
                                                return (
                                                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Locked by Admin</p>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="pt-4 mt-auto flex justify-end">
                                            <m.button
                                                onClick={handleSave}
                                                disabled={saveStatus === 'saving'}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${saveStatus === 'saving' ? 'bg-slate-100 text-slate-400' : saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}
                                            >
                                                {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'saved' ? 'Tersimpan!' : 'Simpan Perubahan'}
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
    const { sections, updateSectionsBatch, updateSection, orbit, updateOrbitCanvas, slug, isPublished, setIsPublished, showModal } = useStore();
    const queryClient = useQueryClient();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'invitation' | 'orbit'>('invitation');
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [localSections, setLocalSections] = useState(sections);
    const isInternalUpdate = useRef(false);

    useEffect(() => {
        if (!isInternalUpdate.current) {
            const sorted = [...sections].sort((a, b) => a.order - b.order);
            setLocalSections(sorted);
            if (sorted.length > 0 && !expandedSection) setExpandedSection(sorted[0].id);
        }
    }, [sections]);

    const handleSave = async () => {
        if (!invitationId) return;
        setSaveStatus('saving');
        try {
            await invitationsApi.update(invitationId, { sections, orbit_layers: orbit, music: useStore.getState().music });
            setSaveStatus('saved');
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) { setSaveStatus('error'); }
    };

    const toggleExpand = (id: string) => setExpandedSection(expandedSection === id ? null : id);
    const toggleVisibility = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const section = sections.find(s => s.id === id);
        if (section) updateSection(id, { isVisible: !section.isVisible });
    };

    const handleReorder = (reordered: typeof localSections) => {
        isInternalUpdate.current = true;
        setLocalSections(reordered);
        const normalized = reordered.map((s, idx) => ({ ...s, order: idx }));
        updateSectionsBatch(normalized);
        setTimeout(() => { isInternalUpdate.current = false; }, 100);
    };

    const handleTogglePublished = async (val: boolean) => {
        if (isUpdatingStatus || !invitationId) return;
        setIsUpdatingStatus(true);
        try {
            await invitationsApi.update(invitationId, { is_published: val });
            setIsPublished(val);
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
        } finally { setIsUpdatingStatus(false); }
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-32 font-outfit px-2 sm:px-0">
            {/* TAB SWITCHER */}
            <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-xl p-1 sm:p-2 rounded-2xl sm:rounded-[3rem] border border-slate-200 shadow-lg flex items-center gap-1">
                    <button onClick={() => setActiveTab('invitation')} className={`px-4 sm:px-10 py-2.5 sm:py-4 rounded-xl sm:rounded-[2.5rem] text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'invitation' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
                        Konten
                    </button>
                    <button onClick={() => setActiveTab('orbit')} className={`px-4 sm:px-10 py-2.5 sm:py-4 rounded-xl sm:rounded-[2.5rem] text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orbit' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
                        Cinematic
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'invitation' ? (
                    <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 sm:space-y-6">
                        <div id="tutorial-template-area">
                            <Reorder.Group axis="y" values={localSections} onReorder={handleReorder} className="space-y-4 sm:space-y-6">
                                {localSections.map((section) => (
                                    <SectionItem key={section.id} section={section} expandedSection={expandedSection} toggleExpand={toggleExpand} toggleVisibility={toggleVisibility} handleSave={handleSave} saveStatus={saveStatus} />
                                ))}
                            </Reorder.Group>
                        </div>
                    </m.div>
                ) : (
                    <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white rounded-3xl border border-slate-100 text-center">
                        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orbit Editor Active</p>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};
