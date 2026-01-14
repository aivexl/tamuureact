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
        orbit
    } = useStore();

    const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-outfit">Konten Undangan</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit bagian yang diizinkan admin</p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                    <m.button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-widest ${saveStatus === 'saving'
                            ? 'bg-amber-500 text-white cursor-wait'
                            : saveStatus === 'saved'
                                ? 'bg-emerald-500 text-white'
                                : saveStatus === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-500/30'
                            }`}
                    >
                        {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saveStatus === 'saved' && <Check className="w-4 h-4" />}
                        {(saveStatus === 'idle' || saveStatus === 'error') && <Save className="w-4 h-4" />}
                        {saveStatus === 'saving' ? 'Menyimpan...' :
                            saveStatus === 'saved' ? 'Tersimpan!' :
                                saveStatus === 'error' ? 'Coba Lagi' : 'Simpan'}
                    </m.button>

                    <m.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Halaman
                    </m.button>
                </div>

            </div>

            <Reorder.Group axis="y" values={sortedSections} onReorder={handleReorder} className="space-y-4">
                {sortedSections.map((section) => (
                    <Reorder.Item
                        key={section.id}
                        value={section}
                        className="relative group"
                    >
                        <m.div
                            layout
                            className={`bg-white/80 backdrop-blur-xl rounded-[2rem] border transition-all duration-500 overflow-hidden ${expandedSection === section.id
                                ? 'border-teal-200 shadow-2xl shadow-teal-500/5 ring-1 ring-teal-500/10'
                                : 'border-white/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'
                                }`}
                        >
                            {/* Section Header */}
                            <div
                                onClick={() => toggleExpand(section.id)}
                                className="p-6 flex items-center gap-4 cursor-pointer"
                            >
                                <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-50 rounded-lg text-slate-300 group-hover:text-slate-400 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${section.isVisible ? 'bg-slate-50 text-slate-600' : 'bg-slate-100 text-slate-400 grayscale'
                                    }`}>
                                    <Layout className="w-6 h-6" />
                                </div>

                                <div className="flex-1">
                                    <h4 className={`font-black tracking-tight font-outfit ${section.isVisible ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                        {section.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {section.elements?.length || 0} elements
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => toggleVisibility(e, section.id)}
                                        className={`p-2.5 rounded-xl border transition-all ${section.isVisible
                                            ? 'bg-white text-slate-400 border-slate-100 hover:text-teal-500 hover:border-teal-100'
                                            : 'bg-slate-50 text-slate-300 border-transparent hover:text-slate-400 shadow-inner'
                                            }`}
                                    >
                                        {section.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>

                                    <div className={`p-2.5 rounded-xl border border-transparent transition-transform duration-500 ${expandedSection === section.id ? 'rotate-180 bg-teal-50 text-teal-500' : 'text-slate-300'}`}>
                                        <ChevronDown className="w-5 h-5" />
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
                                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="border-t border-slate-50 overflow-hidden"
                                    >
                                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gradient-to-b from-white to-slate-50/30">
                                            {/* Left: Preview */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</span>
                                                    <button className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-[10px] font-black uppercase tracking-widest">
                                                        <Settings2 className="w-3.5 h-3.5" />
                                                        Advanced Editor
                                                    </button>
                                                </div>
                                                <div className="aspect-[9/16] max-w-[280px] mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-200 border-8 border-slate-900 overflow-hidden ring-4 ring-slate-100">
                                                    <UserKonvaPreview sectionId={section.id} />
                                                </div>
                                            </div>

                                            {/* Right: Content Editors */}
                                            <div className="space-y-4">
                                                <div className="px-1 mb-4">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edit Konten</span>
                                                </div>
                                                <div className="space-y-4">
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
                                                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                                                Konten ini sudah diatur oleh Admin <br />
                                                                <span className="text-[8px] opacity-70">Tidak ada bagian yang diizinkan untuk diubah</span>
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
        </div>
    );
};
