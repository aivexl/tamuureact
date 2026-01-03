import React, { useState } from 'react';
import { m, Reorder, AnimatePresence } from 'framer-motion';
import {
    GripVertical,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Plus,
    Sparkles,
    Settings2
} from 'lucide-react';
import { UserKonvaPreview } from './UserKonvaPreview';
import { UserElementEditor } from './UserElementEditor';
import { Layout } from 'lucide-react';

const MOCK_SECTIONS = [
    {
        id: 'opening', title: 'Pembukaan', type: 'opening', isVisible: true, elements: [
            { id: 'el1', type: 'text', content: 'Walimatul Urs', editableLabel: 'Judul Utama', canEditContent: true },
            { id: 'el2', type: 'text', content: 'Muhyina & Misbah', editableLabel: 'Nama Pasangan', canEditContent: true }
        ]
    },
    {
        id: 'quotes', title: 'Kata Mutiara', type: 'quotes', isVisible: true, elements: [
            { id: 'el3', type: 'text', content: 'Dan di antara tanda-tanda kekuasaan-Nya...', editableLabel: 'Teks Quote', canEditContent: true }
        ]
    },
    { id: 'couple', title: 'Mempelai', type: 'couple', isVisible: true, elements: [] },
    { id: 'event', title: 'Acara', type: 'event', isVisible: true, elements: [] },
];

export const TemplateEditArea: React.FC = () => {
    const [sections, setSections] = useState(MOCK_SECTIONS);
    const [expandedSection, setExpandedSection] = useState<string | null>('opening');

    const toggleExpand = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const toggleVisibility = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSections(sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-outfit">Struktur Undangan</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urutkan dan edit konten halaman</p>
                    </div>
                </div>

                <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Halaman
                </m.button>
            </div>

            <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-4">
                {sections.map((section) => (
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
                                        Type: {section.type}
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
                                                    {section.elements.length > 0 ? (
                                                        section.elements.map(element => (
                                                            <UserElementEditor
                                                                key={element.id}
                                                                element={element}
                                                                onUpdate={(val: any) => console.log('Update', element.id, val)}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tidak ada konten editable</p>
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
