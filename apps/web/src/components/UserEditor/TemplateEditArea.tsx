import React, { useState, useEffect } from 'react';
import { m, Reorder, AnimatePresence } from 'framer-motion';
import {
    GripVertical,
    Eye,
    EyeOff,
    ChevronDown,
    Plus,
    Sparkles,
    Settings2,
    Check,
    Loader2,
    Save
} from 'lucide-react';
import { UserKonvaPreview } from './UserKonvaPreview';
import { UserElementEditor } from './UserElementEditor';
import { Layout } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useParams } from 'react-router-dom';
import { invitations as invitationsApi } from '@/lib/api';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const TemplateEditArea: React.FC = () => {
    const { id: invitationId } = useParams<{ id: string }>();
    const {
        sections,
        reorderSections,
        updateSection,
        orbit,
        updateOrbitCanvas
    } = useStore();

    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'invitation' | 'orbit'>('invitation');
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');


    // Set first section as expanded on mount
    useEffect(() => {
        if (sections.length > 0 && !expandedSection) {
            setExpandedSection(sections[0].id);
        }
    }, [sections]);

    // Manual save function
    const handleSave = async () => {
        if (!invitationId) return;

        setSaveStatus('saving');
        try {
            console.log('[Save] Saving invitation changes...');
            await invitationsApi.update(invitationId, {
                sections,
                orbit_layers: orbit
            });
            setSaveStatus('saved');
            console.log('[Save] Changes saved successfully');

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

    const handleReorder = (newOrder: typeof sections) => {
        // Find the moved item's new index
        const oldOrder = sections.map(s => s.id);
        const newOrderIds = newOrder.map(s => s.id);

        let startIndex = -1;
        let endIndex = -1;

        for (let i = 0; i < oldOrder.length; i++) {
            if (oldOrder[i] !== newOrderIds[i]) {
                if (startIndex === -1) startIndex = i;
                endIndex = i;
            }
        }

        if (startIndex !== -1 && endIndex !== -1) {
            // Find where the item at startIndex moved to
            const movedId = oldOrder[startIndex];
            const newPosition = newOrderIds.indexOf(movedId);
            reorderSections(startIndex, newPosition);
        }
    };

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-8 pb-32 font-outfit">
            {/* PREMIUM TAB SWITCHER */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/50 backdrop-blur-3xl p-2 rounded-[3rem] border border-slate-200/50 shadow-2xl flex items-center gap-1.5 ring-1 ring-slate-950/5">
                    <button
                        onClick={() => setActiveTab('invitation')}
                        className={`px-10 py-4 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-700 flex items-center gap-2 ${activeTab === 'invitation'
                            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 ring-4 ring-slate-900/10'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
                            }`}
                    >
                        <Layout className="w-4 h-4" />
                        Tampilan Undangan
                    </button>
                    <button
                        onClick={() => setActiveTab('orbit')}
                        className={`px-10 py-4 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-700 flex items-center gap-2 ${activeTab === 'orbit'
                            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 ring-4 ring-slate-900/10'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Stage Cinematic
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30 group transition-transform duration-700 hover:rotate-[15deg]">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {activeTab === 'invitation' ? 'Konten Undangan' : 'Stage Cinematic'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
                            {activeTab === 'invitation' ? 'Edit bagian yang diizinkan admin' : 'Konfigurasi sayap cinematic desktop'}
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <m.button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-8 py-4 font-black text-xs rounded-2xl shadow-2xl transition-all uppercase tracking-widest ${saveStatus === 'saving'
                            ? 'bg-amber-500 text-white cursor-wait'
                            : saveStatus === 'saved'
                                ? 'bg-emerald-500 text-white'
                                : saveStatus === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/30'
                            }`}
                    >
                        {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saveStatus === 'saved' && <Check className="w-4 h-4" />}
                        {(saveStatus === 'idle' || saveStatus === 'error') && <Save className="w-4 h-4" />}
                        {saveStatus === 'saving' ? 'Menyimpan...' :
                            saveStatus === 'saved' ? 'Tersimpan!' :
                                saveStatus === 'error' ? 'Gagal' : 'Simpan Perubahan'}
                    </m.button>

                    <m.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-4 bg-white text-slate-700 font-black text-xs rounded-2xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all uppercase tracking-widest ring-1 ring-slate-100"
                    >
                        <Plus className="w-4 h-4" />
                        Halaman Baru
                    </m.button>
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
                        <Reorder.Group axis="y" values={sortedSections} onReorder={handleReorder} className="space-y-6">
                            {sortedSections.map((section) => (
                                <Reorder.Item
                                    key={section.id}
                                    value={section}
                                    className="relative group h-full"
                                >
                                    <m.div
                                        layout
                                        className={`bg-white/90 backdrop-blur-3xl rounded-[3rem] border transition-all duration-700 overflow-hidden ${expandedSection === section.id
                                            ? 'border-indigo-100 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/10'
                                            : 'border-white/80 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50'
                                            }`}
                                    >
                                        {/* Section Header */}
                                        <div
                                            onClick={() => toggleExpand(section.id)}
                                            className="p-8 flex items-center gap-6 cursor-pointer"
                                        >
                                            <div className="cursor-grab active:cursor-grabbing p-3 hover:bg-slate-50 rounded-2xl text-slate-300 group-hover:text-slate-400 transition-all">
                                                <GripVertical className="w-6 h-6" />
                                            </div>

                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-inner ${section.isVisible ? 'bg-slate-50 text-slate-600' : 'bg-slate-100 text-slate-400 grayscale'
                                                }`}>
                                                <Layout className="w-7 h-7" />
                                            </div>

                                            <div className="flex-1">
                                                <h4 className={`text-xl font-black tracking-tight font-outfit transition-all duration-500 ${section.isVisible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                                    {section.title}
                                                </h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                                    {section.elements?.length || 0} Dynamic Layers
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => toggleVisibility(e, section.id)}
                                                    className={`p-3.5 rounded-2xl border transition-all duration-500 ${section.isVisible
                                                        ? 'bg-white text-slate-400 border-slate-100 hover:text-indigo-500 hover:border-indigo-100'
                                                        : 'bg-slate-50 text-slate-300 border-transparent hover:text-slate-400'
                                                        }`}
                                                >
                                                    {section.isVisible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                                                </button>

                                                <div className={`p-3.5 rounded-2xl border border-transparent transition-all duration-700 ${expandedSection === section.id ? 'rotate-180 bg-indigo-50 text-indigo-500' : 'text-slate-300'}`}>
                                                    <ChevronDown className="w-6 h-6" />
                                                </div>
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
                                                    className="border-t border-slate-50/50 overflow-hidden"
                                                >
                                                    <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gradient-to-b from-white to-slate-50/20">
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

                                                                {/* PHONE FRAME */}
                                                                <div className="relative aspect-[414/896] w-full max-w-[320px] mx-auto bg-white rounded-[4rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.15)] border-[14px] border-slate-900 ring-4 ring-slate-100/50 z-10">
                                                                    <div className="absolute inset-0 rounded-[3rem] overflow-visible">
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
                                                        <div className="space-y-6">
                                                            <div className="px-2 flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Layer Configuration</span>
                                                                <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:gap-2">
                                                                    <Settings2 className="w-4 h-4" />
                                                                    Pro Designer
                                                                </button>
                                                            </div>
                                                            <div className="space-y-5">
                                                                {section.elements && section.elements.filter(el => el.canEditContent).length > 0 ? (
                                                                    section.elements
                                                                        .filter(el => el.canEditContent)
                                                                        .map(element => (
                                                                            <UserElementEditor
                                                                                key={element.id}
                                                                                element={element}
                                                                                sectionId={section.id}
                                                                            />
                                                                        ))
                                                                ) : (
                                                                    <div className="p-16 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner">
                                                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                                            <Settings2 className="w-8 h-8 text-slate-200" />
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                                                                            Locked by Admin System <br />
                                                                            <span className="text-[8px] opacity-70 font-bold">Safe-mode active for this section</span>
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </m.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </m.div>
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
                                            {orbit.left.elements && orbit.left.elements.filter(el => el.canEditContent).length > 0 ? (
                                                orbit.left.elements
                                                    .filter(el => el.canEditContent)
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
                                            {orbit.right.elements && orbit.right.elements.filter(el => el.canEditContent).length > 0 ? (
                                                orbit.right.elements
                                                    .filter(el => el.canEditContent)
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
            </AnimatePresence>
        </div>
    );
};
